const mongoose = require('mongoose');

const leaveTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide leave type name'],
      unique: true,
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Please provide leave type code'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    annualQuota: {
      type: Number,
      required: [true, 'Please provide annual quota'],
      min: [0, 'Quota cannot be negative'],
      default: 12,
    },
    isPaid: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('LeaveType', leaveTypeSchema);
