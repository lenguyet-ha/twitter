import { Request, Response, NextFunction } from 'express'
import { checkSchema } from 'express-validator'
import databaseService from '~/services/database.services'
import usersService from '~/services/users.services'
import { validate } from '~/utils/validation'
export const loginValidator = (req: Request, res: Response, next: NextFunction) => {
  console.log(req.body)
  const { email, password } = req.body
  if (!email || !password) {
    res.status(400).json({ message: 'Missing email or password' })
    return
  }
  return next()
}
export const registerValidator = validate(
  checkSchema({
    name: {
      notEmpty: true,
      isLength: {
        options: {
          min: 1,
          max: 100
        }
      },
      trim: true
    },
    email: {
      notEmpty: true,
      isEmail: true,
      normalizeEmail: true,
      trim: true,
      custom: {
        options: async (value: string) => {
          const result = await usersService.checkEmailExist(value)
          if (result) {
            throw new Error('Email already exists')
          }
          return true
        }
      }
    },
    password: {
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
        errorMessage:
          'Password must be at least 6 characters long and contain at least one lowercase letter, one uppercase letter, one number, and one special character.'
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
        errorMessage:
          'Password must be at least 6 characters long and contain at least one lowercase letter, one uppercase letter, one number, and one special character.'
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
      }
    }
  })
)
