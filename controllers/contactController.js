import { sendContactEmail } from "../services/emailService.js";

// Handle contact form submissions
export const submitContactForm = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: "Name, email, and message are required" });
    }

    // Send email
    const emailResult = await sendContactEmail({ name, email, phone, message });
    
    if (!emailResult.success) {
      return res.status(500).json({ 
        message: "Failed to send your message. Please try again.",
        details: emailResult.error 
      });
    }

    return res.status(200).json({ 
      message: "Message sent successfully. We'll get back to you soon." 
    });
  } catch (error) {
    console.error("Contact form error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
