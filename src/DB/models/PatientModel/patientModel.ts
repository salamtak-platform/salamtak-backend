import { IAddress, IPatient } from '../../../modules/PatientModule/Patient.types';
import { model, Schema, models } from "mongoose";

let addressSchema = new Schema<IAddress>({
    name: {
        type: String,
        required: true
    },
    locationLink: String,
    flatNumber: {
        type: String,
        required: true
    },
    floor: {
        type: String,
        required: true
    },
    buildingNumber: {
        type: String,
        required: true
    },
    street: {
        type: String,
        required: true
    },
    landmark: String,
    city: {
        type: String,
        required: true
    },
    government: {
        type: String,
        required: true
    }
},{_id:true})
let patientSchema = new Schema<IPatient>({
    firstName: {
        type: String,
        
    },
    lastName: {
        type: String,
        
    },
    email: {
        type: String,
        unique: true,
        trim:true,
        sparse:true
    },
    gender:{ type: String, enum: ['male', 'female'] },
    password: {
        type: String,
    },
    dateOfBirth: {
        type: Date,
    },
    phone: {
        type: String,
        unique: true,
        trim:true,
        sparse:true
    },
    profileImage: String,
    folderId: String,
    isRegistrationComplete: {
        type: Boolean,
        default: false
    },
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    changedCredintialsAt: Date,
    verifyingOtpDetails: {
        otp: String,
        expiredAt: Date
    },
    passwordOtp: {
        otp: String,
        expiredAt: Date
    },
    phoneOtp: {
        otp: String,
        expiredAt: Date
    },
    newEmailOtp: { otp: String, expiredAt: Date },         
    newPhoneOtp: { otp: String, expiredAt: Date },
    addresses:[addressSchema],
   role: {
    type: String,
    enum: ['patient'], 
    default: 'patient'
}

}, {
    timestamps: true
})

export const patientModel = models.patients || model<IPatient>('patients', patientSchema);