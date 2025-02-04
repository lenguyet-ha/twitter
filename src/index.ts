import express, { NextFunction, Request, Response } from 'express'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.services'
import { defaultErrorHandler } from './middlewares/errors.middlewares'
import mediasRouter from './routes/medias.routes'
import { initFolder } from './utils/file'
import { UPLOAD_DIR } from './constants/dir'
import staticsRouter from './routes/statics.routes'

const app = express()
const port = 4000
initFolder()
app.use(express.json())
app.use('/users', usersRouter)
app.use('/medias', mediasRouter)
app.use('/static', staticsRouter)
databaseService.connect()
app.use(defaultErrorHandler as (err: any, req: Request, res: Response, next: NextFunction) => void)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
