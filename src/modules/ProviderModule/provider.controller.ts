import Router from 'express';
import { AuthServices } from '../authModule/auth.services';
import validation from '../../middleware/validation.middleware';
import { providerRebo } from '../../DB/repos/providerRebo';
import { ProviderService } from './provider.services';
import { completeRegistrationSchema, loginSchema, preRegisterSchema, resendOtpSchema, SearchUserSchema, updateUserSchema, verifyPhoneSchema } from '../authModule/auth.validation';
import { auth } from '../../middleware/auth.middleware';
import { uploadFiles } from '../../utilis/multer/multer';
import { getProviderByIdSchema, removeItemFromProviderProfileSchema, updateProviderProfileSchema } from './provider.validation';



const router = Router();
const authServices = new AuthServices(new providerRebo(), 'doctor');
const providerService = new ProviderService();
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

//malhomsh asm 
router.get('/me',auth,authServices.getMe) ;
router.post('/refreshToken',authServices.refreshToken);
router.patch('/uploadProfrilePic',auth,uploadFiles('uploads/providers/profiles').single('image'),authServices.uploadProfilePic);
router.patch('/updateProfile',auth,validation(updateUserSchema),authServices.updateProfile);
router.delete('/deleteProfile',auth,authServices.deleteProfile);
router.patch('/updateProviderProfile',auth,validation(updateProviderProfileSchema),providerService.updateProviderProfile);
router.get('/getAllProviders',auth,providerService.getAllProviders);
router.post('/getProviderById',auth,validation(getProviderByIdSchema),providerService.getProviderById);
router.delete('/removeItemFromProviderProfile',auth,validation(removeItemFromProviderProfileSchema),providerService.removeItemFromProviderProfile);




export default router;