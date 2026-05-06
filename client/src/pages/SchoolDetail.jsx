import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin, Phone, Mail, Globe, ArrowLeft,
  CheckCircle, Building2, GraduationCap, DollarSign,
  Users, Calendar, Share2, BarChart3, Award,
  ChevronLeft, ChevronRight, Play, X
} from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const FACILITY_ICONS = {
  Library: '📚', 'Science Lab': '🔬', 'Computer Lab': '💻', 'Sports Field': '⚽',
  'Swimming Pool': '🏊', Hostel: '🏠', Cafeteria: '🍽️', 'Chapel/Mosque': '🕌',
  'Art Studio': '🎨', 'Music Room': '🎵',
};

// ── Video helpers ─────────────────────────────────────────────────────────────
const isYoutube = (url) => url && (url.includes('youtube.com') || url.includes('youtu.be'));
const getYoutubeId = (url) => {
  const m = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/);
  return m?.[1];
};
const getYoutubeEmbed = (url) => {
  const id = getYoutubeId(url);
  return id ? `https://www.youtube.com/embed/${id}?rel=0` : url;
};
const getYoutubeThumbnail = (url) => {
  const id = getYoutubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null;
};

// ── JAMB Report Card ──────────────────────────────────────────────────────────
function JambCard({ report, schoolName }) {
  return (
    <div className="relative rounded-3xl overflow-hidden shrink-0 w-72 shadow-xl select-none"
      style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
      {/* Dot pattern overlay */}
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '18px 18px' }} />

      <div className="relative p-5">
        {/* School name header */}
        <div className="text-center mb-4">
          <p className="text-green-400 font-extrabold text-xs uppercase tracking-widest">{schoolName}</p>
          <p className="text-white/50 text-[10px] tracking-wider">A Tradition of Excellence</p>
        </div>

        <div className="flex items-start gap-4">
          {/* Left: scores */}
          <div className="flex-1">
            <p className="text-white/60 text-xs font-bold uppercase tracking-wider">{report.year} JAMB</p>
            <p className="text-green-400 font-extrabold text-sm uppercase leading-tight">Top Scorer</p>
            <p className="text-white font-black text-6xl leading-none mt-1">{report.total}</p>

            {/* Subject scores */}
            <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1">
              {report.subjects?.map((s) => (
                <div key={s.subject} className="text-center">
                  <p className="text-white/50 text-[9px] uppercase font-bold">{s.subject.slice(0, 4)}</p>
                  <p className="text-yellow-300 font-extrabold text-sm">{s.score}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: photo */}
          <div className="shrink-0">
            {report.photo ? (
              <div className="w-24 h-28 rounded-2xl overflow-hidden border-2 border-yellow-400 shadow-lg">
                <img src={report.photo} alt={report.studentName} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-24 h-28 rounded-2xl bg-white/10 border-2 border-yellow-400/50 flex items-center justify-center">
                <GraduationCap size={32} className="text-white/30" />
              </div>
            )}
          </div>
        </div>

        {/* Student name footer */}
        <div className="mt-4 pt-3 border-t border-white/10 text-center">
          <p className="text-white font-extrabold text-base leading-tight">{report.studentName}</p>
        </div>
      </div>
    </div>
  );
}

