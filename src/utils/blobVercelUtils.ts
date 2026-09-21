import { put } from '@vercel/blob'
import { base64ToBuffer } from './stringUtils'

export async function uploadFile(
  fileData: string,
  fileName: string,
  folder: string,
) {
  const arrayBuffer = base64ToBuffer(fileData)
  const blob = await put(`${folder}/${fileName}`, arrayBuffer, {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
  })
  return blob
}
