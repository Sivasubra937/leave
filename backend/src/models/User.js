const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['employee', 'manager', 'admin'],
      default: 'employee',
    },
    employeeId: {
      type: String,
      unique: true,
      trim: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    jobTitle: {
      type: String,
      trim: true,
      default: 'Team Member',
    },
    designation: {
      type: String,
      trim: true,
      default: 'Team Member',
    },
    avatar: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    joinedDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    leaveBalances: {
      casual: {
        type: Number,
        default: 12,
        min: [0, 'Casual leave balance cannot be negative'],
      },
      sick: {
        type: Number,
        default: 10,
        min: [0, 'Sick leave balance cannot be negative'],
      },
      earned: {
        type: Number,
        default: 15,
        min: [0, 'Earned leave balance cannot be negative'],
      },
      unpaid: {
        type: Number,
        default: 30,
        min: [0, 'Unpaid leave balance cannot be negative'],
      },
      medical: {
        type: Number,
        default: 10,
        min: [0, 'Medical leave balance cannot be negative'],
      },
      onduty: {
        type: Number,
        default: 15,
        min: [0, 'On-duty leave balance cannot be negative'],
      },
      academic: {
        type: Number,
        default: 15,
        min: [0, 'Academic leave balance cannot be negative'],
      },
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
