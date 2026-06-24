import z from "zod";
import { addAddressSchema, completeRegistrationSchema, loginSchema, resendOtpSchema, resetForgettenPasswordSchema, SearchUserSchema, verifyPhoneSchema } from "./auth.validation";





export type resendOtpDto=z.infer<typeof resendOtpSchema>
export type loginDto=z.infer<typeof loginSchema>
export type resetForgottenPasswordDto=z.infer<typeof resetForgettenPasswordSchema>
export type addressDto=z.infer<typeof addAddressSchema>
export type searchUserDto=z.infer<typeof SearchUserSchema>
export type verifyPhoneDto=z.infer<typeof verifyPhoneSchema>
export type completeRegistrationDto=z.infer<typeof completeRegistrationSchema>