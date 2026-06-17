import { useState, useRef, useEffect, useCallback } from 'react';
import {
  CheckCircle, ChevronRight, ChevronLeft, School,
  DollarSign, Phone, Upload, Star, Clock, Users,
  Camera, X as XIcon, Zap, Gift, ShieldCheck, BarChart3,
  SlidersHorizontal, Play, Flag, AlertCircle
} from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const SIX_REASONS = [
  {
    icon: Users,
    color: 'bg-blue-50 text-blue-600',
    title: 'Reach 10,000+ Active Parents',
    desc: 'Every month, thousands of parents and students visit Education Naija & Overseas actively searching for the right school. Your listing puts you directly in front of them.',
  },
  {
    icon: ShieldCheck,
    color: 'bg-green-50 text-green-600',
    title: 'Verified & Trusted Badge',
    desc: 'Every school we publish is admin-reviewed and verified. That green checkmark tells parents your school is legitimate, credible, and worth their attention.',
  },
  {
    icon: BarChart3,
    color: 'bg-purple-50 text-purple-600',
    title: 'Rich, Beautiful School Profile',
    desc: 'Showcase your campus gallery, facilities, fees, curriculum, and achievements in a stunning dedicated profile page that parents can explore in depth.',
  },
  {
    icon: Zap,
    color: 'bg-yellow-50 text-yellow-600',
    title: 'Go Live in 24–48 Hours',
    desc: 'Fill out our simple 3-step form today. Our team reviews and approves most listings within one business day — so you start getting enquiries fast.',
  },
  {
    icon: SlidersHorizontal,
    color: 'bg-orange-50 text-orange-600',
    title: 'Featured in Smart School Finder',
    desc: 'Parents use our AI-powered school finder to filter by type, location, budget, and curriculum. Your school automatically appears when it matches their search.',
  },
  {
    icon: Gift,
    color: 'bg-red-50 text-red-600',
    title: '100% Free — No Hidden Fees',
    desc: 'Listing your school on Education Naija & Overseas is completely free. No monthly subscription, no listing fee, no hidden charges. Ever. Just create your profile and grow.',
  },
];

