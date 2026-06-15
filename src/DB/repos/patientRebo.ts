import { Model, ProjectionType, QueryOptions } from "mongoose";
import { IPatient } from "../../modules/PatientModule/Patient.types";
import { DBRebo } from "../DBRepo"
import { patientModel } from "../models/PatientModel/patientModel";


export class patientRepo extends DBRebo<IPatient>{
    constructor(protected override model:Model<IPatient> =patientModel){super(patientModel)}
     findByEmail =async (
        {
            email,
            options={},
            projection={}
            
        }:{
            options?: QueryOptions,
            email:string ,
            projection?:ProjectionType<IPatient>

        }
    )=>{
        const doc= await this.model.findOne({email},projection,options)
        return doc
    }
     findByPhone =async (
        {
            phone,
            options={},
            projection={}
            
        }:{
            options?: QueryOptions,
            phone:string ,
            projection?:ProjectionType<IPatient>

        }
    )=>{
        const doc= await this.model.findOne({phone},projection,options)
        return doc
    }
}