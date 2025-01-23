import express, { NextFunction, Request, Response } from 'express'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.services'
import { defaultErrorHandler } from './middlewares/errors.middlewares'

const app = express()
const port = 3000
app.use(express.json())
app.use('/users', usersRouter)
databaseService.connect()
app.use(defaultErrorHandler as (err: any, req: Request, res: Response, next: NextFunction) => void)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
