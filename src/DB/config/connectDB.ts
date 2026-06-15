import mongoose from "mongoose";

export const DBConnection =async ()=>{
    return await mongoose.connect(process.env.LOCAL_DATABASE_URI as string).then(()=>{
        console.log('Data Base connected successfully');
        
    }).catch(err=>{
        console.log("Db error=> ",err);
        
    })
}