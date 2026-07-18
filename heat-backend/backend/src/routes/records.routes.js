const router = require('express').Router();
const controller = require('../controllers/records.controller');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const schemas = require('../validators/records.validator');

router.use(authenticate);

/**
 * @openapi
 * /records/milk:
 *   get:
 *     tags: [Records - Milk]
 *     summary: List milk production records
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of milk records }
 *   post:
 *     tags: [Records - Milk]
 *     summary: Log a milk production entry
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Milk record created }
 */
router
  .route('/milk')
  .get(validate({ query: schemas.milkQuery }), controller.listMilk)
  .post(validate({ body: schemas.milkCreate }), controller.createMilk);

router.delete('/milk/:id', validate({ params: schemas.idParam }), controller.deleteMilk);

/**
 * @openapi
 * /records/breeding:
 *   get:
 *     tags: [Records - Breeding]
 *     summary: List breeding events (service, pregnancy check, calving)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of breeding records }
 *   post:
 *     tags: [Records - Breeding]
 *     summary: Log a breeding event
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Breeding record created }
 */
router
  .route('/breeding')
  .get(validate({ query: schemas.breedingQuery }), controller.listBreeding)
  .post(validate({ body: schemas.breedingCreate }), controller.createBreeding);

router.delete('/breeding/:id', validate({ params: schemas.idParam }), controller.deleteBreeding);

/**
 * @openapi
 * /records/oestrus:
 *   get:
 *     tags: [Records - Oestrus]
 *     summary: List oestrus checks for an animal
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: animalId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: List of oestrus checks }
 *   post:
 *     tags: [Records - Oestrus]
 *     summary: Submit observed heat signs; server computes the breeding-window recommendation
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Oestrus check logged with computed result level }
 */
router.route('/oestrus').get(controller.listOestrusChecks).post(
  validate({ body: schemas.oestrusCreate }),
  controller.createOestrusCheck
);

/**
 * @openapi
 * /records/health:
 *   get:
 *     tags: [Records - Health]
 *     summary: List health records (vaccinations, treatments, illnesses)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of health records }
 *   post:
 *     tags: [Records - Health]
 *     summary: Log a health record
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Health record created }
 */
router
  .route('/health')
  .get(validate({ query: schemas.healthQuery }), controller.listHealth)
  .post(validate({ body: schemas.healthCreate }), controller.createHealth);

router.delete('/health/:id', validate({ params: schemas.idParam }), controller.deleteHealth);

/**
 * @openapi
 * /records/feed:
 *   get:
 *     tags: [Records - Feed]
 *     summary: List feed & nutrition records
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of feed records }
 *   post:
 *     tags: [Records - Feed]
 *     summary: Log a feed record
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Feed record created }
 */
router
  .route('/feed')
  .get(validate({ query: schemas.feedQuery }), controller.listFeed)
  .post(validate({ body: schemas.feedCreate }), controller.createFeed);

router.delete('/feed/:id', validate({ params: schemas.idParam }), controller.deleteFeed);

/**
 * @openapi
 * /records/financial:
 *   get:
 *     tags: [Records - Financial]
 *     summary: List income/expense records, includes running income/expense/profit summary
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of financial records }
 *   post:
 *     tags: [Records - Financial]
 *     summary: Log an income or expense record
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Financial record created }
 */
router
  .route('/financial')
  .get(validate({ query: schemas.financialQuery }), controller.listFinancial)
  .post(validate({ body: schemas.financialCreate }), controller.createFinancial);

router.delete('/financial/:id', validate({ params: schemas.idParam }), controller.deleteFinancial);

module.exports = router;
