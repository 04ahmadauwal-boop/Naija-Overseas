// Parses a booking date + timeSlot string (e.g. "2:00 PM") into a Date object.
export function parseSessionDateTime(date, timeSlot) {
  if (!date || !timeSlot) return null;
  const base = new Date(date);
  if (isNaN(base.getTime())) return null;
  const m = timeSlot.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!m) return null;
  let h = parseInt(m[1]);
  const min = parseInt(m[2]);
  const ampm = m[3].toUpperCase();
  if (ampm === 'PM' && h !== 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;
  const dt = new Date(base);
  dt.setHours(h, min, 0, 0);
  return dt;
}

// 'upcoming' = >60 min away | 'soon' = 0–60 min | 'live' = -90–0 min | 'ended'
export function getClassStatus(date, timeSlot) {
  const start = parseSessionDateTime(date, timeSlot);
  if (!start) return 'unknown';
  const diff = start.getTime() - Date.now();
  if (diff > 60 * 60 * 1000) return 'upcoming';
  if (diff > 0) return 'soon';
  if (diff > -(90 * 60 * 1000)) return 'live';
  return 'ended';
}

// Milliseconds until session starts (negative = already started).
export function getMsUntil(date, timeSlot) {
  const start = parseSessionDateTime(date, timeSlot);
  return start ? start.getTime() - Date.now() : null;
}

// True if the session's date falls on today (calendar day).
export function isSessionToday(date) {
  const d = new Date(date);
  const t = new Date();
  return (
    d.getFullYear() === t.getFullYear() &&
    d.getMonth() === t.getMonth() &&
    d.getDate() === t.getDate()
  );
}
