const mongoose = require('mongoose');

const holidaySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide holiday name'],
      trim: true,
      maxlength: [100, 'Holiday name cannot exceed 100 characters'],
    },
    date: {
      type: Date,
      required: [true, 'Please provide holiday date'],
      unique: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Holiday', holidaySchema);
