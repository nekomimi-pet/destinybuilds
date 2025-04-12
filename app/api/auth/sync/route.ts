import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('pb_auth');

  if (authCookie) {
    try {
      const authData = JSON.parse(authCookie.value);
      return NextResponse.json(authData);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid auth data' }, { status: 400 });
    }
  }

  return NextResponse.json({});
} 