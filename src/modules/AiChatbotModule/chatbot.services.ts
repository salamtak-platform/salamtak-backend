import { NextFunction, Request, Response } from "express";
import { providerRebo } from '../../DB/repos/providerRebo';
import { ApplicationError } from "../../utilis/errors/types";
import { successHandler } from "../../utilis/successHandler";
import axios from "axios"; 
import { patientRepo } from "../../DB/repos/patientRebo";

export class AiChatbotService {
    private providerModel: providerRebo;
    private patientModel = new patientRepo();

    constructor() {
        this.providerModel = new providerRebo();
    }

    PatientMessage = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const currentPatient = res.locals.user; 
        const { message , language } = req.body; 

        if (!message) {
            throw new ApplicationError("Message content is required.", 400);
        }

        let requestPayload: Record<string, any> = {
            message: message ,
            language:language,
            patientId: currentPatient._id.toString()
        };

        if (!currentPatient.isInChat) {
            const rawDoctors = await this.providerModel.find({
                filter: { role: "doctor" },
                projection: "firstName lastName specialty onlineClinicDetails physicalClinicDetails"
            } as any);

          
            const doctorsContextList = rawDoctors.map((doc: any) => ({
                name: `Dr. ${doc.firstName} ${doc.lastName}`,
                specialty: doc.specialty || "General Medicine",
                onlineClinicDetails: doc.onlineClinicDetails || null,
                physicalClinicDetails: doc.physicalClinicDetails || null
            }));

            requestPayload.doctorsContext = doctorsContextList;
            requestPayload.isNewChat = true;

            await this.patientModel.findByIdAndUpdate(
                currentPatient._id.toString(),
                 { isInChat: true } 
            );
        } else {
            requestPayload.isNewChat = false;
        }

        let aiFullResponseData = "";
      try {
        const aiServiceUrl = process.env.AI_CHATBOT_URL ; 
        const aiTeamResponse = await axios.post(aiServiceUrl as string , requestPayload);
        aiFullResponseData = aiTeamResponse.data;
    } catch (error: any) {
        if (requestPayload.isNewChat) {
            await this.patientModel.findByIdAndUpdate(currentPatient._id.toString(), { isInChat: false });
        }
        throw new ApplicationError(`AI Chatbot service communication failed: ${error.message}`, 502);
    }

      
        return successHandler({
            res,
            message: "AI response received successfully.",
            data: {
                reply: aiFullResponseData
            }
        });
    };

    
   closeChatSession = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const currentPatient = res.locals.user;
        const patientIdStr = currentPatient._id.toString();
        try {
           const aiCloseUrl = `https://salamtak-ai.onrender.com/sessions/${patientIdStr}/close`;
            await axios.post(aiCloseUrl);
        } catch (error: any) {
            throw new ApplicationError('error sending closing' ,400) ;
        }

        const updatedPatient = await this.patientModel.findByIdAndUpdate(
            currentPatient._id.toString(),
            { isInChat: false },
            { new: true }
        );

        if (!updatedPatient) {
            throw new ApplicationError("Patient profile update failed.", 404);
        }

        return successHandler({
            res,
            message: "Chat session closed successfully.",
            data: null
        });
    };
}