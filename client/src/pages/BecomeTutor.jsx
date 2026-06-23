import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap, CheckCircle, ChevronRight, ChevronLeft,
  Plus, Trash2, ArrowRight, Banknote, Globe, Shield,
  Camera, FileText, Video, Upload, X, FileBadge,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const WORLD_COUNTRIES = [
  'Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Uganda', 'Tanzania', 'Rwanda',
  'Cameroon', 'Senegal', 'Ethiopia', 'Zimbabwe', 'Zambia', 'Ivory Coast',
  'United Kingdom', 'United States', 'Canada', 'Australia', 'Germany',
  'France', 'Netherlands', 'Ireland', 'New Zealand', 'UAE', 'Qatar',
  'Saudi Arabia', 'India', 'Pakistan', 'Malaysia', 'Singapore', 'Other',
];

const CURRENCIES = [
  { value: 'NGN', label: 'Nigerian Naira (₦)', symbol: '₦' },
  { value: 'USD', label: 'US Dollar ($)', symbol: '$' },
  { value: 'GBP', label: 'British Pound (£)', symbol: '£' },
  { value: 'EUR', label: 'Euro (€)', symbol: '€' },
  { value: 'GHS', label: 'Ghanaian Cedi (GH₵)', symbol: 'GH₵' },
  { value: 'KES', label: 'Kenyan Shilling (KSh)', symbol: 'KSh' },
  { value: 'ZAR', label: 'South African Rand (R)', symbol: 'R' },
  { value: 'CAD', label: 'Canadian Dollar (CA$)', symbol: 'CA$' },
  { value: 'AUD', label: 'Australian Dollar (A$)', symbol: 'A$' },
  { value: 'INR', label: 'Indian Rupee (₹)', symbol: '₹' },
];

const ALL_SUBJECTS = [
  'Mathematics', 'Further Mathematics', 'English Language', 'Literature in English',
  'Physics', 'Chemistry', 'Biology', 'Agricultural Science',
  'Economics', 'Government', 'Geography', 'History', 'Commerce',
  'Financial Accounting', 'Civic Education', 'Technical Drawing',
  'Basic Science', 'Basic Technology', 'Social Studies',
  'Verbal Reasoning', 'Quantitative Reasoning', 'Phonics & Reading',
  'JAMB Prep', 'WAEC Prep', 'NECO Prep', 'BECE Prep', 'IELTS', 'TOEFL',
  'SAT', 'ACT', 'GCSE Mathematics', 'GCSE English', 'A-Level Mathematics',
  'A-Level Physics', 'A-Level Chemistry', 'A-Level Biology', 'A-Level Economics',
  'Computer Science', 'Web Development', 'Python', 'Data Science', 'Microsoft Office',
  'Yoruba', 'Igbo', 'Hausa', 'French', 'Spanish', 'Arabic', 'Mandarin',
  'Music', 'Fine Arts', 'Christian Religious Studies', 'Islamic Studies',
];

const ALL_LEVELS = [
  { value: 'primary',    label: 'Primary School' },
  { value: 'jss',        label: 'Junior Secondary (JSS 1–3)' },
  { value: 'sss',        label: 'Senior Secondary (SSS 1–3)' },
  { value: 'waec',       label: 'WAEC Preparation' },
  { value: 'jamb',       label: 'JAMB / UTME Preparation' },
  { value: 'neco',       label: 'NECO Preparation' },
  { value: 'gcse',       label: 'GCSE / IGCSE' },
  { value: 'a-level',    label: 'A-Level' },
  { value: 'sat',        label: 'SAT / ACT' },
  { value: 'ib',         label: 'IB Programme' },
  { value: 'university', label: 'University Level' },
  { value: 'adult',      label: 'Adult Learning' },
];

const AVAILABILITY_OPTIONS = [
  'Weekday Mornings', 'Weekday Afternoons', 'Weekday Evenings',
  'Weekend Mornings', 'Weekend Afternoons', 'Weekend Evenings', 'Flexible',
];

const TEACHING_STYLE_OPTIONS = [
  { value: 'patient',      label: 'Patient & Supportive', desc: "I go at the student's pace and explain gently" },
  { value: 'structured',   label: 'Structured Lessons',   desc: 'Clear plans, notes, and defined learning path' },
  { value: 'interactive',  label: 'Interactive & Fun',    desc: 'Engaging examples, keeps students motivated' },
  { value: 'exam-focused', label: 'Exam-Focused',         desc: 'Past questions, time management, exam technique' },
];

const SPECIALIZATION_OPTIONS = [
  'WAEC Revision', 'JAMB Preparation', 'NECO Preparation', 'BECE Preparation',
  'Post-UTME Coaching', 'Common Entrance Prep', 'Scholarship Exam Prep',
  'IELTS Coaching', 'TOEFL Preparation', 'SAT Coaching', 'A-Level Support',
  'Coding & Tech Skills', 'Science Lab Practicals', 'Exam Time Management',
];

const STEPS = ['About You', 'What You Teach', 'Verification & Media', 'Rates & Setup', 'Terms & Conditions'];

