import { Request } from 'express'
import fs from 'fs'
import { TEMP_UPLOAD_DIR, UPLOAD_DIR } from '~/constants/dir'
import { UploadedFile } from '~/models/requests/Medias.request'
export const initFolder = () => {
  if (!fs.existsSync(TEMP_UPLOAD_DIR)) {
    fs.mkdirSync(TEMP_UPLOAD_DIR, {
      recursive: true // mục đích là để tạo folder nested
    })
  }
}

export const handleUploadSingleImage = async (req: Request) => {
  const formidable = (await import('formidable')).default
  const form = formidable({
    uploadDir: TEMP_UPLOAD_DIR,
    maxFiles: 1,
    keepExtensions: true,
    maxFileSize: 300 * 1024, // 300KB
    filter: function ({ name, originalFilename, mimetype }) {
      const valid = name === 'image' && Boolean(mimetype?.includes('image/'))
      if (!valid) {
        form.emit('error' as any, new Error('File type is not valid') as any)
      }
      return valid
    }
  })
  return new Promise<UploadedFile>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      // eslint-disable-next-line no-extra-boolean-cast
      if (!Boolean(files.image)) {
        return reject(new Error('File is empty'))
      }
      resolve((files.image as any as UploadedFile[])[0])
      console.log(1)
    })
  })
}
export const getNameFromFullname = (fullname: string) => {
  const namearr = fullname.split('.')

  namearr.pop()

  return namearr.join('')
}
