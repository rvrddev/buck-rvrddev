// app/api/auth/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (username !== 'admin' || password !== '1234') {
      return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 });
    }

    const [user] = await db.select().from(users).where(eq(users.email, 'admin')).limit(1);

    if (!user) {
      return NextResponse.json({ error: 'Usuario no existe en la DB' }, { status: 404 });
    }

    const cookieStore = await cookies();
    cookieStore.set('buck_session', JSON.stringify({
      userId: user.id,
      email: user.email,
      name: user.name,
    }), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });

    return NextResponse.json({ ok: true, user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete('buck_session');
  return NextResponse.json({ ok: true });
}

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get('buck_session');

  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  try {
    const data = JSON.parse(session.value);
    return NextResponse.json({ authenticated: true, user: data });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}