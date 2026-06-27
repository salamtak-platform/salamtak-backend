import Router  from "express";
import patientAuthRouter from './PatientModule/patient.controller' ;
import healthLogRouter from './HealthLogModule/HealthLog.controller' ;
import providerRouter from './ProviderModule/provider.controller' ;
import chatbotRouter from './AiChatbotModule/chatbot.controller' ;
import bookingRouter from './BookingModule/booking.controller' ;
const router=Router() 

router.use('/patient',patientAuthRouter) ;
router.use('/healthLog',healthLogRouter) ;
router.use('/provider',providerRouter) ;
router.use('/aiChatbot',chatbotRouter) ;
router.use('/booking',bookingRouter) ;


export default router ;