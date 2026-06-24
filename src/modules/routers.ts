import Router  from "express";
import patientAuthRouter from './PatientModule/patient.controller' ;
import healthLogRouter from './HealthLogModule/HealthLog.controller' ;
import providerRouter from './ProviderModule/provider.controller' ;
const router=Router() 

router.use('/patient',patientAuthRouter) ;
router.use('/healthLog',healthLogRouter) ;
router.use('/provider',providerRouter) ;


export default router ;