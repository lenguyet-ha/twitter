import { TokenType } from '~/constants/enum'

export interface RegisterReqBody {
  name: string
  email: string
  password: string
  confirm_password: string
  date_of_birth: Date
}
export interface LogoutReqBody {
  refresh_token: string
}

export interface TokenPayload {
  user_id: string
  token_type: TokenType
}
