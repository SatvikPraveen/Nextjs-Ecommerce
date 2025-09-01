// File: app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { uploadFile } from '@/lib/uploader'
import { hasRole } from '@/lib/roles'

const uploadSchema = z.object({
  file: z.instanceof(File),
  type: z.enum(['product-image', 'avatar', 'document']).default('product-image'),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if user has permission to upload
    if (!hasRole(session.user, 'ADMIN') && !hasRole(session.user, 'EDITOR')) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    const type = (formData.get('type') as string) || 'product-image'

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = {
      'product-image': ['image/jpeg', 'image/png', 'image/webp'],
      'avatar': ['image/jpeg', 'image/png', 'image/webp'],
      'document': ['application/pdf', 'text/plain', 'application/msword']
    }

    const allowedMimeTypes = allowedTypes[type as keyof typeof allowedTypes] || allowedTypes['product-image']
    
    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB' },
        { status: 400 }
      )
    }

    // Upload file
    const result = await uploadFile(file, {
      folder: type,
      userId: session.user.id,
    })

    return NextResponse.json({
      success: true,
      url: result.url,
      filename: result.filename,
      size: file.size,
      type: file.type,
    })

  } catch (error) {
    console.error('Upload error:', error)
    
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (!hasRole(session.user, 'ADMIN')) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(req.url)
    const fileUrl = searchParams.get('url')

    if (!fileUrl) {
      return NextResponse.json(
        { error: 'File URL required' },
        { status: 400 }
      )
    }

    // Delete file logic here (implementation depends on storage provider)
    // For example, if using S3:
    // await deleteFile(fileUrl)

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Delete error:', error)
    
    return NextResponse.json(
      { error: 'Delete failed' },
      { status: 500 }
    )
  }
}