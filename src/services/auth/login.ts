import { Request, Response, NextFunction } from "express"
import { validationResult } from "express-validator"
import { ApiError } from "../../utils/apiError"


interface LoginRequestBody {
  email: string,
  password: string
}

export const login = async (
  req: Request<{}, {}, LoginRequestBody>,
  res: Response,
  next: NextFunction
): Promise<void>  => { 

  const errors = validationResult(req)
  if(!errors.isEmpty){
    throw ApiError.badRequest(errors.array()[0].msg)
  }

  const { email, password } = req.body

  

}