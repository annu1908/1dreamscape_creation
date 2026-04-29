const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_LOGIN,
    pass: process.env.BREVO_API_KEY,
  },
});

const sendEmail = async (to, otp, subject = 'Your Verification Code - Dreamscape Creation', bodyText = 'Thank you for signing up with Dreamscape Creation. Use the verification code below to complete your registration.') => {
  const mailOptions = {
    from: `"Dreamscape Creation" <${process.env.BREVO_EMAIL}>`,
    to,
    subject,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0;padding:0;background-color:#f0f4f8;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f4f8;padding:40px 20px;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                
                <!-- Header -->
                <tr>
                  <td style="background:linear-gradient(135deg,#d86b94 0%,#b85078 100%);padding:36px 32px;text-align:center;">
                    <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:800;letter-spacing:0.5px;">
                      ✨ Dreamscape Creation
                    </h1>
                    <p style="margin:8px 0 0;color:rgba(255,255,255,0.9);font-size:14px;">
                      Email Verification
                    </p>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:40px 32px 20px;">
                    <p style="margin:0 0 8px;color:#1e293b;font-size:18px;font-weight:700;">
                      Hello there! 👋
                    </p>
                    <p style="margin:0 0 28px;color:#64748b;font-size:15px;line-height:1.6;">
                      ${bodyText}
                    </p>

                    <!-- OTP Box -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center">
                          <div style="background:linear-gradient(135deg,#fdf2f8,#fce7f3);border:2px dashed #d86b94;border-radius:12px;padding:24px 40px;display:inline-block;">
                            <span style="font-size:36px;font-weight:800;letter-spacing:10px;color:#b85078;font-family:'Courier New',monospace;">
                              ${otp}
                            </span>
                          </div>
                        </td>
                      </tr>
                    </table>

                    <p style="margin:28px 0 0;color:#64748b;font-size:14px;line-height:1.6;text-align:center;">
                      This code is valid for <strong style="color:#1e293b;">5 minutes</strong>. Please do not share it with anyone.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding:20px 32px 32px;">
                    <hr style="border:none;border-top:1px solid #e2e8f0;margin:0 0 20px;">
                    <p style="margin:0;color:#94a3b8;font-size:12px;text-align:center;line-height:1.6;">
                      If you didn't request this code, you can safely ignore this email.<br>
                      &copy; ${new Date().getFullYear()} Dreamscape Creation. All rights reserved.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
