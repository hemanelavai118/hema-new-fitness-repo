const Class = require('../models/Class');

// Create new class
const createClass = async (req, res) => {
  try {
    const { title, description, type, duration, scheduleDate, startTime, endTime, capacity, price, imageUrl, trainerId } = req.body;

    const newClass = await Class.create({
      title,
      description,
      type,
      trainer: (req.user.role === 'admin' && trainerId) ? trainerId : req.user._id,
      duration,
      scheduleDate,
      startTime,
      endTime,
      capacity,
      price,
      imageUrl
    });

    res.status(201).json(newClass);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all classes (with filters)
const getClasses = async (req, res) => {
  try {
    const { type, minDuration, maxDuration, date } = req.query;
    
    let query = {};
    
    if (type) query.type = { $regex: type, $options: 'i' };
    if (date) query.scheduleDate = { $gte: new Date(date), $lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1)) };
    
    if (minDuration || maxDuration) {
      query.duration = {};
      if (minDuration) query.duration.$gte = Number(minDuration);
      if (maxDuration) query.duration.$lte = Number(maxDuration);
    }

    const classes = await Class.find(query).populate('trainer', 'name email');
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get class by id
const getClassById = async (req, res) => {
  try {
    const fitnessClass = await Class.findById(req.params.id).populate('trainer', 'name email');
    if (!fitnessClass) {
      return res.status(404).json({ message: 'Class not found' });
    }
    res.json(fitnessClass);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update class
const updateClass = async (req, res) => {
  try {
    const fitnessClass = await Class.findById(req.params.id);

    if (!fitnessClass) {
      return res.status(404).json({ message: 'Class not found' });
    }

    if (fitnessClass.trainer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to update this class' });
    }

    const updatedClass = await Class.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedClass);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete class
const deleteClass = async (req, res) => {
  try {
    const fitnessClass = await Class.findById(req.params.id);

    if (!fitnessClass) {
      return res.status(404).json({ message: 'Class not found' });
    }

    if (fitnessClass.trainer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to delete this class' });
    }

    await Class.findByIdAndDelete(req.params.id);
    res.json({ message: 'Class removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get classes created by the logged-in trainer
const getMyClasses = async (req, res) => {
  try {
    const classes = await Class.find({ trainer: req.user._id }).populate('trainer', 'name email');
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createClass, getClasses, getClassById, getMyClasses, updateClass, deleteClass };
