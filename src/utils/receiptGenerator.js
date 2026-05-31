import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

export const generateReceiptPDF = async (booking) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Calculate Verification URL
  const lookupUrl = `${window.location.origin}/lookup?receiptId=${booking.receiptId}`;
  
  // Generate QR Code Data URL (Promise)
  let qrCodeDataUrl = '';
  try {
    qrCodeDataUrl = await QRCode.toDataURL(lookupUrl, {
      margin: 1,
      width: 150,
      color: {
        dark: '#1C1008', // Dark brand color
        light: '#FFFFFF'
      }
    });
  } catch (err) {
    console.error('Failed to generate QR Code', err);
  }

  // Draw Top Accent Stripe
  doc.setFillColor(224, 88, 48); // #E05830
  doc.rect(0, 0, 210, 4, 'F');

  // Draw Header Brand Band
  doc.setFillColor(28, 16, 8); // #1C1008
  doc.rect(0, 4, 210, 24, 'F');

  // Header Title
  doc.setTextColor(237, 184, 32); // #EDB820 (Gold)
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('SmartAssist Medical', 20, 19);

  // Header Subtitle
  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Wellness & Digital Consultation Portal', 20, 24);

  // Header Contact
  doc.setFontSize(7.5);
  doc.text('Email: support@smartassist.com', 190, 14, { align: 'right' });
  doc.text('Web: smartassist.com/wellness', 190, 19, { align: 'right' });
  doc.text('Tel: +1 (555) 019-2834', 190, 24, { align: 'right' });

  // Receipt Title
  doc.setTextColor(28, 16, 8);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('APPOINTMENT RECEIPT & SUMMARY', 20, 42);

  // Accent Line under Title
  doc.setDrawColor(237, 184, 32);
  doc.setLineWidth(0.5);
  doc.line(20, 45, 190, 45);

  // Metadata Box
  doc.setFillColor(250, 248, 244); // light warm background
  doc.rect(20, 50, 170, 18, 'F');
  doc.setDrawColor(212, 201, 176); // light cream border
  doc.setLineWidth(0.25);
  doc.rect(20, 50, 170, 18, 'S');

  // Metadata Text
  doc.setFontSize(9);
  doc.setFont('Helvetica', 'bold');
  doc.text('Receipt No:', 25, 57);
  doc.setFont('Helvetica', 'normal');
  doc.text(booking.receiptId, 52, 57);

  doc.setFont('Helvetica', 'bold');
  doc.text('Date Issued:', 25, 63);
  doc.setFont('Helvetica', 'normal');
  doc.text(booking.bookingDate, 52, 63);

  doc.setFont('Helvetica', 'bold');
  doc.text('Payment Status:', 115, 60);
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(34, 139, 34); // Green
  doc.text('PAID / CONFIRMED', 146, 60);
  doc.setTextColor(28, 16, 8); // Reset

  // Columns for Patient and Specialist Info
  const colY = 78;
  // Patient Info Column
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('PATIENT INFORMATION', 20, colY);
  
  doc.setFontSize(9);
  doc.setFont('Helvetica', 'normal');
  doc.text('Name:', 20, colY + 7);
  doc.setFont('Helvetica', 'bold');
  doc.text(booking.bookedFor || booking.userName, 48, colY + 7);

  doc.setFont('Helvetica', 'normal');
  doc.text('Registered Email:', 20, colY + 13);
  doc.text(booking.userEmail, 48, colY + 13);

  doc.text('Relationship:', 20, colY + 19);
  const isSelf = (booking.bookedFor || booking.userName) === booking.userName;
  doc.text(isSelf ? 'Self' : 'Family Profile', 48, colY + 19);

  // Specialist Info Column
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('APPOINTMENT DETAILS', 115, colY);

  doc.setFontSize(9);
  doc.setFont('Helvetica', 'normal');
  doc.text('Specialist:', 115, colY + 7);
  doc.setFont('Helvetica', 'bold');
  doc.text(booking.specialistName, 146, colY + 7);

  doc.setFont('Helvetica', 'normal');
  doc.text('Department:', 115, colY + 13);
  doc.text(booking.specialistCategory, 146, colY + 13);

  doc.text('Date & Time:', 115, colY + 19);
  doc.setFont('Helvetica', 'bold');
  doc.text(`${booking.bookingDate} @ ${booking.bookingTime}`, 146, colY + 19);

  doc.setFont('Helvetica', 'normal');
  doc.text('Consultation Mode:', 115, colY + 25);
  doc.text(booking.appointmentMode || 'In-Person', 146, colY + 25);

  // Triage & Symptoms note
  const triageY = 115;
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('PATIENT REPORTED SYMPTOMS & TRIAGE', 20, triageY);
  
  doc.setFillColor(250, 248, 244);
  doc.rect(20, triageY + 4, 170, 28, 'F');
  doc.setDrawColor(212, 201, 176);
  doc.rect(20, triageY + 4, 170, 28, 'S');

  doc.setFontSize(8.5);
  doc.setFont('Helvetica', 'bold');
  doc.text('Symptoms / Reason for Visit:', 25, triageY + 10);
  doc.setFont('Helvetica', 'normal');
  const symptomsText = booking.symptoms || 'Routine checkup consultation.';
  const splitSymptoms = doc.splitTextToSize(symptomsText, 158);
  doc.text(splitSymptoms, 25, triageY + 15);

  doc.setFont('Helvetica', 'bold');
  doc.text('Triage Level / Urgency:', 25, triageY + 27);
  doc.setFont('Helvetica', 'normal');
  doc.text(booking.triageUrgency || 'Routine', 62, triageY + 27);

  // Service Pricing Table
  const tableY = 155;
  doc.setFillColor(28, 16, 8);
  doc.rect(20, tableY, 170, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('Description', 24, tableY + 5);
  doc.text('Type / Mode', 95, tableY + 5);
  doc.text('Amount', 185, tableY + 5, { align: 'right' });

  // Row 1
  doc.setTextColor(28, 16, 8);
  doc.setFont('Helvetica', 'normal');
  doc.text(`Consultation with ${booking.specialistName} (${booking.specialistCategory})`, 24, tableY + 14);
  doc.text(booking.appointmentMode || 'In-Person', 95, tableY + 14);

  const priceVal = booking.price ? `₹${booking.price}` : (booking.appointmentMode === 'Video Call' ? '₹60' : booking.appointmentMode === 'Chat Consultation' ? '₹30' : '₹100');
  doc.setFont('Helvetica', 'bold');
  doc.text(priceVal, 185, tableY + 14, { align: 'right' });

  // Border below row
  doc.setDrawColor(212, 201, 176);
  doc.setLineWidth(0.25);
  doc.line(20, tableY + 18, 190, tableY + 18);

  // Total amount
  doc.setFont('Helvetica', 'bold');
  doc.text('Total Paid:', 150, tableY + 24);
  doc.text(priceVal, 185, tableY + 24, { align: 'right' });

  doc.setLineWidth(0.3);
  doc.line(150, tableY + 26, 190, tableY + 26);
  doc.line(150, tableY + 27.5, 190, tableY + 27.5);

  // QR Code & Verification
  const qrY = 195;
  if (qrCodeDataUrl) {
    doc.addImage(qrCodeDataUrl, 'PNG', 20, qrY, 32, 32);
  }

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('DIGITAL VERIFICATION & SECURITY', 58, qrY + 5);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  const infoLines = [
    'Scan this QR code to verify this receipt authenticity on the official',
    'SmartAssist Portal. This digital record represents a secure confirmation',
    'of the completed appointment and clinical consultation.'
  ];
  doc.text(infoLines, 58, qrY + 10);

  // Footer separator
  doc.setDrawColor(212, 201, 176);
  doc.setLineWidth(0.25);
  doc.line(20, 245, 190, 245);

  // Footer text
  doc.setFontSize(7);
  doc.setTextColor(120, 110, 100);
  doc.text('SmartAssist Medical Services Ltd. • ISO 27001 Certified Health Platform', 105, 251, { align: 'center' });
  doc.text('This is a computer-generated document. No physical signature is required.', 105, 255, { align: 'center' });
  doc.text('For support, contact support@smartassist.com or visit our online help center.', 105, 259, { align: 'center' });

  // Save the PDF
  doc.save(`receipt-${booking.receiptId}.pdf`);
};
