import { error } from 'console'
import { hash, verify } from 'crypto'
import { checkSchema } from 'express-validator'
import { JsonWebTokenError } from 'jsonwebtoken'
import { capitalize } from 'lodash'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/message'
import { ErrorWithStatus } from '~/models/Error'
import databaseService from '~/services/database.services'

import usersService from '~/services/users.services'
import { hashPassword } from '~/utils/crypto'
import { verifyToken } from '~/utils/jwt'
import { validate } from '~/utils/validation'
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
      password: {
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
    },
    ['body']
  )
)
export const registerValidator = validate(
  checkSchema(
    {
      name: {
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
      },
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
      password: {
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
          errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_AT_LEAST_6_CHARACTERS_LONG
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
      },
      confirm_password: {
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
      },
      date_of_birth: {
        isISO8601: {
          options: {
            strict: true,
            strictSeparator: true
          }
        },
        errorMessage: USERS_MESSAGES.DATE_OF_BIRTH_MUST_BE_A_DATE
      }
    },
    ['body']
  )
)
export const accessTokenValidator = validate(
  checkSchema(
    {
      authorization: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.TOKEN_IS_REQUIRED
        },
        custom: {
          options: async (value: string, { req }) => {
            const accessToken = value.split(' ')[1]
            if (!accessToken) {
              throw new ErrorWithStatus({ message: USERS_MESSAGES.TOKEN_IS_REQUIRED, status: HTTP_STATUS.UNAUTHORIZED })
            }
            try {
              const decoded_authorization = await verifyToken(value)
              req.decoded_authorization = decoded_authorization
            } catch (error) {
              throw new ErrorWithStatus({
                message: capitalize((error as JsonWebTokenError).message),
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
                verifyToken(value),
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

// export const refreshTokenValidator = validate(
//   checkSchema(
//     {
//       refresh_token: {
//         notEmpty: {
//           errorMessage: USERS_MESSAGES.TOKEN_IS_REQUIRED
//         },
//         custom: {
//           options: async (value: string, { req }) => {
//             try {
//               const [decoded_refresh_token, refresh_token] = await Promise.all([
//                 verifyToken(value),
//                 databaseService.refresh_tokens.findOne({ token: value })
//               ])
//               if (!refresh_token) {
//                 throw new ErrorWithStatus({
//                   message: USERS_MESSAGES.REFRESH_TOKEN_NOT_FOUND,
//                   status: HTTP_STATUS.UNAUTHORIZED
//                 })
//               }
//               req.decoded_refresh_token = decoded_refresh_token
//             } catch (error) {
//               if (error instanceof JsonWebTokenError) {
//                 throw new ErrorWithStatus({
//                   message: error.message,
//                   status: HTTP_STATUS.UNAUTHORIZED
//                 })
//               }
//               throw error
//             }
//             return true
//           }
//         }
//       }
//     },
//     ['body']
//   )
// )
