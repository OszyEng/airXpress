const router = require('express').Router();
const { sendEmail } = require('../utils/email.service');

router.post('/send-email', async (req, res) => {
  const { to, subject, title, body, footer } = req.body || {};
  if (!to || !subject || !title || !body) return res.status(400).json({ success: false, message: 'Missing fields' });
  try {
    const r = await sendEmail(to, subject, title, body, footer || '');
    if (r && r.success) return res.json({ success: true, info: r.info });
    return res.status(500).json({ success: false, error: r && r.error ? r.error : 'unknown' });
  } catch (e) {
    console.error('Error in /api/utils/send-email', e && e.message ? e.message : e);
    return res.status(500).json({ success: false, error: e && e.message ? e.message : e });
  }
});

module.exports = router;
