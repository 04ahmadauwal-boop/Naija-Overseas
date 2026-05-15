/**
 * Convert a local "YYYY-MM-DD" + "HH:MM" in the given timezone to a UTC Date.
 *
 * Technique: create a fake-UTC Date at the desired local time, measure how far
 * that UTC instant is from the same wall-clock in the target timezone, then
 * subtract the difference to arrive at the true UTC instant.
 */
function localToUTC(dateStr, timeStr, timezone) {
  const [year, mon, day] = dateStr.split('-').map(Number);
  const [hr, mn]         = timeStr.split(':').map(Number);

  // Step 1 – fake UTC = treat the local time as if it were UTC
  const fakeUTC = new Date(Date.UTC(year, mon - 1, day, hr, mn, 0));

  // Step 2 – what does that UTC instant look like in the target timezone?
  const asLocal = new Date(fakeUTC.toLocaleString('en-US', { timeZone: timezone }));

  // Step 3 – offset in ms (positive means timezone is ahead of UTC)
  const offsetMs = asLocal.getTime() - fakeUTC.getTime();

  // Step 4 – true UTC = fakeUTC − offset
  return new Date(fakeUTC.getTime() - offsetMs);
}

/** Format a UTC Date as "HH:MM" in the given IANA timezone. */
function formatTimeInTZ(date, timezone) {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: timezone,
    hour:   '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

/** Return the day-of-week (0=Sun … 6=Sat) for a "YYYY-MM-DD" date in a timezone. */
function getDayInTZ(dateStr, timezone) {
  // Use noon UTC to avoid any midnight edge-case across day boundaries
  const d = new Date(dateStr + 'T12:00:00Z');
  const name = new Intl.DateTimeFormat('en-US', { timeZone: timezone, weekday: 'short' }).format(d);
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(name);
}

/** Return today's date as "YYYY-MM-DD" in the given timezone. */
function todayInTZ(timezone) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year:  'numeric',
    month: '2-digit',
    day:   '2-digit',
  }).format(new Date()); // en-CA gives ISO format YYYY-MM-DD automatically
}

module.exports = { localToUTC, formatTimeInTZ, getDayInTZ, todayInTZ };
