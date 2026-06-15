import { ZodObject } from "zod";
import { NextFunction, Request,Response } from "express";
let validation = (schema:ZodObject)=>{
    return async(req:Request ,res:Response,next:NextFunction)=>{
        let data ={
            ...req.body,
            ...req.params,
            ...req.query

        }
        let result =await  schema.safeParseAsync(data) ;

        if(!result.success){
            return res.status(422).json({
                validationErorr:JSON.parse(result.error as unknown as string)
            })
        }
         next();
    }
}


export default validation;