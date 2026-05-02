import { useState, useEffect } from 'react';
import { AdminNav } from './Dashboard';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { MessageSquare, Mail, CheckCheck } from 'lucide-react';

export default function ManageMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/contact');
      setMessages(data.messages);
    } catch { toast.error('Failed to load messages'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMessages(); }, []);

  const markRead = async (id) => {
    try {
      await api.patch(`/contact/${id}/read`);
      fetchMessages();
    } catch { /* silent */ }
  };

  const open = (msg) => {
    setSelected(msg);
    if (!msg.isRead) markRead(msg._id);
  };

  const filtered = filter === 'unread'
    ? messages.filter((m) => !m.isRead)
    : messages;

  const unreadCount = messages.filter((m) => !m.isRead).length;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminNav />
      <div className="flex-1 flex flex-col overflow-hidden">

        <div className="bg-white border-b border-gray-100 px-8 py-5 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">Contact Messages</h1>
              <p className="text-gray-400 text-sm mt-0.5">Messages from the contact form</p>
            </div>
            {unreadCount > 0 && (
              <span className="bg-red-100 text-red-700 text-sm font-bold px-4 py-2 rounded-full">
                {unreadCount} unread
              </span>
            )}
          </div>
          <div className="flex gap-2">
            {['all', 'unread'].map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-5 py-2 rounded-full text-sm font-semibold capitalize transition ${
                  filter === f ? 'bg-green-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                {f} {f === 'unread' && unreadCount > 0 && `(${unreadCount})`}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">

          {/* Message list */}
          <div className="w-80 shrink-0 border-r border-gray-100 bg-white overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="bg-gray-100 rounded-xl h-20 animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 px-4">
                <MessageSquare size={28} className="text-gray-200 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No messages</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {filtered.map((msg) => (
                  <button key={msg._id} onClick={() => open(msg)}
                    className={`w-full text-left px-5 py-4 transition-all ${
                      selected?._id === msg._id
                        ? 'bg-green-50 border-r-2 border-green-600'
                        : !msg.isRead
                        ? 'bg-yellow-50 hover:bg-yellow-100'
                        : 'hover:bg-gray-50'
                    }`}>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className={`text-sm truncate ${!msg.isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                        {msg.name}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {!msg.isRead && <span className="w-2 h-2 rounded-full bg-green-600" />}
                        <span className="text-[10px] text-gray-400">
                          {new Date(msg.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    </div>
                    <p className={`text-xs truncate mb-0.5 ${!msg.isRead ? 'text-gray-600' : 'text-gray-400'}`}>
                      {msg.subject || 'No subject'}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{msg.message}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Detail view */}
          <div className="flex-1 overflow-y-auto bg-gray-50">
            {selected ? (
              <div className="p-8 max-w-2xl">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-100">
                    <h2 className="text-lg font-extrabold text-gray-900 mb-3">{selected.subject || 'No Subject'}</h2>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'From', value: selected.name },
                        { label: 'Email', value: selected.email },
                        { label: 'Phone', value: selected.phone || 'Not provided' },
                        { label: 'Date', value: new Date(selected.createdAt).toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) },
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <p className="text-xs text-gray-400 font-medium mb-0.5">{label}</p>
                          <p className="text-sm font-semibold text-gray-900">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="px-6 py-5">
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-3">Message</p>
                    <div className="bg-gray-50 rounded-xl p-5 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap border border-gray-100">
                      {selected.message}
                    </div>
                  </div>

                  <div className="px-6 pb-6 flex gap-3">
                    <a href={`mailto:${selected.email}?subject=Re: ${selected.subject || 'Your enquiry'}`}
                      className="flex items-center gap-2 bg-green-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-green-800 transition">
                      <Mail size={15} /> Reply via Email
                    </a>
                    {!selected.isRead && (
                      <button onClick={() => markRead(selected._id)}
                        className="flex items-center gap-2 bg-gray-100 text-gray-700 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-200 transition">
                        <CheckCheck size={15} /> Mark as Read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageSquare size={36} className="text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400 font-medium text-sm">Select a message to read</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
