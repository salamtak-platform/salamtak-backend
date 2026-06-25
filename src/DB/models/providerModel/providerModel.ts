
import { Schema, model, models } from "mongoose";
import { 
    IProvider, 
    IProviderAddress, 
    IAcademicExperience, 
    IProfessionalExperience, 
    IProfessionalMembership, 
    IWorkingHours, 
    IClinicGeneralInfo, 
    IPhysicalClinicDetails, 
    IOnlineClinicDetails 
} from "./../../../modules/ProviderModule/provider.types";



const providerAddressSchema = new Schema<IProviderAddress>({
    flatNumber: { type: String, required: true },
    floor: { type: String, required: true },
    buildingNumber: { type: String, required: true },
    street: { type: String, required: true },
    landmark: String,
    city: { type: String, required: true },
    government: { type: String, required: true }
}, { _id: false });

const academicExperienceSchema = new Schema<IAcademicExperience>({
    degree: { type: String, required: true },
    instituteName: { type: String, required: true },
    yearOfIssue: { type: Number, required: true }
}, { _id: true });

const professionalExperienceSchema = new Schema<IProfessionalExperience>({
    title: { type: String, required: true },
    instituteName: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: Date
}, { _id: true });

const professionalMembershipSchema = new Schema<IProfessionalMembership>({
    typeOfMedicalOrganization: { type: String, required: true },
    geographicalScope: { type: String, required: true },
    countryOrAuthority: { type: String, required: true },
    associationName: { type: String, required: true },
    membershipStatusOrRelationship: { type: String, required: true },
    type: { type: String, required: true },
    positionOrLeadershipRole: String,
    relatedSpecialty: { type: String, required: true },
    startDate: { type: Date, required: true },
    membershipStatus: { type: String, required: true },
    expirationDate: Date,
    verificationDocuments: [String]
}, { _id: true });

const workingHoursSchema = new Schema<IWorkingHours>({
    workingDays: [{ type: String, required: true }],
    availableHoursPerDay: [{ type: String, required: true }]
}, { _id: false });

const clinicGeneralInfoSchema = new Schema<IClinicGeneralInfo>({
    name: { type: String, required: true },
    locationLink: { type: String, required: true },
    address: { type: providerAddressSchema, required: true },
    features: [String],
    phoneNumbers: [{ type: String, required: true }],
    images: [String],
    clinicLicense: { type: String, required: true }
}, { _id: false });

const physicalClinicDetailsSchema = new Schema<IPhysicalClinicDetails>({
    workingHours: { type: workingHoursSchema, required: true },
    typeOfBooking: { type: String, enum: ['first come first served', 'by appointment'], required: true },
    appointmentFees: { type: Number, required: true },
    appointmentLengthInMinutes: { type: Number, required: true },
    averageWaitingTimeInMinutes: { type: Number, required: true },
    followUpPeriodInDays: { type: Number, required: true },
    followUpFees: { type: Number, required: true }
}, { _id: false });

const onlineClinicDetailsSchema = new Schema<IOnlineClinicDetails>({
    workingHours: { type: workingHoursSchema, required: true },
    fees: { type: Number, required: true },
    callDurationInMinutes: { type: Number, required: true },
    typeOfAppointment: [{ type: String, enum: ['video', 'voice'], required: true }]
}, { _id: false });



const providerSchema = new Schema<IProvider>({
    firstName: { type: String },
    lastName: { type: String },
    email: {
        type: String,
        unique: true,
        trim: true,
        sparse: true
    },
    phone: {
        type: String,
        unique: true,
        trim: true,
        sparse: true
    },
    gender: { type: String, enum: ['male', 'female'] },
    dateOfBirth: { type: Date },
    profileImage: String,
    // providerType: { 
    //     type: String, 
    //     enum: ['doctor', 'scan center', 'lab', 'pharmacy']
    // },
    role: {
        type: String,
        enum: ['doctor'],
        default: 'doctor'
    },
    password: { type: String },
    isRegistrationComplete: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    folderId: String,
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

    
   specialty: String,
    clinicalTitle: String,
    subSpecialties: [String],
    practiceLicenseNumber: String,
    practiceLicenseImage: String,
    

    academicExperience: [academicExperienceSchema],
    professionalExperience: [professionalExperienceSchema],
    professionalMemberships: [professionalMembershipSchema],
    partnerInsuranceCompanies: [String],

    
    clinicGeneralInfo: clinicGeneralInfoSchema,
    physicalClinicDetails: physicalClinicDetailsSchema,
    onlineClinicDetails: onlineClinicDetailsSchema,


    
}, {
    timestamps: true
});

export const providerModel = models.providers || model<IProvider>('providers', providerSchema);