import { Model, ProjectionType, QueryOptions } from "mongoose"
import { IProvider } from "../../modules/ProviderModule/provider.types"
import { DBRebo } from "../DBRepo"
import { providerModel } from "../models/providerModel/providerModel"

export class providerRebo extends DBRebo<IProvider>{
    constructor(protected override model:Model<IProvider> =providerModel){super(providerModel)}
     findByEmail =async (
        {
            email,
            options={},
            projection={}
            
        }:{
            options?: QueryOptions,
            email:string ,
            projection?:ProjectionType<IProvider>

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
            projection?:ProjectionType<IProvider>

        }
    )=>{
        const doc= await this.model.findOne({phone},projection,options)
        return doc
    }
}