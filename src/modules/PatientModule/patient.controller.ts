import Router  from "express";
import { AuthServices } from "../authModule/auth.services";
import validation from "../../middleware/validation.middleware";
import {preRegisterSchema,completeRegistrationSchema, addAddressSchema, loginSchema, resendOtpSchema, SearchUserSchema, verifyPhoneSchema, updateUserSchema } from "../authModule/auth.validation";
import { auth } from "../../middleware/auth.middleware";
import { uploadFiles } from "../../utilis/multer/multer";
import { patientRepo } from "../../DB/repos/patientRebo";
import { PatientService } from "./patient.services";

const router=Router()  
const authServices = new AuthServices(new patientRepo(), 'patient');
const patientService = new PatientService()
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
router.patch('/addAddressDetails',auth,validation(addAddressSchema),patientService.addAddressDetails);
router.patch('/updateProfile',auth,validation(updateUserSchema),authServices.updateProfile);
router.delete('/deleteProfile',auth,authServices.deleteProfile);
router.patch('/updateAddress',auth,patientService.updateAddress);
router.delete('/deleteAddress',auth,patientService.removeAddress);

export default router ;