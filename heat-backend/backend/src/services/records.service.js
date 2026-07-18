const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');

/** Verifies the animal belongs to the requesting user; throws 404 otherwise. */
async function assertAnimalOwnership(userId, animalId) {
  const animal = await prisma.animal.findFirst({ where: { id: animalId, userId } });
  if (!animal) throw ApiError.notFound('Animal not found');
  return animal;
}

function dateRangeWhere(from, to) {
  if (!from && !to) return undefined;
  return {
    ...(from && { gte: new Date(from) }),
    ...(to && { lte: new Date(to) }),
  };
}

// ---------------- Milk ----------------
async function createMilk(userId, data) {
  await assertAnimalOwnership(userId, data.animalId);
  return prisma.milkRecord.create({ data: { ...data, date: new Date(data.date) } });
}

async function listMilk(userId, { page, limit, animalId, from, to }) {
  const where = {
    animal: { userId },
    ...(animalId && { animalId }),
    ...(dateRangeWhere(from, to) && { date: dateRangeWhere(from, to) }),
  };
  const [items, total] = await Promise.all([
    prisma.milkRecord.findMany({
      where,
      include: { animal: { select: { name: true, tagNumber: true } } },
      orderBy: { date: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.milkRecord.count({ where }),
  ]);
  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
}

async function deleteMilk(userId, id) {
  const record = await prisma.milkRecord.findFirst({ where: { id, animal: { userId } } });
  if (!record) throw ApiError.notFound('Milk record not found');
  await prisma.milkRecord.delete({ where: { id } });
}

// ---------------- Breeding ----------------
async function createBreeding(userId, data) {
  await assertAnimalOwnership(userId, data.animalId);
  return prisma.breedingRecord.create({ data: { ...data, date: new Date(data.date) } });
}

async function listBreeding(userId, { page, limit, animalId }) {
  const where = { animal: { userId }, ...(animalId && { animalId }) };
  const [items, total] = await Promise.all([
    prisma.breedingRecord.findMany({
      where,
      include: { animal: { select: { name: true, tagNumber: true } } },
      orderBy: { date: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.breedingRecord.count({ where }),
  ]);
  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
}

async function deleteBreeding(userId, id) {
  const record = await prisma.breedingRecord.findFirst({ where: { id, animal: { userId } } });
  if (!record) throw ApiError.notFound('Breeding record not found');
  await prisma.breedingRecord.delete({ where: { id } });
}

// ---------------- Oestrus ----------------
/**
 * Mirrors the frontend's client-side rule: >=4 signs = HIGH, >=1 = POSSIBLE, else NONE.
 */
function computeOestrusLevel(signsCount) {
  if (signsCount >= 4) return 'HIGH';
  if (signsCount >= 1) return 'POSSIBLE';
  return 'NONE';
}

async function createOestrusCheck(userId, data) {
  await assertAnimalOwnership(userId, data.animalId);
  const resultLevel = computeOestrusLevel(data.signs.length);
  const record = await prisma.oestrusCheck.create({
    data: { animalId: data.animalId, signs: data.signs, notes: data.notes, resultLevel },
  });
  return record;
}

async function listOestrusChecks(userId, animalId) {
  await assertAnimalOwnership(userId, animalId);
  return prisma.oestrusCheck.findMany({ where: { animalId }, orderBy: { date: 'desc' } });
}

// ---------------- Health ----------------
async function createHealth(userId, data) {
  await assertAnimalOwnership(userId, data.animalId);
  return prisma.healthRecord.create({ data: { ...data, date: new Date(data.date) } });
}

async function listHealth(userId, { page, limit, animalId }) {
  const where = { animal: { userId }, ...(animalId && { animalId }) };
  const [items, total] = await Promise.all([
    prisma.healthRecord.findMany({
      where,
      include: { animal: { select: { name: true, tagNumber: true } } },
      orderBy: { date: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.healthRecord.count({ where }),
  ]);
  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
}

async function deleteHealth(userId, id) {
  const record = await prisma.healthRecord.findFirst({ where: { id, animal: { userId } } });
  if (!record) throw ApiError.notFound('Health record not found');
  await prisma.healthRecord.delete({ where: { id } });
}

// ---------------- Feed ----------------
async function createFeed(userId, data) {
  return prisma.feedRecord.create({ data: { ...data, userId, date: new Date(data.date) } });
}

async function listFeed(userId, { page, limit, from, to }) {
  const where = { userId, ...(dateRangeWhere(from, to) && { date: dateRangeWhere(from, to) }) };
  const [items, total] = await Promise.all([
    prisma.feedRecord.findMany({
      where,
      orderBy: { date: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.feedRecord.count({ where }),
  ]);
  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
}

async function deleteFeed(userId, id) {
  const record = await prisma.feedRecord.findFirst({ where: { id, userId } });
  if (!record) throw ApiError.notFound('Feed record not found');
  await prisma.feedRecord.delete({ where: { id } });
}

// ---------------- Financial ----------------
async function createFinancial(userId, data) {
  return prisma.financialRecord.create({ data: { ...data, userId, date: new Date(data.date) } });
}

async function listFinancial(userId, { page, limit, type, from, to }) {
  const where = {
    userId,
    ...(type && { type }),
    ...(dateRangeWhere(from, to) && { date: dateRangeWhere(from, to) }),
  };
  const [items, total] = await Promise.all([
    prisma.financialRecord.findMany({
      where,
      orderBy: { date: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.financialRecord.count({ where }),
  ]);

  const totals = await prisma.financialRecord.groupBy({
    by: ['type'],
    where: { userId },
    _sum: { amount: true },
  });
  const income = Number(totals.find((t) => t.type === 'INCOME')?._sum.amount || 0);
  const expense = Number(totals.find((t) => t.type === 'EXPENSE')?._sum.amount || 0);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    summary: { income, expense, netProfit: income - expense },
  };
}

async function deleteFinancial(userId, id) {
  const record = await prisma.financialRecord.findFirst({ where: { id, userId } });
  if (!record) throw ApiError.notFound('Financial record not found');
  await prisma.financialRecord.delete({ where: { id } });
}

module.exports = {
  createMilk,
  listMilk,
  deleteMilk,
  createBreeding,
  listBreeding,
  deleteBreeding,
  createOestrusCheck,
  listOestrusChecks,
  computeOestrusLevel,
  createHealth,
  listHealth,
  deleteHealth,
  createFeed,
  listFeed,
  deleteFeed,
  createFinancial,
  listFinancial,
  deleteFinancial,
};
