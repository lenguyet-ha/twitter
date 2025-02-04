import { Router } from 'express'
import { serveImageController } from '~/controllers/medias.controllers'

const staticsRouter = Router()
staticsRouter.get('/image/:name', serveImageController)
export default staticsRouter
