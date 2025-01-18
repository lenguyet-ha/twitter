import { HTTP_STATUS } from '~/constants/httpStatus'
import { USERS_MESSAGE } from '~/constants/message'
type ErrorType = Record<
  string,
  {
    msg: string
    [key: string]: any
  }
>
export class ErrorWithStatus {
  message: string
  status: number
  constructor({ message, status }: { message: string; status: number }) {
    this.message = message
    this.status = status
  }
}
export class EntityError extends ErrorWithStatus {
  errors: ErrorType
  constructor({
    message = USERS_MESSAGE.VALIDATION_ERROR,
    status = HTTP_STATUS.UNPROCESSABLE_ENTITY,
    errors
  }: {
    message?: string
    status?: number
    errors: ErrorType
  }) {
    super({ message, status })
    this.errors = errors
  }
}
