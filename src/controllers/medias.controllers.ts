import { NextFunction, Request, Response } from 'express'
import path from 'path'
import { UPLOAD_DIR } from '~/constants/dir'
import mediasService from '~/services/medias.services'

export const uploadSingleImageController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const data = await mediasService.handleUploadSingleImage(req)
  res.json({
    result: data
  })
}

export const serveImageController = (req: Request, res: Response, next: NextFunction) => {
  const { name } = req.params
  return res.sendFile(path.resolve(UPLOAD_DIR, name), (err) => {
    if (err) {
      res.status((err as any).status).send('Not found')
    }
  })
}
