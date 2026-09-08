const { Resend } = require('resend');
const env = require('../config/env');

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

const DEFAULT_SENDER = 'onboarding@resend.dev';
const VERIFIED_TEST_EMAIL = 'rexmodz01@gmail.com';

/**
 * Sends a stylized email notification via Resend.
 * Handles sandbox restrictions automatically.
 */
const sendEmail = async ({ to, subject, htmlContent }) => {
  // Resend sandbox only allows sending to verified email address
  const isProduction = process.env.NODE_ENV === 'production';
  const targetRecipient = isProduction ? to : VERIFIED_TEST_EMAIL;

  // Append a sandbox header to the HTML if we redirected the recipient
  let finalHtml = htmlContent;
  if (targetRecipient !== to) {
    finalHtml = `
      <div style="background-color: #FEF3C7; border: 1px solid #F59E0B; padding: 12px; border-radius: 6px; font-family: sans-serif; font-size: 13px; color: #92400E; margin-bottom: 20px;">
        <strong>[Sandbox Test Mode]</strong> This email was originally sent to <strong>${to}</strong>. 
        Because this is a test environment, it was redirected to the verified account email.
      </div>
      ${htmlContent}
    `;
  }

  if (!resend) {
    console.log(`[EmailService] Resend API Key is missing. Simulating send to ${targetRecipient}`);
    console.log(`[EmailService] Subject: ${subject}`);
    return { data: { id: 'simulated-id-no-key' } };
  }

  try {
    const response = await resend.emails.send({
      from: DEFAULT_SENDER,
      to: targetRecipient,
      subject: `${isProduction ? '' : '[TEST] '}${subject}`,
      html: finalHtml
    });
    console.log(`[EmailService] Email sent successfully to ${targetRecipient}. ID: ${response.data?.id}`);
    return response;
  } catch (error) {
    console.error(`[EmailService] Error sending email via Resend:`, error.message);
    // Do not crash the application if email sending fails
    return null;
  }
};

/**
 * Sends an approval email to a verified specialist.
 */
const sendSpecialistApprovalEmail = async (email, name) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Application Approved</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #faf8f6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <table border="0" cellpadding="0" cellspacing="0" width="580" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #f0edeb;">
              <!-- Header -->
              <tr>
                <td style="background-color: #1a1a1a; padding: 30px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.5px;">SmartAssist</h1>
                </td>
              </tr>
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="color: #1a1a1a; margin-top: 0; font-size: 20px; font-weight: 700;">Welcome to our Network!</h2>
                  <p style="color: #4a4a4a; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
                    Hello <strong>${name}</strong>,
                  </p>
                  <p style="color: #4a4a4a; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
                    We are thrilled to inform you that your application to join the SmartAssist practitioner network has been <strong>approved</strong>! 
                    Our administrative team has verified your credentials and medical license.
                  </p>
                  <p style="color: #4a4a4a; font-size: 15px; line-height: 1.6; margin-bottom: 30px;">
                    You can now log in to the Specialist Dashboard to configure your consultation modes (in-person, video, chat), list your custom pricing, and manage your availability slots.
                  </p>
                  <!-- Call to Action -->
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 30px;">
                    <tr>
                      <td align="center">
                        <a href="${env.frontendUrl}/login" target="_blank" style="background-color: #edb820; color: #1a1a1a; padding: 14px 28px; border-radius: 50px; font-weight: 700; font-size: 14px; text-decoration: none; display: inline-block;">
                          Access Practitioner Portal
                        </a>
                      </td>
                    </tr>
                  </table>
                  <hr style="border: 0; border-top: 1px solid #f0edeb; margin-bottom: 24px;">
                  <p style="color: #888888; font-size: 12px; line-height: 1.5; margin: 0; text-align: center;">
                    This is an automated notification from SmartAssist Healthcare Portal. 
                    If you did not apply for this account, please contact security support.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Onboarding Approved: Welcome to SmartAssist Network',
    htmlContent
  });
};

/**
 * Sends a rejection/feedback email to a specialist.
 */
const sendSpecialistRejectionEmail = async (email, name, reason) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Application Update Required</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #faf8f6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <table border="0" cellpadding="0" cellspacing="0" width="580" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #f0edeb;">
              <!-- Header -->
              <tr>
                <td style="background-color: #1a1a1a; padding: 30px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.5px;">SmartAssist</h1>
                </td>
              </tr>
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="color: #ef4444; margin-top: 0; font-size: 20px; font-weight: 700;">Application Update Required</h2>
                  <p style="color: #4a4a4a; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
                    Hello <strong>${name}</strong>,
                  </p>
                  <p style="color: #4a4a4a; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
                    Thank you for applying to the SmartAssist network. During our administrative verification check, we found some details in your application that require update or correction.
                  </p>
                  <!-- Rejection Box -->
                  <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 18px; border-radius: 6px; margin-bottom: 30px;">
                    <strong style="color: #ef4444; font-size: 14px; text-transform: uppercase;">Feedback from Administrator:</strong>
                    <p style="color: #991b1b; font-size: 14.5px; line-height: 1.6; margin: 8px 0 0 0; font-style: italic;">
                      "${reason}"
                    </p>
                  </div>
                  <p style="color: #4a4a4a; font-size: 15px; line-height: 1.6; margin-bottom: 30px;">
                    You can easily update your onboarding credentials, biography, clinic details, or medical registration license number and resubmit. 
                    Please log in to your dashboard to make modifications.
                  </p>
                  <!-- Call to Action -->
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 30px;">
                    <tr>
                      <td align="center">
                        <a href="${env.frontendUrl}/login" target="_blank" style="background-color: #ef4444; color: #ffffff; padding: 14px 28px; border-radius: 50px; font-weight: 700; font-size: 14px; text-decoration: none; display: inline-block;">
                          Update and Reapply
                        </a>
                      </td>
                    </tr>
                  </table>
                  <hr style="border: 0; border-top: 1px solid #f0edeb; margin-bottom: 24px;">
                  <p style="color: #888888; font-size: 12px; line-height: 1.5; margin: 0; text-align: center;">
                    This is an automated notification from SmartAssist Healthcare Portal. 
                    If you did not apply for this account, please contact security support.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Action Required: Specialist Onboarding Application Update',
    htmlContent
  });
};

