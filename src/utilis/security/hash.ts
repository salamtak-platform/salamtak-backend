import bycrypt from 'bcrypt' ;


export const hash =async(plainText:string):Promise<string> => bycrypt.hash(plainText,10) ;
export const compare =async(plainText:string ,hash:string):Promise<boolean> => bycrypt.compare(plainText,hash) ;