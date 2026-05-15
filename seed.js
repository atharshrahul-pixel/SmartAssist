const mongoose = require('mongoose');
const env = require('./config/env');
const { specialists } = require('./data/mockData');
const Specialist = require('./models/Specialist');

const seedDatabase = async () => {
  console.log('Starting database seed...');
  
  try {
    await mongoose.connect(env.mongoDbUri);
    console.log('Connected to MongoDB.');

    // Wait for the model to be ready
    await Specialist.init();

    for (const specialist of specialists) {
      const specialistData = {
        name: specialist.name,
        specialization: specialist.category,
        experience: specialist.experience,
        availableSlots: specialist.availableSlots,
        bio: 'Expert specialist in ' + specialist.category,
        initials: specialist.name.substring(0, 2).toUpperCase(),
        rating: 4.8,
        reviews: 100
      };
      
      const doc = new Specialist(specialistData);
      await doc.save();
      console.log(`Added: ${specialist.name}`);
    }
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error.stack || error.message);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
};

seedDatabase();
