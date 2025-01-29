import { TokenType, UserVerifyStatus } from '~/constants/enum'

export interface RegisterReqBody {
  name: string
  email: string
  password: string
  confirm_password: string
  date_of_birth: Date
}
export interface LoginReqBody {
  email: string
  password: string
}

export interface EmailVerifyReqBody {
  token: string
}
export interface LogoutReqBody {
  refresh_token: string
}
export interface ForgotPasswordReqBody {
  email: string
}

export interface VerifyForgotPasswordReqBody {
  forgot_password_token: string
}

export interface TokenPayload {
  user_id: string
  token_type: TokenType
  verify: UserVerifyStatus
}

export interface resetPasswordReqBody {
  password: string
  confirmPassword: string
  forgotPaswordToken: string
}

export interface UpdateMeReqBody {
  name?: string
  date_of_birth?: Date
  bio?: string
  avatar?: string
  cover_photo?: string
  username?: string
  website?: string
  location?: string
}
export interface GetProfileReqParams {
  username: string
}

export interface FollowReqBody {
  followed_id: string
}
