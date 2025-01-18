import { Request, Response } from 'express'
import { NextFunction, ParamsDictionary } from 'express-serve-static-core'
import databaseService from '~/services/database.services'
import User from '~/models/schemas/User.schema'
import usersService from '~/services/users.services'
import { RegisterReqBody } from '~/models/requests/User.requests'
import { ErrorWithStatus } from '~/models/Error'
import { HTTP_STATUS } from '~/constants/httpStatus'

export const loginController = (req: Request, res: Response) => {
  const { email, password } = req.body
  if (email === 'lenguyetha@gmail.com' && password === '123123') {
    res.status(200).json({
      message: 'Login success'
    })
  }
  res.status(400).json({ error: 'Wrong email or password' })
}
export const registerController = async (req: Request, res: Response) => {
  const result = await usersService.register(req.body as RegisterReqBody)
  // await databaseService.users.find({})
  res.json({
    message: 'Register success',
    result
  })
}

// export const registerController = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     // Ném lỗi với thông điệp và mã trạng thái
//     throw new ErrorWithStatus({ message: 'Custom error message', status: HTTP_STATUS.NOT_FOUND })
//   } catch (error) {
//     // Log lỗi ra console
//     console.error('Error caught in registerController:', error)

//     // Kiểm tra và ép kiểu lỗi
//     next(error)
//   }
// }
