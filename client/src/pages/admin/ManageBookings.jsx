import { useState, useEffect } from 'react';
import { AdminNav } from './Dashboard';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { CalendarCheck, Video, Link as LinkIcon, Check } from 'lucide-react';

const STATUS_TABS = ['all', 'pending', 'confirmed', 'cancelled'];

const STATUS_STYLES = {
  confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  pending: 'bg-yellow-100 text-yellow-700',
};

function CallLinkCell({ booking, onSaved }) {
  const [editing, setEditing] = useState(false);
  const [link, setLink] = useState(booking.callLink || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch(`/bookings/${booking._id}/status`, { callLink: link });
      toast.success('Call link saved');
      setEditing(false);
      onSaved();
    } catch {
      toast.error('Failed to save call link');
    } finally {
      setSaving(false);
    }
  };

  if (booking.service !== 'study-abroad-consultation') return <span className="text-xs text-gray-300">—</span>;

  if (editing) {
    return (
      <div className="flex items-center gap-2 min-w-0">
        <input
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="https://meet.google.com/..."
          className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs w-48 focus:outline-none focus:ring-2 focus:ring-green-500"
          autoFocus
        />
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-green-700 text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold hover:bg-green-800 transition disabled:opacity-50 flex items-center gap-1"
        >
          {saving ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={11} />}
          Save
        </button>
        <button onClick={() => { setLink(booking.callLink || ''); setEditing(false); }}
          className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition">
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {booking.callLink ? (
        <>
          <a href={booking.callLink} target="_blank" rel="noreferrer"
            className="flex items-center gap-1 text-xs text-blue-600 font-semibold hover:underline max-w-30 truncate">
            <Video size={11} /> Join
          </a>
          <button onClick={() => setEditing(true)}
            className="text-xs text-gray-400 hover:text-green-700 font-semibold hover:underline">
            Edit
          </button>
        </>
      ) : (
        <button onClick={() => setEditing(true)}
          className="flex items-center gap-1 text-xs text-green-700 font-semibold border border-green-200 bg-green-50 px-2.5 py-1 rounded-lg hover:bg-green-100 transition">
          <LinkIcon size={11} /> Set Link
        </button>
      )}
    </div>
  );
}

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
      <div className="flex-1 overflow-x-hidden pt-14 lg:pt-0">

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
                    {['Name', 'Email', 'Service', 'Date', 'Time Slot', 'Status', 'Call Link', 'Actions'].map((h) => (
                      <th key={h} className="px-5 py-4 font-semibold text-xs uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((b) => (
                    <tr key={b._id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-4 font-semibold text-gray-900">{b.name}</td>
                      <td className="px-5 py-4 text-gray-500 text-xs">{b.email}</td>
                      <td className="px-5 py-4 text-gray-500 capitalize text-xs">{b.service?.replace(/-/g, ' ')}</td>
                      <td className="px-5 py-4 text-gray-500 text-xs whitespace-nowrap">
                        {new Date(b.date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-4 text-gray-500 text-xs">{b.timeSlot}</td>
                      <td className="px-5 py-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${STATUS_STYLES[b.status] || 'bg-gray-100 text-gray-600'}`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <CallLinkCell booking={b} onSaved={fetchBookings} />
                      </td>
                      <td className="px-5 py-4">
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
