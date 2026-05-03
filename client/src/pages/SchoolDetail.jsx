import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin, Phone, Mail, Globe, ArrowLeft,
  CheckCircle, Building2, GraduationCap, DollarSign,
  Users, Calendar, Share2, BarChart3
} from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const FACILITY_ICONS = {
  Library: '📚', 'Science Lab': '🔬', 'Computer Lab': '💻', 'Sports Field': '⚽',
  'Swimming Pool': '🏊', Hostel: '🏠', Cafeteria: '🍽️', 'Chapel/Mosque': '🕌',
  'Art Studio': '🎨', 'Music Room': '🎵',
};

export default function SchoolDetail() {
  const { identifier } = useParams();
  const navigate = useNavigate();
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get(`/schools/${identifier}`);
        setSchool(data.school);
        // track profile view
        api.post(`/schools/${data.school._id}/view`).catch(() => {});
      } catch {
        toast.error('School not found');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [identifier]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: school.name, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleAddToCompare = () => {
    const existing = JSON.parse(sessionStorage.getItem('compareList') || '[]');
    if (existing.find((s) => s._id === school._id)) {
      toast('Already in compare list');
      navigate('/compare', { state: { schools: existing } });
      return;
    }
    if (existing.length >= 3) {
      toast.error('Compare list is full (max 3). Go to homepage to manage.');
      return;
    }
    const updated = [...existing, school];
    sessionStorage.setItem('compareList', JSON.stringify(updated));
    toast.success('Added to compare list!');
    if (updated.length >= 2) {
      navigate('/compare', { state: { schools: updated } });
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="animate-pulse space-y-6">
          <div className="h-72 bg-gray-100 rounded-2xl" />
          <div className="h-8 bg-gray-100 rounded w-1/2" />
          <div className="grid grid-cols-3 gap-4">
            {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!school) return null;

  const formatFee = (n) => n ? `₦${Number(n).toLocaleString()}` : 'Contact School';
  const heroImage = school.images?.[0] || null;

  return (
    <div className="bg-white min-h-screen">

      {/* ── HERO IMAGE ─────────────────────────────────────────── */}
      <div className="relative w-full h-72 md:h-96 bg-linear-to-br from-green-800 to-green-900 overflow-hidden">
        {heroImage ? (
          <img src={heroImage} alt={school.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <GraduationCap size={80} className="text-green-600 opacity-30" />
          </div>
        )}
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />

        {/* Back button */}
        <button onClick={() => navigate(-1)}
          className="absolute top-5 left-5 flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-white/30 transition">
          <ArrowLeft size={16} /> Back
        </button>

        {/* Featured badge */}
        {school.isFeatured && (
          <div className="absolute top-5 right-5 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full">
            ★ Featured School
          </div>
        )}

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-wrap gap-2 mb-2">
              <span className="text-xs bg-green-600 text-white px-2.5 py-0.5 rounded-full capitalize font-medium">{school.type}</span>
              <span className="text-xs bg-white/20 text-white px-2.5 py-0.5 rounded-full capitalize">{school.level} school</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold text-white drop-shadow-sm">{school.name}</h1>
            <div className="flex items-center gap-1.5 mt-1 text-white/80 text-sm">
              <MapPin size={14} />
              <span>{[school.address, school.city, school.state, school.country].filter(Boolean).join(', ')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── IMAGE THUMBNAILS (if multiple) ─────────────────────── */}
      {school.images?.length > 1 && (
        <div className="max-w-5xl mx-auto px-4 pt-4 flex gap-3 overflow-x-auto">
          {school.images.map((img, i) => (
            <button key={i} onClick={() => setActiveImage(i)}
              className={`w-20 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition ${activeImage === i ? 'border-green-600' : 'border-transparent'}`}>
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* ── MAIN CONTENT ──────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Left: Main Details */}
          <div className="lg:col-span-2 space-y-8">

            {/* Key Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: Building2, label: 'Type', value: school.type, color: 'text-green-700 bg-green-50' },
                { icon: GraduationCap, label: 'Level', value: school.level, color: 'text-blue-700 bg-blue-50' },
                { icon: Users, label: 'Country', value: school.country || 'Nigeria', color: 'text-purple-700 bg-purple-50' },
                { icon: Calendar, label: 'Status', value: 'Verified', color: 'text-emerald-700 bg-emerald-50' },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className={`${color} rounded-2xl p-4 text-center`}>
                  <Icon size={20} className="mx-auto mb-1.5 opacity-70" />
                  <p className="text-xs opacity-60 font-medium uppercase tracking-wider">{label}</p>
                  <p className="font-bold capitalize text-sm mt-0.5">{value}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            {school.description && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">About This School</h2>
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                  <p className="text-gray-600 leading-relaxed text-sm">{school.description}</p>
                </div>
              </div>
            )}

            {/* Curriculum */}
            {school.curriculum?.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">Curriculum Offered</h2>
                <div className="flex flex-wrap gap-2">
                  {school.curriculum.map((c) => (
                    <div key={c} className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 px-4 py-2 rounded-full text-sm font-semibold">
                      <CheckCircle size={14} className="text-green-600" /> {c}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Facilities */}
            {school.facilities?.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">Facilities &amp; Amenities</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {school.facilities.map((f) => (
                    <div key={f} className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
                      <span className="text-xl">{FACILITY_ICONS[f] || '✅'}</span>
                      <span className="text-sm text-gray-700 font-medium">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fees */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">School Fees</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign size={18} className="text-green-700" />
                    <span className="font-semibold text-green-800 text-sm">Annual Tuition</span>
                  </div>
                  <p className="text-2xl font-extrabold text-green-700">{formatFee(school.fees?.tuition)}</p>
                  <p className="text-green-600 text-xs mt-1">Per academic year</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 size={18} className="text-blue-700" />
                    <span className="font-semibold text-blue-800 text-sm">Boarding Fee</span>
                  </div>
                  <p className="text-2xl font-extrabold text-blue-700">
                    {school.fees?.boarding ? formatFee(school.fees.boarding) : 'Day School'}
                  </p>
                  <p className="text-blue-600 text-xs mt-1">
                    {school.fees?.boarding ? 'Per academic year' : 'No boarding available'}
                  </p>
                </div>
              </div>
              <p className="text-gray-400 text-xs mt-3">* Fees are indicative and subject to change. Contact the school to confirm current rates.</p>
            </div>

          </div>

          {/* Right: Sidebar */}
          <div className="space-y-5">

            {/* Action buttons */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-3">
              <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
              {school.contact?.phone && (
                <a href={`tel:${school.contact.phone}`}
                  className="flex items-center gap-3 bg-green-700 text-white px-4 py-3 rounded-xl font-semibold hover:bg-green-800 transition text-sm">
                  <Phone size={16} /> Call School
                </a>
              )}
              {school.contact?.email && (
                <a href={`mailto:${school.contact.email}`}
                  className="flex items-center gap-3 bg-gray-100 text-gray-700 px-4 py-3 rounded-xl font-semibold hover:bg-gray-200 transition text-sm">
                  <Mail size={16} /> Email School
                </a>
              )}
              <button onClick={handleAddToCompare}
                className="w-full flex items-center justify-center gap-2 border border-green-700 text-green-700 px-4 py-3 rounded-xl font-semibold hover:bg-green-50 transition text-sm">
                <BarChart3 size={16} /> Add to Compare
              </button>
              <button onClick={handleShare}
                className="w-full flex items-center justify-center gap-2 border border-gray-200 text-gray-600 px-4 py-3 rounded-xl font-semibold hover:bg-gray-50 transition text-sm">
                <Share2 size={16} /> Share School
              </button>
            </div>

            {/* Contact Info */}
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5">
              <h3 className="font-bold text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-3">
                {school.contact?.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                      <Phone size={14} className="text-green-700" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Phone</p>
                      <a href={`tel:${school.contact.phone}`} className="font-medium text-gray-800 hover:text-green-700">{school.contact.phone}</a>
                    </div>
                  </div>
                )}
                {school.contact?.email && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                      <Mail size={14} className="text-blue-700" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Email</p>
                      <a href={`mailto:${school.contact.email}`} className="font-medium text-gray-800 hover:text-blue-700 break-all">{school.contact.email}</a>
                    </div>
                  </div>
                )}
                {school.contact?.website && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                      <Globe size={14} className="text-purple-700" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Website</p>
                      <a href={school.contact.website} target="_blank" rel="noreferrer" className="font-medium text-gray-800 hover:text-purple-700 break-all">{school.contact.website}</a>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3 text-sm">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin size={14} className="text-orange-700" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Address</p>
                    <p className="font-medium text-gray-800">{[school.address, school.city, school.state].filter(Boolean).join(', ') || school.state}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Study Abroad CTA */}
            <div className="bg-linear-to-br from-green-700 to-green-800 rounded-2xl p-5 text-white">
              <GraduationCap size={24} className="text-green-300 mb-3" />
              <h4 className="font-bold mb-1">Want to study abroad?</h4>
              <p className="text-green-200 text-xs leading-relaxed mb-4">
                Our counsellors help Nigerian students get into top universities in the UK, Canada and more.
              </p>
              <Link to="/study-abroad"
                className="block text-center bg-white text-green-800 font-bold text-sm px-4 py-2.5 rounded-lg hover:bg-green-50 transition">
                Learn More →
              </Link>
            </div>
          </div>

        </div>

        {/* ── BACK TO SCHOOLS ─────────────────────────────────── */}
        <div className="mt-12 pt-8 border-t border-gray-100 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-sm text-gray-500 hover:text-green-700 transition font-medium">
            <ArrowLeft size={16} /> Browse All Schools
          </Link>
          <button onClick={handleAddToCompare}
            className="flex items-center gap-2 bg-green-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-green-800 transition">
            <BarChart3 size={15} /> Compare This School
          </button>
        </div>
      </div>
    </div>
  );
}
