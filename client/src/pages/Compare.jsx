import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, X, Plus, GraduationCap, MapPin, ChevronRight, ExternalLink, Bookmark } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const ROWS = [
  { label: 'Type',         key: 'type',            format: (v) => v },
  { label: 'Level',        key: 'level',            format: (v) => v },
  { label: 'State',        key: 'state'                               },
  { label: 'City',         key: 'city'                                },
  { label: 'Tuition Fee',  key: 'fees.tuition',     format: (v) => v ? `₦${Number(v).toLocaleString()}/yr` : 'Contact school' },
  { label: 'Boarding Fee', key: 'fees.boarding',    format: (v) => v ? `₦${Number(v).toLocaleString()}/yr` : 'Day school' },
  { label: 'Curriculum',   key: 'curriculum',       format: (v) => Array.isArray(v) && v.length ? v.join(', ') : 'N/A' },
  { label: 'Facilities',   key: 'facilities',       format: (v) => Array.isArray(v) && v.length ? v.slice(0, 4).join(', ') + (v.length > 4 ? ` +${v.length - 4} more` : '') : 'N/A' },
  { label: 'Phone',        key: 'contact.phone'                       },
  { label: 'Email',        key: 'contact.email'                       },
  { label: 'Website',      key: 'contact.website'                     },
];

const COL_ACCENT = ['border-green-500', 'border-blue-500', 'border-purple-500'];
const COL_BG     = ['bg-green-700',     'bg-blue-700',     'bg-purple-700'    ];

function getNestedValue(obj, path) {
  return path.split('.').reduce((acc, key) => acc?.[key], obj);
}

function getSaved() {
  try { return JSON.parse(localStorage.getItem('savedSchools') || '[]'); } catch { return []; }
}

