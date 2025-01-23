export const USERS_MESSAGES = {
  VALIDATION_ERROR: 'Validation failed',
  NAME_IS_REQUIRED: 'Name is required',
  EMAIL_IS_REQUIRED: 'Email is required',
  PASSWORD_IS_REQUIRED: 'Password is required',
  CONFIRM_PASSWORD_IS_REQUIRED: 'Confirm password is required',
  PASSWORD_MISMATCH: 'Password and confirm password do not match',
  DATE_OF_BIRTH_IS_REQUIRED: 'Date of birth is required',
  EMAIL_ALREADY_EXISTS: 'Email already exists',
  USER_NOT_FOUND: 'User not found',
  NAME_MUST_BE_STRING: 'Name must be a string',
  NAME_LENGTH_MUST_BE_AT_LEAST_1_TO_100: 'Name length must be from 1 to 100',
  EMAIL_IS_NOT_VALID: 'Email is not valid',
  PASSWORD_MUST_BE_STRING: 'Password must be a string',
  PASSWORD_MUST_BE_AT_LEAST_6_CHARACTERS_LONG: 'Password must be at least 6 characters long',
  CONFIRM_PASSWORD_MUST_BE_THE_SAME_AS_PASSWORD: 'Confirm password must be the same as password',
  DATE_OF_BIRTH_MUST_BE_A_DATE: 'Date of birth must be a date',
  PASSWORD_MUST_BE_STRONG:
    'Password must be at least 6 characters long and contain at least one lowercase letter, one uppercase letter, one number, and one special character.',
  PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50: 'password length must be from 6 to 50',
  WRONG_EMAIL_OR_PASSWORD: 'Wrong email or password',
  LOGIN_SUCCESS: 'Login success',
  REGISTER_SUCCESS: 'Register success'
} as const
