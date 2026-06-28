import { useState, useEffect } from 'react';
import { AdminNav } from './Dashboard';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import {
  Globe, X, ExternalLink, CheckCircle, Circle,
  User, ChevronRight
} from 'lucide-react';

const STATUSES = ['submitted', 'in-review', 'documents-requested', 'admitted', 'rejected'];
const STATUS_TABS = ['all', ...STATUSES];

const STATUS_STYLES = {
  admitted:              'bg-green-100 text-green-700',
  rejected:              'bg-red-100 text-red-700',
  'in-review':           'bg-blue-100 text-blue-700',
  'documents-requested': 'bg-orange-100 text-orange-700',
  submitted:             'bg-yellow-100 text-yellow-700',
};

const DOC_NAMES = [
  'WAEC/NECO Certificate', 'University Transcript', 'IELTS Score Report',
  'Personal Statement', 'Reference Letter 1', 'Reference Letter 2',
  'International Passport', 'Bank Statement',
];

function StatusBadge({ status }) {
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize ${STATUS_STYLES[status] || 'bg-gray-100 text-gray-600'}`}>
      {status?.replace(/-/g, ' ')}
    </span>
  );
}

/* ── Student Detail Drawer ──────────────────────────────────────────────── */
function StudentDrawer({ app, onClose, onStatusChange }) {
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [notes, setNotes] = useState(app.notes || '');
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    if (!app.user?._id) { setLoadingProfile(false); return; }
    api.get(`/users/${app.user._id}`)
      .then(({ data }) => setProfile(data))
      .catch(() => setProfile(null))
      .finally(() => setLoadingProfile(false));
  }, [app.user?._id]);

  const handleStatusChange = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      await api.patch(`/study-abroad/${app._id}/status`, { status: newStatus, notes });
      toast.success('Status updated');
      onStatusChange();
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      await api.patch(`/study-abroad/${app._id}/status`, { status: app.status, notes });
      toast.success('Notes saved');
      onStatusChange();
    } catch {
      toast.error('Failed to save notes');
    } finally {
      setSavingNotes(false);
    }
  };

  const documents = profile?.user?.documents || [];
  const allApplications = profile?.applications || [];
  const bio = profile?.user || {};

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer panel */}
      <div className="relative ml-auto w-full max-w-xl bg-white h-full flex flex-col shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="bg-gray-950 text-white px-6 py-5 flex items-start justify-between shrink-0">
          <div>
            <p className="text-xs text-gray-400 font-medium mb-1">Application Detail</p>
            <h2 className="text-lg font-extrabold leading-tight">{app.fullName}</h2>
            <p className="text-gray-400 text-xs mt-0.5">{app.email}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-800 transition">
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Application info */}
          <section className="bg-gray-50 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Application</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Destination</p>
                <p className="font-semibold text-gray-900">{app.destinationCountry}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">University</p>
                <p className="font-semibold text-gray-900">{app.university || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Program</p>
                <p className="font-semibold text-gray-900">{app.program || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Intake</p>
                <p className="font-semibold text-gray-900">{app.intake || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Qualification</p>
                <p className="font-semibold text-gray-900">{app.currentQualification || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Phone</p>
                <p className="font-semibold text-gray-900">{app.phone}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Submitted</p>
                <p className="font-semibold text-gray-900">
                  {new Date(app.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Current Status</p>
                <StatusBadge status={app.status} />
              </div>
            </div>
          </section>

          {/* Bio Data */}
          <section className="bg-gray-50 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
              <User size={13} className="text-gray-400" /> Bio Data
              {loadingProfile && <span className="text-gray-400 font-normal text-xs">Loading…</span>}
            </h3>
            {bio.name ? (
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Date of Birth</p>
                  <p className="font-semibold text-gray-900">
                    {bio.dateOfBirth ? new Date(bio.dateOfBirth).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Gender</p>
                  <p className="font-semibold text-gray-900 capitalize">{bio.gender?.replace(/-/g, ' ') || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">State of Origin</p>
                  <p className="font-semibold text-gray-900">{bio.stateOfOrigin || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">LGA</p>
                  <p className="font-semibold text-gray-900">{bio.lga || '—'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-400 mb-0.5">Home Address</p>
                  <p className="font-semibold text-gray-900">{bio.address || '—'}</p>
                </div>
                {bio.nextOfKin?.name && (
                  <>
                    <div className="col-span-2 border-t border-gray-100 pt-2 mt-1">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Next of Kin</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Name</p>
                      <p className="font-semibold text-gray-900">{bio.nextOfKin.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Relationship</p>
                      <p className="font-semibold text-gray-900">{bio.nextOfKin.relationship || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Phone</p>
                      <p className="font-semibold text-gray-900">{bio.nextOfKin.phone || '—'}</p>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">{loadingProfile ? 'Loading…' : 'Student has not completed bio data yet.'}</p>
            )}
          </section>

          {/* Update status */}
          <section>
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Update Status</h3>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map((s) => (
                <button key={s} disabled={updatingStatus || s === app.status}
                  onClick={() => handleStatusChange(s)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${
                    s === app.status
                      ? `${STATUS_STYLES[s]} ring-2 ring-offset-1 ring-current opacity-80`
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  } disabled:cursor-not-allowed`}>
                  {s.replace(/-/g, ' ')}
                </button>
              ))}
            </div>
          </section>

          {/* Admin notes */}
          <section>
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Admin Notes</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Add internal notes about this application…"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            />
            <button onClick={handleSaveNotes} disabled={savingNotes}
              className="mt-2 px-4 py-2 bg-green-700 text-white text-xs font-semibold rounded-xl hover:bg-green-800 transition disabled:opacity-50">
              {savingNotes ? 'Saving…' : 'Save Notes'}
            </button>
          </section>

          {/* Uploaded Documents */}
          <section>
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">
              Uploaded Documents
              {loadingProfile && <span className="ml-2 text-gray-400 font-normal text-xs">Loading…</span>}
            </h3>
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
              {DOC_NAMES.map((name) => {
                const found = documents.find((d) => d.name === name);
                return (
                  <div key={name} className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${found ? 'bg-green-100' : 'bg-gray-100'}`}>
                      {found
                        ? <CheckCircle size={13} className="text-green-600" />
                        : <Circle size={13} className="text-gray-300" />
                      }
                    </div>
                    <p className="flex-1 text-sm text-gray-700 font-medium">{name}</p>
                    {found ? (
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-gray-400">
                          {new Date(found.uploadedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </span>
                        <a href={found.fileUrl} target="_blank" rel="noreferrer"
                          className="flex items-center gap-1 text-xs text-blue-600 font-semibold hover:underline">
                          <ExternalLink size={11} /> View
                        </a>
                      </div>
                    ) : (
                      <span className="text-[11px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">Not uploaded</span>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {documents.length} of {DOC_NAMES.length} documents uploaded
            </p>
          </section>

          {/* All applications by this student */}
          {allApplications.length > 1 && (
            <section>
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">
                All Applications by This Student ({allApplications.length})
              </h3>
              <div className="space-y-2">
                {allApplications.map((a) => (
                  <div key={a._id} className={`flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 ${a._id === app._id ? 'ring-1 ring-green-400' : ''}`}>
                    <Globe size={14} className="text-gray-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{a.destinationCountry} — {a.program || 'No program'}</p>
                      <p className="text-xs text-gray-400">{new Date(a.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                    <StatusBadge status={a.status} />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ──────────────────────────────────────────────────────────── */
export default function ManageApplications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  const fetchApps = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/study-abroad');
      setApps(data.applications);
    } catch { toast.error('Failed to load applications'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchApps(); }, []);

  const filtered = statusFilter === 'all' ? apps : apps.filter((a) => a.status === statusFilter);

  const handleStatusChange = () => {
    fetchApps();
    // refresh selected app from updated list
    if (selected) {
      // re-fetch after state update
      setTimeout(() => {
        setSelected((prev) => apps.find((a) => a._id === prev?._id) || prev);
      }, 500);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f5f6fa]">
      <AdminNav />
      <div className="flex-1 overflow-x-hidden pt-14 lg:pt-0">

        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-5 md:px-8 py-5">
          <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
                  <Globe size={15} className="text-indigo-700" />
                </div>
                Study Abroad Applications
              </h1>
              <p className="text-gray-400 text-sm mt-1.5 ml-10.5">Click any row to view full student details and documents</p>
            </div>
            {apps.filter((a) => a.status === 'submitted').length > 0 && (
              <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold px-3 py-1.5 rounded-full shrink-0">
                {apps.filter((a) => a.status === 'submitted').length} new submissions
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {STATUS_TABS.map((tab) => (
              <button key={tab} onClick={() => setStatusFilter(tab)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                  statusFilter === tab ? 'bg-green-700 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                {tab.replace(/-/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 md:p-6">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl h-16 skeleton-shimmer border border-gray-100" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-2xl border border-gray-100">
              <Globe size={36} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No applications found</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-left border-b border-gray-100">
                  <tr>
                    {['Applicant', 'Destination', 'Program', 'Intake', 'Status', 'Date', ''].map((h) => (
                      <th key={h} className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((app) => (
                    <tr key={app._id}
                      onClick={() => setSelected(app)}
                      className="hover:bg-green-50/40 transition cursor-pointer group">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">{app.fullName}</p>
                        <p className="text-xs text-gray-400">{app.email}</p>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{app.destinationCountry}</td>
                      <td className="px-6 py-4 text-gray-500 text-xs max-w-35 truncate">{app.program || '—'}</td>
                      <td className="px-6 py-4 text-gray-500 text-xs">{app.intake || '—'}</td>
                      <td className="px-6 py-4"><StatusBadge status={app.status} /></td>
                      <td className="px-6 py-4 text-gray-400 text-xs whitespace-nowrap">
                        {new Date(app.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
                      </td>
                      <td className="px-6 py-4">
                        <ChevronRight size={16} className="text-gray-300 group-hover:text-green-600 transition" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Detail Drawer */}
      {selected && (
        <StudentDrawer
          app={selected}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
