import { useState, useEffect } from 'react';
import { AdminNav } from './Dashboard';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Star, Trash2, Eye, School, Flag, ChevronDown, ChevronUp } from 'lucide-react';

const STATUS_TABS = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: '', label: 'All' },
];

const statusStyle = (s) =>
  s === 'approved' ? 'bg-green-100 text-green-700' :
  s === 'rejected' ? 'bg-red-100 text-red-700' :
  'bg-yellow-100 text-yellow-700';

const claimStatusStyle = (s) =>
  s === 'approved' ? 'bg-green-100 text-green-700' :
  s === 'rejected' ? 'bg-red-100 text-red-700' :
  'bg-blue-100 text-blue-700';

function ClaimsView() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claimFilter, setClaimFilter] = useState('pending');
  const [expanded, setExpanded] = useState({});

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/schools/admin/claims', { params: { status: claimFilter || undefined } });
      setClaims(data.claims);
    } catch { toast.error('Failed to load claims'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchClaims(); });

  const handleClaim = async (claimId, action) => {
    try {
      await api.patch(`/schools/admin/claims/${claimId}`, { action });
      toast.success(`Claim ${action}`);
      fetchClaims();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Action failed');
    }
  };

  const toggleExpand = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const pendingCount = claims.filter((c) => c.status === 'pending').length;

  const DataChanges = ({ updatedData }) => {
    if (!updatedData || Object.keys(updatedData).length === 0) {
      return <span className="text-gray-400 text-xs italic">No changes provided</span>;
    }
    const skip = ['ownerName', 'ownerEmail', 'ownerPhone'];
    const entries = Object.entries(updatedData).filter(([k]) => !skip.includes(k));
    if (entries.length === 0) return <span className="text-gray-400 text-xs italic">No school data changes</span>;
    return (
      <ul className="text-xs text-gray-600 space-y-1 mt-1">
        {entries.map(([k, v]) => (
          <li key={k} className="flex gap-2">
            <span className="text-gray-400 font-medium capitalize min-w-20">{k.replace(/([A-Z])/g, ' $1').trim()}:</span>
            <span className="text-gray-700 break-all">
              {typeof v === 'object' ? JSON.stringify(v) : String(v)}
            </span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <>
      {/* Claims filter tabs */}
      <div className="bg-white border-b border-gray-100 px-4 md:px-8 pb-4">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
          {claimFilter === 'pending' && pendingCount > 0 && (
            <span className="bg-blue-100 text-blue-800 text-sm font-bold px-4 py-2 rounded-full shrink-0">
              {pendingCount} pending claim{pendingCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUS_TABS.map(({ value, label }) => (
            <button key={label} onClick={() => setClaimFilter(value)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                claimFilter === value ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 md:p-8">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-20 animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : claims.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <Flag size={36} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No claims found</p>
            <p className="text-gray-400 text-sm">Try a different status filter</p>
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {claims.map((claim) => (
                <div key={claim._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 text-sm leading-snug truncate">
                        {claim.school?.name || 'Unknown School'}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {[claim.school?.city, claim.school?.state].filter(Boolean).join(', ')}
                      </p>
                    </div>
                    <span className={`shrink-0 text-xs px-2.5 py-1 rounded-full font-semibold ${claimStatusStyle(claim.status)}`}>
                      {claim.status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 space-y-0.5 mb-3">
                    <p><span className="font-medium">Claimant:</span> {claim.claimantName || '—'}</p>
                    <p><span className="font-medium">Email:</span> {claim.claimantEmail}</p>
                    {claim.claimantPhone && <p><span className="font-medium">Phone:</span> {claim.claimantPhone}</p>}
                    <p><span className="font-medium">Submitted:</span> {new Date(claim.createdAt).toLocaleDateString()}</p>
                  </div>
                  <button onClick={() => toggleExpand(claim._id)}
                    className="flex items-center gap-1 text-xs text-blue-600 font-semibold mb-3">
                    {expanded[claim._id] ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    {expanded[claim._id] ? 'Hide' : 'View'} proposed changes
                  </button>
                  {expanded[claim._id] && (
                    <div className="bg-gray-50 rounded-xl p-3 mb-3 border border-gray-100">
                      <DataChanges updatedData={claim.updatedData} />
                    </div>
                  )}
                  {claim.status === 'pending' && (
                    <div className="flex gap-2">
                      <button onClick={() => handleClaim(claim._id, 'approved')}
                        className="flex items-center gap-1 bg-green-100 text-green-700 hover:bg-green-200 text-xs font-semibold px-3 py-1.5 rounded-lg transition">
                        <CheckCircle size={12} /> Approve
                      </button>
                      <button onClick={() => handleClaim(claim._id, 'rejected')}
                        className="flex items-center gap-1 bg-red-100 text-red-700 hover:bg-red-200 text-xs font-semibold px-3 py-1.5 rounded-lg transition">
                        <XCircle size={12} /> Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
              <table className="w-full text-sm min-w-175">
                <thead className="bg-gray-50 text-gray-500 text-left border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 font-semibold">School</th>
                    <th className="px-6 py-4 font-semibold">Claimant</th>
                    <th className="px-6 py-4 font-semibold">Proposed Changes</th>
                    <th className="px-6 py-4 font-semibold">Date</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {claims.map((claim) => (
                    <tr key={claim._id} className="hover:bg-gray-50 transition align-top">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{claim.school?.name || 'Unknown'}</div>
                        <div className="text-xs text-gray-400">
                          {[claim.school?.city, claim.school?.state].filter(Boolean).join(', ')}
                        </div>
                        {claim.school?.slug && (
                          <Link to={`/schools/${claim.school.slug}`} target="_blank"
                            className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-1">
                            <Eye size={10} /> View listing
                          </Link>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-800 text-xs">{claim.claimantName || '—'}</div>
                        <div className="text-gray-500 text-xs">{claim.claimantEmail}</div>
                        {claim.claimantPhone && <div className="text-gray-400 text-xs">{claim.claimantPhone}</div>}
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <button onClick={() => toggleExpand(claim._id)}
                          className="flex items-center gap-1 text-xs text-blue-600 font-semibold mb-1">
                          {expanded[claim._id] ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                          {expanded[claim._id] ? 'Collapse' : 'Expand'}
                        </button>
                        {expanded[claim._id] && (
                          <div className="bg-gray-50 rounded-lg p-2 border border-gray-100">
                            <DataChanges updatedData={claim.updatedData} />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-xs whitespace-nowrap">
                        {new Date(claim.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center text-xs px-3 py-1 rounded-full font-semibold ${claimStatusStyle(claim.status)}`}>
                          {claim.status}
                        </span>
                        {claim.adminNote && (
                          <p className="text-xs text-gray-400 mt-1 max-w-30 truncate" title={claim.adminNote}>
                            Note: {claim.adminNote}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {claim.status === 'pending' ? (
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleClaim(claim._id, 'approved')}
                              className="flex items-center gap-1 bg-green-100 text-green-700 hover:bg-green-200 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition">
                              <CheckCircle size={12} /> Approve
                            </button>
                            <button onClick={() => handleClaim(claim._id, 'rejected')}
                              className="flex items-center gap-1 bg-red-100 text-red-700 hover:bg-red-200 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition">
                              <XCircle size={12} /> Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Reviewed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default function ManageSchools() {
  const [schools,       setSchools]       = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [filter,        setFilter]        = useState('pending');
  const [viewMode,      setViewMode]      = useState('schools');
  const [featuredCount, setFeaturedCount] = useState(0);

  const fetchSchools = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/schools/admin/all', { params: { status: filter || undefined } });
      setSchools(data.schools);
      setFeaturedCount((data.schools || []).filter(s => s.isFeatured).length);
    } catch { toast.error('Failed to load schools'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (viewMode === 'schools') fetchSchools();
  });

  const approve = async (id, status) => {
    try {
      await api.patch(`/schools/${id}/approve`, { status });
      toast.success(`School ${status}`);
      fetchSchools();
    } catch { toast.error('Action failed'); }
  };

  const toggleFeature = async (id) => {
    try {
      const { data } = await api.patch(`/schools/${id}/feature`);
      setFeaturedCount(data.featuredCount ?? featuredCount);
      toast.success(data.school.isFeatured ? 'Added to Popular Listings' : 'Removed from Popular Listings');
      fetchSchools();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Action failed');
    }
  };

  const deleteSchool = async (id) => {
    if (!confirm('Permanently delete this school listing?')) return;
    try {
      await api.delete(`/schools/${id}`);
      toast.success('School deleted');
      fetchSchools();
    } catch { toast.error('Delete failed'); }
  };

  const pendingCount = schools.filter((s) => s.status === 'pending').length;

  const ActionButtons = ({ school }) => (
    <div className="flex items-center gap-2 flex-wrap">
      <Link to={`/schools/${school.slug || school._id}`} target="_blank"
        className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition" title="View listing">
        <Eye size={14} />
      </Link>
      {school.status === 'pending' && (
        <>
          <button onClick={() => approve(school._id, 'approved')}
            className="flex items-center gap-1 bg-green-100 text-green-700 hover:bg-green-200 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition">
            <CheckCircle size={12} /> Approve
          </button>
          <button onClick={() => approve(school._id, 'rejected')}
            className="flex items-center gap-1 bg-red-100 text-red-700 hover:bg-red-200 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition">
            <XCircle size={12} /> Reject
          </button>
        </>
      )}
      {school.status === 'rejected' && (
        <button onClick={() => approve(school._id, 'approved')}
          className="flex items-center gap-1 bg-green-100 text-green-700 hover:bg-green-200 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition">
          <CheckCircle size={12} /> Approve
        </button>
      )}
      {school.status === 'approved' && (
        <button onClick={() => toggleFeature(school._id)}
          className={`w-8 h-8 flex items-center justify-center rounded-lg transition ${
            school.isFeatured
              ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
              : 'bg-gray-100 text-gray-400 hover:bg-yellow-100 hover:text-yellow-600'
          }`}
          title={school.isFeatured ? 'Remove from Popular Listings' : featuredCount >= 4 ? 'Popular Listings full (4/4)' : 'Add to Popular Listings'}>
          <Star size={14} fill={school.isFeatured ? 'currentColor' : 'none'} />
        </button>
      )}
      <button onClick={() => deleteSchool(school._id)}
        className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-600 transition" title="Delete">
        <Trash2 size={14} />
      </button>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#f5f6fa]">
      <AdminNav />
      <div className="flex-1 overflow-x-hidden pt-14 lg:pt-0">

        {/* Top bar */}
        <div className="bg-white border-b border-gray-100 px-5 md:px-8 py-5">
          <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                  <School size={15} className="text-green-700" />
                </div>
                Manage Schools
              </h1>
              <p className="text-gray-400 text-sm mt-1.5 ml-10.5">Review, approve, and select Popular Listings</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border shrink-0 ${
                featuredCount >= 4
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-green-50 text-green-700 border-green-200'
              }`}>
                <Star size={11} fill="currentColor" />
                Popular: {featuredCount}/4
                {featuredCount >= 4 && <span className="font-medium ml-0.5">(full)</span>}
              </span>
              {viewMode === 'schools' && filter === 'pending' && pendingCount > 0 && (
                <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold px-3 py-1.5 rounded-full shrink-0">
                  {pendingCount} awaiting review
                </span>
              )}
            </div>
          </div>

          {/* View mode switcher */}
          <div className="flex gap-1.5 mb-3 bg-gray-100 rounded-xl p-1 w-fit">
            <button onClick={() => setViewMode('schools')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold transition ${
                viewMode === 'schools' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}>
              <School size={14} /> Schools
            </button>
            <button onClick={() => setViewMode('claims')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold transition ${
                viewMode === 'claims' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}>
              <Flag size={14} /> Claims
            </button>
          </div>

          {/* Schools status filter tabs */}
          {viewMode === 'schools' && (
            <div className="flex gap-1.5 flex-wrap">
              {STATUS_TABS.map(({ value, label }) => (
                <button key={label} onClick={() => setFilter(value)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
                    filter === value ? 'bg-green-700 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}>
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Claims view */}
        {viewMode === 'claims' && <ClaimsView />}

        {/* Schools view */}
        {viewMode === 'schools' && (
          <div className="p-4 md:p-6">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl h-16 animate-pulse border border-gray-100" />
                ))}
              </div>
            ) : schools.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                <School size={36} className="text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No schools found</p>
                <p className="text-gray-400 text-sm">Try a different status filter</p>
              </div>
            ) : (
              <>
                {/* Mobile cards */}
                <div className="md:hidden space-y-3">
                  {schools.map((school) => (
                    <div key={school._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 text-sm leading-snug truncate">{school.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {[school.city, school.state].filter(Boolean).join(', ')}
                            {school.type ? ` · ${school.type}` : ''}
                          </p>
                          {school.isFeatured && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-yellow-600 font-semibold mt-1">
                              <Star size={9} fill="currentColor" /> Featured
                            </span>
                          )}
                        </div>
                        <span className={`shrink-0 text-xs px-2.5 py-1 rounded-full font-semibold ${statusStyle(school.status)}`}>
                          {school.status}
                        </span>
                      </div>
                      {school.owner?.email && (
                        <p className="text-[11px] text-gray-400 mb-3 truncate">{school.owner.email}</p>
                      )}
                      <ActionButtons school={school} />
                    </div>
                  ))}
                </div>

                {/* Desktop table */}
                <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
                  <table className="w-full text-sm min-w-175">
                    <thead className="bg-gray-50 text-gray-500 text-left border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wide text-gray-500">School</th>
                        <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wide text-gray-500">Location</th>
                        <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wide text-gray-500">Type</th>
                        <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wide text-gray-500">Status</th>
                        <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wide text-gray-500">Owner</th>
                        <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wide text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {schools.map((school) => (
                        <tr key={school._id} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4">
                            <div className="font-semibold text-gray-900">{school.name}</div>
                            {school.isFeatured && (
                              <span className="inline-flex items-center gap-1 text-[10px] text-yellow-600 font-semibold mt-0.5">
                                <Star size={10} fill="currentColor" /> Featured
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-gray-500">{[school.city, school.state].filter(Boolean).join(', ')}</td>
                          <td className="px-6 py-4 capitalize text-gray-500">{school.type}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center text-xs px-3 py-1 rounded-full font-semibold ${statusStyle(school.status)}`}>
                              {school.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-400 text-xs">{school.owner?.email || '—'}</td>
                          <td className="px-6 py-4">
                            <ActionButtons school={school} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
