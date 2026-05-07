import { useState, useEffect, useCallback, useRef } from 'react';
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
    <div
      className="relative rounded-2xl sm:rounded-3xl overflow-hidden shrink-0 shadow-xl select-none w-full"
      style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}
    >
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '18px 18px' }} />

      <div className="relative p-4 sm:p-5">
        <div className="text-center mb-3 sm:mb-4">
          <p className="text-green-400 font-extrabold text-[10px] sm:text-xs uppercase tracking-widest line-clamp-1">{schoolName}</p>
          <p className="text-white/50 text-[9px] sm:text-[10px] tracking-wider">A Tradition of Excellence</p>
        </div>

        <div className="flex items-start gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-white/60 text-[10px] sm:text-xs font-bold uppercase tracking-wider">{report.year} JAMB</p>
            <p className="text-green-400 font-extrabold text-xs sm:text-sm uppercase leading-tight">Top Scorer</p>
            <p className="text-white font-black text-5xl sm:text-6xl leading-none mt-1">{report.total}</p>
            <div className="mt-2 sm:mt-3 flex flex-wrap gap-x-2 sm:gap-x-3 gap-y-1">
              {report.subjects?.map((s) => (
                <div key={s.subject} className="text-center">
                  <p className="text-white/50 text-[9px] uppercase font-bold">{s.subject.slice(0, 4)}</p>
                  <p className="text-yellow-300 font-extrabold text-xs sm:text-sm">{s.score}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="shrink-0">
            {report.photo ? (
              <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-xl sm:rounded-2xl overflow-hidden border-2 border-yellow-400 shadow-lg">
                <img src={report.photo} alt={report.studentName} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-xl sm:rounded-2xl bg-white/10 border-2 border-yellow-400/50 flex items-center justify-center">
                <GraduationCap size={28} className="text-white/30" />
              </div>
            )}
          </div>
        </div>

        <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-white/10 text-center">
          <p className="text-white font-extrabold text-sm sm:text-base leading-tight">{report.studentName}</p>
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
    <div
      className="relative rounded-2xl sm:rounded-3xl overflow-hidden shrink-0 shadow-xl select-none w-full"
      style={{ background: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)' }}
    >
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '18px 18px' }} />

      <div className="relative p-4 sm:p-5">
        <div className="text-center mb-3 sm:mb-4">
          <p className="text-yellow-400 font-extrabold text-[10px] sm:text-xs uppercase tracking-widest line-clamp-1">{schoolName}</p>
          <p className="text-white/50 text-[9px] sm:text-[10px] tracking-wider">Outstanding WAEC Result</p>
        </div>

        <div className="flex items-start gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-white/60 text-[10px] sm:text-xs font-bold uppercase tracking-wider">{report.year} WAEC</p>
            <p className="text-yellow-400 font-extrabold text-xs sm:text-sm uppercase leading-tight">Top Student</p>
            <div className="mt-2 sm:mt-3 space-y-1">
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

          <div className="shrink-0">
            {report.photo ? (
              <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-xl sm:rounded-2xl overflow-hidden border-2 border-yellow-400 shadow-lg">
                <img src={report.photo} alt={report.studentName} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-xl sm:rounded-2xl bg-white/10 border-2 border-yellow-400/50 flex items-center justify-center">
                <GraduationCap size={28} className="text-white/30" />
              </div>
            )}
          </div>
        </div>

        <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-white/10 text-center">
          <p className="text-white font-extrabold text-sm sm:text-base leading-tight">{report.studentName}</p>
        </div>
      </div>
    </div>
  );
}

