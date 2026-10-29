const LeaveRequest = require('../models/LeaveRequest');
const LeaveType = require('../models/LeaveType');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { validateLeaveDates, checkOverlappingLeaves } = require('../utils/leaveCalculator');
const { logAction } = require('../utils/auditLogger');

// @desc    Apply for a new leave
// @route   POST /api/leaves/apply
// @access  Private (Employee/Manager/Admin)
exports.applyLeave = async (req, res, next) => {
  try {
    const { leaveTypeId, startDate, endDate, reason } = req.body;
    const employeeId = req.user.id;

    if (!leaveTypeId || !startDate || !endDate || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide leave type, start date, end date, and reason.',
      });
    }

    // 1. Verify Leave Type
    const leaveType = await LeaveType.findById(leaveTypeId);
    if (!leaveType) {
      return res.status(404).json({
        success: false,
        message: 'Selected leave type not found.',
      });
    }

    // 2. Validate dates & calculate working days (Rule 1, 2, 4)
    const { startDate: validStart, endDate: validEnd, workingDays } =
      await validateLeaveDates(startDate, endDate);

    // 3. Check for overlapping active leaves (Rule 3)
    const conflict = await checkOverlappingLeaves(employeeId, validStart, validEnd);
    if (conflict) {
      return res.status(400).json({
        success: false,
        message: `You already have an existing ${conflict.status} leave request from ${new Date(conflict.startDate).toLocaleDateString()} to ${new Date(conflict.endDate).toLocaleDateString()}. Overlapping leave requests are not permitted.`,
      });
    }

    // 4. Validate employee balance against requested working days (Rule 8)
    const employee = await User.findById(employeeId);
    const currentBalance = employee.leaveBalances[leaveType.code] ?? 0;

    if (currentBalance < workingDays) {
      return res.status(400).json({
        success: false,
        message: `Insufficient leave balance. You requested ${workingDays} working day(s), but only have ${currentBalance} day(s) remaining for ${leaveType.name}.`,
      });
    }

    const documentUrl = req.file ? `/uploads/${req.file.filename}` : (req.body.documentUrl || '');

    // 5. Create leave request with status 'pending' (Rule 5: No deduction yet!)
    const leaveRequest = await LeaveRequest.create({
      employee: employeeId,
      leaveType: leaveType._id,
      leaveTypeCode: leaveType.code,
      leaveTypeName: leaveType.name,
      startDate: validStart,
      endDate: validEnd,
      daysCount: workingDays,
      reason,
      documentUrl,
      submissionDate: new Date(),
      status: 'pending',
    });

    // 6. Notify Manager if assigned
    if (employee.manager) {
      await Notification.create({
        recipient: employee.manager,
        sender: employee._id,
        title: 'New Leave Request Received',
        message: `${employee.name} applied for ${workingDays} day(s) of ${leaveType.name} from ${validStart.toLocaleDateString()} to ${validEnd.toLocaleDateString()}.`,
        type: 'leave_applied',
        relatedLeave: leaveRequest._id,
      });
    }

    // 7. Audit log
    await logAction({
      action: 'LEAVE_APPLIED',
      performedBy: employee._id,
      targetLeave: leaveRequest._id,
      details: {
        leaveType: leaveType.code,
        days: workingDays,
        startDate: validStart,
        endDate: validEnd,
      },
      req,
    });

    res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully for review.',
      leave: leaveRequest,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get currently logged in user's leave requests
