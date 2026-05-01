const User = require('../models/User');
const TrainerProfile = require('../models/TrainerProfile');
const Class = require('../models/Class');
const mongoose = require('mongoose');

const seedData = async () => {
  try {
    // Clear existing data (optional, but good for demo consistency)
    // await User.deleteMany({});
    // await TrainerProfile.deleteMany({});
    // await Class.deleteMany({});

    const demoUsers = [
      {
        name: 'Demo User',
        email: 'user@example.com',
        password: 'password123',
        role: 'user',
        fitnessGoals: ['Weight Loss', 'Muscle Gain'],
        preferences: ['Yoga', 'Cardio']
      },
      {
        name: 'Demo Mentor',
        email: 'mentor@example.com',
        password: 'password123',
        role: 'trainer',
      },
      {
        name: 'System Admin',
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin',
      }
    ];

    for (const u of demoUsers) {
      const exists = await User.findOne({ email: u.email });
      if (!exists) {
        const user = await User.create(u);
        console.log(`Created user: ${u.email}`);
        
        if (user.role === 'trainer') {
          const profileExists = await TrainerProfile.findOne({ user: user._id });
          if (!profileExists) {
            await TrainerProfile.create({
              user: user._id,
              specialization: ['HIIT', 'Yoga', 'Strength Training'],
              qualifications: ['Certified Personal Trainer', 'Nutrition Specialist'],
              expertise: ['Fat Loss', 'Muscle Building'],
              introductoryMessage: 'Hello! I am your demo mentor. Let\'s get fit together!',
              rating: 5,
            });
            console.log(`Created trainer profile for: ${u.email}`);
          }

          const classExists = await Class.findOne({ title: 'Demo Mentor HIIT Session', trainer: user._id });
          if (!classExists) {
            await Class.create({
              title: 'Demo Mentor HIIT Session',
              description: 'A high-energy demo class led by your mentor. Perfect for getting started with fitness routines.',
              type: 'HIIT',
              trainer: user._id,
              duration: 60,
              scheduleDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
              startTime: '10:00',
              endTime: '11:00',
              capacity: 15,
              enrolledUsers: [],
              price: 25,
              imageUrl: '',
            });
            console.log(`Created demo class for: ${u.email}`);
          }
        }
      } else {
        console.log(`User already exists: ${u.email}`);
      }
    }

    console.log('Seed completed successfully');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
};

module.exports = seedData;
