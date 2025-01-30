import { NextFunction, Request, Response } from 'express'
import { checkSchema, ParamSchema } from 'express-validator'
import { JsonWebTokenError } from 'jsonwebtoken'
import { capitalize } from 'lodash'
import { ObjectId } from 'mongodb'
import { UserVerifyStatus } from '~/constants/enum'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/message'
import { userNameRegex } from '~/constants/regex'
import { ErrorWithStatus } from '~/models/Error'
import { TokenPayload } from '~/models/requests/User.requests'
import databaseService from '~/services/database.services'

import usersService from '~/services/users.services'
import { hashPassword } from '~/utils/crypto'
import { verifyToken } from '~/utils/jwt'
import { validate } from '~/utils/validation'

const passwordSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USERS_MESSAGES.PASSWORD_IS_REQUIRED
  },
  isString: {
    errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_STRING
  },
  isLength: {
    options: {
      min: 6,
      max: 50
    },
    errorMessage: USERS_MESSAGES.PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50
  },
  isStrongPassword: {
    options: {
      minLength: 6,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
    },
    errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_STRONG
  }
}
const confirmPasswordSchema: ParamSchema = {
  notEmpty: true,
  isString: true,
  isLength: {
    options: {
      min: 6,
      max: 50
    }
  },
  isStrongPassword: {
    options: {
      minLength: 6,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
    },
    errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_STRONG
  },
  custom: {
    options: (value: string, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password and confirm password do not match')
      }
      return true
    }
  }
}
const nameSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USERS_MESSAGES.NAME_IS_REQUIRED
  },
  isLength: {
    options: {
      min: 1,
      max: 100
    },
    errorMessage: USERS_MESSAGES.NAME_LENGTH_MUST_BE_AT_LEAST_1_TO_100
  },
  trim: true
}
const dateOfBirthSchema: ParamSchema = {
  isISO8601: {
    options: {
      strict: true,
      strictSeparator: true
    }
  },
  errorMessage: USERS_MESSAGES.DATE_OF_BIRTH_MUST_BE_A_DATE
}
const imageSchema: ParamSchema = {
  optional: true,
  isString: {
    errorMessage: USERS_MESSAGES.IMAGE_URL_MUST_BE_STRING
  },
  trim: true,
  isLength: {
    options: {
      min: 1,
      max: 400
    },
    errorMessage: USERS_MESSAGES.IMAGE_URL_LENGTH
  }
}
const forgotPasswordTokenSchema: ParamSchema = {
  trim: true,
  custom: {
    options: async (value: string, { req }) => {
      if (!value) {
        throw new ErrorWithStatus({
          message: USERS_MESSAGES.TOKEN_IS_REQUIRED,
          status: HTTP_STATUS.UNAUTHORIZED
        })
      }
      try {
        const decoded_forgot_password_token = await verifyToken({
          token: value,
          secretOrPublicKey: process.env.JWT_SECRET_FORGOT_PASSWORD as string
        })
        req.decoded_forgot_password_token = decoded_forgot_password_token
        const { user_id } = decoded_forgot_password_token
        const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
        if (user === null) {
          throw new ErrorWithStatus({
            message: USERS_MESSAGES.USER_NOT_FOUND,
            status: HTTP_STATUS.NOT_FOUND
          })
        } else if (user.forgot_password_token !== value) {
          throw new ErrorWithStatus({
            message: USERS_MESSAGES.INVALID_FORGOT_PASSWORD_TOKEN,
            status: HTTP_STATUS.UNAUTHORIZED
          })
        }
      } catch (error) {
        if (error instanceof JsonWebTokenError) {
          throw new ErrorWithStatus({
            message: capitalize(error.message),
            status: HTTP_STATUS.UNAUTHORIZED
          })
        }
        throw error
      }
      return true
    }
  }
}
export const loginValidator = validate(
  checkSchema(
    {
      email: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_REQUIRED
        },
        isEmail: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_NOT_VALID
        },
        normalizeEmail: true,
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            const user = await databaseService.users.findOne({
              email: value,
              password: hashPassword(req.body.password)
            })
            if (!user) {
              throw new Error(USERS_MESSAGES.WRONG_EMAIL_OR_PASSWORD)
            }
            req.user = user
            return true
          }
        }
      },
      password: passwordSchema
    },
    ['body']
  )
)
export const registerValidator = validate(
  checkSchema(
    {
      name: nameSchema,
      email: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_REQUIRED
        },
        isEmail: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_NOT_VALID
        },
        normalizeEmail: true,
        trim: true,
        custom: {
          options: async (value: string) => {
            const result = await usersService.checkEmailExist(value)
            if (result) {
              throw new Error(USERS_MESSAGES.EMAIL_ALREADY_EXISTS)
            }
            return true
          }
        }
      },
      password: passwordSchema,
      confirm_password: confirmPasswordSchema,
      date_of_birth: dateOfBirthSchema
    },
    ['body']
  )
)
export const accessTokenValidator = validate(
  checkSchema(
    {
      Authorization: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.TOKEN_IS_REQUIRED
        },
        custom: {
          options: async (value: string, { req }) => {
            const access_token = value.split(' ')[1]
            if (!access_token) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.TOKEN_IS_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            try {
              const decoded_authorization = await verifyToken({
                token: access_token,
                secretOrPublicKey: process.env.JWT_SECRET_ACCESS_TOKEN as string
              })
              req.decoded_authorization = decoded_authorization
            } catch (error) {
              throw new ErrorWithStatus({
                message: (error as JsonWebTokenError).message,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            return true
          }
        }
      }
    },
    ['headers']
  )
)
export const refreshTokenValidator = validate(
  checkSchema(
    {
      refresh_token: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.TOKEN_IS_REQUIRED
        },
        custom: {
          options: async (value: string, { req }) => {
            try {
              const [decoded_refresh_token, refresh_token] = await Promise.all([
                verifyToken({ token: value, secretOrPublicKey: process.env.JWT_SECRET_REFRESH_TOKEN as string }),
                databaseService.refresh_tokens.findOne({ token: value })
              ])
              if (!refresh_token) {
                throw new ErrorWithStatus({
                  message: USERS_MESSAGES.REFRESH_TOKEN_NOT_FOUND,
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }
              req.decoded_refresh_token = decoded_refresh_token
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  message: error.message,
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }
              throw error
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const emailTokenValidator = validate(
  checkSchema(
    {
      emailToken: {
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.TOKEN_IS_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            try {
              const decoded_email_token = await verifyToken({
                token: value,
                secretOrPublicKey: process.env.JWT_SECRET_VERIFY_EMAIL_TOKEN as string
              })
              req.decoded_email_token = decoded_email_token
            } catch (error) {
              throw new ErrorWithStatus({
                message: (error as JsonWebTokenError).message,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)
export const forgotPasswordTokenValidator = validate(
  checkSchema(
    {
      email: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_REQUIRED
        },
        custom: {
          options: async (value: string, { req }) => {
            const user = await databaseService.users.findOne({ email: value })
            if (!user) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.USER_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
              })
            }
            req.user = user
            return true
          }
        }
      }
    },
    ['body']
  )
)
export const verifyForgotPasswordTokenValidator = validate(
  checkSchema(
    {
      forgotPasswordToken: forgotPasswordTokenSchema
    },
    ['body']
  )
)
export const resetPasswordValidator = validate(
  checkSchema(
    {
      password: passwordSchema,
      confirmPassword: confirmPasswordSchema,
      forgotPasswordToken: forgotPasswordTokenSchema
    },
    ['body']
  )
)

export const verifiedUserValidator = (req: Request, res: Response, next: NextFunction) => {
  const { verify } = req.decoded_authorization as TokenPayload
  if (verify !== UserVerifyStatus.Verified) {
    return next(
      new ErrorWithStatus({
        message: USERS_MESSAGES.USER_NOT_VERIFIED,
        status: HTTP_STATUS.FORBIDDEN
      })
    )
  }
  next()
}
export const updateMeValidator = validate(
  checkSchema(
    {
      name: {
        ...nameSchema,
        optional: true,
        trim: true
      },
      date_of_birth: {
        ...dateOfBirthSchema,
        optional: true
      },
      bio: {
        isString: { errorMessage: USERS_MESSAGES.BIO_MUST_BE_STRING },
        optional: true,
        isLength: {
          options: { min: 1, max: 200 },
          errorMessage: USERS_MESSAGES.BIO_LENGTH_MUST_BE_FROM_1_TO_200
        },
        trim: true
      },
      location: {
        isString: { errorMessage: USERS_MESSAGES.LOCATION_MUST_BE_STRING },
        optional: true,
        isLength: {
          options: { min: 1, max: 200 },
          errorMessage: USERS_MESSAGES.LOCATION_LENGTH_MUST_BE_FROM_1_TO_200
        },
        trim: true
      },
      website: {
        isString: { errorMessage: USERS_MESSAGES.WEBSITE_MUST_BE_STRING },
        optional: true,
        isLength: {
          options: { min: 1, max: 200 },
          errorMessage: USERS_MESSAGES.WEBSITE_LENGTH_MUST_BE_FROM_1_TO_200
        },
        trim: true
      },
      username: {
        isString: { errorMessage: USERS_MESSAGES.USERNAME_MUST_BE_STRING },
        optional: true,
        isLength: {
          options: { min: 1, max: 200 },
          errorMessage: USERS_MESSAGES.USERNAME_LENGTH_MUST_BE_FROM_1_TO_50
        },
        trim: true,
        custom: {
          options: async (value: string) => {
            if (!userNameRegex.test(value)) {
              return Promise.reject(
                new ErrorWithStatus({
                  message: USERS_MESSAGES.USERNAME_INVALID,
                  status: HTTP_STATUS.BAD_REQUEST
                })
              )
            }
            const user = await databaseService.users.findOne({ username: value })
            if (user) {
              return Promise.reject(
                new ErrorWithStatus({
                  message: USERS_MESSAGES.USERNAME_EXIST,
                  status: HTTP_STATUS.BAD_REQUEST
                })
              )
            }
          }
        }
      },
      avatar: imageSchema,
      cover_photo: imageSchema
    },
    ['body']
  )
)
export const followValidater = validate(
  checkSchema(
    {
      followed_id: {
        custom: {
          options: async (value: string) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.INVALID_USER_ID,
                status: HTTP_STATUS.NOT_FOUND
              })
            }
            const followed_user = await databaseService.users.findOne({ _id: new ObjectId(value) })
            if (followed_user === null) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.USER_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
              })
            }
          }
        }
      }
    },
    ['body']
  )
)
export const unfollowValidator = validate(
  checkSchema(
    {
      user_id: {
        custom: {
          options: async (value: string) => {
            if (!ObjectId.isValid(value)) {
              return Promise.reject(
                new ErrorWithStatus({
                  message: USERS_MESSAGES.INVALID_USER_ID,
                  status: HTTP_STATUS.NOT_FOUND
                })
              )
            }

            const followed_user = await databaseService.users.findOne({ _id: new ObjectId(value) })

            if (followed_user === null) {
              return Promise.reject(
                new ErrorWithStatus({
                  message: USERS_MESSAGES.USER_NOT_FOUND,
                  status: HTTP_STATUS.NOT_FOUND
                })
              )
            }
          }
        }
      }
    },
    ['params']
  )
)
