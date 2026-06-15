import jwt, { JwtPayload } from "jsonwebtoken";

export const generateToken = ({
  payload = {},
  signature,
  options = {}
}: {
  payload?: any,
  signature: string,
  options?: jwt.SignOptions
}) => {
  return jwt.sign(payload, signature, options)
}

export const verifyToken = ({ token, signature }: {
  token: string,
  signature: string
}):JwtPayload => {
  const payload = jwt.verify(token, signature) as JwtPayload
  return payload
}