// @route   GET /api/leaves/my-leaves
// @access  Private
exports.getMyLeaves = async (req, res, next) => {
  try {
    const { status, leaveType, page = 1, limit = 10 } = req.query;
    const query = { employee: req.user.id };

    if (status && status !== 'all') {
      query.status = status;
    }
    if (leaveType && leaveType !== 'all') {
      query.leaveTypeCode = leaveType;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await LeaveRequest.countDocuments(query);

    const leaves = await LeaveRequest.find(query)
      .populate('leaveType', 'name code annualQuota')
      .populate('approver', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      leaves,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)) || 1,
        limit: parseInt(limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single leave request details
// @route   GET /api/leaves/:id
// @access  Private
exports.getLeaveDetails = async (req, res, next) => {
  try {
    const leave = await LeaveRequest.findById(req.params.id)
      .populate('employee', 'name email employeeId department jobTitle leaveBalances manager')
      .populate('leaveType', 'name code')
      .populate('approver', 'name email role');

    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found.' });
    }

    // Role-based visibility check
    const isOwner = leave.employee._id.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    const isAssignedManager =
      req.user.role === 'manager' &&
      leave.employee.manager &&
      leave.employee.manager.toString() === req.user.id;

    if (!isOwner && !isAdmin && !isAssignedManager) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this leave request.',
      });
    }

    res.status(200).json({
      success: true,
      leave,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Cancel a leave request
// @route   PUT /api/leaves/:id/cancel
// @access  Private (Owner or Admin)
exports.cancelLeave = async (req, res, next) => {
  try {
    const { reason = 'Cancelled by applicant' } = req.body;
    const leave = await LeaveRequest.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found.' });
    }

    const isOwner = leave.employee.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to cancel this leave request.',
      });
    }

    if (leave.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This leave request is already cancelled.',
      });
    }

    if (leave.status === 'rejected') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a leave request that has already been rejected.',
      });
    }

    const previousStatus = leave.status;

    // Rule 7: Restore balance if it was previously approved!
    if (previousStatus === 'approved') {
      await User.findByIdAndUpdate(leave.employee, {
        $inc: { [`leaveBalances.${leave.leaveTypeCode}`]: leave.daysCount },
      });
    }

    leave.status = 'cancelled';
    leave.cancelledAt = new Date();
    leave.cancellationReason = reason;
    await leave.save();

    await logAction({
      action: 'LEAVE_CANCELLED',
      performedBy: req.user.id,
      targetUser: leave.employee,
      targetLeave: leave._id,
      details: { previousStatus, daysRestored: previousStatus === 'approved' ? leave.daysCount : 0, reason },
      req,
    });

    res.status(200).json({
      success: true,
      message: previousStatus === 'approved'
        ? `Leave cancelled and ${leave.daysCount} day(s) restored to your balance.`
        : 'Pending leave request successfully cancelled.',
      leave,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get leave requests from assigned employees (Manager view)
// @route   GET /api/leaves/team-leaves
// @access  Private (Manager/Admin)
exports.getTeamLeaves = async (req, res, next) => {
  try {
    const { status, employeeId, leaveType, page = 1, limit = 10 } = req.query;

    let employeeFilter = {};
    if (req.user.role === 'manager') {
      // Find all employees assigned to this manager
      const teamEmployees = await User.find({ manager: req.user.id }).select('_id');
      const teamEmployeeIds = teamEmployees.map((e) => e._id);

      employeeFilter = { $in: teamEmployeeIds };
    }

    const query = {};
    if (req.user.role === 'manager') {
      query.employee = employeeFilter;
    } else if (employeeId) {
      query.employee = employeeId;
    }

    if (status && status !== 'all') {
      query.status = status;
    }
    if (leaveType && leaveType !== 'all') {
      query.leaveTypeCode = leaveType;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await LeaveRequest.countDocuments(query);

    const leaves = await LeaveRequest.find(query)
      .populate('employee', 'name email employeeId jobTitle department leaveBalances')
      .populate('leaveType', 'name code')
      .populate('approver', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      leaves,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)) || 1,
        limit: parseInt(limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Approve or reject leave application
// @route   PUT /api/leaves/:id/review
// @access  Private (Manager/Admin)
exports.reviewLeave = async (req, res, next) => {
  try {
    const { action, comments } = req.body; // action: 'approve' | 'reject'
    const leaveId = req.params.id;

    if (!action || !['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Please specify "approve" or "reject".',
      });
    }

    if (action === 'reject' && (!comments || comments.trim().length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'A comment or explanation is required when rejecting a leave request.',
      });
    }

    const leave = await LeaveRequest.findById(leaveId).populate('employee');
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found.' });
    }

    // Rule 10: Employees cannot approve their own leave requests!
    if (leave.employee._id.toString() === req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You cannot approve or review your own leave request.',
      });
    }

    // Rule 9: Managers can approve only assigned employees (Admin can approve all)
    if (req.user.role === 'manager') {
      if (!leave.employee.manager || leave.employee.manager.toString() !== req.user.id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You can only review requests for employees assigned directly to your team.',
        });
      }
    }

    // Rule 11 & 12: Atomic state transition check - must be 'pending'
    if (leave.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `This leave request is already marked as ${leave.status} and cannot be reviewed again.`,
      });
    }

    if (action === 'approve') {
      // Rule 8: Re-verify employee balance before deduction to prevent overdraft
      const currentEmployee = await User.findById(leave.employee._id);
      const availableBalance = currentEmployee.leaveBalances[leave.leaveTypeCode] ?? 0;

      if (availableBalance < leave.daysCount) {
        return res.status(400).json({
          success: false,
          message: `Cannot approve: Employee now has insufficient balance (${availableBalance} remaining vs ${leave.daysCount} requested).`,
        });
      }

      // Rule 6: Deduct balance upon approval!
      await User.findByIdAndUpdate(leave.employee._id, {
        $inc: { [`leaveBalances.${leave.leaveTypeCode}`]: -leave.daysCount },
      });

      leave.status = 'approved';
      leave.approver = req.user.id;
      leave.reviewer = req.user.id;
      leave.approverComment = comments || 'Approved';
      leave.reviewComments = comments || 'Approved';
      leave.decisionDate = new Date();
      leave.reviewDate = new Date();
      await leave.save();

      // Send notification to employee
      await Notification.create({
        recipient: leave.employee._id,
        sender: req.user.id,
        title: 'Leave Request Approved',
        message: `Your ${leave.daysCount}-day ${leave.leaveTypeName} application (${new Date(leave.startDate).toLocaleDateString()} - ${new Date(leave.endDate).toLocaleDateString()}) has been approved.`,
        type: 'leave_status',
        relatedLeave: leave._id,
      });

      await logAction({
        action: 'LEAVE_APPROVED',
        performedBy: req.user.id,
        targetUser: leave.employee._id,
        targetLeave: leave._id,
        details: { daysDeducted: leave.daysCount, comments },
        req,
      });

      return res.status(200).json({
        success: true,
        message: `Leave request approved. ${leave.daysCount} day(s) deducted from employee balance.`,
        leave,
      });
    } else {
      // Reject action
      leave.status = 'rejected';
      leave.approver = req.user.id;
      leave.reviewer = req.user.id;
      leave.approverComment = comments;
      leave.reviewComments = comments;
      leave.decisionDate = new Date();
      leave.reviewDate = new Date();
      await leave.save();

      // Rule 5: Balance is NOT deducted for rejected requests!
      // Send notification to employee
      await Notification.create({
        recipient: leave.employee._id,
        sender: req.user.id,
        title: 'Leave Request Rejected',
        message: `Your ${leave.leaveTypeName} request has been rejected. Reason: "${comments}"`,
        type: 'leave_status',
        relatedLeave: leave._id,
      });

      await logAction({
        action: 'LEAVE_REJECTED',
        performedBy: req.user.id,
        targetUser: leave.employee._id,
        targetLeave: leave._id,
        details: { comments },
        req,
      });

      return res.status(200).json({
        success: true,
        message: 'Leave request has been rejected.',
        leave,
      });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Get all leave requests across the company (Admin view)
// @route   GET /api/leaves/all
// @access  Private (Admin)
exports.getAllLeaves = async (req, res, next) => {
  try {
    const { status, leaveType, search, page = 1, limit = 15 } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }
    if (leaveType && leaveType !== 'all') {
      query.leaveTypeCode = leaveType;
    }

    if (search) {
      // Search by employee name or employeeId
      const matchingUsers = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { employeeId: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      }).select('_id');

      query.employee = { $in: matchingUsers.map((u) => u._id) };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await LeaveRequest.countDocuments(query);

    const leaves = await LeaveRequest.find(query)
      .populate('employee', 'name email employeeId department jobTitle')
      .populate('leaveType', 'name code')
      .populate('approver', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      leaves,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)) || 1,
        limit: parseInt(limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/leaves/stats
// @access  Private
exports.getLeaveStats = async (req, res, next) => {
  try {
    const userRole = req.user.role;
    const userId = req.user.id;

    if (userRole === 'employee') {
      const pendingCount = await LeaveRequest.countDocuments({ employee: userId, status: 'pending' });
      const approvedCount = await LeaveRequest.countDocuments({ employee: userId, status: 'approved' });
      const rejectedCount = await LeaveRequest.countDocuments({ employee: userId, status: 'rejected' });
      const cancelledCount = await LeaveRequest.countDocuments({ employee: userId, status: 'cancelled' });

      const user = await User.findById(userId);

      return res.status(200).json({
        success: true,
        stats: {
          pending: pendingCount,
          approved: approvedCount,
          rejected: rejectedCount,
          cancelled: cancelledCount,
          balances: user.leaveBalances,
        },
      });
    }

    if (userRole === 'manager') {
      const teamEmployees = await User.find({ manager: userId }).select('_id');
      const teamEmployeeIds = teamEmployees.map((e) => e._id);

      const pendingApprovals = await LeaveRequest.countDocuments({
        employee: { $in: teamEmployeeIds },
        status: 'pending',
      });
      const approvedTotal = await LeaveRequest.countDocuments({
        employee: { $in: teamEmployeeIds },
        status: 'approved',
      });
      const rejectedTotal = await LeaveRequest.countDocuments({
        employee: { $in: teamEmployeeIds },
        status: 'rejected',
      });

      return res.status(200).json({
        success: true,
        stats: {
          teamSize: teamEmployees.length,
          pendingApprovals,
          approvedTotal,
          rejectedTotal,
        },
      });
    }

    if (userRole === 'admin') {
      const totalEmployees = await User.countDocuments({ role: 'employee' });
      const totalManagers = await User.countDocuments({ role: 'manager' });
      const pendingRequests = await LeaveRequest.countDocuments({ status: 'pending' });
      const approvedLeaves = await LeaveRequest.countDocuments({ status: 'approved' });
      const rejectedRequests = await LeaveRequest.countDocuments({ status: 'rejected' });

      return res.status(200).json({
        success: true,
        stats: {
          totalEmployees,
          totalManagers,
          pendingRequests,
          approvedLeaves,
          rejectedRequests,
        },
      });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Get leave events for Calendar view
// @route   GET /api/leaves/calendar
// @access  Private
exports.getCalendarLeaves = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const query = { status: { $in: ['approved', 'pending'] } };

    if (req.user.role === 'employee') {
      query.employee = req.user.id;
    } else if (req.user.role === 'manager') {
      const teamEmployees = await User.find({ manager: req.user.id }).select('_id');
      const teamIds = teamEmployees.map((e) => e._id);
      teamIds.push(req.user.id); // Include manager's own leaves too
      query.employee = { $in: teamIds };
    }
    // Admin gets all approved/pending leaves

    const leaves = await LeaveRequest.find(query)
      .populate('employee', 'name email employeeId department')
      .populate('leaveType', 'name code')
      .sort({ startDate: 1 });

    res.status(200).json({
      success: true,
      leaves,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Direct PATCH approve endpoint
// @route   PATCH /api/leaves/:id/approve
// @access  Private (Manager/Admin)
exports.approveLeave = async (req, res, next) => {
  req.body.action = 'approve';
  return exports.reviewLeave(req, res, next);
};

// @desc    Direct PATCH reject endpoint
// @route   PATCH /api/leaves/:id/reject
// @access  Private (Manager/Admin)
exports.rejectLeave = async (req, res, next) => {
  req.body.action = 'reject';
  return exports.reviewLeave(req, res, next);
};

// @desc    General get leaves handler by role
// @route   GET /api/leaves
// @access  Private
exports.getLeaves = async (req, res, next) => {
  if (req.user.role === 'admin') {
    return exports.getAllLeaves(req, res, next);
  } else if (req.user.role === 'manager') {
    return exports.getTeamLeaves(req, res, next);
  } else {
    return exports.getMyLeaves(req, res, next);
  }
};

// @desc    Get leave balances with detailed quotas, used and pending counts
// @route   GET /api/leave-balances
// @access  Private
exports.getLeaveBalances = async (req, res, next) => {
  try {
    let targetEmployeeId = req.user.id;
    if ((req.user.role === 'admin' || req.user.role === 'manager') && req.query.employeeId) {
      targetEmployeeId = req.query.employeeId;
    }

    const employee = await User.findById(targetEmployeeId);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    const leaveTypes = await LeaveType.find({ isActive: true });

    // Calculate pending days per leave type
    const pendingLeaves = await LeaveRequest.find({
      employee: targetEmployeeId,
      status: 'pending',
    });

    const pendingMap = {};
    pendingLeaves.forEach((leave) => {
      pendingMap[leave.leaveTypeCode] = (pendingMap[leave.leaveTypeCode] || 0) + leave.daysCount;
    });

    const balances = leaveTypes.map((type) => {
      const available = employee.leaveBalances?.[type.code] ?? type.annualQuota;
      const pending = pendingMap[type.code] || 0;
      const used = Math.max(0, type.annualQuota - available);

      return {
        leaveType: {
          _id: type._id,
          name: type.name,
          code: type.code,
          isPaid: type.isPaid,
          annualQuota: type.annualQuota,
        },
        annualQuota: type.annualQuota,
        usedDays: used,
        pendingDays: pending,
        availableDays: available,
      };
    });

    res.status(200).json({
      success: true,
      employee: {
        _id: employee._id,
        name: employee.name,
        employeeId: employee.employeeId,
      },
      balances,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Secure document retrieval (Restricts to applicant, assigned manager, or admin)
// @route   GET /api/leaves/:id/document
// @access  Private
exports.getLeaveDocument = async (req, res, next) => {
  try {
    const path = require('path');
    const fs = require('fs');

    const leave = await LeaveRequest.findById(req.params.id).populate('employee');
    if (!leave || !leave.documentUrl) {
      return res.status(404).json({ success: false, message: 'Supporting document not found.' });
    }

    const isOwner = leave.employee._id.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    const isAssignedManager =
      req.user.role === 'manager' &&
      leave.employee.manager &&
      leave.employee.manager.toString() === req.user.id;

    if (!isOwner && !isAdmin && !isAssignedManager) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not authorized to view this supporting document.',
      });
    }

    // Extract filename from /uploads/doc-xyz.pdf
    const filename = path.basename(leave.documentUrl);
    const filePath = path.join(__dirname, '../../uploads', filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File on server could not be located.' });
    }

    res.sendFile(filePath);
  } catch (err) {
    next(err);
  }
};
