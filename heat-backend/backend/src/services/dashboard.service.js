const prisma = require('../config/prisma');

async function getSummary(userId) {
  const [totalAnimals, cows, bulls, financialTotals, recentMilk, sickOrAlertAnimals, upcomingHealth] =
    await Promise.all([
      prisma.animal.count({ where: { userId } }),
      prisma.animal.count({ where: { userId, purpose: 'DAIRY' } }),
      prisma.animal.count({ where: { userId, type: 'BULL' } }),
      prisma.financialRecord.groupBy({ by: ['type'], where: { userId }, _sum: { amount: true } }),
      prisma.milkRecord.findMany({
        where: { animal: { userId } },
        orderBy: { date: 'desc' },
        take: 7,
      }),
      prisma.animal.findMany({
        where: { userId, statusType: 'ERROR' },
        select: { id: true, name: true, status: true, tagNumber: true },
      }),
      prisma.healthRecord.findMany({
        where: { animal: { userId }, date: { gte: new Date() } },
        include: { animal: { select: { name: true } } },
        orderBy: { date: 'asc' },
        take: 5,
      }),
    ]);

  const income = Number(financialTotals.find((t) => t.type === 'INCOME')?._sum.amount || 0);
  const expense = Number(financialTotals.find((t) => t.type === 'EXPENSE')?._sum.amount || 0);

  const alerts = [
    ...sickOrAlertAnimals.map((a) => ({
      type: 'health',
      severity: 'error',
      title: `${a.name}: ${a.status}`,
      animalId: a.id,
    })),
    ...upcomingHealth.map((h) => ({
      type: 'health-schedule',
      severity: 'primary',
      title: `${h.animal.name}: ${h.type} due`,
      date: h.date,
    })),
  ];

  return {
    totals: { animals: totalAnimals, cows, bulls, alerts: alerts.length },
    financials: { revenue: income, expenses: expense, netProfit: income - expense },
    milkTrend: recentMilk.reverse(), // oldest -> newest for charting
    alerts,
  };
}

module.exports = { getSummary };
