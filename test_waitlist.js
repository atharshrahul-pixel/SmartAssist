const Module = require('module');
const originalRequire = Module.prototype.require;

// In-memory stores
const dbStores = {
  User: [],
  Booking: [],
  Specialist: []
};

const mockMongoose = {
  connect: async () => console.log('Mocked MongoDB connected'),
  disconnect: async () => console.log('Mocked MongoDB disconnected'),
  Schema: function() {
    this.plugin = () => {};
  },
  model: function(name) {
    return mockMongoose[name] || createMockModel(name);
  }
};
mockMongoose.Schema.Types = { ObjectId: String };

function createMockModel(name) {
  const store = dbStores[name] || [];
  dbStores[name] = store;

  class MockModel {
    constructor(data) {
      Object.assign(this, data);
      this._id = data._id || 'mock_' + name.toLowerCase() + '_' + Math.random().toString(36).substring(2, 9);
      if (!this.createdAt) this.createdAt = new Date();
      if (!this.updatedAt) this.updatedAt = new Date();
      if (data.waitlistAppointments) {
        this.waitlistAppointments = data.waitlistAppointments.map(w => ({
          _id: w._id || 'mock_w_id_' + Math.random().toString(36).substring(2, 9),
          ...w
        }));
      } else {
        this.waitlistAppointments = [];
      }
    }

    async save() {
      const idx = store.findIndex(item => item._id.toString() === this._id.toString());
      if (idx >= 0) {
        store[idx] = this;
      } else {
        store.push(this);
      }
      return this;
    }

    static async create(data) {
      const instance = new MockModel(data);
      await instance.save();
      return instance;
    }

    static find(query) {
      const results = store.filter(item => {
        if (!query) return true;
        
        // Match waitlistAppointments
        if (query['waitlistAppointments']) {
          const match = query['waitlistAppointments'].$elemMatch;
          if (match) {
            return item.waitlistAppointments && item.waitlistAppointments.some(entry => {
              let ok = true;
              if (match.specialistId && entry.specialistId !== match.specialistId) ok = false;
              if (match.bookingDate && entry.bookingDate !== match.bookingDate) ok = false;
              if (match.bookingTime && entry.bookingTime !== match.bookingTime) ok = false;
              if (match.status && entry.status !== match.status) ok = false;
              if (match.notifiedAt && match.notifiedAt.$lt) {
                if (!entry.notifiedAt || entry.notifiedAt >= match.notifiedAt.$lt) ok = false;
              }
              return ok;
            });
          }
        }
        
        // Match user email
        if (query.email) {
          if (query.email.$in) {
            return query.email.$in.includes(item.email);
          }
          return item.email === query.email;
        }

        // Match booking occupied slots
        if (query.specialistId && item.specialistId !== query.specialistId) return false;
        if (query.bookingDate && item.bookingDate !== query.bookingDate) return false;
        if (query.status && item.status !== query.status) return false;
        if (query.userEmail && item.userEmail !== query.userEmail) return false;

        return true;
      });

      const queryObj = {
        sort: () => queryObj,
        lean: () => JSON.parse(JSON.stringify(results)),
        then: (resolve) => resolve(results.map(item => new MockModel(item)))
      };
      queryObj[Symbol.toStringTag] = 'Promise';
      return queryObj;
    }

    static findById(id) {
      if (!id) {
        const queryObj = {
          lean: () => null,
          then: (resolve) => resolve(null)
        };
        queryObj[Symbol.toStringTag] = 'Promise';
        return queryObj;
      }
      
      const found = store.find(item => item._id.toString() === id.toString());
      const queryObj = {
        lean: () => found ? JSON.parse(JSON.stringify(found)) : null,
        then: (resolve) => resolve(found ? new MockModel(found) : null)
      };
      queryObj[Symbol.toStringTag] = 'Promise';
      return queryObj;
    }

    static async findByIdAndUpdate(id, data, options) {
      const found = await MockModel.findById(id);
      if (found) {
        Object.assign(found, data);
        await found.save();
        return found;
      }
      return null;
    }

    static async findByIdAndDelete(id) {
      const idx = store.findIndex(item => item._id.toString() === id.toString());
      if (idx >= 0) {
        const deleted = store[idx];
        store.splice(idx, 1);
        return deleted;
      }
      return null;
    }

    static async deleteMany(query) {
      if (!query || Object.keys(query).length === 0) {
        store.length = 0;
        return;
      }
      if (query.email && query.email.$in) {
        const emails = query.email.$in;
        const filtered = store.filter(item => !emails.includes(item.email));
        store.length = 0;
        store.push(...filtered);
      }
      if (query.userEmail) {
        const filtered = store.filter(item => item.userEmail !== query.userEmail);
        store.length = 0;
        store.push(...filtered);
      }
      if (query._id) {
        const filtered = store.filter(item => item._id.toString() !== query._id.toString());
        store.length = 0;
        store.push(...filtered);
      }
    }
  }

  mockMongoose[name] = MockModel;
  return MockModel;
}

