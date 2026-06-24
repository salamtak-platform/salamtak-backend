import { template } from '../../utilis/email/generateHTML';
import { NextFunction, Request, Response } from "express";
import { loginDto, resendOtpDto, resetForgottenPasswordDto, searchUserDto, verifyPhoneDto } from "./auth.DTO";
import { ApplicationError, InvalidOtpException, InvalidTokenException, NotFoundException } from "../../utilis/errors/types";
import { hash } from "../../utilis/security/hash";
import { successHandler } from "../../utilis/successHandler";
import { createOtp } from "../../utilis/email/createOtp";
import { SendEmail } from '../../utilis/email/sendEmail';
import { compare } from 'bcrypt';
import { generateToken } from '../../utilis/security/token';
import { decodeToken, TokenTypesEnum } from '../../middleware/auth.middleware';
import { sendSms } from '../../utilis/sms/sendSms';
import JsonWebToken from 'jsonwebtoken'
import { HealthLogRepo } from '../../DB/repos/HealthLogRebo';
export class AuthServices {
    private userModel:any ;
    private role: "patient" | 'doctor' ;
     private healthLogModel = new HealthLogRepo
    constructor(repo:any , role: "patient" | 'doctor') {
        this.userModel = repo;
        this.role = role;
    }

    preRegister = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const { identity } = req.body;
            const isEmail = identity.includes('@'); 
            
            const duplicateFilter = isEmail ? { email: identity } : { phone: identity };

            const existingUser = await this.userModel.findOne({
                filter: duplicateFilter
            });
            console.log(existingUser)
            if (existingUser) {
                if (existingUser.isRegistrationComplete) {
                    throw new ApplicationError('This account is already registered. Please log in.', 400);
                }else if(existingUser.isRegistrationComplete==false ){
                    throw new ApplicationError('This account is found but not verified or not completed.', 400);
                }
                await this.userModel.deleteOne({
                    filter: { _id: existingUser._id.toString() }
                });
            }

            const otp = createOtp();
            const hashedOtp = await hash(otp);
            const expiredAt = new Date(Date.now() + 300 * 1000);

            const docPayload: any = {
                isRegistrationComplete: false,
                isEmailVerified: false,
                isPhoneVerified: false,
                verifyingOtpDetails: {
                    otp: hashedOtp,
                    expiredAt
                }
            };

            if (isEmail) {
            docPayload.email = identity;
        } else {
            docPayload.phone = identity;
        }

            await this.userModel.create({ doc: docPayload });


            if (isEmail) {
                const html = template({ otp, name: "user", subject: "Verify Registration" });
               SendEmail({ to: identity, subject: "Verify your registration", html });
               
            } else {
                await sendSms({
                    to: identity,
                    message: `Your account verification code is: ${otp}. It expires in 5 minutes.`
                });
            }

