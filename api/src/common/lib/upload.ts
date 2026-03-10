import { join, extname } from 'path'
import { mkdir, writeFile } from 'fs/promises'
import { randomUUID } from 'crypto'

import { ErrorCode } from '@shared/types'

import { AppException } from '../exceptions'

import { isValidImage } from './validate-image'

interface SaveUploadOptions {
  buffer: Buffer
  mimetype: string
  filename: string
  dir: string
  allowedMimes: string[]
  maxSize: number
  urlPrefix: string
}

/**
 * Validates and saves uploaded file to disk.
 * @returns URL path to the saved file
 */
export const saveUpload = async (opts: SaveUploadOptions): Promise<string> => {
  if (!opts.allowedMimes.includes(opts.mimetype)) {
    throw new AppException(
      ErrorCode.FILE_INVALID_TYPE,
      400,
      `Only ${opts.allowedMimes.map(m => m.split('/')[1]).join(', ')} allowed`
    )
  }

  if (opts.buffer.length > opts.maxSize) {
    throw new AppException(
      ErrorCode.FILE_TOO_LARGE,
      400,
      `File too large (max ${Math.round(opts.maxSize / 1024 / 1024)}MB)`
    )
  }

  if (!isValidImage(opts.buffer, opts.mimetype)) {
    throw new AppException(
      ErrorCode.FILE_INVALID_TYPE,
      400,
      'Invalid image file'
    )
  }

  const ext = extname(opts.filename) || '.jpg'
  const savedName = `${randomUUID()}${ext}`

  await mkdir(opts.dir, { recursive: true })
  await writeFile(join(opts.dir, savedName), opts.buffer)

  return `${opts.urlPrefix}${savedName}`
}
