const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { logAction } = require('../utils/auditLogger');

// Generate JWT token
const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'supersecretlmsjwtkeycollegeproject2026',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  const userData = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    employeeId: user.employeeId,
    department: user.department,
    manager: user.manager,
    jobTitle: user.jobTitle,
    phone: user.phone,
    status: user.status,
    leaveBalances: user.leaveBalances,
    joinedDate: user.joinedDate,
  };

  res.status(statusCode).json({
    success: true,
    message,
    token,
    user: userData,
  });
};

// @desc    Register a new user (employee)
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, department, phone, jobTitle } = req.body;

    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    // Auto-generate employeeId if not provided (e.g. EMP1005)
    const count = await User.countDocuments();
    const employeeId = `EMP${1000 + count + 1}`;

    const user = await User.create({
      name,
      email,
      password,
      employeeId,
      department: department || null,
      phone: phone || '',
      jobTitle: jobTitle || 'Team Member',
      role: 'employee', // Self-registration always creates 'employee' role for security
      leaveBalances: {
        casual: 12,
        sick: 10,
        earned: 15,
        unpaid: 30,
      },
    });

    await logAction({
      action: 'USER_REGISTERED',
      performedBy: user._id,
      targetUser: user._id,
      details: { email: user.email, employeeId: user.employeeId },
      req,
    });

    sendTokenResponse(user, 201, res, 'Registration successful. Welcome to LMS!');
  } catch (err) {
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    // Explicitly select password since it has select: false
    const user = await User.findOne({ email }).select('+password').populate('department').populate('manager', 'name email');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({
        success: false,
        message: 'Your account is deactivated. Please contact an administrator.',
      });
    }

    await logAction({
      action: 'USER_LOGIN',
      performedBy: user._id,
      details: { email: user.email, role: user.role },
      req,
    });

    sendTokenResponse(user, 200, res, `Welcome back, ${user.name}!`);
  } catch (err) {
    next(err);
  }
};

// @desc    Get currently logged in user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('department')
      .populate('manager', 'name email role employeeId');

    res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update current user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, jobTitle } = req.body;

    const fieldsToUpdate = {};
    if (name) fieldsToUpdate.name = name;
    if (phone !== undefined) fieldsToUpdate.phone = phone;
    if (jobTitle !== undefined) fieldsToUpdate.jobTitle = jobTitle;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      fieldsToUpdate,
      { new: true, runValidators: true }
    ).populate('department').populate('manager', 'name email');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Change user password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current and new password.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters.',
      });
    }

    const user = await User.findById(req.user.id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password does not match.',
      });
    }

    user.password = newPassword;
    await user.save();

    await logAction({
      action: 'PASSWORD_CHANGED',
      performedBy: user._id,
      details: { email: user.email },
      req,
    });

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (err) {
    next(err);
  }
};