            return successHandler({
                res,
                message: `Verification code successfully sent via ${isEmail ? 'email' : 'SMS'}.`
            });
        } catch (error) {
            next(error);
        }
    };
    verifyPreRegistration = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const { identity, otp } = req.body;
            const isEmail = identity.includes('@');

            const filter = isEmail ? { email: identity } : { phone: identity };
            const user = await this.userModel.findOne({ filter: { ...filter, isRegistrationComplete: false } });

            if (!user) {
                throw new ApplicationError('Verification session expired or not found', 404);
            }

            const otpDetails = user.verifyingOtpDetails;
            if (!otpDetails || !otpDetails.otp || !otpDetails.expiredAt) {
                throw new ApplicationError('No active verification session found', 400);
            }

            if (new Date() > new Date(otpDetails.expiredAt)) {
                throw new ApplicationError('Verification code has expired', 400);
            }

            const isOtpMatch = await compare(otp, otpDetails.otp);
            if (!isOtpMatch) {
                throw new ApplicationError('Invalid verification code.', 400);
            }
            const verificationUpdate = isEmail
                ? { isEmailVerified: true }
                : { isPhoneVerified: true };

            await user.updateOne({
                $set: verificationUpdate,
                $unset: { verifyingOtpDetails: "" }
            });
            const registrationToken = JsonWebToken.sign(
                { userId: user._id, purpose: 'registration_completion' },
                process.env.JWT_SECRET as string,
                { expiresIn: '15m' }
            );

            return successHandler({
                res,
                message: "verified successfully",
                data: { registrationToken }
            });
        } catch (error) {
            next(error);
        }
    };
    completeRegistration = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const { registrationToken, firstName, lastName, phone, gender, email, password, dateOfBirth } = req.body;

            let decoded: any;
            try {
                decoded = JsonWebToken.verify(registrationToken, process.env.JWT_SECRET as string);
            } catch (err) {
                throw new ApplicationError('Registration session expired or invalid', 401);
            }

            if (decoded.purpose !== 'registration_completion') {
                throw new ApplicationError('Unauthorized token payload purpose.', 403);
            }

            const user = await this.userModel.findById({ id: decoded.userId });


            if (!user || user.isRegistrationComplete) {
                throw new ApplicationError('Profile cannot be found or was already completed', 400);
            }

            const hashedPassword = await hash(password);

            const updatePayload: any = {
                firstName,
                lastName,
                dateOfBirth,
                gender,
                password: hashedPassword,
                isRegistrationComplete: true
            };


            if (user.isEmailVerified && phone) {
                updatePayload.phone = phone;
                updatePayload.isPhoneVerified = false;
            }

            if (user.isPhoneVerified && email) {
                updatePayload.email = email;
                updatePayload.isEmailVerified = false;
            }
            await user.updateOne({ $set: updatePayload });

            let accessToken = generateToken({
                payload: {
                    _id: user._id,
                    role: this.role
                },
                signature: process.env.ACCESS_SIGNATURE as string,
                options: {
                    expiresIn: '1 Hour'
                }
            })
            let refreshToken = generateToken({
                payload: {
                    _id: user._id,
                    role: this.role
                },
                signature: process.env.REFRESH_SIGNATURE as string,
                options: {
                    expiresIn: '7 Days'
                }
            })

            return successHandler({
                res,
                message: "Registration completed successfully",
                data: { accessToken, refreshToken }
            });
        } catch (error) {
            next(error);
        }
    };
    resendOTP = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const { content }: resendOtpDto = req.body;

            let user = await this.userModel.findOne({
                filter: {
                    $or: [{ email: content }, { phone: content }]
                }
            });

            if (!user) {
                throw new NotFoundException('Account profile not found');
            }

            if (user.isRegistrationComplete) {
                throw new ApplicationError('This account is already fully registered', 400);
            }
            if (!user.verifyingOtpDetails || !user.verifyingOtpDetails.otp) {
                throw new NotFoundException('No active verification session found');
            }
            let isExpired = new Date(user.verifyingOtpDetails.expiredAt) <= new Date();
            if (!isExpired) {
                throw new ApplicationError('Current validation code is still active', 400);
            }

            const otp = createOtp();

            if (user.email) {
                const html = template({
                    otp,
                    name: "user",
                    subject: `Verify your email`
                });
                SendEmail({
                    to: user.email,
                    subject: `Verify your email`,
                    html
                });
            } else {
                await sendSms({
                    to: user.phone as string,
                    message: `Your account verification code is: ${otp}. It will expire in 5 minutes.`
                });
            }

            const hashedOtp = await hash(otp);
            const newExpiryTime = new Date(Date.now() + 300 * 1000);
            await user.updateOne({
                $set: {
                    verifyingOtpDetails: {
                        otp: hashedOtp,
                        expiredAt: newExpiryTime
                    }
                }
            });

            return successHandler({ res, message: "A new verification code has been sent successfully" });
        } catch (error) {
            next(error);
        }
    };
    emailLogin = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {

        let { email, password }: loginDto = req.body;
        let user = await this.userModel.findByEmail({ email });
        if (!user) {
            throw new ApplicationError('invalid cerdentials', 400);
        }
        if (user.deletedAt) {
            throw new InvalidTokenException()
          }
        if (!user.isRegistrationComplete) {
            throw new ApplicationError('Your registration profile is incomplete', 400);
        }
        let verfyPassword = await compare(password, user.password as string);
        if (!verfyPassword) {
            throw new ApplicationError('invalid cerdentials', 400);
        }
        let accessToken = generateToken({
            payload: {
                _id: user._id,
                role: this.role
            },
            signature: process.env.ACCESS_SIGNATURE as string,
            options: {
                expiresIn: '1 Hour'
            }
        })
        let refreshToken = generateToken({
            payload: {
                _id: user._id,
                role: this.role
            },
            signature: process.env.REFRESH_SIGNATURE as string,
            options: {
                expiresIn: '7 Days'
            }
        })

        return successHandler({ res, data: { accessToken, refreshToken } })
    };
    getMe = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        let user = res.locals.user;
        return successHandler({ res, data: user })
    };
    refreshToken = async (req: Request, res: Response): Promise<Response> => {
        const {
            authorization
        } = req.headers

        const user = await decodeToken({ authorization: authorization as string, tokenTypes: TokenTypesEnum.REFRESH })
        const accessToken = generateToken({
            payload: {
                _id: user._id,
                role: this.role
            },
            signature: process.env.ACCESS_SIGNATURE as string,
            options: {
                expiresIn: '1 Hour'
            }
        })

        return successHandler({
            res, data: {
                accessToken
            }
        })
    };
    forgetPassword = async (req: Request, res: Response) => {
        const { email } = req.body
        const user = await this.userModel.findByEmail({ email })
        if (!user) {
            throw new NotFoundException('email not found')
        }
        if (user.deletedAt) {
            throw new InvalidTokenException()
          }
        if (!user.isRegistrationComplete) {
            throw new ApplicationError('This profile registration is incomplete', 400);
        }

        const otp = createOtp()
        const html = template({
            otp,
            name: `${user.firstName} ${user.lastName}`,
            subject: `Forget password`
        })
        SendEmail({
            to: email,
            subject: `Forget password`,
            html
        })

        await user.updateOne({
            passwordOtp: {
                otp: await hash(otp),
                expiredAt: new Date(Date.now() + 300 * 1000)
            }
        })

        return successHandler({ res, message: "check your email" })
    };
    resetForgottenPassword = async (req: Request, res: Response) => {
        const {
            email,
            otp,
            password
        }: resetForgottenPasswordDto = req.body
        const user = await this.userModel.findByEmail({ email })
        if (!user) {
            throw new NotFoundException('email not found')
        }
        if (!user.isRegistrationComplete) {
            throw new ApplicationError('This profile registration is incomplete', 400);
        }
        if (!user.passwordOtp?.otp) {
            throw new ApplicationError('forget password first', 400);
        }
        const isExpired = user.passwordOtp.expiredAt <= new Date(Date.now())
        if (isExpired) {
            throw new InvalidOtpException()
        }

        const isValidOtp = await compare(otp, user.passwordOtp.otp)
        if (!isValidOtp) {
            throw new InvalidOtpException()
        }

        const hashedPassword = await hash(password)
        await user.updateOne({
            password: hashedPassword,
            $unset: {
                passwordOtp: 1
            }
        })
        return successHandler({ res })
    };
    uploadProfilePic = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const userId = res.locals.user._id;

        if (!req.file) {
            throw new ApplicationError('Please upload an image file', 400);
        }

        const filePath = req.file.path.replace(/\\/g, '/');

        const updatedUser = await this.userModel.findByIdAndUpdate(
            userId,
            { profileImage: filePath },
            { returnDocument: 'after' }
        );
        if (!updatedUser) {
            throw new NotFoundException('User not found');
        }

        return successHandler({
            res,
            message: "Profile picture uploaded successfully!",
            data: {
                profileImage: updatedUser.profileImage
            }
        });
    };
    
    searchLogin = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            let { searchMethode, content }: searchUserDto = req.body;
            let userExist;

            if (searchMethode == 'email') {
                userExist = await this.userModel.findByEmail({ email: content });
            } else if (searchMethode == 'phone') {
                userExist = await this.userModel.findByPhone({ phone: content });
            }


            if (!userExist || !userExist.isRegistrationComplete) {
                return successHandler({
                    res,
                    message: "User not found, please register"
                });
            }
            if (userExist.deletedAt) {
                throw new InvalidTokenException()
              }
            if ((searchMethode == 'email' && !userExist.isEmailVerified) || (searchMethode == 'phone' && !userExist.isPhoneVerified)) {
                return successHandler({
                    res,
                    message: `User found but content entered is unverfied`
                });
            }

            let result = `User found`;

            if (searchMethode == 'phone') {
                const otp = createOtp();
                const hashedOtp = await hash(otp);

                await userExist.updateOne({
                    $set: {
                        phoneOtp: {
                            otp: hashedOtp,
                            expiredAt: new Date(Date.now() + 300 * 1000)
                        }
                    }
                });

                sendSms({
                    to: content,
                    message: `Your account verification code is: ${otp}. It will expire in 5 minutes`
                }).catch(err => console.error("SMS failed to dispatch:", err));

                return successHandler({ res, message: "OTP sent successfully to your mobile number" });
            }

            return successHandler({ res, message: result });
        } catch (error) {
            next(error);
        }
    };
    verifyPhoneLogin = async (req: Request, res: Response): Promise<Response> => {
        const { phone, otp }: verifyPhoneDto = req.body;

        let user = await this.userModel.findOne({ filter: { phone } });
        if (!user) throw new NotFoundException('Account not found');
        if (user.deletedAt) {
            throw new InvalidTokenException()
        }
        if (!user.phoneOtp?.otp) throw new ApplicationError('Please request an OTP first', 400);
        if (!user.isRegistrationComplete) {
            throw new ApplicationError('Your profile setup is incomplete', 400);
        }
        const isExpired = user.phoneOtp.expiredAt <= new Date();
        if (isExpired) throw new ApplicationError('OTP expired', 400);

        const isValidOtp = await compare(otp, user.phoneOtp.otp);
        if (!isValidOtp) throw new ApplicationError('Incorrect verification code', 400);

        await user.updateOne({ $unset: { phoneOtp: "" } });

        const accessToken = generateToken({
            payload: { _id: user._id , role: this.role},
            signature: process.env.ACCESS_SIGNATURE as string,
            options: { expiresIn: '1 Hour' }
        });

        const refreshToken = generateToken({
            payload: { _id: user._id , role: this.role},
            signature: process.env.REFRESH_SIGNATURE as string,
            options: { expiresIn: '7 Days' }
        });

        return successHandler({
            res,
            message: "Login successful",
            data: { accessToken, refreshToken }
        });
    
    };
    resendPhoneLoginOTP = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const { phone }: { phone: string } = req.body;

            let user = await this.userModel.findByPhone({ phone });
            if (!user) {
                throw new NotFoundException('Account not found');
            }
            if (user.deletedAt) {
                throw new InvalidTokenException()
            }
            if (!user.isRegistrationComplete) {
                throw new ApplicationError('Your profile setup is incomplete', 400);
            }

            if (!user.phoneOtp || !user.phoneOtp.otp) {
                throw new ApplicationError('No active login verification session found', 400);
            }

            let isExpired = new Date(user.phoneOtp.expiredAt) <= new Date();
            if (!isExpired) {
                throw new ApplicationError('Current verification code is still active', 400);
            }

            const otp = createOtp();
            const hashedOtp = await hash(otp);
            const newExpiryTime = new Date(Date.now() + 300 * 1000);

            await user.updateOne({
                $set: {
                    phoneOtp: {
                        otp: hashedOtp,
                        expiredAt: newExpiryTime
                    }
                }
            });

            await sendSms({
                to: phone,
                message: `Your fresh account verification code is: ${otp}. It will expire in 5 minutes.`
            });

            return successHandler({
                res,
                message: "A new login code has been sent to phone"
            });
        } catch (error) {
            next(error);
        }
    };
    updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        let updates = req.body;
        let user = res.locals.user;

        let updatePayload: Record<string, any> = {};
        let fieldsToUpdate = ['firstName', 'lastName', 'dateOfBirth', 'gender'];

        fieldsToUpdate.forEach(field => {
            if (updates[field] !== undefined) {
                updatePayload[field] = updates[field];
            }
        })
       
        if (Object.keys(updatePayload).length === 0) {
            throw new ApplicationError("No valid update data fields provided.", 400);
        }


        await this.userModel.updateOne(
            {
                filter: { _id: user._id },
                update: { $set: updatePayload }
            }
        );


        return successHandler({ res, message: "Profile updated successfully" });
    };
   deleteProfile = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
    let user = res.locals.user;

    await this.userModel.deleteOne({
        filter: { _id: user._id }
    });
    if (this.role === 'patient') {
        await this.healthLogModel.deleteOne({
            filter: { patientId: user._id }
        });
    }

    return successHandler({ res, message: "Profile permanently deleted successfully" });
};

}
