const { client, ensureSchema } = require('../lib/db');
const { isAuthorized } = require('../lib/auth');

function csvField(val) {
  const s = (val === undefined || val === null) ? '' : String(val);
  if (/[",\n]/.test(s)) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

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
      nomineesBySubmission[subId].push(row);
    }

    const headers = [
      'Church Name', 'Head of Church', 'Contact Person', 'Contact Phone', 'Contact Email',
      'Nominee No.', 'Nominee Full Name', 'Nominee Title', 'Nominee Responsibility', 'Nominee Phone',
      'Authorising Leader', 'Authorising Title', 'Confirmation Date', 'Submitted At'
    ];
    const rows = [headers.map(csvField).join(',')];

    for (const sub of subsResult.rows) {
      const nominees = nomineesBySubmission[sub.id] || [];
      for (const n of nominees) {
        rows.push([
          csvField(sub.church_name),
          csvField(sub.head_of_church),
          csvField(sub.contact_person),
          csvField(sub.contact_phone),
          csvField(sub.contact_email),
          csvField(n.no),
          csvField(n.full_name),
          csvField(n.title),
          csvField(n.responsibility),
          csvField(n.phone),
          csvField(sub.auth_name),
          csvField(sub.auth_title),
          csvField(sub.auth_date),
          csvField(sub.submitted_at)
        ].join(','));
      }
    }

    const csvContent = rows.join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="bbc_breakfast_forum_nominations.csv"');
    res.status(200).send(csvContent);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while exporting.' });
  }
};
