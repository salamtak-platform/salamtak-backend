import Router  from "express";
import authRouter from './PatientModule/patient.controller' ;
import healthLogRouter from './HealthLogModule/HealthLog.controller' ;
const router=Router() 

router.use('/auth',authRouter) ;
router.use('/healthLog',healthLogRouter) ;


export default router ;