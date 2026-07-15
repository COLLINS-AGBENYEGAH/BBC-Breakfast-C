const { client, ensureSchema } = require('../lib/db');
const { isAuthorized } = require('../lib/auth');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!isAuthorized(req)) {
    res.status(401).json({ error: 'Incorrect or missing passcode.' });
    return;
  }

  try {
    await ensureSchema();

    const subsResult = await client.execute(
      `SELECT * FROM submissions ORDER BY submitted_at DESC`
    );
    const nomineesResult = await client.execute(
      `SELECT * FROM nominees ORDER BY submission_id, no ASC`
    );

    const nomineesBySubmission = {};
    for (const row of nomineesResult.rows) {
      const subId = row.submission_id;
      if (!nomineesBySubmission[subId]) nomineesBySubmission[subId] = [];
      nomineesBySubmission[subId].push({
        no: row.no,
        fullName: row.full_name,
        title: row.title,
        responsibility: row.responsibility,
        phone: row.phone
      });
    }

    const submissions = subsResult.rows.map(row => ({
      id: row.id,
      churchName: row.church_name,
      headOfChurch: row.head_of_church,
      contactPerson: row.contact_person,
      contactPhone: row.contact_phone,
      contactEmail: row.contact_email,
      authName: row.auth_name,
      authTitle: row.auth_title,
      authDate: row.auth_date,
      submittedAt: row.submitted_at,
      nominees: nomineesBySubmission[row.id] || []
    }));

    res.status(200).json({ submissions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while loading submissions.' });
  }
};
