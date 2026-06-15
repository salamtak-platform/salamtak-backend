import Router  from "express";
import { AuthServices } from "./patient.services";
import validation from "../../middleware/validation.middleware";
import {preRegisterSchema,completeRegistrationSchema, addAddressSchema, loginSchema, resendOtpSchema, SearchUserSchema, verifyPhoneSchema } from "./patient.validation";
import { auth } from "../../middleware/auth.middleware";
import { uploadFiles } from "../../utilis/multer/multer";

const router=Router()  
const authServices = new AuthServices() 
// register yastaaaaaaaaaaaaaaaaaa
router.post('/preRegister', validation(preRegisterSchema), authServices.preRegister);
router.post('/verifyPreRegistration', authServices.verifyPreRegistration);
router.post('/completeRegistration', validation(completeRegistrationSchema), authServices.completeRegistration);
router.patch('/resendOtp', validation(resendOtpSchema), authServices.resendOTP);
// login yastaaaaaaaaaaaaaaaa
router.post('/emailLogin',validation(loginSchema),authServices.emailLogin) ;
router.post('/searchLogin',validation(SearchUserSchema),authServices.searchLogin) ;
router.post('/verifyPhoneLogin',validation(verifyPhoneSchema),authServices.verifyPhoneLogin) ;
router.post('/resendPhoneLoginOTP', authServices.resendPhoneLoginOTP);
//password ya sa7by 
router.patch('/forgetPassword',authServices.forgetPassword);
router.patch('/resetForgottenPassword',authServices.resetForgottenPassword);
// malhomsh esm 
router.get('/me',auth,authServices.getMe) ;
router.post('/refreshToken',authServices.refreshToken);
router.patch('/uploadProfrilePic',auth,uploadFiles('uploads/patient/profiles').single('image'),authServices.uploadProfilePic);
router.patch('/addAddressDetails',auth,validation(addAddressSchema),authServices.addAddressDetails);

export default router ;