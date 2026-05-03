import { useState, useRef } from 'react';
import {
  CheckCircle, ChevronRight, ChevronLeft, School,
  MapPin, DollarSign, Phone, Upload, Star, Clock, Users,
  Camera, X as XIcon
} from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const STEPS = ['School Info', 'Fees & Facilities', 'Contact & Review'];

const NIGERIAN_STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT','Gombe','Imo',
  'Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos',
  'Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers',
  'Sokoto','Taraba','Yobe','Zamfara',
];

const FACILITIES_OPTIONS = [
  { label: 'Library', icon: '📚' },
  { label: 'Science Lab', icon: '🔬' },
  { label: 'Computer Lab', icon: '💻' },
  { label: 'Sports Field', icon: '⚽' },
  { label: 'Swimming Pool', icon: '🏊' },
  { label: 'Hostel', icon: '🏠' },
  { label: 'Cafeteria', icon: '🍽️' },
  { label: 'Chapel/Mosque', icon: '🕌' },
  { label: 'Art Studio', icon: '🎨' },
  { label: 'Music Room', icon: '🎵' },
];

const CURRICULUM_OPTIONS = ['WAEC', 'NECO', 'IGCSE', 'IB', 'Cambridge', 'BECE', 'WASSCE'];

const INITIAL = {
  name: '', type: 'private', level: 'secondary', country: 'Nigeria',
  state: '', city: '', address: '', description: '',
  fees: { tuition: '', boarding: '' },
  curriculum: [], facilities: [],
  images: [],
  contact: { phone: '', email: '', website: '' },
  ownerEmail: '', ownerName: '',
};

const BENEFITS = [
  { icon: Users, text: 'Reach 10,000+ parents and students monthly' },
  { icon: Star, text: 'Featured placement for top-rated schools' },
  { icon: Clock, text: 'Reviewed and live within 24–48 hours' },
  { icon: CheckCircle, text: 'Free listing — no payment required' },
];

