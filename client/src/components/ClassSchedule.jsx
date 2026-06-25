import { useState, useEffect } from 'react';
import { Timer, Play, Lock, Radio, GraduationCap, ExternalLink } from 'lucide-react';
import {
  getClassStatus, getMsUntil, isSessionToday, parseSessionDateTime,
} from '../utils/classSchedule';

// ── ClassCountdown ────────────────────────────────────────────────────────────
// Live ticking timer: "Starts in 2h 40m" → "Starting in 4m 32s" → "LIVE NOW" → "Ended"
export function ClassCountdown({ date, timeSlot }) {
  const [, setTick] = useState(0);
  const status = getClassStatus(date, timeSlot);

  useEffect(() => {
    if (!['upcoming', 'soon', 'live'].includes(status)) return;
    // tick every second when imminent; every minute when far away
    const ms = status === 'upcoming' ? 60_000 : 1_000;
    const id = setInterval(() => setTick(t => t + 1), ms);
    return () => clearInterval(id);
  }, [status]);

  if (status === 'live') return (
    <span className="inline-flex items-center gap-1.5 text-green-600 font-bold text-xs">
      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
      LIVE NOW
    </span>
  );

  if (status === 'ended') return (
    <span className="text-gray-400 text-xs font-medium">Ended</span>
  );

  const ms = getMsUntil(date, timeSlot);
  if (!ms || ms < 0) return null;

  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const text = h > 0 ? `${h}h ${m}m` : m > 0 ? `${m}m ${s}s` : `${s}s`;

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${
      status === 'soon' ? 'text-amber-600' : 'text-gray-400'
    }`}>
      <Timer size={10} />
      {status === 'soon' ? `Starting in ${text}` : `Starts in ${text}`}
    </span>
  );
}

// ── ClassJoinButton (student) ─────────────────────────────────────────────────
// Always clickable when a callLink exists; visual state reflects proximity to class time.
export function ClassJoinButton({ callLink, date, timeSlot, size = 'sm' }) {
  const status = getClassStatus(date, timeSlot);
  const lg = size === 'lg';
  const base = lg
    ? 'flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold transition'
    : 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0';

  if (!callLink) return (
    <span className={`${base} bg-gray-100 text-gray-400 cursor-default`}>
      Link not ready
    </span>
  );

  if (status === 'ended') return (
    <a href={callLink} target="_blank" rel="noreferrer"
      className={`${base} bg-gray-200 hover:bg-gray-300 text-gray-500`}>
      <Play size={lg ? 14 : 11} fill="currentColor" /> Replay
    </a>
  );

  if (status === 'live') return (
    <a href={callLink} target="_blank" rel="noreferrer"
      className={`${base} bg-green-600 hover:bg-green-700 text-white shadow-sm shadow-green-500/30`}>
      <span className="w-2 h-2 rounded-full bg-white/80 animate-pulse" />
      Join Now
    </a>
  );

  if (status === 'soon') return (
    <a href={callLink} target="_blank" rel="noreferrer"
      className={`${base} bg-amber-500 hover:bg-amber-600 text-white`}>
      <Play size={lg ? 14 : 11} fill="currentColor" /> Join Class
    </a>
  );

  // upcoming — still clickable, just styled as secondary
  return (
    <a href={callLink} target="_blank" rel="noreferrer"
      className={`${base} bg-green-700 hover:bg-green-800 text-white`}>
      <Play size={lg ? 14 : 11} fill="currentColor" /> Join Class
    </a>
  );
}

// ── ClassStartButton (tutor) ──────────────────────────────────────────────────
// Disabled until 15 min before; amber when <60 min; green pulsing when live.
export function ClassStartButton({ callLink, date, timeSlot, size = 'sm' }) {
  const status = getClassStatus(date, timeSlot);
  const lg = size === 'lg';
  const base = lg
    ? 'flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold transition'
    : 'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0';

  if (!callLink) return (
    <span className={`${base} bg-gray-100 text-gray-400 cursor-default`}>
      No link
    </span>
  );

  if (status === 'upcoming') return (
    <span
      className={`${base} bg-gray-100 text-gray-400 cursor-not-allowed`}
      title="Classroom opens 15 minutes before class"
    >
      <Lock size={lg ? 14 : 11} /> Opens 15m before
    </span>
  );

  if (status === 'ended') return (
    <span className={`${base} bg-gray-50 text-gray-300 cursor-default`}>
      Done
    </span>
  );

  if (status === 'soon') return (
    <a href={callLink} target="_blank" rel="noreferrer"
      className={`${base} bg-amber-500 hover:bg-amber-600 text-white`}>
      <ExternalLink size={lg ? 14 : 11} /> Open Classroom
    </a>
  );

  // live
  return (
    <a href={callLink} target="_blank" rel="noreferrer"
      className={`${base} bg-green-700 hover:bg-green-800 text-white shadow-sm shadow-green-700/30`}>
      <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
      Start Class
    </a>
  );
}

// ── TodayScheduleBanner ───────────────────────────────────────────────────────
// Shows all of today's confirmed sessions with live countdown + smart action button.
// sessions: booking objects with { _id, date, timeSlot, callLink, status, notes, user, name }
// role: 'student' | 'tutor'
export function TodayScheduleBanner({ sessions = [], role = 'student' }) {
  const today = sessions
    .filter(s => s.status === 'confirmed' && isSessionToday(s.date))
    .sort((a, b) => {
      const ta = parseSessionDateTime(a.date, a.timeSlot)?.getTime() ?? 0;
      const tb = parseSessionDateTime(b.date, b.timeSlot)?.getTime() ?? 0;
      return ta - tb;
    });

  if (today.length === 0) return null;

  const liveNow    = today.some(s => getClassStatus(s.date, s.timeSlot) === 'live');
  const startSoon  = !liveNow && today.some(s => getClassStatus(s.date, s.timeSlot) === 'soon');

  const headerBg  = liveNow ? 'bg-green-700' : startSoon ? 'bg-amber-500' : 'bg-blue-700';
  const wrapCls   = liveNow
    ? 'border-green-300 bg-green-50'
    : startSoon
    ? 'border-amber-300 bg-amber-50'
    : 'border-blue-200 bg-blue-50';

  return (
    <div className={`rounded-2xl overflow-hidden border shadow-sm ${wrapCls}`}>
      {/* Header */}
      <div className={`px-5 py-3 flex items-center justify-between ${headerBg}`}>
        <div className="flex items-center gap-2">
          {liveNow ? (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
              <span className="text-white font-bold text-sm">Live Now</span>
            </>
          ) : startSoon ? (
            <>
              <Radio size={14} className="text-white shrink-0" />
              <span className="text-white font-bold text-sm">Starting Soon</span>
            </>
          ) : (
            <>
              <GraduationCap size={14} className="text-white shrink-0" />
              <span className="text-white font-bold text-sm">Today's Schedule</span>
            </>
          )}
        </div>
        <span className="text-white/70 text-xs font-medium">
          {today.length} session{today.length > 1 ? 's' : ''}
        </span>
      </div>

      {/* Session rows */}
      <div className="divide-y divide-white/50">
        {today.map(s => {
          const subject = s.notes?.match(/Subject: ([^|]+)/)?.[1]?.trim()
            || s.notes?.slice(0, 50)
            || 'Tutoring Session';
          const tutorName  = s.notes?.match(/Tutor: ([^|]+)/)?.[1]?.trim();
          const studentName = s.user?.name || s.name || 'Student';
          const sessionStatus = getClassStatus(s.date, s.timeSlot);

          return (
            <div
              key={s._id}
              className={`px-4 py-3.5 flex items-center gap-3 ${
                sessionStatus === 'live' ? 'bg-green-100/60' : ''
              }`}
            >
              {/* Time block */}
              <div className="shrink-0 bg-white rounded-xl px-3 py-2 text-center shadow-sm min-w-[66px]">
                <p className="text-[9px] font-bold text-gray-400 uppercase leading-none mb-0.5">
                  {new Date(s.date).toLocaleDateString('en-GB', { weekday: 'short' })}
                </p>
                <p className="text-xs font-extrabold text-gray-900 leading-tight whitespace-nowrap">
                  {s.timeSlot}
                </p>
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{subject}</p>
                <p className="text-xs text-gray-500 truncate">
                  {role === 'student' && tutorName
                    ? `Tutor: ${tutorName}`
                    : role === 'tutor'
                    ? `Student: ${studentName}`
                    : ''}
                </p>
                <ClassCountdown date={s.date} timeSlot={s.timeSlot} />
              </div>

              {/* Action button */}
              <div className="shrink-0">
                {role === 'student'
                  ? <ClassJoinButton callLink={s.callLink} date={s.date} timeSlot={s.timeSlot} />
                  : <ClassStartButton callLink={s.callLink} date={s.date} timeSlot={s.timeSlot} />
                }
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
