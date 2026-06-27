import { JwtPayload } from "jsonwebtoken"
import { patientRepo } from "../DB/repos/patientRebo"
import { InvalidTokenException } from "../utilis/errors/types"
import { verifyToken } from "../utilis/security/token"
import { NextFunction,Response,Request } from "express"
import { providerRebo } from "../DB/repos/providerRebo"




export enum TokenTypesEnum {
    ACCESS="access",
    REFRESH="refresh"
}

export const decodeToken = async ({
  authorization,
  tokenTypes = TokenTypesEnum.ACCESS
}: {
  authorization?: string,
  tokenTypes?: TokenTypesEnum
}) => {
  if (!authorization) {
    throw new InvalidTokenException()
  }

  if (!authorization.startsWith(process.env.BEARER as string)) {
    throw new InvalidTokenException()
  }


  const token: string = authorization.split(' ')[1] as string
  const payload: JwtPayload = verifyToken({
    token,
    signature: tokenTypes == TokenTypesEnum.ACCESS ?
      process.env.ACCESS_SIGNATURE as string
      : process.env.REFRESH_SIGNATURE as string
  })

 
  let userModel: any;
  
  if (payload.role === 'patient') {
    userModel = new patientRepo();
  }  else if (payload.role === 'doctor') {
    userModel = new providerRebo();
   } else {
    throw new InvalidTokenException()
  }
  const user = await userModel.findById({ id: payload._id }) ;
  

  if (!user) {
    throw new InvalidTokenException()
  }
  if (user.deletedAt) {
    throw new InvalidTokenException()
  }
  if (!user.isRegistrationComplete) {
    throw new InvalidTokenException()
  }

  return user
}

export const auth = async (req: Request, res: Response, next: NextFunction) => {

  const data = await decodeToken({
    authorization: req.headers.authorization as string,
    tokenTypes: TokenTypesEnum.ACCESS
  })
  res.locals.user = data
  return next()
}