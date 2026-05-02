import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, X, Plus } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const ROWS = [
  { label: 'Type', key: 'type' },
  { label: 'Level', key: 'level' },
  { label: 'State', key: 'state' },
  { label: 'City', key: 'city' },
  { label: 'Tuition Fee', key: 'fees.tuition', format: (v) => v ? `₦${Number(v).toLocaleString()}` : 'N/A' },
  { label: 'Boarding Fee', key: 'fees.boarding', format: (v) => v ? `₦${Number(v).toLocaleString()}` : 'Day School' },
  { label: 'Curriculum', key: 'curriculum', format: (v) => Array.isArray(v) ? v.join(', ') : v },
  { label: 'Facilities', key: 'facilities', format: (v) => Array.isArray(v) ? v.join(', ') || 'N/A' : 'N/A' },
  { label: 'Contact Phone', key: 'contact.phone' },
  { label: 'Contact Email', key: 'contact.email' },
  { label: 'Website', key: 'contact.website' },
];

function getNestedValue(obj, path) {
  return path.split('.').reduce((acc, key) => acc?.[key], obj);
}

export default function Compare() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [schools, setSchools] = useState(state?.schools || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
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
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearch(false);
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get('/schools', { params: { search: query, limit: 5 } });
      setSearchResults(data.schools || []);
      setShowSearch(true);
    } catch {
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const addToCompare = (school) => {
    if (schools.find((s) => s._id === school._id)) {
      toast('Already in comparison');
      return;
    }
    if (schools.length >= 3) {
      toast.error('You can compare up to 3 schools at a time');
      return;
    }
    setSchools([...schools, school]);
    setSearchQuery('');
    setShowSearch(false);
    toast.success('Added to comparison');
  };

  const removeFromCompare = (id) => {
    setSchools(schools.filter((s) => s._id !== id));
  };

  if (!schools.length) return (
    <div className="max-w-7xl mx-auto px-4 py-16 text-center">
      <p className="text-gray-500 mb-4">No schools selected for comparison.</p>
      <Link to="/" className="text-green-700 hover:underline font-medium">Go back and select schools</Link>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-1 text-sm text-gray-500 hover:text-green-700 transition">
            <ArrowLeft size={16} />
            Back to Schools
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">School Comparison</h1>
        </div>
        <div ref={searchRef} className="relative">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleSearch(e.target.value);
                }}
                placeholder="Add school to compare..."
                className="w-64 pl-10 pr-10 py-3 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm shadow-lg bg-white"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                    setShowSearch(false);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
          {showSearch && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              {loading ? (
                <div className="px-4 py-3 text-sm text-gray-500 text-center">Searching...</div>
              ) : searchResults.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500 text-center">No schools found</div>
              ) : (
                <ul>
                  {searchResults.map((school) => (
                    <li key={school._id}>
                      <button
                        onClick={() => addToCompare(school)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-left"
                      >
                        <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                          {school.images?.[0] ? (
                            <img src={school.images[0]} alt="" className="w-full h-full object-cover rounded" />
                          ) : (
                            <Plus size={14} className="text-green-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm truncate">{school.name}</p>
                          <p className="text-xs text-gray-500 truncate">
                            {[school.city, school.state].filter(Boolean).join(', ')} · {school.type}
                          </p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-green-800 text-white">
              <th className="text-left px-5 py-4 font-semibold w-40">Feature</th>
              {schools.map((s) => (
                <th key={s._id} className="px-5 py-4 font-semibold text-center relative">
                  <button
                    onClick={() => removeFromCompare(s._id)}
                    className="absolute top-2 right-2 text-white/70 hover:text-white transition"
                    title="Remove from comparison"
                  >
                    <X size={14} />
                  </button>
                  <div className="flex flex-col items-center gap-1">
                    {s.images?.[0] && (
                      <img src={s.images[0]} alt={s.name} className="w-12 h-12 rounded-full object-cover border-2 border-green-600" />
                    )}
                    <span>{s.name}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row, i) => (
              <tr key={row.key} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-5 py-3.5 font-medium text-gray-700 whitespace-nowrap">{row.label}</td>
                {schools.map((s) => {
                  const raw = getNestedValue(s, row.key);
                  const value = row.format ? row.format(raw) : (raw || 'N/A');
                  return (
                    <td key={s._id} className="px-5 py-3.5 text-center text-gray-700 capitalize">
                      {value}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 text-center">
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-green-700 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-800 transition"
        >
          <ArrowLeft size={16} />
          Compare Different Schools
        </Link>
      </div>
    </div>
  );
}
