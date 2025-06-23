// backend/emailService.js
const nodemailer = require('nodemailer');

// Konfigurasi SMTP - Menggunakan environment variables
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail', // Menggunakan service Gmail langsung
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    // Opsi tambahan untuk Gmail
    tls: {
      rejectUnauthorized: false
    }
  });
};

const sendResetPasswordEmail = async (to, resetLink, userName) => {
  try {
    const transporter = createTransporter();
    
    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; }
          .warning { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; color: #856404; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Reset Password</h1>
            <p>Casib SMM Panel</p>
          </div>
          <div class="content">
            <h2>Halo, ${userName || 'User'}!</h2>
            <p>Kami menerima permintaan untuk mereset password akun Anda. Klik tombol di bawah ini untuk melanjutkan:</p>
            
            <div style="text-align: center;">
              <a href="${resetLink}" class="button">Reset Password</a>
            </div>
            
            <div class="warning">
              <strong>⚠️ Penting:</strong>
              <ul>
                <li>Link ini hanya valid selama 1 jam</li>
                <li>Jika Anda tidak meminta reset password, abaikan email ini</li>
                <li>Untuk keamanan, jangan share link ini kepada siapapun</li>
              </ul>
            </div>
            
            <p>Atau salin dan tempel link berikut di browser Anda:</p>
            <p style="word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 5px; font-family: monospace;">
              ${resetLink}
            </p>
          </div>
          <div class="footer">
            <p>© 2025 Casib SMM. Semua hak dilindungi.</p>
            <p>Email ini dikirim secara otomatis, mohon jangan membalas.</p>
          </div>
        </div>
      </body>
      </html>
    `;    const mailOptions = {
      from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
      to: to,
      subject: '🔐 Reset Password - Casib SMM Panel',
      html: htmlTemplate,
      // Fallback text version
      text: `
        Halo ${userName || 'User'},
        
        Kami menerima permintaan untuk mereset password akun Anda.
        
        Klik link berikut untuk reset password:
        ${resetLink}
        
        Link ini hanya valid selama 1 jam.
        Jika Anda tidak meminta reset password, abaikan email ini.
        
        Best regards,
        Casib SMM Team
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email reset password berhasil dikirim:', result.messageId);
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error('❌ Error mengirim email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendResetPasswordEmail
};