export default function ListYourSchool() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(INITIAL);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageInputRef = useRef(null);

  const inp = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white transition';

  const toggleArr = (key, val) =>
    setForm((f) => ({ ...f, [key]: f[key].includes(val) ? f[key].filter((x) => x !== val) : [...f[key], val] }));

  const handleImageUpload = async (file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error('File too large — max 10 MB'); return; }
    setUploadingImage(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const { data } = await api.post('/schools/upload-image', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm((f) => ({ ...f, images: [...f.images, data.imageUrl] }));
      toast.success('Photo uploaded!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.contact.phone && !form.contact.email) {
      toast.error('Please provide at least one contact method');
      return;
    }
    if (!form.ownerEmail) {
      toast.error('Please provide your email for notifications');
      return;
    }
    setLoading(true);
    try {
      await api.post('/schools', form);
      setSubmitted(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-lg p-10 max-w-lg w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-green-600" size={40} />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Submitted Successfully!</h2>
          <p className="text-gray-500 mb-2 leading-relaxed">
            <strong className="text-gray-800">{form.name}</strong> has been submitted for review.
          </p>
          <p className="text-gray-500 text-sm mb-8">
            Our team will review your listing and publish it within <strong>24–48 hours</strong>.
            We'll notify you at <strong>{form.contact.email || form.ownerEmail}</strong>.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-8 text-left space-y-2">
            <p className="text-sm font-semibold text-green-800">What happens next?</p>
            {['Our team reviews your school details', 'We may contact you to verify information', 'Your listing goes live on the platform', 'You start receiving enquiries from parents'].map((t, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-green-700">
                <span className="w-5 h-5 bg-green-700 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                {t}
              </div>
            ))}
          </div>
          <button
            onClick={() => { setSubmitted(false); setForm(INITIAL); setStep(0); }}
            className="w-full bg-green-700 text-white py-3.5 rounded-xl font-semibold hover:bg-green-800 transition">
            List Another School
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── PAGE HEADER ─────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 mb-1">List Your School</h1>
              <p className="text-gray-500">Join 500+ schools already on the platform. Free to list — admin approved before going live.</p>
            </div>
            <div className="flex flex-wrap gap-4">
              {BENEFITS.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-sm text-gray-600">
                  <Icon size={15} className="text-green-600 shrink-0" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">

        {/* ── STEPPER ─────────────────────────────────────────── */}
        <div className="flex items-center mb-10">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center flex-1 last:flex-none">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                  i < step ? 'bg-green-700 text-white' :
                  i === step ? 'bg-green-700 text-white ring-4 ring-green-100' :
                  'bg-gray-200 text-gray-500'
                }`}>
                  {i < step ? <CheckCircle size={16} /> : i + 1}
                </div>
                <div className="hidden sm:block">
                  <p className={`text-xs font-medium ${i <= step ? 'text-green-700' : 'text-gray-400'}`}>Step {i + 1}</p>
                  <p className={`text-sm font-bold ${i <= step ? 'text-gray-900' : 'text-gray-400'}`}>{label}</p>
                </div>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 transition-all ${i < step ? 'bg-green-700' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* ── FORM CARD ───────────────────────────────────────── */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">

          {/* STEP 1: School Info */}
          {step === 0 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <School size={20} className="text-green-700" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 text-lg">School Information</h2>
                  <p className="text-gray-400 text-sm">Tell us about your institution</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">School Name <span className="text-red-500">*</span></label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={inp} placeholder="e.g. Kings College Lagos" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">School Type <span className="text-red-500">*</span></label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={inp}>
                    <option value="private">Private</option>
                    <option value="public">Public</option>
                    <option value="federal">Federal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">School Level <span className="text-red-500">*</span></label>
                  <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} className={inp}>
                    <option value="secondary">Secondary</option>
                    <option value="primary">Primary</option>
                    <option value="both">Both (Primary + Secondary)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">State <span className="text-red-500">*</span></label>
                  <select value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className={inp}>
                    <option value="">Select state</option>
                    {NIGERIAN_STATES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">City / Area</label>
                  <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className={inp} placeholder="e.g. Lagos Island" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Address</label>
                <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className={inp} placeholder="Street address of the school" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">School Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className={inp + ' resize-none'} rows={4}
                  placeholder="Tell parents and students what makes your school special — history, achievements, culture, achievements..." />
                <p className="text-xs text-gray-400 mt-1">{form.description.length}/500 characters</p>
              </div>
            </div>
          )}

          {/* STEP 2: Fees & Facilities */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <DollarSign size={20} className="text-blue-700" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 text-lg">Fees &amp; Facilities</h2>
                  <p className="text-gray-400 text-sm">Help parents plan ahead with transparent fees</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
                  <label className="block text-sm font-semibold text-green-800 mb-1.5">Annual Tuition Fee (₦)</label>
                  <input type="number" value={form.fees.tuition}
                    onChange={(e) => setForm({ ...form, fees: { ...form.fees, tuition: e.target.value } })}
                    className="w-full bg-white border border-green-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g. 500000" />
                  <p className="text-xs text-green-600 mt-1">Per academic year</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                  <label className="block text-sm font-semibold text-blue-800 mb-1.5">Boarding Fee (₦)</label>
                  <input type="number" value={form.fees.boarding}
                    onChange={(e) => setForm({ ...form, fees: { ...form.fees, boarding: e.target.value } })}
                    className="w-full bg-white border border-blue-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0 if day school only" />
                  <p className="text-xs text-blue-600 mt-1">Leave blank for day school</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Curriculum Offered</label>
                <div className="flex flex-wrap gap-2">
                  {CURRICULUM_OPTIONS.map((c) => (
                    <button key={c} type="button" onClick={() => toggleArr('curriculum', c)}
                      className={`px-4 py-2 rounded-full border text-sm font-medium transition ${
                        form.curriculum.includes(c)
                          ? 'bg-green-700 text-white border-green-700'
                          : 'border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-700'
                      }`}>
                      {form.curriculum.includes(c) && '✓ '}{c}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Facilities &amp; Amenities</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {FACILITIES_OPTIONS.map(({ label, icon }) => (
                    <button key={label} type="button" onClick={() => toggleArr('facilities', label)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm transition ${
                        form.facilities.includes(label)
                          ? 'bg-green-50 border-green-500 text-green-800 font-medium'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'
                      }`}>
                      <span>{icon}</span>
                      <span className="truncate">{label}</span>
                      {form.facilities.includes(label) && <CheckCircle size={13} className="text-green-600 ml-auto shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* School Photos */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">School Photos (optional)</label>
                <p className="text-xs text-gray-400 mb-3">Upload photos of your school campus, classrooms, or facilities. These will appear on your listing card.</p>
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="inline-flex items-center gap-2 border border-dashed border-green-400 text-green-700 bg-green-50 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-100 transition disabled:opacity-60">
                  {uploadingImage ? (
                    <><span className="w-4 h-4 border-2 border-green-400/40 border-t-green-600 rounded-full animate-spin" /> Uploading…</>
                  ) : (
                    <><Camera size={15} /> Upload Photo</>
                  )}
                </button>
                <input
                  ref={imageInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); e.target.value = ''; }}
                />
                {form.images.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-4">
                    {form.images.map((url, i) => (
                      <div key={i} className="relative group aspect-video rounded-xl overflow-hidden bg-gray-100">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, images: f.images.filter((_, j) => j !== i) }))}
                          className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                          <XIcon size={11} className="text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Contact & Review */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Phone size={20} className="text-purple-700" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 text-lg">Contact &amp; Review</h2>
                  <p className="text-gray-400 text-sm">How can parents reach your school?</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">School Phone <span className="text-red-500">*</span></label>
                  <input value={form.contact.phone}
                    onChange={(e) => setForm({ ...form, contact: { ...form.contact, phone: e.target.value } })}
                    className={inp} placeholder="+234 800 000 0000" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">School Email</label>
                  <input type="email" value={form.contact.email}
                    onChange={(e) => setForm({ ...form, contact: { ...form.contact, email: e.target.value } })}
                    className={inp} placeholder="info@yourschool.edu.ng" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">School Website</label>
                <input value={form.contact.website}
                  onChange={(e) => setForm({ ...form, contact: { ...form.contact, website: e.target.value } })}
                  className={inp} placeholder="https://yourschool.edu.ng" />
              </div>

              <div className="border-t border-gray-100 pt-5">
                <p className="text-sm font-bold text-gray-700 mb-4">Your Details (for listing notifications)</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Your Name</label>
                    <input value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} className={inp} placeholder="Full name" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Your Email <span className="text-red-500">*</span></label>
                    <input type="email" required value={form.ownerEmail}
                      onChange={(e) => setForm({ ...form, ownerEmail: e.target.value })}
                      className={inp} placeholder="you@example.com" />
                  </div>
                </div>
              </div>

              {/* Review Summary */}
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 space-y-3">
                <p className="text-sm font-bold text-gray-700 mb-2">Listing Summary</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-gray-400">School:</span> <span className="font-medium text-gray-800">{form.name || '—'}</span></div>
                  <div><span className="text-gray-400">Type:</span> <span className="font-medium text-gray-800 capitalize">{form.type}</span></div>
                  <div><span className="text-gray-400">Level:</span> <span className="font-medium text-gray-800 capitalize">{form.level}</span></div>
                  <div><span className="text-gray-400">State:</span> <span className="font-medium text-gray-800">{form.state || '—'}</span></div>
                  <div><span className="text-gray-400">Tuition:</span> <span className="font-medium text-gray-800">{form.fees.tuition ? `₦${Number(form.fees.tuition).toLocaleString()}` : '—'}</span></div>
                  <div><span className="text-gray-400">Curriculum:</span> <span className="font-medium text-gray-800">{form.curriculum.join(', ') || '—'}</span></div>
                  <div><span className="text-gray-400">Photos:</span> <span className="font-medium text-gray-800">{form.images.length} uploaded</span></div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-start gap-3">
                <CheckCircle size={18} className="text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-green-800">Free Listing — Admin Approval Required</p>
                  <p className="text-xs text-green-700 mt-0.5">Your school will be reviewed by our team and published within 24–48 hours. No payment needed.</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
            <button onClick={() => setStep(step - 1)} disabled={step === 0}
              className="flex items-center gap-2 text-sm border border-gray-200 px-6 py-3 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition font-medium text-gray-700">
              <ChevronLeft size={16} /> Back
            </button>

            {step < STEPS.length - 1 ? (
              <button
                onClick={() => {
                  if (step === 0 && (!form.name.trim() || !form.state)) { toast.error('School name and state are required'); return; }
                  setStep(step + 1);
                }}
                className="flex items-center gap-2 bg-green-700 text-white text-sm px-8 py-3 rounded-xl hover:bg-green-800 transition font-semibold">
                Continue <ChevronRight size={16} />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading}
                className="flex items-center gap-2 bg-green-700 text-white font-semibold text-sm px-8 py-3 rounded-xl hover:bg-green-800 transition disabled:opacity-60">
                {loading ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</>
                ) : (
                  <><Upload size={16} /> Submit for Approval</>
                )}
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          By submitting, you agree that all information is accurate and you are authorised to list this school.
        </p>
      </div>
    </div>
  );
}
