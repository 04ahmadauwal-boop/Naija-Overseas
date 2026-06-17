import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Search, SlidersHorizontal, ArrowRight, BookOpen, X, ChevronDown,
  MapPin, Building2, LayoutDashboard, GraduationCap, Wallet, CheckCircle,
} from 'lucide-react';
import api from '../utils/api';
import SchoolCard from '../components/SchoolCard';
import Pagination from '../components/Pagination';
import toast from 'react-hot-toast';
import { NIGERIAN_STATES, NIGERIAN_LGAS, BUDGET_OPTIONS, EMPTY_FILTERS } from '../utils/schoolFilters';

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
      if (f.search)     params.search     = f.search;
      if (f.state)      params.state      = f.state;
      if (f.lga)        params.lga        = f.lga;
      if (f.type)       params.type       = f.type;
      if (f.level)      params.level      = f.level;
      if (f.curriculum) params.curriculum = f.curriculum;
      if (f.minFee)     params.minFee     = f.minFee;
      if (f.maxFee)     params.maxFee     = f.maxFee;
      if (sortBy)       params.sort       = sortBy;
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

  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    const urlFilters = {
      search:     sp.get('search')     || '',
      state:      sp.get('state')      || '',
      lga:        sp.get('lga')        || '',
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
    if (key === 'state') next.lga = '';
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
    filters.state, filters.lga, filters.type, filters.level, filters.curriculum,
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
            {loading ? 'Loading schools…' : `${total.toLocaleString()} verified school${total !== 1 ? 's' : ''} across Nigeria`}
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
            <button onClick={clearFilters}
              className="inline-flex items-center gap-1 text-xs text-red-500 font-semibold hover:text-red-700 transition">
              <X size={12} /> Clear all
            </button>
          )}
        </div>

        {/* ── PRO FILTER PANEL ─────────────────────────────────── */}
        {showFilters && (
          <div className="mb-8">

            {/* Active chips bar */}
            {activeCount > 0 && (
              <div className="flex items-center gap-2 flex-wrap mb-4 px-1">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider shrink-0">Active:</span>
                {filters.state && (
                  <button onClick={() => updateFilter('state', '')}
                    className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold px-3 py-1 rounded-full hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition">
                    <MapPin size={10} /> {filters.state} <X size={9} />
                  </button>
                )}
                {filters.lga && (
                  <button onClick={() => updateFilter('lga', '')}
                    className="inline-flex items-center gap-1.5 bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold px-3 py-1 rounded-full hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition">
                    <Building2 size={10} /> {filters.lga} <X size={9} />
                  </button>
                )}
                {filters.type && (
                  <button onClick={() => updateFilter('type', '')}
                    className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition capitalize">
                    <LayoutDashboard size={10} /> {filters.type} <X size={9} />
                  </button>
                )}
                {filters.level && (
                  <button onClick={() => updateFilter('level', '')}
                    className="inline-flex items-center gap-1.5 bg-violet-50 border border-violet-200 text-violet-800 text-xs font-semibold px-3 py-1 rounded-full hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition capitalize">
                    <GraduationCap size={10} /> {filters.level} <X size={9} />
                  </button>
                )}
                {filters.curriculum && (
                  <button onClick={() => updateFilter('curriculum', '')}
                    className="inline-flex items-center gap-1.5 bg-orange-50 border border-orange-200 text-orange-800 text-xs font-semibold px-3 py-1 rounded-full hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition">
                    <BookOpen size={10} /> {filters.curriculum} <X size={9} />
                  </button>
                )}
                {(filters.minFee || filters.maxFee) && (
                  <button onClick={() => setBudget('', '')}
                    className="inline-flex items-center gap-1.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold px-3 py-1 rounded-full hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition">
                    <Wallet size={10} />
                    {filters.minFee ? `₦${Number(filters.minFee).toLocaleString()}` : '₦0'}
                    {' – '}
                    {filters.maxFee ? `₦${Number(filters.maxFee).toLocaleString()}` : 'Any'}
                    <X size={9} />
                  </button>
                )}
                {sort && (
                  <button onClick={() => updateSort('')}
                    className="inline-flex items-center gap-1.5 bg-gray-100 border border-gray-200 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition">
                    {SORT_OPTIONS.find(o => o.value === sort)?.label} <X size={9} />
                  </button>
                )}
                <button onClick={clearFilters}
                  className="ml-auto inline-flex items-center gap-1 text-xs text-red-500 font-semibold hover:text-red-700 transition shrink-0">
                  <X size={12} /> Clear all
                </button>
              </div>
            )}

            {/* 6-card filter grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

              {/* ── Card 1: State ── */}
              <div className={`bg-white rounded-2xl border-2 shadow-sm overflow-hidden transition-all duration-200 ${filters.state ? 'border-emerald-300 shadow-emerald-50' : 'border-gray-100'}`}>
                <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-50">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                    <MapPin size={15} className="text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-0.5">Location</p>
                    <p className="text-sm font-bold text-gray-800 leading-tight truncate">
                      {filters.state || 'All States'}
                    </p>
                  </div>
                  {filters.state && (
                    <button onClick={() => updateFilter('state', '')}
                      className="w-6 h-6 rounded-full bg-gray-100 hover:bg-red-100 hover:text-red-500 flex items-center justify-center text-gray-400 transition shrink-0">
                      <X size={11} />
                    </button>
                  )}
                </div>
                <div className="p-4 space-y-3">
                  <select
                    value={filters.state}
                    onChange={(e) => updateFilter('state', e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 bg-gray-50 text-gray-700 transition appearance-none cursor-pointer">
                    <option value="">All States</option>
                    {NIGERIAN_STATES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                  <div className="flex flex-wrap gap-1.5">
                    {['Lagos', 'FCT', 'Kano', 'Rivers', 'Ogun', 'Oyo'].map((s) => (
                      <button key={s} onClick={() => updateFilter('state', filters.state === s ? '' : s)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition ${
                          filters.state === s
                            ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-200'
                            : 'bg-gray-100 text-gray-500 hover:bg-emerald-50 hover:text-emerald-700'
                        }`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── Card 2: LGA ── */}
              <div className={`bg-white rounded-2xl border-2 shadow-sm overflow-hidden transition-all duration-200 ${filters.lga ? 'border-teal-300 shadow-teal-50' : 'border-gray-100'}`}>
                <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-50">
                  <div className="w-8 h-8 rounded-xl bg-teal-100 flex items-center justify-center shrink-0">
                    <Building2 size={15} className="text-teal-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-0.5">Local Gov. Area</p>
                    <p className="text-sm font-bold text-gray-800 leading-tight truncate">
                      {filters.lga || (filters.state ? 'All LGAs' : 'Select state first')}
                    </p>
                  </div>
                  {filters.lga && (
                    <button onClick={() => updateFilter('lga', '')}
                      className="w-6 h-6 rounded-full bg-gray-100 hover:bg-red-100 hover:text-red-500 flex items-center justify-center text-gray-400 transition shrink-0">
                      <X size={11} />
                    </button>
                  )}
                </div>
                <div className="p-4">
                  {!filters.state ? (
                    <div className="flex flex-col items-center justify-center py-5 text-center">
                      <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mb-2">
                        <MapPin size={18} className="text-gray-200" />
                      </div>
                      <p className="text-xs text-gray-400 leading-snug">Select a state first to<br />filter by local government</p>
                    </div>
                  ) : (
                    <select
                      value={filters.lga}
                      onChange={(e) => updateFilter('lga', e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 bg-gray-50 text-gray-700 transition appearance-none cursor-pointer">
                      <option value="">All LGAs in {filters.state}</option>
                      {(NIGERIAN_LGAS[filters.state] || []).map((l) => (
                        <option key={l}>{l}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* ── Card 3: School Type ── */}
              <div className={`bg-white rounded-2xl border-2 shadow-sm overflow-hidden transition-all duration-200 ${filters.type ? 'border-blue-300 shadow-blue-50' : 'border-gray-100'}`}>
                <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-50">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                    <LayoutDashboard size={15} className="text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-0.5">School Type</p>
                    <p className="text-sm font-bold text-gray-800 leading-tight truncate capitalize">
                      {filters.type || 'Any Type'}
                    </p>
                  </div>
                  {filters.type && (
                    <button onClick={() => updateFilter('type', '')}
                      className="w-6 h-6 rounded-full bg-gray-100 hover:bg-red-100 hover:text-red-500 flex items-center justify-center text-gray-400 transition shrink-0">
                      <X size={11} />
                    </button>
                  )}
                </div>
                <div className="p-4 grid grid-cols-2 gap-2">
                  {[
                    { value: 'private',       label: 'Private',       emoji: '🏛️' },
                    { value: 'public',        label: 'Public',        emoji: '🏫' },
                    { value: 'federal',       label: 'Federal',       emoji: '🏦' },
                    { value: 'international', label: 'International', emoji: '🌍' },
                  ].map(({ value, label, emoji }) => {
                    const active = filters.type === value;
                    return (
                      <button key={value} onClick={() => updateFilter('type', active ? '' : value)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold border-2 transition ${
                          active
                            ? 'bg-blue-50 border-blue-400 text-blue-700 shadow-sm'
                            : 'border-gray-100 text-gray-600 hover:border-blue-200 hover:bg-blue-50/40 bg-gray-50/80'
                        }`}>
                        <span className="text-sm">{emoji}</span>
                        <span>{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── Card 4: School Level ── */}
              <div className={`bg-white rounded-2xl border-2 shadow-sm overflow-hidden transition-all duration-200 ${filters.level ? 'border-violet-300 shadow-violet-50' : 'border-gray-100'}`}>
                <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-50">
                  <div className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
                    <GraduationCap size={15} className="text-violet-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-0.5">School Level</p>
                    <p className="text-sm font-bold text-gray-800 leading-tight truncate capitalize">
                      {filters.level === 'both' ? 'All Levels' : filters.level || 'Any Level'}
                    </p>
                  </div>
                  {filters.level && (
                    <button onClick={() => updateFilter('level', '')}
                      className="w-6 h-6 rounded-full bg-gray-100 hover:bg-red-100 hover:text-red-500 flex items-center justify-center text-gray-400 transition shrink-0">
                      <X size={11} />
                    </button>
                  )}
                </div>
                <div className="p-4 flex flex-col gap-2">
                  {[
                    { value: 'primary',   label: 'Primary School',   sub: 'JSS 1 – 3' },
                    { value: 'secondary', label: 'Secondary School', sub: 'SS 1 – 3' },
                    { value: 'both',      label: 'All Levels',       sub: 'Primary + Secondary' },
                  ].map(({ value, label, sub }) => {
                    const active = filters.level === value;
                    return (
                      <button key={value} onClick={() => updateFilter('level', active ? '' : value)}
                        className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs border-2 transition ${
                          active
                            ? 'bg-violet-50 border-violet-400 text-violet-800 shadow-sm'
                            : 'border-gray-100 text-gray-600 hover:border-violet-200 hover:bg-violet-50/40 bg-gray-50/80'
                        }`}>
                        <span className="font-semibold">{label}</span>
                        <span className={`text-[10px] ${active ? 'text-violet-500' : 'text-gray-400'}`}>{sub}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── Card 5: Curriculum ── */}
              <div className={`bg-white rounded-2xl border-2 shadow-sm overflow-hidden transition-all duration-200 ${filters.curriculum ? 'border-orange-300 shadow-orange-50' : 'border-gray-100'}`}>
                <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-50">
                  <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                    <BookOpen size={15} className="text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-0.5">Curriculum</p>
                    <p className="text-sm font-bold text-gray-800 leading-tight">
                      {filters.curriculum || 'Any Curriculum'}
                    </p>
                  </div>
                  {filters.curriculum && (
                    <button onClick={() => updateFilter('curriculum', '')}
                      className="w-6 h-6 rounded-full bg-gray-100 hover:bg-red-100 hover:text-red-500 flex items-center justify-center text-gray-400 transition shrink-0">
                      <X size={11} />
                    </button>
                  )}
                </div>
                <div className="p-4 grid grid-cols-3 gap-2">
                  {[
                    { value: 'WAEC',      color: 'bg-green-600'  },
                    { value: 'NECO',      color: 'bg-blue-600'   },
                    { value: 'IGCSE',     color: 'bg-purple-600' },
                    { value: 'IB',        color: 'bg-red-600'    },
                    { value: 'Cambridge', color: 'bg-indigo-600' },
                    { value: 'BECE',      color: 'bg-teal-600'   },
                  ].map(({ value, color }) => {
                    const active = filters.curriculum === value;
                    return (
                      <button key={value} onClick={() => updateFilter('curriculum', active ? '' : value)}
                        className={`relative py-2.5 rounded-xl text-xs font-bold border-2 transition text-center overflow-hidden ${
                          active
                            ? 'border-orange-400 text-orange-800 bg-orange-50 shadow-sm'
                            : 'border-gray-100 text-gray-600 hover:border-orange-200 hover:bg-orange-50/40 bg-gray-50/80'
                        }`}>
                        {active && <span className={`absolute top-0 left-0 right-0 h-0.5 ${color}`} />}
                        {value}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── Card 6: Budget ── */}
              <div className={`bg-white rounded-2xl border-2 shadow-sm overflow-hidden transition-all duration-200 ${(filters.minFee || filters.maxFee) ? 'border-rose-300 shadow-rose-50' : 'border-gray-100'}`}>
                <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-50">
                  <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                    <Wallet size={15} className="text-rose-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-0.5">Annual Fee Budget</p>
                    <p className="text-sm font-bold text-gray-800 leading-tight truncate">
                      {(filters.minFee || filters.maxFee)
                        ? `${filters.minFee ? `₦${Number(filters.minFee).toLocaleString()}` : '₦0'} – ${filters.maxFee ? `₦${Number(filters.maxFee).toLocaleString()}` : 'Any'}`
                        : 'Any Budget'}
                    </p>
                  </div>
                  {(filters.minFee || filters.maxFee) && (
                    <button onClick={() => setBudget('', '')}
                      className="w-6 h-6 rounded-full bg-gray-100 hover:bg-red-100 hover:text-red-500 flex items-center justify-center text-gray-400 transition shrink-0">
                      <X size={11} />
                    </button>
                  )}
                </div>
                <div className="p-4 flex flex-col gap-2">
                  {BUDGET_OPTIONS.map(({ label, min, max }) => {
                    const active = filters.minFee === min && filters.maxFee === max;
                    return (
                      <button key={label} onClick={() => setBudget(min, max)}
                        className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold border-2 transition ${
                          active
                            ? 'bg-rose-50 border-rose-400 text-rose-800 shadow-sm'
                            : 'border-gray-100 text-gray-600 hover:border-rose-200 hover:bg-rose-50/40 bg-gray-50/80'
                        }`}>
                        <span>{label}</span>
                        {active && <CheckCircle size={13} className="text-rose-500 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Footer summary */}
            <div className="mt-4 flex items-center justify-between px-1">
              <p className="text-sm text-gray-500">
                {loading
                  ? <span className="text-gray-400">Searching…</span>
                  : <><span className="font-bold text-gray-900">{total.toLocaleString()}</span> school{total !== 1 ? 's' : ''} match your filters</>
                }
              </p>
              {activeCount > 0 && (
                <button onClick={clearFilters}
                  className="inline-flex items-center gap-1.5 text-sm text-red-500 font-semibold hover:text-red-700 transition">
                  <X size={13} /> Clear all filters
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
