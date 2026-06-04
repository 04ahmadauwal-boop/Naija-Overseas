import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../utils/api';
import SchoolCard from '../components/SchoolCard';
import toast from 'react-hot-toast';

const STATE_META = {
  Lagos:  { emoji: '🏙️', color: 'from-orange-600 to-amber-500',  bg: 'from-orange-50 to-amber-50',  desc: "Nigeria's commercial capital and education hub — home to the highest concentration of top private and international schools." },
  FCT:    { emoji: '🏛️', color: 'from-blue-700 to-sky-500',      bg: 'from-blue-50 to-sky-50',      desc: 'The Federal Capital Territory hosts elite federal schools, embassies and top private institutions in a planned city environment.' },
  Kano:   { emoji: '🌾', color: 'from-yellow-600 to-lime-500',   bg: 'from-yellow-50 to-lime-50',   desc: "Northern Nigeria's most populated state with a growing collection of strong private and government-backed schools." },
  Rivers: { emoji: '🛢️', color: 'from-teal-700 to-emerald-500', bg: 'from-teal-50 to-emerald-50',  desc: 'Port Harcourt drives South-South excellence — a blend of oil-sector prosperity and strong academic institutions.' },
  Ogun:   { emoji: '🌲', color: 'from-green-700 to-emerald-500', bg: 'from-green-50 to-emerald-50', desc: "Ogun State's strategic location between Lagos and Ibadan makes it a gateway to quality education for South-West families." },
  Enugu:  { emoji: '⛏️', color: 'from-stone-600 to-gray-500',   bg: 'from-stone-50 to-gray-50',    desc: "The Coal City State is one of South-East Nigeria's academic centres — known for discipline and strong secondary schools." },
  Oyo:    { emoji: '🏯', color: 'from-purple-700 to-violet-500', bg: 'from-purple-50 to-violet-50', desc: 'Ibadan, Nigeria\'s largest city by land mass, anchors Oyo State\'s academic legacy with historic institutions and modern schools.' },
  Delta:  { emoji: '🌊', color: 'from-cyan-700 to-blue-500',    bg: 'from-cyan-50 to-blue-50',     desc: 'Delta State combines Niger Delta wealth with strong academic ambition — offering a range of private and public school options.' },
};

const DEFAULT_META = {
  emoji: '🏫',
  color: 'from-green-700 to-emerald-500',
  bg: 'from-green-50 to-emerald-50',
  desc: 'Discover verified, top-rated schools in this state — compare fees, curriculum, type and more.',
};

export default function StateSchools() {
  const { state } = useParams();
  const navigate = useNavigate();
  const meta = STATE_META[state] || DEFAULT_META;

  const [schools, setSchools] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);

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

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── HERO BANNER ─────────────────────────────────────── */}
      <div className={`bg-gradient-to-r ${meta.color} text-white`}>
        <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">

          {/* Back link */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-white/70 hover:text-white text-sm font-medium mb-5 sm:mb-7 transition"
          >
            <ArrowLeft size={15} /> Back
          </button>

          <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-8">
            {/* Emoji badge */}
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

            {/* Count badge */}
            {!loading && (
              <div className="shrink-0 bg-white/15 backdrop-blur-sm rounded-2xl px-5 py-3 text-center border border-white/20 self-start sm:self-auto">
                <div className="text-2xl sm:text-3xl font-extrabold">{total}</div>
                <div className="text-white/70 text-xs font-semibold mt-0.5">Schools found</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── SCHOOL GRID ─────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">

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

            {/* Pagination */}
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
