import  express ,{Request ,Response,NextFunction} from "express";
import routers from "./modules/routers";
import { IError } from "./utilis/errors/types";
import { DBConnection } from "./DB/config/connectDB";


const app =express() ;

 const bootStrap=async ()=>{
    const port =process.env.PORT || 3000
    app.use(express.json()) ;
    app.use('/api/v1',routers) ;
    await DBConnection()
    //error handling 
    app.use((err:IError,req:Request ,res:Response,next:NextFunction)=>{
        res.status(err.statusCode||500).json({
            message:err.message ,
            status:err.statusCode||500
        })
    })



    app.listen(port,()=>{console.log(`surver running on port ${port||3000}`);
    })
}

export default bootStrap