import { auth } from '../../middleware/auth.middleware';
import { AiChatbotService } from './chatbot.services';
import { Router } from "express";




const router = Router();
const chatbotServices =new AiChatbotService() ;


router.post('/PatientMessage' , auth , chatbotServices.PatientMessage);
router.post('/closeChatSession' , auth , chatbotServices.closeChatSession);


export default router