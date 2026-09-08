const PDFDocument = require('pdfkit');

const generatePreVisitSummaryPDF = (booking, userProfile = null) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const chunks = [];
      
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', err => reject(err));
      
      // Top header banner
      doc.rect(40, 40, 515, 80).fill('#0f172a');
      
      // Brand logo and title
      doc.font('Helvetica-Bold').fontSize(20).fillColor('#ffffff').text('PRE-VISIT CASE SUMMARY', 60, 60);
      doc.font('Helvetica').fontSize(10).fillColor('#f97316').text('SmartAssist Clinical Insights Portal', 60, 85);
      
      // Generated timestamp
      doc.font('Helvetica').fontSize(8).fillColor('#94a3b8').text(`Generated on: ${new Date().toLocaleString()}`, 380, 60, { align: 'right', width: 155 });
      
      // Details container
      doc.rect(40, 140, 515, 110).fill('#f8fafc');
      doc.roundedRect(40, 140, 515, 110, 6).strokeColor('#e2e8f0').lineWidth(1).stroke();
      
      // Column 1: Patient details
      doc.font('Helvetica').fontSize(8).fillColor('#64748b').text('PATIENT DETAILS', 60, 155);
      doc.font('Helvetica-Bold').fontSize(11).fillColor('#1e293b').text(booking.bookedFor || booking.userName, 60, 168);
      doc.font('Helvetica').fontSize(9).fillColor('#475569').text(booking.userEmail, 60, 183);
      if (userProfile && userProfile.age) {
        doc.font('Helvetica').fontSize(9).fillColor('#475569').text(`Age: ${userProfile.age}`, 60, 198);
      }
      
      // Column 2: Specialist details
      doc.font('Helvetica').fontSize(8).fillColor('#64748b').text('ASSIGNED SPECIALIST', 240, 155);
      doc.font('Helvetica-Bold').fontSize(11).fillColor('#1e293b').text(booking.specialistName, 240, 168);
      doc.font('Helvetica').fontSize(9).fillColor('#f97316').text((booking.specialistCategory || '').toUpperCase(), 240, 183);
      doc.font('Helvetica').fontSize(9).fillColor('#475569').text(`Mode: ${booking.appointmentMode}`, 240, 198);
      
      // Column 3: Schedule details
      doc.font('Helvetica').fontSize(8).fillColor('#64748b').text('APPOINTMENT DATE & TIME', 390, 155);
      doc.font('Helvetica-Bold').fontSize(11).fillColor('#1e293b').text(booking.bookingDate, 390, 168);
      doc.font('Helvetica').fontSize(10).fillColor('#475569').text(booking.bookingTime, 390, 183);
      
      // Urgency Level Block
      const urgency = (booking.triageUrgency || 'Routine').toLowerCase();
      let urgBg = '#f0fdf4', urgText = '#166534', urgBorder = '#dcfce7';
      if (urgency === 'urgent') {
        urgBg = '#fee2e2'; urgText = '#991b1b'; urgBorder = '#fecaca';
      } else if (urgency === 'soon') {
        urgBg = '#fff7ed'; urgText = '#9a3412'; urgBorder = '#ffedd5';
      }
      
      doc.rect(40, 270, 515, 45).fill(urgBg);
      doc.roundedRect(40, 270, 515, 45, 6).strokeColor(urgBorder).lineWidth(1).stroke();
      doc.font('Helvetica-Bold').fontSize(11).fillColor(urgText).text(`Triage Urgency Status: ${booking.triageUrgency || 'Routine'}`, 60, 286);
      
      // Clinical Assessment Title
      doc.font('Helvetica-Bold').fontSize(14).fillColor('#0f172a').text('Clinical Assessment & Findings', 40, 340);
      doc.strokeColor('#cbd5e1').lineWidth(1).moveTo(40, 360).lineTo(555, 360).stroke();
      
      // Symptoms Reported Column
      doc.font('Helvetica-Bold').fontSize(10).fillColor('#475569').text('Symptom Log:', 40, 375);
      doc.font('Helvetica').fontSize(9).fillColor('#334155').text(booking.symptoms || 'No initial symptoms provided.', 40, 390, { width: 240, align: 'justify' });
      
      // AI Findings Column
      doc.font('Helvetica-Bold').fontSize(10).fillColor('#475569').text('AI Triage Findings:', 300, 375);
      doc.font('Helvetica').fontSize(9).fillColor('#334155').text(booking.triageExplanation || 'No triage explanation available.', 300, 390, { width: 255, align: 'justify' });
      
      // Detected Keywords List
      if (booking.triageKeywords && booking.triageKeywords.length > 0) {
        doc.moveDown(1.5);
        doc.font('Helvetica-Bold').fontSize(9).fillColor('#475569').text('Detected Keywords: ', { continued: true });
        doc.font('Helvetica').fontSize(9).fillColor('#0f172a').text(booking.triageKeywords.join(', '));
      }
      
      // Rejection Feedback Block
      if (booking.rejectionReason) {
        doc.moveDown(1);
        doc.rect(40, doc.y, 515, 40).fill('#fef2f2');
        doc.roundedRect(40, doc.y - 40, 515, 40, 4).strokeColor('#fca5a5').lineWidth(1).stroke();
        doc.font('Helvetica-Bold').fontSize(9).fillColor('#991b1b').text('User Rejection Feedback:', 55, doc.y - 32);
        doc.font('Helvetica').fontSize(9).fillColor('#7f1d1d').text(`${booking.rejectionReason}${booking.rejectionReasonOther ? ` (${booking.rejectionReasonOther})` : ''}`, 55, doc.y - 18);
      }
      
      // Transcript Section
      if (booking.triageHistory && booking.triageHistory.length > 0) {
        doc.addPage();
        doc.font('Helvetica-Bold').fontSize(14).fillColor('#0f172a').text('Triage Chat Transcript', 40, 40);
        doc.strokeColor('#cbd5e1').lineWidth(1).moveTo(40, 60).lineTo(555, 60).stroke();
        
        let currentY = 80;
        for (const msg of booking.triageHistory) {
          const isUser = msg.role === 'user';
          const senderLabel = isUser ? 'Patient' : 'Nurse AI';
          const senderColor = isUser ? '#0f172a' : '#2563eb';
          
          doc.font('Helvetica-Bold').fontSize(9).fillColor(senderColor).text(`${senderLabel}:`, 40, currentY);
          
          const textHeight = doc.heightOfString(msg.content, { width: 440 });
          doc.font('Helvetica').fontSize(9).fillColor('#334155').text(msg.content, 100, currentY, { width: 440, align: 'left' });
          
          currentY += textHeight + 12;
          
          if (currentY > 780) {
            doc.addPage();
            currentY = 40;
          }
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
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const chunks = [];
      
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', err => reject(err));
      
      // Header Banner (Slate dark)
      doc.rect(40, 40, 515, 90).fill('#1e293b');
      
      // Brand Title
      doc.font('Helvetica-Bold').fontSize(22).fillColor('#ffffff').text('SMARTASSIST', 60, 65);
      doc.font('Helvetica').fontSize(10).fillColor('#fb923c').text('Official Appointment Receipt', 60, 95);
      
      // Header Info on Right
      doc.font('Helvetica').fontSize(8).fillColor('#94a3b8').text('RECEIPT ID', 380, 65, { align: 'right', width: 155 });
      doc.font('Helvetica-Bold').fontSize(11).fillColor('#ffffff').text(booking.receiptId, 380, 78, { align: 'right', width: 155 });
      doc.font('Helvetica').fontSize(8).fillColor('#94a3b8').text(`Booked: ${new Date(booking.createdAt || Date.now()).toLocaleDateString()}`, 380, 95, { align: 'right', width: 155 });
      
      // Ticket Container
      doc.roundedRect(40, 160, 515, 300, 8).strokeColor('#cbd5e1').lineWidth(1.5).stroke();
      
      // Left Part: Details
      doc.font('Helvetica-Bold').fontSize(16).fillColor('#0f172a').text(booking.specialistName, 60, 185);
      doc.font('Helvetica').fontSize(10).fillColor('#64748b').text((booking.specialistCategory || '').toUpperCase(), 60, 205);
      
      // Slate line
      doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(60, 225).lineTo(340, 225).stroke();
      
      // Info rows
      const drawInfoRow = (label, val, y) => {
        doc.font('Helvetica').fontSize(8).fillColor('#94a3b8').text(label, 60, y);
        doc.font('Helvetica-Bold').fontSize(11).fillColor('#1e293b').text(val, 60, y + 12);
      };
      
      drawInfoRow('PATIENT NAME', booking.bookedFor || booking.userName, 240);
      drawInfoRow('DATE & TIME', `${booking.bookingDate} @ ${booking.bookingTime}`, 290);
      drawInfoRow('CONSULTATION MODE', `${booking.appointmentMode} (${booking.duration || '30'} mins)`, 340);
      
      // Right Part: Shaded invoice details card
      doc.rect(360, 185, 175, 250).fill('#f8fafc');
      doc.roundedRect(360, 185, 175, 250, 6).strokeColor('#cbd5e1').lineWidth(1).stroke();
      
      // Payment block
      doc.font('Helvetica-Bold').fontSize(8).fillColor('#64748b').text('CONSULTATION FEE', 370, 205, { align: 'center', width: 155 });
      const feeText = booking.price !== undefined ? `INR ${booking.price}` : 'Free / Included';
      doc.font('Helvetica-Bold').fontSize(18).fillColor('#0f172a').text(feeText, 370, 222, { align: 'center', width: 155 });
      
      // Payment status badge
      doc.rect(397, 265, 100, 22).fill('#dcfce7');
      doc.font('Helvetica-Bold').fontSize(9).fillColor('#15803d').text('CONFIRMED', 397, 272, { align: 'center', width: 100 });
      
      // Dotted line inside invoice block
      doc.strokeColor('#cbd5e1').lineWidth(1).dash(4, { space: 2 }).moveTo(380, 315).lineTo(515, 315).stroke().undash();
      
      // Receipt guidance text
      doc.font('Helvetica').fontSize(8).fillColor('#64748b').text('Please present this receipt voucher at the reception to check-in.', 380, 335, { align: 'center', width: 135 });
      
      // Bottom warning block
      doc.rect(40, 490, 515, 60).fill('#fff7ed');
      doc.roundedRect(40, 490, 515, 60, 6).strokeColor('#ffedd5').lineWidth(1).stroke();
      
      doc.font('Helvetica-Bold').fontSize(9).fillColor('#c2410c').text('IMPORTANT INSTRUCTIONS:', 60, 502);
      doc.font('Helvetica').fontSize(9).fillColor('#9a3412').text('Please arrive 10 minutes prior to your scheduled slot. Carry a digital or printed copy of this receipt.', 60, 518);
      
      // Divider
      doc.strokeColor('#cbd5e1').lineWidth(1).moveTo(40, 710).lineTo(555, 710).stroke();
      
      // Footer brand info
      doc.font('Helvetica').fontSize(8).fillColor('#94a3b8').text('SmartAssist Digital Health Assistant | Powered by Clinical Triage', 40, 725, { align: 'center', width: 515 });
      
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
