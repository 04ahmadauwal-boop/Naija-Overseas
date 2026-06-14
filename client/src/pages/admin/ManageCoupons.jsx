import { useState, useEffect } from 'react';
import { Ticket, Plus, Trash2, ToggleLeft, ToggleRight, X, RefreshCw } from 'lucide-react';
import { AdminNav } from './Dashboard';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const EMPTY_FORM = { code: '', type: 'percent', value: 20, maxUses: '', expiresAt: '' };

function Badge({ active }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold
      ${active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
      {active ? 'Active' : 'Inactive'}
    </span>
  );
}

export default function ManageCoupons() {
  const [coupons, setCoupons]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);
  const [toggling, setToggling]   = useState(null);
  const [deleting, setDeleting]   = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/coupons');
      setCoupons(data.coupons);
    } catch {
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/coupons', {
        code: form.code.trim().toUpperCase(),
        type: form.type,
        value: form.type === 'full' ? 100 : Number(form.value),
        maxUses: form.maxUses ? Number(form.maxUses) : null,
        expiresAt: form.expiresAt || null,
      });
      toast.success('Coupon created!');
      setForm(EMPTY_FORM);
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create coupon');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (coupon) => {
    setToggling(coupon._id);
    try {
      await api.patch(`/coupons/${coupon._id}`, { isActive: !coupon.isActive });
      setCoupons((prev) => prev.map((c) => c._id === coupon._id ? { ...c, isActive: !c.isActive } : c));
      toast.success(coupon.isActive ? 'Coupon deactivated' : 'Coupon activated');
    } catch {
      toast.error('Update failed');
    } finally {
      setToggling(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this coupon? This cannot be undone.')) return;
    setDeleting(id);
    try {
      await api.delete(`/coupons/${id}`);
      setCoupons((prev) => prev.filter((c) => c._id !== id));
      toast.success('Coupon deleted');
    } catch {
      toast.error('Delete failed');
    } finally {
      setDeleting(null);
    }
  };

  const inp = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white transition';

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminNav />
      <div className="flex-1 overflow-x-hidden pt-14 lg:pt-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
                <Ticket size={22} className="text-green-600" /> Coupon Codes
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Create and manage discount codes for study abroad consultations.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={load}
                className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-white hover:text-gray-700 transition">
                <RefreshCw size={16} />
              </button>
              <button onClick={() => setShowForm(true)}
                className="flex items-center gap-2 bg-green-700 text-white font-bold px-4 py-2.5 rounded-xl hover:bg-green-800 transition text-sm">
                <Plus size={16} /> New Coupon
              </button>
            </div>
          </div>

          {/* Create form modal */}
          {showForm && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
              <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                <div className="bg-green-900 px-6 py-4 flex items-center justify-between">
                  <h2 className="text-base font-extrabold text-white">Create Coupon</h2>
                  <button onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-green-800 text-green-300 hover:bg-green-700 transition">
                    <X size={14} />
                  </button>
                </div>

                <form onSubmit={handleCreate} className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                      Coupon Code <span className="text-red-500">*</span>
                    </label>
                    <input required value={form.code}
                      onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                      className={`${inp} font-mono tracking-widest`} placeholder="e.g. WELCOME50" maxLength={20} />
                    <p className="text-xs text-gray-400 mt-1">Auto-uppercased. Letters, numbers and hyphens only.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                      Discount Type <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { val: 'percent', label: 'Percentage Off', sub: 'e.g. 20% off' },
                        { val: 'full',    label: 'Full Discount',   sub: '100% free' },
                      ].map(({ val, label, sub }) => (
                        <button key={val} type="button"
                          onClick={() => setForm({ ...form, type: val })}
                          className={`p-3 rounded-xl border-2 text-left transition
                            ${form.type === val ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                          <p className={`text-sm font-bold ${form.type === val ? 'text-green-800' : 'text-gray-700'}`}>{label}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {form.type === 'percent' && (
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                        Percentage Off (1–99) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input type="number" required min={1} max={99} value={form.value}
                          onChange={(e) => setForm({ ...form, value: e.target.value })}
                          className={inp} placeholder="20" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">%</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        User pays ₦{Math.round((1 - form.value / 100) * 10000).toLocaleString()} after discount.
                      </p>
                    </div>
                  )}

                  {form.type === 'full' && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-800 font-medium">
                      This coupon gives a <strong>100% discount</strong> — the consultation will be completely free for the user.
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                        Max Uses
                      </label>
                      <input type="number" min={1} value={form.maxUses}
                        onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                        className={inp} placeholder="Unlimited" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                        Expires On
                      </label>
                      <input type="date" value={form.expiresAt}
                        onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                        className={inp} min={new Date().toISOString().split('T')[0]} />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-1">
                    <button type="button" onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}
                      className="flex-1 border border-gray-200 rounded-xl py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
                      Cancel
                    </button>
                    <button type="submit" disabled={saving}
                      className="flex-1 bg-green-700 text-white rounded-xl py-3 text-sm font-bold hover:bg-green-800 disabled:opacity-60 transition flex items-center justify-center gap-2">
                      {saving ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating...</> : 'Create Coupon'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Coupons table */}
          {loading ? (
            <div className="flex items-center justify-center py-20 text-gray-400">
              <span className="w-6 h-6 border-2 border-gray-200 border-t-green-500 rounded-full animate-spin mr-3" /> Loading coupons...
            </div>
          ) : coupons.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
              <Ticket size={36} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">No coupons yet</p>
              <p className="text-gray-400 text-sm mt-1">Click "New Coupon" to create your first discount code.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      {['Code', 'Type', 'Discount', 'Uses', 'Expires', 'Status', ''].map((h) => (
                        <th key={h} className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {coupons.map((c) => {
                      const expired = c.expiresAt && new Date() > new Date(c.expiresAt);
                      const maxedOut = c.maxUses !== null && c.usedCount >= c.maxUses;
                      return (
                        <tr key={c._id} className="hover:bg-gray-50 transition">
                          <td className="px-5 py-4">
                            <span className="font-mono font-bold text-gray-900 tracking-widest text-sm bg-gray-100 px-2.5 py-1 rounded-lg">
                              {c.code}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${c.type === 'full' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                              {c.type === 'full' ? 'Full (Free)' : 'Percentage'}
                            </span>
                          </td>
                          <td className="px-5 py-4 font-bold text-green-700">
                            {c.type === 'full' ? '100% off' : `${c.value}% off`}
                            {c.type === 'percent' && (
                              <span className="block text-xs text-gray-400 font-normal">
                                User pays ₦{(10000 - Math.round(c.value / 100 * 10000)).toLocaleString()}
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            <span className={`font-semibold ${maxedOut ? 'text-red-600' : 'text-gray-700'}`}>
                              {c.usedCount}
                            </span>
                            <span className="text-gray-400"> / {c.maxUses === null ? '∞' : c.maxUses}</span>
                          </td>
                          <td className="px-5 py-4 text-gray-500">
                            {c.expiresAt
                              ? <span className={expired ? 'text-red-500 font-semibold' : ''}>
                                  {new Date(c.expiresAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                  {expired && ' (Expired)'}
                                </span>
                              : <span className="text-gray-400">Never</span>}
                          </td>
                          <td className="px-5 py-4">
                            <Badge active={c.isActive && !expired && !maxedOut} />
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2 justify-end">
                              <button onClick={() => toggleActive(c)} disabled={toggling === c._id}
                                title={c.isActive ? 'Deactivate' : 'Activate'}
                                className="p-1.5 rounded-lg hover:bg-gray-100 transition text-gray-500 hover:text-gray-700 disabled:opacity-40">
                                {c.isActive
                                  ? <ToggleRight size={20} className="text-green-600" />
                                  : <ToggleLeft size={20} className="text-gray-400" />}
                              </button>
                              <button onClick={() => handleDelete(c._id)} disabled={deleting === c._id}
                                title="Delete"
                                className="p-1.5 rounded-lg hover:bg-red-50 transition text-gray-400 hover:text-red-600 disabled:opacity-40">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
                <p className="text-xs text-gray-400">{coupons.length} coupon{coupons.length !== 1 ? 's' : ''} total</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
