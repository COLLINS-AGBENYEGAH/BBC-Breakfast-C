function isAuthorized(req) {
  const passcode = req.query.passcode || req.headers['x-admin-passcode'];
  return !!passcode && passcode === process.env.ADMIN_PASSCODE;
}

module.exports = { isAuthorized };
