import z from "zod";



export const createHealthLogSchema = z.object({
 
    generalInfo: z.object({
      height: z.number({ error: "Height is required" }).positive("Height must be a positive number"),
      weight: z.number({ error: "Weight is required" }).positive("Weight must be a positive number"),
      bloodType: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
      maritalStatus: z.enum(['Single', 'Married', 'Divorced', 'Widowed'], {
        error: "Marital status is required",
      }),
      isSmoking: z.boolean({ error: "Smoking status is required" }),
    }, { error: "General information object is required" })
 
});

export const masterUpdateHealthLogSchema = z.object({

  generalInfo: z.object({
    height: z.number().positive().optional(),
    weight: z.number().positive().optional(),
    bloodType: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
    maritalStatus: z.enum(['Single', 'Married', 'Divorced', 'Widowed']).optional(),
    isSmoking: z.boolean().optional(),
  }).optional(),

  arrayTarget: z.object({
    name: z.enum(['prescriptions', 'scans', 'tests', 'medications', 'allergies']),
    itemId: z.string().min(1, "itemId is required to update a specific record"),
    fieldsToUpdate: z.record(z.string(), z.any(), { 
      error: "fieldsToUpdate is required" 
    })
  }).optional(),

  prescriptions: z.object({ specialization: z.string(), date: z.coerce.date(), prescriptionImages: z.array(z.string()), notes: z.string().optional() }).optional(),
  scans: z.object({ scanName: z.string(), scanDate: z.coerce.date(), scanImages: z.array(z.string()), centerName: z.string(), notes: z.string().optional() }).optional(),
  tests: z.object({ testName: z.string(), testDate: z.coerce.date(), testImages: z.array(z.string()), labName: z.string(), notes: z.string().optional() }).optional(),
  medications: z.object({ drugName: z.string(), dose: z.string(), frequency: z.string(), notes: z.string().optional() }).optional(),
  allergies: z.object({ allergyName: z.string(), notes: z.string().optional() }).optional()
});

export const deleteArrayItemSchema = z.object({
  
        name: z.enum(['prescriptions', 'scans', 'tests', 'medications', 'allergies']),
        itemId: z.string().min(1, "Item ID is required.")
 
});