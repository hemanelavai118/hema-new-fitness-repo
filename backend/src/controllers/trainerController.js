const TrainerProfile = require('../models/TrainerProfile');

// Create or update trainer profile
const upsertTrainerProfile = async (req, res) => {
  try {
    const { qualifications, expertise, specialization, photoUrl, videoUrl, introductoryMessage } = req.body;

    let profile = await TrainerProfile.findOne({ user: req.user._id });

    if (profile) {
      // Update
      profile.qualifications = qualifications || profile.qualifications;
      profile.expertise = expertise || profile.expertise;
      profile.specialization = specialization || profile.specialization;
      profile.photoUrl = photoUrl || profile.photoUrl;
      profile.videoUrl = videoUrl || profile.videoUrl;
      profile.introductoryMessage = introductoryMessage || profile.introductoryMessage;
      
      const updatedProfile = await profile.save();
      return res.json(updatedProfile);
    } else {
      // Create
      profile = await TrainerProfile.create({
        user: req.user._id,
        qualifications,
        expertise,
        specialization,
        photoUrl,
        videoUrl,
        introductoryMessage
      });
      return res.status(201).json(profile);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyProfile = async (req, res) => {
  try {
    const profile = await TrainerProfile.findOne({ user: req.user._id }).populate('user', 'name email');
    // Return null with 200 if no profile yet — new trainers should see a blank form, not a 404
    res.json(profile || null);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all trainer profiles (for exploring)
const getTrackers = async (req, res) => {
  try {
    const trainers = await TrainerProfile.find({}).populate('user', 'name email');
    res.json(trainers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get trainer by id
const getTrainerById = async (req, res) => {
  try {
    const trainer = await TrainerProfile.findById(req.params.id).populate('user', 'name email');
    if (!trainer) {
      return res.status(404).json({ message: 'Trainer not found' });
    }
    res.json(trainer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { upsertTrainerProfile, getMyProfile, getTrackers, getTrainerById };
