import { Request } from 'express'
import User from '~/models/schemas/User.schema'
import { TokenPayload } from './models/requests/User.requests'
declare module 'express' {
  interface Request {
    user?: User
    decoded_refresh_token?: TokenPayload
    decoded_authorization?: TokenPayload
    decoded_email_token?: TokenPayload
    decoded_forgot_password_token?: TokenPayload
  }
}