// Intercept require
Module.prototype.require = function(id) {
  if (id === 'mongoose') {
    return mockMongoose;
  }
  return originalRequire.apply(this, arguments);
};

// Now import the rest
const User = require('./models/User');
const Booking = require('./models/Booking');
const { reallocateSlot, checkExpiredWaitlistHolds } = require('./services/waitlistService');
const { createBooking } = require('./services/bookingService');
const { deleteBooking } = require('./services/adminService');

const runTest = async () => {
  console.log('Connecting to database (mock)...');
  
  // Clean test databases
  await User.deleteMany({ email: { $in: ['test1@example.com', 'test2@example.com'] } });
  await Booking.deleteMany({ userEmail: 'current@example.com' });

  // Create mock specialist id and info
  const specialistId = 'spec_test_123';
  const specialistName = 'Dr. Test Dentist';
  const date = 'Oct 15, 2024';
  const time = '09:00 AM';

  // 1. Create waitlist users
  console.log('Creating waitlist users...');
  const user1 = await User.create({
    name: 'Waitlist User 1',
    email: 'test1@example.com',
    password: 'password123',
    waitlistAppointments: [{
      specialistId,
      specialistName,
      bookingDate: date,
      bookingTime: time,
      status: 'pending',
      createdAt: new Date(Date.now() - 5000) // 5 seconds older
    }]
  });

  const user2 = await User.create({
    name: 'Waitlist User 2',
    email: 'test2@example.com',
    password: 'password123',
    waitlistAppointments: [{
      specialistId,
      specialistName,
      bookingDate: date,
      bookingTime: time,
      status: 'pending',
      createdAt: new Date()
    }]
  });

  // 2. Create the current booking for that slot
  console.log('Creating current booking...');
  const Specialist = require('./models/Specialist');
  await Specialist.deleteMany({ _id: specialistId });
  await Specialist.create({
    _id: specialistId,
    name: specialistName,
    specialization: 'Dentist',
    availableSlots: [time],
    bio: 'Test Doctor',
    initials: 'DT'
  });

  const booking = await createBooking({
    userName: 'Current User',
    userEmail: 'current@example.com',
    specialistId,
    bookingDate: date,
    bookingTime: time
  });
  console.log('Booking created:', booking.id);

  // 3. Trigger reallocation by deleting booking
  console.log('Deleting booking to trigger reallocation...');
  await deleteBooking(booking.id);
  await reallocateSlot(specialistId, date, time);

  // 4. Verify user 1 is notified, user 2 is still pending
  console.log('Verifying reallocation...');
  const updatedUser1 = await User.findById(user1._id);
  const updatedUser2 = await User.findById(user2._id);

  const entry1 = updatedUser1.waitlistAppointments[0];
  const entry2 = updatedUser2.waitlistAppointments[0];

  console.log(`User 1 waitlist status: ${entry1.status} (expected: notified)`);
  console.log(`User 2 waitlist status: ${entry2.status} (expected: pending)`);

  if (entry1.status !== 'notified' || entry2.status !== 'pending') {
    throw new Error('Reallocation logic failed!');
  }

  // 5. Simulate expiration of user 1's hold
  console.log('Simulating hold expiration for User 1...');
  // Set notifiedAt to 2 minutes ago (development threshold is 1 minute)
  entry1.notifiedAt = new Date(Date.now() - 2 * 60 * 1000);
  await updatedUser1.save();

  // Run the expiration cron check
  await checkExpiredWaitlistHolds();

  // 6. Verify user 1 is expired, user 2 is now notified
  console.log('Verifying expiration and reallocation to User 2...');
  const finalUser1 = await User.findById(user1._id);
  const finalUser2 = await User.findById(user2._id);

  const finalEntry1 = finalUser1.waitlistAppointments[0];
  const finalEntry2 = finalUser2.waitlistAppointments[0];

  console.log(`User 1 final status: ${finalEntry1.status} (expected: expired)`);
  console.log(`User 2 final status: ${finalEntry2.status} (expected: notified)`);

  if (finalEntry1.status !== 'expired' || finalEntry2.status !== 'notified') {
    throw new Error('Expiration reallocation logic failed!');
  }

  console.log('ALL TESTS PASSED SUCCESSFULLY!');
};

runTest().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
