import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, MapPin, ChevronLeft, ChevronRight, Download, Calendar, Image as ImageIcon } from 'lucide-react';
import api from '../utils/api';
import SchoolCard from '../components/SchoolCard';
import toast from 'react-hot-toast';

const STATE_META = {
  Lagos:  { emoji: '🏙️', color: 'from-orange-600 to-amber-500',  bg: 'from-orange-50 to-amber-50',  desc: "Nigeria's commercial capital and education hub — home to the highest concentration of top private and international schools.", landmark: 'Lekki-Ikoyi Link Bridge, Lagos' },
  FCT:    { emoji: '🏛️', color: 'from-blue-700 to-sky-500',      bg: 'from-blue-50 to-sky-50',      desc: 'The Federal Capital Territory hosts elite federal schools, embassies and top private institutions in a planned city environment.', landmark: 'Aso Rock, Abuja' },
  Kano:   { emoji: '🌾', color: 'from-yellow-600 to-lime-500',   bg: 'from-yellow-50 to-lime-50',   desc: "Northern Nigeria's most populated state with a growing collection of strong private and government-backed schools.", landmark: "Emir's Palace, Kano" },
  Rivers: { emoji: '🛢️', color: 'from-teal-700 to-emerald-500', bg: 'from-teal-50 to-emerald-50',  desc: 'Port Harcourt drives South-South excellence — a blend of oil-sector prosperity and strong academic institutions.', landmark: 'Port Harcourt Waterfront' },
  Ogun:   { emoji: '🌲', color: 'from-green-700 to-emerald-500', bg: 'from-green-50 to-emerald-50', desc: "Ogun State's strategic location between Lagos and Ibadan makes it a gateway to quality education for South-West families.", landmark: 'Olumo Rock, Abeokuta' },
  Enugu:  { emoji: '⛏️', color: 'from-stone-600 to-gray-500',   bg: 'from-stone-50 to-gray-50',    desc: "The Coal City State is one of South-East Nigeria's academic centres — known for discipline and strong secondary schools.", landmark: 'Nike Lake Resort, Enugu' },
  Oyo:    { emoji: '🏯', color: 'from-purple-700 to-violet-500', bg: 'from-purple-50 to-violet-50', desc: "Ibadan, Nigeria's largest city by land mass, anchors Oyo State's academic legacy with historic institutions and modern schools.", landmark: 'Cocoa House, Ibadan' },
  Delta:  { emoji: '🌊', color: 'from-cyan-700 to-blue-500',    bg: 'from-cyan-50 to-blue-50',     desc: 'Delta State combines Niger Delta wealth with strong academic ambition — offering a range of private and public school options.', landmark: 'Abraka River Resort, Delta' },
};

const DEFAULT_META = {
  emoji: '🏫',
  color: 'from-green-700 to-emerald-500',
  bg: 'from-green-50 to-emerald-50',
  desc: 'Discover verified, top-rated schools in this state — compare fees, curriculum, type and more.',
  landmark: '',
};

