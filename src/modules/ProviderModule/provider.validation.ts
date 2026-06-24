import { z } from "zod";

const objectIdSchema = z.string().regex(/^[0-9a-fA-H]{24}$/i, "Invalid database identifier format");

export const updateProviderProfileSchema =
    z.object({

        specialty: z.string().min(2).optional(),
        clinicalTitle: z.string().min(2).optional(),
        subSpecialties: z.array(z.string()).optional(),
        practiceLicenseNumber: z.string().optional(),
        practiceLicenseImage: z.string().url("Invalid license image URL format").optional(),
        partnerInsuranceCompanies: z.array(z.string()).optional(),

        clinicGeneralInfo: z.object({
            name: z.string().min(2).optional(),
            phoneNumber: z.string().optional(),
            about: z.string().optional(),
        }).optional(),

        physicalClinicDetails: z.object({
            government: z.string().optional(),
            city: z.string().optional(),
            streetName: z.string().optional(),
            buildingNumber: z.string().optional(),
            floor: z.number().optional(),
            apartment: z.number().optional(),
            landmark: z.string().optional(),
            locationUrl: z.string().url().optional(),
        }).optional(),

        onlineClinicDetails: z.object({
            consultationFee: z.number().positive().optional(),
            durationInMinutes: z.number().positive().optional(),
        }).optional(),

        targetedFields: z.object({
            name: z.enum(['academicExperience', 'professionalExperience', 'professionalMemberships']).describe("Targeted array name must be a valid array property"),
            itemId: objectIdSchema,
            fieldsToUpdate: z.record(z.string(), z.any())
        }).optional(),

        academicExperience: z.object({
            degree: z.string().min(2),
            instituteName: z.string().min(2),
            yearOfIssue: z.number().int(),
            verificationDocument: z.string().url().optional()
        }).optional(),

        professionalExperience: z.object({
            title: z.string().min(2),
            organization: z.string().min(2),
            startDate: z.string().datetime().or(z.date()),
            endDate: z.string().datetime().or(z.date()).optional(),
            isCurrent: z.boolean().optional()
        }).optional(),

        professionalMemberships: z.object({
            typeOfMedicalOrganization: z.string().min(2),
            geographicalScope: z.string().min(2),
            associationName: z.string().min(2),
            startDate: z.string().datetime().or(z.date()),
            verificationDocuments: z.array(z.string().url()).optional()
        }).optional(),
    })
    ;


export const getProviderByIdSchema = z.object({

    id: objectIdSchema

});

export const removeItemFromProviderProfileSchema = z.object({

    arrayName: z.enum(['academicExperience', 'professionalExperience', 'professionalMemberships']).describe("Targeted array name must be a valid array property"),
    itemId: objectIdSchema

});