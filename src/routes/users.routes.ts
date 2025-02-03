import { Router } from 'express'
import { wrap } from 'module'
import {
  emailVerifyController,
  followController,
  forgotPasswordController,
  getMeController,
  getProfileController,
  loginController,
  logoutController,
  registerController,
  resendVerifyEmailController,
  resetPasswordController,
  updateMeController,
  unfollowController,
  verifyForgotPasswordController,
  changePasswordController,
  oauthLoginController
} from '~/controllers/users.controllers'
import { filterMiddleware } from '~/middlewares/common.middlewares'

import {
  accessTokenValidator,
  emailTokenValidator,
  followValidater,
  forgotPasswordTokenValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  updateMeValidator,
  unfollowValidator,
  verifiedUserValidator,
  verifyForgotPasswordTokenValidator,
  changePasswordValidator
} from '~/middlewares/users.middlewares'
import { UpdateMeReqBody } from '~/models/requests/User.requests'
import { wrapRequestHandler } from '~/utils/handler'

const usersRouter = Router()
usersRouter.post('/login', loginValidator, wrapRequestHandler(loginController))
usersRouter.post('/register', registerValidator, wrapRequestHandler(registerController))
usersRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapRequestHandler(logoutController))
usersRouter.post('/verify-email', emailTokenValidator, wrapRequestHandler(emailVerifyController))
usersRouter.post('/resend-verify-email', accessTokenValidator, wrapRequestHandler(resendVerifyEmailController))
usersRouter.post('/forgot-password', forgotPasswordTokenValidator, wrapRequestHandler(forgotPasswordController))
usersRouter.post(
  '/verify-forgot-password',
  verifyForgotPasswordTokenValidator,
  wrapRequestHandler(verifyForgotPasswordController)
)
usersRouter.post('/reset-password', resetPasswordValidator, wrapRequestHandler(resetPasswordController))
usersRouter.get('/me', accessTokenValidator, wrapRequestHandler(getMeController))
usersRouter.patch(
  '/update-me',
  accessTokenValidator,
  verifiedUserValidator,
  updateMeValidator,
  filterMiddleware<UpdateMeReqBody>([
    'name',
    'date_of_birth',
    'bio',
    'avatar',
    'cover_photo',
    'username',
    'website',
    'location'
  ]),
  wrapRequestHandler(updateMeController)
)
usersRouter.get('/:username', wrapRequestHandler(getProfileController))
usersRouter.post(
  '/follow',
  accessTokenValidator,
  verifiedUserValidator,
  followValidater,
  wrapRequestHandler(followController)
)
usersRouter.delete(
  '/follow/:user_id',
  accessTokenValidator,
  verifiedUserValidator,
  unfollowValidator,
  wrapRequestHandler(unfollowController)
)
usersRouter.patch(
  '/changePassword',
  accessTokenValidator,
  changePasswordValidator,
  wrapRequestHandler(changePasswordController)
)
usersRouter.get('/oauth/google', wrapRequestHandler(oauthLoginController))
export default usersRouter
