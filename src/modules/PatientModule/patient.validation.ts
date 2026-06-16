import z, { email } from 'zod'

export const preRegisterSchema = z.object({
  identity: z
    .string({ error: "Identity (email or phone) is required" })
    .trim()
    .min(1, "Identity cannot be empty"),
}).refine((data) => {
  const text = data.identity;
  const isEmail = text.includes("@") && z.email().safeParse(text).success;
  const isPhone = /^\+?[0-9]{10,14}$/.test(text);

  return isEmail || isPhone;
}, {
  message: "Please provide a valid email address or phone number to sign up",
  path: ["identity"]
});
export const completeRegistrationSchema = z.object({
  registrationToken: z.string({ error: "Registration token session is missing" }),
  firstName: z.string({ error: "First name is required" }).min(1),
  lastName: z.string({ error: "Last name is required" }).min(1),
  password: z.string({ error: "Password is required" }).min(8, { message: "Password must be at least 8 characters long" }),
  confirmPassword: z.string({ error: "Please confirm your password" }),
  dateOfBirth: z.coerce.date({ error: "Date of birth is required" }),
  phone: z.string().optional(),
  email: z.email().optional() ,
  gender :z.enum(['male', 'female']).optional()
}).superRefine((data, ctx) => {
  if (data.confirmPassword !== data.password) {
    ctx.addIssue({
      code: "custom",
      path: ['confirmPassword'],
      message: "Password must be equal to confirm password"
    });
  }
});

export const resendOtpSchema = z.object({
  content: z.string({ error: "Invalid string format" })
})

export const loginSchema = z.object({
  email: z.email({ error: "Invalid email address format" }),
  password: z.string({ error: "Password is required" })
})

export const resetForgettenPasswordSchema = z.object({
  email: z.email({ error: "Invalid email address format" }),
  otp: z.string({ error: "OTP is required" }).length(6, { error: "OTP must be exactly 6 characters long" }),
  password: z.string({ error: "Password is required" }).min(8, { error: "Password must be at least 8 characters long" })
})

const singleAddressSchema = z.object({
  name: z.string({ error: "Address name is required" }),
  flatNumber: z.string({ error: "Flat number is required" }),
  floor: z.string({ error: "Floor is required" }),
  buildingNumber: z.string({ error: "Building number is required" }),
  street: z.string({ error: "Street is required" }),
  city: z.string({ error: "City is required" }),
  government: z.string({ error: "Governorate is required" }),
  locationLink: z.string().url({ error: "Invalid URL format" }).optional(),
  landmark: z.string().optional(),
});


export const addAddressSchema = z.object({
  addresses: z.array(singleAddressSchema)
});

export const SearchUserSchema = z.object({
  searchMethode: z.enum(['email', 'phone'], { error: "Methode must be email or phone" }),
  content: z.string({ error: "content must be a string" })
})
export const verifyPhoneSchema = z.object({
  otp: z.string({ error: "OTP is required" }).length(6, { error: "OTP must be exactly 6 characters long" }),
  phone: z.string({ error: "Phone must be a valid string" }),
})


export const updatePatientSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  gender: z.enum(["male", "female"]).optional(),
  dateOfBirth: z.coerce.date().optional(),
  
  address: z.object({
    addressId: z.string({ error: "addressId is required to update a specific address" }),
    name: z.string().optional(),
    locationLink: z.string().optional(),
    flatNumber: z.string().optional(),
    floor: z.string().optional(),
    buildingNumber: z.string().optional(),
    street: z.string().optional(),
    landmark: z.string().optional(),
    city: z.string().optional(),
    government: z.string().optional()
  }).optional()
});