// ── WAEC Report Card ──────────────────────────────────────────────────────────
function WaecCard({ report, schoolName }) {
  const gradeColor = (g) => {
    if (!g) return 'text-gray-400';
    if (g === 'A1') return 'text-green-400 font-black';
    if (g === 'B2' || g === 'B3') return 'text-blue-300 font-bold';
    if (g.startsWith('C')) return 'text-yellow-300 font-semibold';
    if (g.startsWith('D') || g.startsWith('E')) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="relative rounded-3xl overflow-hidden shrink-0 w-72 shadow-xl select-none"
      style={{ background: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)' }}>
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '18px 18px' }} />

      <div className="relative p-5">
        <div className="text-center mb-4">
          <p className="text-yellow-400 font-extrabold text-xs uppercase tracking-widest">{schoolName}</p>
          <p className="text-white/50 text-[10px] tracking-wider">Outstanding WAEC Result</p>
        </div>

        <div className="flex items-start gap-4">
          {/* Left */}
          <div className="flex-1">
            <p className="text-white/60 text-xs font-bold uppercase tracking-wider">{report.year} WAEC</p>
            <p className="text-yellow-400 font-extrabold text-sm uppercase leading-tight">Top Student</p>

            {/* Grades list */}
            <div className="mt-3 space-y-1">
              {report.grades?.slice(0, 6).map((g) => (
                <div key={g.subject} className="flex items-center justify-between gap-2">
                  <p className="text-white/70 text-[10px] font-medium truncate">{g.subject}</p>
                  <p className={`text-xs ${gradeColor(g.grade)}`}>{g.grade}</p>
                </div>
              ))}
              {report.grades?.length > 6 && (
                <p className="text-white/40 text-[10px]">+{report.grades.length - 6} more subjects</p>
              )}
            </div>
          </div>

          {/* Right: photo */}
          <div className="shrink-0">
            {report.photo ? (
              <div className="w-24 h-28 rounded-2xl overflow-hidden border-2 border-yellow-400 shadow-lg">
                <img src={report.photo} alt={report.studentName} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-24 h-28 rounded-2xl bg-white/10 border-2 border-yellow-400/50 flex items-center justify-center">
                <GraduationCap size={32} className="text-white/30" />
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/10 text-center">
          <p className="text-white font-extrabold text-base leading-tight">{report.studentName}</p>
        </div>
      </div>
    </div>
  );
}

// ── Report Slideshow Wrapper ──────────────────────────────────────────────────
function ReportSlideshow({ children, count }) {
  const [idx, setIdx] = useState(0);
  const total = count;

  useEffect(() => {
    if (total <= 1) return;
    const t = setInterval(() => setIdx(i => (i + 1) % total), 5000);
    return () => clearInterval(t);
  }, [total]);

  const prev = () => setIdx(i => (i - 1 + total) % total);
  const next = () => setIdx(i => (i + 1) % total);

  return (
    <div className="relative">
      {/* Sliding window */}
      <div className="overflow-hidden">
        <div className="flex gap-4 transition-transform duration-500 ease-out"
          style={{ transform: `translateX(calc(-${idx} * (288px + 16px)))` }}>
          {children}
        </div>
      </div>

      {total > 1 && (
        <div className="flex items-center justify-between mt-4">
          {/* Dots */}
          <div className="flex gap-1.5">
            {Array.from({ length: total }).map((_, i) => (
              <button key={i} onClick={() => setIdx(i)}
                className={`rounded-full transition-all ${i === idx ? 'w-6 h-2 bg-green-600' : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'}`} />
            ))}
          </div>
          {/* Arrows */}
          <div className="flex gap-2">
            <button onClick={prev}
              className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition">
              <ChevronLeft size={14} className="text-gray-600" />
            </button>
            <button onClick={next}
              className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition">
              <ChevronRight size={14} className="text-gray-600" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function SchoolDetail() {
  const { identifier } = useParams();
  const navigate = useNavigate();
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    const fetchSchool = async () => {
      try {
        const { data } = await api.get(`/schools/${identifier}`);
        setSchool(data.school);
        api.post(`/schools/${data.school._id}/view`).catch(() => {});
      } catch {
        toast.error('School not found');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchSchool();
  }, [identifier]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-slideshow every 10 seconds
  useEffect(() => {
    const total = school?.images?.length ?? 0;
    if (total <= 1) return;
    const t = setInterval(() => setActiveImage(i => (i + 1) % total), 10000);
    return () => clearInterval(t);
  }, [school?.images?.length]);

  const prevImage = useCallback(() => {
    setActiveImage(i => (i - 1 + (school?.images?.length ?? 1)) % (school?.images?.length ?? 1));
  }, [school?.images?.length]);

  const nextImage = useCallback(() => {
    setActiveImage(i => (i + 1) % (school?.images?.length ?? 1));
  }, [school?.images?.length]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: school.name, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied!');
    }
  };

  const handleAddToCompare = () => {
    const existing = JSON.parse(sessionStorage.getItem('compareList') || '[]');
    if (existing.find(s => s._id === school._id)) {
      toast('Already in compare list');
      navigate('/compare', { state: { schools: existing } });
      return;
    }
    if (existing.length >= 3) { toast.error('Compare list full (max 3).'); return; }
    const updated = [...existing, school];
    sessionStorage.setItem('compareList', JSON.stringify(updated));
    toast.success('Added to compare list!');
    if (updated.length >= 2) navigate('/compare', { state: { schools: updated } });
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="animate-pulse space-y-6">
          <div className="h-72 bg-gray-100 rounded-2xl" />
          <div className="h-8 bg-gray-100 rounded w-1/2" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!school) return null;

  const formatFee = (n) => n ? `₦${Number(n).toLocaleString()}` : 'Contact School';
  const images = school.images || [];
  const currentMedia = images[activeImage] || null;

  return (
    <div className="bg-white min-h-screen">

      {/* ── GALLERY ─────────────────────────────────────────────── */}
      <div className="relative w-full bg-black" style={{ height: images.length ? '50vh' : '18rem' }}>
        {currentMedia ? (
          isYoutube(currentMedia) ? (
            <iframe
              src={getYoutubeEmbed(currentMedia)}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={school.name}
            />
          ) : (
            <img
              src={currentMedia}
              alt={school.name}
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => setLightboxOpen(true)}
            />
          )
        ) : (
          <div className="w-full h-72 md:h-96 bg-gradient-to-br from-green-800 to-green-900 flex items-center justify-center">
            <GraduationCap size={80} className="text-green-600 opacity-30" />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent pointer-events-none" />

        {/* Nav arrows */}
        {images.length > 1 && (
          <>
            <button onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition shadow-lg z-10">
              <ChevronLeft size={20} />
            </button>
            <button onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition shadow-lg z-10">
              <ChevronRight size={20} />
            </button>
            {/* Dot indicators */}
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {images.map((_, i) => (
                <button key={i} onClick={() => setActiveImage(i)}
                  className={`rounded-full transition-all ${i === activeImage ? 'w-5 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/80'}`} />
              ))}
            </div>
          </>
        )}

        {/* Back button */}
        <button onClick={() => navigate(-1)}
          className="absolute top-5 left-5 flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-white/30 transition z-10">
          <ArrowLeft size={16} /> Back
        </button>

        {school.isFeatured && (
          <div className="absolute top-5 right-5 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full z-10">
            ★ Featured School
          </div>
        )}

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8 z-10">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-wrap gap-2 mb-2">
              <span className="text-xs bg-green-600 text-white px-2.5 py-0.5 rounded-full capitalize font-medium">{school.type}</span>
              <span className="text-xs bg-white/20 text-white px-2.5 py-0.5 rounded-full capitalize">{school.level} school</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold text-white drop-shadow">{school.name}</h1>
            <div className="flex items-center gap-1.5 mt-1 text-white/80 text-sm">
              <MapPin size={14} />
              <span>{[school.address, school.city, school.state, school.country].filter(Boolean).join(', ')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── THUMBNAIL STRIP ─────────────────────────────────────── */}
      {images.length > 1 && (
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {images.map((src, i) => {
              const isVid = isYoutube(src);
              const thumb = isVid ? getYoutubeThumbnail(src) : src;
              return (
                <button key={i} onClick={() => setActiveImage(i)}
                  className={`relative w-24 h-16 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                    i === activeImage
                      ? 'border-green-500 shadow-md opacity-100 ring-2 ring-green-200'
                      : 'border-transparent opacity-55 hover:opacity-90'
                  }`}>
                  <img src={thumb || ''} alt="" className="w-full h-full object-cover" />
                  {isVid && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Play size={16} className="text-white fill-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── LIGHTBOX ────────────────────────────────────────────── */}
      {lightboxOpen && currentMedia && !isYoutube(currentMedia) && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}>
          <button className="absolute top-5 right-5 text-white/70 hover:text-white transition">
            <X size={28} />
          </button>
          <img src={currentMedia} alt="" className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl" />
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
                { icon: Building2,    label: 'Type',    value: school.type,                color: 'text-green-700 bg-green-50'   },
                { icon: GraduationCap,label: 'Level',   value: school.level,               color: 'text-blue-700 bg-blue-50'     },
                { icon: Users,        label: 'Country', value: school.country || 'Nigeria', color: 'text-purple-700 bg-purple-50' },
                { icon: Calendar,     label: 'Status',  value: 'Verified',                 color: 'text-emerald-700 bg-emerald-50'},
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

            {/* Achievements */}
            {school.achievements?.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">Achievements &amp; Awards</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {school.achievements.map((ach, i) => {
                    const catColors = {
                      academic: 'bg-blue-100 text-blue-800',
                      sports: 'bg-green-100 text-green-800',
                      arts: 'bg-purple-100 text-purple-800',
                      community: 'bg-orange-100 text-orange-800',
                      award: 'bg-yellow-100 text-yellow-800',
                    };
                    const catColor = catColors[ach.category] || 'bg-gray-100 text-gray-700';
                    return (
                      <div key={i} className="flex gap-3 bg-amber-50 border border-amber-100 rounded-xl p-4">
                        <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                          <Award size={17} className="text-amber-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 mb-1">
                            <p className="font-bold text-gray-900 text-sm leading-snug">{ach.title}</p>
                            {ach.year && (
                              <span className="text-[10px] text-gray-500 bg-white border border-gray-200 px-1.5 py-0.5 rounded-full">{ach.year}</span>
                            )}
                          </div>
                          {ach.category && (
                            <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mb-1.5 capitalize ${catColor}`}>
                              {ach.category === 'arts' ? 'Arts & Culture' : ach.category}
                            </span>
                          )}
                          {ach.description && (
                            <p className="text-gray-500 text-xs leading-relaxed">{ach.description}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── JAMB TOP SCORERS SLIDESHOW ── */}
            {school.jambReports?.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                    <GraduationCap size={16} className="text-blue-700" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">JAMB Top Scorers</h2>
                    <p className="text-xs text-gray-400">Our best JAMB results — verified by the school</p>
                  </div>
                </div>
                <ReportSlideshow count={school.jambReports.length}>
                  {school.jambReports.map((r) => (
                    <JambCard key={r.id || r.studentName} report={r} schoolName={school.name} />
                  ))}
                </ReportSlideshow>
              </div>
            )}

            {/* ── WAEC TOP STUDENTS SLIDESHOW ── */}
            {school.waecReports?.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                    <Award size={16} className="text-green-700" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">WAEC Outstanding Results</h2>
                    <p className="text-xs text-gray-400">Top WAEC performers from this school</p>
                  </div>
                </div>
                <ReportSlideshow count={school.waecReports.length}>
                  {school.waecReports.map((r) => (
                    <WaecCard key={r.id || r.studentName} report={r} schoolName={school.name} />
                  ))}
                </ReportSlideshow>
              </div>
            )}

            {/* Facilities */}
            {school.facilities?.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">Facilities &amp; Amenities</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {school.facilities.map((f) => (
                    <div key={f} className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
                      {FACILITY_ICONS[f]
                        ? <span className="text-xl">{FACILITY_ICONS[f]}</span>
                        : <CheckCircle size={18} className="text-green-600 shrink-0" />}
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
              <p className="text-gray-400 text-xs mt-3">* Fees are indicative. Contact the school to confirm current rates.</p>
            </div>

          </div>

          {/* Right: Sidebar */}
          <div className="space-y-5">
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
            <div className="bg-gradient-to-br from-green-700 to-green-800 rounded-2xl p-5 text-white">
              <GraduationCap size={24} className="text-green-300 mb-3" />
              <h4 className="font-bold text-base mb-1">Want to study abroad?</h4>
              <p className="text-green-200 text-xs mb-4 leading-relaxed">
                Our counsellors can help you get into top universities in the UK, Canada, USA and more.
              </p>
              <Link to="/study-abroad"
                className="block text-center bg-white text-green-800 font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-green-50 transition">
                Explore Study Abroad →
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
