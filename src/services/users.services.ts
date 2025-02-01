import exp from 'constants'
import { config } from 'dotenv'
import e from 'express'
import _, { update } from 'lodash'
import { ObjectId } from 'mongodb'

import { TokenType, UserVerifyStatus } from '~/constants/enum'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/message'
import { ErrorWithStatus } from '~/models/Error'
import { RegisterReqBody, UpdateMeReqBody } from '~/models/requests/User.requests'
import Follower from '~/models/schemas/Follower.schema'
import User from '~/models/schemas/User.schema'
import databaseService from '~/services/database.services'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'
config()
class UsersService {
  private signAccessToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.AccessToken,
        verify
      },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
      options: {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN
      }
    })
  }

  private signRefreshToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.RefreshToken,
        verify
      },
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
      options: {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN
      }
    })
  }

  private signEmailVerifyToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.EmailVerifyToken,
        verify
      },
      privateKey: process.env.JWT_SECRET_VERIFY_EMAIL_TOKEN as string,
      options: {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN
      }
    })
  }
  private signForgotPasswordToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.ForgotPasswordToken,
        verify
      },
      privateKey: process.env.JWT_SECRET_FORGOT_PASSWORD as string,
      options: {
        expiresIn: process.env.FORGOT_PASSWORD_EXPIRES_IN
      }
    })
  }
  private signAccessAndRefreshToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return Promise.all([this.signAccessToken({ user_id, verify }), this.signRefreshToken({ user_id, verify })])
  }
  async register(payload: RegisterReqBody) {
    const user_id = new ObjectId()
    const email_verify_token = await this.signEmailVerifyToken({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.Unverified
    })
    console.log(email_verify_token)
    await databaseService.users.insertOne(
      new User({
        ...payload,
        username: `user${user_id.toString()}`,
        email_verify_token,
        _id: user_id,
        password: hashPassword(payload.password)
      })
    )
    //const user_id = result.insertedId.toString()
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.Unverified
    })
    await databaseService.refresh_tokens.insertOne({
      user_id: new ObjectId(user_id),
      token: refresh_token
    })
    return {
      access_token,
      refresh_token
    }
  }
  async login({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
      user_id: user_id.toString(),
      verify
    })
    await databaseService.refresh_tokens.insertOne({ user_id: new ObjectId(user_id), token: refresh_token })
    return {
      access_token,
      refresh_token
    }
  }
  async checkEmailExist(email: string) {
    const user = await databaseService.users.findOne({ email })
    return Boolean(user)
  }
  async logout(refresh_token: string) {
    const result = await databaseService.refresh_tokens.deleteOne({ token: refresh_token })
    return {
      message: USERS_MESSAGES.LOGOUT_SUCCESS
    }
  }
  async verifyEmail({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    const [token] = await Promise.all([
      this.signAccessAndRefreshToken({
        user_id: user_id.toString(),
        verify: UserVerifyStatus.Unverified
      }),
      databaseService.users.updateOne(
        { _id: new ObjectId(user_id) },
        { $set: { email_verify_token: ' ', verify: UserVerifyStatus.Verified, updated_at: new Date() } }
      )
    ])
    const [access_token, refresh_token] = token
    return {
      access_token,
      refresh_token
    }
  }
  async resendVerifyEmail({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    const email_verify_token = await this.signEmailVerifyToken({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.Unverified
    })
    console.log(email_verify_token)
    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          email_verify_token,
          updated_at: new Date()
        }
      }
    )
    return {
      message: USERS_MESSAGES.RESEND_VERIFY_EMAIL
    }
  }
  async forgotPassword({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    const forgot_password_token = await this.signForgotPasswordToken({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.Unverified
    })
    console.log(forgot_password_token)
    await databaseService.users.updateOne({ _id: new ObjectId(user_id) }, { $set: { forgot_password_token } })
    return {
      message: USERS_MESSAGES.CHECK_EMAIL_TO_RESET_PASSWORD
    }
  }
  async resetPassword(password: string, user_id: string) {
    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          password: hashPassword(password),
          update_at: new Date()
        }
      }
    )
    return {
      message: USERS_MESSAGES.RESET_PASSWORD_SUCCESS
    }
  }
  async updateMe(user_id: string, payload: UpdateMeReqBody) {
    const _payload = payload.date_of_birth ? { ...payload, dateOfBirth: new Date(payload.date_of_birth) } : payload
    const user = await databaseService.users.findOneAndUpdate(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          ...(_payload as UpdateMeReqBody & { dateOfBirth?: Date }),
          updated_at: new Date()
        }
      },
      {
        returnDocument: 'after',
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        }
      }
    )
    return user
  }
  async getProfile(username: string) {
    const user = await databaseService.users.findOne(
      { username },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        }
      }
    )

    if (user === null) {
      throw new ErrorWithStatus({ message: USERS_MESSAGES.USER_NOT_FOUND, status: HTTP_STATUS.NOT_FOUND })
    }
    return user
  }
  async follow(user_id: string, followed_id: string) {
    const follower = await databaseService.followers.findOne({
      user_id: new ObjectId(user_id),
      followed_id: new ObjectId(followed_id)
    })
    if (follower) {
      return {
        message: USERS_MESSAGES.USER_ALREADY_FOLLOWED
      }
    }
    await databaseService.followers.insertOne(
      new Follower({ user_id: new ObjectId(user_id), followed_id: new ObjectId(followed_id) })
    )
    return { message: USERS_MESSAGES.FOLLOW_SUCCESS }
  }
  // async unfollow(user_id: string, followed_id: string) {
  //   const follower = await databaseService.followers.findOne({
  //     user_id: new ObjectId(user_id),
  //     followed_id: new ObjectId(followed_id)
  //   })
  //   if (follower === null) {
  //     return Promise.reject(
  //       new ErrorWithStatus({ message: USERS_MESSAGES.ALREADY_UNFOLLOWED, status: HTTP_STATUS.NOT_FOUND })
  //     )
  //   }
  //   await databaseService.followers.deleteOne({
  //     user_id: new ObjectId(user_id),
  //     followed_id: new ObjectId(followed_id)
  //   })
  //   return { message: USERS_MESSAGES.UNFOLLOW_SUCCESS }
  // }
  async unfollow(user_id: string, followed_id: string) {
    try {
      const follower = await databaseService.followers.findOne({
        user_id: new ObjectId(user_id),
        followed_id: new ObjectId(followed_id)
      })

      if (!follower) {
        throw new ErrorWithStatus({
          message: USERS_MESSAGES.ALREADY_UNFOLLOWED,
          status: HTTP_STATUS.NOT_FOUND
        })
      }

      await databaseService.followers.deleteOne({
        user_id: new ObjectId(user_id),
        followed_id: new ObjectId(followed_id)
      })

      return { message: USERS_MESSAGES.UNFOLLOW_SUCCESS }
    } catch (error) {
      console.error('Error in unfollow:', error)
      throw error // Đảm bảo lỗi được ném ra để middleware Express xử lý
    }
  }
  async changePassword(user_id: string, new_password: string) {
    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      { $set: { password: hashPassword(new_password), updated_at: new Date() } }
    )
    return { message: USERS_MESSAGES.CHANGE_PASSWORD_SUCCESS }
  }
}

const usersService = new UsersService()
export default usersService
