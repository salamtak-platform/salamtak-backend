import { template } from '../../utilis/email/generateHTML';
import { NextFunction, Request, Response } from "express";
import { loginDto, resendOtpDto, resetForgottenPasswordDto, searchUserDto, verifyPhoneDto } from "./patient.DTO";
import { ApplicationError, InvalidOtpException, InvalidTokenException, NotFoundException, NotVerfiedException } from "../../utilis/errors/types";
import { patientRepo } from "../../DB/repos/patientRebo";
import { hash } from "../../utilis/security/hash";
import { successHandler } from "../../utilis/successHandler";
import { createOtp } from "../../utilis/email/createOtp";
import { SendEmail } from '../../utilis/email/sendEmail';
import { compare } from 'bcrypt';
import { generateToken } from '../../utilis/security/token';
import { HIPatient } from './Patient.types';
import { decodeToken, TokenTypesEnum } from '../../middleware/auth.middleware';
import { sendSms } from '../../utilis/sms/sendSms';
import JsonWebToken from 'jsonwebtoken'
export class AuthServices {
    private patientModel = new patientRepo

    preRegister = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const { identity } = req.body;
            const isEmail = identity.includes('@'); 
            
            const duplicateFilter = isEmail ? { email: identity } : { phone: identity };

            const existingUser = await this.patientModel.findOne({
                filter: duplicateFilter
            });
            console.log(existingUser)
            if (existingUser) {
                if (existingUser.isRegistrationComplete) {
                    throw new ApplicationError('This account is already registered. Please log in.', 400);
                }else if(existingUser.isRegistrationComplete==false ){
                    throw new ApplicationError('This account is found but not verified or not completed.', 400);
                }
                await this.patientModel.deleteOne({
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

            await this.patientModel.create({ doc: docPayload });


            if (isEmail) {
                const html = template({ otp, name: "Patient", subject: "Verify Registration" });
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
            const patient = await this.patientModel.findOne({ filter: { ...filter, isRegistrationComplete: false } });

            if (!patient) {
                throw new ApplicationError('Verification session expired or not found', 404);
            }

            const otpDetails = patient.verifyingOtpDetails;
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

            await patient.updateOne({
                $set: verificationUpdate,
                $unset: { verifyingOtpDetails: "" }
            });
            const registrationToken = JsonWebToken.sign(
                { patientId: patient._id, purpose: 'registration_completion' },
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

            const patient = await this.patientModel.findById({ id: decoded.patientId });


            if (!patient || patient.isRegistrationComplete) {
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


            if (patient.isEmailVerified && phone) {
                updatePayload.phone = phone;
                updatePayload.isPhoneVerified = false;
            }

            if (patient.isPhoneVerified && email) {
                updatePayload.email = email;
                updatePayload.isEmailVerified = false;
            }
            await patient.updateOne({ $set: updatePayload });

            let accessToken = generateToken({
                payload: {
                    _id: patient._id
                },
                signature: process.env.ACCESS_SIGNATURE as string,
                options: {
                    expiresIn: '1 Hour'
                }
            })
            let refreshToken = generateToken({
                payload: {
                    _id: patient._id
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

            let patient = await this.patientModel.findOne({
                filter: {
                    $or: [{ email: content }, { phone: content }]
                }
            });

            if (!patient) {
                throw new NotFoundException('Account profile not found');
            }

            if (patient.isRegistrationComplete) {
                throw new ApplicationError('This account is already fully registered', 400);
            }
            if (!patient.verifyingOtpDetails || !patient.verifyingOtpDetails.otp) {
                throw new NotFoundException('No active verification session found');
            }
            let isExpired = new Date(patient.verifyingOtpDetails.expiredAt) <= new Date();
            if (!isExpired) {
                throw new ApplicationError('Current validation code is still active', 400);
            }

            const otp = createOtp();

            if (patient.email) {
                const html = template({
                    otp,
                    name: "Patient",
                    subject: `Verify your email`
                });
                SendEmail({
                    to: patient.email,
                    subject: `Verify your email`,
                    html
                });
            } else {
                await sendSms({
                    to: patient.phone as string,
                    message: `Your account verification code is: ${otp}. It will expire in 5 minutes.`
                });
            }

            const hashedOtp = await hash(otp);
            const newExpiryTime = new Date(Date.now() + 300 * 1000);
            await patient.updateOne({
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
        let patient = await this.patientModel.findByEmail({ email });
        if (!patient) {
            throw new ApplicationError('invalid cerdentials', 400);
        }
        if (patient.deletedAt) {
            throw new InvalidTokenException()
          }
        if (!patient.isRegistrationComplete) {
            throw new ApplicationError('Your registration profile is incomplete', 400);
        }
        let verfyPassword = await compare(password, patient.password as string);
        if (!verfyPassword) {
            throw new ApplicationError('invalid cerdentials', 400);
        }
        let accessToken = generateToken({
            payload: {
                _id: patient._id
            },
            signature: process.env.ACCESS_SIGNATURE as string,
            options: {
                expiresIn: '1 Hour'
            }
        })
        let refreshToken = generateToken({
            payload: {
                _id: patient._id
            },
            signature: process.env.REFRESH_SIGNATURE as string,
            options: {
                expiresIn: '7 Days'
            }
        })

        return successHandler({ res, data: { accessToken, refreshToken } })
    };
    getMe = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        let patient: HIPatient = res.locals.patient
        return successHandler({ res, data: patient })
    };
    refreshToken = async (req: Request, res: Response): Promise<Response> => {
        const {
            authorization
        } = req.headers

        const patient = await decodeToken({ authorization: authorization as string, tokenTypes: TokenTypesEnum.REFRESH })
        const accessToken = generateToken({
            payload: {
                _id: patient._id
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
        const patient = await this.patientModel.findByEmail({ email })
        if (!patient) {
            throw new NotFoundException('email not found')
        }
        if (patient.deletedAt) {
            throw new InvalidTokenException()
          }
        if (!patient.isRegistrationComplete) {
            throw new ApplicationError('This profile registration is incomplete', 400);
        }

        const otp = createOtp()
        const html = template({
            otp,
            name: `${patient.firstName} ${patient.lastName}`,
            subject: `Forget password`
        })
        SendEmail({
            to: email,
            subject: `Forget password`,
            html
        })

        await patient.updateOne({
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
        const patient = await this.patientModel.findByEmail({ email })
        if (!patient) {
            throw new NotFoundException('email not found')
        }
        if (!patient.isRegistrationComplete) {
            throw new ApplicationError('This profile registration is incomplete', 400);
        }
        if (!patient.passwordOtp?.otp) {
            throw new ApplicationError('forget password first', 400);
        }
        const isExpired = patient.passwordOtp.expiredAt <= new Date(Date.now())
        if (isExpired) {
            throw new InvalidOtpException()
        }

        const isValidOtp = await compare(otp, patient.passwordOtp.otp)
        if (!isValidOtp) {
            throw new InvalidOtpException()
        }

        const hashedPassword = await hash(password)
        await patient.updateOne({
            password: hashedPassword,
            $unset: {
                passwordOtp: 1
            }
        })
        return successHandler({ res })
    };
    uploadProfilePic = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const patientId = res.locals.patient._id;

        if (!req.file) {
            throw new ApplicationError('Please upload an image file', 400);
        }

        const filePath = req.file.path.replace(/\\/g, '/');

        const updatedPatient = await this.patientModel.findByIdAndUpdate(
            patientId,
            { profileImage: filePath },
            { returnDocument: 'after' }
        );
        if (!updatedPatient) {
            throw new NotFoundException('User not found');
        }

        return successHandler({
            res,
            message: "Profile picture uploaded successfully!",
            data: {
                profileImage: updatedPatient.profileImage
            }
        });
    };
    addAddressDetails = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {

        let patient: HIPatient = res.locals.patient;
        let { addresses } = req.body;

        const addressesToAdd = Array.isArray(addresses) ? addresses : [addresses];

        let patientupdated = await this.patientModel.findByIdAndUpdate(
            patient._id as unknown as string,
            {
                $push: {
                    addresses: { $each: addressesToAdd }
                }
            } as any,
            { returnDocument: 'after' }
        );

        return successHandler({ res, data: patientupdated });
    };
    searchLogin = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            let { searchMethode, content }: searchUserDto = req.body;
            let patientExist;

            if (searchMethode == 'email') {
                patientExist = await this.patientModel.findByEmail({ email: content });
            } else if (searchMethode == 'phone') {
                patientExist = await this.patientModel.findByPhone({ phone: content });
            }


            if (!patientExist || !patientExist.isRegistrationComplete) {
                return successHandler({
                    res,
                    message: "User not found, please register"
                });
            }
            if (patientExist.deletedAt) {
                throw new InvalidTokenException()
              }
            if ((searchMethode == 'email' && !patientExist.isEmailVerified) || (searchMethode == 'phone' && !patientExist.isPhoneVerified)) {
                return successHandler({
                    res,
                    message: `User found but content entered is unverfied`
                });
            }

            let result = `User found`;

            if (searchMethode == 'phone') {
                const otp = createOtp();
                const hashedOtp = await hash(otp);

                await patientExist.updateOne({
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

        let patient = await this.patientModel.findOne({ filter: { phone } });
        if (!patient) throw new NotFoundException('Account not found');
        if (patient.deletedAt) {
            throw new InvalidTokenException()
        }
        if (!patient.phoneOtp?.otp) throw new ApplicationError('Please request an OTP first', 400);
        if (!patient.isRegistrationComplete) {
            throw new ApplicationError('Your profile setup is incomplete', 400);
        }
        const isExpired = patient.phoneOtp.expiredAt <= new Date();
        if (isExpired) throw new ApplicationError('OTP expired', 400);

        const isValidOtp = await compare(otp, patient.phoneOtp.otp);
        if (!isValidOtp) throw new ApplicationError('Incorrect verification code', 400);

        await patient.updateOne({ $unset: { phoneOtp: "" } });

        const accessToken = generateToken({
            payload: { _id: patient._id },
            signature: process.env.ACCESS_SIGNATURE as string,
            options: { expiresIn: '1 Hour' }
        });

        const refreshToken = generateToken({
            payload: { _id: patient._id },
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

            let patient = await this.patientModel.findByPhone({ phone });
            if (!patient) {
                throw new NotFoundException('Account not found');
            }
            if (patient.deletedAt) {
                throw new InvalidTokenException()
            }
            if (!patient.isRegistrationComplete) {
                throw new ApplicationError('Your profile setup is incomplete', 400);
            }

            if (!patient.phoneOtp || !patient.phoneOtp.otp) {
                throw new ApplicationError('No active login verification session found', 400);
            }

            let isExpired = new Date(patient.phoneOtp.expiredAt) <= new Date();
            if (!isExpired) {
                throw new ApplicationError('Current verification code is still active', 400);
            }

            const otp = createOtp();
            const hashedOtp = await hash(otp);
            const newExpiryTime = new Date(Date.now() + 300 * 1000);

            await patient.updateOne({
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
        let patient: HIPatient = res.locals.patient;

        let updatePayload: Record<string, any> = {};
        let fieldsToUpdate = ['firstName', 'lastName', 'dateOfBirth', 'gender'];

        fieldsToUpdate.forEach(field => {
            if (updates[field] !== undefined) {
                updatePayload[field] = updates[field];
            }
        })
        let targetAddressId: string | undefined;
        if (updates.addresses) {
            let { address_Id, ...addressUpdates } = updates.addresses;
            if (!address_Id) {
                throw new ApplicationError('Address ID is required for updating an address', 400);
            }
            targetAddressId = address_Id;
            Object.keys(addressUpdates).forEach(key => {
                if (addressUpdates[key] !== undefined) {
                    updatePayload[`addresses.$.${key}`] = addressUpdates[key];
                }
            })
        }
        if (Object.keys(updatePayload).length === 0) {
            throw new ApplicationError("No valid update data fields provided.", 400);
        }

        let queryFilter: Record<string, any> = { _id: patient._id };
        if (targetAddressId) {
            queryFilter['addresses._id'] = targetAddressId;
        }
        console.log(queryFilter);
        console.log(updatePayload);


        await this.patientModel.updateOne(
            {
                filter: queryFilter,
                update: { $set: updatePayload }
            }
        );


        return successHandler({ res, message: "Profile updated successfully" });
    };
    deleteProfile = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        let patient: HIPatient = res.locals.patient;
        await this.patientModel.updateOne({
            filter: { _id: patient._id },
            update: {
                $set: { deletedAt: new Date() }
            }
        });

        return successHandler({ res, message: "Profile deleted successfully" })
    };

}
