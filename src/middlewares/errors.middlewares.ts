import { HTTP_STATUS } from '~/constants/httpStatus'
import { NextFunction, Request, Response } from 'express'
import { omit } from 'lodash'
export default function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  res.status(err.status || HTTP_STATUS.INTERNAL_SERVER_ERROR).json(omit(err, ['status']))
}
