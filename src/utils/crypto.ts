// import { createHash } from 'crypto'

import { createHash } from 'crypto'

// function sha256(content: string) {
//   return createHash('sha256').update(content).digest('hex')
// }
// export function hashPassword(password: string) {
//   return sha256(password + process.env.PASSWORD_SECRET)
// }

const sha256 = (content: string) => {
  return createHash('sha256').update(content).digest('hex')
}
export function hashPassword(password: string) {
  return sha256(password + process.env.PASSWORD_SECRET)
}
