import { Router } from "express";
import { AppointmentService } from "./booking.services";
import { auth } from "../../middleware/auth.middleware";


const router = Router() 
const bookingServices = new AppointmentService() ;

router.post('/createAppointment',auth,bookingServices.createAppointment) ;
router.patch('/cancelAppointment',auth,bookingServices.cancelAppointment) ;
router.get('/getBookedSlots',auth,bookingServices.getBookedSlots); 



export default router 