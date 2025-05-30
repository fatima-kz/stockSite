import nodemailer from 'nodemailer';

// Create a transporter object
const transporter = nodemailer.createTransport({
  service: 'gmail', // Can be replaced with any other email service like 'hotmail', 'yahoo', etc.
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS  // Your email password or app-specific password
  }
});

// Email sending function
export async function sendEmail(options) {
  // Email options
  const mailOptions = {
    from: `"Stock Video Hub" <${process.env.EMAIL_USER}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html
  };

  try {
    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email: ', error);
    return { success: false, error: error.message };
  }
}

// Contact form email function
export async function sendContactFormEmail(formData) {
  const { name, email, subject, message } = formData;
  
  // Email to admin
  const adminMailOptions = {
    to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
    subject: `Contact Form: ${subject || 'New Message'}`,
    text: `
      You have received a new message from the contact form:
      
      Name: ${name}
      Email: ${email}
      Subject: ${subject || 'N/A'}
      
      Message:
      ${message}
    `,
    html: `
      <h2>New Contact Form Submission</h2>
      <p>You have received a new message from the contact form:</p>
      <ul>
        <li><strong>Name:</strong> ${name}</li>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Subject:</strong> ${subject || 'N/A'}</li>
      </ul>
      <h3>Message:</h3>
      <p>${message.replace(/\n/g, '<br>')}</p>
    `
  };
  
  // Confirmation email to sender
  const userMailOptions = {
    to: email,
    subject: 'Thank you for contacting Stock Video Hub',
    text: `
      Hi ${name},
      
      Thank you for contacting Stock Video Hub. This is an automated response to let you know we've received your message.
      
      We'll get back to you as soon as possible.
      
      For reference, here's a copy of your message:
      
      Subject: ${subject || 'N/A'}
      Message:
      ${message}
      
      Best regards,
      The Stock Video Hub Team
    `,
    html: `
      <h2>Thank you for contacting Stock Video Hub</h2>
      <p>Hi ${name},</p>
      <p>Thank you for contacting Stock Video Hub. This is an automated response to let you know we've received your message.</p>
      <p>We'll get back to you as soon as possible.</p>
      <p>For reference, here's a copy of your message:</p>
      <p><strong>Subject:</strong> ${subject || 'N/A'}</p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
        <p>${message.replace(/\n/g, '<br>')}</p>
      </div>
      <p>Best regards,<br>The Stock Video Hub Team</p>
    `
  };
  
  // Send both emails
  const adminEmailResult = await sendEmail(adminMailOptions);
  const userEmailResult = await sendEmail(userMailOptions);
  
  return {
    success: adminEmailResult.success && userEmailResult.success,
    adminEmail: adminEmailResult,
    userEmail: userEmailResult
  };
}
