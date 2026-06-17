export default function Logo({ variant = 'light', size = 'md' }) {
  const isDark = variant === 'dark';

  const iconCls = { sm: 'w-9 h-9 rounded-[10px]', md: 'w-10 h-10 rounded-[11px]', lg: 'w-11 h-11 rounded-[12px]' }[size] || 'w-10 h-10 rounded-[11px]';
  const textCls = { sm: 'text-[13.5px]', md: 'text-[15px]', lg: 'text-[17px]' }[size] || 'text-[15px]';

  return (
    <div className="flex items-center gap-2.5 shrink-0">

      {/* ── Icon mark ───────────────────────────────────────── */}
      <div className={`${iconCls} bg-gradient-to-br from-green-400 via-green-600 to-green-900 flex items-center justify-center shadow-lg shadow-green-900/30 shrink-0`}>
        <svg viewBox="0 0 24 24" fill="none" className="w-[62%] h-[62%]">
          {/* Globe circle */}
          <circle cx="12" cy="16" r="7"
            stroke="white" strokeWidth="1.45" strokeOpacity="0.92" fill="none"/>
          {/* Equator arc */}
          <path d="M5.2 16 Q8.6 13.4 12 16 Q15.4 18.6 18.8 16"
            stroke="white" strokeWidth="1.15" strokeOpacity="0.55" fill="none"/>
          {/* Upper latitude arc */}
          <path d="M6.6 12.1 Q9.3 10.4 12 12.1 Q14.7 13.8 17.4 12.1"
            stroke="white" strokeWidth="0.95" strokeOpacity="0.36" fill="none"/>
          {/* Center meridian */}
          <path d="M12 9 C10.3 12.5 10.3 19.5 12 23"
            stroke="white" strokeWidth="1.15" strokeOpacity="0.55" fill="none"/>
          {/* Graduation cap — flat diamond */}
          <polygon points="12,1 20,5.2 12,9.4 4,5.2" fill="white"/>
          {/* Tassel line */}
          <line x1="20" y1="5.2" x2="20" y2="10.8"
            stroke="rgba(255,255,255,0.72)" strokeWidth="1.4" strokeLinecap="round"/>
          {/* Tassel ball */}
          <circle cx="20" cy="11.7" r="1.15" fill="rgba(255,255,255,0.72)"/>
        </svg>
      </div>

      {/* ── Wordmark ────────────────────────────────────────── */}
      <div className="flex flex-col leading-none gap-[3px]">
        <span className={`text-[7.5px] font-extrabold tracking-[0.28em] uppercase ${isDark ? 'text-green-400' : 'text-green-600'}`}>
          Education
        </span>
        <span className={`${textCls} font-black tracking-[-0.01em] ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Naija <span className={isDark ? 'text-green-400' : 'text-green-600'}>&</span> Overseas
        </span>
      </div>

    </div>
  );
}