// ── Report Slideshow — 2 cards on desktop, 1 on mobile, 3s auto-advance ────────
function ReportSlideshow({ items, renderCard }) {
  const count = items.length;
  // How many cards are visible at once: 2 on md+, 1 on mobile
  const [visible, setVisible] = useState(() => window.matchMedia('(min-width: 768px)').matches ? 2 : 1);
  const [idx, setIdx] = useState(0);

  // Track breakpoint changes
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const handler = (e) => {
      setVisible(e.matches ? 2 : 1);
      setIdx(0);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Max starting index so we never show empty slots
  const maxIdx = Math.max(0, count - visible);

  // Auto-advance every 3 seconds
  useEffect(() => {
    if (count <= visible) return;
    const t = setInterval(() => setIdx((i) => (i >= maxIdx ? 0 : i + 1)), 3000);
    return () => clearInterval(t);
  }, [count, visible, maxIdx]);

  const prev = () => setIdx((i) => Math.max(0, i - 1));
  const next = () => setIdx((i) => Math.min(maxIdx, i + 1));

  // Number of dot positions
  const dots = maxIdx + 1;

  return (
    <div className="relative overflow-hidden">
      {/* Sliding track */}
      <div
        className="flex gap-3 sm:gap-4 transition-transform duration-500 ease-out"
        style={{ transform: `translateX(calc(-${idx} * (${visible === 2 ? '50%' : '100%'} + ${visible === 2 ? '0.75rem' : '0rem'})))` }}
      >
        {items.map((item, i) => (
          <div
            key={i}
            className="shrink-0"
            style={{ width: visible === 2 ? 'calc(50% - 0.375rem)' : '100%' }}
          >
            {renderCard(item)}
          </div>
        ))}
      </div>

      {dots > 1 && (
        <div className="flex items-center justify-between mt-3">
          <div className="flex gap-1.5">
            {Array.from({ length: dots }).map((_, i) => (
              <button key={i} onClick={() => setIdx(i)}
                className={`rounded-full transition-all ${i === idx ? 'w-6 h-2 bg-green-600' : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'}`} />
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={prev} disabled={idx === 0}
              className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition disabled:opacity-30">
              <ChevronLeft size={14} className="text-gray-600" />
            </button>
            <button onClick={next} disabled={idx >= maxIdx}
              className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition disabled:opacity-30">
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

  useEffect(() => {
    const total = school?.images?.length ?? 0;
    if (total <= 1) return;
    const t = setInterval(() => setActiveImage((i) => (i + 1) % total), 10000);
    return () => clearInterval(t);
  }, [school?.images?.length]);

  const prevImage = useCallback(() => {
    setActiveImage((i) => (i - 1 + (school?.images?.length ?? 1)) % (school?.images?.length ?? 1));
  }, [school?.images?.length]);

  const nextImage = useCallback(() => {
    setActiveImage((i) => (i + 1) % (school?.images?.length ?? 1));
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
    if (existing.find((s) => s._id === school._id)) {
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
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="animate-pulse space-y-5">
          <div className="h-[40vh] bg-gray-100 rounded-2xl" />
          <div className="h-6 bg-gray-100 rounded w-2/3" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-20 bg-gray-100 rounded-xl" />)}
          </div>
          <div className="h-28 bg-gray-100 rounded-xl" />
          <div className="h-28 bg-gray-100 rounded-xl" />
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

      {/* ── GALLERY ───────────────────────────────────────────────── */}
      <div
        className="relative w-full bg-black overflow-hidden"
        style={{ height: images.length ? 'clamp(220px, 42vw, 50vh)' : '18rem' }}
      >
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
          <div className="w-full h-full bg-gradient-to-br from-green-800 to-green-900 flex items-center justify-center">
            <GraduationCap size={64} className="text-green-600 opacity-30" />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent pointer-events-none" />

        {/* Nav arrows */}
        {images.length > 1 && (
          <>
            <button onClick={prevImage}
              className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition shadow-lg z-10">
              <ChevronLeft size={18} />
            </button>
            <button onClick={nextImage}
              className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition shadow-lg z-10">
              <ChevronRight size={18} />
            </button>
            <div className="absolute bottom-[4.5rem] sm:bottom-20 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {images.map((_, i) => (
                <button key={i} onClick={() => setActiveImage(i)}
                  className={`rounded-full transition-all ${i === activeImage ? 'w-5 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/80'}`} />
              ))}
            </div>
          </>
        )}

        {/* Back button */}
        <button onClick={() => navigate(-1)}
          className="absolute top-4 left-4 flex items-center gap-1.5 bg-black/35 backdrop-blur-sm text-white text-sm font-medium px-3 py-2 rounded-full hover:bg-black/50 transition z-10">
          <ArrowLeft size={15} /> <span className="hidden sm:inline">Back</span>
        </button>

        {school.isFeatured && (
          <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 text-[11px] font-bold px-2.5 py-1 rounded-full z-10">
            ★ Featured
          </div>
        )}

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 pb-4 sm:pb-6 z-10">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-wrap gap-1.5 mb-1.5">
              <span className="text-[11px] bg-green-600 text-white px-2 py-0.5 rounded-full capitalize font-medium">{school.type}</span>
              <span className="text-[11px] bg-white/20 text-white px-2 py-0.5 rounded-full capitalize">{school.level} school</span>
            </div>
            <h1 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-white drop-shadow leading-tight">{school.name}</h1>
            <p className="flex items-center gap-1 mt-1 text-white/75 text-xs sm:text-sm line-clamp-1">
              <MapPin size={12} className="shrink-0" />
              {[school.address, school.city, school.state, school.country].filter(Boolean).join(', ')}
            </p>
          </div>
        </div>
      </div>

      {/* ── THUMBNAIL STRIP ───────────────────────────────────────── */}
      {images.length > 1 && (
        <div className="bg-gray-950 border-b border-gray-800">
          <div className="max-w-5xl mx-auto px-3 sm:px-4 py-2">
            <div className="flex gap-1.5 sm:gap-2 overflow-x-auto scrollbar-hide">
              {images.map((src, i) => {
                const isVid = isYoutube(src);
                const thumb = isVid ? getYoutubeThumbnail(src) : src;
                return (
                  <button key={i} onClick={() => setActiveImage(i)}
                    className={`relative shrink-0 rounded-lg overflow-hidden border-2 transition-all
                      w-14 h-10 sm:w-20 sm:h-14
                      ${i === activeImage
                        ? 'border-green-500 opacity-100 ring-1 ring-green-400'
                        : 'border-transparent opacity-50 hover:opacity-85'}`}>
                    <img src={thumb || ''} alt="" className="w-full h-full object-cover" />
                    {isVid && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Play size={12} className="text-white fill-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── MOBILE STICKY QUICK ACTIONS (hidden on lg) ────────────── */}
      <div className="lg:hidden sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-3 py-2.5 flex gap-2 overflow-x-auto scrollbar-hide">
          {school.contact?.phone && (
            <a href={`tel:${school.contact.phone}`}
              className="flex items-center gap-1.5 bg-green-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 hover:bg-green-800 active:scale-95 transition">
              <Phone size={13} /> Call
            </a>
          )}
          {school.contact?.email && (
            <a href={`mailto:${school.contact.email}`}
              className="flex items-center gap-1.5 bg-gray-100 text-gray-700 px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 hover:bg-gray-200 active:scale-95 transition">
              <Mail size={13} /> Email
            </a>
          )}
          <button onClick={handleAddToCompare}
            className="flex items-center gap-1.5 border border-green-700 text-green-700 px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 hover:bg-green-50 active:scale-95 transition">
            <BarChart3 size={13} /> Compare
          </button>
          <button onClick={handleShare}
            className="flex items-center gap-1.5 border border-gray-200 text-gray-600 px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 hover:bg-gray-50 active:scale-95 transition">
            <Share2 size={13} /> Share
          </button>
          {school.contact?.website && (
            <a href={school.contact.website} target="_blank" rel="noreferrer"
              className="flex items-center gap-1.5 border border-gray-200 text-gray-600 px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 hover:bg-gray-50 active:scale-95 transition">
              <Globe size={13} /> Website
            </a>
          )}
        </div>
      </div>

      {/* ── LIGHTBOX ──────────────────────────────────────────────── */}
      {lightboxOpen && currentMedia && !isYoutube(currentMedia) && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}>
          <button className="absolute top-4 right-4 text-white/70 hover:text-white transition">
            <X size={26} />
          </button>
          <img src={currentMedia} alt="" className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl" />
        </div>
      )}

      {/* ── MAIN CONTENT ──────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 py-6 md:py-8">
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">

          {/* ── Left: Main Details ── */}
          <div className="lg:col-span-2 space-y-7">

            {/* Key Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: Building2,     label: 'Type',    value: school.type,                color: 'text-green-700 bg-green-50'    },
                { icon: GraduationCap, label: 'Level',   value: school.level,               color: 'text-blue-700 bg-blue-50'      },
                { icon: Users,         label: 'Country', value: school.country || 'Nigeria', color: 'text-purple-700 bg-purple-50'  },
                { icon: Calendar,      label: 'Status',  value: 'Verified',                 color: 'text-emerald-700 bg-emerald-50' },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className={`${color} rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center`}>
                  <Icon size={18} className="mx-auto mb-1 opacity-70" />
                  <p className="text-[10px] opacity-60 font-medium uppercase tracking-wider">{label}</p>
                  <p className="font-bold capitalize text-xs sm:text-sm mt-0.5 leading-tight">{value}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            {school.description && (
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2.5">About This School</h2>
                <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-gray-100">
                  <p className="text-gray-600 leading-relaxed text-sm">{school.description}</p>
                </div>
              </div>
            )}

            {/* Curriculum */}
            {school.curriculum?.length > 0 && (
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2.5">Curriculum Offered</h2>
                <div className="flex flex-wrap gap-2">
                  {school.curriculum.map((c) => (
                    <div key={c} className="flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-800 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold">
                      <CheckCircle size={13} className="text-green-600" /> {c}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Achievements */}
            {school.achievements?.length > 0 && (
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2.5">Achievements &amp; Awards</h2>
                <div className="grid sm:grid-cols-2 gap-2.5 sm:gap-3">
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
                      <div key={i} className="flex gap-3 bg-amber-50 border border-amber-100 rounded-xl p-3.5 sm:p-4">
                        <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                          <Award size={15} className="text-amber-600" />
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

            {/* JAMB Top Scorers */}
            {school.jambReports?.length > 0 && (
              <div>
                <div className="flex items-center gap-2.5 mb-3 sm:mb-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                    <GraduationCap size={15} className="text-blue-700" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">JAMB Top Scorers</h2>
                    <p className="text-xs text-gray-400">Our best JAMB results — verified by the school</p>
                  </div>
                </div>
                <ReportSlideshow
                  items={school.jambReports}
                  renderCard={(r) => <JambCard report={r} schoolName={school.name} />}
                />
              </div>
            )}

            {/* WAEC Outstanding Results */}
            {school.waecReports?.length > 0 && (
              <div>
                <div className="flex items-center gap-2.5 mb-3 sm:mb-4">
                  <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                    <Award size={15} className="text-green-700" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">WAEC Outstanding Results</h2>
                    <p className="text-xs text-gray-400">Top WAEC performers from this school</p>
                  </div>
                </div>
                <ReportSlideshow
                  items={school.waecReports}
                  renderCard={(r) => <WaecCard report={r} schoolName={school.name} />}
                />
              </div>
            )}

            {/* Facilities */}
            {school.facilities?.length > 0 && (
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2.5">Facilities &amp; Amenities</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                  {school.facilities.map((f) => (
                    <div key={f} className="flex items-center gap-2.5 bg-gray-50 border border-gray-100 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3">
                      {FACILITY_ICONS[f]
                        ? <span className="text-lg sm:text-xl">{FACILITY_ICONS[f]}</span>
                        : <CheckCircle size={16} className="text-green-600 shrink-0" />}
                      <span className="text-xs sm:text-sm text-gray-700 font-medium leading-snug">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fees */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2.5">School Fees</h2>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-green-50 border border-green-200 rounded-xl sm:rounded-2xl p-4 sm:p-5">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <DollarSign size={16} className="text-green-700" />
                    <span className="font-semibold text-green-800 text-xs sm:text-sm">Annual Tuition</span>
                  </div>
                  <p className="text-xl sm:text-2xl font-extrabold text-green-700">{formatFee(school.fees?.tuition)}</p>
                  <p className="text-green-600 text-[11px] mt-1">Per academic year</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl sm:rounded-2xl p-4 sm:p-5">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Building2 size={16} className="text-blue-700" />
                    <span className="font-semibold text-blue-800 text-xs sm:text-sm">Boarding Fee</span>
                  </div>
                  <p className="text-xl sm:text-2xl font-extrabold text-blue-700">
                    {school.fees?.boarding ? formatFee(school.fees.boarding) : 'Day School'}
                  </p>
                  <p className="text-blue-600 text-[11px] mt-1">
                    {school.fees?.boarding ? 'Per academic year' : 'No boarding available'}
                  </p>
                </div>
              </div>
              <p className="text-gray-400 text-xs mt-2.5">* Fees are indicative. Contact the school to confirm current rates.</p>
            </div>

            {/* Mobile Contact Info (inline, hidden on lg) */}
            <div className="lg:hidden space-y-4 pt-1">
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 sm:p-5">
                <h3 className="font-bold text-gray-900 mb-3 text-sm">Contact Information</h3>
                <div className="space-y-2.5">
                  {school.contact?.phone && (
                    <a href={`tel:${school.contact.phone}`} className="flex items-center gap-3 text-sm hover:text-green-700 transition">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                        <Phone size={13} className="text-green-700" />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400">Phone</p>
                        <p className="font-medium text-gray-800 text-sm">{school.contact.phone}</p>
                      </div>
                    </a>
                  )}
                  {school.contact?.email && (
                    <a href={`mailto:${school.contact.email}`} className="flex items-center gap-3 text-sm hover:text-blue-700 transition">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                        <Mail size={13} className="text-blue-700" />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400">Email</p>
                        <p className="font-medium text-gray-800 text-sm break-all">{school.contact.email}</p>
                      </div>
                    </a>
                  )}
                  {school.contact?.website && (
                    <a href={school.contact.website} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm hover:text-purple-700 transition">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                        <Globe size={13} className="text-purple-700" />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400">Website</p>
                        <p className="font-medium text-gray-800 text-sm break-all">{school.contact.website}</p>
                      </div>
                    </a>
                  )}
                  <div className="flex items-start gap-3 text-sm">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin size={13} className="text-orange-700" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400">Address</p>
                      <p className="font-medium text-gray-800 text-sm">{[school.address, school.city, school.state].filter(Boolean).join(', ') || school.state}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Study Abroad CTA */}
              <div className="bg-gradient-to-br from-green-700 to-green-800 rounded-2xl p-4 sm:p-5 text-white">
                <GraduationCap size={22} className="text-green-300 mb-2" />
                <h4 className="font-bold text-sm mb-1">Want to study abroad?</h4>
                <p className="text-green-200 text-xs mb-3 leading-relaxed">
                  Our counsellors can help you get into top universities in the UK, Canada, USA and more.
                </p>
                <Link to="/study-abroad"
                  className="block text-center bg-white text-green-800 font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-green-50 transition">
                  Explore Study Abroad →
                </Link>
              </div>
            </div>

          </div>

          {/* ── Sidebar (desktop only) ── */}
          <div className="hidden lg:block space-y-5">

            {/* Quick Actions */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-2.5">
              <h3 className="font-bold text-gray-900 mb-1">Quick Actions</h3>
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

            {/* Contact Information */}
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
