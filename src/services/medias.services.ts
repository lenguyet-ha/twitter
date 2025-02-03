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
    console.log(file.filepath)
    //console.log('File:', file)
    const newName = getNameFromFullname(file.newFilename)
    const newPath = path.resolve(UPLOAD_DIR, `${newName}.jpg`)
    try {
      console.log('Processing file with Sharp...')
      await sharp(file.filepath).jpeg().toFile(newPath)
      console.log('Sharp processing completed')
    } catch (err) {
      console.error('LỖI Sharp:', err)
      throw new Error('Lỗi khi xử lý ảnh với Sharp')
    }

    console.log('File:', file)
    fs.unlinkSync(file.filepath)
    return `http://localhost:3000/uploads/${newName}.jpg`
  }
}
const mediasService = new MediasService()
export default mediasService
