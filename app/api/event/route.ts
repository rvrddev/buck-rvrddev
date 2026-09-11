// app/api/event/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { events } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    if (!cookieStore.get('buck_session')) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { monthId, day, text } = await request.json();

    const existing = await db.select().from(events).where(
      and(eq(events.monthId, monthId), eq(events.day, day))
    );

    if (existing.length > 0) {
      // Actualizar TODOS los duplicados, no solo el primero
      await db.update(events).set({ text }).where(
        and(eq(events.monthId, monthId), eq(events.day, day))
      );
      return NextResponse.json({ ok: true, updated: existing.length });
    } else {
      const [created] = await db.insert(events).values({ monthId, day, text }).returning();
      return NextResponse.json(created);
    }
  } catch (error) {
    console.error('Error event:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}