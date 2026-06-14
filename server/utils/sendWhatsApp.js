const twilio = require('twilio');

// Convert local Nigerian numbers to E.164 format, pass others through
function toE164(phone) {
  if (!phone) return null;
  let p = phone.toString().replace(/[\s\-().]/g, '');
  if (p.startsWith('+')) return p;            // already E.164
  if (p.startsWith('00')) return '+' + p.slice(2);
  if (p.startsWith('0') && p.length === 11) return '+234' + p.slice(1); // Nigerian 0xx
  if (p.length === 10 && !p.startsWith('0')) return '+234' + p;         // 10-digit NG
  return '+' + p;                             // assume already has country code
}

// Strip HTML tags to plain text for WhatsApp
function stripHtml(html = '') {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<li>/gi, '• ')
    .replace(/<strong>(.*?)<\/strong>/gi, '*$1*')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

const sendWhatsApp = async ({ to, message }) => {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_WHATSAPP_FROM) {
    // Silently skip if Twilio is not configured
    return;
  }

  const phone = toE164(to);
  if (!phone) return;

  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

  await client.messages.create({
    from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`,
    to:   `whatsapp:${phone}`,
    body: message,
  });
};

sendWhatsApp.stripHtml = stripHtml;

module.exports = sendWhatsApp;
