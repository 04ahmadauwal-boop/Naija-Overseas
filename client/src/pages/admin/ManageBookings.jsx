import { useState, useEffect } from 'react';
import { AdminNav } from './Dashboard';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { CalendarCheck, Video, Link as LinkIcon, Check, Clock } from 'lucide-react';

const STATUS_TABS = ['all', 'pending', 'confirmed', 'cancelled'];
const SERVICE_TABS = ['all', 'tutoring-session', 'school-visit', 'study-abroad-consultation'];

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
          className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs w-40 focus:outline-none focus:ring-2 focus:ring-green-500"
          autoFocus
        />
        <button onClick={handleSave} disabled={saving}
          className="bg-green-700 text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold hover:bg-green-800 transition disabled:opacity-50 flex items-center gap-1">
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
            className="flex items-center gap-1 text-xs text-blue-600 font-semibold hover:underline">
            <Video size={11} /> Join
          </a>
          <button onClick={() => setEditing(true)}
            className="text-xs text-gray-400 hover:text-green-700 font-semibold hover:underline">Edit</button>
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
  const [serviceFilter, setServiceFilter] = useState('all');

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

  const filtered = bookings
    .filter(b => statusFilter === 'all' || b.status === statusFilter)
    .filter(b => serviceFilter === 'all' || b.service === serviceFilter);
  const pendingCount = bookings.filter((b) => b.status === 'pending').length;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminNav />
      <div className="flex-1 overflow-x-hidden pt-14 lg:pt-0">

        <div className="bg-white border-b border-gray-100 px-4 md:px-8 py-5">
          <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-gray-900">Manage Bookings</h1>
              <p className="text-gray-400 text-sm mt-0.5">Consultation and appointment bookings</p>
            </div>
            <div className="bg-blue-50 text-blue-700 text-sm font-bold px-4 py-2 rounded-full shrink-0">
              {pendingCount} pending
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {STATUS_TABS.map((tab) => (
              <button key={tab} onClick={() => setStatusFilter(tab)}
                className={`px-4 py-2 rounded-full text-sm font-semibold capitalize transition ${
                  statusFilter === tab ? 'bg-green-700 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                {tab}
              </button>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap mt-2">
            {SERVICE_TABS.map(tab => (
              <button key={tab} onClick={() => setServiceFilter(tab)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition ${
                  serviceFilter === tab ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                {tab === 'all' ? 'All Services' : tab.replace(/-/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 md:p-8">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl h-16 skeleton-shimmer border border-gray-100" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <CalendarCheck size={36} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No bookings found</p>
            </div>
          ) : (
            <>
              {/* ── Mobile cards (< lg) ─────────────────────── */}
              <div className="lg:hidden space-y-3">
                {filtered.map((b) => (
                  <div key={b._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 text-sm">{b.name || b.user?.name}</p>
                        <p className="text-xs text-gray-400 truncate">{b.email || b.user?.email}</p>
                        {b.tutorId?.displayName && (
                          <p className="text-xs text-green-700 font-semibold truncate">Tutor: {b.tutorId.displayName}</p>
                        )}
                      </div>
                      <span className={`shrink-0 text-xs px-2.5 py-1 rounded-full font-semibold ${STATUS_STYLES[b.status] || 'bg-gray-100 text-gray-600'}`}>
                        {b.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3 text-xs text-gray-500">
                      <span className="capitalize">{b.service?.replace(/-/g, ' ')}</span>
                      {b.isTrial && <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Discounted</span>}
                      {b.subscriptionId && <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Subscribed</span>}
                      <span className="flex items-center gap-1">
                        <CalendarCheck size={11} />
                        {new Date(b.date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      {b.timeSlot && (
                        <span className="flex items-center gap-1"><Clock size={11} /> {b.timeSlot}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <CallLinkCell booking={b} onSaved={fetchBookings} />
                      {b.status === 'pending' && (
                        <>
                          <button onClick={() => updateStatus(b._id, 'confirmed')}
                            className="bg-green-100 text-green-700 hover:bg-green-200 text-xs font-semibold px-3 py-1.5 rounded-lg transition">
                            Confirm
                          </button>
                          <button onClick={() => updateStatus(b._id, 'cancelled')}
                            className="bg-red-100 text-red-700 hover:bg-red-200 text-xs font-semibold px-3 py-1.5 rounded-lg transition">
                            Cancel
                          </button>
                        </>
                      )}
                      {b.status === 'confirmed' && (
                        <button onClick={() => updateStatus(b._id, 'cancelled')}
                          className="bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-700 text-xs font-semibold px-3 py-1.5 rounded-lg transition">
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Desktop table (lg+) ─────────────────────── */}
              <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
                <table className="w-full text-sm min-w-200">
                  <thead className="bg-gray-50 text-gray-500 text-left border-b border-gray-100">
                    <tr>
                      {['Name', 'Tutor', 'Email', 'Service', 'Date', 'Time', 'Status', 'Call Link', 'Actions'].map((h) => (
                        <th key={h} className="px-5 py-4 font-semibold text-xs uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.map((b) => (
                      <tr key={b._id} className="hover:bg-gray-50 transition">
                        <td className="px-5 py-4 font-semibold text-gray-900 whitespace-nowrap">{b.name || b.user?.name}</td>
                        <td className="px-5 py-4 text-sm text-gray-600">{b.tutorId?.displayName || '—'}</td>
                        <td className="px-5 py-4 text-gray-500 text-xs">{b.email || b.user?.email}</td>
                        <td className="px-5 py-4 text-gray-500 capitalize text-xs whitespace-nowrap">{b.service?.replace(/-/g, ' ')}</td>
                        <td className="px-5 py-4 text-gray-500 text-xs whitespace-nowrap">
                          {new Date(b.date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-5 py-4 text-gray-500 text-xs whitespace-nowrap">{b.timeSlot}</td>
                        <td className="px-5 py-4">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${STATUS_STYLES[b.status] || 'bg-gray-100 text-gray-600'}`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <CallLinkCell booking={b} onSaved={fetchBookings} />
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex gap-2">
                            {b.status === 'pending' && (
                              <>
                                <button onClick={() => updateStatus(b._id, 'confirmed')}
                                  className="bg-green-100 text-green-700 hover:bg-green-200 text-xs font-semibold px-3 py-1.5 rounded-lg transition whitespace-nowrap">
                                  Confirm
                                </button>
                                <button onClick={() => updateStatus(b._id, 'cancelled')}
                                  className="bg-red-100 text-red-700 hover:bg-red-200 text-xs font-semibold px-3 py-1.5 rounded-lg transition">
                                  Cancel
                                </button>
                              </>
                            )}
                            {b.status === 'confirmed' && (
                              <button onClick={() => updateStatus(b._id, 'cancelled')}
                                className="bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-700 text-xs font-semibold px-3 py-1.5 rounded-lg transition">
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
