import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, X, Plus, GraduationCap, MapPin, ChevronRight } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const ROWS = [
  { label: 'Type', key: 'type', format: (v) => v },
  { label: 'Level', key: 'level', format: (v) => v },
  { label: 'State', key: 'state' },
  { label: 'City', key: 'city' },
  { label: 'Tuition Fee', key: 'fees.tuition', format: (v) => v ? `₦${Number(v).toLocaleString()}/yr` : 'Contact school' },
  { label: 'Boarding Fee', key: 'fees.boarding', format: (v) => v ? `₦${Number(v).toLocaleString()}/yr` : 'Day school' },
  { label: 'Curriculum', key: 'curriculum', format: (v) => Array.isArray(v) && v.length ? v.join(', ') : 'N/A' },
  { label: 'Facilities', key: 'facilities', format: (v) => Array.isArray(v) && v.length ? v.slice(0, 4).join(', ') + (v.length > 4 ? ` +${v.length - 4} more` : '') : 'N/A' },
  { label: 'Phone', key: 'contact.phone' },
  { label: 'Email', key: 'contact.email' },
  { label: 'Website', key: 'contact.website' },
];

const COLORS = ['bg-green-700', 'bg-blue-700', 'bg-purple-700'];

function getNestedValue(obj, path) {
  return path.split('.').reduce((acc, key) => acc?.[key], obj);
}

