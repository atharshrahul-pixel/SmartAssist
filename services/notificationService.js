const { Resend } = require('resend');
const Booking = require('../models/Booking');
const User = require('../models/User');

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const getPrepInstructions = (category, mode) => {
  let instructions = [];
  if (category === 'Dentist') {
    instructions.push("Don't eat or drink 2 hours before your appointment.");
  } else if (category === 'Physiotherapist') {
    instructions.push("Wear comfortable, loose clothing.");
  }
  
  if (mode && mode.toLowerCase().includes('video')) {
    instructions.push("Test your camera and microphone before joining.");
  }
  
  return instructions.length > 0 ? `Prep Instructions: ${instructions.join(' ')}` : '';
};

const sendNotification = async ({ email, phone, subject, body, userId, channel }) => {
  let emailEnabled = true;
  let smsEnabled = true;
  
  if (userId) {
    try {
      const user = await User.findById(userId);
      if (user && user.notificationPreferences) {
        emailEnabled = user.notificationPreferences.email !== false;
        smsEnabled = user.notificationPreferences.sms !== false;
      }
    } catch (err) {
      console.error(`[Notification Service] Error fetching user preferences:`, err);
    }
  }

  if (channel === 'email' && emailEnabled) {
    console.log(`[Notification Service] Sending Email to ${email} | Subject: ${subject} | Body: ${body}`);
    if (resend) {
      try {
        await resend.emails.send({
          from: 'SmartAssist <notifications@resend.dev>',
          to: email,
          subject: subject,
          text: body
        });
      } catch (err) {
        console.error(`[Notification Service] Failed to send email via Resend:`, err);
      }
    }
  } else if (channel === 'sms' && smsEnabled) {
    console.log(`[Notification Service] Sending SMS to ${phone || 'user'} | Body: ${body}`);
  }
};

const sendSpecialistSummaryEmail = async (booking) => {
  try {
    const Specialist = require('../models/Specialist');
    const specialist = await Specialist.findById(booking.specialistId).populate('userId');
    const specialistEmail = specialist?.userId?.email;
    
    if (!specialistEmail) {
      console.log(`[Notification Service] Specialist email not found for ID: ${booking.specialistId}`);
      return;
    }
    
    console.log(`[Notification Service] Generating and sending AI Pre-Visit summary email to specialist: ${specialistEmail}`);
    
    const { generatePreVisitSummaryPDF } = require('./pdfService');
    let userProfile = null;
    if (booking.userId) {
      userProfile = await User.findById(booking.userId);
    }
    
    const pdfBuffer = await generatePreVisitSummaryPDF(booking, userProfile);
    
    if (resend) {
      await resend.emails.send({
        from: 'SmartAssist <notifications@resend.dev>',
        to: specialistEmail,
        subject: `AI Pre-Visit Case Summary - ${booking.bookedFor || booking.userName}`,
        text: `Hello ${booking.specialistName || 'Specialist'},\n\nAttached is the AI pre-visit case summary for your upcoming appointment with ${booking.bookedFor || booking.userName} at ${booking.bookingTime}.\n\nBest regards,\nSmartAssist Team`,
        attachments: [
          {
            filename: `summary-${booking.receiptId}.pdf`,
            content: pdfBuffer
          }
        ]
      });
      console.log(`[Notification Service] Successfully emailed summary to ${specialistEmail}`);
    } else {
      console.log(`[Notification Service] Mock Email attachment sent to ${specialistEmail} (Resend not configured)`);
    }
  } catch (err) {
    console.error(`[Notification Service] Error emailing specialist summary:`, err);
  }
};

