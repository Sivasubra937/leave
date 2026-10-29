const Department = require('../models/Department');
const User = require('../models/User');

// @desc    Get all departments
// @route   GET /api/departments
// @access  Private
exports.getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find().populate('head', 'name email employeeId');
    res.status(200).json({ success: true, departments });
  } catch (err) {
    next(err);
  }
};

// @desc    Create department
// @route   POST /api/departments
// @access  Private (Admin)
exports.createDepartment = async (req, res, next) => {
  try {
    const { name, code, description, head } = req.body;

    const existing = await Department.findOne({ $or: [{ name }, { code }] });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A department with that name or code already exists.',
      });
    }

    const department = await Department.create({
      name,
      code,
      description,
      head: head || null,
    });

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      department,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update department
// @route   PUT /api/departments/:id
// @access  Private (Admin)
exports.updateDepartment = async (req, res, next) => {
  try {
    const { name, code, description, head } = req.body;

    const department = await Department.findByIdAndUpdate(
      req.params.id,
      { name, code, description, head: head || null },
      { new: true, runValidators: true }
    );

    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Department updated successfully',
      department,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete department
// @route   DELETE /api/departments/:id
// @access  Private (Admin)
exports.deleteDepartment = async (req, res, next) => {
  try {
    const userCount = await User.countDocuments({ department: req.params.id });
    if (userCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete department: ${userCount} employee(s) are currently assigned to it. Reassign employees first.`,
      });
    }

    await Department.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Department deleted successfully' });
  } catch (err) {
    next(err);
  }
};
