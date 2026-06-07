const PDFDocument = require('pdfkit');

const generatePreVisitSummaryPDF = (booking, userProfile = null) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40 });
      const chunks = [];
      
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', err => reject(err));
      
      // Title
      doc.fontSize(20).fillColor('#1a1a1a').text('Pre-Visit Case Summary', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(9).fillColor('#666666').text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
      doc.moveDown(1);
      
      // Line
      doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(40, doc.y).lineTo(570, doc.y).stroke();
      doc.moveDown(1);
      
      // Patient Info Section
      doc.fontSize(13).fillColor('#2d3748').text('Patient & Appointment Details', { underline: true });
      doc.moveDown(0.4);
      doc.fontSize(10).fillColor('#1a1a1a');
      doc.text(`Patient Name: ${booking.bookedFor || booking.userName}`);
      doc.text(`Patient Email: ${booking.userEmail}`);
      doc.text(`Appointment Specialist: ${booking.specialistName} (${booking.specialistCategory})`);
      doc.text(`Scheduled Date & Time: ${booking.bookingDate} at ${booking.bookingTime}`);
      doc.text(`Consultation Mode: ${booking.appointmentMode}`);
      if (userProfile && userProfile.age) {
        doc.text(`Patient Age: ${userProfile.age}`);
      }
      doc.moveDown(1);
      
      // AI Triage Section
      doc.fontSize(13).fillColor('#2d3748').text('AI Triage Assessment', { underline: true });
      doc.moveDown(0.4);
      doc.fontSize(10).fillColor('#1a1a1a');
      doc.text(`AI-Recommended Category: ${booking.specialistCategory}`);
      doc.text(`Urgency Level: ${booking.triageUrgency || 'Routine'}`);
      doc.text(`Detected Keywords: ${(booking.triageKeywords || []).join(', ') || 'None'}`);
      
      if (booking.triageExplanation) {
        doc.moveDown(0.4);
        doc.fontSize(10).fillColor('#e05830').text(`AI Findings & Medical Notes:`, { bold: true });
        doc.fontSize(9).fillColor('#333333').text(booking.triageExplanation);
      }
      
      if (booking.rejectionReason) {
        doc.moveDown(0.4);
        doc.fontSize(10).fillColor('#d9534f').text(`Rejection Feedback (User did not accept initial recommendation):`, { bold: true });
        doc.fontSize(9).fillColor('#333333').text(`${booking.rejectionReason}${booking.rejectionReasonOther ? ` (${booking.rejectionReasonOther})` : ''}`);
      }
      doc.moveDown(1);
      
      // Original Symptoms
      doc.fontSize(13).fillColor('#2d3748').text('User Reported Symptoms', { underline: true });
      doc.moveDown(0.4);
      doc.fontSize(10).fillColor('#1a1a1a').text(booking.symptoms || 'No initial symptom text provided.');
      doc.moveDown(1);
      
      // Transcript Section
      if (booking.triageHistory && booking.triageHistory.length > 0) {
        doc.fontSize(13).fillColor('#2d3748').text('Triage Conversation Transcript', { underline: true });
        doc.moveDown(0.4);
        
        for (const msg of booking.triageHistory) {
          const roleLabel = msg.role === 'user' ? 'Patient' : 'AI Assistant';
          doc.fontSize(9).fillColor(msg.role === 'user' ? '#1a1a1a' : '#4a5568');
          doc.text(`[${roleLabel}]: ${msg.content}`);
          doc.moveDown(0.25);
        }
      }
      
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

const generateBookingReceiptPDF = (booking) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];
      
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', err => reject(err));
      
      doc.fontSize(22).fillColor('#1a1a1a').text('SmartAssist Appointment Receipt', { align: 'center' });
      doc.moveDown(0.3);
      doc.fontSize(10).fillColor('#666666').text(`Receipt ID: ${booking.receiptId}`, { align: 'center' });
      doc.text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
      doc.moveDown(1.5);
      
      doc.strokeColor('#e2e8f0').lineWidth(1.5).moveTo(50, doc.y).lineTo(562, doc.y).stroke();
      doc.moveDown(1.5);
      
      doc.fontSize(14).fillColor('#e05830').text('Appointment Details', { underline: true });
      doc.moveDown(0.6);
      
      doc.fontSize(11).fillColor('#2d3748');
      
      const labelX = 60;
      const valueX = 220;
      
      const drawRow = (label, value) => {
        const currentY = doc.y;
        doc.text(label, labelX, currentY);
        doc.text(value, valueX, currentY);
        doc.moveDown(0.5);
      };
      
      drawRow('Patient Name:', booking.bookedFor || booking.userName);
      drawRow('Specialist Name:', booking.specialistName);
      drawRow('Specialist Category:', booking.specialistCategory);
      drawRow('Appointment Date:', booking.bookingDate);
      drawRow('Appointment Time:', booking.bookingTime);
      drawRow('Consultation Mode:', `${booking.appointmentMode} (${booking.duration || '30'} mins)`);
      
      const feeText = booking.price !== undefined ? `INR ${booking.price}` : 'Free / Included';
      drawRow('Consultation Fee:', feeText);
      
      doc.moveDown(1.5);
      doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(50, doc.y).lineTo(562, doc.y).stroke();
      doc.moveDown(1.5);
      
      doc.fontSize(12).fillColor('#1a1a1a').text('Show this ticket at the reception upon arrival.', { align: 'center' });
      doc.moveDown(1);
      doc.fontSize(9).fillColor('#718096').text('Thank you for booking with SmartAssist. Please arrive 10 minutes prior to your scheduled time.', { align: 'center' });
      
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = {
  generatePreVisitSummaryPDF,
  generateBookingReceiptPDF
};
