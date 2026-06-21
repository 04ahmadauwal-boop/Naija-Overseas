import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin, Phone, Mail, Globe, ArrowLeft,
  CheckCircle, Building2, GraduationCap, DollarSign,
  Users, Calendar, Share2, BarChart3, Award,
  ChevronLeft, ChevronRight, Play, X, Star, MessageSquare, Trash2, UserCog, ClipboardList
} from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import AdmissionModal from '../components/AdmissionModal';

const SECTION_LINKS = [
  { label: 'About',      id: 'sd-about'     },
  { label: 'Gallery',    id: 'sd-gallery'   },
  { label: 'Videos',     id: 'sd-videos'    },
  { label: 'Results',    id: 'sd-results'   },
  { label: 'Facilities', id: 'sd-facilities'},
  { label: 'Fees',       id: 'sd-fees'      },
  { label: 'Reviews',    id: 'sd-reviews'   },
];

function SchoolNav({ school, active, onApply }) {
  const [stuck, setStuck] = useState(false);
  const sentinelRef = useRef(null);

  useEffect(() => {
    const check = () => {
      if (!sentinelRef.current) return;
      setStuck(sentinelRef.current.getBoundingClientRect().top <= 64);
    };
    check();
    window.addEventListener('scroll', check, { passive: true });
    return () => window.removeEventListener('scroll', check);
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 116;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  return (
    <>
      <div ref={sentinelRef} />
      {stuck && <div className="h-11 sm:h-[52px]" />}

      <div
        className={`z-30 shadow-xl ${stuck ? 'fixed top-16 left-0 right-0' : 'relative'}`}
        style={{ background: 'linear-gradient(135deg, #0d2918 0%, #0f3d21 100%)' }}
      >
      <div className="max-w-5xl mx-auto px-0 sm:px-2 h-11 sm:h-[52px] flex items-stretch overflow-x-auto scrollbar-hide">

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

        <div className="flex items-center gap-1 sm:gap-2 shrink-0 px-2 sm:px-3 border-l border-white/10">
          {school?.admission?.isOpen && (
            <button
              onClick={onApply}
              className="bg-amber-500 text-white text-[9px] sm:text-[11px] font-bold px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full hover:bg-amber-400 active:scale-95 transition-all duration-150 whitespace-nowrap shadow-sm flex items-center gap-1"
            >
              <ClipboardList size={10} className="shrink-0" />
              Apply
            </button>
          )}
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
    </>
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

      <div className="relative px-2 max-[400px]:px-1.5 sm:px-3 pt-1.5 max-[400px]:pt-1 sm:pt-2.5 pb-1 sm:pb-2 border-b border-white/10 text-center">
        <p className="text-green-400 font-extrabold text-[8px] max-[400px]:text-[7px] sm:text-[10px] uppercase tracking-widest truncate">{schoolName}</p>
        <p className="text-white/30 text-[7px] tracking-wide">JAMB UTME · {report.year}</p>
      </div>

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

      <div className="relative px-2 max-[400px]:px-1.5 sm:px-3 pt-1.5 max-[400px]:pt-1 sm:pt-2.5 pb-1 sm:pb-2 border-b border-white/10 text-center">
        <p className="text-yellow-400 font-extrabold text-[8px] max-[400px]:text-[7px] sm:text-[10px] uppercase tracking-widest truncate">{schoolName}</p>
        <p className="text-white/30 text-[7px] tracking-wide">WAEC SSCE · {report.year}</p>
      </div>

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

      <div className="relative px-2 max-[400px]:px-1.5 sm:px-3 py-1 bg-white/5 border-t border-white/10 text-center">
        <p className="text-white font-bold text-[9px] sm:text-[11px] leading-tight truncate">{report.studentName}</p>
        <p className="text-white/30 text-[7px] mt-0.5">Outstanding Result</p>
      </div>
    </div>
  );
}

// ── Report Slideshow ──────────────────────────────────────────────────────────
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

  useEffect(() => {
    if (count <= cols) return;
    const t = setInterval(() => setIdx((i) => (i >= maxIdx ? 0 : i + 1)), 3500);
    return () => clearInterval(t);
  }, [count, cols, maxIdx]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.children[idx];
    if (card) el.scrollTo({ left: card.offsetLeft, behavior: 'smooth' });
  }, [idx]);

  const onScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const first = el.children[0];
    const second = el.children[1];
    const cardW = second ? second.offsetLeft - first.offsetLeft : first?.offsetWidth ?? 1;
    setIdx(Math.min(Math.round(el.scrollLeft / cardW), maxIdx));
  }, [maxIdx]);

  const dots = maxIdx + 1;
  const cardWidth = cols === 2 ? 'calc(50% - 0.375rem)' : isXs ? '72%' : '78%';

  return (
    <div>
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
  const [showAdmission, setShowAdmission] = useState(false);

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
      // silently fail
    } finally {
      setReviewsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (school?._id) fetchReviews(school._id, 1);
  }, [school?._id, fetchReviews]);

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
      <div className="min-h-screen bg-[#f4f6f9]">
        <div className="h-[55vh] bg-gray-200 animate-pulse" />
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-4">
          <div className="h-8 bg-gray-200 rounded-xl w-1/2 animate-pulse" />
          <div className="grid grid-cols-3 gap-4">
            {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-200 rounded-2xl animate-pulse" />)}
          </div>
          <div className="h-40 bg-gray-200 rounded-2xl animate-pulse" />
          <div className="h-32 bg-gray-200 rounded-2xl animate-pulse" />
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
  const prevPhoto = () => setGalleryLightboxIdx((i) => ((i ?? 0) - 1 + photos.length) % photos.length);
  const nextPhoto = () => setGalleryLightboxIdx((i) => ((i ?? 0) + 1) % photos.length);

  return (
    <div className="bg-[#f4f6f9] min-h-screen pb-20 lg:pb-0">

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <div className="relative w-full overflow-hidden" style={{ height: '62vh', minHeight: '380px', maxHeight: '600px' }}>
        {firstPhoto ? (
          <img src={firstPhoto} alt={school.name} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #0d2918 0%, #1a4731 60%, #0f3d21 100%)' }}>
            <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          </div>
        )}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.93) 0%, rgba(0,0,0,0.55) 38%, rgba(0,0,0,0.12) 70%, rgba(0,0,0,0) 100%)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.30) 0%, rgba(0,0,0,0) 60%)' }} />

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 sm:px-6 pt-4">
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm text-white text-sm font-medium px-3 py-2 rounded-full hover:bg-black/60 transition-all">
            <ArrowLeft size={15} /> <span className="hidden sm:inline">Back</span>
          </button>
          <div className="flex items-center gap-2">
            <button onClick={handleShare}
              className="w-9 h-9 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-all" title="Share">
              <Share2 size={15} />
            </button>
            <button onClick={handleAddToCompare}
              className="w-9 h-9 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-all" title="Compare">
              <BarChart3 size={15} />
            </button>
          </div>
        </div>

        {/* Bottom hero content */}
        <div className="absolute bottom-0 left-0 right-0 z-10 px-4 sm:px-8 pb-5 sm:pb-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center flex-wrap gap-2 mb-2.5">
              {school.type && (
                <span className="bg-emerald-500/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">{school.type}</span>
              )}
              {school.level && (
                <span className="bg-white/20 backdrop-blur-sm text-white text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide">{school.level} School</span>
              )}
              {school.isFeatured && (
                <span className="bg-amber-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Award size={9} /> Featured
                </span>
              )}
            </div>

            <h1 className="text-white font-black text-2xl sm:text-3xl md:text-4xl leading-tight mb-2 drop-shadow-xl">
              {school.name}
              {school.status === 'approved' && (
                <span className="inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 bg-emerald-500 rounded-full ml-2 shrink-0 align-middle">
                  <CheckCircle size={14} className="text-white" strokeWidth={3} />
                </span>
              )}
            </h1>

            <div className="flex items-center flex-wrap gap-3 mb-4">
              <span className="flex items-center gap-1.5 text-white/75 text-sm">
                <MapPin size={13} />
                {[school.city, school.state, school.country].filter(Boolean).join(', ')}
              </span>
              {(school.rating ?? 0) > 0 && (
                <span className="flex items-center gap-1 bg-black/30 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  <Star size={10} className="text-amber-400 fill-amber-400" />
                  {school.rating.toFixed(1)}
                  {school.reviewCount > 0 && <span className="text-white/50 font-normal ml-0.5">({school.reviewCount})</span>}
                </span>
              )}
              <span className="text-white/40 text-xs hidden sm:inline">{(school.profileViews || 0).toLocaleString()} views</span>
            </div>

            <div className="flex items-center flex-wrap gap-2">
              {school?.admission?.isOpen && (
                <button onClick={() => setShowAdmission(true)}
                  className="bg-amber-500 text-white font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-amber-400 active:scale-95 transition-all shadow-lg shadow-amber-900/30 flex items-center gap-2">
                  <ClipboardList size={15} /> Apply Now
                </button>
              )}
              <a href={enquireHref}
                className="bg-emerald-600 text-white font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-emerald-500 active:scale-95 transition-all shadow-lg shadow-emerald-900/30">
                Enquire
              </a>
              {photos.length > 1 && (
                <button onClick={() => setGalleryLightboxIdx(0)}
                  className="bg-white/20 backdrop-blur-sm text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-white/30 active:scale-95 transition-all flex items-center gap-2">
                  📷 {photos.length} Photos
                </button>
              )}
              {school.campusStory && (
                <button onClick={() => setVideoLightbox(school.campusStory)}
                  className="bg-white/20 backdrop-blur-sm text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-white/30 active:scale-95 transition-all flex items-center gap-2">
                  <Play size={13} /> Campus Tour
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── SCHOOL NAV ────────────────────────────────────────────────── */}
      <SchoolNav school={school} active={activeSection} onApply={() => setShowAdmission(true)} />

      {/* ── QUICK STATS STRIP ─────────────────────────────────────────── */}
      <div style={{ background: 'linear-gradient(90deg, #091f10 0%, #0d2918 40%, #0f3d21 100%)' }}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="py-3 sm:py-4 flex items-center justify-between overflow-x-auto scrollbar-hide gap-1">
            {[
              { label: 'Type', value: school.type },
              { label: 'Level', value: school.level },
              { label: 'State', value: school.state },
              { label: 'Curriculum', value: Array.isArray(school.curriculum) ? school.curriculum.join(' · ') : school.curriculum },
              { label: 'Tuition', value: formatFee(school.fees?.tuition || school.fees?.termly) },
            ].filter(s => s.value).map((stat, i) => (
              <div key={i} className="flex flex-col items-center text-center shrink-0 px-3 sm:flex-1">
                <span className="text-white/40 text-[9px] font-bold uppercase tracking-widest mb-0.5 whitespace-nowrap">{stat.label}</span>
                <span className="text-white font-bold text-xs sm:text-sm whitespace-nowrap">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ──────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        <div className="lg:grid lg:grid-cols-[1fr_288px] lg:gap-7 lg:items-start">

          {/* ── LEFT COLUMN ─────────────────────────────────────────── */}
          <div className="space-y-5 min-w-0">

            {/* ABOUT */}
            <section id="sd-about" className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center shrink-0">
                  <Building2 size={16} className="text-emerald-600" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 text-base leading-tight">About the School</h2>
                  {school.city && <p className="text-xs text-gray-400">{school.city}, {school.state}</p>}
                </div>
              </div>
              <div className="px-5 py-5 space-y-4">
                {school.description ? (
                  <p className="text-gray-600 text-sm leading-relaxed">{school.description}</p>
                ) : (
                  <p className="text-gray-400 text-sm italic">No description provided yet.</p>
                )}

                {(school.established || school.studentCount || school.gender || school.religion || school.boardingType) && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {school.established && (
                      <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-2">
                        <Calendar size={13} className="text-gray-400 shrink-0" />
                        <div>
                          <p className="text-[10px] text-gray-400 font-medium">Established</p>
                          <p className="font-bold text-gray-800 text-sm">{school.established}</p>
                        </div>
                      </div>
                    )}
                    {school.studentCount && (
                      <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-2">
                        <Users size={13} className="text-gray-400 shrink-0" />
                        <div>
                          <p className="text-[10px] text-gray-400 font-medium">Students</p>
                          <p className="font-bold text-gray-800 text-sm">{Number(school.studentCount).toLocaleString()}</p>
                        </div>
                      </div>
                    )}
                    {school.gender && (
                      <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-2">
                        <Users size={13} className="text-gray-400 shrink-0" />
                        <div>
                          <p className="text-[10px] text-gray-400 font-medium">Gender</p>
                          <p className="font-bold text-gray-800 text-sm capitalize">{school.gender}</p>
                        </div>
                      </div>
                    )}
                    {school.boardingType && (
                      <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-2">
                        <Building2 size={13} className="text-gray-400 shrink-0" />
                        <div>
                          <p className="text-[10px] text-gray-400 font-medium">Boarding</p>
                          <p className="font-bold text-gray-800 text-sm capitalize">{school.boardingType}</p>
                        </div>
                      </div>
                    )}
                    {school.religion && (
                      <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-2">
                        <Building2 size={13} className="text-gray-400 shrink-0" />
                        <div>
                          <p className="text-[10px] text-gray-400 font-medium">Religion</p>
                          <p className="font-bold text-gray-800 text-sm">{school.religion}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {school.curriculum && (
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Curriculum</p>
                    <div className="flex flex-wrap gap-2">
                      {(Array.isArray(school.curriculum) ? school.curriculum : [school.curriculum]).map((c) => (
                        <span key={c} className="flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                          <CheckCircle size={10} /> {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {school.achievements?.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Achievements</p>
                    <div className="space-y-2">
                      {school.achievements.slice(0, 5).map((ach, i) => (
                        <div key={i} className="flex items-start gap-2.5 bg-amber-50 border border-amber-100 rounded-xl p-3">
                          <div className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                            <Award size={13} className="text-amber-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-gray-900 text-sm leading-snug">{typeof ach === 'string' ? ach : ach.title}</p>
                            {typeof ach === 'object' && ach.description && (
                              <p className="text-gray-500 text-xs mt-0.5">{ach.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* GALLERY */}
            {photos.length > 0 && (
              <section id="sd-gallery" className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                      <span className="text-sm">🖼️</span>
                    </div>
                    <h2 className="font-bold text-gray-900 text-base">Gallery</h2>
                  </div>
                  {photos.length > 4 && (
                    <button onClick={() => setGalleryLightboxIdx(0)} className="text-xs text-emerald-600 font-semibold hover:underline">
                      View all {photos.length}
                    </button>
                  )}
                </div>
                <div className="p-3 sm:p-4">
                  <div className="grid grid-cols-4 gap-2">
                    {/* Large first image spans 2 cols × 2 rows */}
                    <div className="col-span-2 row-span-2 relative rounded-xl overflow-hidden cursor-pointer group"
                      style={{ aspectRatio: '1/1' }}
                      onClick={() => setGalleryLightboxIdx(0)}>
                      <img src={photos[0]} alt="Gallery 1" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
                    </div>
                    {photos.slice(1, 4).map((src, i) => (
                      <div key={i} className="relative rounded-xl overflow-hidden cursor-pointer group"
                        style={{ aspectRatio: '1/1' }}
                        onClick={() => setGalleryLightboxIdx(i + 1)}>
                        <img src={src} alt={`Gallery ${i + 2}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
                        {i === 2 && photos.length > 4 && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-xl">
                            <span className="text-white font-black text-xl">+{photos.length - 4}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* VIDEOS */}
            {schoolVideos.length > 0 && (
              <section id="sd-videos" className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center shrink-0">
                    <Play size={16} className="text-red-500" />
                  </div>
                  <h2 className="font-bold text-gray-900 text-base">Campus Videos</h2>
                </div>
                <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {schoolVideos.map((url, i) => {
                    const thumb = isYoutube(url) ? getYoutubeThumbnail(url) : null;
                    return (
                      <button key={i} onClick={() => setVideoLightbox(url)}
                        className="relative rounded-xl overflow-hidden group focus:outline-none"
                        style={{ aspectRatio: '16/9' }}>
                        {thumb ? (
                          <img src={thumb} alt={`Video ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                            <Play size={24} className="text-white/50" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/25 group-hover:bg-black/45 transition-all duration-300 flex items-center justify-center">
                          <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                            <Play size={16} className="text-gray-800 ml-0.5 fill-gray-800" />
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {/* EXAM RESULTS */}
            {((school.jambReports?.length > 0) || (school.waecReports?.length > 0)) && (
              <section id="sd-results" className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
                  <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center shrink-0">
                    <Award size={16} className="text-amber-600" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900 text-base">Exam Results</h2>
                    <p className="text-xs text-gray-400">Outstanding JAMB & WAEC performances</p>
                  </div>
                </div>
                <div className="px-5 py-5 space-y-6">
                  {school.jambReports?.length > 0 && (
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">JAMB UTME Top Scorers</p>
                      <ReportSlideshow items={school.jambReports} renderCard={(r) => <JambCard report={r} schoolName={school.name} />} />
                    </div>
                  )}
                  {school.waecReports?.length > 0 && (
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">WAEC SSCE Outstanding Results</p>
                      <ReportSlideshow items={school.waecReports} renderCard={(r) => <WaecCard report={r} schoolName={school.name} />} />
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* FACILITIES */}
            {school.facilities?.length > 0 && (
              <section id="sd-facilities" className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center shrink-0">
                    <Building2 size={16} className="text-purple-600" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900 text-base">Facilities & Amenities</h2>
                    <p className="text-xs text-gray-400">{school.facilities.length} available</p>
                  </div>
                </div>
                <div className="px-5 py-5">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                    {school.facilities.map((f) => (
                      <div key={f} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-gray-50 hover:bg-emerald-50 hover:border-emerald-200 border border-gray-100 transition-all duration-200">
                        <span className="text-2xl">{FACILITY_ICONS[f] || '🏫'}</span>
                        <span className="text-xs font-semibold text-gray-700 text-center leading-tight">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* FEES */}
            <section id="sd-fees" className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
                <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center shrink-0">
                  <DollarSign size={16} className="text-green-600" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 text-base">School Fees</h2>
                  <p className="text-xs text-gray-400">Fee structure overview</p>
                </div>
              </div>
              <div className="px-5 py-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { label: 'Tuition (Annual)', key: 'tuition', grad: 'from-emerald-500 to-emerald-700' },
                    { label: 'Termly Fee',       key: 'termly',  grad: 'from-sky-500 to-sky-700'     },
                    { label: 'Boarding Fee',     key: 'boarding',grad: 'from-violet-500 to-violet-700'},
                    { label: 'Registration',     key: 'registration', grad: 'from-rose-500 to-rose-700' },
                    { label: 'Annual Fee',       key: 'annual',  grad: 'from-amber-500 to-amber-700' },
                    { label: 'Uniform',          key: 'uniform', grad: 'from-cyan-500 to-cyan-700'   },
                  ].filter(({ key }) => school.fees?.[key]).map(({ label, key, grad }) => (
                    <div key={key} className={`bg-gradient-to-br ${grad} rounded-xl p-4 text-white shadow-sm`}>
                      <p className="text-white/65 text-[10px] font-bold uppercase tracking-widest mb-1">{label}</p>
                      <p className="text-white font-black text-xl leading-tight">{formatFee(school.fees[key])}</p>
                    </div>
                  ))}
                </div>
                {(!school.fees || !Object.values(school.fees || {}).some(Boolean)) && (
                  <div className="text-center py-6">
                    <p className="text-gray-400 text-sm">Contact the school for current fee information.</p>
                    <a href={enquireHref} className="mt-2 inline-block text-emerald-600 font-semibold text-sm hover:underline">Enquire Now →</a>
                  </div>
                )}
                {school.fees?.notes && (
                  <div className="mt-3 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                    <p className="text-amber-800 text-xs leading-relaxed">{school.fees.notes}</p>
                  </div>
                )}
                <p className="text-gray-400 text-[11px] mt-3 italic">* Fees are indicative. Contact the school to confirm current rates.</p>
              </div>
            </section>

            {/* ADMISSION BANNER */}
            {school?.admission?.isOpen && (
              <div id="sd-admission" className="rounded-2xl overflow-hidden shadow-md" style={{ background: 'linear-gradient(135deg, #78350f 0%, #92400e 60%, #b45309 100%)' }}>
                <div className="px-5 sm:px-6 py-5 sm:py-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center shrink-0">
                    <ClipboardList size={22} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-amber-300 text-amber-900 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide">Open Now</span>
                      {school.admission.session && <span className="text-amber-200/65 text-[10px]">{school.admission.session} Session</span>}
                    </div>
                    <h3 className="text-white font-black text-xl mb-1">Admission is Open!</h3>
                    {school.admission.description && (
                      <p className="text-amber-200/75 text-sm leading-relaxed mb-2">{school.admission.description}</p>
                    )}
                    {school.admission.type === 'class-based' && school.admission.classes?.filter(c => c.isAvailable).length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {school.admission.classes.filter(c => c.isAvailable).map(cls => (
                          <span key={cls.name} className="bg-white/20 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                            {cls.name} — ₦{cls.price.toLocaleString()}
                          </span>
                        ))}
                      </div>
                    )}
                    {school.admission.type === 'general' && school.admission.generalPrice > 0 && (
                      <p className="text-amber-300 font-bold text-sm">Form Fee: ₦{school.admission.generalPrice.toLocaleString()}</p>
                    )}
                    {school.admission.deadline && (
                      <p className="text-amber-200/55 text-xs mt-1">
                        Deadline: {new Date(school.admission.deadline).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                  <button onClick={() => setShowAdmission(true)}
                    className="bg-white text-amber-800 font-black text-sm px-6 py-3 rounded-xl hover:bg-amber-50 active:scale-95 transition-all shadow-lg whitespace-nowrap self-start sm:self-auto shrink-0">
                    Apply Now →
                  </button>
                </div>
              </div>
            )}

            {/* REVIEWS */}
            <section id="sd-reviews" className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center shrink-0">
                    <Star size={14} className="text-amber-500 fill-amber-500" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900 text-base">Reviews</h2>
                    {reviewTotal > 0 && <p className="text-xs text-gray-400">{reviewTotal} {reviewTotal === 1 ? 'review' : 'reviews'}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {user && !userReview && !showForm && (
                    <button onClick={() => setShowForm(true)}
                      className="text-xs font-bold text-emerald-600 border border-emerald-200 px-3 py-1.5 rounded-full hover:bg-emerald-50 transition-all">
                      Write a Review
                    </button>
                  )}
                  {!user && (
                    <Link to="/login" className="text-xs font-bold text-emerald-600 hover:underline">Login to review →</Link>
                  )}
                </div>
              </div>

              <div className="px-5 py-5 space-y-5">
                {/* Rating summary */}
                {reviewTotal > 0 && (
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-gray-50 rounded-2xl p-4">
                    <div className="flex flex-col items-center justify-center bg-white rounded-xl px-6 py-4 shadow-sm min-w-[100px] shrink-0">
                      <span className="text-4xl font-black text-gray-800 leading-none">
                        {school.rating ? school.rating.toFixed(1) : (Object.entries(reviewDist).reduce((a,[k,v])=>a+Number(k)*v,0)/reviewTotal).toFixed(1)}
                      </span>
                      <div className="flex gap-0.5 mt-1.5">
                        {[1,2,3,4,5].map(n => (
                          <Star key={n} size={10} className={n <= Math.round(school.rating||0) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />
                        ))}
                      </div>
                      <span className="text-[10px] text-gray-400 mt-1 whitespace-nowrap">{reviewTotal} reviews</span>
                    </div>
                    <div className="flex-1 w-full space-y-1.5">
                      {[5,4,3,2,1].map(star => (
                        <div key={star} className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-500 w-3 font-bold shrink-0">{star}</span>
                          <Star size={9} className="text-amber-400 fill-amber-400 shrink-0" />
                          <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-amber-400 h-full rounded-full transition-all duration-500"
                              style={{ width: reviewTotal ? `${((reviewDist[star]||0)/reviewTotal)*100}%` : '0%' }} />
                          </div>
                          <span className="text-[10px] text-gray-400 w-4 text-right shrink-0">{reviewDist[star]||0}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Review form */}
                {showForm && (
                  <form onSubmit={handleSubmitReview} className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-gray-800 text-sm">Write Your Review</h3>
                      <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 transition">
                        <X size={16} />
                      </button>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Rating</p>
                      <div className="flex gap-1">
                        {[1,2,3,4,5].map(n => (
                          <button key={n} type="button" onClick={() => setForm(f => ({ ...f, rating: n }))}
                            className="transition hover:scale-110 active:scale-95">
                            <Star size={24} className={n <= form.rating ? 'text-amber-500 fill-amber-500' : 'text-gray-300 fill-gray-100'} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white">
                      {REVIEW_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <input type="text" maxLength={100} placeholder="Summary (optional)"
                      value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
                    <textarea rows={4} maxLength={1000} required placeholder="Share your honest experience with this school..."
                      value={form.text} onChange={e => setForm(f => ({ ...f, text: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-400" />
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                        <input type="checkbox" checked={form.isAnonymous} onChange={e => setForm(f => ({ ...f, isAnonymous: e.target.checked }))} className="rounded accent-emerald-600" />
                        Post anonymously
                      </label>
                      <span className="text-[10px] text-gray-400">{form.text.length}/1000</span>
                    </div>
                    <button type="submit" disabled={submitting}
                      className="w-full bg-emerald-600 text-white font-bold text-sm py-3 rounded-xl hover:bg-emerald-500 disabled:opacity-50 transition-all shadow-md shadow-emerald-900/20">
                      {submitting ? 'Submitting…' : 'Submit Review'}
                    </button>
                  </form>
                )}

                {/* Already reviewed */}
                {userReview && (
                  <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-start gap-3">
                    <CheckCircle size={16} className="text-green-600 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-green-800 font-medium">You've reviewed this school</p>
                      <p className="text-xs text-green-600 mt-0.5">{userReview.text?.slice(0, 100)}{userReview.text?.length > 100 ? '…' : ''}</p>
                    </div>
                    <button onClick={() => handleDeleteReview(userReview._id)} className="text-red-400 hover:text-red-600 transition shrink-0">
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}

                {/* Review list */}
                {reviewsLoading ? (
                  <div className="space-y-3">
                    {[1,2,3].map(i => <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />)}
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="text-center py-10">
                    <MessageSquare size={32} className="text-gray-200 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm font-medium">No reviews yet</p>
                    <p className="text-gray-400 text-xs mt-1">Be the first to share your experience.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reviews.map((r) => {
                      const reviewerName = r.isAnonymous ? 'Anonymous' : (r.user?.name || r.authorName || 'User');
                      const initial = r.isAnonymous ? '?' : reviewerName[0]?.toUpperCase() || '?';
                      return (
                        <div key={r._id} className="bg-gray-50 border border-gray-100 rounded-2xl p-4 sm:p-5 group hover:shadow-sm transition-shadow">
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white text-sm font-extrabold shadow-sm"
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
                                  {r.category && r.category !== 'General' && (
                                    <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full font-semibold">{r.category}</span>
                                  )}
                                  {(user?._id === r.user?._id || user?.role === 'admin') && (
                                    <button onClick={() => handleDeleteReview(r._id)}
                                      className="text-gray-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100 p-0.5">
                                      <Trash2 size={13} />
                                    </button>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-0.5 mb-2">
                                {[1,2,3,4,5].map(s => (
                                  <Star key={s} size={12} className={s <= r.rating ? 'text-amber-500 fill-amber-500' : 'text-gray-200 fill-gray-200'} />
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
                  <div className="flex items-center justify-center gap-3 pt-1">
                    <button disabled={reviewPage === 1} onClick={() => fetchReviews(school._id, reviewPage - 1)}
                      className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 transition">
                      <ChevronLeft size={14} />
                    </button>
                    <span className="text-xs text-gray-500 font-medium">Page {reviewPage} of {reviewPages}</span>
                    <button disabled={reviewPage === reviewPages} onClick={() => fetchReviews(school._id, reviewPage + 1)}
                      className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 transition">
                      <ChevronRight size={14} />
                    </button>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* ── RIGHT SIDEBAR (desktop only) ───────────────────────── */}
          <div className="hidden lg:block">
            <div className="sticky top-[116px] space-y-4">

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
                  <h3 className="font-bold text-gray-800 text-sm">Quick Actions</h3>
                </div>
                <div className="p-3 space-y-2">
                  {school?.admission?.isOpen && (
                    <button onClick={() => setShowAdmission(true)}
                      className="w-full flex items-center gap-3 bg-amber-500 hover:bg-amber-400 text-white font-bold text-sm px-4 py-3 rounded-xl active:scale-95 transition-all shadow-sm">
                      <ClipboardList size={16} /> Apply for Admission
                    </button>
                  )}
                  {school?.contact?.phone && (
                    <a href={`tel:${school.contact.phone}`}
                      className="w-full flex items-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm px-4 py-3 rounded-xl active:scale-95 transition-all">
                      <Phone size={16} /> {school.contact.phone}
                    </a>
                  )}
                  {school?.contact?.email && (
                    <a href={`mailto:${school.contact.email}`}
                      className="w-full flex items-center gap-3 border border-emerald-200 text-emerald-700 hover:bg-emerald-50 font-semibold text-sm px-4 py-3 rounded-xl active:scale-95 transition-all">
                      <Mail size={16} /> Send Email
                    </a>
                  )}
                  <button onClick={handleAddToCompare}
                    className="w-full flex items-center gap-3 border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold text-sm px-4 py-3 rounded-xl active:scale-95 transition-all">
                    <BarChart3 size={16} /> Compare Schools
                  </button>
                  <button onClick={handleShare}
                    className="w-full flex items-center gap-3 border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold text-sm px-4 py-3 rounded-xl active:scale-95 transition-all">
                    <Share2 size={16} /> Share School
                  </button>
                </div>
              </div>

              {/* At a Glance */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
                  <h3 className="font-bold text-gray-800 text-sm">At a Glance</h3>
                </div>
                <div className="p-4 space-y-3">
                  {[
                    { label: 'School Type', value: school.type, icon: Building2 },
                    { label: 'Level', value: school.level, icon: GraduationCap },
                    { label: 'Location', value: [school.city, school.state].filter(Boolean).join(', '), icon: MapPin },
                    { label: 'Established', value: school.established, icon: Calendar },
                    { label: 'Students', value: school.studentCount ? Number(school.studentCount).toLocaleString() : null, icon: Users },
                  ].filter(i => i.value).map(({ label, value, icon: Icon }) => (
                    <div key={label} className="flex items-center gap-3">
                      <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                        <Icon size={13} className="text-gray-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-gray-400 font-medium">{label}</p>
                        <p className="text-sm font-semibold text-gray-800 truncate">{value}</p>
                      </div>
                    </div>
                  ))}
                  {(school.fees?.tuition || school.fees?.termly) && (
                    <div className="mt-1 pt-3 border-t border-gray-100">
                      <p className="text-[10px] text-gray-400 font-medium mb-0.5">Starting Fees</p>
                      <p className="text-lg font-black text-emerald-600">{formatFee(school.fees.tuition || school.fees.termly)}</p>
                      <p className="text-[10px] text-gray-400">per term / year</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact */}
              {(school.contact?.phone || school.contact?.email || school.contact?.website || school.address) && (
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <h3 className="font-bold text-gray-800 text-sm">Contact</h3>
                  </div>
                  <div className="p-4 space-y-3">
                    {school.address && (
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                          <MapPin size={13} className="text-gray-500" />
                        </div>
                        <p className="text-sm text-gray-700 leading-snug">{[school.address, school.city, school.state].filter(Boolean).join(', ')}</p>
                      </div>
                    )}
                    {school.contact?.phone && (
                      <a href={`tel:${school.contact.phone}`} className="flex items-center gap-3 group">
                        <div className="w-7 h-7 bg-emerald-50 rounded-lg flex items-center justify-center shrink-0">
                          <Phone size={13} className="text-emerald-600" />
                        </div>
                        <span className="text-sm text-gray-700 group-hover:text-emerald-600 transition-colors">{school.contact.phone}</span>
                      </a>
                    )}
                    {school.contact?.email && (
                      <a href={`mailto:${school.contact.email}`} className="flex items-center gap-3 group">
                        <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                          <Mail size={13} className="text-blue-500" />
                        </div>
                        <span className="text-sm text-gray-700 group-hover:text-blue-600 transition-colors truncate">{school.contact.email}</span>
                      </a>
                    )}
                    {school.contact?.website && (
                      <a href={school.contact.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group">
                        <div className="w-7 h-7 bg-purple-50 rounded-lg flex items-center justify-center shrink-0">
                          <Globe size={13} className="text-purple-500" />
                        </div>
                        <span className="text-sm text-gray-700 group-hover:text-purple-600 transition-colors">Visit Website</span>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Study Abroad CTA */}
              <div className="rounded-2xl p-5 text-white relative overflow-hidden shadow-xl"
                style={{ background: 'linear-gradient(135deg, #0d2918 0%, #0f3d21 50%, #1a5c30 100%)' }}>
                <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-400/10 rounded-full -translate-y-10 translate-x-10" />
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-8 -translate-x-6" />
                <div className="relative z-10">
                  <div className="w-10 h-10 bg-emerald-400/20 rounded-xl flex items-center justify-center mb-3">
                    <GraduationCap size={20} className="text-emerald-300" />
                  </div>
                  <h4 className="font-extrabold text-base mb-1.5">Study Abroad?</h4>
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

      {/* ── MOBILE BOTTOM STRIP ───────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 lg:hidden z-40 bg-white border-t border-gray-100 shadow-2xl">
        <div className="flex items-center px-4 py-3 gap-2 max-w-lg mx-auto">
          {school?.admission?.isOpen && (
            <button onClick={() => setShowAdmission(true)}
              className="flex-1 bg-amber-500 hover:bg-amber-400 text-white font-bold text-xs py-2.5 rounded-xl active:scale-95 transition-all">
              Apply Now
            </button>
          )}
          <a href={enquireHref}
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 rounded-xl text-center active:scale-95 transition-all">
            Enquire
          </a>
          {school?.contact?.phone && (
            <a href={`tel:${school.contact.phone}`}
              className="w-10 h-10 border border-gray-200 rounded-xl flex items-center justify-center text-gray-600 hover:bg-gray-50 active:scale-95 transition-all shrink-0">
              <Phone size={16} />
            </a>
          )}
          <button onClick={handleAddToCompare}
            className="w-10 h-10 border border-gray-200 rounded-xl flex items-center justify-center text-gray-600 hover:bg-gray-50 active:scale-95 transition-all shrink-0">
            <BarChart3 size={16} />
          </button>
        </div>
      </div>

      {/* ── PHOTO LIGHTBOX ────────────────────────────────────────────── */}
      {galleryLightboxIdx !== null && photos[galleryLightboxIdx] && (
        <div className="fixed inset-0 z-[100] bg-black/96 flex items-center justify-center p-4"
          onClick={() => setGalleryLightboxIdx(null)}>
          <button className="absolute top-4 right-4 text-white/70 hover:text-white transition z-10">
            <X size={26} />
          </button>
          {photos.length > 1 && (
            <>
              <button onClick={e => { e.stopPropagation(); prevPhoto(); }}
                className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/15 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition z-10">
                <ChevronLeft size={20} />
              </button>
              <button onClick={e => { e.stopPropagation(); nextPhoto(); }}
                className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/15 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition z-10">
                <ChevronRight size={20} />
              </button>
            </>
          )}
          <img src={photos[galleryLightboxIdx]} alt="" className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
            onClick={e => e.stopPropagation()} />
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-xs">{galleryLightboxIdx + 1} / {photos.length}</p>
        </div>
      )}

      {/* ── VIDEO LIGHTBOX ────────────────────────────────────────────── */}
      {videoLightbox && (
        <div className="fixed inset-0 z-[100] bg-black/96 flex items-center justify-center p-4"
          onClick={() => setVideoLightbox(null)}>
          <button className="absolute top-4 right-4 text-white/70 hover:text-white transition z-10">
            <X size={26} />
          </button>
          <div className="w-full max-w-4xl aspect-video" onClick={e => e.stopPropagation()}>
            {isYoutube(videoLightbox) ? (
              <iframe src={`${getYoutubeEmbed(videoLightbox)}&autoplay=1`}
                className="w-full h-full rounded-xl"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen title="School video" />
            ) : (
              <video src={videoLightbox} controls autoPlay className="w-full h-full rounded-xl" />
            )}
          </div>
        </div>
      )}

      {/* ── ADMISSION MODAL ───────────────────────────────────────────── */}
      {showAdmission && school?.admission?.isOpen && (
        <AdmissionModal school={school} admission={school.admission} onClose={() => setShowAdmission(false)} />
      )}
    </div>
  );
}
