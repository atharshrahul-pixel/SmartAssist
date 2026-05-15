const specialists = [
  {
    id: 'dentist-001',
    name: 'Dr. Ananya Raman',
    category: 'Dentist',
    experience: '8 years',
    availableSlots: ['09:30 AM', '11:00 AM', '02:30 PM', '05:00 PM'],
  },
  {
    id: 'dentist-002',
    name: 'Dr. Vikram Mehta',
    category: 'Dentist',
    experience: '11 years',
    availableSlots: ['10:00 AM', '12:30 PM', '04:00 PM'],
  },
  {
    id: 'physio-001',
    name: 'Priya Natarajan',
    category: 'Physiotherapist',
    experience: '7 years',
    availableSlots: ['08:30 AM', '10:30 AM', '03:00 PM', '06:00 PM'],
  },
  {
    id: 'physio-002',
    name: 'Arjun Kapoor',
    category: 'Physiotherapist',
    experience: '9 years',
    availableSlots: ['09:00 AM', '01:00 PM', '04:30 PM'],
  },
  {
    id: 'gym-001',
    name: 'Rahul Menon',
    category: 'Gym Trainer',
    experience: '6 years',
    availableSlots: ['06:30 AM', '07:30 AM', '05:30 PM', '07:00 PM'],
  },
  {
    id: 'gym-002',
    name: 'Neha Sharma',
    category: 'Gym Trainer',
    experience: '5 years',
    availableSlots: ['06:00 AM', '08:00 AM', '06:00 PM'],
  },
  {
    id: 'salon-001',
    name: 'Meera Joseph',
    category: 'Salon Specialist',
    experience: '10 years',
    availableSlots: ['10:00 AM', '12:00 PM', '03:30 PM', '06:30 PM'],
  },
  {
    id: 'salon-002',
    name: 'Kabir Ali',
    category: 'Salon Specialist',
    experience: '4 years',
    availableSlots: ['11:30 AM', '02:00 PM', '05:00 PM'],
  },
];

const bookings = [];

module.exports = {
  bookings,
  specialists,
};
