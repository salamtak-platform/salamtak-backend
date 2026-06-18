import Router from "express";
import { HealthLogServices } from "./HealthLog.services";
import { auth } from "../../middleware/auth.middleware";
import { uploadFiles } from "../../utilis/multer/multer";
import validation from "../../middleware/validation.middleware";
import { createHealthLogSchema, deleteArrayItemSchema, masterUpdateHealthLogSchema } from "./HealthLog.validation";

const router = Router();
const healthLogServices = new HealthLogServices();

router.post('/createHealthLog',validation(createHealthLogSchema),auth, healthLogServices.createHealthLog);
router.put('/updateHealthLog',validation(masterUpdateHealthLogSchema), auth, healthLogServices.updateHealthLog);
router.post("/uploadMedicalImages", auth,uploadFiles("uploads/medical-records").array("medicalFiles", 5),  healthLogServices.uploadMedicalImages);
router.delete('/deleteHealthLogField',validation(deleteArrayItemSchema),auth, healthLogServices.deleteArrayItem);
router.get('/getHealthLog', auth, healthLogServices.getHealthLog);



export default router;