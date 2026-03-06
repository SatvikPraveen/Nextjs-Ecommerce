import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const newsletterSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate email
    const result = newsletterSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }
    
    const { email } = result.data;
    
    // Check if email already exists
    const existing = await prisma.newsletter.findUnique({
      where: { email },
    });
    
    if (existing) {
      if (existing.active) {
        return NextResponse.json(
          { error: 'This email is already subscribed' },
          { status: 400 }
        );
      } else {
        // Reactivate subscription
        await prisma.newsletter.update({
          where: { email },
          data: { active: true },
        });
        
        return NextResponse.json(
          { message: 'Successfully re-subscribed to newsletter!' },
          { status: 200 }
        );
      }
    }
    
    // Create new subscription
    await prisma.newsletter.create({
      data: { email },
    });
    
    return NextResponse.json(
      { message: 'Successfully subscribed to newsletter!' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe. Please try again later.' },
      { status: 500 }
    );
  }
}
