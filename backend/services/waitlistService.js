const User = require('../models/User');

const getHoldThresholdMs = () => {
  if (process.env.NODE_ENV !== 'production') {
    // 1 minute hold in development/testing mode for snappy demo
    return 1 * 60 * 1000;
  }
  return 10 * 60 * 1000;
};

const reallocateSlot = async (specialistId, bookingDate, bookingTime) => {
  const pendingUsers = await User.find({
    'waitlistAppointments': {
      $elemMatch: {
        specialistId,
        bookingDate,
        bookingTime,
        status: 'pending'
      }
    }
  });

  if (pendingUsers.length === 0) return;

  let oldestUser = null;
  let oldestEntry = null;
  let oldestTime = Infinity;

  for (const u of pendingUsers) {
    for (const entry of u.waitlistAppointments) {
      if (
        entry.specialistId === specialistId &&
        entry.bookingDate === bookingDate &&
        entry.bookingTime === bookingTime &&
        entry.status === 'pending'
      ) {
        const t = new Date(entry.createdAt || entry.updatedAt || Date.now()).getTime();
        if (t < oldestTime) {
          oldestTime = t;
          oldestUser = u;
          oldestEntry = entry;
        }
      }
    }
  }

  if (oldestUser && oldestEntry) {
    oldestEntry.status = 'notified';
    oldestEntry.notifiedAt = new Date();
    await oldestUser.save();
    console.log(`[Waitlist] Slot reallocated to user ${oldestUser.name} (${oldestEntry._id})`);
    console.log(`[Notification] Instant notification (push/email/SMS) sent to ${oldestUser.name} (${oldestUser.email})`);
    console.log(`[Notification] Message: Slot with ${oldestEntry.specialistName} on ${oldestEntry.bookingDate} at ${oldestEntry.bookingTime} is yours! You have 10 minutes to claim it.`);
  }
};

const checkExpiredWaitlistHolds = async () => {
  try {
    const thresholdMs = getHoldThresholdMs();
    const expirationTime = new Date(Date.now() - thresholdMs);
    
    const users = await User.find({
      'waitlistAppointments': {
        $elemMatch: {
          status: 'notified',
          notifiedAt: { $lt: expirationTime }
        }
      }
    });

    for (const user of users) {
      let changed = false;
      
      for (const entry of user.waitlistAppointments) {
        if (entry.status === 'notified' && entry.notifiedAt < expirationTime) {
          entry.status = 'expired';
          changed = true;
          console.log(`[Waitlist] Hold expired for user ${user.name} on slot ${entry.bookingTime}`);
          
          // Reallocate this slot
          await reallocateSlot(entry.specialistId, entry.bookingDate, entry.bookingTime);
        }
      }
      
      if (changed) {
        await user.save();
      }
    }
  } catch (err) {
    console.error('[Waitlist] Expiration check failed:', err.message);
  }
};

module.exports = {
  checkExpiredWaitlistHolds,
  reallocateSlot
};
