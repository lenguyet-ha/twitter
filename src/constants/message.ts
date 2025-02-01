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
  REGISTER_SUCCESS: 'Register success',
  TOKEN_IS_REQUIRED: 'Token is required',
  REFRESH_TOKEN_NOT_FOUND: 'Refresh token not found',
  LOGOUT_SUCCESS: 'Logout success',
  EMAIL_ALREADY_VERIFIED_BEFORE: 'Email already verified before',
  VERIFY_EMAIL_SUCCESS: 'Verify email success',
  RESEND_VERIFY_EMAIL: 'Resend verify email',
  CHECK_EMAIL_TO_RESET_PASSWORD: 'Check email to reset password',
  INVALID_FORGOT_PASSWORD_TOKEN: 'Invalid forgot passsword token',
  VERIFIED_FORGOT_PASSWORD_TOKEN: 'Verify forgot password token successly',
  RESET_PASSWORD_SUCCESS: 'Reset password successly',
  USER_NOT_VERIFIED: 'User not verified',
  BIO_LENGTH_MUST_BE_FROM_1_TO_200: 'Bio length must be from 1 to 200',
  BIO_MUST_BE_STRING: 'Bio must be a string',
  LOCATION_MUST_BE_STRING: 'Location must be a string',
  WEBSITE_MUST_BE_STRING: 'Website must be a string',
  USERNAME_MUST_BE_STRING: 'Username must be a string',
  LOCATION_LENGTH_MUST_BE_FROM_1_TO_200: 'Location length must be from 1Í to 200',
  WEBSITE_LENGTH_MUST_BE_FROM_1_TO_200: 'Website length must be from 1 to 200',
  USERNAME_LENGTH_MUST_BE_FROM_1_TO_50: 'Username length must be from 1 to 50',
  IMAGE_URL_MUST_BE_STRING: 'Image url must be a string',
  IMAGE_URL_LENGTH: 'Image url length must be from 1 to 400',
  USER_ALREADY_FOLLOWED: 'User already followed',
  FOLLOW_SUCCESS: 'Follow success',
  ALREADY_UNFOLLOWED: 'Already unfollowed',
  UNFOLLOW_SUCCESS: 'Unfollow success',
  INVALID_USER_ID: 'Invalid user id',
  USERNAME_INVALID: 'Username is invalid',
  USERNAME_EXIST: 'Username already exists',
  WRONG_PASSWORD: 'Wrong password',
  CHANGE_PASSWORD_SUCCESS: 'Change password success'
} as const
