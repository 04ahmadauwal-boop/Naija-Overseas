import { useState, useEffect } from 'react';
import { AdminNav } from './Dashboard';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { Globe } from 'lucide-react';

const STATUSES = ['submitted', 'in-review', 'documents-requested', 'admitted', 'rejected'];
const STATUS_TABS = ['all', ...STATUSES];

const STATUS_STYLES = {
  admitted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  'in-review': 'bg-blue-100 text-blue-700',
  'documents-requested': 'bg-orange-100 text-orange-700',
  submitted: 'bg-yellow-100 text-yellow-700',
};

export default function ManageApplications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchApps = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/study-abroad');
      setApps(data.applications);
    } catch { toast.error('Failed to load applications'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchApps(); }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/study-abroad/${id}/status`, { status });
      toast.success('Status updated');
      fetchApps();
    } catch { toast.error('Action failed'); }
  };

  const filtered = statusFilter === 'all'
    ? apps
    : apps.filter((a) => a.status === statusFilter);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminNav />
      <div className="flex-1 overflow-x-hidden">

        <div className="bg-white border-b border-gray-100 px-8 py-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">Study Abroad Applications</h1>
              <p className="text-gray-400 text-sm mt-0.5">International university placement applications</p>
            </div>
            <div className="bg-purple-50 text-purple-700 text-sm font-bold px-4 py-2 rounded-full">
              {apps.filter((a) => a.status === 'submitted').length} new submissions
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {STATUS_TABS.map((tab) => (
              <button key={tab} onClick={() => setStatusFilter(tab)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition ${
                  statusFilter === tab
                    ? 'bg-green-700 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                {tab.replace(/-/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="p-8">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl h-16 animate-pulse border border-gray-100" />
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
                    {['Applicant', 'Contact', 'Destination', 'Program', 'Intake', 'Status', 'Date', 'Update'].map((h) => (
                      <th key={h} className="px-6 py-4 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((app) => (
                    <tr key={app._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">{app.fullName}</p>
                        <p className="text-xs text-gray-400">{app.currentQualification}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-600 text-xs">{app.email}</p>
                        <p className="text-gray-400 text-xs">{app.phone}</p>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{app.destinationCountry}</td>
                      <td className="px-6 py-4 text-gray-500 text-xs">{app.program || '—'}</td>
                      <td className="px-6 py-4 text-gray-500 text-xs">{app.intake || '—'}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize ${STATUS_STYLES[app.status] || 'bg-gray-100 text-gray-600'}`}>
                          {app.status?.replace(/-/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-xs whitespace-nowrap">
                        {new Date(app.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          onChange={(e) => { if (e.target.value) updateStatus(app._id, e.target.value); }}
                          defaultValue=""
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
                          <option value="" disabled>Change status</option>
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>{s.replace(/-/g, ' ')}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
