const mongoose = require('mongoose');

const leaveBalanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Leave balance must be associated with an employee'],
    },
    leaveType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LeaveType',
      required: [true, 'Leave balance must be associated with a leave type'],
    },
    year: {
      type: Number,
      required: true,
      default: () => new Date().getFullYear(),
    },
    annualQuota: {
      type: Number,
      required: true,
      min: [0, 'Annual quota cannot be negative'],
      default: 0,
    },
    usedDays: {
      type: Number,
      default: 0,
      min: [0, 'Used days cannot be negative'],
    },
    pendingDays: {
      type: Number,
      default: 0,
      min: [0, 'Pending days cannot be negative'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

leaveBalanceSchema.virtual('availableDays').get(function () {
  return Math.max(0, this.annualQuota - this.usedDays);
});

leaveBalanceSchema.index({ employee: 1, leaveType: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('LeaveBalance', leaveBalanceSchema);
