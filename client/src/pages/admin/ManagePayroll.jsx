import { useState, useEffect } from 'react';
import { AdminNav } from './Dashboard';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import {
  DollarSign, CheckCircle, Clock, AlertCircle, Search,
  ChevronDown, ChevronUp, X, Save, ExternalLink,
  Building2, ShieldCheck, ShieldAlert, Star, BadgeCheck,
  TrendingUp, Wallet, Users, Percent, Settings,
} from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'all',             label: 'All'           },
  { value: 'pending_review',  label: 'Pending Review'},
  { value: 'review_submitted',label: 'Under Review'  },
  { value: 'approved',        label: 'Approved'      },
  { value: 'disbursed',       label: 'Disbursed'     },
  { value: 'on_hold',         label: 'On Hold'       },
];

const STATUS_STYLES = {
  pending_review:   { badge: 'bg-yellow-100 text-yellow-700 border-yellow-200',  dot: 'bg-yellow-400' },
  review_submitted: { badge: 'bg-blue-100   text-blue-700   border-blue-200',    dot: 'bg-blue-400'   },
  approved:         { badge: 'bg-purple-100 text-purple-700 border-purple-200',  dot: 'bg-purple-500' },
  disbursed:        { badge: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  on_hold:          { badge: 'bg-red-100    text-red-600    border-red-200',     dot: 'bg-red-400'    },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.pending_review;
  const label = STATUS_OPTIONS.find(o => o.value === status)?.label || status;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${s.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {label}
    </span>
  );
}

function StarRow({ rating }) {
  return (
    <div className="flex items-center gap-px">
      {[1,2,3,4,5].map(n => (
        <Star key={n} size={12} className={n <= Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />
      ))}
    </div>
  );
}

function PayrollDetailModal({ record, onClose, onUpdate }) {
  const [status, setStatus]   = useState(record.status);
  const [note, setNote]       = useState(record.adminNote || '');
  const [ref, setRef]         = useState(record.disbursementRef || '');
  const [feePercent, setFeePercent] = useState(String(record.platformFeePercent ?? 15));
  const [saving, setSaving]   = useState(false);
  const [verifying, setVerifying] = useState(false);

  const gross = record.grossAmount || 0;
  const previewFee = Math.round(gross * (Number(feePercent) || 0) / 100);
  const previewNet = gross - previewFee;

  const bank = record.tutor?.bankDetails;
  const tutor = record.tutor;
  const student = record.student;

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { status, adminNote: note, disbursementRef: ref };
      const pct = Number(feePercent);
      if (!isNaN(pct) && pct !== record.platformFeePercent) {
        payload.platformFeePercent = pct;
      }
      const { data } = await api.patch(`/tutors/admin/payroll/${record._id}`, payload);
      toast.success('Payroll record updated');
      onUpdate(data.record);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleVerifyBank = async (verified) => {
    setVerifying(true);
    try {
      await api.patch(`/tutors/admin/bank-details/${tutor._id}/verify`, { verified });
      toast.success(`Bank details ${verified ? 'verified' : 'unverified'}`);
      onUpdate({ ...record, tutor: { ...tutor, bankDetails: { ...bank, isVerified: verified } } });
    } catch {
      toast.error('Failed to update bank verification');
    } finally {
      setVerifying(false);
    }
  };

  const Row = ({ label, value }) => value ? (
    <div className="flex items-start py-2 border-b border-gray-100 last:border-0">
      <span className="text-xs text-gray-400 w-36 shrink-0">{label}</span>
      <span className="text-xs font-semibold text-gray-800 flex-1 break-words">{value}</span>
    </div>
  ) : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-3" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="font-extrabold text-gray-900">{record.description || 'Session'}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{new Date(record.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition ml-3">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

          {/* Tutor */}
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <div className="bg-green-50 px-4 py-2.5 flex items-center gap-2 border-b border-gray-200">
              <Users size={13} className="text-green-600" />
              <p className="text-xs font-black uppercase tracking-widest text-gray-600">Tutor</p>
            </div>
            <div className="px-4 py-1">
              <Row label="Name"   value={tutor?.displayName || tutor?.user?.name} />
              <Row label="Email"  value={tutor?.user?.email} />
              <Row label="Currency" value={tutor?.currency} />
            </div>
          </div>

          {/* Bank Details */}
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <div className={`px-4 py-2.5 flex items-center justify-between border-b border-gray-200 ${bank?.isVerified ? 'bg-emerald-50' : bank?.accountNumber ? 'bg-yellow-50' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2">
                <Building2 size={13} className={bank?.isVerified ? 'text-emerald-600' : 'text-gray-500'} />
                <p className="text-xs font-black uppercase tracking-widest text-gray-600">Bank Account</p>
              </div>
              {bank?.accountNumber && (
                <button onClick={() => handleVerifyBank(!bank.isVerified)} disabled={verifying}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-full transition ${
                    bank?.isVerified
                      ? 'bg-red-100 text-red-600 hover:bg-red-200'
                      : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                  } disabled:opacity-60`}>
                  {verifying ? '…' : bank?.isVerified ? 'Unverify' : 'Verify Bank'}
                </button>
              )}
            </div>
            <div className="px-4 py-1">
              {bank?.accountNumber ? (
                <>
                  <Row label="Bank"           value={bank.bankName} />
                  <Row label="Account Name"   value={bank.accountName} />
                  <Row label="Account Number" value={bank.accountNumber} />
                  <Row label="Account Type"   value={bank.accountType} />
                  <Row label="Verified"       value={bank.isVerified ? '✅ Verified' : '⏳ Pending verification'} />
                </>
              ) : (
                <p className="py-3 text-xs text-gray-400 text-center">Tutor has not submitted bank details yet</p>
              )}
            </div>
          </div>

          {/* Student */}
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <div className="bg-blue-50 px-4 py-2.5 flex items-center gap-2 border-b border-gray-200">
              <Users size={13} className="text-blue-600" />
              <p className="text-xs font-black uppercase tracking-widest text-gray-600">Student</p>
            </div>
            <div className="px-4 py-1">
              <Row label="Name"  value={student?.name} />
              <Row label="Email" value={student?.email} />
            </div>
          </div>

          {/* Student Review */}
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <div className={`px-4 py-2.5 flex items-center gap-2 border-b border-gray-200 ${record.studentReview?.rating ? 'bg-yellow-50' : 'bg-gray-50'}`}>
              <Star size={13} className={record.studentReview?.rating ? 'text-yellow-500' : 'text-gray-400'} />
              <p className="text-xs font-black uppercase tracking-widest text-gray-600">Student Review</p>
            </div>
            <div className="px-4 py-3">
              {record.studentReview?.rating ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <StarRow rating={record.studentReview.rating} />
                    <span className="text-sm font-bold text-gray-900">{record.studentReview.rating}/5</span>
                  </div>
                  {record.studentReview.comment && (
                    <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 italic">"{record.studentReview.comment}"</p>
                  )}
                  <p className="text-xs text-gray-400">
                    Submitted {new Date(record.studentReview.submittedAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-gray-400 text-center py-2">Student has not submitted a review yet</p>
              )}
            </div>
          </div>

          {/* Payment Info */}
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <div className="bg-purple-50 px-4 py-2.5 flex items-center gap-2 border-b border-gray-200">
              <DollarSign size={13} className="text-purple-600" />
              <p className="text-xs font-black uppercase tracking-widest text-gray-600">Payment Breakdown</p>
            </div>
            <div className="px-4 py-3 space-y-2">
              <Row label="Gross Amount"   value={`${record.currency} ${record.grossAmount?.toLocaleString()}`} />

              {/* Fee override input */}
              <div className="flex items-center py-2 border-b border-gray-100 gap-3">
                <span className="text-xs text-gray-400 w-36 shrink-0">Platform Fee %</span>
                <div className="flex items-center gap-2 flex-1">
                  <div className="relative w-28">
                    <input
                      type="number" min="0" max="100" step="0.5"
                      value={feePercent}
                      onChange={e => setFeePercent(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400 pr-7"
                    />
                    <Percent size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                  <span className="text-xs text-gray-500">
                    = {record.currency} {previewFee.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-start py-2 border-b border-gray-100">
                <span className="text-xs text-gray-400 w-36 shrink-0">Tutor Receives</span>
                <span className="text-xs font-extrabold text-emerald-700 flex-1">
                  {record.currency} {previewNet.toLocaleString()}
                  {Number(feePercent) !== record.platformFeePercent && (
                    <span className="ml-2 text-[10px] font-semibold text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded-full">
                      updated (was {record.currency} {record.netAmount?.toLocaleString()})
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Admin Actions */}
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-4 py-2.5 flex items-center gap-2 border-b border-gray-200">
              <CheckCircle size={13} className="text-gray-500" />
              <p className="text-xs font-black uppercase tracking-widest text-gray-600">Admin Actions</p>
            </div>
            <div className="px-4 py-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-2">Update Status</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {['pending_review','review_submitted','approved','disbursed','on_hold'].map(s => (
                    <button key={s} onClick={() => setStatus(s)}
                      className={`text-xs font-bold py-2 rounded-lg transition border ${
                        status === s
                          ? `${STATUS_STYLES[s].badge} border-transparent`
                          : 'border-gray-200 text-gray-500 hover:border-green-300 hover:bg-green-50 hover:text-green-700'
                      }`}>
                      {STATUS_OPTIONS.find(o => o.value === s)?.label || s}
                    </button>
                  ))}
                </div>
              </div>

              {status === 'disbursed' && (
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">Disbursement Reference</label>
                  <input value={ref} onChange={e => setRef(e.target.value)}
                    placeholder="Bank transfer ref / payment ID"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">Admin Note (sent to tutor on approve/disburse)</label>
                <textarea rows={2} value={note} onChange={e => setNote(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
                  placeholder="Optional note for the tutor…" />
              </div>

              <button onClick={handleSave} disabled={saving}
                className="w-full bg-green-700 hover:bg-green-800 disabled:opacity-60 text-white font-bold py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-2">
                <Save size={13} /> {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ManagePayroll() {
  const [records, setRecords]     = useState([]);
  const [aggregates, setAggregates] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [tab, setTab]             = useState('all');
  const [search, setSearch]       = useState('');
  const [selected, setSelected]   = useState(null);
  const [page, setPage]           = useState(1);
  const [pages, setPages]         = useState(1);
  const [total, setTotal]         = useState(0);

  // Global fee setting
  const [globalFee, setGlobalFee]         = useState(15);
  const [feeInput, setFeeInput]           = useState('15');
  const [savingFee, setSavingFee]         = useState(false);
  const [showFeePanel, setShowFeePanel]   = useState(false);

  useEffect(() => {
    api.get('/settings/platform')
      .then(({ data }) => {
        setGlobalFee(data.platformFeePercent);
        setFeeInput(String(data.platformFeePercent));
      })
      .catch(() => {});
  }, []);

  const saveGlobalFee = async () => {
    const pct = Number(feeInput);
    if (isNaN(pct) || pct < 0 || pct > 100) { toast.error('Enter a value between 0 and 100'); return; }
    setSavingFee(true);
    try {
      const { data } = await api.patch('/settings/platform', { platformFeePercent: pct });
      setGlobalFee(data.platformFeePercent);
      setFeeInput(String(data.platformFeePercent));
      toast.success(`Platform fee updated to ${data.platformFeePercent}%`);
      setShowFeePanel(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update fee');
    } finally {
      setSavingFee(false);
    }
  };

  const fetchRecords = async (status = 'all', pg = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: pg, limit: 25 });
      if (status !== 'all') params.set('status', status);
      const { data } = await api.get(`/tutors/admin/payroll?${params}`);
      setRecords(data.records || []);
      setAggregates(data.aggregates || []);
      setPage(data.page || 1);
      setPages(data.pages || 1);
      setTotal(data.total || 0);
    } catch {
      toast.error('Failed to load payroll');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRecords(tab, 1); }, [tab]);

  const getAgg = (status) => aggregates.find(a => a._id === status);
  const allTotal = aggregates.reduce((s, a) => s + a.total, 0);
  const disbTotal = getAgg('disbursed')?.total || 0;
  const pendTotal = (getAgg('pending_review')?.total || 0) + (getAgg('review_submitted')?.total || 0);
  const approvedTotal = getAgg('approved')?.total || 0;

  const handleUpdate = (updated) => {
    setRecords(prev => prev.map(r => r._id === updated._id ? { ...r, ...updated } : r));
  };

  const filtered = search
    ? records.filter(r =>
        r.tutor?.displayName?.toLowerCase().includes(search.toLowerCase()) ||
        r.tutor?.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        r.student?.name?.toLowerCase().includes(search.toLowerCase())
      )
    : records;

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">
      <AdminNav />

      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">Tutor Payroll</h1>
              <p className="text-sm text-gray-500 mt-0.5">Review sessions, verify bank details, and disburse payments</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowFeePanel(v => !v)}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition">
                <Percent size={14} /> Platform Fee: {globalFee}%
              </button>
              <button onClick={() => fetchRecords(tab, page)}
                className="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-50 transition">
                <TrendingUp size={14} /> Refresh
              </button>
            </div>
          </div>

          {/* Global fee panel */}
          {showFeePanel && (
            <div className="bg-white rounded-2xl border border-purple-200 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <Settings size={16} className="text-purple-600" />
                <h2 className="font-bold text-gray-900 text-sm">Global Platform Fee</h2>
                <span className="text-xs text-gray-400 ml-1">— applies to all new payroll entries</span>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 font-medium">Deduction from tutor earnings:</span>
                  <div className="relative w-28">
                    <input
                      type="number" min="0" max="100" step="0.5"
                      value={feeInput}
                      onChange={e => setFeeInput(e.target.value)}
                      className="w-full border border-purple-300 rounded-xl px-3 py-2 text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400 pr-7"
                    />
                    <Percent size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
                <div className="text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2">
                  e.g. session worth ₦10,000 → tutor gets <strong>₦{(10000 - Math.round(10000 * (Number(feeInput) || 0) / 100)).toLocaleString()}</strong> after {feeInput}% deduction
                </div>
                <button onClick={saveGlobalFee} disabled={savingFee}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-bold px-4 py-2 rounded-xl text-sm transition">
                  <Save size={13} /> {savingFee ? 'Saving…' : 'Save Fee'}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-3">
                This only affects <strong>future</strong> payroll entries. To adjust an existing record's fee, open the record and edit the Platform Fee % there.
              </p>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Platform Earnings', value: `₦${allTotal.toLocaleString()}`, icon: Wallet, color: 'bg-gray-900 text-white', desc: 'Before fees' },
              { label: 'Pending Disbursement',    value: `₦${pendTotal.toLocaleString()}`,    icon: Clock, color: 'bg-yellow-500 text-white', desc: 'Awaiting review/approval' },
              { label: 'Approved (Ready)',         value: `₦${approvedTotal.toLocaleString()}`, icon: CheckCircle, color: 'bg-purple-600 text-white', desc: 'Approved, not yet sent' },
              { label: 'Total Disbursed',          value: `₦${disbTotal.toLocaleString()}`,     icon: DollarSign, color: 'bg-emerald-600 text-white', desc: 'Paid to tutors' },
            ].map(({ label, value, icon: Icon, color, desc }) => (
              <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                  <Icon size={18} />
                </div>
                <p className="text-xl font-extrabold text-gray-900">{value}</p>
                <p className="text-sm font-semibold text-gray-600 mt-0.5">{label}</p>
                <p className="text-xs text-gray-400">{desc}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex gap-1.5 flex-wrap">
              {STATUS_OPTIONS.map(({ value, label }) => (
                <button key={value} onClick={() => setTab(value)}
                  className={`text-sm font-semibold px-3.5 py-1.5 rounded-xl transition ${
                    tab === value ? 'bg-green-700 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-green-300'
                  }`}>
                  {label}
                  {value !== 'all' && getAgg(value)?.count ? (
                    <span className="ml-1.5 text-[10px] font-bold bg-white/20 px-1.5 py-0.5 rounded-full">
                      {getAgg(value).count}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
            <div className="relative ml-auto">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search tutor or student…"
                className="pl-8 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white w-56" />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-7 h-7 border-2 border-green-200 border-t-green-600 rounded-full animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16">
                <DollarSign size={36} className="text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 font-semibold">No payroll records found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Tutor</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Student</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Session</th>
                      <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Net Amount</th>
                      <th className="text-center px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Review</th>
                      <th className="text-center px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Bank</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.map(r => {
                      const bank = r.tutor?.bankDetails;
                      return (
                        <tr key={r._id} className="hover:bg-gray-50 transition">
                          <td className="px-4 py-3">
                            <p className="font-semibold text-gray-900">{r.tutor?.displayName || r.tutor?.user?.name || '—'}</p>
                            <p className="text-xs text-gray-400">{r.tutor?.user?.email}</p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-700">{r.student?.name || '—'}</p>
                            <p className="text-xs text-gray-400">{r.student?.email}</p>
                          </td>
                          <td className="px-4 py-3 max-w-[180px]">
                            <p className="text-gray-700 text-xs truncate">{r.description}</p>
                            <p className="text-xs text-gray-400">
                              {new Date(r.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <p className="font-extrabold text-gray-900">{r.currency} {r.netAmount?.toLocaleString()}</p>
                            <p className="text-[10px] text-gray-400">{r.platformFeePercent}% fee</p>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {r.studentReview?.rating ? (
                              <div className="flex flex-col items-center gap-0.5">
                                <div className="flex items-center gap-px">
                                  {[1,2,3,4,5].map(n => (
                                    <Star key={n} size={10} className={n <= r.studentReview.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />
                                  ))}
                                </div>
                                <span className="text-[10px] text-gray-400">{r.studentReview.rating}/5</span>
                              </div>
                            ) : (
                              <span className="text-[10px] text-gray-400">Awaiting</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {bank?.isVerified ? (
                              <span title="Bank verified"><BadgeCheck size={16} className="text-emerald-600 mx-auto" /></span>
                            ) : bank?.accountNumber ? (
                              <span title="Bank not yet verified"><ShieldAlert size={16} className="text-yellow-500 mx-auto" /></span>
                            ) : (
                              <span title="No bank details"><AlertCircle size={16} className="text-red-400 mx-auto" /></span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={r.status} />
                          </td>
                          <td className="px-4 py-3">
                            <button onClick={() => setSelected(r)}
                              className="text-xs font-bold text-green-700 hover:text-green-900 border border-green-200 hover:border-green-400 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition whitespace-nowrap">
                              Manage
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">{total} records</p>
                <div className="flex gap-2">
                  <button disabled={page === 1} onClick={() => { setPage(p => p - 1); fetchRecords(tab, page - 1); }}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition">
                    Previous
                  </button>
                  <span className="text-xs text-gray-500 self-center">Page {page} / {pages}</span>
                  <button disabled={page === pages} onClick={() => { setPage(p => p + 1); fetchRecords(tab, page + 1); }}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition">
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {selected && (
        <PayrollDetailModal
          record={selected}
          onClose={() => setSelected(null)}
          onUpdate={(updated) => { handleUpdate(updated); setSelected(updated); }}
        />
      )}
    </div>
  );
}
