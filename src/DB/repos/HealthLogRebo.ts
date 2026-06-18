import { Model } from "mongoose";
import { IHealthLog } from "../../modules/HealthLogModule/HealthLog.types";
import { DBRebo } from "../DBRepo";
import { HealthLogModel } from "../models/HealthLog/HealthLogModel";


export class HealthLogRepo extends DBRebo<IHealthLog>{
    constructor(protected override model:Model<IHealthLog> =HealthLogModel){super(HealthLogModel)}
}