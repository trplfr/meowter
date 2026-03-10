/**
 * Validate image file by magic bytes (file signature).
 * More reliable than MIME type which can be spoofed
 */

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
const JPEG_MAGIC = Buffer.from([0xff, 0xd8, 0xff])
const GIF87_MAGIC = Buffer.from('GIF87a')
const GIF89_MAGIC = Buffer.from('GIF89a')
const RIFF_MAGIC = Buffer.from('RIFF')
const WEBP_MAGIC = Buffer.from('WEBP')

export const isValidImage = (buffer: Buffer, mimetype: string): boolean => {
  if (buffer.length < 12) {
    return false
  }

  switch (mimetype) {
    case 'image/png':
      return buffer.subarray(0, 8).equals(PNG_MAGIC)

    case 'image/jpeg':
      return buffer.subarray(0, 3).equals(JPEG_MAGIC)

    case 'image/webp':
      return (
        buffer.subarray(0, 4).equals(RIFF_MAGIC) &&
        buffer.subarray(8, 12).equals(WEBP_MAGIC)
      )

    case 'image/gif':
      return (
        buffer.subarray(0, 6).equals(GIF87_MAGIC) ||
        buffer.subarray(0, 6).equals(GIF89_MAGIC)
      )

    default:
      return false
  }
}
