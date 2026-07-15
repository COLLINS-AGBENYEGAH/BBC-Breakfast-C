const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });
  }
  return transporter;
}

async function sendConfirmationEmail(submission) {
  const t = getTransporter();

  const nomineeRows = submission.nominees.map(n =>
    `${n.no}. ${n.fullName} — ${n.title}`
  ).join('\n');

  const text = `
Dear ${submission.headOfChurch || submission.contactPerson},

This confirms that ${submission.churchName} has successfully submitted a nomination for BBC Breakfast Forum 2.0.

Theme: The Anti-LGBTQ+ Bill in Biblical Perspective
Date: Wednesday, 19th August 2026
Time: 8:30 a.m. – 12:45 p.m.
Venue: Gold Coast Hall, University of Gold Coast, Spintex Road, Accra

Nominated clergy:
${nomineeRows}

Authorised by: ${submission.authName} (${submission.authTitle})

If any details need correction, please contact the organising team directly.

Thank you,
Theological Education and Missions Centre (TEAM)
University of Gold Coast
`.trim();

  await t.sendMail({
    from: `"BBC Breakfast Forum 2.0" <${process.env.GMAIL_USER}>`,
    to: submission.contactEmail,
    subject: `Nomination received — ${submission.churchName}`,
    text
  });
}

module.exports = { sendConfirmationEmail };
