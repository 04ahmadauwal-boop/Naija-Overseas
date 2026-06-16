import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Search, SlidersHorizontal, ArrowRight, BookOpen, X, ChevronDown,
} from 'lucide-react';
import api from '../utils/api';
import SchoolCard from '../components/SchoolCard';
import Pagination from '../components/Pagination';
import toast from 'react-hot-toast';
import { NIGERIAN_STATES, BUDGET_OPTIONS, EMPTY_FILTERS } from '../utils/schoolFilters';

const SORT_OPTIONS = [
  { value: '',       label: 'Newest / Featured' },
  { value: 'rating', label: 'Top Rated'          },
];

export default function AllSchools() {
  const navigate = useNavigate();
  const location = useLocation();

  const [schools, setSchools] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [sort, setSort] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const doFetch = async (page, f, sortBy) => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (f.search) params.search = f.search;
      if (f.state) params.state = f.state;
      if (f.type) params.type = f.type;
      if (f.level) params.level = f.level;
      if (f.curriculum) params.curriculum = f.curriculum;
      if (f.minFee) params.minFee = f.minFee;
      if (f.maxFee) params.maxFee = f.maxFee;
      if (sortBy) params.sort = sortBy;
      const { data } = await api.get('/schools', { params });
      setSchools(data.schools);
      setTotal(data.total);
      setPages(data.pages);
      setCurrentPage(page);
    } catch {
      toast.error('Could not load schools');
    } finally {
      setLoading(false);
    }
  };

  // Seed filters from the URL on first load (e.g. /schools?state=Lagos)
  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    const urlFilters = {
      search:     sp.get('search')     || '',
      state:      sp.get('state')      || '',
      type:       sp.get('type')       || '',
      level:      sp.get('level')      || '',
      curriculum: sp.get('curriculum') || '',
      minFee:     sp.get('minFee')     || '',
      maxFee:     sp.get('maxFee')     || '',
    };
    const urlSort = sp.get('sort') || '';
    const hasFilters = Object.values(urlFilters).some(Boolean) || urlSort;
    if (hasFilters) {
      setFilters(urlFilters);
      setSort(urlSort);
      setShowFilters(true);
    }
    doFetch(1, urlFilters, urlSort);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateFilter = (key, value) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
    doFetch(1, next, sort);
  };

  const updateSort = (value) => {
    setSort(value);
    doFetch(1, filters, value);
  };

  const setBudget = (min, max) => {
    const already = filters.minFee === min && filters.maxFee === max;
    const next = { ...filters, minFee: already ? '' : min, maxFee: already ? '' : max };
    setFilters(next);
    doFetch(1, next, sort);
  };

  const clearFilters = () => {
    setFilters(EMPTY_FILTERS);
    setSort('');
    doFetch(1, EMPTY_FILTERS, '');
  };

  const fetchPage = (page) => doFetch(page, filters, sort);

  const activeCount = [
    filters.state, filters.type, filters.level, filters.curriculum,
    filters.minFee || filters.maxFee, sort,
  ].filter(Boolean).length;

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
    <div className="bg-gray-50 min-h-screen pb-16">
      {/* ── HEADER ─────────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100 px-4 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto">
          <p className="text-green-600 font-semibold text-[11px] sm:text-xs uppercase tracking-widest mb-2">Full Directory</p>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-2">All Schools</h1>
          <p className="text-gray-500 text-sm sm:text-base">
            {loading ? 'Loading schools…' : `${total} verified school${total !== 1 ? 's' : ''} across Nigeria`}
          </p>

          {/* Search */}
          <div className="relative mt-5 max-w-xl">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              placeholder="Search by school name…"
              className="w-full pl-11 pr-10 py-3 text-sm border-2 border-gray-100 rounded-xl bg-white focus:outline-none focus:border-green-500 transition"
            />
            {filters.search && (
              <button onClick={() => updateFilter('search', '')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 pt-6 sm:pt-8">

        {/* ── TOOLBAR ──────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <button onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-sm font-semibold border border-gray-200 bg-white rounded-xl px-4 py-2.5 hover:border-green-500 hover:text-green-700 transition shadow-sm">
            <SlidersHorizontal size={15} />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
            {activeCount > 0 && (
              <span className="bg-green-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </button>

          <div className="relative">
            <select
              value={sort}
              onChange={(e) => updateSort(e.target.value)}
              className="appearance-none text-sm font-semibold border border-gray-200 bg-white rounded-xl pl-4 pr-9 py-2.5 hover:border-green-500 transition shadow-sm focus:outline-none cursor-pointer"
            >
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {activeCount > 0 && (
            <button onClick={clearFilters} className="text-xs text-red-500 font-semibold hover:text-red-700 transition">
              Clear all
            </button>
          )}
        </div>

        {/* ── FILTER PANEL ─────────────────────────────────────── */}
        {showFilters && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-8 overflow-hidden">
            <div className="p-5 space-y-6">

              {/* Location */}
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Location / State</p>
                <div className="flex flex-col gap-3">
                  <select value={filters.state} onChange={(e) => updateFilter('state', e.target.value)}
                    className="w-full sm:w-64 border-2 border-gray-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-500 bg-white transition">
                    <option value="">All States</option>
                    {NIGERIAN_STATES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                  <div className="flex flex-wrap gap-1.5">
                    {['Lagos', 'FCT', 'Kano', 'Rivers', 'Ogun', 'Oyo'].map((s) => (
                      <button key={s} onClick={() => updateFilter('state', filters.state === s ? '' : s)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border-2 transition ${
                          filters.state === s
                            ? 'bg-green-600 border-green-600 text-white shadow-sm'
                            : 'border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-700 bg-white'
                        }`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="h-px bg-gray-100" />

              {/* Type + Level row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">School Type</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: 'private',       label: 'Private'       },
                      { value: 'public',        label: 'Public'        },
                      { value: 'federal',       label: 'Federal'       },
                      { value: 'international', label: 'International' },
                    ].map(({ value, label }) => {
                      const active = filters.type === value;
                      return (
                        <button key={value} onClick={() => updateFilter('type', active ? '' : value)}
                          className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition ${
                            active
                              ? 'bg-green-50 border-green-500 text-green-700 shadow-sm'
                              : 'border-gray-200 text-gray-600 hover:border-green-300 bg-white'
                          }`}>
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">School Level</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: 'primary',   label: 'Primary'   },
                      { value: 'secondary', label: 'Secondary' },
                      { value: 'both',      label: 'All Levels'},
                    ].map(({ value, label }) => {
                      const active = filters.level === value;
                      return (
                        <button key={value} onClick={() => updateFilter('level', active ? '' : value)}
                          className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition ${
                            active
                              ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm'
                              : 'border-gray-200 text-gray-600 hover:border-blue-300 bg-white'
                          }`}>
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="h-px bg-gray-100" />

              {/* Curriculum */}
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Curriculum</p>
                <div className="flex flex-wrap gap-2">
                  {['WAEC', 'NECO', 'IGCSE', 'IB', 'Cambridge', 'BECE'].map((c) => {
                    const active = filters.curriculum === c;
                    return (
                      <button key={c} onClick={() => updateFilter('curriculum', active ? '' : c)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition ${
                          active
                            ? 'bg-purple-50 border-purple-500 text-purple-700 shadow-sm'
                            : 'border-gray-200 text-gray-600 hover:border-purple-300 bg-white'
                        }`}>
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="h-px bg-gray-100" />

              {/* Budget */}
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Annual Fee Budget</p>
                <div className="flex flex-wrap gap-2">
                  {BUDGET_OPTIONS.map(({ label, min, max }) => {
                    const active = filters.minFee === min && filters.maxFee === max;
                    return (
                      <button key={label} onClick={() => setBudget(min, max)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition ${
                          active
                            ? 'bg-orange-50 border-orange-500 text-orange-700 shadow-sm'
                            : 'border-gray-200 text-gray-600 hover:border-orange-300 bg-white'
                        }`}>
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                {loading ? 'Searching…' : `${total} school${total !== 1 ? 's' : ''} match your filters`}
              </p>
              {activeCount > 0 && (
                <button onClick={clearFilters} className="text-xs text-red-500 font-semibold hover:text-red-700 transition">
                  Clear all filters
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── RESULTS GRID ─────────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-72 skeleton-shimmer border border-gray-100" />
            ))}
          </div>
        ) : schools.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <BookOpen size={40} className="mx-auto mb-3 opacity-40" />
            <p className="font-medium text-gray-600">No schools found</p>
            <p className="text-sm mt-1">Try adjusting your filters or search term</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {schools.map((school) => (
              <SchoolCard key={school._id} school={school} onCompare={handleCompare}
                isSelected={!!selected.find((s) => s._id === school._id)} />
            ))}
          </div>
        )}

        <Pagination page={currentPage} pages={pages} onPage={fetchPage} />
      </div>

      {/* ── COMPARE STICKY BAR ───────────────────────────────────── */}
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
            <button onClick={goCompare} className="text-xs bg-green-600 font-semibold px-5 py-1.5 rounded-lg hover:bg-green-500 transition flex items-center gap-1">
              Compare Now <ArrowRight size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
