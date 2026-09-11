// app/api/month/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { users, months, habits, checks, objectives, events, notes } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';

async function requireAuth() {
  const cookieStore = await cookies();
  const session = cookieStore.get('buck_session');
  if (!session) return null;
  try { return JSON.parse(session.value); } catch { return null; }
}

// GET: /api/month?year=2026&month=9
export async function GET(request: Request) {
  try {
    const session = await requireAuth();
    if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

    const url = new URL(request.url);
    const yearNum = parseInt(url.searchParams.get('year') || '2026');
    const monthNum = parseInt(url.searchParams.get('month') || '9') - 1;

    const [user] = await db.select().from(users).where(eq(users.email, 'admin')).limit(1);
    if (!user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });

    const [monthData] = await db.select().from(months).where(
      and(eq(months.userId, user.id), eq(months.year, yearNum), eq(months.month, monthNum))
    ).limit(1);

    if (!monthData) return NextResponse.json({ error: 'Mes no encontrado' }, { status: 404 });

    const [habitsData, checksData, objectivesData, eventsData, notesData] = await Promise.all([
      db.select().from(habits).where(eq(habits.monthId, monthData.id)),
      db.select().from(checks).where(eq(checks.monthId, monthData.id)),
      db.select().from(objectives).where(eq(objectives.monthId, monthData.id)),
      db.select().from(events).where(eq(events.monthId, monthData.id)),
      db.select().from(notes).where(eq(notes.monthId, monthData.id)),
    ]);

    return NextResponse.json({
      month: monthData,
      habits: habitsData.sort((a, b) => a.position - b.position),
      checks: checksData,
      objectives: objectivesData.sort((a, b) => a.position - b.position),
      events: eventsData,
      notes: notesData,
    });
  } catch (error) {
    console.error('Error GET month:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// PATCH: /api/month (actualizar título y mantra)
export async function PATCH(request: Request) {
  try {
    const session = await requireAuth();
    if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

    const body = await request.json();
    const { monthId, title, mantra } = body;

    if (!monthId) return NextResponse.json({ error: 'Falta monthId' }, { status: 400 });

    const updateData: any = { updatedAt: new Date() };
    if (title !== undefined) updateData.title = title;
    if (mantra !== undefined) updateData.mantra = mantra;

    const [updated] = await db.update(months).set(updateData).where(eq(months.id, monthId)).returning();
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error PATCH month:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}