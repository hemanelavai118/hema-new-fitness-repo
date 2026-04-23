const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  type: {
    type: String, // e.g., 'yoga', 'strength training', 'cardio'
    required: true,
  },
  trainer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  duration: {
    type: Number, // in minutes
    required: true,
  },
  scheduleDate: {
    type: Date,
    required: true,
  },
  startTime: {
    type: String, // format 'HH:MM'
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  capacity: {
    type: Number,
    required: true,
  },
  enrolledUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  price: {
    type: Number,
    required: true,
  },
  imageUrl: {
    type: String,
    default: '',
  }
}, { timestamps: true });

const Class = mongoose.model('Class', classSchema);
module.exports = Class;
