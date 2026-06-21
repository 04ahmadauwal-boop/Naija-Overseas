import { useState } from 'react';
import {
  X, ChevronRight, ChevronLeft, GraduationCap, User,
  CreditCard, CheckCircle, Phone, MapPin, AlertCircle, Heart,
} from 'lucide-react';
import { initializePaystack } from '../utils/paystack';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

// ── Shared styles ─────────────────────────────────────────────────────────────
const INPUT = 'w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white placeholder-gray-400';
const LABEL = 'block text-xs font-semibold text-gray-600 mb-1';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'];
const RELIGIONS    = ['Christianity', 'Islam', 'Traditional', 'Other', 'None'];
const NIGERIAN_STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT','Gombe','Imo',
  'Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa',
  'Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba',
  'Yobe','Zamfara',
];

const STEPS = ['Class', 'Child', 'Parent', 'Review'];
const STEP_ICONS = [GraduationCap, GraduationCap, User, CreditCard];

function Field({ label, error, required, children }) {
  return (
    <div>
      <label className={LABEL}>{label}{required && <span className="text-red-400 ml-0.5">*</span>}</label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={10} />{error}</p>}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function AdmissionModal({ school, admission, onClose }) {
  const { user } = useAuth();
  const [step, setStep]     = useState(0);
  const [loading, setLoading] = useState(false);
  const [done, setDone]     = useState(false);
  const [errors, setErrors] = useState({});

  const isClassBased    = admission?.type === 'class-based';
  const availableClasses = (admission?.classes || []).filter((c) => c.isAvailable);

  const [selectedClass, setSelectedClass] = useState(
    isClassBased ? null : { name: 'General Admission', price: admission?.generalPrice || 0 }
  );

  // Step 1 — child details
  const [child, setChild] = useState({
    childFirstName:         '',
    childLastName:          '',
    childDOB:               '',
    childGender:            '',
    childNationality:       'Nigerian',
    childStateOfOrigin:     '',
    childBloodGroup:        '',
    childReligion:          '',
    childMedicalConditions: '',
    childPreviousSchool:    '',
  });

  // Step 2 — parent + emergency contact
  const [parent, setParent] = useState({
    parentName:                  user?.name || '',
    parentPhone:                 user?.phone || '',
    parentAltPhone:              '',
    parentEmail:                 user?.email || '',
    parentRelationship:          '',
    parentAddress:               '',
    parentOccupation:            '',
    emergencyContactName:        '',
    emergencyContactPhone:       '',
    emergencyContactRelationship:'',
  });

  const price = selectedClass?.price || 0;

  // ── Validation ────────────────────────────────────────────────────────────────
  function validateStep() {
    const errs = {};
    if (step === 0 && isClassBased && !selectedClass) {
      errs.class = 'Please select a class to continue';
    }
    if (step === 1) {
      if (!child.childFirstName.trim()) errs.childFirstName = 'Required';
      if (!child.childLastName.trim())  errs.childLastName  = 'Required';
      if (!child.childDOB)              errs.childDOB       = 'Required';
      if (!child.childGender)           errs.childGender    = 'Required';
      if (!child.childStateOfOrigin.trim()) errs.childStateOfOrigin = 'Required';
    }
    if (step === 2) {
      if (!parent.parentName.trim())       errs.parentName         = 'Required';
      if (!parent.parentPhone.trim())      errs.parentPhone        = 'Required';
      if (!parent.parentEmail.trim())      errs.parentEmail        = 'Required';
      if (!parent.parentRelationship)      errs.parentRelationship = 'Required';
      if (!parent.parentAddress.trim())    errs.parentAddress      = 'Required';
      if (!parent.emergencyContactName.trim())  errs.emergencyContactName  = 'Required';
      if (!parent.emergencyContactPhone.trim()) errs.emergencyContactPhone = 'Required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function next() {
    if (!validateStep()) return;
    setStep((s) => s + 1);
    setErrors({});
  }

  // ── Payment & Submit ──────────────────────────────────────────────────────────
  async function handlePay() {
    if (!user) { toast.error('Please log in to apply'); return; }
    setLoading(true);
    try {
      initializePaystack({
        email:  parent.parentEmail || user.email,
        amount: price,
        metadata: {
          schoolName: school.name,
          className:  selectedClass?.name,
          childName:  `${child.childFirstName} ${child.childLastName}`,
        },
        onSuccess: async (ref) => {
          try {
            await api.post(`/admission/${school._id}/apply`, {
              ...child,
              className: selectedClass?.name || 'General',
              ...parent,
              paymentRef: ref,
            });
            setDone(true);
          } catch (err) {
            toast.error(err.response?.data?.message || 'Submission failed. Please contact support.');
          } finally {
            setLoading(false);
          }
        },
        onClose: () => setLoading(false),
      });
    } catch {
      setLoading(false);
      toast.error('Could not open payment window');
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-200 bg-black/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-base font-extrabold text-gray-900">Apply for Admission</h2>
            <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[280px]">{school.name}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition p-1 rounded-lg hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        {done ? (
          <SuccessScreen school={school} selectedClass={selectedClass} child={child} parent={parent} onClose={onClose} />
        ) : (
          <>
            {/* Progress stepper */}
            <div className="px-5 pt-4 pb-3 shrink-0">
              <div className="flex items-center">
                {STEPS.map((label, i) => {
                  const Icon = STEP_ICONS[i];
                  return (
                    <div key={label} className="flex items-center flex-1 last:flex-none">
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          i < step  ? 'bg-emerald-500 text-white' :
                          i === step ? 'bg-emerald-600 text-white ring-4 ring-emerald-100' :
                          'bg-gray-100 text-gray-400'
                        }`}>
                          {i < step ? <CheckCircle size={15} /> : <Icon size={14} />}
                        </div>
                        <span className={`text-[9px] mt-1 font-bold ${i === step ? 'text-emerald-700' : 'text-gray-400'}`}>{label}</span>
                      </div>
                      {i < STEPS.length - 1 && (
                        <div className={`flex-1 h-0.5 mx-1 mb-4 rounded-full transition-colors ${i < step ? 'bg-emerald-400' : 'bg-gray-200'}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step content — scrollable */}
            <div className="flex-1 overflow-y-auto px-5 pb-3 space-y-1">
              {step === 0 && (
                <StepClass
                  isClassBased={isClassBased}
                  admission={admission}
                  availableClasses={availableClasses}
                  selectedClass={selectedClass}
                  onSelect={setSelectedClass}
                  error={errors.class}
                />
              )}
              {step === 1 && (
                <StepChild
                  values={child}
                  onChange={(k, v) => setChild(p => ({ ...p, [k]: v }))}
                  errors={errors}
                />
              )}
              {step === 2 && (
                <StepParent
                  values={parent}
                  onChange={(k, v) => setParent(p => ({ ...p, [k]: v }))}
                  errors={errors}
                />
              )}
              {step === 3 && (
                <StepReview school={school} child={child} parent={parent} selectedClass={selectedClass} price={price} />
              )}
            </div>

            {/* Footer nav */}
            <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 shrink-0 gap-3">
              {step > 0 ? (
                <button onClick={() => { setStep(s => s - 1); setErrors({}); }}
                  className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-800 transition px-4 py-2.5 rounded-xl border border-gray-200 hover:border-gray-300">
                  <ChevronLeft size={15} /> Back
                </button>
              ) : <div />}

              {step < 3 ? (
                <button onClick={next}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-6 py-2.5 rounded-xl transition shadow-sm ml-auto">
                  Continue <ChevronRight size={15} />
                </button>
              ) : (
                <button onClick={handlePay} disabled={loading}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-bold px-6 py-2.5 rounded-xl transition shadow-sm ml-auto">
                  <CreditCard size={15} />
                  {loading ? 'Processing…' : price > 0 ? `Pay ₦${price.toLocaleString()}` : 'Submit Application'}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Step 0: Class Selection ───────────────────────────────────────────────────
function StepClass({ isClassBased, admission, availableClasses, selectedClass, onSelect, error }) {
  const allClasses = admission?.classes || [];
  const closedClasses = allClasses.filter(c => !c.isAvailable);

  if (!isClassBased) {
    return (
      <div className="space-y-3 py-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Admission Information</p>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-gray-800">General Admission Form</span>
            <span className="text-emerald-700 font-extrabold text-lg">₦{(admission?.generalPrice || 0).toLocaleString()}</span>
          </div>
          {admission?.session && (
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <span className="text-gray-400">Session:</span>
              <span className="font-semibold">{admission.session}</span>
            </div>
          )}
          {admission?.deadline && (
            <div className="flex items-center gap-1.5 text-xs text-red-600">
              <span className="text-gray-400">Deadline:</span>
              <span className="font-semibold">{new Date(admission.deadline).toLocaleDateString('en-NG', { day:'numeric',month:'long',year:'numeric' })}</span>
            </div>
          )}
          {admission?.description && <p className="text-xs text-gray-600 mt-1 leading-relaxed">{admission.description}</p>}
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <p className="text-xs text-amber-800 leading-relaxed">
            <strong>Note:</strong> Your child's class will be selected in the next step. Ensure all information provided is accurate.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 py-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Select Class</p>
        {admission?.session && <span className="text-xs text-gray-400">Session: <strong className="text-gray-600">{admission.session}</strong></span>}
      </div>
      {error && <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={10} />{error}</p>}

      {availableClasses.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-xl">
          <GraduationCap size={28} className="text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400">No classes are currently available</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {availableClasses.map((cls) => (
            <button key={cls.name} onClick={() => onSelect(cls)}
              className={`rounded-xl border-2 p-3 text-left transition-all ${
                selectedClass?.name === cls.name
                  ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                  : 'border-gray-200 hover:border-emerald-300 bg-white hover:bg-emerald-50/30'
              }`}>
              <p className="text-sm font-bold text-gray-800">{cls.name}</p>
              <p className="text-emerald-700 font-extrabold text-base mt-0.5">₦{cls.price.toLocaleString()}</p>
            </button>
          ))}
        </div>
      )}

      {closedClasses.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Closed Classes</p>
          <div className="grid grid-cols-2 gap-2 opacity-50">
            {closedClasses.map((cls) => (
              <div key={cls.name} className="rounded-xl border border-gray-200 p-3 bg-gray-50 cursor-not-allowed">
                <p className="text-sm font-bold text-gray-500">{cls.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">Not accepting applications</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {admission?.deadline && (
        <p className="text-xs text-red-600 text-center pt-1">
          Application deadline: <strong>{new Date(admission.deadline).toLocaleDateString('en-NG', { day:'numeric',month:'long',year:'numeric' })}</strong>
        </p>
      )}
    </div>
  );
}

// ── Step 1: Child Information ─────────────────────────────────────────────────
function StepChild({ values, onChange, errors }) {
  return (
    <div className="space-y-3 py-2">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
        <GraduationCap size={12} /> Child's Information
      </p>

      <div className="grid grid-cols-2 gap-3">
        <Field label="First Name" required error={errors.childFirstName}>
          <input className={INPUT} value={values.childFirstName}
            onChange={e => onChange('childFirstName', e.target.value)} placeholder="e.g. Amara" />
        </Field>
        <Field label="Last Name" required error={errors.childLastName}>
          <input className={INPUT} value={values.childLastName}
            onChange={e => onChange('childLastName', e.target.value)} placeholder="e.g. Okafor" />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Date of Birth" required error={errors.childDOB}>
          <input type="date" className={INPUT} value={values.childDOB}
            onChange={e => onChange('childDOB', e.target.value)}
            max={new Date().toISOString().split('T')[0]} />
        </Field>
        <Field label="Gender" required error={errors.childGender}>
          <select className={INPUT} value={values.childGender} onChange={e => onChange('childGender', e.target.value)}>
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Nationality" error={errors.childNationality}>
          <input className={INPUT} value={values.childNationality}
            onChange={e => onChange('childNationality', e.target.value)} placeholder="e.g. Nigerian" />
        </Field>
        <Field label="State of Origin" required error={errors.childStateOfOrigin}>
          <select className={INPUT} value={values.childStateOfOrigin} onChange={e => onChange('childStateOfOrigin', e.target.value)}>
            <option value="">Select state</option>
            {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Blood Group">
          <select className={INPUT} value={values.childBloodGroup} onChange={e => onChange('childBloodGroup', e.target.value)}>
            <option value="">Select</option>
            {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </Field>
        <Field label="Religion">
          <select className={INPUT} value={values.childReligion} onChange={e => onChange('childReligion', e.target.value)}>
            <option value="">Select</option>
            {RELIGIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </Field>
      </div>

      <Field label="Medical Conditions / Allergies (optional)">
        <textarea className={INPUT} rows={2} value={values.childMedicalConditions}
          onChange={e => onChange('childMedicalConditions', e.target.value)}
          placeholder="Any allergies, medical conditions, or special needs the school should know about…" />
      </Field>

      <Field label="Previous School (optional)">
        <input className={INPUT} value={values.childPreviousSchool}
          onChange={e => onChange('childPreviousSchool', e.target.value)}
          placeholder="Name of last school attended" />
      </Field>
    </div>
  );
}

// ── Step 2: Parent + Emergency Contact ────────────────────────────────────────
function StepParent({ values, onChange, errors }) {
  return (
    <div className="space-y-3 py-2">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
        <User size={12} /> Parent / Guardian Information
      </p>

      <Field label="Full Name" required error={errors.parentName}>
        <input className={INPUT} value={values.parentName}
          onChange={e => onChange('parentName', e.target.value)} placeholder="Your full name" />
      </Field>

      <Field label="Relationship to Child" required error={errors.parentRelationship}>
        <select className={INPUT} value={values.parentRelationship} onChange={e => onChange('parentRelationship', e.target.value)}>
          <option value="">Select</option>
          <option value="father">Father</option>
          <option value="mother">Mother</option>
          <option value="guardian">Guardian</option>
        </select>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Phone Number" required error={errors.parentPhone}>
          <input type="tel" className={INPUT} value={values.parentPhone}
            onChange={e => onChange('parentPhone', e.target.value)} placeholder="08012345678" />
        </Field>
        <Field label="Alternative Phone">
          <input type="tel" className={INPUT} value={values.parentAltPhone}
            onChange={e => onChange('parentAltPhone', e.target.value)} placeholder="Optional" />
        </Field>
      </div>

      <Field label="Email Address" required error={errors.parentEmail}>
        <input type="email" className={INPUT} value={values.parentEmail}
          onChange={e => onChange('parentEmail', e.target.value)} placeholder="your@email.com" />
      </Field>

      <Field label="Home Address" required error={errors.parentAddress}>
        <input className={INPUT} value={values.parentAddress}
          onChange={e => onChange('parentAddress', e.target.value)} placeholder="Full residential address" />
      </Field>

      <Field label="Occupation (optional)">
        <input className={INPUT} value={values.parentOccupation}
          onChange={e => onChange('parentOccupation', e.target.value)} placeholder="e.g. Engineer, Teacher, Trader…" />
      </Field>

      {/* Emergency Contact */}
      <div className="pt-1">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-px flex-1 bg-gray-200" />
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1.5 whitespace-nowrap">
            <Heart size={11} className="text-red-400" /> Emergency Contact
          </p>
          <div className="h-px flex-1 bg-gray-200" />
        </div>
        <div className="space-y-3">
          <Field label="Emergency Contact Name" required error={errors.emergencyContactName}>
            <input className={INPUT} value={values.emergencyContactName}
              onChange={e => onChange('emergencyContactName', e.target.value)} placeholder="Full name of emergency contact" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Emergency Phone" required error={errors.emergencyContactPhone}>
              <input type="tel" className={INPUT} value={values.emergencyContactPhone}
                onChange={e => onChange('emergencyContactPhone', e.target.value)} placeholder="08012345678" />
            </Field>
            <Field label="Relationship">
              <select className={INPUT} value={values.emergencyContactRelationship}
                onChange={e => onChange('emergencyContactRelationship', e.target.value)}>
                <option value="">Select</option>
                <option value="spouse">Spouse</option>
                <option value="sibling">Sibling</option>
                <option value="uncle">Uncle</option>
                <option value="aunt">Aunt</option>
                <option value="grandparent">Grandparent</option>
                <option value="colleague">Colleague</option>
                <option value="friend">Friend</option>
                <option value="other">Other</option>
              </select>
            </Field>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Step 3: Review & Pay ──────────────────────────────────────────────────────
function StepReview({ school, child, parent, selectedClass, price }) {
  const dob = child.childDOB
    ? new Date(child.childDOB).toLocaleDateString('en-NG', { day:'numeric', month:'long', year:'numeric' })
    : '—';

  const Section = ({ title, rows }) => (
    <div className="rounded-xl border border-gray-200 overflow-hidden mb-3">
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{title}</p>
      </div>
      {rows.filter(r => r[1]).map(([label, value]) => (
        <div key={label} className="flex items-start justify-between px-4 py-2 border-b border-gray-100 last:border-0">
          <span className="text-xs text-gray-400 whitespace-nowrap shrink-0 w-32">{label}</span>
          <span className="text-xs font-semibold text-gray-800 text-right ml-2 break-words">{value}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-2 py-2">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
        <CreditCard size={12} /> Review & Confirm
      </p>

      <Section title="Admission" rows={[
        ['School',   school.name],
        ['Class',    selectedClass?.name || '—'],
        ['Session',  school.admission?.session || '—'],
      ]} />

      <Section title="Child's Information" rows={[
        ['Full Name',      `${child.childFirstName} ${child.childLastName}`],
        ['Date of Birth',  dob],
        ['Gender',         child.childGender],
        ['Nationality',    child.childNationality],
        ['State of Origin',child.childStateOfOrigin],
        ['Blood Group',    child.childBloodGroup],
        ['Religion',       child.childReligion],
        ['Medical Notes',  child.childMedicalConditions],
        ['Previous School',child.childPreviousSchool],
      ]} />

      <Section title="Parent / Guardian" rows={[
        ['Name',         parent.parentName],
        ['Relationship', parent.parentRelationship],
        ['Phone',        parent.parentPhone],
        ['Alt Phone',    parent.parentAltPhone],
        ['Email',        parent.parentEmail],
        ['Address',      parent.parentAddress],
        ['Occupation',   parent.parentOccupation],
      ]} />

      <Section title="Emergency Contact" rows={[
        ['Name',         parent.emergencyContactName],
        ['Phone',        parent.emergencyContactPhone],
        ['Relationship', parent.emergencyContactRelationship],
      ]} />

      {/* Payment summary */}
      <div className="rounded-xl overflow-hidden border border-emerald-200">
        <div className="bg-emerald-600 px-4 py-3 flex items-center justify-between">
          <span className="text-white font-bold text-sm">Application Fee</span>
          <span className="text-white font-black text-xl">₦{price.toLocaleString()}</span>
        </div>
        <div className="bg-emerald-50 px-4 py-2.5">
          <p className="text-emerald-800 text-xs">Secure payment via Paystack. Clicking Pay opens a secure payment window.</p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
        <p className="text-amber-800 text-xs leading-relaxed">
          <strong>Confirmation emails</strong> will be sent to your email and the school upon successful payment.
        </p>
      </div>
    </div>
  );
}

// ── Success Screen ─────────────────────────────────────────────────────────────
function SuccessScreen({ school, selectedClass, child, parent, onClose }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-10 text-center space-y-4 flex-1">
      <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
        <CheckCircle size={40} className="text-emerald-600" />
      </div>
      <div>
        <h3 className="text-xl font-extrabold text-gray-900">Application Submitted!</h3>
        <p className="text-sm text-gray-500 mt-2 max-w-xs">
          <strong>{child.childFirstName} {child.childLastName}</strong>'s application to{' '}
          <strong className="text-gray-700">{school.name}</strong>
          {selectedClass?.name && ` for ${selectedClass.name}`} has been received.
        </p>
      </div>
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-left w-full max-w-xs space-y-1">
        <p className="text-xs text-emerald-800 font-semibold mb-1">Confirmation emails sent to:</p>
        <p className="text-xs text-emerald-700">✓ {parent.parentEmail}</p>
        <p className="text-xs text-emerald-700">✓ School admissions office</p>
      </div>
      <p className="text-xs text-gray-400 max-w-xs">Track your application status in your <strong>Parent Dashboard</strong>.</p>
      <button onClick={onClose}
        className="mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-2.5 rounded-xl transition text-sm shadow-sm">
        Done
      </button>
    </div>
  );
}
