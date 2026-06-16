import { HydratedDocument } from "mongoose"

export interface IPatient {
    firstName?: string,
    lastName?: string,
    password?: string,
    dateOfBirth?: Date,
    
    email?: string,
    phone?: string,
    deletedAt?: Date | null,
    isRegistrationComplete: boolean,
    isEmailVerified: boolean,
    isPhoneVerified: boolean,
    gender?: 'male' | 'female',
    profileImage?: string,
    coverImage?: string[],
    folderId?: string, 
    addresses?: IAddress[],
    role: 'patient';
    createdAt: Date,
    updatedAt: Date,
    changedCredintialsAt?: Date,
    verifyingOtpDetails?: {
        otp: string,
        expiredAt: Date
    },
    passwordOtp?: {
        otp: string,
        expiredAt: Date
    },
    phoneOtp?: {
        otp: string,
        expiredAt: Date
    }
    newEmailOtp?:{
        otp: string,
        expiredAt: Date
    }
    newPhoneOtp?:{
        otp: string,
        expiredAt: Date
    }
}

export interface IAddress {
    name: string,
    locationLink?: string,
    flatNumber: string,
    floor: string,
    buildingNumber: string,
    street: string,
    landmark?: string,
    city: string,
    government: string,
}

export type HIPatient = HydratedDocument<IPatient>