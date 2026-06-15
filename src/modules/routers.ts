import Router  from "express";
import authRouter from './PatientModule/patient.controller'
const router=Router() 

router.use('/auth',authRouter)


export default router ;