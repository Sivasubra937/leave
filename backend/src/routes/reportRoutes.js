const express = require('express');
const router = express.Router();
const {
  getAnalytics,
  getAuditLogs,
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/analytics', authorize('admin', 'manager'), getAnalytics);
router.get('/leave-summary', authorize('admin', 'manager'), getAnalytics);
router.get('/audit-logs', authorize('admin'), getAuditLogs);

module.exports = router;
