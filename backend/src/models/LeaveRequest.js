const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Leave request must have an employee'],
    },
    leaveType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LeaveType',
      required: [true, 'Please select a leave type'],
    },
    leaveTypeCode: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    leaveTypeName: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Please provide start date'],
    },
    endDate: {
      type: Date,
      required: [true, 'Please provide end date'],
    },
    daysCount: {
      type: Number,
      required: [true, 'Number of leave days is required'],
      min: [1, 'Leave duration must be at least 1 working day'],
    },
    reason: {
      type: String,
      required: [true, 'Please provide a reason for the leave'],
      trim: true,
      minlength: [5, 'Reason must be at least 5 characters'],
      maxlength: [500, 'Reason cannot exceed 500 characters'],
    },
    documentUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled'],
      default: 'pending',
    },
    approver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    approverComment: {
      type: String,
      trim: true,
      default: '',
    },
    reviewComments: {
      type: String,
      trim: true,
      default: '',
    },
    decisionDate: {
      type: Date,
      default: null,
    },
    reviewDate: {
      type: Date,
      default: null,
    },
    submissionDate: {
      type: Date,
      default: Date.now,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    cancellationReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast lookup
leaveRequestSchema.index({ employee: 1, status: 1 });
leaveRequestSchema.index({ startDate: 1, endDate: 1 });

module.exports = mongoose.model('LeaveRequest', leaveRequestSchema);