const TUTORIAL_VIDEO_ID = '';

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

  // Claim flow state
  const [claimMode, setClaimMode] = useState(false);
  const [claimedSchool, setClaimedSchool] = useState(null); // { _id, name, ... }
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeout = useRef(null);
  const nameInputRef = useRef(null);
  const dropdownRef = useRef(null);

  const inp = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white transition';

  const toggleArr = (key, val) =>
    setForm((f) => ({ ...f, [key]: f[key].includes(val) ? f[key].filter((x) => x !== val) : [...f[key], val] }));

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) &&
          nameInputRef.current && !nameInputRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const searchSchools = useCallback(async (q) => {
    if (!q || q.trim().length < 2) { setSearchResults([]); setShowDropdown(false); return; }
    setSearchLoading(true);
    try {
      const { data } = await api.get('/schools/search', { params: { q } });
      setSearchResults(data.schools || []);
      setShowDropdown((data.schools || []).length > 0);
    } catch {
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  const handleNameChange = (e) => {
    const val = e.target.value;
    setForm((f) => ({ ...f, name: val }));
    if (claimMode) return; // don't re-search if already in claim mode
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => searchSchools(val), 350);
  };

  const handleSelectExisting = async (school) => {
    setShowDropdown(false);
    setSearchResults([]);
    // Fetch full school data
    try {
      const { data } = await api.get(`/schools/${school._id}`);
      const s = data.school;
      setClaimedSchool(s);
      setClaimMode(true);
      setForm({
        name: s.name || '',
        type: s.type || 'private',
        level: s.level || 'secondary',
        country: s.country || 'Nigeria',
        state: s.state || '',
        city: s.city || '',
        address: s.address || '',
        description: s.description || '',
        fees: {
          tuition: s.fees?.tuition || '',
          boarding: s.fees?.boarding || '',
        },
        curriculum: s.curriculum || [],
        facilities: s.facilities || [],
        images: s.images || [],
        contact: {
          phone: s.contact?.phone || '',
          email: s.contact?.email || '',
          website: s.contact?.website || '',
        },
        ownerEmail: '',
        ownerName: '',
      });
    } catch {
      toast.error('Could not load school details. Please try again.');
    }
  };

  const cancelClaim = () => {
    setClaimMode(false);
    setClaimedSchool(null);
    setForm(INITIAL);
    setStep(0);
  };

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
      if (claimMode && claimedSchool) {
        const { ownerName, ownerEmail, ...updatedData } = form;
        await api.post(`/schools/${claimedSchool._id}/claim`, {
          claimantName: ownerName,
          claimantEmail: ownerEmail,
          claimantPhone: form.contact.phone,
          updatedData,
        });
      } else {
        await api.post('/schools', form);
      }
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
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${claimMode ? 'bg-blue-100' : 'bg-green-100'}`}>
            {claimMode
              ? <Flag className="text-blue-600" size={40} />
              : <CheckCircle className="text-green-600" size={40} />}
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
            {claimMode ? 'Claim Submitted!' : 'Submitted Successfully!'}
          </h2>
          <p className="text-gray-500 mb-2 leading-relaxed">
            {claimMode
              ? <>Your claim for <strong className="text-gray-800">{claimedSchool?.name}</strong> has been sent to our team.</>
              : <><strong className="text-gray-800">{form.name}</strong> has been submitted for review.</>}
          </p>
          <p className="text-gray-500 text-sm mb-8">
            Our team will review {claimMode ? 'your claim' : 'your listing'} and respond within{' '}
            <strong>24–48 hours</strong>. We'll notify you at{' '}
            <strong>{form.ownerEmail}</strong>.
          </p>
          <div className={`border rounded-2xl p-4 mb-8 text-left space-y-2 ${claimMode ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'}`}>
            <p className={`text-sm font-semibold ${claimMode ? 'text-blue-800' : 'text-green-800'}`}>What happens next?</p>
            {(claimMode
              ? ['Our team reviews your claim and proposed changes', 'We may contact you to verify your authority over this school', 'If approved, your school profile will be updated', 'You\'ll be notified by email once the review is complete']
              : ['Our team reviews your school details', 'We may contact you to verify information', 'Your listing goes live on the platform', 'You start receiving enquiries from parents']
            ).map((t, i) => (
              <div key={i} className={`flex items-center gap-2 text-sm ${claimMode ? 'text-blue-700' : 'text-green-700'}`}>
                <span className={`w-5 h-5 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${claimMode ? 'bg-blue-700' : 'bg-green-700'}`}>{i + 1}</span>
                {t}
              </div>
            ))}
          </div>
          <button
            onClick={() => { setSubmitted(false); setForm(INITIAL); setStep(0); setClaimMode(false); setClaimedSchool(null); }}
            className={`w-full text-white py-3.5 rounded-xl font-semibold transition ${claimMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-700 hover:bg-green-800'}`}>
            {claimMode ? 'Submit Another Claim' : 'List Another School'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── HERO HEADER ─────────────────────────────────────── */}
      <div className="relative bg-linear-to-br from-green-800 via-green-700 to-green-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="relative max-w-5xl mx-auto px-4 py-12 md:py-16 text-center">
          <span className="inline-block bg-white/15 border border-white/25 text-white text-xs font-bold px-3 py-1.5 rounded-full mb-5 tracking-wider uppercase">
            Free to list · Live in 24–48 hrs
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4 leading-tight">
            Add Your School/Claim your school in<br className="hidden sm:block" /> <span className="text-orange-200">3 Minutes</span>
          </h1>
          <p className="text-green-100 text-base md:text-lg max-w-xl mx-auto mb-8 leading-relaxed">
            Join 500+ schools reaching 10,000+ parents monthly on Nigeria's smartest school discovery platform.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {BENEFITS.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3.5 py-2 rounded-full">
                <Icon size={13} className="text-green-300 shrink-0" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 6 REASONS ───────────────────────────────────────── */}
      <section className="py-14 px-4 bg-gray-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-green-600 font-semibold text-sm uppercase tracking-wider mb-2">Why list with us?</p>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight mb-3">
              6 Reasons to Add Your School on Education Naija &amp; Overseas
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-sm leading-relaxed">
              Join hundreds of schools already growing their admissions through Nigeria's most trusted school discovery platform.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {SIX_REASONS.map(({ icon: Icon, color, title, desc }, i) => (
              <div key={title}
                className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md hover:border-gray-200 transition-all group">
                <div className="flex items-start gap-4">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color} group-hover:scale-110 transition-transform`}>
                    <Icon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[11px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">0{i + 1}</span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-sm mb-2 leading-snug">{title}</h3>
                    <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW TO ADD YOUR SCHOOL (VIDEO) ──────────────────── */}
      <section className="py-14 px-4 bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-green-600 font-semibold text-sm uppercase tracking-wider mb-2">Step-by-step guide</p>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight mb-3">
              How to Add Your School in 5 Minutes
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto text-sm">
              Watch our quick tutorial and see exactly how easy it is to get your school listed and reaching parents today.
            </p>
          </div>

          <div className="relative max-w-3xl mx-auto rounded-2xl overflow-hidden shadow-2xl bg-gray-900"
            style={{ aspectRatio: '16/9' }}>
            {TUTORIAL_VIDEO_ID ? (
              <iframe
                src={`https://www.youtube.com/embed/${TUTORIAL_VIDEO_ID}?rel=0&modestbranding=1`}
                title="How to add your school on Education Education Naija & Overseas"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-linear-to-br from-green-900 via-green-800 to-gray-900">
                <div className="absolute inset-0 opacity-10"
                  style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
                <div className="relative flex flex-col items-center gap-4 text-center px-6">
                  <div className="w-20 h-20 bg-white/15 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30 shadow-2xl">
                    <Play size={32} className="text-white ml-1.5" fill="white" />
                  </div>
                  <div>
                    <p className="text-white font-extrabold text-lg mb-1">Tutorial Video</p>
                    <p className="text-white/60 text-sm">
                      Coming soon — a step-by-step walkthrough<br className="hidden sm:block" /> of how to list your school in under 5 minutes.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-white/70 text-xs font-medium">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    Video will be added here shortly
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            {[
              { step: '1', title: 'Fill School Info', desc: 'Enter your school name, location, type, and description.' },
              { step: '2', title: 'Add Fees & Facilities', desc: 'Share your tuition, boarding fees, curriculum and facilities.' },
              { step: '3', title: 'Submit & Go Live', desc: 'Add contact details and submit. We review and publish within 24–48 hrs.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex gap-3 items-start p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="w-8 h-8 bg-green-700 text-white rounded-full flex items-center justify-center font-extrabold text-sm shrink-0">
                  {step}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{title}</p>
                  <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 py-10">

        {/* ── CLAIM MODE BANNER ───────────────────────────────── */}
        {claimMode && claimedSchool && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
            <Flag size={18} className="text-blue-600 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-blue-900">Claiming: {claimedSchool.name}</p>
              <p className="text-xs text-blue-700 mt-0.5">
                This school is already in our directory. Review the pre-filled information, make any corrections, then submit your claim for admin approval.
              </p>
            </div>
            <button
              onClick={cancelClaim}
              className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-blue-400 hover:bg-blue-100 hover:text-blue-700 transition"
              title="Cancel claim">
              <XIcon size={15} />
            </button>
          </div>
        )}

        {/* ── STEPPER ─────────────────────────────────────────── */}
        <div className="flex items-center mb-10">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center flex-1 last:flex-none">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                  i < step
                    ? claimMode ? 'bg-blue-600 text-white' : 'bg-green-700 text-white'
                    : i === step
                      ? claimMode ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 'bg-green-700 text-white ring-4 ring-green-100'
                      : 'bg-gray-200 text-gray-500'
                }`}>
                  {i < step ? <CheckCircle size={16} /> : i + 1}
                </div>
                <div className="hidden sm:block">
                  <p className={`text-xs font-medium ${i <= step ? claimMode ? 'text-blue-600' : 'text-green-700' : 'text-gray-400'}`}>Step {i + 1}</p>
                  <p className={`text-sm font-bold ${i <= step ? 'text-gray-900' : 'text-gray-400'}`}>{label}</p>
                </div>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 transition-all ${i < step ? claimMode ? 'bg-blue-600' : 'bg-green-700' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* ── FORM CARD ───────────────────────────────────────── */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 sm:p-8">

          {/* STEP 1: School Info */}
          {step === 0 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${claimMode ? 'bg-blue-100' : 'bg-green-100'}`}>
                  {claimMode ? <Flag size={20} className="text-blue-600" /> : <School size={20} className="text-green-700" />}
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 text-lg">
                    {claimMode ? 'Claim Your School' : 'School Information'}
                  </h2>
                  <p className="text-gray-400 text-sm">
                    {claimMode ? 'Review and update the school details below' : 'Tell us about your institution'}
                  </p>
                </div>
              </div>

              {/* School name with autocomplete */}
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  School Name <span className="text-red-500">*</span>
                  {!claimMode && (
                    <span className="ml-2 text-xs font-normal text-gray-400">— type to search existing schools</span>
                  )}
                </label>
                <div className="relative" ref={nameInputRef}>
                  <input
                    value={form.name}
                    onChange={handleNameChange}
                    onFocus={() => { if (searchResults.length > 0 && !claimMode) setShowDropdown(true); }}
                    className={inp + (claimMode ? ' border-blue-200 focus:ring-blue-400' : '')}
                    placeholder={claimMode ? form.name : 'e.g. Kings College Lagos'}
                    readOnly={claimMode}
                    style={claimMode ? { backgroundColor: '#f8faff', cursor: 'default' } : {}}
                  />
                  {searchLoading && !claimMode && (
                    <span className="absolute right-3 top-3.5 w-4 h-4 border-2 border-gray-200 border-t-green-500 rounded-full animate-spin" />
                  )}
                </div>

                {/* Autocomplete dropdown */}
                {showDropdown && !claimMode && searchResults.length > 0 && (
                  <div
                    ref={dropdownRef}
                    className="absolute z-50 top-full left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-gray-100 flex items-center gap-2">
                      <AlertCircle size={13} className="text-amber-500 shrink-0" />
                      <p className="text-xs text-gray-500">
                        <span className="font-semibold text-gray-700">School already listed?</span> Click it to claim and manage your profile.
                      </p>
                    </div>
                    <ul className="max-h-64 overflow-y-auto divide-y divide-gray-50">
                      {searchResults.map((s) => (
                        <li key={s._id}>
                          <button
                            type="button"
                            onClick={() => handleSelectExisting(s)}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 text-left transition">
                            {s.images?.[0] ? (
                              <img src={s.images[0]} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0 bg-gray-100" />
                            ) : (
                              <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                                <School size={16} className="text-gray-400" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">{s.name}</p>
                              <p className="text-xs text-gray-400 truncate">
                                {[s.city, s.state].filter(Boolean).join(', ')}
                                {s.type ? ` · ${s.type}` : ''}
                              </p>
                            </div>
                            <span className="shrink-0 text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                              Claim
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                    <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50">
                      <p className="text-xs text-gray-400">
                        Not your school? Keep typing to add a new one.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">School Photos (optional)</label>
                <p className="text-xs text-gray-400 mb-3">Upload photos of your school campus, classrooms, or facilities.</p>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <p className="text-sm font-bold text-gray-700 mb-1">
                  {claimMode ? 'Your Details (for claim verification)' : 'Your Details (for listing notifications)'}
                </p>
                {claimMode && (
                  <p className="text-xs text-blue-600 mb-4 flex items-center gap-1.5">
                    <AlertCircle size={12} /> We'll contact you to verify your authority to manage this school.
                  </p>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <p className="text-sm font-bold text-gray-700 mb-2">
                  {claimMode ? 'Claim Summary' : 'Listing Summary'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <div><span className="text-gray-400">School:</span> <span className="font-medium text-gray-800">{form.name || '—'}</span></div>
                  <div><span className="text-gray-400">Type:</span> <span className="font-medium text-gray-800 capitalize">{form.type}</span></div>
                  <div><span className="text-gray-400">Level:</span> <span className="font-medium text-gray-800 capitalize">{form.level}</span></div>
                  <div><span className="text-gray-400">State:</span> <span className="font-medium text-gray-800">{form.state || '—'}</span></div>
                  <div><span className="text-gray-400">Tuition:</span> <span className="font-medium text-gray-800">{form.fees.tuition ? `₦${Number(form.fees.tuition).toLocaleString()}` : '—'}</span></div>
                  <div><span className="text-gray-400">Curriculum:</span> <span className="font-medium text-gray-800">{form.curriculum.join(', ') || '—'}</span></div>
                  <div><span className="text-gray-400">Photos:</span> <span className="font-medium text-gray-800">{form.images.length} uploaded</span></div>
                </div>
              </div>

              <div className={`border rounded-2xl p-4 flex items-start gap-3 ${claimMode ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'}`}>
                {claimMode
                  ? <Flag size={18} className="text-blue-600 shrink-0 mt-0.5" />
                  : <CheckCircle size={18} className="text-green-600 shrink-0 mt-0.5" />}
                <div>
                  <p className={`text-sm font-semibold ${claimMode ? 'text-blue-800' : 'text-green-800'}`}>
                    {claimMode ? 'School Claim — Admin Verification Required' : 'Free Listing — Admin Approval Required'}
                  </p>
                  <p className={`text-xs mt-0.5 ${claimMode ? 'text-blue-700' : 'text-green-700'}`}>
                    {claimMode
                      ? 'Our team will verify your claim and apply your changes within 24–48 hours.'
                      : 'Your school will be reviewed by our team and published within 24–48 hours. No payment needed.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between gap-3 mt-8 pt-6 border-t border-gray-100">
            <button onClick={() => setStep(step - 1)} disabled={step === 0}
              className="flex items-center gap-2 text-sm border border-gray-200 px-5 py-3 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition font-medium text-gray-700 shrink-0">
              <ChevronLeft size={16} /> Back
            </button>

            {step < STEPS.length - 1 ? (
              <button
                onClick={() => {
                  if (step === 0 && (!form.name.trim() || !form.state)) { toast.error('School name and state are required'); return; }
                  setStep(step + 1);
                }}
                className={`flex items-center gap-2 text-white text-sm px-6 py-3 rounded-xl transition font-semibold ${claimMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-700 hover:bg-green-800'}`}>
                Continue <ChevronRight size={16} />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading}
                className={`flex items-center gap-2 text-white font-semibold text-sm px-6 py-3 rounded-xl transition disabled:opacity-60 ${claimMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-700 hover:bg-green-800'}`}>
                {loading ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</>
                ) : claimMode ? (
                  <><Flag size={16} /> Submit Claim</>
                ) : (
                  <><Upload size={16} /> Submit for Approval</>
                )}
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          By submitting, you agree that all information is accurate and you are authorised to {claimMode ? 'manage' : 'list'} this school.
        </p>
      </div>
    </div>
  );
}
