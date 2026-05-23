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

    await Specialist.deleteMany({});
    console.log('Cleared existing specialists from database.');

    for (const specialist of specialists) {
      const slots = specialist.availableSlots;
      const specialistData = {
        name: specialist.name,
        specialization: specialist.category,
        experience: specialist.experience,
        availableSlots: slots,
        bio: 'Expert specialist in ' + specialist.category,
        initials: specialist.name.substring(0, 2).toUpperCase(),
        rating: 4.8,
        reviews: 100,
        appointmentModes: {
          inPerson: {
            enabled: true,
            price: 100,
            duration: '30 mins',
            slots: slots.slice(0, 3)
          },
          video: {
            enabled: true,
            price: 60,
            duration: '20 mins',
            slots: slots.slice(1, 4)
          },
          chat: {
            enabled: true,
            price: 30,
            duration: '15 mins',
            slots: slots.slice(Math.max(0, slots.length - 2), slots.length)
          }
        }
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
