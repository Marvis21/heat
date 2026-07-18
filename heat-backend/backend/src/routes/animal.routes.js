const router = require('express').Router();
const controller = require('../controllers/animal.controller');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { uploadAnimalPhoto } = require('../middleware/upload');
const schemas = require('../validators/animal.validator');

router.use(authenticate);

/**
 * @openapi
 * /animals:
 *   get:
 *     tags: [Animals]
 *     summary: List animals in the current user's herd (paginated, filterable, searchable)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [COW, BULL, HEIFER] }
 *       - in: query
 *         name: purpose
 *         schema: { type: string, enum: [DAIRY, BEEF, BREEDING] }
 *     responses:
 *       200: { description: List of animals }
 *   post:
 *     tags: [Animals]
 *     summary: Register a new animal
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Animal created }
 */
router
  .route('/')
  .get(validate({ query: schemas.listQuery }), controller.list)
  .post(validate({ body: schemas.create }), controller.create);

/**
 * @openapi
 * /animals/{id}:
 *   get:
 *     tags: [Animals]
 *     summary: Get a single animal profile with recent record history
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Animal profile }
 *       404: { description: Not found }
 *   patch:
 *     tags: [Animals]
 *     summary: Update an animal
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Animal updated }
 *   delete:
 *     tags: [Animals]
 *     summary: Delete an animal
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Animal deleted }
 */
router
  .route('/:id')
  .get(validate({ params: schemas.idParam }), controller.getById)
  .patch(validate({ params: schemas.idParam, body: schemas.update }), controller.update)
  .delete(validate({ params: schemas.idParam }), controller.remove);

/**
 * @openapi
 * /animals/{id}/photo:
 *   post:
 *     tags: [Animals]
 *     summary: Upload a profile photo for an animal (JPEG/PNG/WEBP, max 5MB by default)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photo: { type: string, format: binary }
 *     responses:
 *       200: { description: Animal updated with new photo URL }
 *       400: { description: Invalid file }
 */
router.post(
  '/:id/photo',
  validate({ params: schemas.idParam }),
  uploadAnimalPhoto,
  controller.uploadPhoto
);

module.exports = router;
