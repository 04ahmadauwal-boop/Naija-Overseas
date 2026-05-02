import { useState, useEffect } from 'react';
import { AdminNav } from './Dashboard';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { CalendarCheck } from 'lucide-react';

const STATUS_TABS = ['all', 'pending', 'confirmed', 'cancelled'];

const STATUS_STYLES = {
  confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  pending: 'bg-yellow-100 text-yellow-700',
};

export default function ManageBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/bookings');
      setBookings(data.bookings);
    } catch { toast.error('Failed to load bookings'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBookings(); }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/bookings/${id}/status`, { status });
      toast.success(`Booking ${status}`);
      fetchBookings();
    } catch { toast.error('Action failed'); }
  };

  const filtered = statusFilter === 'all'
    ? bookings
    : bookings.filter((b) => b.status === statusFilter);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminNav />
      <div className="flex-1 overflow-x-hidden">

        <div className="bg-white border-b border-gray-100 px-8 py-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">Manage Bookings</h1>
              <p className="text-gray-400 text-sm mt-0.5">Consultation and appointment bookings</p>
            </div>
            <div className="bg-blue-50 text-blue-700 text-sm font-bold px-4 py-2 rounded-full">
              {bookings.filter((b) => b.status === 'pending').length} pending
            </div>
          </div>

          <div className="flex gap-2">
            {STATUS_TABS.map((tab) => (
              <button key={tab} onClick={() => setStatusFilter(tab)}
                className={`px-5 py-2 rounded-full text-sm font-semibold capitalize transition ${
                  statusFilter === tab
                    ? 'bg-green-700 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                {tab}
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
              <CalendarCheck size={36} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No bookings found</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-left border-b border-gray-100">
                  <tr>
                    {['Name', 'Email', 'Service', 'Date', 'Time Slot', 'Status', 'Actions'].map((h) => (
                      <th key={h} className="px-6 py-4 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((b) => (
                    <tr key={b._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-semibold text-gray-900">{b.name}</td>
                      <td className="px-6 py-4 text-gray-500 text-xs">{b.email}</td>
                      <td className="px-6 py-4 text-gray-500 capitalize">{b.service?.replace(/-/g, ' ')}</td>
                      <td className="px-6 py-4 text-gray-500">{new Date(b.date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                      <td className="px-6 py-4 text-gray-500">{b.timeSlot}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-3 py-1 rounded-full font-semibold ${STATUS_STYLES[b.status] || 'bg-gray-100 text-gray-600'}`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {b.status === 'pending' && (
                          <div className="flex gap-2">
                            <button onClick={() => updateStatus(b._id, 'confirmed')}
                              className="bg-green-100 text-green-700 hover:bg-green-200 text-xs font-semibold px-3 py-1.5 rounded-lg transition">
                              Confirm
                            </button>
                            <button onClick={() => updateStatus(b._id, 'cancelled')}
                              className="bg-red-100 text-red-700 hover:bg-red-200 text-xs font-semibold px-3 py-1.5 rounded-lg transition">
                              Cancel
                            </button>
                          </div>
                        )}
                        {b.status === 'confirmed' && (
                          <button onClick={() => updateStatus(b._id, 'cancelled')}
                            className="bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-700 text-xs font-semibold px-3 py-1.5 rounded-lg transition">
                            Cancel
                          </button>
                        )}
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
