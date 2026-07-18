const router = require('express').Router();
const controller = require('../controllers/dashboard.controller');
const { authenticate } = require('../middleware/auth');

/**
 * @openapi
 * /dashboard/summary:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get aggregated dashboard stats (herd totals, milk trend, financials, alerts)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Dashboard summary }
 */
router.get('/summary', authenticate, controller.getSummary);

module.exports = router;
