/**
 * Seeds the database with:
 *  - The disease/symptom reference data (mirrors the frontend's client-side rule table)
 *  - A demo farmer user + a few animals, so the frontend has data to show on first run.
 *
 * Run with: npm run seed
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const SYMPTOMS = [
  'High Fever', 'Mouth Sores', 'Swollen Lymph Nodes', 'Decreased Milk',
  'Skin Lumps', 'Drooling', 'Limping', 'Loss of Appetite',
  'Bloated Stomach', 'Coughing', 'Eye Discharge', 'Nasal Discharge',
  'Diarrhea', 'Weight Loss', 'Abortion', 'Dullness',
];

const DISEASES = [
  { name: 'East Coast Fever (ECF)', action: 'Call Vet Immediately', severity: 'error', symptoms: ['High Fever', 'Swollen Lymph Nodes', 'Coughing'] },
  { name: 'Mastitis', action: 'Check Udder/Milk Color', severity: 'primary', symptoms: ['Decreased Milk', 'Dullness'] },
  { name: 'Foot & Mouth (FMD)', action: 'Isolate & Call Vet', severity: 'error', symptoms: ['Mouth Sores', 'Drooling', 'Limping', 'High Fever'] },
  { name: 'Lumpy Skin (LSD)', action: 'Isolate Animal', severity: 'error', symptoms: ['Skin Lumps', 'High Fever', 'Nasal Discharge'] },
  { name: 'Bloat', action: 'Anti-Bloat Treatment', severity: 'primary', symptoms: ['Bloated Stomach', 'Loss of Appetite'] },
  { name: 'Milk Fever', action: 'Calcium Supplement', severity: 'primary', symptoms: ['Dullness', 'Loss of Appetite', 'Limping'] },
];

async function main() {
  console.log('Seeding symptoms...');
  const symptomRecords = {};
  for (const name of SYMPTOMS) {
    const s = await prisma.symptom.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    symptomRecords[name] = s;
  }

  console.log('Seeding diseases...');
  for (const d of DISEASES) {
    const existing = await prisma.disease.findFirst({ where: { name: d.name } });
    const disease = existing
      ? existing
      : await prisma.disease.create({ data: { name: d.name, action: d.action, severity: d.severity } });

    for (const symptomName of d.symptoms) {
      const symptom = symptomRecords[symptomName];
      await prisma.diseaseSymptom.upsert({
        where: { diseaseId_symptomId: { diseaseId: disease.id, symptomId: symptom.id } },
        update: {},
        create: { diseaseId: disease.id, symptomId: symptom.id },
      });
    }
  }

  console.log('Seeding demo user + animals...');
  const passwordHash = await bcrypt.hash('Password123!', 12);
  const user = await prisma.user.upsert({
    where: { email: 'demo@heatapp.com' },
    update: {},
    create: {
      email: 'demo@heatapp.com',
      passwordHash,
      name: 'Demo Farmer',
      farmName: 'Green Valley Farm',
      isEmailVerified: true,
    },
  });

  const demoAnimals = [
    { name: 'Bessie', tagNumber: '#101', breed: 'Friesian', type: 'COW', purpose: 'DAIRY', status: 'Healthy', statusType: 'SUCCESS', weightKg: 480 },
    { name: 'Daisy', tagNumber: '#102', breed: 'Ayrshire', type: 'COW', purpose: 'DAIRY', status: 'Heat Alert', statusType: 'ERROR', weightKg: 455 },
    { name: 'Nyota', tagNumber: '#103', breed: 'Boran', type: 'COW', purpose: 'DAIRY', status: 'Sick', statusType: 'ERROR', weightKg: 470 },
    { name: 'Juma', tagNumber: '#104', breed: 'Jersey', type: 'BULL', purpose: 'BREEDING', status: 'Healthy', statusType: 'SUCCESS', weightKg: 610 },
    { name: 'Baraka', tagNumber: '#105', breed: 'Friesian', type: 'HEIFER', purpose: 'BEEF', status: 'Healthy', statusType: 'SUCCESS', weightKg: 320 },
    { name: 'Tamu', tagNumber: '#106', breed: 'Ayrshire', type: 'COW', purpose: 'DAIRY', status: 'Pregnant', statusType: 'PRIMARY', weightKg: 460 },
  ];

  for (const a of demoAnimals) {
    await prisma.animal.upsert({
      where: { userId_tagNumber: { userId: user.id, tagNumber: a.tagNumber } },
      update: {},
      create: { ...a, userId: user.id },
    });
  }

  console.log('Seed complete. Demo login: demo@heatapp.com / Password123!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
