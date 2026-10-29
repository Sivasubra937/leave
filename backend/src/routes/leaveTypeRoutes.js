const express = require('express');
const router = express.Router();
const {
  getLeaveTypes,
  createLeaveType,
  updateLeaveType,
  deleteLeaveType,
  resetAllBalances,
} = require('../controllers/leaveTypeController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', getLeaveTypes);
router.post('/', authorize('admin'), createLeaveType);
router.put('/:id', authorize('admin'), updateLeaveType);
router.delete('/:id', authorize('admin'), deleteLeaveType);
router.post('/reset-balances', authorize('admin'), resetAllBalances);

module.exports = router;
