import { NextFunction, Request, Response } from "express";
import { HealthLogRepo } from "../../DB/repos/HealthLogRebo";
import { ApplicationError } from "../../utilis/errors/types";
import { successHandler } from "../../utilis/successHandler";





export class HealthLogServices {
    private healthLogModel = new HealthLogRepo
    createHealthLog = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {

        const patient = res.locals.user;
        const { generalInfo } = req.body;

        const existingLog = await this.healthLogModel.findOne({
            filter: { patientId: patient._id }
        });

        if (existingLog) {
            throw new ApplicationError("Health log already exists for this patient.", 400);
        }

        const newLog = await this.healthLogModel.create({
            doc: {
                patientId: patient._id,
                generalInfo: generalInfo,
                prescriptions: [],
                scans: [],
                tests: [],
                medications: [],
                allergies: []
            }
        });

        return successHandler({
            res,
            message: "Health log initialized and created successfully.",
            data: newLog
        });

    };
    updateHealthLog = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {

        const patient = res.locals.user;
        const updates = req.body;
        const log = await this.healthLogModel.findOne({
            filter: { patientId: patient._id }
        });
        if (!log) {
            throw new ApplicationError("Health log not found. Please initialize your general health profile setup first.", 404);
        }

        const setPayload: Record<string, any> = {};
        const pushPayload: Record<string, any> = {};
        let targetFilters: any[] = [];

        if (updates.generalInfo) {
            Object.keys(updates.generalInfo).forEach((key) => {
                if (updates.generalInfo[key] !== undefined) {
                    setPayload[`generalInfo.${key}`] = updates.generalInfo[key];
                }
            });
        }


        if (updates.targetedFields) {
            const { name, itemId, fieldsToUpdate } = updates.targetedFields;
            let targetArray = log[name as keyof typeof log] as any[];
            let itemExist = targetArray.some(item => item._id.toString() === itemId);
            if (!itemExist) {
                throw new ApplicationError(`Item with ID ${itemId} not found in ${name}.`, 404);
            }

            Object.keys(fieldsToUpdate).forEach((key) => {
                if (fieldsToUpdate[key] !== undefined) {
                    setPayload[`${name}.$[elem].${key}`] = fieldsToUpdate[key];
                }
            });
            targetFilters = [{ "elem._id": itemId }];
        }

        const medicalArrays = ['prescriptions', 'scans', 'tests', 'medications', 'allergies'];
        medicalArrays.forEach((arrayName) => {
            if (updates[arrayName] !== undefined) {
                pushPayload[arrayName] = updates[arrayName];
            }
        });

        const updateCommand: Record<string, any> = {};
        if (Object.keys(setPayload).length > 0) updateCommand['$set'] = setPayload;
        if (Object.keys(pushPayload).length > 0) updateCommand['$push'] = pushPayload;

        if (Object.keys(updateCommand).length === 0) {
            throw new ApplicationError("No valid fields provided for update.", 400);
        }


        const queryOptions: Record<string, any> = { new: true };

        if (targetFilters.length > 0) {
            queryOptions.arrayFilters = targetFilters;
        }
        const updatedLog = await this.healthLogModel.findByIdAndUpdate(
            log._id as unknown as string,
            updateCommand,
            queryOptions
        );

        if (!updatedLog) {
            throw new ApplicationError("Health log profile not found.", 404);
        }

        return successHandler({
            res,
            message: "Health log updated successfully.",
            data: updatedLog
        });


    };
    uploadMedicalImages = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const files = req.files as Express.Multer.File[] | undefined;

        if (!files || files.length === 0) {
            throw new ApplicationError("No files were uploaded.", 400);
        }

        const filePaths = files.map(file => file.path);

        return successHandler({
            res,
            message: "Files processed into string paths successfully.",
            data: { paths: filePaths }
        });

    }
    getHealthLog = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        let patientId = res.locals.user._id;
        const log = await this.healthLogModel.findOne({
            filter: { patientId: patientId }
        });

        if (!log) {
            throw new ApplicationError("No health log found.", 404);
        }

        return successHandler({
            res,
            message: "Health log retrieved successfully.",
            data: log
        });

    }
    deleteArrayItem = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

        const patient = res.locals.user;
        const { name, itemId } = req.body;


        const log = await this.healthLogModel.findOne({
            filter: { patientId: patient._id }
        });

        if (!log) {
            throw new ApplicationError("Health log profile not found.", 404);
        }

        const targetArray = log[name as keyof typeof log] as any[];
        const itemExists = targetArray?.some(item => item._id?.toString() === itemId);

        if (!itemExists) {
            throw new ApplicationError(`The record with ID '${itemId}' was not found in your ${name} history.`, 404);
        }
        const updateCommand = {
            $pull: {
                [name]: { _id: itemId }
            }
        };


        const updatedLog = await this.healthLogModel.findByIdAndUpdate(
            log._id as unknown as string,
            updateCommand as any,
            { new: true }
        );

        return successHandler({
            res,
            message: `Item successfully removed from ${name}.`,
            data: updatedLog
        });



    };
}