const prisma = require('../config/prisma');

async function listSymptoms() {
  return prisma.symptom.findMany({ orderBy: { name: 'asc' } });
}

/**
 * Given a list of observed symptom names, returns diseases ranked by confidence
 * (percentage of the disease's known symptoms that were observed) — same logic
 * as the frontend's client-side matcher, now centralized so the rule set can be
 * edited without redeploying the frontend.
 */
async function matchSymptoms(selectedSymptoms) {
  const diseases = await prisma.disease.findMany({
    include: { symptoms: { include: { symptom: true } } },
  });

  const results = diseases
    .map((d) => {
      const diseaseSymptomNames = d.symptoms.map((ds) => ds.symptom.name);
      const matchCount = diseaseSymptomNames.filter((s) => selectedSymptoms.includes(s)).length;
      const confidence = diseaseSymptomNames.length
        ? Math.round((matchCount / diseaseSymptomNames.length) * 100)
        : 0;
      return {
        id: d.id,
        name: d.name,
        action: d.action,
        severity: d.severity,
        confidence,
        matchedSymptoms: diseaseSymptomNames.filter((s) => selectedSymptoms.includes(s)),
      };
    })
    .filter((r) => r.confidence > 0)
    .sort((a, b) => b.confidence - a.confidence);

  return results;
}

module.exports = { listSymptoms, matchSymptoms };
