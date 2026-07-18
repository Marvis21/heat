const { z } = require('zod');

const matchQuery = z.object({
  symptoms: z
    .string()
    .min(1, 'symptoms query param is required, comma-separated')
    .transform((v) => v.split(',').map((s) => s.trim()).filter(Boolean)),
});

module.exports = { matchQuery };
