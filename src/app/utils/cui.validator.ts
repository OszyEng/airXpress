export function validateCUI(cui: string): boolean {
  if (!/^\d{13}$/.test(cui)) return false;
  const dept = parseInt(cui.substring(9, 11));
  const mun = parseInt(cui.substring(11, 13));
  return dept >= 1 && dept <= 22 && mun >= 1 && mun <= 40;
}