function validateCUI(cui) {
  if (typeof cui !== 'string') return false;
  if (!/^\d{13}$/.test(cui)) return false;
  const dept = parseInt(cui.substring(9, 11), 10);
  const mun = parseInt(cui.substring(11, 13), 10);
  return dept >= 1 && dept <= 22 && mun >= 1 && mun <= 40;
}

module.exports = { validateCUI };
