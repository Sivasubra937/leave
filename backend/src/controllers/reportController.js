const LeaveRequest = require('../models/LeaveRequest');
const User = require('../models/User');
const Department = require('../models/Department');
const AuditLog = require('../models/AuditLog');

// @desc    Get comprehensive analytics & charts data for Admin & Manager
// @route   GET /api/reports/analytics
// @access  Private (Admin / Manager)
exports.getAnalytics = async (req, res, next) => {
  try {
    // 1. Leave requests distribution by Leave Type (Casual, Sick, Earned, Unpaid)
    const typeDistribution = await LeaveRequest.aggregate([
      { $match: { status: 'approved' } },
      {
        $group: {
          _id: '$leaveTypeName',
          code: { $first: '$leaveTypeCode' },
          totalDays: { $sum: '$daysCount' },
          count: { $sum: 1 },
        },
      },
    ]);

    // 2. Status distribution (Approved, Rejected, Pending, Cancelled)
    const statusDistribution = await LeaveRequest.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalDays: { $sum: '$daysCount' },
        },
      },
    ]);

    // 3. Department-wise approved leaves
    const departments = await Department.find();
    const deptStats = [];

    for (const dept of departments) {
      const deptEmployees = await User.find({ department: dept._id }).select('_id');
      const empIds = deptEmployees.map((e) => e._id);

      const approvedDays = await LeaveRequest.aggregate([
        {
          $match: {
            employee: { $in: empIds },
            status: 'approved',
          },
        },
        { $group: { _id: null, totalDays: { $sum: '$daysCount' }, count: { $sum: 1 } } },
      ]);

      deptStats.push({
        department: dept.name,
        code: dept.code,
        employeeCount: deptEmployees.length,
        totalLeaveDays: approvedDays[0]?.totalDays || 0,
        requestsCount: approvedDays[0]?.count || 0,
      });
    }

    // 4. Monthly leave trend for current year
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

    const monthlyAggregation = await LeaveRequest.aggregate([
      {
        $match: {
          startDate: { $gte: startOfYear, $lte: endOfYear },
        },
      },
      {
        $group: {
          _id: { month: { $month: '$startDate' }, status: '$status' },
          count: { $sum: 1 },
          days: { $sum: '$daysCount' },
        },
      },
    ]);

    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];

    const monthlyTrends = months.map((name, index) => {
      const monthNum = index + 1;
      const approved = monthlyAggregation.find(
        (m) => m._id.month === monthNum && m._id.status === 'approved'
      );
      const pending = monthlyAggregation.find(
        (m) => m._id.month === monthNum && m._id.status === 'pending'
      );
      const rejected = monthlyAggregation.find(
        (m) => m._id.month === monthNum && m._id.status === 'rejected'
      );

      return {
        month: name,
        approved: approved?.days || 0,
        pending: pending?.days || 0,
        rejected: rejected?.days || 0,
      };
    });

    res.status(200).json({
      success: true,
      analytics: {
        typeDistribution,
        statusDistribution,
        deptStats,
        monthlyTrends,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get system audit trail
// @route   GET /api/reports/audit-logs
// @access  Private (Admin)
exports.getAuditLogs = async (req, res, next) => {
  try {
    const { action, page = 1, limit = 20 } = req.query;
    const query = {};

    if (action && action !== 'all') {
      query.action = action;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await AuditLog.countDocuments(query);

    const logs = await AuditLog.find(query)
      .populate('performedBy', 'name email role employeeId')
      .populate('targetUser', 'name email employeeId')
      .populate('targetLeave', 'leaveTypeName daysCount status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      logs,
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
