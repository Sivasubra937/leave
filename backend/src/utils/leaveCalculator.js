const LeaveRequest = require('../models/LeaveRequest');
const Holiday = require('../models/Holiday');

/**
 * Calculates working days between two dates, excluding weekends (Sat/Sun) and configured holidays.
 * @param {Date|string} start 
 * @param {Date|string} end 
 * @returns {Promise<number>} Working days count
 */
const calculateWorkingDays = async (start, end) => {
  const startDate = new Date(start);
  const endDate = new Date(end);

  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);

  if (startDate > endDate) {
    throw new Error('Start date cannot be after end date.');
  }

  // Fetch holidays within range
  const rangeEnd = new Date(endDate);
  rangeEnd.setHours(23, 59, 59, 999);

  let holidays = [];
  try {
    holidays = await Holiday.find({
      date: { $gte: startDate, $lte: rangeEnd },
    });
  } catch (err) {
    // If Holiday model fails or table not yet initialized, fallback gracefully
    holidays = [];
  }

  const holidayDateStrings = new Set(
    holidays.map((h) => new Date(h.date).toISOString().split('T')[0])
  );

  let count = 0;
  const cur = new Date(startDate);

  while (cur <= endDate) {
    const dayOfWeek = cur.getDay(); // 0 is Sun, 6 is Sat
    const dateStr = cur.toISOString().split('T')[0];

    if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidayDateStrings.has(dateStr)) {
      count++;
    }
    cur.setDate(cur.getDate() + 1);
  }

  return count;
};

/**
 * Validates leave date inputs against business rules
 * @param {Date|string} start 
 * @param {Date|string} end 
 * @param {Object} options 
 */
const validateLeaveDates = async (start, end, options = { allowPast: false }) => {
  const startDate = new Date(start);
  const endDate = new Date(end);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw new Error('Invalid date format provided.');
  }

  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);

  // Rule 1: Start date must not be after end date
  if (startDate > endDate) {
    throw new Error('Start date must not be after the end date.');
  }

  // Rule 2: Cannot apply for leave in the past (today is allowed)
  if (!options.allowPast) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (startDate < today) {
      throw new Error('Leave application cannot be in the past. Please select today or a future date.');
    }
  }

  // Rule 4: Exclude weekends and configured holidays
  const workingDays = await calculateWorkingDays(startDate, endDate);
  if (workingDays === 0) {
    throw new Error('The selected date range contains only weekends or official holidays. Leave must cover at least one working day (Monday - Friday).');
  }

  return { startDate, endDate, workingDays };
};

/**
 * Checks for overlapping pending or approved leave requests for the same employee
 * Rule 3: Prevent overlapping leave requests
 * @param {string|ObjectId} employeeId 
 * @param {Date} startDate 
 * @param {Date} endDate 
 * @param {string|ObjectId|null} excludeLeaveId 
 * @returns {Promise<Object|null>} Conflicting leave request if found
 */
const checkOverlappingLeaves = async (employeeId, startDate, endDate, excludeLeaveId = null) => {
  const query = {
    employee: employeeId,
    status: { $in: ['pending', 'approved'] },
    startDate: { $lte: endDate },
    endDate: { $gte: startDate },
  };

  if (excludeLeaveId) {
    query._id = { $ne: excludeLeaveId };
  }

  const conflict = await LeaveRequest.findOne(query);
  return conflict;
};

module.exports = {
  calculateWorkingDays,
  validateLeaveDates,
  checkOverlappingLeaves,
};
