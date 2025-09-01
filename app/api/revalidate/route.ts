// File: app/api/revalidate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'

const revalidateSchema = z.object({
  path: z.string().optional(),
  tag: z.string().optional(),
  secret: z.string(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { path, tag, secret } = revalidateSchema.parse(body)

    // Verify the secret token
    if (secret !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json(
        { error: 'Invalid secret' },
        { status: 401 }
      )
    }

    if (path) {
      revalidatePath(path)
      return NextResponse.json({ 
        revalidated: true, 
        path,
        now: Date.now() 
      })
    }

    if (tag) {
      revalidateTag(tag)
      return NextResponse.json({ 
        revalidated: true, 
        tag,
        now: Date.now() 
      })
    }

    return NextResponse.json(
      { error: 'Either path or tag must be provided' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Revalidate error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Revalidation failed' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const path = searchParams.get('path')
  const tag = searchParams.get('tag')
  const secret = searchParams.get('secret')

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json(
      { error: 'Invalid secret' },
      { status: 401 }
    )
  }

  if (path) {
    revalidatePath(path)
    return NextResponse.json({ 
      revalidated: true, 
      path,
      now: Date.now() 
    })
  }

  if (tag) {
    revalidateTag(tag)
    return NextResponse.json({ 
      revalidated: true, 
      tag,
      now: Date.now() 
    })
  }

  return NextResponse.json(
    { error: 'Either path or tag must be provided' },
    { status: 400 }
  )
}