// Academic calendars per state (2025/2026 session)
// Place approved state landmark photos at: public/images/states/{state-lowercase}.jpg
const STATE_CALENDARS = {
  Lagos: {
    year: '2025/2026', authority: 'Lagos State Ministry of Education',
    terms: [
      { name: 'First Term',  start: 'Sep 15, 2025', end: 'Dec 19, 2025', weeks: '14 wks' },
      { name: 'Second Term', start: 'Jan 12, 2026', end: 'Apr 2, 2026',  weeks: '12 wks' },
      { name: 'Third Term',  start: 'Apr 27, 2026', end: 'Jul 24, 2026', weeks: '13 wks' },
    ],
    breaks: [
      { name: 'Mid-Term Break (1st)',  dates: 'Oct 27–31, 2025' },
      { name: 'Christmas Break',       dates: 'Dec 20, 2025 – Jan 11, 2026' },
      { name: 'Mid-Term Break (2nd)',  dates: 'Feb 23–27, 2026' },
      { name: 'Easter Break',          dates: 'Apr 3–26, 2026' },
      { name: 'Long Vacation',         dates: 'Jul 25 – Sep 14, 2026' },
    ],
  },
  FCT: {
    year: '2025/2026', authority: 'FCT Education Secretariat',
    terms: [
      { name: 'First Term',  start: 'Sep 22, 2025', end: 'Dec 20, 2025', weeks: '13 wks' },
      { name: 'Second Term', start: 'Jan 19, 2026', end: 'Apr 9, 2026',  weeks: '12 wks' },
      { name: 'Third Term',  start: 'Apr 27, 2026', end: 'Jul 25, 2026', weeks: '13 wks' },
    ],
    breaks: [
      { name: 'Mid-Term Break (1st)',  dates: 'Nov 3–7, 2025' },
      { name: 'Christmas Break',       dates: 'Dec 21, 2025 – Jan 18, 2026' },
      { name: 'Mid-Term Break (2nd)',  dates: 'Mar 2–6, 2026' },
      { name: 'Easter Break',          dates: 'Apr 10–26, 2026' },
      { name: 'Long Vacation',         dates: 'Jul 26 – Sep 21, 2026' },
    ],
  },
  Kano: {
    year: '2025/2026', authority: 'Kano State Ministry of Education',
    terms: [
      { name: 'First Term',  start: 'Sep 8, 2025',  end: 'Dec 12, 2025', weeks: '14 wks' },
      { name: 'Second Term', start: 'Jan 5, 2026',  end: 'Mar 27, 2026', weeks: '12 wks' },
      { name: 'Third Term',  start: 'Apr 20, 2026', end: 'Jul 17, 2026', weeks: '13 wks' },
    ],
    breaks: [
      { name: 'Mid-Term Break (1st)',  dates: 'Oct 20–24, 2025' },
      { name: 'Christmas Break',       dates: 'Dec 13, 2025 – Jan 4, 2026' },
      { name: 'Mid-Term Break (2nd)',  dates: 'Feb 16–20, 2026' },
      { name: 'Easter Break',          dates: 'Mar 28 – Apr 19, 2026' },
      { name: 'Long Vacation',         dates: 'Jul 18 – Sep 7, 2026' },
    ],
  },
  Rivers: {
    year: '2025/2026', authority: 'Rivers State Ministry of Education',
    terms: [
      { name: 'First Term',  start: 'Sep 15, 2025', end: 'Dec 19, 2025', weeks: '14 wks' },
      { name: 'Second Term', start: 'Jan 12, 2026', end: 'Apr 3, 2026',  weeks: '12 wks' },
      { name: 'Third Term',  start: 'Apr 27, 2026', end: 'Jul 24, 2026', weeks: '13 wks' },
    ],
    breaks: [
      { name: 'Mid-Term Break (1st)',  dates: 'Oct 27–31, 2025' },
      { name: 'Christmas Break',       dates: 'Dec 20, 2025 – Jan 11, 2026' },
      { name: 'Mid-Term Break (2nd)',  dates: 'Feb 23–27, 2026' },
      { name: 'Easter Break',          dates: 'Apr 4–26, 2026' },
      { name: 'Long Vacation',         dates: 'Jul 25 – Sep 14, 2026' },
    ],
  },
  Ogun: {
    year: '2025/2026', authority: 'Ogun State Ministry of Education',
    terms: [
      { name: 'First Term',  start: 'Sep 15, 2025', end: 'Dec 12, 2025', weeks: '13 wks' },
      { name: 'Second Term', start: 'Jan 12, 2026', end: 'Apr 3, 2026',  weeks: '12 wks' },
      { name: 'Third Term',  start: 'Apr 27, 2026', end: 'Jul 18, 2026', weeks: '12 wks' },
    ],
    breaks: [
      { name: 'Mid-Term Break (1st)',  dates: 'Oct 20–24, 2025' },
      { name: 'Christmas Break',       dates: 'Dec 13, 2025 – Jan 11, 2026' },
      { name: 'Mid-Term Break (2nd)',  dates: 'Feb 23–27, 2026' },
      { name: 'Easter Break',          dates: 'Apr 4–26, 2026' },
      { name: 'Long Vacation',         dates: 'Jul 19 – Sep 14, 2026' },
    ],
  },
  Enugu: {
    year: '2025/2026', authority: 'Enugu State Ministry of Education',
    terms: [
      { name: 'First Term',  start: 'Sep 15, 2025', end: 'Dec 12, 2025', weeks: '13 wks' },
      { name: 'Second Term', start: 'Jan 12, 2026', end: 'Apr 2, 2026',  weeks: '12 wks' },
      { name: 'Third Term',  start: 'Apr 27, 2026', end: 'Jul 18, 2026', weeks: '12 wks' },
    ],
    breaks: [
      { name: 'Mid-Term Break (1st)',  dates: 'Oct 20–24, 2025' },
      { name: 'Christmas Break',       dates: 'Dec 13, 2025 – Jan 11, 2026' },
      { name: 'Mid-Term Break (2nd)',  dates: 'Feb 16–20, 2026' },
      { name: 'Easter Break',          dates: 'Apr 3–26, 2026' },
      { name: 'Long Vacation',         dates: 'Jul 19 – Sep 14, 2026' },
    ],
  },
  Oyo: {
    year: '2025/2026', authority: 'Oyo State Ministry of Education',
    terms: [
      { name: 'First Term',  start: 'Sep 15, 2025', end: 'Dec 12, 2025', weeks: '13 wks' },
      { name: 'Second Term', start: 'Jan 12, 2026', end: 'Apr 2, 2026',  weeks: '12 wks' },
      { name: 'Third Term',  start: 'Apr 27, 2026', end: 'Jul 24, 2026', weeks: '13 wks' },
    ],
    breaks: [
      { name: 'Mid-Term Break (1st)',  dates: 'Oct 20–24, 2025' },
      { name: 'Christmas Break',       dates: 'Dec 13, 2025 – Jan 11, 2026' },
      { name: 'Mid-Term Break (2nd)',  dates: 'Feb 16–20, 2026' },
      { name: 'Easter Break',          dates: 'Apr 3–26, 2026' },
      { name: 'Long Vacation',         dates: 'Jul 25 – Sep 14, 2026' },
    ],
  },
  Delta: {
    year: '2025/2026', authority: 'Delta State Ministry of Education',
    terms: [
      { name: 'First Term',  start: 'Sep 22, 2025', end: 'Dec 19, 2025', weeks: '13 wks' },
      { name: 'Second Term', start: 'Jan 19, 2026', end: 'Apr 9, 2026',  weeks: '12 wks' },
      { name: 'Third Term',  start: 'Apr 27, 2026', end: 'Jul 25, 2026', weeks: '13 wks' },
    ],
    breaks: [
      { name: 'Mid-Term Break (1st)',  dates: 'Nov 3–7, 2025' },
      { name: 'Christmas Break',       dates: 'Dec 20, 2025 – Jan 18, 2026' },
      { name: 'Mid-Term Break (2nd)',  dates: 'Mar 2–6, 2026' },
      { name: 'Easter Break',          dates: 'Apr 10–26, 2026' },
      { name: 'Long Vacation',         dates: 'Jul 26 – Sep 21, 2026' },
    ],
  },
};

