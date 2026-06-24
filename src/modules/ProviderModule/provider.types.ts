import { Document, Types } from 'mongoose';

export type GenderType = 'male' | 'female';
export type BookingType = 'first come first served' | 'by appointment';
export type CallType = 'video' | 'voice';

export interface IProviderAddress {
    flatNumber: string;
    floor: string;
    buildingNumber: string;
    street: string;
    landmark?: string;
    city: string;
    government: string;
}


export interface IAcademicExperience {
    degree: string;
    instituteName: string;
    yearOfIssue: number;
}

export interface IProfessionalExperience {
    title: string;
    instituteName: string;
    startDate: Date;
    endDate?: Date;
}

export interface IProfessionalMembership {
    typeOfMedicalOrganization: string;
    geographicalScope: string;
    countryOrAuthority: string;
    associationName: string;
    membershipStatusOrRelationship: string;
    type: string;
    positionOrLeadershipRole?: string;
    relatedSpecialty: string;
    startDate: Date;
    membershipStatus: string;
    expirationDate?: Date;
    verificationDocuments: string[];
}


export interface IWorkingHours {
    workingDays: string[];        // ["Monday", "Wednesday"] 3shan nftkr
    availableHoursPerDay: string[]; // ["14:00-18:00", "19:00-22:00"] 3shan nftkr
}

export interface IClinicGeneralInfo {
    name: string;
    locationLink: string;
    address: IProviderAddress;
    features: string[];
    phoneNumbers: string[];
    images: string[];
    clinicLicense: string; 
}

export interface IPhysicalClinicDetails {
    workingHours: IWorkingHours;
    typeOfBooking: BookingType;
    appointmentFees: number;
    appointmentLengthInMinutes: number;
    averageWaitingTimeInMinutes: number;
    followUpPeriodInDays: number;
    followUpFees: number;
}

export interface IOnlineClinicDetails {
    workingHours: IWorkingHours;
    fees: number;
    callDurationInMinutes: number;
    typeOfAppointment: CallType[]; // Can support both ['video', 'voice']
}
export interface IOtpDetails {
    otp?: string;
    expiredAt?: Date;
}

export interface IProvider extends Document {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    gender: GenderType;
    dateOfBirth: Date;
    profileImage?: string;
    role: 'doctor';
    
    password?: string;
    isRegistrationComplete: boolean;
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
    folderId?: string; 
    changedCredintialsAt?: Date;
    verifyingOtpDetails?: IOtpDetails;
    passwordOtp?: IOtpDetails;
    phoneOtp?: IOtpDetails;
    newEmailOtp?: IOtpDetails;
    newPhoneOtp?: IOtpDetails;

    specialty?: string;
    clinicalTitle?: string;
    subSpecialties?: string[];
    practiceLicenseNumber?: string;
    practiceLicenseImage?: string;
    
    academicExperience?: IAcademicExperience[];
    professionalExperience?: IProfessionalExperience[];
    professionalMemberships?: IProfessionalMembership[];
    partnerInsuranceCompanies?: string[];

    clinicGeneralInfo?: IClinicGeneralInfo;
    physicalClinicDetails?: IPhysicalClinicDetails;
    onlineClinicDetails?: IOnlineClinicDetails;
}