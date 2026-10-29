const express = require('express');
const router = express.Router();
const {
  getHolidays,
  createHoliday,
  deleteHoliday,
} = require('../controllers/holidayController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', getHolidays);
router.post('/', authorize('admin'), createHoliday);
router.delete('/:id', authorize('admin'), deleteHoliday);

module.exports = router;
