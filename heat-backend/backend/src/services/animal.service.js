const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');

async function list(userId, { page, limit, type, purpose, search, sortBy, sortOrder }) {
  const where = {
    userId,
    ...(type && { type }),
    ...(purpose && { purpose }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { tagNumber: { contains: search, mode: 'insensitive' } },
        { breed: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const [items, total] = await Promise.all([
    prisma.animal.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.animal.count({ where }),
  ]);

  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
}

async function getById(userId, id) {
  const animal = await prisma.animal.findFirst({
    where: { id, userId },
    include: {
      milkRecords: { orderBy: { date: 'desc' }, take: 10 },
      breedingRecords: { orderBy: { date: 'desc' }, take: 10 },
      healthRecords: { orderBy: { date: 'desc' }, take: 10 },
      oestrusChecks: { orderBy: { date: 'desc' }, take: 5 },
    },
  });
  if (!animal) throw ApiError.notFound('Animal not found');
  return animal;
}

async function create(userId, data) {
  return prisma.animal.create({ data: { ...data, userId } });
}

async function update(userId, id, data) {
  const existing = await prisma.animal.findFirst({ where: { id, userId } });
  if (!existing) throw ApiError.notFound('Animal not found');
  return prisma.animal.update({ where: { id }, data });
}

async function remove(userId, id) {
  const existing = await prisma.animal.findFirst({ where: { id, userId } });
  if (!existing) throw ApiError.notFound('Animal not found');
  await prisma.animal.delete({ where: { id } });
}

module.exports = { list, getById, create, update, remove };
