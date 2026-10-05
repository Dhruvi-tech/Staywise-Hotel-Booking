/**
 * Date and Duration Utility Helpers
 * Ensures accurate calendar day arithmetic without timezone drift.
 */

// Formats Date object to YYYY-MM-DD
export const formatDateToISO = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Returns today's date in YYYY-MM-DD
export const getTodayString = () => {
  return formatDateToISO(new Date());
};

// Returns date N days from today in YYYY-MM-DD
export const getFutureDateString = (daysFromToday = 1) => {
  const d = new Date();
  d.setDate(d.getDate() + Number(daysFromToday));
  return formatDateToISO(d);
};

// Adds N days to a YYYY-MM-DD date string
export const addDaysToDate = (dateStr, days) => {
  if (!dateStr) return '';
  const numDays = Math.max(1, parseInt(days, 10) || 1);
  const parts = dateStr.split('-').map(Number);
  if (parts.length !== 3) return '';
  const [year, month, day] = parts;
  const d = new Date(year, month - 1, day);
  d.setDate(d.getDate() + numDays);
  return formatDateToISO(d);
};

// Computes number of days between two YYYY-MM-DD dates (minimum 1)
export const getDaysBetween = (startStr, endStr) => {
  if (!startStr || !endStr) return 1;
  const p1 = startStr.split('-').map(Number);
  const p2 = endStr.split('-').map(Number);
  if (p1.length !== 3 || p2.length !== 3) return 1;
  const d1 = new Date(p1[0], p1[1] - 1, p1[2]);
  const d2 = new Date(p2[0], p2[1] - 1, p2[2]);
  const diffTime = d2.getTime() - d1.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays);
};

// Formats YYYY-MM-DD to friendly human date like "Fri, 10 Oct 2026"
export const formatHumanDate = (dateStr) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-').map(Number);
  if (parts.length !== 3) return dateStr;
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  return d.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};
