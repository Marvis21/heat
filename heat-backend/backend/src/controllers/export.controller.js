const catchAsync = require('../utils/catchAsync');
const prisma = require('../config/prisma');

function csvEscape(val) {
  if (val === null || val === undefined) return '';
  const str = String(val);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

function rowsToCsv(rows) {
  return rows.map((r) => r.map(csvEscape).join(',')).join('\n');
}

const exportCsv = catchAsync(async (req, res) => {
  const userId = req.user.id;

  const [animals, milk, breeding, health, feed, financial] = await Promise.all([
    prisma.animal.findMany({ where: { userId } }),
    prisma.milkRecord.findMany({ where: { animal: { userId } }, include: { animal: true } }),
    prisma.breedingRecord.findMany({ where: { animal: { userId } }, include: { animal: true } }),
    prisma.healthRecord.findMany({ where: { animal: { userId } }, include: { animal: true } }),
    prisma.feedRecord.findMany({ where: { userId } }),
    prisma.financialRecord.findMany({ where: { userId } }),
  ]);

  const rows = [
    ['FARM SUMMARY REPORT'],
    ['Total Animals', animals.length],
    ['Total Dairy Cows', animals.filter((a) => a.purpose === 'DAIRY').length],
    [],
    ['HERD DETAILS'],
    ['Name', 'Tag Number', 'Breed', 'Purpose', 'Status', 'Weight (Kg)'],
    ...animals.map((a) => [a.name, a.tagNumber, a.breed, a.purpose, a.status, a.weightKg]),
    [],
    ['MILK PRODUCTION RECORDS'],
    ['Date', 'Animal', 'Session', 'Liters'],
    ...milk.map((r) => [r.date.toISOString().slice(0, 10), r.animal.name, r.session, r.liters]),
    [],
    ['BREEDING RECORDS'],
    ['Date', 'Animal', 'Event', 'Details'],
    ...breeding.map((r) => [r.date.toISOString().slice(0, 10), r.animal.name, r.eventType, r.details]),
    [],
    ['HEALTH RECORDS'],
    ['Date', 'Animal', 'Type', 'Description', 'Cost'],
    ...health.map((r) => [r.date.toISOString().slice(0, 10), r.animal.name, r.type, r.description, r.cost]),
    [],
    ['FEED RECORDS'],
    ['Date', 'Feed Type', 'Quantity (Kg)', 'Cost'],
    ...feed.map((r) => [r.date.toISOString().slice(0, 10), r.feedType, r.quantityKg, r.cost]),
    [],
    ['FINANCIAL RECORDS'],
    ['Date', 'Type', 'Category', 'Amount'],
    ...financial.map((r) => [r.date.toISOString().slice(0, 10), r.type, r.category, r.amount]),
  ];

  const csv = rowsToCsv(rows);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="heat_farm_data.csv"');
  res.send(csv);
});

module.exports = { exportCsv };
