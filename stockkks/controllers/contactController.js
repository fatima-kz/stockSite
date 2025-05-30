import { sendContactFormEmail } from '../utils/mailer.js';

// Handle contact form submissions
export async function submitContactForm(req, res) {
  try {
    const { name, email, subject, message } = req.body;
    
    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and message'
      });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }
    
    // Send emails
    const emailResult = await sendContactFormEmail({
      name,
      email,
      subject,
      message
    });
    
    // Check if emails were sent successfully
    if (emailResult.success) {
      return res.status(200).json({
        success: true,
        message: 'Your message has been sent successfully!'
      });
    } else {
      console.error('Email sending failed:', emailResult);
      return res.status(500).json({
        success: false,
        message: 'Failed to send your message. Please try again later.'
      });
    }
  } catch (error) {
    console.error('Contact form error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while processing your request'
    });
  }
}