function SchoolHeaderCard({ school, index, onRemove }) {
  return (
    <div className="relative flex flex-col items-center gap-2 min-w-0">
      <button
        onClick={() => onRemove(school._id)}
        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center z-10 shadow"
        title="Remove"
      >
        <X size={10} className="text-white" />
      </button>
      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden border-2 ${COLORS[index] ? 'border-white/30' : ''} shadow-md shrink-0`}>
        {school.images?.[0] ? (
          <img src={school.images[0]} alt={school.name} className="w-full h-full object-cover" />
        ) : (
          <div className={`w-full h-full ${COLORS[index] || 'bg-gray-400'} flex items-center justify-center`}>
            <GraduationCap size={20} className="text-white" />
          </div>
        )}
      </div>
      <p className="text-xs font-bold text-center leading-tight max-w-22.5 sm:max-w-30 line-clamp-2">{school.name}</p>
      <p className="text-[10px] text-gray-500 flex items-center gap-0.5">
        <MapPin size={9} /> {school.state || school.city || '—'}
      </p>
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
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearch(false);
      }
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

  if (!schools.length) return (
    <div className="max-w-7xl mx-auto px-4 py-16 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
        <GraduationCap size={28} className="text-gray-400" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">No schools selected</h2>
      <p className="text-gray-500 text-sm mb-6">Go back to the schools directory and select schools to compare.</p>
      <Link to="/" className="inline-flex items-center gap-2 bg-green-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-800 transition text-sm">
        <ArrowLeft size={15} /> Browse Schools
      </Link>
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
            <h1 className="text-base sm:text-lg font-extrabold text-gray-900 truncate">
              Compare Schools
            </h1>
            <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full shrink-0">
              {schools.length}/3
            </span>
          </div>

          {/* Add school button */}
          {schools.length < 3 && (
            <button
              onClick={() => setShowSearchBar((v) => !v)}
              className="flex items-center gap-1.5 text-sm font-semibold text-green-700 border border-green-200 bg-green-50 px-3 py-2 rounded-xl hover:bg-green-100 transition shrink-0"
            >
              <Plus size={14} /> Add School
            </button>
          )}
        </div>

        {/* Expandable search bar */}
        {showSearchBar && schools.length < 3 && (
          <div className="border-t border-gray-100 px-4 py-3" ref={searchRef}>
            <div className="relative max-w-lg mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); handleSearch(e.target.value); }}
                placeholder="Search school name..."
                className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm bg-white"
              />
              {searchQuery && (
                <button onClick={() => { setSearchQuery(''); setSearchResults([]); setShowSearch(false); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <X size={14} />
                </button>
              )}
              {showSearch && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                  {loading ? (
                    <div className="px-4 py-4 text-sm text-gray-400 text-center">Searching…</div>
                  ) : searchResults.length === 0 ? (
                    <div className="px-4 py-4 text-sm text-gray-400 text-center">No schools found</div>
                  ) : (
                    <ul className="divide-y divide-gray-50">
                      {searchResults.map((school) => (
                        <li key={school._id}>
                          <button onClick={() => addToCompare(school)}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-left">
                            <div className="w-9 h-9 rounded-lg overflow-hidden bg-green-100 shrink-0">
                              {school.images?.[0] ? (
                                <img src={school.images[0]} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <GraduationCap size={14} className="text-green-600" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 text-sm truncate">{school.name}</p>
                              <p className="text-xs text-gray-400 truncate">
                                {[school.city, school.state].filter(Boolean).join(', ')} · {school.type}
                              </p>
                            </div>
                            <ChevronRight size={14} className="text-gray-300 shrink-0" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 py-5 sm:py-8">

        {/* ── SCHOOL CARDS ROW ───────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              Comparing {schools.length} school{schools.length !== 1 ? 's' : ''}
            </p>
            {schools.length < 3 && (
              <p className="text-xs text-gray-400">Add up to {3 - schools.length} more</p>
            )}
          </div>
          <div className="flex items-start gap-4 sm:gap-8 justify-center sm:justify-start">
            {schools.map((s, i) => (
              <SchoolHeaderCard key={s._id} school={s} index={i} onRemove={removeFromCompare} />
            ))}
            {schools.length < 3 && (
              <button
                onClick={() => setShowSearchBar(true)}
                className="flex flex-col items-center gap-2 min-w-22.5"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center hover:border-green-400 hover:bg-green-50 transition">
                  <Plus size={20} className="text-gray-400" />
                </div>
                <p className="text-xs text-gray-400 font-medium">Add school</p>
              </button>
            )}
          </div>
        </div>

        {/* ── COMPARISON TABLE ───────────────────────────────────── */}
        <div className="rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Scroll hint — mobile only */}
          <div className="sm:hidden bg-blue-50 border-b border-blue-100 px-4 py-2 flex items-center gap-2">
            <span className="text-xs text-blue-600 font-medium">← Swipe to compare all schools →</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ minWidth: `${Math.max(340, schools.length * 160 + 140)}px` }}>
              {/* School name header row */}
              <thead>
                <tr>
                  <th className="sticky left-0 z-10 bg-green-800 text-white text-left px-4 py-4 font-semibold text-xs uppercase tracking-wide w-32 sm:w-44 whitespace-nowrap">
                    Feature
                  </th>
                  {schools.map((s, i) => (
                    <th key={s._id} className="bg-green-800 text-white px-4 py-4 font-semibold text-center min-w-36 sm:min-w-44">
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="w-9 h-9 rounded-xl overflow-hidden border-2 border-white/30 shrink-0">
                          {s.images?.[0] ? (
                            <img src={s.images[0]} alt={s.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className={`w-full h-full ${COLORS[i] || 'bg-gray-600'} flex items-center justify-center`}>
                              <GraduationCap size={14} className="text-white" />
                            </div>
                          )}
                        </div>
                        <span className="text-xs font-bold leading-tight">{s.name}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
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
                          className={`px-4 py-3.5 text-center text-gray-800 text-sm capitalize leading-snug ${
                            !allSame && schools.length > 1 ? 'font-semibold' : ''
                          }`}>
                          {value === '—' || value === 'N/A'
                            ? <span className="text-gray-300 text-xs">—</span>
                            : value}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── ACTIONS ────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
          <Link to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 border border-gray-200 bg-white px-5 py-2.5 rounded-xl hover:bg-gray-50 transition">
            <ArrowLeft size={15} /> Browse More Schools
          </Link>
          <p className="text-xs text-gray-400">
            {schools.length < 3 ? `You can add ${3 - schools.length} more school${3 - schools.length !== 1 ? 's' : ''} to compare` : 'Comparison is at maximum capacity (3 schools)'}
          </p>
        </div>
      </div>
    </div>
  );
}
