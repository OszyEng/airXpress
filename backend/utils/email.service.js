const nodemailer = require('nodemailer');
require('dotenv').config();

const emailUser = (process.env.EMAIL_USER || '').trim();
const emailPass = (process.env.EMAIL_PASS || '').trim();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '465', 10),
  secure: (process.env.EMAIL_SECURE || 'true') === 'true',
  auth: {
    user: emailUser,
    pass: emailPass
  },
  tls: { rejectUnauthorized: false }
});

transporter.verify().then(() => {
  console.log('Email transporter verification: OK');
}).catch(err => {
  console.error('Email transporter verification failed:', err && err.message ? err.message : err);
});

const path = require('path');
const fs = require('fs');

let COLORS = {
  primary: '#0d6efd',
  onPrimary: '#FFFFFF',
  accent: '#FFD700',
  text: '#000000',
  light: '#FFFFFF',
  success: '#FFD700'
};
try {
  const colorConfigPath = path.resolve(__dirname, '..', '..', 'src', 'assets', 'color.json');
  if (fs.existsSync(colorConfigPath)) {
    const raw = fs.readFileSync(colorConfigPath, 'utf8');
    const parsed = JSON.parse(raw);
    COLORS = Object.assign(COLORS, parsed);
  }
} catch (e) {
  console.warn('Failed to load color config for emails, using defaults.', e && e.message ? e.message : e);
}

const LOGO_URL = process.env.EMAIL_LOGO_URL || 'https://raw.githubusercontent.com/OszyEng/airXpress/refs/heads/main/logo2.png';
const LOCAL_LOGO_PATH = process.env.EMAIL_LOGO_PATH || path.resolve(__dirname, '..', '..', 'logo2.png');
const LOCAL_LOGO_CID = 'airxpress-logo';

const getEmailTemplate = (title, body, footer, logoSrc) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', sans-serif; background: ${COLORS.light}; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
    .header { background: ${COLORS.primary}; color: ${COLORS.onPrimary || '#fff'}; padding: 26px; text-align: center; }
    .header h1 { margin: 0; font-size: 26px; }
    .body { padding: 22px; color: ${COLORS.text}; line-height: 1.6; }
    .body h2 { color: ${COLORS.primary}; border-bottom: 2px solid ${COLORS.accent}; padding-bottom: 8px; }
    .highlight { background: ${COLORS.accent}; color: #000; padding: 4px 8px; border-radius: 6px; font-weight: bold; }
    .footer { background: ${COLORS.light}; padding: 16px; text-align: center; font-size: 13px; color: #6C757D; }
    .btn { display: inline-block; background: ${COLORS.primary}; color: ${COLORS.onPrimary || '#fff'}; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 12px 0; }
    .logo-img { width: 96px; height: auto; border-radius: 8px; object-fit: contain; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div style="text-align:center;">
        <img src="${logoSrc}" alt="AIRXPRESS" class="logo-img" style="display:block;margin:0 auto 8px;" />
        <div style="line-height:1; display:inline-block;">
          <span style="font-size:22px;letter-spacing:1px;color: ${COLORS.onPrimary || '#fff'};font-weight:700;">AIR</span><span style="font-size:22px;color: ${COLORS.accent};font-weight:700;">XPRESS</span>
        </div>
      </div>
    </div>
    <div class="body">
      <h2>${title}</h2>
      ${body}
    </div>
    <div class="footer">
      ${footer}
      <p> AIRXPRESS | Es un gusto servirte</p>
    </div>
  </div>
</body>
</html>
`;

const sendEmail = async (to, subject, title, body, footer = '') => {
  const useInlineLogo = fs.existsSync(LOCAL_LOGO_PATH);
  const logoSrc = useInlineLogo ? `cid:${LOCAL_LOGO_CID}` : LOGO_URL;
  const html = getEmailTemplate(title, body, footer, logoSrc);

  const mailOptions = {
    from: `"AIRXPRESS" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html
  };

  if (useInlineLogo) {
    mailOptions.attachments = [
      {
        filename: path.basename(LOCAL_LOGO_PATH),
        path: LOCAL_LOGO_PATH,
        cid: LOCAL_LOGO_CID
      }
    ];
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}: ${info.messageId || '(no id)'}@${info.response || ''}`);
    return { success: true, info };
  } catch (err) {
    console.error('Failed to send email to', to, err && err.message ? err.message : err);
    return { success: false, error: err && err.message ? err.message : err };
  }
};

module.exports = { sendEmail };