function ToggleChip({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-2 rounded-xl text-sm font-semibold border-2 transition ${
        active
          ? 'bg-green-700 border-green-700 text-white shadow-sm'
          : 'border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-700 bg-white'
      }`}
    >
      {active && <CheckCircle size={12} className="inline mr-1.5" />}
      {label}
    </button>
  );
}

// ─── Verification & Media Step ───────────────────────────────────────────────
function RequiredDocSlot({ label, hint, accepts, formKey, form, set }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const doc = form[formKey];

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('type', 'document');
      const { data } = await api.post('/tutors/upload-media', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      set(formKey, { fileUrl: data.url, publicId: data.publicId });
      toast.success(`${label} uploaded!`);
    } catch { toast.error(`${label} upload failed. Try again.`); }
    finally { setUploading(false); if (inputRef.current) inputRef.current.value = ''; }
  };

  return (
    <div className={`rounded-2xl border-2 p-4 transition ${doc ? 'border-green-300 bg-green-50/40' : 'border-red-200 bg-red-50/30'}`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <p className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
            {doc
              ? <CheckCircle size={15} className="text-green-600 shrink-0" />
              : <span className="w-3.5 h-3.5 rounded-full border-2 border-red-400 inline-block shrink-0" />}
            {label}
            <span className="text-[11px] font-semibold text-red-600 bg-red-100 px-1.5 py-0.5 rounded-full">Required</span>
          </p>
          <p className="text-xs text-gray-400 mt-0.5 ml-5">{hint}</p>
        </div>
        {doc && (
          <button type="button" onClick={() => set(formKey, null)}
            className="text-gray-400 hover:text-red-500 transition shrink-0 p-1">
            <X size={14} />
          </button>
        )}
      </div>

      {doc ? (
        <div className="ml-5 flex items-center gap-3 mt-2">
          <FileText size={15} className="text-green-700 shrink-0" />
          <a href={doc.fileUrl} target="_blank" rel="noreferrer"
            className="text-xs text-green-700 font-semibold hover:underline truncate">
            View uploaded document →
          </a>
          <button type="button" onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="ml-auto text-xs text-gray-500 border border-gray-200 px-2.5 py-1 rounded-lg hover:bg-gray-50 transition shrink-0">
            Replace
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}
          className="ml-5 flex items-center gap-2 border-2 border-dashed border-gray-300 text-gray-600 text-xs font-semibold px-3 py-2 rounded-xl hover:border-blue-400 hover:text-blue-700 hover:bg-blue-50 transition disabled:opacity-60 mt-2">
          <Upload size={12} />
          {uploading ? 'Uploading…' : `Upload ${label}`}
        </button>
      )}
      <input ref={inputRef} type="file" accept={accepts} className="hidden" onChange={handleFile} />
    </div>
  );
}

function VerificationStep({ form, set }) {
  const photoRef = useRef(null);
  const docRef   = useRef(null);
  const videoRef = useRef(null);

  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [docForm, setDocForm]   = useState({ name: '', uploading: false });
  const [showDocForm, setShowDocForm] = useState(false);

  const uploadFile = async (file, type) => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('type', type);
    const { data } = await api.post('/tutors/upload-media', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  };

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    setUploadingPhoto(true);
    try {
      const { url, publicId } = await uploadFile(file, 'photo');
      set('profilePhotoUrl', url);
      set('profilePhotoPublicId', publicId);
      toast.success('Profile photo uploaded!');
    } catch { toast.error('Photo upload failed'); }
    finally { setUploadingPhoto(false); if (photoRef.current) photoRef.current.value = ''; }
  };

  const handleExtraDoc = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!docForm.name.trim()) { toast.error('Please enter a document name first'); return; }
    setDocForm(f => ({ ...f, uploading: true }));
    try {
      const { url, publicId } = await uploadFile(file, 'document');
      set('verificationDocs', [...form.verificationDocs, { name: docForm.name.trim(), fileUrl: url, publicId }]);
      setDocForm({ name: '', uploading: false });
      setShowDocForm(false);
      toast.success('Document uploaded!');
    } catch { toast.error('Document upload failed'); }
    finally { setDocForm(f => ({ ...f, uploading: false })); if (docRef.current) docRef.current.value = ''; }
  };

  const handleVideo = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) { toast.error('Please select a video file'); return; }
    if (file.size > 100 * 1024 * 1024) { toast.error('Video must be under 100 MB'); return; }
    setUploadingVideo(true);
    try {
      const { url, publicId } = await uploadFile(file, 'video');
      set('introVideoUrl', url);
      set('introVideoPublicId', publicId);
      toast.success('Intro video uploaded!');
    } catch { toast.error('Video upload failed. Try a smaller file.'); }
    finally { setUploadingVideo(false); if (videoRef.current) videoRef.current.value = ''; }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-1">Verification &amp; Media</h2>
        <p className="text-gray-500 text-sm">Complete all required fields to continue. This helps us verify your identity and builds student trust.</p>
      </div>

      {/* ── Profile Photo ─────────────────────────────────────────────── */}
      <div>
        <label className="text-sm font-bold text-gray-700 mb-1 flex items-center gap-2">
          <Camera size={15} className="text-green-600" /> Profile Photo
          <span className="text-xs font-normal text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full ml-1">Appears on your profile</span>
        </label>
        <p className="text-xs text-gray-400 mb-4">A clear, professional headshot. Square photos work best.</p>

        <div className="flex items-center gap-5">
          <div className="w-24 h-24 rounded-2xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden shrink-0 relative">
            {form.profilePhotoUrl ? (
              <>
                <img src={form.profilePhotoUrl} alt="Profile" className="w-full h-full object-cover" />
                <button type="button"
                  onClick={() => { set('profilePhotoUrl', ''); set('profilePhotoPublicId', ''); }}
                  className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600">
                  <X size={10} />
                </button>
              </>
            ) : uploadingPhoto ? (
              <div className="w-6 h-6 border-2 border-green-300 border-t-green-700 rounded-full animate-spin" />
            ) : (
              <Camera size={28} className="text-gray-300" />
            )}
          </div>
          <div className="space-y-2">
            <button type="button" onClick={() => photoRef.current?.click()} disabled={uploadingPhoto}
              className="flex items-center gap-2 bg-green-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-green-800 transition disabled:opacity-60">
              <Upload size={14} />
              {uploadingPhoto ? 'Uploading…' : form.profilePhotoUrl ? 'Change Photo' : 'Upload Photo'}
            </button>
            <p className="text-xs text-gray-400">JPG, PNG, WEBP · Max 5 MB</p>
            <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
          </div>
        </div>
      </div>

      <div className="h-px bg-gray-100" />

      {/* ── Required Documents ────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <FileBadge size={15} className="text-blue-600" />
          <span className="text-sm font-bold text-gray-700">Identity &amp; Address Documents</span>
        </div>
        <p className="text-xs text-gray-400 mb-4">Both documents below are <strong className="text-red-600">required</strong> before you can proceed. Accepted: PDF, JPG, PNG.</p>

        <div className="space-y-3">
          <RequiredDocSlot
            label="Means of Identification"
            hint="National ID card, International passport, Driver's licence, or Voter's card"
            accepts=".pdf,image/*"
            formKey="idDoc"
            form={form}
            set={set}
          />
          <RequiredDocSlot
            label="Proof of Address"
            hint="Utility bill, bank statement, or tenancy agreement (issued within last 3 months)"
            accepts=".pdf,image/*"
            formKey="addressDoc"
            form={form}
            set={set}
          />
        </div>

        {/* Progress indicator */}
        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-green-500 transition-all duration-500"
              style={{ width: `${((form.idDoc ? 1 : 0) + (form.addressDoc ? 1 : 0)) * 50}%` }}
            />
          </div>
          <span className="text-xs text-gray-500 shrink-0">
            {(form.idDoc ? 1 : 0) + (form.addressDoc ? 1 : 0)}/2 required docs
          </span>
        </div>
      </div>

      {/* ── Additional Documents (optional) ──────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <FileText size={15} className="text-gray-500" />
          <span className="text-sm font-semibold text-gray-600">Additional Documents</span>
          <span className="text-xs font-normal text-gray-400">(optional)</span>
        </div>
        <p className="text-xs text-gray-400 mb-4">Degree certificates, teaching licences, NYSC certificate, etc. Tutors with more credentials get verified faster.</p>

        {form.verificationDocs.length > 0 && (
          <div className="space-y-2 mb-3">
            {form.verificationDocs.map((doc) => (
              <div key={doc.publicId} className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5">
                <FileText size={15} className="text-gray-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{doc.name}</p>
                  <a href={doc.fileUrl} target="_blank" rel="noreferrer"
                    className="text-xs text-blue-600 hover:underline">View file →</a>
                </div>
                <button type="button"
                  onClick={() => set('verificationDocs', form.verificationDocs.filter(d => d.publicId !== doc.publicId))}
                  className="text-gray-400 hover:text-red-500 transition p-1 rounded-lg hover:bg-red-50">
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {showDocForm ? (
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-3">
            <p className="text-sm font-bold text-gray-700">Add a Document</p>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Document Name *</label>
              <input
                value={docForm.name}
                onChange={e => setDocForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. B.Sc Mathematics Certificate, NYSC Certificate"
                className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Upload File *</label>
              <button type="button"
                onClick={() => { if (!docForm.name.trim()) { toast.error('Enter document name first'); return; } docRef.current?.click(); }}
                disabled={docForm.uploading}
                className="flex items-center gap-2 border-2 border-dashed border-blue-300 text-blue-700 bg-blue-50 text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-blue-100 transition w-full justify-center disabled:opacity-60">
                <Upload size={14} />
                {docForm.uploading ? 'Uploading…' : 'Choose File (PDF, JPG, PNG)'}
              </button>
              <input ref={docRef} type="file" accept=".pdf,image/*" className="hidden" onChange={handleExtraDoc} />
            </div>
            <button type="button" onClick={() => { setShowDocForm(false); setDocForm({ name: '', uploading: false }); }}
              className="text-xs text-gray-400 hover:text-gray-600 transition">Cancel</button>
          </div>
        ) : (
          <button type="button" onClick={() => setShowDocForm(true)}
            className="flex items-center gap-2 border-2 border-dashed border-gray-200 text-gray-500 text-sm font-semibold px-4 py-3 rounded-xl hover:border-blue-400 hover:text-blue-700 hover:bg-blue-50 transition w-full justify-center">
            <Plus size={15} /> Add Extra Document
          </button>
        )}
      </div>

      <div className="h-px bg-gray-100" />

      {/* ── Intro Video ───────────────────────────────────────────────── */}
      <div>
        <label className="text-sm font-bold text-gray-700 mb-1 flex items-center gap-2">
          <Video size={15} className="text-purple-600" /> Intro Video
          <span className="text-xs font-normal text-gray-400 ml-1">(optional)</span>
        </label>
        <p className="text-xs text-gray-400 mb-4">
          A 1–2 minute video introducing yourself and your teaching style. Tutors with a video get <strong className="text-gray-600">5× more</strong> profile views.
        </p>

        {form.introVideoUrl ? (
          <div className="space-y-3">
            <video src={form.introVideoUrl} controls className="w-full rounded-2xl border border-gray-200 max-h-56 bg-black" />
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => videoRef.current?.click()} disabled={uploadingVideo}
                className="flex items-center gap-2 border border-gray-200 text-gray-700 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-gray-50 transition disabled:opacity-60">
                <Upload size={13} /> {uploadingVideo ? 'Uploading…' : 'Replace Video'}
              </button>
              <button type="button" onClick={() => { set('introVideoUrl', ''); set('introVideoPublicId', ''); }}
                className="text-sm text-red-500 font-semibold hover:underline flex items-center gap-1">
                <X size={13} /> Remove
              </button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => videoRef.current?.click()} disabled={uploadingVideo}
            className="flex flex-col items-center gap-3 border-2 border-dashed border-purple-200 bg-purple-50/50 text-purple-700 rounded-2xl py-8 w-full hover:bg-purple-50 transition disabled:opacity-60">
            {uploadingVideo ? (
              <>
                <div className="w-8 h-8 border-2 border-purple-300 border-t-purple-700 rounded-full animate-spin" />
                <span className="text-sm font-semibold">Uploading video…</span>
                <span className="text-xs text-purple-400">This may take a moment</span>
              </>
            ) : (
              <>
                <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                  <Video size={22} className="text-purple-600" />
                </div>
                <span className="text-sm font-bold">Click to upload your intro video</span>
                <span className="text-xs text-purple-500">MP4, MOV, WEBM · Max 100 MB</span>
              </>
            )}
          </button>
        )}
        <input ref={videoRef} type="file" accept="video/*" className="hidden" onChange={handleVideo} />
      </div>

      {/* Info tip */}
      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3">
        <Shield size={18} className="text-amber-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-amber-800">Why verification matters</p>
          <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
            Your ID and address documents are reviewed privately by our team and never shown to students. Verified tutors earn a blue badge that increases student trust and bookings significantly.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function BecomeTutor() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const [form, setForm] = useState({
    headline: '',
    bio: '',
    yearsExperience: '',
    qualifications: [{ title: '', institution: '', year: '' }],
    languages: ['English'],
    subjects: [],
    levels: [],
    specializations: [],
    teachingMode: [],
    country: 'Nigeria',
    state: '',
    city: '',
    currency: 'NGN',
    hourlyRateNaira: '',
    groupRateNaira: '',
    trialAvailable: true,
    trialDurationMins: 30,
    trialDiscountPercent: 50,
    responseTime: 'Within 24 hours',
    availability: [],
    teachingStyle: [],
    // Verification & Media (Step 2)
    profilePhotoUrl:      '',
    profilePhotoPublicId: '',
    idDoc:            null, // { fileUrl, publicId } — Means of Identification (required)
    addressDoc:       null, // { fileUrl, publicId } — Proof of Address (required)
    verificationDocs:     [], // [{ name, fileUrl, publicId }] — additional optional docs
    introVideoUrl:        '',
    introVideoPublicId:   '',
    // Terms & Conditions step
    termsFullName:  '',
    termsAccepted:  false,
  });

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const toggleArr = (key, val) => {
    const arr = form[key];
    set(key, arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);
  };

  const addQual = () => set('qualifications', [...form.qualifications, { title: '', institution: '', year: '' }]);
  const removeQual = (i) => set('qualifications', form.qualifications.filter((_, idx) => idx !== i));
  const updateQual = (i, field, val) => {
    const next = [...form.qualifications];
    next[i] = { ...next[i], [field]: val };
    set('qualifications', next);
  };

  const canNext = () => {
    if (step === 0) return form.headline.trim().length >= 10 && form.bio.trim().length >= 50;
    if (step === 1) return form.subjects.length >= 1 && form.levels.length >= 1 && form.teachingMode.length >= 1;
    if (step === 2) return !!form.idDoc && !!form.addressDoc;
    if (step === 3) return true;
    return true;
  };

  const canSubmit = () =>
    form.termsAccepted && form.termsFullName.trim().length >= 3;

  const handleSubmit = async () => {
    if (!user) { toast.error('Please log in first'); navigate('/login'); return; }
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        country: form.country || 'Nigeria',
        currency: form.currency || 'NGN',
        hourlyRateNaira: form.hourlyRateNaira ? Number(form.hourlyRateNaira) : undefined,
        groupRateNaira: form.groupRateNaira ? Number(form.groupRateNaira) : undefined,
        yearsExperience: form.yearsExperience ? Number(form.yearsExperience) : 0,
        qualifications: form.qualifications.filter((q) => q.title.trim()),
        profilePhoto:       form.profilePhotoUrl || undefined,
        introVideo:         form.introVideoUrl || undefined,
        introVideoPublicId: form.introVideoPublicId || undefined,
        verificationDocs: [
          form.idDoc      ? { name: 'Means of Identification', ...form.idDoc }  : null,
          form.addressDoc ? { name: 'Proof of Address',        ...form.addressDoc } : null,
          ...form.verificationDocs,
        ].filter(Boolean),
      };
      await api.post('/tutors/register', payload);
      setDone(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-sm">
        <GraduationCap size={40} className="text-green-600 mx-auto mb-4" />
        <h2 className="font-bold text-gray-900 text-xl mb-2">Log in to register as a tutor</h2>
        <p className="text-gray-500 text-sm mb-6">You need a free account to apply as a tutor on Education Naija & Overseas.</p>
        <div className="flex gap-3 justify-center">
          <Link to="/login" className="bg-green-700 text-white font-bold px-6 py-3 rounded-xl hover:bg-green-800 transition text-sm">Log In</Link>
          <Link to="/register" className="border border-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-xl hover:bg-gray-50 transition text-sm">Create Account</Link>
        </div>
      </div>
    </div>
  );

  if (done) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md bg-white rounded-3xl p-10 border border-gray-100 shadow-xl">
        <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <CheckCircle size={32} className="text-green-600" />
        </div>
        <h2 className="font-extrabold text-gray-900 text-2xl mb-3">Application Submitted!</h2>
        <p className="text-gray-500 leading-relaxed mb-6">
          Thank you for applying! Our team will review your profile within <strong>24–48 hours</strong>.
          Once approved, your profile will go live and students can start booking sessions with you.
        </p>
        <p className="text-sm text-gray-400 mb-6">We'll send a confirmation to <strong>{user.email}</strong></p>
        <div className="flex gap-3 justify-center">
          <Link to="/find-tutoring" className="bg-green-700 text-white font-bold px-6 py-3 rounded-xl hover:bg-green-800 transition text-sm">
            Browse Tutors
          </Link>
          <Link to="/" className="border border-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-xl hover:bg-gray-50 transition text-sm">
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto py-4 flex items-center justify-between">
          <Link to="/find-tutoring" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-700 transition font-medium">
            <ChevronLeft size={16} /> Back
          </Link>
          <span className="font-bold text-gray-900">Become a Tutor</span>
          <span className="text-sm text-gray-400">Step {step + 1} of {STEPS.length}</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                i === step
                  ? 'bg-green-700 text-white shadow-md'
                  : i < step
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-400'
              }`}>
                {i < step ? <CheckCircle size={14} /> : <span className="w-4 h-4 rounded-full border-2 border-current flex items-center justify-center text-[10px] font-black">{i + 1}</span>}
                <span className="hidden sm:inline">{label}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`h-px w-6 ${i < step ? 'bg-green-400' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-linear-to-r from-green-700 to-green-600 h-1.5" />
          <div className="p-8">

            {/* ── STEP 0: About You ──────────────────────────────────── */}
            {step === 0 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-extrabold text-gray-900 mb-1">About You</h2>
                  <p className="text-gray-500 text-sm">Tell students who you are and why you're a great tutor.</p>
                </div>

                {/* Greeting */}
                <div className="flex items-center gap-3 bg-green-50 rounded-xl p-4 border border-green-100">
                  <div className="w-10 h-10 bg-green-700 rounded-xl flex items-center justify-center text-white font-bold shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Headline <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={form.headline}
                    onChange={(e) => set('headline', e.target.value)}
                    maxLength={120}
                    placeholder="e.g. Experienced WAEC Mathematics & Further Maths Tutor"
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500 transition"
                  />
                  <p className="text-xs text-gray-400 mt-1">{form.headline.length}/120 characters · Min. 10 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">About You / Bio <span className="text-red-500">*</span></label>
                  <textarea
                    value={form.bio}
                    onChange={(e) => set('bio', e.target.value)}
                    rows={5}
                    maxLength={2000}
                    placeholder="Tell students about your background, teaching style, achievements, and what makes you stand out. Min. 50 characters."
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500 transition resize-none"
                  />
                  <p className="text-xs text-gray-400 mt-1">{form.bio.length}/2000 · Min. 50 characters</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Years of Experience</label>
                    <input type="number" min="0" max="50" value={form.yearsExperience}
                      onChange={(e) => set('yearsExperience', e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500 transition" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Response Time</label>
                    <select value={form.responseTime} onChange={(e) => set('responseTime', e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500 transition">
                      <option>Within 1 hour</option>
                      <option>Within 3 hours</option>
                      <option>Within 24 hours</option>
                      <option>Within 48 hours</option>
                    </select>
                  </div>
                </div>

                {/* Languages */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Teaching Languages</label>
                  <div className="flex flex-wrap gap-2">
                    {['English', 'Yoruba', 'Igbo', 'Hausa', 'Pidgin', 'French'].map((lang) => (
                      <ToggleChip key={lang} label={lang} active={form.languages.includes(lang)} onClick={() => toggleArr('languages', lang)} />
                    ))}
                  </div>
                </div>

                {/* Qualifications */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-bold text-gray-700">Qualifications / Credentials</label>
                    <button type="button" onClick={addQual}
                      className="flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-xl hover:bg-green-100 transition">
                      <Plus size={12} /> Add
                    </button>
                  </div>
                  <div className="space-y-3">
                    {form.qualifications.map((q, i) => (
                      <div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-gray-50 rounded-xl p-3 border border-gray-100">
                        <input
                          type="text" value={q.title} placeholder="Degree / Certificate *"
                          onChange={(e) => updateQual(i, 'title', e.target.value)}
                          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500 bg-white"
                        />
                        <input
                          type="text" value={q.institution} placeholder="Institution (optional)"
                          onChange={(e) => updateQual(i, 'institution', e.target.value)}
                          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500 bg-white"
                        />
                        <div className="flex gap-2">
                          <input
                            type="text" value={q.year} placeholder="Year (e.g. 2020)"
                            onChange={(e) => updateQual(i, 'year', e.target.value)}
                            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500 bg-white"
                          />
                          {form.qualifications.length > 1 && (
                            <button type="button" onClick={() => removeQual(i)}
                              className="w-9 h-9 flex items-center justify-center text-red-400 hover:bg-red-50 rounded-lg transition shrink-0">
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 1: What You Teach ─────────────────────────────── */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-extrabold text-gray-900 mb-1">What You Teach</h2>
                  <p className="text-gray-500 text-sm">Select the subjects, levels, and how you teach.</p>
                </div>

                {/* Subjects */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Subjects <span className="text-red-500">*</span></label>
                  <p className="text-xs text-gray-400 mb-3">Select all subjects you teach ({form.subjects.length} selected)</p>
                  <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto p-1">
                    {ALL_SUBJECTS.map((s) => (
                      <ToggleChip key={s} label={s} active={form.subjects.includes(s)} onClick={() => toggleArr('subjects', s)} />
                    ))}
                  </div>
                </div>

                <div className="h-px bg-gray-100" />

                {/* Levels */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Student Levels <span className="text-red-500">*</span></label>
                  <p className="text-xs text-gray-400 mb-3">Which levels of students can you teach? ({form.levels.length} selected)</p>
                  <div className="flex flex-wrap gap-2">
                    {ALL_LEVELS.map(({ value, label }) => (
                      <ToggleChip key={value} label={label} active={form.levels.includes(value)} onClick={() => toggleArr('levels', value)} />
                    ))}
                  </div>
                </div>

                <div className="h-px bg-gray-100" />

                {/* Teaching mode */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Teaching Mode <span className="text-red-500">*</span></label>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[
                      { value: 'online', label: '💻 Online', desc: 'Via Zoom, Google Meet, WhatsApp Video, etc.' },
                      { value: 'in-person', label: '📍 In-Person', desc: 'Visit student at home or agreed location' },
                    ].map(({ value, label, desc }) => (
                      <button
                        type="button"
                        key={value}
                        onClick={() => toggleArr('teachingMode', value)}
                        className={`text-left p-4 rounded-2xl border-2 transition ${
                          form.teachingMode.includes(value)
                            ? 'bg-green-50 border-green-500'
                            : 'border-gray-200 hover:border-green-300 bg-white'
                        }`}
                      >
                        <p className={`font-bold text-sm mb-0.5 ${form.teachingMode.includes(value) ? 'text-green-700' : 'text-gray-800'}`}>{label}</p>
                        <p className="text-xs text-gray-500">{desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Country always shown; City & State for in-person */}
                <div className={`rounded-xl p-4 border ${form.teachingMode.includes('in-person') ? 'bg-purple-50 border-purple-100' : 'bg-gray-50 border-gray-100'}`}>
                  <p className="text-sm font-bold text-gray-700 mb-3">Your Location</p>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Country <span className="text-red-500">*</span></label>
                      <select value={form.country} onChange={(e) => set('country', e.target.value)}
                        className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-500 bg-white">
                        {WORLD_COUNTRIES.map((c) => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">State / Region</label>
                      <input type="text" value={form.state} onChange={(e) => set('state', e.target.value)}
                        placeholder="e.g. Lagos, London, Ontario"
                        className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-500 bg-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">City / Area</label>
                      <input type="text" value={form.city} onChange={(e) => set('city', e.target.value)}
                        placeholder="e.g. Lekki, Manchester"
                        className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-500 bg-white" />
                    </div>
                  </div>
                </div>

                {/* Availability */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Your Availability <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <p className="text-xs text-gray-400 mb-3">Select the times you're generally free to teach — this powers our matching system</p>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABILITY_OPTIONS.map((slot) => (
                      <ToggleChip key={slot} label={slot} active={form.availability.includes(slot)} onClick={() => toggleArr('availability', slot)} />
                    ))}
                  </div>
                </div>

                <div className="h-px bg-gray-100" />

                {/* Teaching style */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Your Teaching Style <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <p className="text-xs text-gray-400 mb-3">How would you describe your teaching approach? Students filter by this</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {TEACHING_STYLE_OPTIONS.map(({ value, label, desc }) => (
                      <button type="button" key={value}
                        onClick={() => toggleArr('teachingStyle', value)}
                        className={`text-left p-4 rounded-2xl border-2 transition ${
                          form.teachingStyle.includes(value)
                            ? 'bg-green-50 border-green-500'
                            : 'border-gray-200 hover:border-green-300 bg-white'
                        }`}>
                        <p className={`font-bold text-sm mb-0.5 ${form.teachingStyle.includes(value) ? 'text-green-700' : 'text-gray-800'}`}>{label}</p>
                        <p className="text-xs text-gray-500">{desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-gray-100" />

                {/* Specializations */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Specializations <span className="text-gray-400 font-normal">(optional)</span></label>
                  <p className="text-xs text-gray-400 mb-3">Highlight what you're particularly good at</p>
                  <div className="flex flex-wrap gap-2">
                    {SPECIALIZATION_OPTIONS.map((s) => (
                      <ToggleChip key={s} label={s} active={form.specializations.includes(s)} onClick={() => toggleArr('specializations', s)} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 2: Verification & Media ──────────────────────── */}
            {step === 2 && (
              <VerificationStep form={form} set={set} user={user} />
            )}

            {/* ── STEP 3: Rates & Setup ──────────────────────────────── */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-extrabold text-gray-900 mb-1">Rates & Setup</h2>
                  <p className="text-gray-500 text-sm">Set your pricing. You can always update this later from your dashboard.</p>
                </div>

                {/* Currency */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Your Currency</label>
                  <select value={form.currency} onChange={(e) => set('currency', e.target.value)}
                    className="w-full sm:w-64 border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500 bg-white transition">
                    {CURRENCIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                  <p className="text-xs text-gray-400 mt-1">Students will see your rate in this currency</p>
                </div>

                {/* Pricing tip */}
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 text-sm text-blue-700">
                  <strong>💡 Pricing tip:</strong> Set a competitive rate for your country and subject. Offering a discounted first session gets you 3× more bookings.
                </div>

                {/* Rates */}
                {(() => {
                  const sym = CURRENCIES.find(c => c.value === form.currency)?.symbol || '₦';
                  return (
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">1-on-1 Hourly Rate ({sym})</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-xs">{sym}</span>
                          <input type="number" min="0" value={form.hourlyRateNaira} onChange={(e) => set('hourlyRateNaira', e.target.value)}
                            placeholder="e.g. 4000"
                            className="w-full pl-10 border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500 transition" />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Per hour for 1-on-1 sessions</p>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Group Rate ({sym}) <span className="text-gray-400 font-normal">(optional)</span></label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-xs">{sym}</span>
                          <input type="number" min="0" value={form.groupRateNaira} onChange={(e) => set('groupRateNaira', e.target.value)}
                            placeholder="e.g. 2000"
                            className="w-full pl-10 border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500 transition" />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Per person per hour (group sessions)</p>
                      </div>
                    </div>
                  );
                })()}

                {/* Discounted first session */}
                <div className="bg-green-50 rounded-2xl p-5 border border-green-100">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-bold text-gray-900 text-sm">Offer a Discounted First Session?</p>
                      <p className="text-xs text-gray-500 mt-0.5">Tutors with a discounted first session get 3× more bookings</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => set('trialAvailable', !form.trialAvailable)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${form.trialAvailable ? 'bg-green-600' : 'bg-gray-300'}`}
                    >
                      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.trialAvailable ? 'translate-x-7' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  {form.trialAvailable && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Session Duration</label>
                        <div className="flex gap-2">
                          {[30, 45, 60].map((mins) => (
                            <button
                              type="button"
                              key={mins}
                              onClick={() => set('trialDurationMins', mins)}
                              className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition ${
                                form.trialDurationMins === mins
                                  ? 'bg-green-700 border-green-700 text-white'
                                  : 'border-gray-200 text-gray-600 hover:border-green-400 bg-white'
                              }`}
                            >
                              {mins} min
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                          Discount Percentage — student pays {100 - form.trialDiscountPercent}% of your rate
                        </label>
                        <div className="flex gap-2 flex-wrap">
                          {[10, 20, 30, 50, 70].map((pct) => (
                            <button
                              type="button"
                              key={pct}
                              onClick={() => set('trialDiscountPercent', pct)}
                              className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition ${
                                form.trialDiscountPercent === pct
                                  ? 'bg-green-700 border-green-700 text-white'
                                  : 'border-gray-200 text-gray-600 hover:border-green-400 bg-white'
                              }`}
                            >
                              {pct}% off
                            </button>
                          ))}
                        </div>
                        {form.hourlyRateNaira > 0 && (
                          <p className="text-xs text-green-700 mt-2 font-semibold">
                            Student pays ≈ ₦{Math.round(Number(form.hourlyRateNaira) * (1 - form.trialDiscountPercent / 100) * (form.trialDurationMins / 60)).toLocaleString()} for this first session
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Summary preview */}
                <div className="bg-gray-900 rounded-2xl p-6 text-white">
                  <h3 className="font-bold mb-4 text-gray-300 uppercase tracking-wider text-xs">Your Profile Preview</h3>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-green-600 flex items-center justify-center text-white font-bold text-lg">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-white">{user.name}</p>
                      <p className="text-gray-400 text-xs">{form.headline || 'Your headline will appear here'}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {form.subjects.slice(0, 4).map((s) => (
                      <span key={s} className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded-full">{s}</span>
                    ))}
                    {form.subjects.length > 4 && <span className="text-xs text-gray-500">+{form.subjects.length - 4} more</span>}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {form.teachingMode.includes('online') && <span className="text-xs bg-blue-900 text-blue-300 px-2 py-1 rounded-full">💻 Online</span>}
                      {form.teachingMode.includes('in-person') && <span className="text-xs bg-purple-900 text-purple-300 px-2 py-1 rounded-full">📍 In-Person</span>}
                    </div>
                    <p className="font-extrabold text-white">
                      {form.hourlyRateNaira ? `${CURRENCIES.find(c => c.value === form.currency)?.symbol || '₦'}${Number(form.hourlyRateNaira).toLocaleString()}/hr` : 'Rate TBD'}
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 text-xs text-blue-700">
                  <Shield size={15} className="text-blue-500 shrink-0 mt-0.5" />
                  <span>Almost done! On the next step you'll review and sign our Tutor Terms &amp; Conditions before your application is submitted for review.</span>
                </div>
              </div>
            )}
          {/* ── STEP 4: Terms & Conditions ────────────────────────── */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-extrabold text-gray-900 mb-1">Terms &amp; Conditions</h2>
                <p className="text-gray-500 text-sm">Please read the full agreement carefully before submitting your application.</p>
              </div>

              {/* T&C Document */}
              <div className="border-2 border-gray-200 rounded-2xl overflow-hidden">
                <div className="bg-gray-900 px-5 py-3 flex items-center gap-2">
                  <FileText size={15} className="text-gray-400" />
                  <span className="text-sm font-bold text-white">Tutor Agreement — Education Naija &amp; Overseas</span>
                  <span className="ml-auto text-xs text-gray-500">Last updated: June 2025</span>
                </div>

                <div className="h-[420px] overflow-y-auto px-5 py-5 space-y-5 text-[13px] text-gray-700 leading-relaxed scroll-smooth" id="tnc-scroll">

                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800 text-xs font-medium">
                    This is a legally binding agreement between you ("Tutor") and Education Naija &amp; Overseas ("Platform", "we", "us"). By completing your registration you confirm that you have read, understood, and agreed to all terms below.
                  </div>

                  {/* 1 */}
                  <div>
                    <p className="font-extrabold text-gray-900 text-sm mb-2">1. Introduction &amp; Acceptance</p>
                    <p>Education Naija &amp; Overseas is an online educational marketplace that connects tutors with students and parents across Nigeria and internationally. These Terms govern your registration, conduct, and use of the Platform as a tutor.</p>
                    <p className="mt-2">By submitting this application you confirm that you have read, understood, and agree to be bound by these Terms, our Privacy Policy, and any additional guidelines published on the Platform. If you do not agree, you must not register as a tutor.</p>
                  </div>

                  {/* 2 */}
                  <div>
                    <p className="font-extrabold text-gray-900 text-sm mb-2">2. Eligibility</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>You must be at least <strong>18 years of age</strong>.</li>
                      <li>You must have the legal right to work and provide educational services in your country of residence.</li>
                      <li>You must not have been previously suspended or banned from the Platform or any similar educational service for misconduct.</li>
                      <li>You must not have any criminal convictions related to fraud, violence, sexual offences, or misconduct with minors.</li>
                      <li>You may only hold <strong>one active tutor account</strong>. Creating duplicate accounts may result in permanent suspension.</li>
                    </ul>
                  </div>

                  {/* 3 */}
                  <div>
                    <p className="font-extrabold text-gray-900 text-sm mb-2">3. Account Registration &amp; Accuracy</p>
                    <p>You agree to provide <strong>complete, accurate, and truthful information</strong> throughout your application and on your public profile — including your name, qualifications, experience, teaching subjects, location, and rates. Misrepresentation of qualifications or identity is grounds for immediate removal.</p>
                    <p className="mt-2">You are responsible for maintaining the security of your account credentials. You must notify us immediately at <strong>support@naijaandoverseas.com</strong> if you suspect unauthorised access to your account.</p>
                  </div>

                  {/* 4 */}
                  <div>
                    <p className="font-extrabold text-gray-900 text-sm mb-2">4. Identity Verification &amp; Documentation</p>
                    <p>As part of registration you are required to submit:</p>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      <li>A valid <strong>government-issued photo ID</strong> (National ID, International Passport, Driver's Licence, or Voter's Card).</li>
                      <li>A <strong>proof of address</strong> document issued within the last three (3) months.</li>
                    </ul>
                    <p className="mt-2">All documents are reviewed privately by our team and are never shared with students or displayed publicly. Submitting forged, altered, or fraudulent documents is a criminal offence and will result in permanent ban and potential legal action.</p>
                    <p className="mt-2">The <strong>Verified Badge</strong> is awarded at our sole discretion following successful identity review. We reserve the right to re-verify at any time.</p>
                  </div>

                  {/* 5 */}
                  <div>
                    <p className="font-extrabold text-gray-900 text-sm mb-2">5. Professional Conduct &amp; Session Quality</p>
                    <p>As a tutor on this Platform you agree to:</p>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      <li>Conduct every session with professionalism, punctuality, and respect.</li>
                      <li>Deliver sessions as described in your profile and as agreed with the student or parent.</li>
                      <li>Maintain appropriate dress, background, and environment for all online sessions.</li>
                      <li>Communicate respectfully and professionally in all Platform messages.</li>
                      <li>Not use offensive, abusive, discriminatory, or sexually inappropriate language at any time.</li>
                      <li>Provide adequate notice (minimum 24 hours) when cancelling or rescheduling a confirmed session.</li>
                      <li>Not record sessions without the explicit written consent of the student or parent/guardian.</li>
                    </ul>
                  </div>

                  {/* 6 */}
                  <div>
                    <p className="font-extrabold text-gray-900 text-sm mb-2">6. Child Safety &amp; Safeguarding</p>
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-800">
                      <p className="font-bold mb-1">Zero Tolerance Policy</p>
                      <p>The safety and wellbeing of every student — especially minors — is our highest priority. Any violation of this section will result in <strong>immediate permanent ban, report to relevant authorities, and potential criminal prosecution.</strong></p>
                    </div>
                    <ul className="list-disc pl-5 mt-3 space-y-1">
                      <li>You must never engage in any form of <strong>inappropriate relationship</strong>, romantic communication, or sexual conduct with any student.</li>
                      <li>You must never request or share <strong>personal contact details</strong> (phone numbers, home addresses, social media) with minors directly outside of the Platform.</li>
                      <li>Online sessions involving minors must be conducted in an <strong>open, observable, and appropriate setting</strong>. We recommend parents/guardians are present or nearby.</li>
                      <li>You must <strong>immediately report</strong> to the Platform any safeguarding concern or disclosure made by a student during a session.</li>
                      <li>You must not share, distribute, or make available any <strong>inappropriate, violent, or adult content</strong> during sessions.</li>
                      <li>In-person sessions with minors require <strong>prior written consent from a parent or guardian</strong> confirming the location and arrangement.</li>
                    </ul>
                  </div>

                  {/* 7 */}
                  <div>
                    <p className="font-extrabold text-gray-900 text-sm mb-2">7. Fees, Payments &amp; Platform Commission</p>
                    <p>You set your own hourly rate. The Platform retains a <strong>service commission</strong> on each completed booking (exact rate displayed in your dashboard). Commission rates may be revised with 30 days notice.</p>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      <li>Payments are processed and disbursed to you according to the schedule outlined in your dashboard.</li>
                      <li>Refunds issued to students due to cancellation, non-attendance, or complaint resolution may be debited from your earnings.</li>
                      <li>You are solely responsible for declaring and paying any taxes, levies, or duties applicable to your earnings in your country of residence.</li>
                      <li>You may not negotiate off-platform payments to circumvent Platform fees. Doing so is grounds for account termination.</li>
                    </ul>
                  </div>

                  {/* 8 */}
                  <div>
                    <p className="font-extrabold text-gray-900 text-sm mb-2">8. Prohibited Conduct</p>
                    <p>You must not:</p>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      <li>Solicit students to continue sessions <strong>outside the Platform</strong> to avoid commission.</li>
                      <li>Impersonate another person or use a false identity on your profile.</li>
                      <li>Post false, misleading, or fabricated reviews or testimonials.</li>
                      <li>Use the Platform to spam, advertise unrelated services, or distribute malware or phishing links.</li>
                      <li>Engage in academic fraud — including completing assignments, exams, or coursework on a student's behalf.</li>
                      <li>Discriminate against any student based on race, gender, religion, disability, or national origin.</li>
                      <li>Share another tutor's or student's personal information without consent.</li>
                    </ul>
                  </div>

                  {/* 9 */}
                  <div>
                    <p className="font-extrabold text-gray-900 text-sm mb-2">9. Intellectual Property</p>
                    <p>You retain ownership of original teaching materials you create. However, by uploading materials to the Platform you grant Education Naija &amp; Overseas a <strong>non-exclusive, royalty-free licence</strong> to display, distribute, and promote such materials solely in connection with the Platform's services.</p>
                    <p className="mt-2">Your public profile — including name, photo, headline, bio, subject tags, and student reviews — may be displayed on the Platform, in search results, and in promotional materials. You consent to this use by registering.</p>
                  </div>

                  {/* 10 */}
                  <div>
                    <p className="font-extrabold text-gray-900 text-sm mb-2">10. Privacy &amp; Data</p>
                    <p>We collect and process your personal data as described in our <strong>Privacy Policy</strong>, available at naijaandoverseas.com/privacy. By registering you consent to this processing. Key points:</p>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      <li>Your verification documents are stored securely and never shared publicly.</li>
                      <li>Student contact details shared during booking are for session purposes only — you must not retain or use them beyond the agreed session.</li>
                      <li>We may share data with law enforcement if required by law or to investigate safeguarding concerns.</li>
                    </ul>
                  </div>

                  {/* 11 */}
                  <div>
                    <p className="font-extrabold text-gray-900 text-sm mb-2">11. Suspension &amp; Termination</p>
                    <p>We reserve the right to <strong>suspend or permanently remove</strong> your account for any of the following:</p>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      <li>Breach of any provision of these Terms.</li>
                      <li>Repeated poor reviews, complaints, or no-shows.</li>
                      <li>Failure to pass re-verification when requested.</li>
                      <li>Any child safeguarding concern or criminal investigation.</li>
                      <li>Inactivity for more than 12 consecutive months.</li>
                    </ul>
                    <p className="mt-2">Where suspension is not due to safeguarding or criminal concerns, you may submit an appeal within 14 days to <strong>support@naijaandoverseas.com</strong>.</p>
                  </div>

                  {/* 12 */}
                  <div>
                    <p className="font-extrabold text-gray-900 text-sm mb-2">12. Limitation of Liability</p>
                    <p>Education Naija &amp; Overseas is a marketplace platform. We do not directly employ tutors or guarantee student bookings, earnings, or session outcomes. To the fullest extent permitted by law:</p>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      <li>We are not liable for disputes between tutors and students/parents beyond what is resolved through our complaints process.</li>
                      <li>We are not liable for loss of earnings resulting from Platform downtime, account suspension, or changes to commission structure.</li>
                      <li>We are not responsible for any harm arising from in-person sessions arranged via the Platform.</li>
                    </ul>
                  </div>

                  {/* 13 */}
                  <div>
                    <p className="font-extrabold text-gray-900 text-sm mb-2">13. Amendments</p>
                    <p>We may update these Terms at any time. Significant changes will be communicated via email to your registered address at least <strong>14 days</strong> before taking effect. Continued use of the Platform after the effective date constitutes acceptance of the updated Terms.</p>
                  </div>

                  {/* 14 */}
                  <div>
                    <p className="font-extrabold text-gray-900 text-sm mb-2">14. Governing Law</p>
                    <p>These Terms are governed by and construed in accordance with the laws of the <strong>Federal Republic of Nigeria</strong>. Any dispute shall be subject to the exclusive jurisdiction of the courts of Lagos State, Nigeria, unless otherwise agreed in writing.</p>
                  </div>

                  {/* 15 */}
                  <div>
                    <p className="font-extrabold text-gray-900 text-sm mb-2">15. Contact</p>
                    <p>For questions about these Terms, contact us at:</p>
                    <p className="mt-1"><strong>Email:</strong> support@naijaandoverseas.com</p>
                    <p><strong>Website:</strong> naijaandoverseas.com</p>
                  </div>

                  <div className="h-4" />
                </div>
              </div>

              {/* Agreement section */}
              <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-5 space-y-5">
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => set('termsAccepted', !form.termsAccepted)}
                    className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition ${
                      form.termsAccepted
                        ? 'bg-green-700 border-green-700'
                        : 'border-gray-300 hover:border-green-500 bg-white'
                    }`}
                  >
                    {form.termsAccepted && (
                      <svg viewBox="0 0 12 9" fill="none" className="w-3 h-3">
                        <path d="M1 4L4.5 7.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </button>
                  <label
                    className="text-sm text-gray-700 cursor-pointer select-none"
                    onClick={() => set('termsAccepted', !form.termsAccepted)}
                  >
                    I have read and fully understand the <strong>Terms &amp; Conditions</strong> of Education Naija &amp; Overseas. I agree to be bound by this agreement and confirm that all information I have provided is <strong>accurate and truthful</strong>.
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Sign with your full legal name <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-gray-400 mb-3">
                    Type your full name exactly as it appears on your ID. This serves as your digital signature confirming your agreement.
                  </p>
                  <input
                    type="text"
                    value={form.termsFullName}
                    onChange={(e) => set('termsFullName', e.target.value)}
                    placeholder="e.g. Adebayo Oluwaseun Fatima"
                    className={`w-full border-2 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none transition ${
                      form.termsFullName.trim().length >= 3
                        ? 'border-green-400 bg-green-50/40 focus:border-green-500'
                        : 'border-gray-200 focus:border-green-500'
                    }`}
                  />
                  {form.termsFullName.trim().length >= 3 && (
                    <p className="text-xs text-green-700 mt-1.5 flex items-center gap-1">
                      <CheckCircle size={11} /> Signature accepted
                    </p>
                  )}
                </div>

                {form.termsAccepted && form.termsFullName.trim().length >= 3 && (
                  <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
                    <CheckCircle size={18} className="text-green-600 shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-green-800">Ready to submit</p>
                      <p className="text-xs text-green-600 mt-0.5">
                        Signed by <strong>{form.termsFullName}</strong> on {new Date().toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          </div>

          {/* Footer nav */}
          <div className="px-8 py-5 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              disabled={step === 0}
              className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-white hover:border-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition">
              <ChevronLeft size={16} /> Back
            </button>

            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={() => canNext() && setStep((s) => s + 1)}
                disabled={!canNext()}
                className="flex items-center gap-2 bg-green-700 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-green-800 transition text-sm shadow-sm disabled:opacity-40 disabled:cursor-not-allowed">
                Continue <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || !canSubmit()}
                className="flex items-center gap-2 bg-green-700 text-white font-bold px-8 py-2.5 rounded-xl hover:bg-green-800 transition text-sm shadow-sm disabled:opacity-40 disabled:cursor-not-allowed">
                {submitting ? 'Submitting…' : 'Submit Application'} <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Benefits strip */}
        <div className="grid sm:grid-cols-3 gap-4 mt-8">
          {[
            { icon: Banknote, label: 'Set Your Own Rate', desc: 'You decide what you charge per hour' },
            { icon: Globe, label: 'Reach More Students', desc: 'Get discovered by thousands of parents daily' },
            { icon: Shield, label: 'Verified & Trusted', desc: 'Our badge builds student confidence in you' },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex items-start gap-3 bg-white rounded-2xl p-4 border border-gray-100">
              <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
                <Icon size={16} className="text-green-700" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">{label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
