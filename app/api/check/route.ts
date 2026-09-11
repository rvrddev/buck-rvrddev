// app/api/check/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { checks } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    if (!cookieStore.get('buck_session')) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { monthId, habitId, day, checked } = await request.json();

    const existing = await db.select().from(checks).where(
      and(eq(checks.monthId, monthId), eq(checks.habitId, habitId), eq(checks.day, day))
    );

    if (existing.length > 0) {
      // Actualizar TODOS los duplicados
      await db.update(checks).set({ checked }).where(
        and(eq(checks.monthId, monthId), eq(checks.habitId, habitId), eq(checks.day, day))
      );
      return NextResponse.json({ ok: true, updated: existing.length });
    } else {
      const [created] = await db.insert(checks).values({
        monthId, habitId, day, checked,
      }).returning();
      return NextResponse.json(created);
    }
  } catch (error) {
    console.error('Error check:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}