const DEFAULT_CALENDAR = {
  year: '2025/2026', authority: 'Federal Ministry of Education',
  terms: [
    { name: 'First Term',  start: 'Sep 15, 2025', end: 'Dec 19, 2025', weeks: '14 wks' },
    { name: 'Second Term', start: 'Jan 12, 2026', end: 'Apr 2, 2026',  weeks: '12 wks' },
    { name: 'Third Term',  start: 'Apr 27, 2026', end: 'Jul 24, 2026', weeks: '13 wks' },
  ],
  breaks: [
    { name: 'Christmas Break', dates: 'Dec 20, 2025 – Jan 11, 2026' },
    { name: 'Easter Break',    dates: 'Apr 3–26, 2026' },
    { name: 'Long Vacation',   dates: 'Jul 25 – Sep 14, 2026' },
  ],
};

const TERM_COLORS = ['bg-green-50 border-green-200 text-green-800', 'bg-blue-50 border-blue-200 text-blue-800', 'bg-purple-50 border-purple-200 text-purple-800'];

function downloadCalendar(stateName, calData) {
  const lines = [
    `${stateName.toUpperCase()} STATE SCHOOL ACADEMIC CALENDAR ${calData.year}`,
    `Approved by: ${calData.authority}`,
    `Downloaded from naijaandoverseas.com`,
    '',
    'ACADEMIC TERMS',
    'Term,Resumption Date,Closing Date,Duration',
    ...calData.terms.map(t => `${t.name},${t.start},${t.end},${t.weeks}`),
    '',
    'HOLIDAY & BREAK PERIODS',
    'Period,Dates',
    ...calData.breaks.map(b => `"${b.name}","${b.dates}"`),
  ];
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${stateName}_School_Calendar_${calData.year.replace('/', '-')}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function StateSchools() {
  const { state } = useParams();
  const navigate = useNavigate();
  const meta     = STATE_META[state]     || DEFAULT_META;
  const calData  = STATE_CALENDARS[state] || DEFAULT_CALENDAR;

  const [schools, setSchools]         = useState([]);
  const [total, setTotal]             = useState(0);
  const [pages, setPages]             = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading]         = useState(true);
  const [selected, setSelected]       = useState([]);
  const [imgError, setImgError]       = useState(false);

  const fetchSchools = async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get('/schools', { params: { state, page, limit: 12 } });
      setSchools(data.schools);
      setTotal(data.total);
      setPages(data.pages);
      setCurrentPage(page);
    } catch {
      toast.error('Failed to load schools');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    setImgError(false);
    fetchSchools(1);
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCompare = (school) => {
    if (selected.find((s) => s._id === school._id)) {
      setSelected(selected.filter((s) => s._id !== school._id));
    } else if (selected.length >= 3) {
      toast.error('You can compare up to 3 schools at a time');
    } else {
      setSelected([...selected, school]);
    }
  };

  const goCompare = () => {
    if (selected.length < 2) { toast.error('Select at least 2 schools to compare'); return; }
    navigate('/compare', { state: { schools: selected } });
  };

  const handleDownload = () => {
    downloadCalendar(state, calData);
    toast.success(`${state} school calendar downloaded!`);
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── HERO BANNER ─────────────────────────────────────── */}
      <div className={`bg-gradient-to-r ${meta.color} text-white`}>
        <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">

          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-white/70 hover:text-white text-sm font-medium mb-5 sm:mb-7 transition"
          >
            <ArrowLeft size={15} /> Back
          </button>

          <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-8">
            <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl sm:text-5xl shrink-0 shadow-lg">
              {meta.emoji}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <MapPin size={13} className="text-white/60" />
                <span className="text-white/60 text-xs font-semibold uppercase tracking-widest">Nigeria</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-2 leading-tight">
                Best Schools in {state}
              </h1>
              <p className="text-white/75 text-sm sm:text-base max-w-2xl leading-relaxed">
                {meta.desc}
              </p>
            </div>

            {!loading && (
              <div className="shrink-0 bg-white/15 backdrop-blur-sm rounded-2xl px-5 py-3 text-center border border-white/20 self-start sm:self-auto">
                <div className="text-2xl sm:text-3xl font-extrabold">{total}</div>
                <div className="text-white/70 text-xs font-semibold mt-0.5">Schools found</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── LANDMARK PHOTO + CALENDAR ROW ───────────────────── */}
      <div className="max-w-7xl mx-auto px-4 pt-6 pb-2">
        <div className="flex flex-col lg:flex-row gap-5">

          {/* State landmark photo */}
          <div className="lg:w-[62%] rounded-2xl overflow-hidden shadow-sm border border-gray-100 relative h-64 sm:h-80 lg:h-72 bg-gray-100">
            {!imgError ? (
              <img
                src={`/images/states/${state.toLowerCase()}.jpg`}
                alt={meta.landmark || `${state} State`}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className={`w-full h-full bg-gradient-to-br ${meta.color} flex flex-col items-center justify-center gap-3`}>
                <span className="text-7xl">{meta.emoji}</span>
                <p className="text-white/90 font-semibold text-base sm:text-lg text-center px-4">
                  {meta.landmark || `${state} State`}
                </p>
              </div>
            )}
            {/* Caption overlay */}
            {!imgError && meta.landmark && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <ImageIcon size={12} className="text-white/70" />
                  <span className="text-white/90 text-xs font-medium">{meta.landmark}</span>
                </div>
              </div>
            )}
            {/* Add photo hint shown only when using fallback */}
            {imgError && (
              <div className="absolute top-3 right-3 bg-black/30 backdrop-blur-sm text-white/70 text-[10px] px-2 py-1 rounded-lg">
                Add photo → public/images/states/{state.toLowerCase()}.jpg
              </div>
            )}
          </div>

          {/* Academic calendar card */}
          <div className="lg:w-[38%] bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col">
            {/* Card header */}
            <div className={`bg-gradient-to-r ${meta.color} text-white px-5 py-4 rounded-t-2xl`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-white/80" />
                  <span className="font-bold text-sm">Academic Calendar</span>
                </div>
                <span className="text-white/70 text-xs font-semibold bg-white/15 px-2.5 py-0.5 rounded-full">
                  {calData.year}
                </span>
              </div>
              <p className="text-white/65 text-[11px] mt-1 leading-snug">{calData.authority}</p>
            </div>

            {/* Terms */}
            <div className="px-4 pt-4 pb-2 flex-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">School Terms</p>
              <div className="space-y-2">
                {calData.terms.map((term, i) => (
                  <div key={term.name} className={`border rounded-xl px-3 py-2.5 ${TERM_COLORS[i] || TERM_COLORS[0]}`}>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-bold">{term.name}</span>
                      <span className="text-[10px] font-semibold opacity-70">{term.weeks}</span>
                    </div>
                    <p className="text-[11px] opacity-75">{term.start} – {term.end}</p>
                  </div>
                ))}
              </div>

              {/* Breaks */}
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-3.5 mb-2">Holidays & Breaks</p>
              <div className="space-y-1.5">
                {calData.breaks.map((brk) => (
                  <div key={brk.name} className="flex items-start gap-2 text-[11px] text-gray-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-1.5 shrink-0" />
                    <span>
                      <span className="font-semibold text-gray-700">{brk.name}:</span> {brk.dates}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Download button */}
            <div className="px-4 pb-4 pt-3 border-t border-gray-50">
              <button
                onClick={handleDownload}
                className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r ${meta.color} text-white text-sm font-semibold py-2.5 rounded-xl hover:opacity-90 transition shadow-sm`}
              >
                <Download size={14} />
                Download Calendar (.csv)
              </button>
              <p className="text-center text-[10px] text-gray-400 mt-1.5">Opens in Excel, Google Sheets &amp; more</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── SCHOOL GRID ─────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-10">

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-72 animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : schools.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <BookOpen size={44} className="mx-auto mb-4 opacity-30" />
            <p className="font-semibold text-gray-600 text-lg">No schools found in {state}</p>
            <p className="text-sm mt-1 mb-6">We're still growing our listings in this state.</p>
            <Link to="/" className="inline-block bg-green-700 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-green-800 transition text-sm">
              Browse all schools
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-500 text-sm">
                Showing <span className="font-semibold text-gray-900">{schools.length}</span> of <span className="font-semibold text-gray-900">{total}</span> schools
              </p>
              <Link to="/compare" className="text-green-700 text-sm font-semibold hover:underline hidden sm:block">
                Compare schools →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {schools.map((school) => (
                <SchoolCard
                  key={school._id}
                  school={school}
                  onCompare={handleCompare}
                  isSelected={!!selected.find((s) => s._id === school._id)}
                />
              ))}
            </div>

            {pages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-10">
                <button
                  onClick={() => fetchSchools(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => fetchSchools(p)}
                    className={`w-9 h-9 rounded-lg text-sm font-semibold transition ${
                      p === currentPage
                        ? 'bg-green-700 text-white shadow-sm'
                        : 'border border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => fetchSchools(currentPage + 1)}
                  disabled={currentPage === pages}
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── COMPARE STICKY BAR ──────────────────────────────── */}
      {selected.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white z-50 py-3.5 px-4 flex items-center justify-between shadow-2xl border-t border-gray-700">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-semibold">{selected.length} selected</span>
            {selected.map((s) => (
              <span key={s._id} className="text-xs bg-gray-700 px-2.5 py-1 rounded-full">{s.name}</span>
            ))}
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={() => setSelected([])} className="text-xs border border-gray-600 px-3.5 py-1.5 rounded-lg hover:bg-gray-700 transition">Clear</button>
            <button onClick={goCompare} className="text-xs bg-green-600 font-semibold px-5 py-1.5 rounded-lg hover:bg-green-500 transition">
              Compare Now →
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
