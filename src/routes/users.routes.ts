import { Router } from 'express'
import { loginController, registerController } from '~/controllers/users.controllers'
import { loginValidator, registerValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handler'
import { validate } from '~/utils/validation'

const usersRouter = Router()
usersRouter.post('/login', loginValidator, loginController)
usersRouter.post('/register', registerValidator, wrapRequestHandler(registerController))
export default usersRouter
