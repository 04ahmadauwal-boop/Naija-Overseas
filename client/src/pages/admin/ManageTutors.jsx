import { useState, useEffect } from 'react';
import { AdminNav } from './Dashboard';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import {
  GraduationCap, CheckCircle, XCircle, Search, Clock,
  Star, Globe, BookOpen, Eye, RefreshCw,
  FileText, Video, Camera, ShieldCheck, ShieldAlert, ExternalLink,
} from 'lucide-react';

const STATUS_TABS = [
  { value: 'pending', label: 'Pending Approval' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'all', label: 'All' },
];

function StatusBadge({ isActive, isVerified }) {
  if (isActive && isVerified)
    return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700"><CheckCircle size={11} /> Live &amp; Verified</span>;
  if (isActive)
    return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700"><CheckCircle size={11} /> Active</span>;
  return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700"><Clock size={11} /> Pending</span>;
}

export default function ManageTutors() {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pending');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [selected, setSelected] = useState(null);

  const fetchTutors = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/tutors/admin/all');
      setTutors(data.tutors || []);
    } catch {
      toast.error('Failed to load tutors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTutors(); }, []);

  const handleApprove = async (tutor) => {
    setActionLoading(tutor._id + '_approve');
    try {
      await api.patch(`/tutors/${tutor._id}/activate`, { isActive: true, isVerified: true });
      toast.success(`${tutor.displayName} approved and live!`);
      fetchTutors();
      if (selected?._id === tutor._id) setSelected(null);
    } catch {
      toast.error('Failed to approve tutor');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeactivate = async (tutor) => {
    if (!confirm(`Deactivate "${tutor.displayName}"? They will be removed from public listings.`)) return;
    setActionLoading(tutor._id + '_deactivate');
    try {
      await api.patch(`/tutors/${tutor._id}/activate`, { isActive: false, isVerified: false });
      toast.success(`${tutor.displayName} deactivated`);
      fetchTutors();
      if (selected?._id === tutor._id) setSelected(null);
    } catch {
      toast.error('Failed to deactivate tutor');
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = tutors.filter((t) => {
    const matchTab =
      tab === 'all' ? true :
      tab === 'pending' ? !t.isActive :
      tab === 'active' ? t.isActive :
      tab === 'inactive' ? !t.isActive : true;

    const q = search.toLowerCase();
    const matchSearch = !q ||
      t.displayName?.toLowerCase().includes(q) ||
      t.user?.name?.toLowerCase().includes(q) ||
      t.user?.email?.toLowerCase().includes(q) ||
      t.subjects?.some((s) => s.toLowerCase().includes(q)) ||
      t.country?.toLowerCase().includes(q);

    return matchTab && matchSearch;
  });

  const pendingCount = tutors.filter((t) => !t.isActive).length;
  const activeCount = tutors.filter((t) => t.isActive).length;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminNav />

      <div className="flex-1 overflow-x-hidden pt-14 lg:pt-0">

        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-4 md:px-8 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">Manage Tutors</h1>
              <p className="text-gray-400 text-sm mt-0.5">
                {pendingCount} pending approval · {activeCount} active
              </p>
            </div>
            <button onClick={fetchTutors}
              className="flex items-center gap-2 border border-gray-200 text-gray-600 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition self-start">
              <RefreshCw size={15} /> Refresh
            </button>
          </div>
        </div>

        <div className="p-4 md:p-8 space-y-6">

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Status tabs */}
            <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 overflow-x-auto shrink-0">
              {STATUS_TABS.map(({ value, label }) => (
                <button key={value} onClick={() => setTab(value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                    tab === value ? 'bg-green-700 text-white' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                  }`}>
                  {label}
                  {value === 'pending' && pendingCount > 0 && (
                    <span className="ml-1.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {pendingCount}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Search */}
            <form onSubmit={(e) => { e.preventDefault(); setSearch(searchInput.trim()); }}
              className="flex gap-2 flex-1">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search by name, email, subject or country…"
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                />
              </div>
              <button type="submit"
                className="bg-green-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-800 transition shrink-0">
                Search
              </button>
              {search && (
                <button type="button" onClick={() => { setSearch(''); setSearchInput(''); }}
                  className="border border-gray-200 text-gray-500 px-3 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition shrink-0">
                  Clear
                </button>
              )}
            </form>
          </div>

          {/* Main layout: list + detail panel */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

            {/* Tutor List */}
            <div className="lg:col-span-3 space-y-3">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 h-24 skeleton-shimmer" />
                ))
              ) : filtered.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
                  <GraduationCap size={36} className="text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-500 font-semibold">No tutors found</p>
                  <p className="text-gray-400 text-sm mt-1">
                    {tab === 'pending' ? 'No tutor applications waiting for approval' : 'Try a different filter'}
                  </p>
                </div>
              ) : (
                filtered.map((tutor) => (
                  <div key={tutor._id}
                    onClick={() => setSelected(tutor)}
                    className={`bg-white rounded-2xl border shadow-sm p-4 cursor-pointer transition-all hover:shadow-md ${
                      selected?._id === tutor._id ? 'border-green-500 ring-2 ring-green-100' : 'border-gray-100'
                    }`}>
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-700 font-extrabold text-lg shrink-0 overflow-hidden">
                        {tutor.profilePhoto
                          ? <img src={tutor.profilePhoto} alt="" className="w-full h-full object-cover" />
                          : (tutor.displayName || tutor.user?.name || '?').charAt(0).toUpperCase()
                        }
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-gray-900 text-sm">{tutor.displayName || tutor.user?.name}</p>
                          <StatusBadge isActive={tutor.isActive} isVerified={tutor.isVerified} />
                          {(() => {
                            const docs = tutor.verificationDocs || [];
                            const hasId  = docs.some(d => d.name === 'Means of Identification');
                            const hasAddr = docs.some(d => d.name === 'Proof of Address');
                            return hasId && hasAddr
                              ? <span className="flex items-center gap-0.5 text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded-full"><ShieldCheck size={9} /> Docs OK</span>
                              : <span className="flex items-center gap-0.5 text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-full"><ShieldAlert size={9} /> Docs missing</span>;
                          })()}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5 truncate">{tutor.user?.email}</p>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-1">{tutor.headline}</p>
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                          {tutor.country && (
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <Globe size={11} /> {tutor.country}
                            </span>
                          )}
                          {tutor.subjects?.length > 0 && (
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <BookOpen size={11} /> {tutor.subjects.slice(0, 2).join(', ')}{tutor.subjects.length > 2 ? ` +${tutor.subjects.length - 2}` : ''}
                            </span>
                          )}
                          {tutor.rating > 0 && (
                            <span className="flex items-center gap-1 text-xs text-yellow-600">
                              <Star size={11} fill="currentColor" /> {tutor.rating} ({tutor.reviewCount})
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-col gap-2 shrink-0">
                        {!tutor.isActive ? (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleApprove(tutor); }}
                            disabled={actionLoading === tutor._id + '_approve'}
                            className="flex items-center gap-1.5 bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-800 transition disabled:opacity-60">
                            {actionLoading === tutor._id + '_approve' ? (
                              <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                              <CheckCircle size={13} />
                            )}
                            Approve
                          </button>
                        ) : (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeactivate(tutor); }}
                            disabled={actionLoading === tutor._id + '_deactivate'}
                            className="flex items-center gap-1.5 border border-red-200 text-red-600 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-50 transition disabled:opacity-60">
                            {actionLoading === tutor._id + '_deactivate' ? (
                              <span className="w-3 h-3 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                            ) : (
                              <XCircle size={13} />
                            )}
                            Deactivate
                          </button>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelected(tutor); }}
                          className="flex items-center gap-1.5 border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-gray-50 transition">
                          <Eye size={13} /> View
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Detail Panel */}
            <div className="lg:col-span-2">
              {selected ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-8 space-y-5">
                  {/* Header */}
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center text-green-700 font-extrabold text-2xl shrink-0">
                      {(selected.displayName || selected.user?.name || '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-extrabold text-gray-900">{selected.displayName || selected.user?.name}</p>
                      <p className="text-xs text-gray-400">{selected.user?.email}</p>
                      <div className="mt-1.5">
                        <StatusBadge isActive={selected.isActive} isVerified={selected.isVerified} />
                      </div>
                    </div>
                    <button onClick={() => setSelected(null)}
                      className="text-gray-300 hover:text-gray-600 transition text-xs font-semibold">
                      ✕
                    </button>
                  </div>

                  {/* Headline */}
                  {selected.headline && (
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Headline</p>
                      <p className="text-sm text-gray-700">{selected.headline}</p>
                    </div>
                  )}

                  {/* Bio */}
                  {selected.bio && (
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Bio</p>
                      <p className="text-sm text-gray-600 leading-relaxed line-clamp-5">{selected.bio}</p>
                    </div>
                  )}

                  {/* Details grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Experience</p>
                      <p className="text-sm font-bold text-gray-900 mt-0.5">{selected.yearsExperience || 0} yrs</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Rating</p>
                      <p className="text-sm font-bold text-gray-900 mt-0.5">
                        {selected.rating > 0 ? `${selected.rating} ★ (${selected.reviewCount})` : 'No reviews yet'}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Location</p>
                      <p className="text-sm font-bold text-gray-900 mt-0.5">
                        {[selected.city, selected.state, selected.country].filter(Boolean).join(', ') || '—'}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Rate</p>
                      <p className="text-sm font-bold text-gray-900 mt-0.5">
                        {selected.currency} {selected.hourlyRateNaira?.toLocaleString() || '—'}/hr
                      </p>
                    </div>
                  </div>

                  {/* Subjects */}
                  {selected.subjects?.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Subjects</p>
                      <div className="flex flex-wrap gap-1.5">
                        {selected.subjects.map((s) => (
                          <span key={s} className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Teaching mode */}
                  {selected.teachingMode?.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Teaching Mode</p>
                      <div className="flex gap-2">
                        {selected.teachingMode.map((m) => (
                          <span key={m} className="text-xs bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full font-medium capitalize">{m}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Qualifications */}
                  {selected.qualifications?.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Qualifications</p>
                      <div className="space-y-1.5">
                        {selected.qualifications.map((q, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-gray-600">
                            <GraduationCap size={13} className="text-gray-400 shrink-0 mt-0.5" />
                            <span><strong>{q.title}</strong> — {q.institution}{q.year ? `, ${q.year}` : ''}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ── Verification & Media ─────────────────────────── */}
                  <div className="border-t border-gray-100 pt-4 space-y-4">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck size={13} className="text-blue-500" /> Verification &amp; Media
                    </p>

                    {/* Profile photo */}
                    <div className="flex items-center gap-3">
                      <Camera size={13} className="text-gray-400 shrink-0" />
                      <span className="text-xs font-semibold text-gray-500 w-28 shrink-0">Profile Photo</span>
                      {selected.profilePhoto ? (
                        <div className="flex items-center gap-2">
                          <img src={selected.profilePhoto} alt="Profile"
                            className="w-10 h-10 rounded-xl object-cover border border-gray-200" />
                          <a href={selected.profilePhoto} target="_blank" rel="noreferrer"
                            className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                            View <ExternalLink size={10} />
                          </a>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Not uploaded</span>
                      )}
                    </div>

                    {/* Verification documents */}
                    {(() => {
                      const docs = selected.verificationDocs || [];
                      const idDoc      = docs.find(d => d.name === 'Means of Identification');
                      const addressDoc = docs.find(d => d.name === 'Proof of Address');
                      const extraDocs  = docs.filter(d => d.name !== 'Means of Identification' && d.name !== 'Proof of Address');

                      return (
                        <div className="space-y-2">
                          {/* Required docs */}
                          {[
                            { label: 'Means of ID', doc: idDoc },
                            { label: 'Proof of Address', doc: addressDoc },
                          ].map(({ label, doc }) => (
                            <div key={label} className="flex items-center gap-3">
                              <FileText size={13} className={doc ? 'text-green-600' : 'text-red-400'} />
                              <span className="text-xs font-semibold text-gray-500 w-28 shrink-0">{label}</span>
                              {doc ? (
                                <a href={doc.fileUrl} target="_blank" rel="noreferrer"
                                  className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-semibold">
                                  View document <ExternalLink size={10} />
                                </a>
                              ) : (
                                <span className="flex items-center gap-1 text-xs text-red-500 font-semibold">
                                  <ShieldAlert size={12} /> Not submitted
                                </span>
                              )}
                            </div>
                          ))}

                          {/* Extra docs */}
                          {extraDocs.length > 0 && (
                            <div className="pl-4 space-y-1.5 mt-1">
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Additional Docs</p>
                              {extraDocs.map((doc, i) => (
                                <div key={i} className="flex items-center gap-2">
                                  <FileText size={11} className="text-gray-400 shrink-0" />
                                  <span className="text-xs text-gray-600 truncate flex-1">{doc.name}</span>
                                  <a href={doc.fileUrl} target="_blank" rel="noreferrer"
                                    className="text-xs text-blue-600 hover:underline shrink-0 flex items-center gap-1">
                                    View <ExternalLink size={9} />
                                  </a>
                                </div>
                              ))}
                            </div>
                          )}

                          {docs.length === 0 && (
                            <p className="text-xs text-red-500 font-semibold flex items-center gap-1 pl-4">
                              <ShieldAlert size={12} /> No documents submitted
                            </p>
                          )}
                        </div>
                      );
                    })()}

                    {/* Intro video */}
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <Video size={13} className={selected.introVideo ? 'text-purple-500' : 'text-gray-400'} />
                        <span className="text-xs font-semibold text-gray-500">Intro Video</span>
                        {!selected.introVideo && (
                          <span className="text-xs text-gray-400 italic">Not uploaded</span>
                        )}
                      </div>
                      {selected.introVideo && (
                        <video src={selected.introVideo} controls
                          className="w-full rounded-xl border border-gray-200 bg-black max-h-40" />
                      )}
                    </div>

                    {/* Verification checklist summary */}
                    <div className={`rounded-xl px-3 py-2.5 text-xs font-semibold flex items-center gap-2 ${
                      (selected.verificationDocs || []).find(d => d.name === 'Means of Identification') &&
                      (selected.verificationDocs || []).find(d => d.name === 'Proof of Address')
                        ? 'bg-green-50 text-green-700'
                        : 'bg-red-50 text-red-700'
                    }`}>
                      {(selected.verificationDocs || []).find(d => d.name === 'Means of Identification') &&
                       (selected.verificationDocs || []).find(d => d.name === 'Proof of Address') ? (
                        <><CheckCircle size={13} /> All required documents submitted — safe to approve</>
                      ) : (
                        <><ShieldAlert size={13} /> Missing required documents — review before approving</>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-3 pt-2 border-t border-gray-50">
                    {!selected.isActive ? (
                      <button
                        onClick={() => handleApprove(selected)}
                        disabled={actionLoading === selected._id + '_approve'}
                        className="flex-1 flex items-center justify-center gap-2 bg-green-700 text-white py-3 rounded-xl text-sm font-bold hover:bg-green-800 transition disabled:opacity-60">
                        {actionLoading === selected._id + '_approve' ? (
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : <CheckCircle size={16} />}
                        Approve &amp; Activate
                      </button>
                    ) : (
                      <button
                        onClick={() => handleDeactivate(selected)}
                        disabled={actionLoading === selected._id + '_deactivate'}
                        className="flex-1 flex items-center justify-center gap-2 border-2 border-red-200 text-red-600 py-3 rounded-xl text-sm font-bold hover:bg-red-50 transition disabled:opacity-60">
                        {actionLoading === selected._id + '_deactivate' ? (
                          <span className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                        ) : <XCircle size={16} />}
                        Deactivate
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center">
                  <GraduationCap size={32} className="text-gray-200 mx-auto mb-3" />
                  <p className="text-sm text-gray-400 font-medium">Select a tutor to view details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
