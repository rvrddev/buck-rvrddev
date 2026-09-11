// db/seed.ts
import { db } from '../lib/db';
import { users, months, habits, checks, objectives, events, notes } from '../lib/schema';

async function seed() {
  console.log('🌱 Iniciando seed (versión limpia)...');

  // ============ 1. USUARIO ============
  const [user] = await db.insert(users).values({
    email: 'admin',
    name: 'Administrador',
  }).returning();
  console.log('👤 Usuario creado:', user.id);

  // ============ 2. MES ============
  const [month] = await db.insert(months).values({
    userId: user.id,
    year: 2026,
    month: 8,
    title: 'SEPTIEMBRE 2026',
    mantra: 'Código limpio, mente clara, cuerpo fuerte 💪',
  }).returning();
  console.log('📅 Mes creado:', month.id);

  // ============ 3. HÁBITOS ============
  const habitData = [
    { name: 'Rutina', category: 'routine' },
    { name: 'Programar', category: 'mind' },
    { name: 'Modelar', category: 'create' },
    { name: 'Editar', category: 'create' },
    { name: 'Gym', category: 'body' },
    { name: 'Leer', category: 'mind' },
    { name: 'Ducha', category: 'routine' },
    { name: 'Meditar', category: 'mind' },
    { name: 'Estirar', category: 'body' },
    { name: 'Comer', category: 'body' },
  ];

  const insertedHabits = await db.insert(habits).values(
    habitData.map((h, i) => ({
      monthId: month.id,
      name: h.name,
      category: h.category,
      position: i,
    }))
  ).returning();
  console.log('📋 Hábitos:', insertedHabits.length);

  // ============ 4. CHECKS (sin duplicados) ============
  // Usamos un Set para evitar duplicados
  const checkSet = new Set<string>();
  const checkValues: { monthId: number; habitId: number; day: number; checked: boolean }[] = [];

  const addCheck = (habitIndex: number, day: number) => {
    const key = `${insertedHabits[habitIndex].id}_${day}`;
    if (checkSet.has(key)) return; // Ya existe, saltar
    checkSet.add(key);
    checkValues.push({
      monthId: month.id,
      habitId: insertedHabits[habitIndex].id,
      day,
      checked: true,
    });
  };

  const days = 30;
  for (let day = 1; day <= days; day++) {
    const date = new Date(2026, 8, day);
    const weekday = date.getDay(); // 0=Dom, 6=Sáb

    // Todos los días: Rutina(0), Ducha(6), Estirar(8)
    addCheck(0, day);
    addCheck(6, day);
    addCheck(8, day);

    // Días laborables: Programar(1), Leer(5), Comer(9)
    if (weekday >= 1 && weekday <= 5) {
      addCheck(1, day);
      addCheck(5, day);
      addCheck(9, day);
    }

    // Modelar(2): días específicos
    if ([2, 5, 8, 12, 15, 19, 22, 26, 29].includes(day)) {
      addCheck(2, day);
    }

    // Editar(3): días específicos
    if ([3, 6, 10, 13, 17, 20, 24, 27].includes(day)) {
      addCheck(3, day);
    }

    // Gym(4): días específicos
    if ([1, 3, 5, 7, 10, 12, 14, 17, 19, 21, 24, 26, 28].includes(day)) {
      addCheck(4, day);
    }

    // Meditar(7): fines de semana
    if (weekday === 0 || weekday === 6) {
      addCheck(7, day);
    }
  }

  await db.insert(checks).values(checkValues);
  console.log('✓ Checks:', checkValues.length);

  // ============ 5. OBJETIVOS ============
  await db.insert(objectives).values([
    {
      monthId: month.id,
      type: 'simple',
      text: 'Terminar el modelado 3D del personaje principal',
      done: true,
      note: '¡Por fin!',
      position: 0,
    },
    {
      monthId: month.id,
      type: 'counter',
      text: 'Ir al gym este mes',
      current: 13,
      target: 16,
      position: 1,
    },
    {
      monthId: month.id,
      type: 'weekly',
      text: 'Publicar un video por semana',
      weeks: [true, true, false, true],
      position: 2,
    },
  ]);
  console.log('🎯 Objetivos: 3');

  // ============ 6. EVENTOS ============
  await db.insert(events).values([
    { monthId: month.id, day: 1, text: 'Planificación proyecto 3D' },
    { monthId: month.id, day: 3, text: 'Reunión equipo desarrollo' },
    { monthId: month.id, day: 7, text: 'Entrega assets 3D' },
    { monthId: month.id, day: 10, text: 'Edición showreel Q3' },
    { monthId: month.id, day: 14, text: 'Code review' },
    { monthId: month.id, day: 17, text: 'Personaje principal listo' },
    { monthId: month.id, day: 20, text: 'Grabación tutorial' },
    { monthId: month.id, day: 24, text: 'Presentación al cliente' },
    { monthId: month.id, day: 28, text: 'Cierre de sprint' },
    { monthId: month.id, day: 30, text: 'Resumen del mes' },
  ]);
  console.log('📌 Eventos: 10');

  // ============ 7. NOTAS ============
  await db.insert(notes).values([
    { monthId: month.id, day: 5, text: 'Hoy me costó arrancar pero al final salió todo bien.' },
    { monthId: month.id, day: 15, text: 'Día productivo.' },
    { monthId: month.id, day: 25, text: 'Un poco cansado, pero mantuve la racha.' },
  ]);
  console.log('📝 Notas: 3');

  console.log('\n✅ Seed completado');
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Error:', err);
    process.exit(1);
  });