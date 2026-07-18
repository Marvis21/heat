const router = require('express').Router();

router.use('/auth', require('./auth.routes'));
router.use('/animals', require('./animal.routes'));
router.use('/records', require('./records.routes'));
router.use('/dashboard', require('./dashboard.routes'));
router.use('/diseases', require('./disease.routes'));
router.use('/export', require('./export.routes'));

router.get('/health', (req, res) => {
  res.status(200).json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

module.exports = router;
