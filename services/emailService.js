import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendOTPEmail(email, otp) {
  try {
    const mailOptions = {
      from: process.env.GMAIL,
      to: email,
      subject: "Your Login OTP",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #333;">Your Login OTP</h2>
          <p>Your OTP for login is:</p>
          <h1 style="font-size: 32px; background-color: #f5f5f5; padding: 10px 15px; display: inline-block; border-radius: 4px;">${otp}</h1>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you did not request this OTP, please ignore this email.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: error.message };
  }
}

const getRecipientEmails = () => {
  const emails = process.env.CONTACT_FORM_RECIPIENTS;
  if (!emails) {
    console.warn("No recipient emails configured for contact form");
    return [];
  }
  return emails.split(',').map(email => email.trim());
};

export async function sendContactEmail({ name, email, phone, message }) {
  try {
    const recipients = getRecipientEmails();
    
    if (recipients.length === 0) {
      return { success: false, error: "No recipient emails configured" };
    }

    const mailOptions = {
      from: process.env.GMAIL,
      to: recipients.join(', '),
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #333;">New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
          <h3 style="margin-top: 20px;">Message:</h3>
          <p style="background-color: #f5f5f5; padding: 15px; border-radius: 4px;">${message.replace(/\n/g, '<br>')}</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending contact email:", error);
    return { success: false, error: error.message };
  }
}
