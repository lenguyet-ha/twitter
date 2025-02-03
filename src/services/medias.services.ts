import path from 'path'
import sharp from 'sharp'
import fs from 'fs'
import { UPLOAD_DIR } from '~/constants/dir'
import { getNameFromFullname, handleUploadSingleImage } from '~/utils/file'
import { UploadedFile } from '~/models/requests/Medias.request'
import { Request } from 'express'

class MediasService {
  async handleUploadSingleImage(req: Request) {
    const file: UploadedFile = await handleUploadSingleImage(req)
    console.log('File:', file)
    const newName = getNameFromFullname(file.newFilename)
    const newPath = path.resolve(UPLOAD_DIR, `${newName}.jpg`)
    console.log('newName:', newName)
    console.log('newPath:', newPath)
    await sharp(file.filepath).jpeg().toFile(newPath)
    fs.unlinkSync(file.filepath)
    console.log('file.path:', file.filepath)
    return `http://localhost:3000/uploads/${newName}.jpg`
  }
}
const mediasService = new MediasService()
export default mediasService
