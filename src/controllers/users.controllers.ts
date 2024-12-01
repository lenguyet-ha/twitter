import { Request, Response } from 'express'
import databaseService from '~/services/database.services'
import User from '~/models/schemas/User.schema'
import usersService from '~/services/users.services'

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
  const { email, password } = req.body
  try {
    const result = await usersService.register({ email, password })
    // await databaseService.users.find({})
    res.json({
      message: 'Register success',
      result
    })
  } catch (error) {
    res.status(400).json({
      message: 'Register failed',
      error
    })
  }
}