/**
 * Sends a booking confirmation email with a PDF receipt attached.
 */
const sendBookingConfirmationEmail = async (email, name, booking, pdfBuffer) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const targetRecipient = isProduction ? email : VERIFIED_TEST_EMAIL;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Booking Confirmation</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #faf8f6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <table border="0" cellpadding="0" cellspacing="0" width="580" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #f0edeb;">
              <!-- Header -->
              <tr>
                <td style="background-color: #1a1a1a; padding: 30px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.5px;">SmartAssist</h1>
                </td>
              </tr>
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="color: #1a1a1a; margin-top: 0; font-size: 20px; font-weight: 700;">Booking Confirmed!</h2>
                  <p style="color: #4a4a4a; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
                    Hello <strong>${name || 'Valued Patient'}</strong>,
                  </p>
                  <p style="color: #4a4a4a; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
                    Your appointment has been successfully booked. Please find your booking details and PDF receipt attached.
                  </p>
                  
                  <!-- Details Box -->
                  <div style="background-color: #fcfbf9; border: 1px solid #e5e0db; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                    <h3 style="margin-top: 0; margin-bottom: 15px; font-size: 16px; border-bottom: 1px solid #e5e0db; padding-bottom: 8px; color: #1a1a1a;">Appointment Details</h3>
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 14.5px; color: #4a4a4a;">
                      <tr>
                        <td style="padding: 6px 0; font-weight: 600; width: 120px;">Receipt ID:</td>
                        <td style="padding: 6px 0;">${booking.receiptId}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; font-weight: 600;">Specialist:</td>
                        <td style="padding: 6px 0;">${booking.specialistName || 'Verified Specialist'}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; font-weight: 600;">Date:</td>
                        <td style="padding: 6px 0;">${booking.bookingDate}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; font-weight: 600;">Time:</td>
                        <td style="padding: 6px 0;">${booking.bookingTime}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; font-weight: 600;">Status:</td>
                        <td style="padding: 6px 0; text-transform: capitalize;">${booking.status || 'confirmed'}</td>
                      </tr>
                    </table>
                  </div>

                  <p style="color: #4a4a4a; font-size: 15px; line-height: 1.6; margin-bottom: 30px;">
                    If you need to make changes or cancel your appointment, you can do so through the SmartAssist portal.
                  </p>
                  
                  <hr style="border: 0; border-top: 1px solid #f0edeb; margin-bottom: 24px;">
                  <p style="color: #888888; font-size: 12px; line-height: 1.5; margin: 0; text-align: center;">
                    This is an automated notification from SmartAssist Healthcare Portal. 
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  // Append a sandbox header to the HTML if we redirected the recipient
  let finalHtml = htmlContent;
  if (targetRecipient !== email) {
    finalHtml = `
      <div style="background-color: #FEF3C7; border: 1px solid #F59E0B; padding: 12px; border-radius: 6px; font-family: sans-serif; font-size: 13px; color: #92400E; margin-bottom: 20px;">
        <strong>[Sandbox Test Mode]</strong> This email was originally sent to <strong>${email}</strong>. 
        Because this is a test environment, it was redirected to the verified account email.
      </div>
      ${htmlContent}
    `;
  }

  if (!resend) {
    console.log(`[EmailService] Resend API Key is missing. Simulating send to ${targetRecipient}`);
    return { data: { id: 'simulated-id-no-key' } };
  }

  try {
    const response = await resend.emails.send({
      from: DEFAULT_SENDER,
      to: targetRecipient,
      subject: `${isProduction ? '' : '[TEST] '}Booking Confirmation - SmartAssist`,
      html: finalHtml,
      attachments: [
        {
          filename: `receipt-${booking.receiptId}.pdf`,
          content: pdfBuffer
        }
      ]
    });
    console.log(`[EmailService] Booking confirmation email sent successfully to ${targetRecipient}. ID: ${response.data?.id}`);
    return response;
  } catch (error) {
    console.error(`[EmailService] Error sending booking confirmation email via Resend:`, error.message);
    return null;
  }
};

module.exports = {
  sendSpecialistApprovalEmail,
  sendSpecialistRejectionEmail,
  sendBookingConfirmationEmail
};
