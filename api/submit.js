const { client, ensureSchema } = require('../lib/db');
const { sendConfirmationEmail } = require('../lib/mailer');
const crypto = require('crypto');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    await ensureSchema();

    const body = req.body;
    const {
      churchName, headOfChurch, contactPerson, contactPhone, contactEmail,
      authName, authTitle, authDate, nominees
    } = body;

    if (!churchName || !contactEmail || !Array.isArray(nominees) || nominees.length === 0) {
      res.status(400).json({ error: 'Missing required fields or no nominees provided.' });
      return;
    }

    const submissionId = 'sub_' + Date.now() + '_' + crypto.randomBytes(4).toString('hex');
    const submittedAt = new Date().toISOString();

    await client.execute({
      sql: `INSERT INTO submissions
        (id, church_name, head_of_church, contact_person, contact_phone, contact_email, auth_name, auth_title, auth_date, submitted_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [submissionId, churchName, headOfChurch, contactPerson, contactPhone, contactEmail, authName, authTitle, authDate, submittedAt]
    });

    for (const n of nominees) {
      const nomineeId = 'nom_' + Date.now() + '_' + crypto.randomBytes(4).toString('hex');
      await client.execute({
        sql: `INSERT INTO nominees (id, submission_id, no, full_name, title, responsibility, phone)
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [nomineeId, submissionId, n.no || 0, n.fullName || '', n.title || '', n.responsibility || '', n.phone || '']
      });
    }

    try {
      await sendConfirmationEmail({
        churchName, headOfChurch, contactPerson, contactPhone, contactEmail,
        authName, authTitle, authDate, nominees
      });
    } catch (emailErr) {
      console.error('Confirmation email failed to send:', emailErr);
    }

    res.status(200).json({ ok: true, id: submissionId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while saving submission.' });
  }
};
