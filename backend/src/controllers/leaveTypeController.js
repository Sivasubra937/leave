const LeaveType = require('../models/LeaveType');
const User = require('../models/User');
const { logAction } = require('../utils/auditLogger');

// @desc    Get all leave types
// @route   GET /api/leave-types
// @access  Private
exports.getLeaveTypes = async (req, res, next) => {
  try {
    const leaveTypes = await LeaveType.find().sort({ name: 1 });
    res.status(200).json({ success: true, leaveTypes });
  } catch (err) {
    next(err);
  }
};

// @desc    Update leave type policy / annual quota
// @route   PUT /api/leave-types/:id
// @access  Private (Admin)
exports.updateLeaveType = async (req, res, next) => {
  try {
    const { annualQuota, description, isPaid } = req.body;

    const leaveType = await LeaveType.findById(req.params.id);
    if (!leaveType) {
      return res.status(404).json({ success: false, message: 'Leave type not found' });
    }

    if (annualQuota !== undefined) leaveType.annualQuota = Number(annualQuota);
    if (description !== undefined) leaveType.description = description;
    if (isPaid !== undefined) leaveType.isPaid = Boolean(isPaid);
    if (req.body.isActive !== undefined) leaveType.isActive = Boolean(req.body.isActive);
    if (req.body.name) leaveType.name = req.body.name;

    await leaveType.save();

    await logAction({
      action: 'LEAVE_POLICY_UPDATED',
      performedBy: req.user.id,
      details: {
        leaveType: leaveType.code,
        annualQuota: leaveType.annualQuota,
      },
      req,
    });

    res.status(200).json({
      success: true,
      message: `${leaveType.name} policy updated successfully`,
      leaveType,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new leave type
// @route   POST /api/leave-types
// @access  Private (Admin)
exports.createLeaveType = async (req, res, next) => {
  try {
    const { name, code, annualQuota, isPaid, description, isActive } = req.body;

    if (!name || !code) {
      return res.status(400).json({ success: false, message: 'Please provide name and code for the leave type.' });
    }

    const existing = await LeaveType.findOne({ $or: [{ code: code.toLowerCase() }, { name }] });
    if (existing) {
      return res.status(400).json({ success: false, message: 'A leave type with this name or code already exists.' });
    }

    const leaveType = await LeaveType.create({
      name,
      code: code.toLowerCase(),
      annualQuota: Number(annualQuota) || 12,
      isPaid: isPaid !== undefined ? Boolean(isPaid) : true,
      description: description || '',
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    await logAction({
      action: 'LEAVE_TYPE_CREATED',
      performedBy: req.user.id,
      details: { code: leaveType.code, name: leaveType.name, annualQuota: leaveType.annualQuota },
      req,
    });

    res.status(201).json({
      success: true,
      message: 'Leave type created successfully',
      leaveType,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete leave type
// @route   DELETE /api/leave-types/:id
// @access  Private (Admin)
exports.deleteLeaveType = async (req, res, next) => {
  try {
    const leaveType = await LeaveType.findById(req.params.id);
    if (!leaveType) {
      return res.status(404).json({ success: false, message: 'Leave type not found' });
    }

    await LeaveType.findByIdAndDelete(req.params.id);

    await logAction({
      action: 'LEAVE_TYPE_DELETED',
      performedBy: req.user.id,
      details: { code: leaveType.code, name: leaveType.name },
      req,
    });

    res.status(200).json({
      success: true,
      message: 'Leave type deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Reset / grant annual balances to all employees based on current quota
// @route   POST /api/leave-types/reset-balances
// @access  Private (Admin)
exports.resetAllBalances = async (req, res, next) => {
  try {
    const types = await LeaveType.find();
    const balanceDefaults = {};
    types.forEach((t) => {
      balanceDefaults[`leaveBalances.${t.code}`] = t.annualQuota;
    });

    await User.updateMany({ role: 'employee' }, { $set: balanceDefaults });

    await logAction({
      action: 'ANNUAL_BALANCES_RESET',
      performedBy: req.user.id,
      details: balanceDefaults,
      req,
    });

    res.status(200).json({
      success: true,
      message: 'All employee annual leave balances have been refreshed according to policy quotas.',
    });
  } catch (err) {
    next(err);
  }
};
