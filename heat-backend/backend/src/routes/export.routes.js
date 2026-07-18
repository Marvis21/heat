const router = require('express').Router();
const controller = require('../controllers/export.controller');
const { authenticate } = require('../middleware/auth');

/**
 * @openapi
 * /export/csv:
 *   get:
 *     tags: [Export]
 *     summary: Download a full CSV export of the farm's data (mirrors the "Shamba Summary" button)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: CSV file }
 */
router.get('/csv', authenticate, controller.exportCsv);

module.exports = router;
