import multer from 'multer'
import fs from 'fs'
import { ApplicationError } from '../errors/types';

export const uploadFiles=(customPath: string = 'uploads')=>{
    if (!fs.existsSync(customPath)) {
        fs.mkdirSync(customPath, { recursive: true });
    }
    let storage =multer.diskStorage({
        destination: function(req ,file,cb){
            const patient = req.res?.locals?.user;
            if (!patient) {
                return cb(new ApplicationError('Authentication required to upload files', 401), customPath);
            }
            cb(null,customPath)
        },
        filename:function(req,file ,cb){
            const patientId = req.res?.locals?.user?._id ;
            
            const cleanOriginalName = file.originalname.replace(/\s+/g, '_');
            const finalFileName = `${patientId}-${Date.now()}-${cleanOriginalName}`;
            cb(null,finalFileName)
        }
    })

    return multer({storage})
}