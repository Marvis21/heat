const router = require('express').Router();
const controller = require('../controllers/disease.controller');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const schemas = require('../validators/disease.validator');

router.use(authenticate);

/**
 * @openapi
 * /diseases/symptoms:
 *   get:
 *     tags: [Symptom Checker]
 *     summary: List all known symptoms (for building the checklist UI)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of symptoms }
 */
router.get('/symptoms', controller.listSymptoms);

/**
 * @openapi
 * /diseases/match:
 *   get:
 *     tags: [Symptom Checker]
 *     summary: Match observed symptoms against known diseases, ranked by confidence
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: symptoms
 *         required: true
 *         schema: { type: string }
 *         description: Comma-separated list of observed symptom names
 *     responses:
 *       200: { description: Ranked disease matches }
 */
router.get('/match', validate({ query: schemas.matchQuery }), controller.match);

module.exports = router;
