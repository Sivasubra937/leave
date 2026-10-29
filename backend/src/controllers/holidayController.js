const Holiday = require('../models/Holiday');
const { logAction } = require('../utils/auditLogger');

// @desc    Get all company holidays
// @route   GET /api/holidays
// @access  Private (All authenticated users)
exports.getHolidays = async (req, res, next) => {
  try {
    const { year } = req.query;
    let query = {};

    if (year) {
      const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
      const endOfYear = new Date(`${year}-12-31T23:59:59.999Z`);
      query.date = { $gte: startOfYear, $lte: endOfYear };
    }

    const holidays = await Holiday.find(query).sort({ date: 1 });

    res.status(200).json({
      success: true,
      count: holidays.length,
      holidays,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new company holiday
// @route   POST /api/holidays
// @access  Private (Admin only)
exports.createHoliday = async (req, res, next) => {
  try {
    const { name, date, description, isRecurring } = req.body;

    if (!name || !date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both holiday name and date.',
      });
    }

    const holidayDate = new Date(date);
    holidayDate.setHours(0, 0, 0, 0);

    const existing = await Holiday.findOne({ date: holidayDate });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `A holiday named '${existing.name}' is already scheduled on this date.`,
      });
    }

    const holiday = await Holiday.create({
      name,
      date: holidayDate,
      description: description || '',
      isRecurring: Boolean(isRecurring),
    });

    await logAction({
      action: 'HOLIDAY_CREATED',
      performedBy: req.user._id,
      details: { name, date: holidayDate },
      req,
    });

    res.status(201).json({
      success: true,
      message: 'Holiday created successfully',
      holiday,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a company holiday
// @route   DELETE /api/holidays/:id
// @access  Private (Admin only)
exports.deleteHoliday = async (req, res, next) => {
  try {
    const holiday = await Holiday.findById(req.params.id);
    if (!holiday) {
      return res.status(404).json({
        success: false,
        message: 'Holiday not found.',
      });
    }

    await Holiday.findByIdAndDelete(req.params.id);

    await logAction({
      action: 'HOLIDAY_DELETED',
      performedBy: req.user._id,
      details: { id: req.params.id, name: holiday.name },
      req,
    });

    res.status(200).json({
      success: true,
      message: 'Holiday deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
};