function SchoolCard({ school, index, onRemove }) {
  const [saved, setSaved] = useState(() => getSaved().includes(school._id));

  const toggleSave = () => {
    const list = getSaved();
    const next = list.includes(school._id)
      ? list.filter((id) => id !== school._id)
      : [...list, school._id];
    localStorage.setItem('savedSchools', JSON.stringify(next));
    setSaved(!saved);
    toast.success(saved ? 'Removed from saved schools' : 'School saved!');
  };

  const identifier = school.slug || school._id;

  return (
    <div className={`relative flex flex-col rounded-2xl overflow-hidden border-2 ${COL_ACCENT[index]} bg-white shadow-md`}>
      {/* Remove */}
      <button
        onClick={() => onRemove(school._id)}
        title="Remove"
        className="absolute top-2 right-2 z-10 w-7 h-7 bg-black/50 hover:bg-red-500 rounded-full flex items-center justify-center transition"
      >
        <X size={12} className="text-white" />
      </button>

      {/* Cover image */}
      <div className="aspect-video w-full overflow-hidden bg-gray-200 shrink-0">
        {school.images?.[0] ? (
          <img src={school.images[0]} alt={school.name} className="w-full h-full object-cover" />
        ) : (
          <div className={`w-full h-full ${COL_BG[index]} flex items-center justify-center`}>
            <GraduationCap size={32} className="text-white/40" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1">
        <p className="font-extrabold text-gray-900 text-sm leading-tight line-clamp-2 mb-0.5">{school.name}</p>
        <p className="text-[11px] text-gray-500 flex items-center gap-0.5 mb-3">
          <MapPin size={10} className="shrink-0" />
          {[school.city, school.state].filter(Boolean).join(', ') || '—'}
        </p>

        {/* Action buttons */}
        <div className="flex gap-2 mt-auto">
          <Link
            to={`/schools/${identifier}`}
            className="flex-1 flex items-center justify-center gap-1.5 bg-green-700 hover:bg-green-800 text-white text-xs font-bold px-3 py-2 rounded-xl transition shadow-sm"
          >
            <ExternalLink size={12} /> View School
          </Link>
          <button
            onClick={toggleSave}
            title={saved ? 'Unsave' : 'Save school'}
            className={`w-9 h-9 flex items-center justify-center rounded-xl border-2 transition ${
              saved
                ? 'bg-amber-50 border-amber-300 text-amber-500'
                : 'bg-gray-50 border-gray-200 text-gray-400 hover:border-amber-300 hover:text-amber-500 hover:bg-amber-50'
            }`}
          >
            <Bookmark size={14} className={saved ? 'fill-amber-400' : ''} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Compare() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [schools, setSchools] = useState(state?.schools || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSearch(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = async (query) => {
    if (!query.trim()) { setSearchResults([]); setShowSearch(false); return; }
    setLoading(true);
    try {
      const { data } = await api.get('/schools', { params: { search: query, limit: 6 } });
      setSearchResults(data.schools || []);
      setShowSearch(true);
    } catch {
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const addToCompare = (school) => {
    if (schools.find((s) => s._id === school._id)) { toast('Already in comparison'); return; }
    if (schools.length >= 3) { toast.error('Max 3 schools at a time'); return; }
    setSchools([...schools, school]);
    setSearchQuery('');
    setShowSearch(false);
    setShowSearchBar(false);
    toast.success(`${school.name} added`);
  };

  const removeFromCompare = (id) => setSchools(schools.filter((s) => s._id !== id));

  const SearchDropdown = ({ results, isLoading }) => (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
      {isLoading ? (
        <div className="px-4 py-4 text-sm text-gray-400 text-center">Searching…</div>
      ) : results.length === 0 ? (
        <div className="px-4 py-4 text-sm text-gray-400 text-center">No schools found</div>
      ) : (
        <ul className="divide-y divide-gray-50">
          {results.map((school) => (
            <li key={school._id}>
              <button onClick={() => addToCompare(school)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-left">
                <div className="w-9 h-9 rounded-lg overflow-hidden bg-green-100 shrink-0">
                  {school.images?.[0]
                    ? <img src={school.images[0]} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center"><GraduationCap size={14} className="text-green-600" /></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{school.name}</p>
                  <p className="text-xs text-gray-400 truncate">{[school.city, school.state].filter(Boolean).join(', ')} · {school.type}</p>
                </div>
                <Plus size={14} className="text-green-500 shrink-0" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  if (!schools.length) return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-green-50 border-2 border-dashed border-green-200 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <GraduationCap size={28} className="text-green-500" />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Compare Schools</h2>
        <p className="text-gray-500 text-sm mb-8">Search for schools below to start comparing fees, facilities, results and more — side by side.</p>
        <div ref={searchRef} className="relative max-w-md mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input autoFocus type="text" value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); handleSearch(e.target.value); }}
            placeholder="Search for a school to compare..."
            className="w-full pl-11 pr-10 py-3.5 rounded-2xl border-2 border-gray-200 focus:outline-none focus:border-green-500 text-sm bg-white shadow-sm" />
          {searchQuery && (
            <button onClick={() => { setSearchQuery(''); setSearchResults([]); setShowSearch(false); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          )}
          {showSearch && <SearchDropdown results={searchResults} isLoading={loading} />}
        </div>
        <p className="text-xs text-gray-400 mt-6">You can compare up to 3 schools at once</p>
        <div className="mt-8 pt-6 border-t border-gray-200">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-green-700 font-medium transition">
            <ArrowLeft size={14} /> Browse school directory instead
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── STICKY HEADER ──────────────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-700 transition shrink-0">
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Back</span>
            </button>
            <div className="h-5 w-px bg-gray-200 hidden sm:block" />
            <h1 className="text-base sm:text-lg font-extrabold text-gray-900 truncate">Compare Schools</h1>
            <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full shrink-0">{schools.length}/3</span>
          </div>
          {schools.length < 3 && (
            <button onClick={() => setShowSearchBar((v) => !v)}
              className="flex items-center gap-1.5 text-sm font-semibold text-green-700 border border-green-200 bg-green-50 px-3 py-2 rounded-xl hover:bg-green-100 transition shrink-0">
              <Plus size={14} /> Add School
            </button>
          )}
        </div>

        {showSearchBar && schools.length < 3 && (
          <div className="border-t border-gray-100 px-4 py-3" ref={searchRef}>
            <div className="relative max-w-lg mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
              <input autoFocus type="text" value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); handleSearch(e.target.value); }}
                placeholder="Search school name..."
                className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm bg-white" />
              {searchQuery && (
                <button onClick={() => { setSearchQuery(''); setSearchResults([]); setShowSearch(false); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <X size={14} />
                </button>
              )}
              {showSearch && <SearchDropdown results={searchResults} isLoading={loading} />}
            </div>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 py-5 sm:py-8 space-y-5 sm:space-y-6">

        {/* ── SCHOOL CARDS ───────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              Comparing {schools.length} school{schools.length !== 1 ? 's' : ''}
            </p>
            {schools.length < 3 && (
              <p className="text-xs text-gray-400">Add up to {3 - schools.length} more</p>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {schools.map((s, i) => (
              <SchoolCard key={s._id} school={s} index={i} onRemove={removeFromCompare} />
            ))}
            {schools.length < 3 && (
              <button
                onClick={() => setShowSearchBar(true)}
                className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-gray-200 bg-white hover:border-green-400 hover:bg-green-50 transition min-h-[180px]"
              >
                <div className="w-12 h-12 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center group-hover:border-green-400">
                  <Plus size={22} className="text-gray-300" />
                </div>
                <p className="text-xs text-gray-400 font-semibold">Add a school</p>
              </button>
            )}
          </div>
        </div>

        {/* ── COMPARISON TABLE ───────────────────────────────────── */}
        <div className="rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="sm:hidden bg-blue-50 border-b border-blue-100 px-4 py-2">
            <span className="text-xs text-blue-600 font-medium">← Swipe to compare all schools →</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ minWidth: `${Math.max(340, schools.length * 180 + 140)}px` }}>
              <thead>
                <tr>
                  <th className="sticky left-0 z-10 bg-green-800 text-white text-left px-4 py-4 font-semibold text-xs uppercase tracking-wide w-32 sm:w-44 whitespace-nowrap">
                    Feature
                  </th>
                  {schools.map((s, i) => (
                    <th key={s._id} className="bg-green-800 text-white px-4 py-4 font-semibold text-center min-w-44 sm:min-w-52">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-14 h-10 rounded-xl overflow-hidden border-2 border-white/30 shrink-0">
                          {s.images?.[0]
                            ? <img src={s.images[0]} alt={s.name} className="w-full h-full object-cover" />
                            : <div className={`w-full h-full ${COL_BG[i]} flex items-center justify-center`}><GraduationCap size={14} className="text-white" /></div>}
                        </div>
                        <span className="text-xs font-bold leading-tight">{s.name}</span>
                        <Link
                          to={`/schools/${s.slug || s._id}`}
                          className="flex items-center gap-1 bg-white/15 hover:bg-white/30 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full transition border border-white/20"
                        >
                          <ExternalLink size={10} /> View School
                        </Link>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {/* Photo row */}
                <tr className="bg-gray-50/60">
                  <td className="sticky left-0 z-10 px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide whitespace-nowrap border-r border-gray-100 bg-gray-50">
                    Photo
                  </td>
                  {schools.map((s, i) => (
                    <td key={s._id} className="px-4 py-3 text-center">
                      <div className="w-full aspect-video rounded-xl overflow-hidden bg-gray-200 mx-auto max-w-[180px]">
                        {s.images?.[0]
                          ? <img src={s.images[0]} alt={s.name} className="w-full h-full object-cover" />
                          : <div className={`w-full h-full ${COL_BG[i]} flex items-center justify-center`}><GraduationCap size={22} className="text-white/50" /></div>}
                      </div>
                    </td>
                  ))}
                </tr>

                {ROWS.map((row, i) => {
                  const values = schools.map((s) => {
                    const raw = getNestedValue(s, row.key);
                    return row.format ? row.format(raw) : (raw || '—');
                  });
                  const allSame = values.every((v) => v === values[0]);

                  return (
                    <tr key={row.key} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'}>
                      <td className="sticky left-0 z-10 px-4 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide whitespace-nowrap border-r border-gray-100"
                        style={{ background: i % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
                        {row.label}
                      </td>
                      {values.map((value, vi) => (
                        <td key={vi}
                          className={`px-4 py-3.5 text-center text-gray-800 text-sm capitalize leading-snug ${!allSame && schools.length > 1 ? 'font-semibold' : ''}`}>
                          {value === '—' || value === 'N/A'
                            ? <span className="text-gray-300 text-xs">—</span>
                            : value}
                        </td>
                      ))}
                    </tr>
                  );
                })}

                {/* Actions row */}
                <tr className="bg-white border-t-2 border-gray-100">
                  <td className="sticky left-0 z-10 px-4 py-4 font-semibold text-gray-600 text-xs uppercase tracking-wide whitespace-nowrap border-r border-gray-100 bg-white">
                    Actions
                  </td>
                  {schools.map((s) => {
                    const identifier = s.slug || s._id;
                    return (
                      <td key={s._id} className="px-4 py-4 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <Link to={`/schools/${identifier}`}
                            className="inline-flex items-center gap-1.5 bg-green-700 hover:bg-green-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-sm w-full justify-center">
                            <ExternalLink size={12} /> View School
                          </Link>
                          <SaveButton school={s} />
                        </div>
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ── BOTTOM ACTIONS ─────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 border border-gray-200 bg-white px-5 py-2.5 rounded-xl hover:bg-gray-50 transition">
            <ArrowLeft size={15} /> Browse More Schools
          </Link>
          <p className="text-xs text-gray-400">
            {schools.length < 3
              ? `You can add ${3 - schools.length} more school${3 - schools.length !== 1 ? 's' : ''} to compare`
              : 'Comparison is at maximum capacity (3 schools)'}
          </p>
        </div>
      </div>
    </div>
  );
}

function SaveButton({ school }) {
  const [saved, setSaved] = useState(() => getSaved().includes(school._id));

  const toggle = () => {
    const list = getSaved();
    const next = list.includes(school._id)
      ? list.filter((id) => id !== school._id)
      : [...list, school._id];
    localStorage.setItem('savedSchools', JSON.stringify(next));
    setSaved(!saved);
    toast.success(saved ? 'Removed from saved' : 'School saved!');
  };

  return (
    <button onClick={toggle}
      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl border-2 transition w-full justify-center ${
        saved
          ? 'bg-amber-50 border-amber-300 text-amber-600 hover:bg-amber-100'
          : 'bg-white border-gray-200 text-gray-500 hover:border-amber-300 hover:text-amber-600 hover:bg-amber-50'
      }`}>
      <Bookmark size={12} className={saved ? 'fill-amber-500' : ''} />
      {saved ? 'Saved' : 'Save School'}
    </button>
  );
}
