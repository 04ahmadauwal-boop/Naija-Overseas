import { useState, useEffect } from 'react';
import { AdminNav } from './Dashboard';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Star, Trash2, Eye, School } from 'lucide-react';

const STATUS_TABS = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'approved', label: 'Approved', color: 'bg-green-100 text-green-700' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-700' },
  { value: '', label: 'All', color: 'bg-gray-100 text-gray-600' },
];

export default function ManageSchools() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  const fetchSchools = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/schools/admin/all', { params: { status: filter || undefined } });
      setSchools(data.schools);
    } catch { toast.error('Failed to load schools'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSchools(); }, [filter]);

  const approve = async (id, status) => {
    try {
      await api.patch(`/schools/${id}/approve`, { status });
      toast.success(`School ${status}`);
      fetchSchools();
    } catch { toast.error('Action failed'); }
  };

  const toggleFeature = async (id) => {
    try {
      await api.patch(`/schools/${id}/feature`);
      toast.success('Featured status updated');
      fetchSchools();
    } catch { toast.error('Action failed'); }
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

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminNav />
      <div className="flex-1 overflow-x-hidden pt-14 lg:pt-0">

        {/* Top bar */}
        <div className="bg-white border-b border-gray-100 px-8 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">Manage Schools</h1>
              <p className="text-gray-400 text-sm mt-0.5">Review, approve, and feature school listings</p>
            </div>
            {filter === 'pending' && pendingCount > 0 && (
              <span className="bg-yellow-100 text-yellow-800 text-sm font-bold px-4 py-2 rounded-full">
                {pendingCount} awaiting review
              </span>
            )}
          </div>

          {/* Status filter tabs */}
          <div className="flex gap-2 mt-5">
            {STATUS_TABS.map(({ value, label }) => (
              <button key={label} onClick={() => setFilter(value)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition ${
                  filter === value
                    ? 'bg-green-700 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                {label}
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
          ) : schools.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-2xl border border-gray-100">
              <School size={36} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No schools found</p>
              <p className="text-gray-400 text-sm">Try a different status filter</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-left border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 font-semibold">School</th>
                    <th className="px-6 py-4 font-semibold">Location</th>
                    <th className="px-6 py-4 font-semibold">Type</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Owner</th>
                    <th className="px-6 py-4 font-semibold">Actions</th>
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
                        <span className={`inline-flex items-center text-xs px-3 py-1 rounded-full font-semibold ${
                          school.status === 'approved' ? 'bg-green-100 text-green-700' :
                          school.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {school.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-xs">{school.owner?.email || '—'}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {/* View */}
                          <Link to={`/schools/${school.slug || school._id}`} target="_blank"
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition" title="View listing">
                            <Eye size={14} />
                          </Link>

                          {/* Approve / Reject */}
                          {school.status === 'pending' && (
                            <>
                              <button onClick={() => approve(school._id, 'approved')}
                                className="flex items-center gap-1.5 bg-green-100 text-green-700 hover:bg-green-200 text-xs font-semibold px-3 py-1.5 rounded-lg transition">
                                <CheckCircle size={13} /> Approve
                              </button>
                              <button onClick={() => approve(school._id, 'rejected')}
                                className="flex items-center gap-1.5 bg-red-100 text-red-700 hover:bg-red-200 text-xs font-semibold px-3 py-1.5 rounded-lg transition">
                                <XCircle size={13} /> Reject
                              </button>
                            </>
                          )}
                          {school.status === 'rejected' && (
                            <button onClick={() => approve(school._id, 'approved')}
                              className="flex items-center gap-1.5 bg-green-100 text-green-700 hover:bg-green-200 text-xs font-semibold px-3 py-1.5 rounded-lg transition">
                              <CheckCircle size={13} /> Approve
                            </button>
                          )}

                          {/* Feature toggle */}
                          {school.status === 'approved' && (
                            <button onClick={() => toggleFeature(school._id)}
                              className={`w-8 h-8 flex items-center justify-center rounded-lg transition ${
                                school.isFeatured
                                  ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                                  : 'bg-gray-100 text-gray-400 hover:bg-yellow-100 hover:text-yellow-600'
                              }`} title={school.isFeatured ? 'Remove featured' : 'Mark as featured'}>
                              <Star size={14} fill={school.isFeatured ? 'currentColor' : 'none'} />
                            </button>
                          )}

                          {/* Delete */}
                          <button onClick={() => deleteSchool(school._id)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-600 transition" title="Delete">
                            <Trash2 size={14} />
                          </button>
                        </div>
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
