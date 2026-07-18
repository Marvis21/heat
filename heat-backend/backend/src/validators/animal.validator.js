const { z } = require('zod');

const AnimalType = z.enum(['COW', 'BULL', 'HEIFER']);
const AnimalPurpose = z.enum(['DAIRY', 'BEEF', 'BREEDING']);
const AnimalStatusType = z.enum(['SUCCESS', 'ERROR', 'PRIMARY']);

const create = z.object({
  name: z.string().min(1),
  tagNumber: z.string().min(1),
  breed: z.string().min(1),
  type: AnimalType.default('COW'),
  purpose: AnimalPurpose.default('DAIRY'),
  status: z.string().default('Healthy'),
  statusType: AnimalStatusType.default('SUCCESS'),
  weightKg: z.number().positive().optional(),
  lastCalving: z.string().datetime().optional(),
});

const update = create.partial();

const idParam = z.object({
  id: z.string().uuid('Invalid animal id'),
});

const listQuery = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  type: AnimalType.optional(),
  purpose: AnimalPurpose.optional(),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'createdAt', 'tagNumber']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

module.exports = { create, update, idParam, listQuery };
