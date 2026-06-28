import { useState, useEffect } from 'react';
import { AdminNav } from './Dashboard';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { Plus, Trash2, Calendar, Clock, Save, ChevronLeft, ChevronRight } from 'lucide-react';

// const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_KEYS   = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

const ALL_SLOTS = [
  '8:00 AM','9:00 AM','10:00 AM','11:00 AM','12:00 PM',
  '1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM','6:00 PM',
];

function dayDefault(enabled) {
  return { enabled, slots: enabled ? ['9:00 AM','10:00 AM','11:00 AM','12:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM'] : [] };
}

export default function ManageConsultationSlots() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // date-specific overrides state
  const [newOverrideDate, setNewOverrideDate] = useState('');
  const [newOverrideEnabled, setNewOverrideEnabled] = useState(true);

  // preview: see who's booked on a date
  const [previewDate, setPreviewDate] = useState('');
  const [previewSlots, setPreviewSlots] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // calendar for preview
  const [calMonth, setCalMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  useEffect(() => {
    api.get('/study-abroad/admin/availability')
      .then(({ data }) => {
        // Ensure all 7 days exist
        const c = { ...data };
        DAY_KEYS.forEach((key, i) => {
          if (!c[key]) c[key] = dayDefault(i >= 1 && i <= 5);
        });
        if (!c.dateOverrides) c.dateOverrides = [];
        setConfig(c);
      })
      .catch(() => toast.error('Failed to load availability config'))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const payload = {};
      DAY_KEYS.forEach((key) => { payload[key] = config[key]; });
      payload.dateOverrides = config.dateOverrides;
      await api.put('/study-abroad/admin/availability', payload);
      toast.success('Availability saved');
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (key) => {
    setConfig((c) => ({
      ...c,
      [key]: {
        ...c[key],
        enabled: !c[key].enabled,
        slots: !c[key].enabled && c[key].slots.length === 0
          ? ['9:00 AM','10:00 AM','11:00 AM','12:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM']
          : c[key].slots,
      },
    }));
  };

  const toggleSlot = (key, slot) => {
    setConfig((c) => {
      const current = c[key].slots;
      const next = current.includes(slot) ? current.filter((s) => s !== slot) : [...current, slot];
      next.sort((a, b) => ALL_SLOTS.indexOf(a) - ALL_SLOTS.indexOf(b));
      return { ...c, [key]: { ...c[key], slots: next } };
    });
  };

  const addOverride = () => {
    if (!newOverrideDate) return toast.error('Select a date for the override');
    if (config.dateOverrides.find((o) => o.date === newOverrideDate)) {
      return toast.error('Override for this date already exists');
    }
    const dayOfWeek = new Date(newOverrideDate + 'T12:00:00Z').getUTCDay();
    const baseSlots = config[DAY_KEYS[dayOfWeek]]?.slots || [];
    setConfig((c) => ({
      ...c,
      dateOverrides: [
        ...c.dateOverrides,
        { date: newOverrideDate, enabled: newOverrideEnabled, slots: newOverrideEnabled ? baseSlots : [] },
      ].sort((a, b) => a.date.localeCompare(b.date)),
    }));
    setNewOverrideDate('');
  };

  const removeOverride = (date) => {
    setConfig((c) => ({ ...c, dateOverrides: c.dateOverrides.filter((o) => o.date !== date) }));
  };

  const toggleOverrideSlot = (date, slot) => {
    setConfig((c) => ({
      ...c,
      dateOverrides: c.dateOverrides.map((o) => {
        if (o.date !== date) return o;
        const next = o.slots.includes(slot) ? o.slots.filter((s) => s !== slot) : [...o.slots, slot];
        next.sort((a, b) => ALL_SLOTS.indexOf(a) - ALL_SLOTS.indexOf(b));
        return { ...o, slots: next };
      }),
    }));
  };

  const toggleOverrideEnabled = (date) => {
    setConfig((c) => ({
      ...c,
      dateOverrides: c.dateOverrides.map((o) =>
        o.date !== date ? o : { ...o, enabled: !o.enabled }
      ),
    }));
  };

  const loadPreview = async (dateStr) => {
    setPreviewDate(dateStr);
    setPreviewSlots(null);
    setPreviewLoading(true);
    try {
      const { data } = await api.get(`/study-abroad/slots?date=${dateStr}`);
      setPreviewSlots(data);
    } catch {
      setPreviewSlots({ enabled: false, slots: [] });
    } finally {
      setPreviewLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#f5f6fa]">
        <AdminNav />
        <main className="flex-1 lg:ml-0 pt-14 lg:pt-0 flex items-center justify-center">
          <span className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
        </main>
      </div>
    );
  }

  const calYear = calMonth.getFullYear();
  const calMonthIdx = calMonth.getMonth();
  const daysInMonth = new Date(calYear, calMonthIdx + 1, 0).getDate();
  const firstDay = new Date(calYear, calMonthIdx, 1).getDay();
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const canGoPrev = calMonth > new Date(today.getFullYear(), today.getMonth(), 1);

  const fmtDate = (ds) => {
    if (!ds) return '';
    const [y, m, d] = ds.split('-');
    return new Date(y, m - 1, d).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="flex min-h-screen bg-[#f5f6fa]">
      <AdminNav />
      <main className="flex-1 lg:ml-0 pt-14 lg:pt-0 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                  <Calendar size={15} className="text-blue-700" />
                </div>
                Consultation Slots
              </h1>
              <p className="text-sm text-gray-500 mt-0.5 ml-10.5">Control which days and times users can book consultations</p>
            </div>
            <button onClick={save} disabled={saving}
              className="flex items-center gap-2 bg-green-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-green-800 transition disabled:opacity-60">
              {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={15} />}
              Save Changes
            </button>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">

            {/* ── Left column: Weekly schedule ── */}
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-extrabold text-gray-900 mb-4 flex items-center gap-2">
                <Clock size={16} className="text-green-700" /> Weekly Schedule
              </h2>
              <p className="text-xs text-gray-400 mb-5">
                Set which days of the week are open for consultations and what time slots are available.
              </p>

              <div className="space-y-4">
                {DAY_KEYS.map((key, i) => (
                  <div key={key} className={`rounded-xl border p-3 transition ${config[key].enabled ? 'border-green-200 bg-green-50/40' : 'border-gray-100 bg-gray-50'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-gray-800">{['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][i]}</span>
                      <button onClick={() => toggleDay(key)}
                        className={`relative w-11 h-6 rounded-full transition-colors ${config[key].enabled ? 'bg-green-600' : 'bg-gray-200'}`}>
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${config[key].enabled ? 'translate-x-5' : ''}`} />
                      </button>
                    </div>
                    {config[key].enabled && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {ALL_SLOTS.map((slot) => {
                          const active = config[key].slots.includes(slot);
                          return (
                            <button key={slot} onClick={() => toggleSlot(key, slot)}
                              className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition
                                ${active ? 'bg-green-600 text-white border-green-600' : 'border-gray-200 text-gray-500 hover:border-green-400 hover:text-green-700'}`}>
                              {slot}
                            </button>
                          );
                        })}
                      </div>
                    )}
                    {config[key].enabled && config[key].slots.length === 0 && (
                      <p className="text-xs text-red-500 mt-1">No slots selected — day will show as unavailable</p>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* ── Right column: Date overrides + Preview ── */}
            <div className="space-y-6">

              {/* Date overrides */}
              <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-extrabold text-gray-900 mb-1 flex items-center gap-2">
                  <Calendar size={16} className="text-green-700" /> Date Overrides
                </h2>
                <p className="text-xs text-gray-400 mb-4">
                  Block a specific date or give it custom slots (overrides the weekly schedule for that day).
                </p>

                {/* Add override */}
                <div className="flex gap-2 mb-4">
                  <input type="date" value={newOverrideDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setNewOverrideDate(e.target.value)}
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                  <select value={String(newOverrideEnabled)}
                    onChange={(e) => setNewOverrideEnabled(e.target.value === 'true')}
                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option value="true">Open (custom)</option>
                    <option value="false">Closed</option>
                  </select>
                  <button onClick={addOverride}
                    className="flex items-center gap-1 bg-green-700 text-white px-3 py-2 rounded-xl text-sm font-bold hover:bg-green-800 transition shrink-0">
                    <Plus size={14} /> Add
                  </button>
                </div>

                {/* Overrides list */}
                {config.dateOverrides.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">No date overrides set</p>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {config.dateOverrides.map((ov) => (
                      <div key={ov.date} className={`rounded-xl border p-3 ${ov.enabled ? 'border-blue-200 bg-blue-50/40' : 'border-red-200 bg-red-50/40'}`}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div>
                            <span className="font-bold text-sm text-gray-800">{fmtDate(ov.date)}</span>
                            <button onClick={() => toggleOverrideEnabled(ov.date)}
                              className={`ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${ov.enabled ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                              {ov.enabled ? 'OPEN' : 'CLOSED'}
                            </button>
                          </div>
                          <button onClick={() => removeOverride(ov.date)}
                            className="text-gray-400 hover:text-red-500 transition p-1">
                            <Trash2 size={14} />
                          </button>
                        </div>
                        {ov.enabled && (
                          <div className="flex flex-wrap gap-1">
                            {ALL_SLOTS.map((slot) => {
                              const active = ov.slots.includes(slot);
                              return (
                                <button key={slot} onClick={() => toggleOverrideSlot(ov.date, slot)}
                                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg border transition
                                    ${active ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-400 hover:border-blue-400 hover:text-blue-700'}`}>
                                  {slot}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Booking preview calendar */}
              <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-extrabold text-gray-900 mb-1 flex items-center gap-2">
                  <Calendar size={16} className="text-green-700" /> Preview Bookings
                </h2>
                <p className="text-xs text-gray-400 mb-4">
                  Click a date to see which slots are already booked by users.
                </p>

                {/* Month nav */}
                <div className="flex items-center justify-between mb-2">
                  <button onClick={() => setCalMonth(new Date(calYear, calMonthIdx - 1, 1))}
                    disabled={!canGoPrev}
                    className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition">
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-sm font-bold text-gray-800">
                    {calMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                  <button onClick={() => setCalMonth(new Date(calYear, calMonthIdx + 1, 1))}
                    className="p-1.5 rounded-lg hover:bg-gray-100 transition">
                    <ChevronRight size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-7 mb-1">
                  {['Su','Mo','Tu','We','Th','Fr','Sa'].map((d) => (
                    <div key={d} className="text-center text-[10px] font-bold text-gray-400 py-1">{d}</div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-0.5 mb-4">
                  {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const date = new Date(calYear, calMonthIdx, day);
                    const isPast = date < today;
                    const dateStr = `${calYear}-${String(calMonthIdx + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const isSelected = previewDate === dateStr;
                    const hasOverride = config.dateOverrides.find((o) => o.date === dateStr);
                    return (
                      <button key={day} type="button"
                        onClick={() => loadPreview(dateStr)}
                        className={`aspect-square rounded-lg text-xs font-medium transition flex items-center justify-center relative
                          ${isPast ? 'text-gray-300' :
                            isSelected ? 'bg-green-600 text-white font-bold shadow' :
                            hasOverride ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                            'hover:bg-green-50 text-gray-700'}`}>
                        {day}
                        {hasOverride && !isSelected && (
                          <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-blue-400" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Preview results */}
                {previewDate && (
                  <div>
                    <p className="text-xs font-bold text-gray-700 mb-2">{fmtDate(previewDate)}</p>
                    {previewLoading ? (
                      <div className="flex items-center gap-2 text-xs text-gray-400 py-2">
                        <span className="w-3 h-3 border-2 border-gray-300 border-t-green-500 rounded-full animate-spin" />
                        Loading…
                      </div>
                    ) : !previewSlots?.enabled || previewSlots?.slots?.length === 0 ? (
                      <p className="text-xs text-gray-400 bg-gray-50 rounded-xl py-3 text-center">
                        No slots available on this date
                      </p>
                    ) : (
                      <div className="grid grid-cols-4 gap-1.5">
                        {previewSlots.slots.map(({ time, booked }) => (
                          <div key={time}
                            className={`py-1.5 rounded-lg text-center text-[11px] font-semibold
                              ${booked ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                            <div>{time}</div>
                            <div className="text-[9px] font-normal">{booked ? 'Booked' : 'Free'}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </section>

            </div>
          </div>

          {/* Bottom save */}
          <div className="mt-6 flex justify-end">
            <button onClick={save} disabled={saving}
              className="flex items-center gap-2 bg-green-700 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-green-800 transition disabled:opacity-60">
              {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={15} />}
              Save Changes
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
