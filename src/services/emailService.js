const nodemailer = require('nodemailer');

// ตั้งค่า SMTP (ตัวอย่างใช้ Gmail, ของจริงแนะนำ SendGrid/AWS SES)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // อีเมลของคุณ
        pass: process.env.EMAIL_PASS  // รหัสผ่าน (หรือ App Password)
    }
});

const sendOTP = async (toEmail, otpCode, type) => {
    const subject = type === 'REGISTER' ? 'ยืนยันการสมัครสมาชิก' : 'รหัสเข้าสู่ระบบ (2FA)';
    
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: toEmail,
        subject: subject,
        text: `รหัสความปลอดภัยของคุณคือ: ${otpCode}\nรหัสนี้จะหมดอายุใน 5 นาที`,
        html: `
            <h3>${subject}</h3>
            <p>รหัสความปลอดภัยของคุณคือ:</p>
            <h1 style="color: #4CAF50;">${otpCode}</h1>
            <p>รหัสนี้จะหมดอายุใน 5 นาที</p>
        `
    };

    await transporter.sendMail(mailOptions);
};

module.exports = { sendOTP };