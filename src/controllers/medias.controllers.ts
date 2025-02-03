import { NextFunction, Request, Response } from 'express'
import mediasService from '~/services/medias.services'

export const uploadSingleImageController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const data = await mediasService.handleUploadSingleImage(req)
  res.json({
    result: data
  })
}
