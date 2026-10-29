const User = require('../models/User');
const LeaveRequest = require('../models/LeaveRequest');
const { logAction } = require('../utils/auditLogger');

// @desc    Get all users with filters & pagination
// @route   GET /api/users
// @access  Private (Admin / Manager for team)
exports.getUsers = async (req, res, next) => {
  try {
    const { role, department, status, search, page = 1, limit = 10 } = req.query;
    const query = {};

    if (role && role !== 'all') query.role = role;
    if (department && department !== 'all') query.department = department;
    if (status && status !== 'all') query.status = status;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await User.countDocuments(query);

    const users = await User.find(query)
      .populate('department')
      .populate('manager', 'name email employeeId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      users,
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

// @desc    Get single user details
// @route   GET /api/users/:id
// @access  Private (Admin or Self or Assigned Manager)
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('department')
      .populate('manager', 'name email employeeId');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Fetch user recent leaves
    const recentLeaves = await LeaveRequest.find({ employee: user._id })
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      user,
      recentLeaves,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new user by Admin
// @route   POST /api/users
// @access  Private (Admin)
exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, department, manager, jobTitle, phone, leaveBalances } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email is already registered' });
    }

    const count = await User.countDocuments();
    const employeeId = `EMP${1000 + count + 1}`;

    const user = await User.create({
      name,
      email,
      password: password || 'Welcome@123',
      role: role || 'employee',
      employeeId,
      department: department || null,
      manager: manager || null,
      jobTitle: jobTitle || 'Team Member',
      phone: phone || '',
      leaveBalances: leaveBalances || {
        casual: 12,
        sick: 10,
        earned: 15,
        unpaid: 30,
      },
    });

    await logAction({
      action: 'USER_CREATED',
      performedBy: req.user.id,
      targetUser: user._id,
      details: { role: user.role, email: user.email },
      req,
    });

    res.status(201).json({
      success: true,
      message: 'User account created successfully',
      user,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user details by Admin
// @route   PUT /api/users/:id
// @access  Private (Admin)
exports.updateUser = async (req, res, next) => {
  try {
    const { name, email, role, department, manager, jobTitle, phone, status, leaveBalances } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (department !== undefined) user.department = department || null;
    if (manager !== undefined) user.manager = manager || null;
    if (jobTitle !== undefined) user.jobTitle = jobTitle;
    if (phone !== undefined) user.phone = phone;
    if (status) user.status = status;
    if (leaveBalances) user.leaveBalances = { ...user.leaveBalances, ...leaveBalances };

    await user.save();

    await logAction({
      action: 'USER_UPDATED',
      performedBy: req.user.id,
      targetUser: user._id,
      details: { role: user.role, status: user.status },
      req,
    });

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle or set user status (Active/Inactive)
// @route   PUT/PATCH /api/users/:id/status
// @access  Private (Admin)
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (req.body && req.body.status) {
      user.status = req.body.status;
    } else {
      user.status = user.status === 'active' ? 'inactive' : 'active';
    }
    await user.save();

    await logAction({
      action: user.status === 'active' ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
      performedBy: req.user.id,
      targetUser: user._id,
      details: { status: user.status },
      req,
    });

    res.status(200).json({
      success: true,
      message: `User status updated to ${user.status}`,
      user,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id or /api/employees/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user._id.toString() === req.user.id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account.' });
    }

    await User.findByIdAndDelete(req.params.id);

    await logAction({
      action: 'USER_DELETED',
      performedBy: req.user.id,
      details: { email: user.email, name: user.name, employeeId: user.employeeId },
      req,
    });

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all managers (for assignment dropdown)
// @route   GET /api/users/managers
// @access  Private
exports.getManagers = async (req, res, next) => {
  try {
    const managers = await User.find({ role: { $in: ['manager', 'admin'] }, status: 'active' })
      .select('name email employeeId role department')
      .populate('department', 'name code');

    res.status(200).json({
      success: true,
      managers,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get team members for logged in manager
// @route   GET /api/users/team-members
// @access  Private (Manager/Admin)
exports.getTeamMembers = async (req, res, next) => {
  try {
    const managerId = req.user.id;
    const members = await User.find({ manager: managerId })
      .populate('department', 'name code')
      .select('name email employeeId jobTitle leaveBalances status joinedDate phone');

    res.status(200).json({
      success: true,
      members,
    });
  } catch (err) {
    next(err);
  }
};
