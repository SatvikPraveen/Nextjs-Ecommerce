// lib/uploader.ts
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import sharp from 'sharp'

// S3 Configuration
const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!
const CDN_URL = process.env.CDN_URL || `https://${BUCKET_NAME}.s3.amazonaws.com`

export interface UploadResult {
  url: string
  key: string
  size: number
}

export interface ImageVariant {
  width: number
  height: number
  suffix: string
}

// Image variants for different use cases
export const IMAGE_VARIANTS: Record<string, ImageVariant> = {
  thumbnail: { width: 300, height: 300, suffix: '_thumb' },
  medium: { width: 600, height: 600, suffix: '_medium' },
  large: { width: 1200, height: 1200, suffix: '_large' },
} as const

// Allowed file types
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
] as const

const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
] as const

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB

// Validate file
export const validateFile = (file: File, type: 'image' | 'document' = 'image') => {
  const allowedTypes = type === 'image' ? ALLOWED_IMAGE_TYPES : ALLOWED_DOCUMENT_TYPES
  const maxSize = type === 'image' ? MAX_IMAGE_SIZE : MAX_FILE_SIZE

  if (!allowedTypes.includes(file.type as any)) {
    throw new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`)
  }

  if (file.size > maxSize) {
    throw new Error(`File too large. Maximum size: ${maxSize / (1024 * 1024)}MB`)
  }

  return true
}

// Generate unique filename
export const generateFileName = (originalName: string, folder = '') => {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  const extension = originalName.split('.').pop()
  const baseName = originalName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9]/g, '_')
  
  const fileName = `${baseName}_${timestamp}_${randomString}.${extension}`
  return folder ? `${folder}/${fileName}` : fileName
}

// Upload file to S3
export const uploadToS3 = async (
  file: Buffer,
  key: string,
  contentType: string
): Promise<UploadResult> => {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: contentType,
    ACL: 'public-read',
  })

  await s3Client.send(command)

  return {
    url: `${CDN_URL}/${key}`,
    key,
    size: file.length,
  }
}

// Delete file from S3
export const deleteFromS3 = async (key: string): Promise<void> => {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  })

  await s3Client.send(command)
}

// Process and upload image with variants
export const uploadImageWithVariants = async (
  file: File,
  folder = 'products'
): Promise<{ original: UploadResult; variants: Record<string, UploadResult> }> => {
  validateFile(file, 'image')

  const buffer = Buffer.from(await file.arrayBuffer())
  const fileName = generateFileName(file.name, folder)
  const baseName = fileName.replace(/\.[^/.]+$/, '')
  const extension = fileName.split('.').pop()

  // Upload original
  const original = await uploadToS3(buffer, fileName, file.type)

  // Create and upload variants
  const variants: Record<string, UploadResult> = {}

  for (const [variantName, config] of Object.entries(IMAGE_VARIANTS)) {
    try {
      const resizedBuffer = await sharp(buffer)
        .resize(config.width, config.height, {
          fit: 'cover',
          position: 'center',
        })
        .jpeg({ quality: 80 })
        .toBuffer()

      const variantKey = `${baseName}${config.suffix}.${extension}`
      variants[variantName] = await uploadToS3(resizedBuffer, variantKey, 'image/jpeg')
    } catch (error) {
      console.error(`Failed to create ${variantName} variant:`, error)
    }
  }

  return { original, variants }
}

// Upload single file
export const uploadFile = async (
  file: File,
  folder = 'uploads',
  type: 'image' | 'document' = 'image'
): Promise<UploadResult> => {
  validateFile(file, type)

  const buffer = Buffer.from(await file.arrayBuffer())
  const fileName = generateFileName(file.name, folder)

  return await uploadToS3(buffer, fileName, file.type)
}

// Generate presigned URL for direct upload
export const generatePresignedUrl = async (
  key: string,
  contentType: string,
  expiresIn = 3600 // 1 hour
): Promise<string> => {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
    ACL: 'public-read',
  })

  return await getSignedUrl(s3Client, command, { expiresIn })
}

// Extract key from URL
export const extractKeyFromUrl = (url: string): string => {
  return url.replace(`${CDN_URL}/`, '')
}

// Delete image and its variants
export const deleteImageWithVariants = async (originalUrl: string): Promise<void> => {
  const key = extractKeyFromUrl(originalUrl)
  const baseName = key.replace(/\.[^/.]+$/, '')

  // Delete original
  await deleteFromS3(key)

  // Delete variants
  for (const config of Object.values(IMAGE_VARIANTS)) {
    try {
      const variantKey = `${baseName}${config.suffix}.jpg`
      await deleteFromS3(variantKey)
    } catch (error) {
      console.error(`Failed to delete variant ${config.suffix}:`, error)
    }
  }
}

// Batch delete files
export const batchDelete = async (urls: string[]): Promise<void> => {
  const deletePromises = urls.map(url => {
    const key = extractKeyFromUrl(url)
    return deleteFromS3(key)
  })

  await Promise.allSettled(deletePromises)
}