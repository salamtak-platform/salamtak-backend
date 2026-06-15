import { Response } from "express";

export const successHandler = ({ 
  res, 
  status = 200, 
  data = {}, 
  message = "Success" 
}: { 
  res: Response, 
  status?: number, 
  data?: any, 
  message?: string 
}) => {
  return res.status(status).json({ message, data });
};