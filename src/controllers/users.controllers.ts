import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'

import { UserVerifyStatus } from '~/constants/enum'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/message'
import { ErrorWithStatus } from '~/models/Error'

import {
  ChangePasswordReqBody,
  EmailVerifyReqBody,
  FollowReqBody,
  ForgotPasswordReqBody,
  GetProfileReqParams,
  LoginReqBody,
  LogoutReqBody,
  RegisterReqBody,
  resetPasswordReqBody,
  TokenPayload,
  UpdateMeReqBody,
  VerifyForgotPasswordReqBody
} from '~/models/requests/User.requests'
import User from '~/models/schemas/User.schema'
import databaseService from '~/services/database.services'
import usersService from '~/services/users.services'

export const loginController = async (
  req: Request<ParamsDictionary, any, LoginReqBody>,
  res: Response
): Promise<void> => {
  const user = req.user as User
  const user_id = user._id as ObjectId
  const result = await usersService.login({ user_id: user_id.toString(), verify: user.verify })
  res.json({
    message: USERS_MESSAGES.LOGIN_SUCCESS,
    result
  })
}

export const registerController = async (
  req: Request<ParamsDictionary, any, RegisterReqBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const result = await usersService.register(req.body)
  res.json({
    message: USERS_MESSAGES.REGISTER_SUCCESS,
    result
  })
}
export const logoutController = async (
  req: Request<ParamsDictionary, any, LogoutReqBody>,
  res: Response
): Promise<void> => {
  const { refresh_token } = req.body
  const result = await usersService.logout(refresh_token)
  res.json(result)
}

export const emailVerifyController = async (
  req: Request<ParamsDictionary, any, EmailVerifyReqBody>,
  res: Response
): Promise<void> => {
  const { user_id } = req.decoded_email_token as TokenPayload
  const user = (await databaseService.users.findOne({ _id: new ObjectId(user_id) })) as User
  if (!user) {
    res.json({
      message: USERS_MESSAGES.USER_NOT_FOUND,
      status: HTTP_STATUS.NOT_FOUND
    })
  } else if (user.email_verify_token === '') {
    res.json({
      message: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE
    })
  }
  console.log(user)
  const result = await usersService.verifyEmail({ user_id: user_id.toString(), verify: user.verify })
  res.json({
    message: USERS_MESSAGES.VERIFY_EMAIL_SUCCESS,
    result
  })
}

export const resendVerifyEmailController = async (req: Request, res: Response): Promise<void> => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
  if (!user) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.USER_NOT_FOUND,
      status: HTTP_STATUS.NOT_FOUND
    })
  } else if (user.verify === UserVerifyStatus.Verified) {
    res.json({
      message: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE
    })
  }
  const result = await usersService.resendVerifyEmail({ user_id: user_id.toString(), verify: user.verify })
  res.json(result)
}

export const forgotPasswordController = async (
  req: Request<ParamsDictionary, any, ForgotPasswordReqBody>,
  res: Response
): Promise<void> => {
  const user = req.user as User
  const user_id = user._id
  const result = await usersService.forgotPassword({ user_id: user_id.toString(), verify: user.verify })
  res.json({
    result
  })
}

export const verifyForgotPasswordController = async (
  req: Request<ParamsDictionary, any, VerifyForgotPasswordReqBody>,
  res: Response
): Promise<void> => {
  res.json({ message: USERS_MESSAGES.VERIFIED_FORGOT_PASSWORD_TOKEN })
}

export const resetPasswordController = async (
  req: Request<ParamsDictionary, any, resetPasswordReqBody>,
  res: Response
): Promise<void> => {
  const { user_id } = req.decoded_forgot_password_token as TokenPayload
  const { password } = req.body
  const result = await usersService.resetPassword(password, user_id)
  res.json(result)
}

export const getMeController = async (req: Request, res: Response): Promise<void> => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await databaseService.users.findOne(
    { _id: new ObjectId(user_id) },
    {
      projection: {
        password: 0,
        email_verify_token: 0,
        forgot_password_token: 0
      }
    }
  )
  res.json(result)
}

export const updateMeController = async (
  req: Request<ParamsDictionary, any, UpdateMeReqBody>,
  res: Response
): Promise<void> => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { body } = req
  const result = await usersService.updateMe(user_id, body)
  res.json(result)
}
export const getProfileController = async (
  req: Request<GetProfileReqParams>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { username } = req.params
  const user = await usersService.getProfile(username)
  res.json(user)
}
export const followController = async (
  req: Request<ParamsDictionary, any, FollowReqBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { user_id } = req.decoded_authorization as TokenPayload
    const { followed_id } = req.body
    const result = await usersService.follow(user_id, followed_id)
    res.json(result)
  } catch (error) {
    next(error)
  }
}
export const unfollowController = async (
  req: Request<ParamsDictionary, any, FollowReqBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { user_id } = req.decoded_authorization as TokenPayload
    const { user_id: followed_id } = req.params

    const result = await usersService.unfollow(user_id, followed_id)

    res.json(result)
  } catch (error) {
    next(error)
  }
}
export const changePasswordController = async (
  req: Request<ParamsDictionary, any, ChangePasswordReqBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { password } = req.body
  const result = await usersService.changePassword(user_id, password)
  res.json(result)
}
export const oauthLoginController = async (req: Request, res: Response): Promise<void> => {
  const { code } = req.query
  console.log(req.url)

  const result = await usersService.oauth(code as string)

  if (!result) {
    throw new Error('OAuth result is undefined')
  }
  const urlRedirect = `${process.env.CLIENT_REDIRECT_CALLBACK}?access_token=${result.access_token}&refresh_token=${result.refresh_token}&new_user=${result.newUser}&verify=${result.verify}`

  return res.redirect(urlRedirect)
}
