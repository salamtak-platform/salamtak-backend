import { successHandler } from './../../utilis/successHandler';
import { ApplicationError } from './../../utilis/errors/types';
import { NextFunction, Request, Response } from "express";
import { providerRebo } from '../../DB/repos/providerRebo';

export class ProviderService {
    private providerModel: providerRebo;

    constructor() {
        this.providerModel = new providerRebo();
    }

    updateProviderProfile = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const provider = res.locals.user;
        const updates = req.body;

        const setPayload: Record<string, any> = {};
        const pushPayload: Record<string, any> = {};
        let targetFilters: any[] = [];


        const nestedObjects = ['clinicGeneralInfo', 'physicalClinicDetails', 'onlineClinicDetails'];
        nestedObjects.forEach((blockName) => {
            if (updates[blockName]) {
                Object.keys(updates[blockName]).forEach((key) => {
                    if (updates[blockName][key] !== undefined) {
                        setPayload[`${blockName}.${key}`] = updates[blockName][key];
                    }
                });
            }
        });


        const baseFields = ['specialty', 'clinicalTitle', 'subSpecialties', 'practiceLicenseNumber', 'practiceLicenseImage', 'partnerInsuranceCompanies'];
        baseFields.forEach((field) => {
            if (updates[field] !== undefined) {
                setPayload[field] = updates[field];
            }
        });


        if (updates.targetedFields) {
            const { name, itemId, fieldsToUpdate } = updates.targetedFields;


            const currentDoc = await this.providerModel.findOne({ filter: { _id: provider._id } });
            if (!currentDoc) {
                throw new ApplicationError("Provider profile not found.", 404);
            }

            let targetArray = currentDoc[name as keyof typeof currentDoc] as any[];
            let itemExist = targetArray?.some(item => item._id.toString() === itemId);
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


        const providerArrays = ['academicExperience', 'professionalExperience', 'professionalMemberships'];
        providerArrays.forEach((arrayName) => {
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

        const updatedProvider = await this.providerModel.findByIdAndUpdate(
            provider._id.toString(),
            updateCommand,
            queryOptions
        );

        if (!updatedProvider) {
            throw new ApplicationError("Provider profile not found.", 404);
        }

        return successHandler({
            res,
            message: "Provider profile updated successfully.",
            data: updatedProvider
        });
    };
    getAllProviders = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {

        const doctors = await this.providerModel.find({ filter: { role: 'doctor' } });


        const allDoctors = doctors.map((doc: any) => {
            const docObj = doc.toObject();
            delete docObj.password;
            return docObj;
        });

        return successHandler({
            res,
            message: "Active medical doctors registry retrieved successfully.",
            data: allDoctors
        });
    };
    getProviderById = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const { id } = req.body;

        if (!id) {
            throw new ApplicationError("Doctor Id is required.", 400);
        }
        console.log("Fetching provider profile for ID:", id);

        const providerProfile = await this.providerModel.findById({ id });
        console.log("Fetched provider profile:", providerProfile);
        if (!providerProfile || providerProfile.role !== "doctor") {
            throw new ApplicationError("Requested doctor profile could not be found.", 404);
        }

        const profileData = providerProfile.toObject();
        delete profileData.password;

        return successHandler({
            res,
            message: "Doctor profile data fetched successfully.",
            data: profileData
        });
    };
    removeItemFromProviderProfile = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const provider = res.locals.user;
        const { arrayName, itemId } = req.body;

        if (!arrayName || !itemId) {
            throw new ApplicationError("Both target arrayName and itemId are required for removal.", 400);
        }

        const validArrays = ['academicExperience', 'professionalExperience', 'professionalMemberships'];
        if (!validArrays.includes(arrayName)) {
            throw new ApplicationError(`Invalid array target '${arrayName}'. Removal denied.`, 400);
        }

        const targetArray = provider[arrayName as keyof typeof provider] as any[];
        const itemExists = targetArray?.some(item => item._id?.toString() === itemId.toString());

        if (!itemExists) {
            return successHandler({
                res,
                message: `No item found with ID ${itemId} in ${arrayName}. No changes were made.`,
                data: null
            });
        }

        const updatedProvider = await this.providerModel.findByIdAndUpdate(
            provider._id,
            {
                $pull: { [arrayName]: { _id: itemId } }
            } as any,
            { new: true }
        );

        if (!updatedProvider) {
            throw new ApplicationError("Provider profile not found.", 404);
        }

        const profileData = updatedProvider.toObject();
        delete profileData.password;

        return successHandler({
            res,
            message: `Successfully removed item from ${arrayName}.`,
            data: profileData
        });
    };
}