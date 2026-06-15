import { customAlphabet } from "nanoid";


export const createOtp=()=>{
    let otp =customAlphabet('0123456789')(6) ;
    return otp
}