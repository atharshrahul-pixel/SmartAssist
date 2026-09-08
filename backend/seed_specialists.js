require('dotenv').config();
const mongoose = require('mongoose');
const Specialist = require('./models/Specialist');

const names = {
  Dentist: [
    'Dr. Robert Chen', 'Dr. Lisa Patel', 'Dr. David Miller', 'Dr. Karen Taylor',
    'Dr. James Wilson', 'Dr. Maria Garcia', 'Dr. William Davis', 'Dr. Ashley Johnson',
    'Dr. Michael Brown', 'Dr. Linda Martinez'
  ],
  Gym: [
    'Alex Rivera', 'Jordan Vance', 'Taylor Brooks', 'Morgan Croft',
    'Chris Evanson', 'Pat Kelly', 'Sam Jenkins', 'Casey Miller',
    'Robin Slater', 'Kelly Cooper'
  ],
  Physiotherapist: [
    'Dr. Sarah Adams', 'Dr. Brian Connolly', 'Dr. Jessica Vance', 'Dr. Andrew Wilde',
    'Dr. Emily Stone', 'Dr. Marcus Vance', 'Dr. Chloe Bennett', 'Dr. Ryan Fletcher',
    'Dr. Hannah Abbott', 'Dr. Tyler Vance'
  ],
  'General practitioner': [
    'Dr. John Smith', 'Dr. Susan Lopez', 'Dr. Thomas Wright', 'Dr. Nancy Carter',
    'Dr. Charles Foster', 'Dr. Helen Morris', 'Dr. Paul Harrison', 'Dr. Alice Rogers',
    'Dr. Steven Ward', 'Dr. Sandra Bell'
  ],
  Therapist: [
    'Dr. Rachel Green', 'Dr. Monica Geller', 'Dr. Joey Tribbiani', 'Dr. Phoebe Buffay',
    'Dr. Ross Geller', 'Dr. Chandler Bing', 'Dr. Gunther Smith', 'Dr. Janice Litman',
    'Dr. Mike Hannigan', 'Dr. Richard Burke'
  ]
};

const zips = [
  { zip: '10001', city: 'New York', state: 'NY' },
  { zip: '90210', city: 'Beverly Hills', state: 'CA' },
  { zip: '60611', city: 'Chicago', state: 'IL' },
  { zip: '77002', city: 'Houston', state: 'TX' },
  { zip: '33139', city: 'Miami Beach', state: 'FL' },
  { zip: '94102', city: 'San Francisco', state: 'CA' },
  { zip: '02108', city: 'Boston', state: 'MA' },
  { zip: '98101', city: 'Seattle', state: 'WA' },
  { zip: '30303', city: 'Atlanta', state: 'GA' },
  { zip: '75201', city: 'Dallas', state: 'TX' }
];

const streets = [
  'Broadway', 'Lexington Ave', 'Oak St', 'Main St', 'Ocean Dr',
  'Market St', 'Beacon St', 'Pine St', 'Peachtree St', 'Elm St'
];

const bios = {
  Dentist: 'Specialist in cosmetic dentistry, dental implants, oral hygiene, and teeth whitening.',
  Gym: 'Certified personal trainer focusing on strength conditioning, weight loss, and athletic performance.',
  Physiotherapist: 'Expert in rehabilitation, sports injury recovery, joint mobilization, and posture correction.',
  'General practitioner': 'Compassionate family medicine specialist offering comprehensive health consultations.',
  Therapist: 'Licensed counselor specializing in mental health support, anxiety management, and cognitive behavioral therapy.'
};

async function seed() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI missing');
    }
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    await Specialist.deleteMany({});
    console.log('Cleared specialists collection');

    const specialists = [];

    const categories = Object.keys(names);
    for (const category of categories) {
      const categoryNames = names[category];
      for (let i = 0; i < 10; i++) {
        const name = categoryNames[i];
        const zipObj = zips[i];
        const street = streets[i];
        const streetNum = Math.floor(Math.random() * 900) + 100;
        const address = `${streetNum} ${street}, ${zipObj.city}, ${zipObj.state} ${zipObj.zip}`;
        
        const inPersonPrice = Math.floor(Math.random() * 80) + 70; // 70 to 150
        const videoPrice = Math.floor(Math.random() * 40) + 40;    // 40 to 80
        const chatPrice = Math.floor(Math.random() * 20) + 15;     // 15 to 35

        const availableSlots = ['09:00 AM', '10:30 AM', '01:00 PM', '03:30 PM', '05:00 PM'];
        
        specialists.push({
          name,
          specialization: category,
          experience: `${Math.floor(Math.random() * 15) + 3} years`,
          bio: bios[category],
          initials: name.split(' ').map(n => n[0]).filter(c => c !== 'Dr.').join('').substring(0, 2).toUpperCase(),
          rating: parseFloat((4.0 + Math.random() * 1.0).toFixed(1)),
          reviews: Math.floor(Math.random() * 120) + 10,
          licenseNumber: `LIC-${category.toUpperCase().substring(0, 3)}-${100000 + i + Math.floor(Math.random() * 900000)}`,
          status: 'approved',
          clinicName: `${category} Care Center`,
          address,
          appointmentModes: {
            inPerson: {
              enabled: true,
              price: inPersonPrice,
              duration: '30 mins',
              slots: availableSlots
            },
            video: {
              enabled: true,
              price: videoPrice,
              duration: '20 mins',
              slots: availableSlots
            },
            chat: {
              enabled: true,
              price: chatPrice,
              duration: '15 mins',
              slots: availableSlots
            }
          }
        });
      }
    }

    await Specialist.insertMany(specialists);
    console.log('Seeded 50 specialists successfully');

    await mongoose.disconnect();
    console.log('Disconnected');
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
