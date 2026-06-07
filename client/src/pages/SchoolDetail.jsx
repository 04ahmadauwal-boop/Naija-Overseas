import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin, Phone, Mail, Globe, ArrowLeft,
  CheckCircle, Building2, GraduationCap, DollarSign,
  Users, Calendar, Share2, BarChart3, Award,
  ChevronLeft, ChevronRight, Play, X, Star, MessageSquare, Trash2, UserCog
} from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const SECTION_LINKS = [
  { label: 'About',      id: 'sd-about'     },
  { label: 'Gallery',    id: 'sd-gallery'   },
  { label: 'Videos',     id: 'sd-videos'    },
  { label: 'Results',    id: 'sd-results'   },
  { label: 'Facilities', id: 'sd-facilities'},
  { label: 'Fees',       id: 'sd-fees'      },
  { label: 'Reviews',    id: 'sd-reviews'   },
];

function SchoolNav({ school, active }) {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 56;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  return (
    <div className="sticky top-0 z-30 shadow-xl" style={{ background: 'linear-gradient(135deg, #0d2918 0%, #0f3d21 100%)' }}>
      <div className="max-w-5xl mx-auto px-0 sm:px-2 h-11 sm:h-[52px] flex items-stretch overflow-x-auto scrollbar-hide">

        {/* Section links — scroll independently on mobile */}
        <div className="flex items-center shrink-0 mr-auto px-2 sm:px-3">
          {SECTION_LINKS.map((link, i) => (
            <span key={link.id} className="flex items-center">
              <button
                onClick={() => scrollTo(link.id)}
                className={`relative text-[10px] sm:text-[12px] font-semibold px-1.5 sm:px-3 py-1 transition-all duration-200 whitespace-nowrap group tracking-wide ${
                  active === link.id ? 'text-emerald-300' : 'text-white/50 hover:text-white/90'
                }`}
              >
                {link.label}
                <span className={`absolute bottom-0 left-1 right-1 sm:left-2 sm:right-2 h-[2px] rounded-full bg-emerald-400 transition-all duration-300 ${active === link.id ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0 group-hover:opacity-40 group-hover:scale-x-100'}`} style={{ transformOrigin: 'left' }} />
              </button>
              {i < SECTION_LINKS.length - 1 && (
                <span className="text-white/10 text-[10px] select-none">|</span>
              )}
            </span>
          ))}
        </div>

        {/* CTA pills — always visible, compact on mobile */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0 px-2 sm:px-3 border-l border-white/10">
          {(school?.contact?.email || school?.contact?.phone) && (
            <a
              href={school.contact.email ? `mailto:${school.contact.email}` : `tel:${school.contact.phone}`}
              className="bg-emerald-500 text-white text-[9px] sm:text-[11px] font-bold px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full hover:bg-emerald-400 active:scale-95 transition-all duration-150 whitespace-nowrap shadow-sm"
            >
              Enquire
            </a>
          )}
          <button
            onClick={() => scrollTo('sd-reviews')}
            className="border border-white/20 text-white/70 text-[9px] sm:text-[11px] font-semibold px-2 sm:px-3 py-1 sm:py-1.5 rounded-full hover:bg-white/10 hover:text-white active:scale-95 transition-all duration-150 whitespace-nowrap"
          >
            Reviews
          </button>
          {school?.contact?.phone && (
            <a
              href={`tel:${school.contact.phone}`}
              className="hidden md:flex items-center gap-1.5 bg-white/10 text-white text-[11px] font-semibold px-3.5 py-1.5 rounded-full hover:bg-white/20 active:scale-95 transition-all whitespace-nowrap border border-white/10"
            >
              <Phone size={10} strokeWidth={2.5} />
              {school.contact.phone}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

const REVIEW_CATEGORIES = [
  'General', 'Teaching Quality', 'Communication', 'Fee Structure',
  'Infrastructure', 'Extracurricular Activities', 'Discipline',
  'Transport Facilities', 'Student-Teacher Ratio', 'Environment', 'Academic Results',
];


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

// ── Shared student photo ──────────────────────────────────────────────────────
function StudentPhoto({ photo, name, borderColor = 'border-yellow-400', placeholderBorder = 'border-yellow-400/40' }) {
  return photo ? (
    <div className={`w-7 h-9 max-[400px]:w-6 max-[400px]:h-8 sm:w-12 sm:h-[3.5rem] md:w-16 md:h-20 rounded-lg sm:rounded-xl overflow-hidden border-2 ${borderColor} shadow shrink-0`}>
      <img src={photo} alt={name} className="w-full h-full object-cover" />
    </div>
  ) : (
    <div className={`w-7 h-9 max-[400px]:w-6 max-[400px]:h-8 sm:w-12 sm:h-[3.5rem] md:w-16 md:h-20 rounded-lg sm:rounded-xl bg-white/5 border-2 ${placeholderBorder} flex items-center justify-center shrink-0`}>
      <GraduationCap size={10} className="text-white/20 sm:hidden" />
      <GraduationCap size={16} className="text-white/20 hidden sm:block" />
    </div>
  );
}

// ── JAMB Report Card ──────────────────────────────────────────────────────────
function JambCard({ report, schoolName }) {
  return (
    <div
      className="relative rounded-xl sm:rounded-2xl overflow-hidden shadow-md sm:shadow-xl select-none w-full"
      style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}
    >
      <div className="absolute inset-0 opacity-[0.06]"
        style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '14px 14px' }} />

      {/* Header */}
      <div className="relative px-2 max-[400px]:px-1.5 sm:px-3 pt-1.5 max-[400px]:pt-1 sm:pt-2.5 pb-1 sm:pb-2 border-b border-white/10 text-center">
        <p className="text-green-400 font-extrabold text-[8px] max-[400px]:text-[7px] sm:text-[10px] uppercase tracking-widest truncate">{schoolName}</p>
        <p className="text-white/30 text-[7px] tracking-wide">JAMB UTME · {report.year}</p>
      </div>

      {/* Body */}
      <div className="relative px-2 max-[400px]:px-1.5 sm:px-3 py-1.5 max-[400px]:py-1 sm:py-2.5 flex items-start gap-1.5 sm:gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-white/40 text-[7px] font-bold uppercase tracking-wider mb-0.5">Top Score</p>
          <p className="text-yellow-300 font-black text-base max-[400px]:text-sm sm:text-[1.75rem] leading-none tracking-tight">
            {report.total}
          </p>
          <p className="text-white/20 text-[7px] mt-0.5 mb-1">/400</p>

          {report.subjects?.length > 0 && (
            <div className="grid grid-cols-2 gap-0.5">
              {report.subjects.slice(0, 4).map((s) => (
                <div key={s.subject} className="flex items-center justify-between bg-white/5 rounded px-1 py-0.5 gap-0.5">
                  <p className="text-white/40 text-[7px] uppercase font-semibold truncate">{s.subject.slice(0, 4)}</p>
                  <p className="text-yellow-300 font-bold text-[7px] sm:text-[9px] shrink-0">{s.score}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <StudentPhoto photo={report.photo} name={report.studentName} />
      </div>

      {/* Footer */}
      <div className="relative px-2 max-[400px]:px-1.5 sm:px-3 py-1 bg-white/5 border-t border-white/10 text-center">
        <p className="text-white font-bold text-[9px] sm:text-[11px] leading-tight truncate">{report.studentName}</p>
        <p className="text-white/30 text-[7px] mt-0.5">Top Scorer</p>
      </div>
    </div>
  );
}

// ── WAEC Report Card ──────────────────────────────────────────────────────────
function WaecCard({ report, schoolName }) {
  const gradeChip = (g) => {
    if (!g) return 'bg-gray-700 text-gray-300';
    if (g === 'A1') return 'bg-green-400 text-green-950 font-black';
    if (g === 'B2' || g === 'B3') return 'bg-blue-400 text-blue-950 font-bold';
    if (g.startsWith('C')) return 'bg-yellow-300 text-yellow-900 font-semibold';
    if (g.startsWith('D') || g.startsWith('E')) return 'bg-orange-400 text-orange-950';
    return 'bg-red-400 text-red-950';
  };

  const maxGrades = 4;
  const visibleGrades = report.grades?.slice(0, maxGrades) ?? [];
  const extra = (report.grades?.length ?? 0) - maxGrades;

  return (
    <div
      className="relative rounded-xl sm:rounded-2xl overflow-hidden shadow-md sm:shadow-xl select-none w-full"
      style={{ background: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)' }}
    >
      <div className="absolute inset-0 opacity-[0.06]"
        style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '14px 14px' }} />

      {/* Header */}
      <div className="relative px-2 max-[400px]:px-1.5 sm:px-3 pt-1.5 max-[400px]:pt-1 sm:pt-2.5 pb-1 sm:pb-2 border-b border-white/10 text-center">
        <p className="text-yellow-400 font-extrabold text-[8px] max-[400px]:text-[7px] sm:text-[10px] uppercase tracking-widest truncate">{schoolName}</p>
        <p className="text-white/30 text-[7px] tracking-wide">WAEC SSCE · {report.year}</p>
      </div>

      {/* Body */}
      <div className="relative px-2 max-[400px]:px-1.5 sm:px-3 py-1.5 max-[400px]:py-1 sm:py-2.5 flex items-start gap-1.5 sm:gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-white/40 text-[7px] font-bold uppercase tracking-wider mb-0.5 sm:mb-1">Top Student</p>
          <div className="space-y-0.5">
            {visibleGrades.map((g) => (
              <div key={g.subject} className="flex items-center gap-1">
                <p className="text-white/55 text-[8px] max-[400px]:text-[7px] sm:text-[10px] flex-1 truncate leading-tight">{g.subject}</p>
                <span className={`shrink-0 text-[7px] px-1 py-0.5 rounded leading-none ${gradeChip(g.grade)}`}>
                  {g.grade}
                </span>
              </div>
            ))}
            {extra > 0 && (
              <p className="text-white/25 text-[7px] pt-0.5">+{extra} more</p>
            )}
          </div>
        </div>

        <StudentPhoto
          photo={report.photo} name={report.studentName}
          borderColor="border-yellow-400" placeholderBorder="border-yellow-400/40"
        />
      </div>

      {/* Footer */}
      <div className="relative px-2 max-[400px]:px-1.5 sm:px-3 py-1 bg-white/5 border-t border-white/10 text-center">
        <p className="text-white font-bold text-[9px] sm:text-[11px] leading-tight truncate">{report.studentName}</p>
        <p className="text-white/30 text-[7px] mt-0.5">Outstanding Result</p>
      </div>
    </div>
  );
}

// ── Report Slideshow — CSS scroll-snap (touch-native) + JS dots/auto-advance ──
function ReportSlideshow({ items, renderCard }) {
  const count = items.length;
  const trackRef = useRef(null);
  const [idx, setIdx] = useState(0);
  const [cols, setCols] = useState(1);
  const [isXs, setIsXs] = useState(false);

  useEffect(() => {
    const mqSm = window.matchMedia('(min-width: 640px)');
    const mqXs = window.matchMedia('(max-width: 400px)');
    setCols(mqSm.matches ? 2 : 1);
    setIsXs(mqXs.matches);
    const hSm = (e) => { setCols(e.matches ? 2 : 1); setIdx(0); };
    const hXs = (e) => setIsXs(e.matches);
    mqSm.addEventListener('change', hSm);
    mqXs.addEventListener('change', hXs);
    return () => { mqSm.removeEventListener('change', hSm); mqXs.removeEventListener('change', hXs); };
  }, []);

  const maxIdx = Math.max(0, count - cols);

  // Auto-advance every 3.5 s
  useEffect(() => {
    if (count <= cols) return;
    const t = setInterval(() => setIdx((i) => (i >= maxIdx ? 0 : i + 1)), 3500);
    return () => clearInterval(t);
  }, [count, cols, maxIdx]);

  // Scroll to card when idx changes (programmatic nav)
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.children[idx];
    if (card) el.scrollTo({ left: card.offsetLeft, behavior: 'smooth' });
  }, [idx]);

  // Sync dot indicator when user touch-swipes
  const onScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const first = el.children[0];
    const second = el.children[1];
    const cardW = second ? second.offsetLeft - first.offsetLeft : first?.offsetWidth ?? 1;
    setIdx(Math.min(Math.round(el.scrollLeft / cardW), maxIdx));
  }, [maxIdx]);

  const dots = maxIdx + 1;

  // ≤400px: 72% (small peek); <640px: 78%; ≥640px: half-width 2-col
  const cardWidth = cols === 2 ? 'calc(50% - 0.375rem)' : isXs ? '72%' : '78%';

  return (
    <div>
      {/* Touch-scrollable track with CSS snap */}
      <div
        ref={trackRef}
        onScroll={onScroll}
        className="flex gap-3 overflow-x-auto scrollbar-hide pb-1"
        style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
      >
        {items.map((item, i) => (
          <div
            key={i}
            className="shrink-0"
            style={{ width: cardWidth, scrollSnapAlign: 'start' }}
          >
            {renderCard(item)}
          </div>
        ))}
      </div>

      {dots > 1 && (
        <div className="flex items-center justify-between mt-3 sm:mt-4">
          <div className="flex gap-1.5">
            {Array.from({ length: dots }).map((_, i) => (
              <button key={i} onClick={() => setIdx(i)}
                className={`rounded-full transition-all duration-300 ${i === idx ? 'w-6 h-2 bg-green-600' : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'}`} />
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setIdx((i) => Math.max(0, i - 1))} disabled={idx === 0}
              className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition disabled:opacity-30">
              <ChevronLeft size={14} className="text-gray-600" />
            </button>
            <button onClick={() => setIdx((i) => Math.min(maxIdx, i + 1))} disabled={idx >= maxIdx}
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
  const { user } = useAuth();

  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [galleryLightboxIdx, setGalleryLightboxIdx] = useState(null);
  const [videoLightbox, setVideoLightbox] = useState(null);

  // Reviews state
  const [reviews, setReviews]           = useState([]);
  const [reviewTotal, setReviewTotal]   = useState(0);
  const [reviewDist, setReviewDist]     = useState({ 1:0, 2:0, 3:0, 4:0, 5:0 });
  const [userReview, setUserReview]     = useState(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewPage, setReviewPage]     = useState(1);
  const [reviewPages, setReviewPages]   = useState(1);
  const [submitting, setSubmitting]     = useState(false);
  const [showForm, setShowForm]         = useState(false);
  const [form, setForm] = useState({ rating: 5, title: '', text: '', category: 'General', isAnonymous: false });
  const [activeSection, setActiveSection] = useState('sd-about');

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

  const fetchReviews = useCallback(async (schoolId, page = 1) => {
    if (!schoolId) return;
    setReviewsLoading(true);
    try {
      const { data } = await api.get(`/reviews/school/${schoolId}`, { params: { page, limit: 5 } });
      setReviews(data.reviews);
      setReviewTotal(data.total);
      setReviewDist(data.dist || { 1:0, 2:0, 3:0, 4:0, 5:0 });
      setUserReview(data.userReview || null);
      setReviewPage(data.page);
      setReviewPages(data.pages);
    } catch {
      // silently fail — reviews are non-critical
    } finally {
      setReviewsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (school?._id) fetchReviews(school._id, 1);
  }, [school?._id, fetchReviews]);

  // Track active nav section via IntersectionObserver
  useEffect(() => {
    if (!school) return;
    const ids = SECTION_LINKS.map((l) => l.id);
    const observers = ids.map((id) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { rootMargin: '-30% 0px -60% 0px' }
      );
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach((obs) => obs?.disconnect());
  }, [school]);


  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!form.text.trim()) return toast.error('Please write your review.');
    setSubmitting(true);
    try {
      await api.post('/reviews', { ...form, schoolId: school._id });
      toast.success('Review submitted! Thank you.');
      setShowForm(false);
      setForm({ rating: 5, title: '', text: '', category: 'General', isAnonymous: false });
      fetchReviews(school._id, 1);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await api.delete(`/reviews/${reviewId}`);
      toast.success('Review deleted.');
      fetchReviews(school._id, reviewPage);
    } catch {
      toast.error('Could not delete review.');
    }
  };

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
        <div className="space-y-5">
          <div className="h-[40vh] skeleton-shimmer rounded-2xl" />
          <div className="h-6 skeleton-shimmer rounded w-2/3" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-20 skeleton-shimmer rounded-xl" />)}
          </div>
          <div className="h-28 skeleton-shimmer rounded-xl" />
          <div className="h-28 skeleton-shimmer rounded-xl" />
        </div>
      </div>
    );
  }

  if (!school) return null;

  const formatFee = (n) => n ? `₦${Number(n).toLocaleString()}` : 'Contact School';
  const images = school.images || [];
  const isVideoUrl = (url) => url && /\.(mp4|webm|ogg|mov)$/i.test(url);
  const photos = images.filter((src) => !isYoutube(src) && !isVideoUrl(src));
  const schoolVideos = [...new Set([
    ...(school.videos || []),
    ...images.filter((src) => isYoutube(src) || isVideoUrl(src)),
  ])];
  const firstPhoto = photos[0] || null;
  const enquireHref = school.contact?.email
    ? `mailto:${school.contact.email}`
    : school.contact?.phone
    ? `tel:${school.contact.phone}`
    : '#';
  const scrollToId = (id) => {
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 56, behavior: 'smooth' });
  };
  const prevPhoto = () => setGalleryLightboxIdx((i) => ((i ?? 0) - 1 + photos.length) % photos.length);
  const nextPhoto = () => setGalleryLightboxIdx((i) => ((i ?? 0) + 1) % photos.length);

  return (
    <div className="bg-white min-h-screen">

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <div className="relative w-full overflow-hidden" style={{ height: '50vh', minHeight: '320px' }}>
        {/* Background */}
        {firstPhoto ? (
          <img src={firstPhoto} alt={school.name} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #0d2918 0%, #1a4731 100%)' }}>
            <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '22px 22px' }} />
          </div>
        )}
        {/* Dark overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.93) 0%, rgba(0,0,0,0.52) 42%, rgba(0,0,0,0.12) 100%)' }} />

        {/* Back button */}
        <button onClick={() => navigate(-1)}
          className="absolute top-4 left-4 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm text-white text-sm font-medium px-3 py-2 rounded-full hover:bg-black/60 transition z-10">
          <ArrowLeft size={15} /> <span className="hidden sm:inline">Back</span>
        </button>

        {/* Featured badge */}
        {school.isFeatured && (
          <div className="absolute top-4 right-4 bg-white/15 backdrop-blur-sm border border-white/30 text-white text-[11px] font-bold px-3 py-1 rounded-full z-10">
            ★ Featured
          </div>
        )}

        {/* Bottom content */}
        <div className="absolute bottom-0 left-0 right-0 px-3 sm:px-8 pb-4 sm:pb-7 z-10">
          <div className="max-w-5xl mx-auto flex items-end justify-between gap-2 sm:gap-4">

            {/* Left: name + stats */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap gap-1.5 mb-1.5">
                <span className="text-[10px] sm:text-[11px] bg-green-600/90 text-white px-2 sm:px-2.5 py-0.5 rounded-full capitalize font-medium">{school.type}</span>
                <span className="text-[10px] sm:text-[11px] bg-white/20 backdrop-blur-sm text-white px-2 sm:px-2.5 py-0.5 rounded-full capitalize">{school.level} school</span>
              </div>
              <h1 className="text-lg sm:text-2xl md:text-[2.4rem] font-extrabold text-white leading-tight drop-shadow-lg flex flex-wrap items-start gap-2">
                {school.name}
                {school.status === 'approved' && (
                  <span className="inline-flex items-center justify-center w-5 h-5 sm:w-7 sm:h-7 bg-emerald-500 rounded-full shrink-0 mt-0.5 sm:mt-1">
                    <CheckCircle size={11} className="text-white sm:hidden" strokeWidth={3} />
                    <CheckCircle size={15} className="text-white hidden sm:block" strokeWidth={3} />
                  </span>
                )}
              </h1>
              <p className="flex items-center gap-1 mt-1 mb-2 text-white/65 text-[10px] sm:text-sm">
                <MapPin size={10} className="shrink-0" />
                <span className="truncate">{[school.city, school.state, school.country].filter(Boolean).join(', ')}</span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {(school.rating ?? 0) > 0 && (
                  <span className="bg-white/15 backdrop-blur-sm border border-white/25 text-white text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
                    ★ {school.rating.toFixed(1)}
                  </span>
                )}
                <span className="hidden sm:inline bg-white/15 backdrop-blur-sm border border-white/25 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {(school.profileViews || 0).toLocaleString()} Views
                </span>
                {(school.reviewCount ?? 0) > 0 && (
                  <span className="bg-white/15 backdrop-blur-sm border border-white/25 text-white text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
                    {school.reviewCount} Review{school.reviewCount !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>

            {/* Right: circular action buttons */}
            <div className="flex items-end gap-2 sm:gap-4 shrink-0">
              {/* Campus Stories — dedicated campusStory field */}
              <button
                onClick={() => school.campusStory ? setVideoLightbox(school.campusStory) : scrollToId('sd-gallery')}
                className="flex flex-col items-center gap-1.5 group"
              >
                <div className="relative w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 sm:border-[3px] border-white/70 bg-gray-800 shadow-xl group-hover:border-white transition">
                  {school.campusStory && getYoutubeThumbnail(school.campusStory) ? (
                    <img src={getYoutubeThumbnail(school.campusStory)} alt="" className="w-full h-full object-cover" />
                  ) : firstPhoto ? (
                    <img src={firstPhoto} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <GraduationCap size={18} className="text-white/50 sm:hidden" />
                      <GraduationCap size={26} className="text-white/50 hidden sm:block" />
                    </div>
                  )}
                  {school.campusStory && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/25 flex items-center justify-center">
                        <Play size={10} className="text-white fill-white ml-0.5 sm:hidden" />
                        <Play size={14} className="text-white fill-white ml-0.5 hidden sm:block" />
                      </div>
                    </div>
                  )}
                </div>
                <span className="text-white/90 text-[9px] sm:text-[10px] md:text-xs font-bold drop-shadow-lg whitespace-nowrap">Campus Stories</span>
              </button>

              {/* Parent Tools */}
              <button onClick={() => scrollToId('sd-reviews')} className="flex flex-col items-center gap-1.5 group">
                <div className="w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center shadow-xl border-2 sm:border-[3px] border-white/20 group-hover:border-white/40 transition"
                  style={{ background: 'linear-gradient(135deg, #0d2918 0%, #166534 100%)' }}>
                  <UserCog size={18} className="text-white sm:hidden" />
                  <UserCog size={26} className="text-white hidden sm:block md:hidden" />
                  <UserCog size={32} className="text-white hidden md:block" />
                </div>
                <span className="text-white/90 text-[9px] sm:text-[10px] md:text-xs font-bold drop-shadow-lg whitespace-nowrap">Parent Tools</span>
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* ── STICKY SECTION NAV ────────────────────────────────────── */}
      {school && <SchoolNav school={school} active={activeSection} />}

      {/* ── PHOTO LIGHTBOX ────────────────────────────────────────── */}
      {galleryLightboxIdx !== null && photos[galleryLightboxIdx] && (
        <div className="fixed inset-0 z-[100] bg-black/96 flex items-center justify-center p-4"
          onClick={() => setGalleryLightboxIdx(null)}>
          <button className="absolute top-4 right-4 text-white/70 hover:text-white transition z-10">
            <X size={26} />
          </button>
          {photos.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); prevPhoto(); }}
                className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/15 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition z-10">
                <ChevronLeft size={20} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); nextPhoto(); }}
                className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/15 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition z-10">
                <ChevronRight size={20} />
              </button>
            </>
          )}
          <img src={photos[galleryLightboxIdx]} alt=""
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()} />
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-xs">
            {galleryLightboxIdx + 1} / {photos.length}
          </p>
        </div>
      )}

      {/* ── VIDEO LIGHTBOX ────────────────────────────────────────── */}
      {videoLightbox && (
        <div className="fixed inset-0 z-[100] bg-black/96 flex items-center justify-center p-4"
          onClick={() => setVideoLightbox(null)}>
          <button className="absolute top-4 right-4 text-white/70 hover:text-white transition z-10">
            <X size={26} />
          </button>
          <div className="w-full max-w-4xl aspect-video" onClick={(e) => e.stopPropagation()}>
            {isYoutube(videoLightbox) ? (
              <iframe
                src={`${getYoutubeEmbed(videoLightbox)}&autoplay=1`}
                className="w-full h-full rounded-xl"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen title="School video"
              />
            ) : (
              <video src={videoLightbox} controls autoPlay className="w-full h-full rounded-xl" />
            )}
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT ──────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 py-6 md:py-8 space-y-5">

        {/* ── PHOTO GALLERY ─────────────────────────────────────────── */}
        {photos.length > 0 && (
          <div id="sd-gallery">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-900 text-base">{school.name} Gallery</h2>
                <a href={enquireHref}
                  className="bg-emerald-600 text-white font-bold text-xs px-4 py-2.5 rounded-full hover:bg-emerald-700 transition shadow-sm whitespace-nowrap">
                  Enquire Now
                </a>
              </div>
              <div className="p-3 sm:p-4 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
                {photos.map((src, i) => (
                  <button key={i} onClick={() => setGalleryLightboxIdx(i)}
                    className="aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-yellow-400">
                    <img src={src} alt={`${school.name} ${i + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      onError={(e) => { e.currentTarget.parentElement.style.display = 'none'; }} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── VIDEO SECTION ─────────────────────────────────────────── */}
        {schoolVideos.length > 0 && (
          <div id="sd-videos">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-900 text-base">{school.name} Videos</h2>
                <a href={enquireHref}
                  className="bg-emerald-600 text-white font-bold text-xs px-4 py-2.5 rounded-full hover:bg-emerald-700 transition shadow-sm whitespace-nowrap">
                  Enquire Now
                </a>
              </div>
              <div className="p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {schoolVideos.map((url, i) => {
                  const thumb = getYoutubeThumbnail(url);
                  return (
                    <button key={i} onClick={() => setVideoLightbox(url)}
                      className="relative aspect-video rounded-xl overflow-hidden bg-gray-900 group hover:opacity-90 transition focus:outline-none focus:ring-2 focus:ring-yellow-400">
                      {thumb ? (
                        <img src={thumb} alt={`Video ${i + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                          <Play size={28} className="text-gray-600" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/35 transition flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Play size={20} className="text-yellow-950 fill-yellow-950 ml-0.5" />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">

          {/* ── Left: Main Details ── */}
          <div className="lg:col-span-2 space-y-5 sm:space-y-7">

            {/* Key Stats */}
            <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm" style={{ background: 'linear-gradient(135deg, #0d2918 0%, #173d25 100%)' }}>
              <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-white/10 divide-y sm:divide-y-0">
                {[
                  { icon: Building2,     label: 'School Type', value: school.type,                 accent: 'bg-emerald-400/20 text-emerald-300' },
                  { icon: GraduationCap, label: 'Level',       value: school.level,                accent: 'bg-sky-400/20 text-sky-300'         },
                  { icon: MapPin,        label: 'Location',    value: school.state || 'Nigeria',   accent: 'bg-violet-400/20 text-violet-300'   },
                  { icon: CheckCircle,   label: 'Status',      value: 'Verified ✓',               accent: 'bg-emerald-400/20 text-emerald-300' },
                ].map(({ icon: Icon, label, value, accent }) => (
                  <div key={label} className="flex items-center gap-3 px-4 py-3.5 sm:py-4">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${accent}`}>
                      <Icon size={15} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-white/40 text-[9px] font-semibold uppercase tracking-widest truncate">{label}</p>
                      <p className="text-white font-bold text-[13px] capitalize truncate mt-0.5">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            {school.description && (
              <div id="sd-about">
                <h2 className="text-base sm:text-lg font-extrabold text-gray-900 mb-3 pl-3 border-l-[3px] border-emerald-500">About This School</h2>
                <div className="rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-emerald-100 bg-gradient-to-br from-emerald-50/60 to-white">
                  <p className="text-gray-600 leading-relaxed text-sm">{school.description}</p>
                </div>
              </div>
            )}

            {/* Curriculum */}
            {school.curriculum?.length > 0 && (
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-gray-900 mb-3 pl-3 border-l-[3px] border-emerald-500">Curriculum Offered</h2>
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
                <h2 className="text-base sm:text-lg font-extrabold text-gray-900 mb-3 pl-3 border-l-[3px] border-emerald-500">Achievements &amp; Awards</h2>
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
              <div id="sd-results">
                <div className="flex items-center gap-2 mb-2.5 sm:mb-4">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0">
                    <GraduationCap size={13} className="text-blue-700" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-xl font-bold text-gray-900 leading-tight">JAMB Top Scorers</h2>
                    <p className="text-[11px] sm:text-xs text-gray-400">Our best JAMB results — verified by the school</p>
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
                <div className="flex items-center gap-2 mb-2.5 sm:mb-4">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-100 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0">
                    <Award size={13} className="text-green-700" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-xl font-bold text-gray-900 leading-tight">WAEC Outstanding Results</h2>
                    <p className="text-[11px] sm:text-xs text-gray-400">Top WAEC performers from this school</p>
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
              <div id="sd-facilities">
                <h2 className="text-base sm:text-lg font-extrabold text-gray-900 mb-3 pl-3 border-l-[3px] border-emerald-500">Facilities &amp; Amenities</h2>
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
            <div id="sd-fees">
              <h2 className="text-base sm:text-lg font-extrabold text-gray-900 mb-3 pl-3 border-l-[3px] border-emerald-500">School Fees</h2>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="rounded-xl sm:rounded-2xl p-4 sm:p-5 text-white shadow-lg shadow-emerald-900/20" style={{ background: 'linear-gradient(135deg, #0d2918 0%, #166534 100%)' }}>
                  <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center mb-3">
                    <DollarSign size={16} className="text-white" />
                  </div>
                  <p className="text-white/60 text-[10px] font-semibold uppercase tracking-widest mb-1">Annual Tuition</p>
                  <p className="text-xl sm:text-2xl font-extrabold text-white">{formatFee(school.fees?.tuition)}</p>
                  <p className="text-white/40 text-[10px] mt-1.5">Per academic year</p>
                </div>
                <div className="rounded-xl sm:rounded-2xl p-4 sm:p-5 text-white shadow-lg shadow-slate-900/20" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' }}>
                  <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center mb-3">
                    <Building2 size={16} className="text-white" />
                  </div>
                  <p className="text-white/60 text-[10px] font-semibold uppercase tracking-widest mb-1">Boarding Fee</p>
                  <p className="text-xl sm:text-2xl font-extrabold text-white">
                    {school.fees?.boarding ? formatFee(school.fees.boarding) : 'Day School'}
                  </p>
                  <p className="text-white/40 text-[10px] mt-1.5">
                    {school.fees?.boarding ? 'Per academic year' : 'No boarding option'}
                  </p>
                </div>
              </div>
              <p className="text-gray-400 text-[11px] mt-2.5 italic">* Fees are indicative. Contact the school to confirm current rates.</p>
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

            {/* ── REVIEWS ──────────────────────────────────────────── */}
            <div id="sd-reviews">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center shrink-0">
                    <Star size={14} className="text-amber-500 fill-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-extrabold text-gray-900 leading-tight mb-0">
                      Reviews {reviewTotal > 0 && <span className="text-gray-400 font-normal text-xs">({reviewTotal})</span>}
                    </h2>
                    {school.rating > 0 && (
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {school.rating.toFixed(1)} avg · {school.reviewCount} review{school.reviewCount !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!userReview && user && !showForm && (
                    <button onClick={() => setShowForm(true)}
                      className="flex items-center gap-1.5 text-white text-[11px] sm:text-xs font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl transition shadow-sm hover:opacity-90 active:scale-95 whitespace-nowrap"
                      style={{ background: 'linear-gradient(135deg, #0d2918, #166534)' }}>
                      <MessageSquare size={11} /> Write a Review
                    </button>
                  )}
                  {!user && (
                    <Link to="/login" className="text-[11px] sm:text-xs text-emerald-600 font-bold hover:text-emerald-700 hover:underline whitespace-nowrap">
                      Login to review →
                    </Link>
                  )}
                </div>
              </div>

              {/* Rating bar — only when there are real reviews */}
              {reviewTotal > 0 && (
                <div className="rounded-2xl p-3 sm:p-5 mb-4 flex gap-3 sm:gap-5 items-center border border-emerald-100" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)' }}>
                  <div className="text-center shrink-0">
                    <p className="text-3xl sm:text-5xl font-extrabold text-gray-900 leading-none">{school.rating?.toFixed(1) || '—'}</p>
                    <div className="flex gap-0.5 justify-center my-2">
                      {[1,2,3,4,5].map((s) => (
                        <Star key={s} size={13} className={s <= Math.round(school.rating||0) ? 'text-amber-500 fill-amber-500' : 'text-gray-300 fill-gray-200'} />
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 font-medium">{reviewTotal} review{reviewTotal !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {[5,4,3,2,1].map((star) => (
                      <div key={star} className="flex items-center gap-2">
                        <span className="text-[11px] text-gray-500 w-2 shrink-0 font-medium">{star}</span>
                        <Star size={9} className="text-amber-400 fill-amber-400 shrink-0" />
                        <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                            style={{ width: reviewTotal ? `${(reviewDist[star] / reviewTotal) * 100}%` : '0%' }} />
                        </div>
                        <span className="text-[10px] text-gray-400 w-4 text-right shrink-0">{reviewDist[star]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Review form */}
              {showForm && (
                <form onSubmit={handleSubmitReview} className="rounded-2xl p-5 mb-5 shadow-lg border border-emerald-100" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 60%)' }}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900 text-sm">Write Your Review</h3>
                    <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 transition">
                      <X size={16} />
                    </button>
                  </div>
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1.5 font-medium">Your Rating</p>
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map((s) => (
                        <button key={s} type="button" onClick={() => setForm(f => ({ ...f, rating: s }))}
                          className="transition hover:scale-110 active:scale-95">
                          <Star size={24} className={s <= form.rating ? 'text-amber-500 fill-amber-500' : 'text-gray-300 fill-gray-100'} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1.5 font-medium">Category</p>
                    <select value={form.category} onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
                      {REVIEW_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1.5 font-medium">Title (optional)</p>
                    <input type="text" maxLength={100} placeholder="e.g. Great school overall"
                      value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1.5 font-medium">Your Review <span className="text-red-500">*</span></p>
                    <textarea rows={4} maxLength={1000} required placeholder="Share your honest experience with this school..."
                      value={form.text} onChange={(e) => setForm(f => ({ ...f, text: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
                    <p className="text-[10px] text-gray-400 text-right mt-0.5">{form.text.length}/1000</p>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-gray-600 mb-4 cursor-pointer select-none">
                    <input type="checkbox" checked={form.isAnonymous}
                      onChange={(e) => setForm(f => ({ ...f, isAnonymous: e.target.checked }))}
                      className="w-4 h-4 rounded accent-green-600" />
                    Post anonymously
                  </label>
                  <button type="submit" disabled={submitting}
                    className="w-full text-white font-bold py-3 rounded-xl transition text-sm disabled:opacity-60 shadow-md shadow-emerald-900/20 hover:opacity-90 active:scale-[0.98]"
                    style={{ background: 'linear-gradient(135deg, #0d2918 0%, #166534 100%)' }}>
                    {submitting ? 'Submitting…' : 'Submit Review'}
                  </button>
                </form>
              )}

              {/* Already reviewed notice */}
              {userReview && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-4 flex items-start gap-3">
                  <CheckCircle size={16} className="text-green-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-green-800 font-medium">You have already reviewed this school.</p>
                </div>
              )}

              {/* Review list */}
              {reviewsLoading ? (
                <div className="space-y-3">
                  {[1,2,3].map((i) => (
                    <div key={i} className="bg-gray-100 rounded-2xl h-28 animate-pulse" />
                  ))}
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <MessageSquare size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-medium text-gray-500">No reviews yet</p>
                  <p className="text-xs mt-1">Be the first to share your experience with this school.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reviews.map((r) => {
                    const reviewerName = r.isAnonymous ? 'Anonymous' : (r.user?.name || r.authorName || 'User');
                    const initial = r.isAnonymous ? '?' : reviewerName[0].toUpperCase();
                    return (
                      <div key={r._id} className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow duration-200 group">
                        <div className="flex items-start gap-3 sm:gap-4">
                          {/* Avatar */}
                          <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 text-white text-sm font-extrabold shadow-sm"
                            style={{ background: 'linear-gradient(135deg, #0d2918 0%, #166534 100%)' }}>
                            {initial}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <div>
                                <p className="font-bold text-gray-900 text-sm leading-tight">{reviewerName}</p>
                                <p className="text-[10px] text-gray-400 mt-0.5">
                                  {new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full font-semibold">
                                  {r.category}
                                </span>
                                {(user?._id === r.user?._id || user?.role === 'admin') && (
                                  <button onClick={() => handleDeleteReview(r._id)}
                                    className="text-gray-300 hover:text-red-500 transition p-0.5 opacity-0 group-hover:opacity-100">
                                    <Trash2 size={13} />
                                  </button>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-0.5 mb-2">
                              {[1,2,3,4,5].map((s) => (
                                <Star key={s} size={13} className={s <= r.rating ? 'text-amber-500 fill-amber-500' : 'text-gray-200 fill-gray-200'} />
                              ))}
                            </div>
                            {r.title && <p className="font-bold text-gray-800 text-sm mb-1">{r.title}</p>}
                            <p className="text-gray-600 text-sm leading-relaxed">{r.text}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pagination */}
              {reviewPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  <button disabled={reviewPage === 1} onClick={() => fetchReviews(school._id, reviewPage - 1)}
                    className="w-8 h-8 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition flex items-center justify-center">
                    <ChevronLeft size={14} />
                  </button>
                  <span className="text-sm text-gray-500 leading-8">Page {reviewPage} of {reviewPages}</span>
                  <button disabled={reviewPage === reviewPages} onClick={() => fetchReviews(school._id, reviewPage + 1)}
                    className="w-8 h-8 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition flex items-center justify-center">
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* ── Sidebar (desktop only) ── */}
          <div className="hidden lg:block space-y-5">

            {/* Quick Actions */}
            <div className="rounded-2xl overflow-hidden shadow-lg">
              <div className="p-4 pb-3" style={{ background: 'linear-gradient(135deg, #0d2918 0%, #1a4731 100%)' }}>
                <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-3">Quick Actions</p>
                <div className="space-y-2">
                  {school.contact?.phone && (
                    <a href={`tel:${school.contact.phone}`}
                      className="flex items-center gap-3 bg-emerald-500 text-white px-4 py-3 rounded-xl font-bold hover:bg-emerald-400 transition text-sm shadow-md shadow-emerald-900/30 active:scale-[0.98]">
                      <Phone size={15} /> Call School
                    </a>
                  )}
                  {school.contact?.email && (
                    <a href={`mailto:${school.contact.email}`}
                      className="flex items-center gap-3 bg-white/10 text-white px-4 py-3 rounded-xl font-semibold hover:bg-white/20 transition text-sm border border-white/10">
                      <Mail size={15} /> Email School
                    </a>
                  )}
                </div>
              </div>
              <div className="bg-white p-3 space-y-2">
                <button onClick={handleAddToCompare}
                  className="w-full flex items-center justify-center gap-2 border-2 border-emerald-600 text-emerald-700 px-4 py-2.5 rounded-xl font-bold hover:bg-emerald-50 transition text-sm">
                  <BarChart3 size={15} /> Compare Schools
                </button>
                <button onClick={handleShare}
                  className="w-full flex items-center justify-center gap-2 border border-gray-200 text-gray-500 px-4 py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition text-sm">
                  <Share2 size={15} /> Share School
                </button>
              </div>
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
            <div className="rounded-2xl p-5 text-white relative overflow-hidden shadow-xl" style={{ background: 'linear-gradient(135deg, #0d2918 0%, #0f3d21 50%, #1a5c30 100%)' }}>
              <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-400/10 rounded-full -translate-y-10 translate-x-10" />
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-8 -translate-x-6" />
              <div className="relative z-10">
                <div className="w-10 h-10 bg-emerald-400/20 rounded-xl flex items-center justify-center mb-3">
                  <GraduationCap size={20} className="text-emerald-300" />
                </div>
                <h4 className="font-extrabold text-base mb-1.5 text-white">Study Abroad?</h4>
                <p className="text-white/60 text-xs mb-4 leading-relaxed">
                  Our counsellors place students in top universities across the UK, Canada, USA, Australia and more.
                </p>
                <Link to="/study-abroad"
                  className="block text-center bg-emerald-500 text-white font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-emerald-400 transition shadow-md shadow-emerald-900/30">
                  Explore Study Abroad →
                </Link>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
