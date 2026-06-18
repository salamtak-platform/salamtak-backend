import { model, models, Schema } from "mongoose";
import { IAllergy, IGeneralInfo, IHealthLog, IMedication, IPrescription, IScan, ITest } from "../../../modules/HealthLogModule/HealthLog.types";



let generalInfoSchema = new Schema<IGeneralInfo>({
    height: { type: Number, required: true },
    weight: { type: Number, required: true },
    bloodType: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
    maritalStatus: { type: String, enum: ['Single', 'Married', 'Divorced', 'Widowed'], required: true },
    isSmoking: { type: Boolean, required: true }
}, { _id: false })
let prescriptionSchema = new Schema<IPrescription>({
    specialization: { type: String, required: true },
    date: { type: Date, required: true },
    prescriptionImages: [{ type: String, required: true }],
    notes: { type: String }
}, { _id: true });
let scanSchema = new Schema<IScan>({
    scanName: { type: String, required: true },
    scanDate: { type: Date, required: true },
    scanImages: [{ type: String, required: true }],
    centerName: { type: String, required: true },
    notes: { type: String }
}, { _id: true });

let testSchema = new Schema<ITest>({
    testName: { type: String, required: true },
    testDate: { type: Date, required: true },
    labName: { type: String, required: true },
    notes: { type: String }
}, { _id: true });

let medicationSchema = new Schema<IMedication>({
    drugName: { type: String, required: true },
    dose: { type: String, required: true },
    frequency: { type: String, required: true },
    notes: { type: String }
}, { _id: true });

let allergySchema = new Schema<IAllergy>({
    allergyName: { type: String, required: true },
    notes: { type: String }
}, { _id: true });

let healthLogSchema = new Schema<IHealthLog>({
    patientId: {
        type: Schema.Types.ObjectId,
        ref: "Patient",
        required: true,
        unique: true
    },
    generalInfo: {
        type: generalInfoSchema,
        required: true
    },
    prescriptions: [prescriptionSchema],
    scans: [scanSchema],
    tests: [testSchema],
    medications: [medicationSchema],
    allergies: [allergySchema]
})


export const HealthLogModel = models.HealthLog || model<IHealthLog>("HealthLog", healthLogSchema) ;
