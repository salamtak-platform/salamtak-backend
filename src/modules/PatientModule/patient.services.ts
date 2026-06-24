import { NextFunction,Response ,Request} from "express";
import { patientRepo } from "../../DB/repos/patientRebo";
import { successHandler } from "../../utilis/successHandler";
import { ApplicationError } from "../../utilis/errors/types";


export class PatientService {
    private patientModel = new patientRepo 

    addAddressDetails = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {

        let patient = res.locals.user;
        let { addresses } = req.body;

        const addressesToAdd = Array.isArray(addresses) ? addresses : [addresses];

        let patientupdated = await this.patientModel.findByIdAndUpdate(
            patient._id as unknown as string,
            {
                $push: {
                    addresses: { $each: addressesToAdd }
                }
            } as any,
            { returnDocument: 'after' }
        );

        return successHandler({ res, data: patientupdated });
    };
    updateAddress = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const patient = res.locals.user;
        const { addressId, updatedFields } = req.body;

        if (!addressId || !updatedFields) {
            throw new ApplicationError("Missing target addressId or updated fields .", 400);
        }

        const setPayload: Record<string, any> = {};
        
        Object.keys(updatedFields).forEach((key) => {
            if (updatedFields[key] !== undefined) {
                setPayload[`addresses.$[elem].${key}`] = updatedFields[key];
            }
        });

        const updatedPatient = await this.patientModel.findByIdAndUpdate(
            patient._id.toString(),
            { $set: setPayload } as any,
            { 
                new: true,
                arrayFilters: [{ "elem._id": addressId }] 
            }
        );

        if (!updatedPatient) {
            throw new ApplicationError("Address not found or patient account invalid.", 404);
        }

        return successHandler({
            res,
            message: "Address parameters modified successfully.",
            data: updatedPatient.addresses
        });
    };

    removeAddress = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const patient = res.locals.user;
        const { addressId } = req.body;

        if (!addressId) {
            throw new ApplicationError("Address ID must be specified for removal.", 400);
        }

        const updatedPatient = await this.patientModel.findByIdAndUpdate(
            patient._id.toString(),
            { 
                $pull: { addresses: { _id: addressId } } 
            } as any,
            { new: true }
        );

        if (!updatedPatient) {
            throw new ApplicationError("Patient profile not found or address not found.", 404);
        }

        return successHandler({
            res,
            message: "Address completely unlinked and removed successfully.",
            data: updatedPatient.addresses
        });
    };

}