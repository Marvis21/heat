const { z } = require('zod');

const pagination = {
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
};

const dateStr = z.string().refine((v) => !Number.isNaN(Date.parse(v)), 'Invalid date');

// --- Milk ---
const milkCreate = z.object({
  animalId: z.string().uuid(),
  date: dateStr,
  session: z.enum(['AM', 'PM']),
  liters: z.number().nonnegative(),
});
const milkQuery = z.object({
  ...pagination,
  animalId: z.string().uuid().optional(),
  from: dateStr.optional(),
  to: dateStr.optional(),
});

// --- Breeding ---
const breedingCreate = z.object({
  animalId: z.string().uuid(),
  date: dateStr,
  eventType: z.enum(['SERVICE', 'PREGNANCY_CHECK', 'CALVING']),
  details: z.string().optional(),
});
const breedingQuery = z.object({
  ...pagination,
  animalId: z.string().uuid().optional(),
});

// --- Oestrus ---
const oestrusCreate = z.object({
  animalId: z.string().uuid(),
  signs: z.array(z.string()).default([]),
  notes: z.string().optional(),
});

// --- Health ---
const healthCreate = z.object({
  animalId: z.string().uuid(),
  date: dateStr,
  type: z.enum(['VACCINATION', 'TREATMENT', 'VET_VISIT', 'DEWORMING', 'ILLNESS']),
  description: z.string().optional(),
  cost: z.number().nonnegative().default(0),
});
const healthQuery = z.object({
  ...pagination,
  animalId: z.string().uuid().optional(),
});

// --- Feed ---
const feedCreate = z.object({
  date: dateStr,
  feedType: z.string().min(1),
  quantityKg: z.number().nonnegative(),
  cost: z.number().nonnegative().default(0),
});
const feedQuery = z.object({ ...pagination, from: dateStr.optional(), to: dateStr.optional() });

// --- Financial ---
const financialCreate = z.object({
  date: dateStr,
  type: z.enum(['INCOME', 'EXPENSE']),
  category: z.string().min(1),
  amount: z.number().positive(),
});
const financialQuery = z.object({
  ...pagination,
  type: z.enum(['INCOME', 'EXPENSE']).optional(),
  from: dateStr.optional(),
  to: dateStr.optional(),
});

const idParam = z.object({ id: z.string().uuid() });

module.exports = {
  milkCreate,
  milkQuery,
  breedingCreate,
  breedingQuery,
  oestrusCreate,
  healthCreate,
  healthQuery,
  feedCreate,
  feedQuery,
  financialCreate,
  financialQuery,
  idParam,
};