const runNotificationCheck = async () => {
  try {
    const bookings = await Booking.find({ status: 'confirmed' });
    const now = new Date();
    
    for (const booking of bookings) {
      const bDate = new Date(`${booking.bookingDate} ${booking.bookingTime}`);
      if (isNaN(bDate.getTime())) continue;
      
      const diffMs = bDate.getTime() - now.getTime();
      const diffHrs = diffMs / (1000 * 60 * 60);
      
      if (!booking.notificationsSent) {
        booking.notificationsSent = {
          reminder24h: false,
          reminder2h: false,
          reminder15m: false,
          followUp1h: false,
          followUp24h: false,
          followUp1w: false,
          summaryEmailedToSpecialist: false
        };
      }
      
      const prep = getPrepInstructions(booking.specialistCategory, booking.appointmentMode);
      const prepSuffix = prep ? ` ${prep}` : '';
      let updated = false;
      
      // 1. 24h Reminder (between 23 and 25 hours before)
      if (diffHrs > 0 && diffHrs <= 25 && diffHrs >= 23 && !booking.notificationsSent.reminder24h) {
        const body = `Reminder: You have an appointment with ${booking.specialistName} tomorrow at ${booking.bookingTime}.${prepSuffix}`;
        await sendNotification({ email: booking.userEmail, subject: 'Appointment Reminder - 24 Hours', body, userId: booking.userId, channel: 'email' });
        await sendNotification({ phone: '', body, userId: booking.userId, channel: 'sms' });
        booking.notificationsSent.reminder24h = true;
        updated = true;
      }
      
      // 2. 2h Reminder (between 1.5 and 2.5 hours before)
      if (diffHrs > 0 && diffHrs <= 2.5 && diffHrs >= 1.5 && !booking.notificationsSent.reminder2h) {
        const body = `Your appointment with ${booking.specialistName} is in 2 hours. Mode/Location: ${booking.appointmentMode}.${prepSuffix}`;
        await sendNotification({ email: booking.userEmail, subject: 'Appointment Reminder - 2 Hours', body, userId: booking.userId, channel: 'email' });
        await sendNotification({ phone: '', body, userId: booking.userId, channel: 'sms' });
        booking.notificationsSent.reminder2h = true;
        updated = true;
      }
      
      // 3. 15m Reminder (between 5 and 20 mins before)
      if (diffHrs > 0 && diffHrs <= 0.35 && diffHrs >= 0.08 && !booking.notificationsSent.reminder15m) {
        const body = `Your appointment starts soon! Tap to view your receipt. Mode: ${booking.appointmentMode}.${prepSuffix}`;
        await sendNotification({ email: booking.userEmail, subject: 'Appointment Starting Soon', body, userId: booking.userId, channel: 'email' });
        await sendNotification({ phone: '', body, userId: booking.userId, channel: 'sms' });
        booking.notificationsSent.reminder15m = true;
        updated = true;
      }
      
      // 7. 1h pre-visit Summary Email (between 0.8 and 1.2 hours before)
      if (diffHrs > 0 && diffHrs <= 1.2 && diffHrs >= 0.8 && !booking.notificationsSent.summaryEmailedToSpecialist) {
        await sendSpecialistSummaryEmail(booking);
        booking.notificationsSent.summaryEmailedToSpecialist = true;
        updated = true;
      }
      
      // Post-visit follow-ups (afterHrs)
      const afterHrs = -diffHrs;
      
      // 4. 1h Follow-up (between 0.8 and 1.5 hours after)
      if (afterHrs > 0 && afterHrs <= 1.5 && afterHrs >= 0.8 && !booking.notificationsSent.followUp1h) {
        const body = `How was your visit? Rate ${booking.specialistName} in your dashboard.`;
        await sendNotification({ email: booking.userEmail, subject: 'How was your visit?', body, userId: booking.userId, channel: 'email' });
        await sendNotification({ phone: '', body, userId: booking.userId, channel: 'sms' });
        booking.notificationsSent.followUp1h = true;
        updated = true;
      }
      
      // 5. 24h Follow-up (between 23 and 25 hours after)
      if (afterHrs > 0 && afterHrs <= 25 && afterHrs >= 23 && !booking.notificationsSent.followUp24h) {
        const body = `How are you feeling now? Fill out your post-visit symptom tracker on your dashboard.`;
        await sendNotification({ email: booking.userEmail, subject: 'Post-Visit Symptom Tracker', body, userId: booking.userId, channel: 'email' });
        await sendNotification({ phone: '', body, userId: booking.userId, channel: 'sms' });
        booking.notificationsSent.followUp24h = true;
        updated = true;
      }
      
      // 6. 1w Follow-up (between 166 and 170 hours after)
      if (afterHrs > 0 && afterHrs <= 170 && afterHrs >= 166 && !booking.notificationsSent.followUp1w) {
        const body = `Time for your follow-up? Book your next session directly on the dashboard.`;
        await sendNotification({ email: booking.userEmail, subject: 'Time for your follow-up?', body, userId: booking.userId, channel: 'email' });
        await sendNotification({ phone: '', body, userId: booking.userId, channel: 'sms' });
        booking.notificationsSent.followUp1w = true;
        updated = true;
      }
      
      if (updated) {
        await booking.save();
      }
    }
  } catch (err) {
    console.error(`[Notification Service] Error running notification check:`, err);
  }
};

module.exports = {
  runNotificationCheck
};
