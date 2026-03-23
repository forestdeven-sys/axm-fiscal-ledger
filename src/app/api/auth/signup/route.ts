import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body ?? {};

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const existingUser = await db.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Account already exists.' }, { status: 409 });
    }

    const hashedPassword = await hash(password, 12);

    await db.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Unable to create account.' }, { status: 500 });
  }
}
