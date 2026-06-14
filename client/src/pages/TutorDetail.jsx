import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star, MapPin, Monitor, CheckCircle, Clock, Users, ArrowLeft,
  BookOpen, GraduationCap, Award, Video, MessageSquare,
  Shield, User, Search, Zap, TrendingUp,
} from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

// ── Replace with your actual YouTube video ID ─────────────────────────────────
const HOW_IT_WORKS_VIDEO_ID = 'hT_nvWreIhg';

function StarRating({ rating, size = 16, interactive = false, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          onClick={() => interactive && onChange?.(n)}
          onMouseEnter={() => interactive && setHover(n)}
          onMouseLeave={() => interactive && setHover(0)}
          className={`${interactive ? 'cursor-pointer' : ''} ${
            n <= (hover || Math.round(rating))
              ? 'text-yellow-400 fill-yellow-400'
              : 'text-gray-200 fill-gray-200'
          }`}
        />
      ))}
    </div>
  );
}

export default function TutorDetail() {
  const { id } = useParams();
  const { user } = useAuth();

  const [tutor, setTutor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Review form
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '', subject: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/tutors/${id}`);
        setTutor(data.tutor);
        setReviews(data.reviews || []);
        if (data.tutor.subjects?.length) {
          setReviewForm((f) => ({ ...f, subject: data.tutor.subjects[0] }));
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleReview = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please log in to leave a review'); return; }
    setSubmittingReview(true);
    try {
      const { data } = await api.post(`/tutors/${id}/review`, reviewForm);
      setReviews((prev) => [data.review, ...prev]);
      const allRatings = [...reviews, data.review].map(r => r.rating);
      const avg = allRatings.reduce((s, r) => s + r, 0) / allRatings.length;
      setTutor((t) => ({ ...t, rating: Math.round(avg * 10) / 10, reviewCount: allRatings.length }));
      setShowReviewForm(false);
      toast.success('Review submitted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 text-sm">Loading tutor profile…</p>
      </div>
    </div>
  );

  if (notFound) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-sm">
        <GraduationCap size={40} className="text-gray-300 mx-auto mb-4" />
        <h2 className="font-bold text-gray-700 text-xl mb-2">Tutor not found</h2>
        <p className="text-gray-400 text-sm mb-6">This profile may have been deactivated or doesn't exist.</p>
        <Link to="/find-tutoring" className="bg-green-700 text-white font-bold px-6 py-3 rounded-xl hover:bg-green-800 transition text-sm">
          ← Back to Tutors
        </Link>
      </div>
    </div>
  );

  const name = tutor.displayName || tutor.user?.name || 'Tutor';
  const initials = name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  const memberSince = tutor.user?.createdAt ? new Date(tutor.user.createdAt).toLocaleDateString('en-NG', { month: 'long', year: 'numeric' }) : null;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100 px-4">
        <div className="max-w-6xl mx-auto py-3 flex items-center gap-2 text-sm text-gray-500">
          <Link to="/find-tutoring" className="flex items-center gap-1.5 hover:text-green-700 transition font-medium">
            <ArrowLeft size={14} /> Find Tutoring
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-700 font-semibold truncate">{name}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 grid lg:grid-cols-3 gap-8 items-start">

        {/* ── LEFT COLUMN ──────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Profile header card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-linear-to-r from-green-700 to-green-600 h-2" />
            <div className="p-6 sm:p-8">
              <div className="flex items-start gap-5">
                <div className="relative shrink-0">
                  {tutor.profilePhoto ? (
                    <img src={tutor.profilePhoto} alt={name}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-4 border-green-100" />
                  ) : (
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-green-700 flex items-center justify-center text-white text-3xl font-bold border-4 border-green-100">
                      {initials}
                    </div>
                  )}
                  {tutor.isVerified && (
                    <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                      <CheckCircle size={14} className="text-white" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">{name}</h1>
                      {tutor.isVerified && (
                        <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full mt-1">
                          <Shield size={10} /> Verified Tutor
                        </span>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      {tutor.hourlyRateNaira ? (
                        <>
                          <p className="text-2xl font-extrabold text-gray-900">₦{tutor.hourlyRateNaira.toLocaleString()}</p>
                          <p className="text-xs text-gray-400">per hour</p>
                        </>
                      ) : (
                        <p className="text-sm text-gray-400">Rate on request</p>
                      )}
                    </div>
                  </div>

                  {tutor.headline && (
                    <p className="text-gray-600 mt-2 text-sm leading-relaxed">{tutor.headline}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-3 mt-3">
                    {tutor.reviewCount > 0 && (
                      <div className="flex items-center gap-1.5">
                        <StarRating rating={tutor.rating} size={14} />
                        <span className="text-sm font-bold text-gray-700">{tutor.rating.toFixed(1)}</span>
                        <span className="text-sm text-gray-400">({tutor.reviewCount} review{tutor.reviewCount !== 1 ? 's' : ''})</span>
                      </div>
                    )}
                    {tutor.yearsExperience > 0 && (
                      <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                        <Clock size={11} /> {tutor.yearsExperience} yr{tutor.yearsExperience !== 1 ? 's' : ''} experience
                      </span>
                    )}
                    {tutor.totalSessions > 0 && (
                      <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                        <Users size={11} /> {tutor.totalSessions} sessions
                      </span>
                    )}
                    {memberSince && (
                      <span className="text-xs text-gray-400">Joined {memberSince}</span>
                    )}
                  </div>

                  {/* Mode + Location */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {tutor.teachingMode?.includes('online') && (
                      <span className="flex items-center gap-1.5 text-xs bg-blue-50 text-blue-700 border border-blue-100 font-semibold px-3 py-1.5 rounded-full">
                        <Video size={11} /> Online Lessons
                      </span>
                    )}
                    {tutor.teachingMode?.includes('in-person') && (
                      <span className="flex items-center gap-1.5 text-xs bg-purple-50 text-purple-700 border border-purple-100 font-semibold px-3 py-1.5 rounded-full">
                        <MapPin size={11} /> In-Person
                      </span>
                    )}
                    {tutor.state && (
                      <span className="flex items-center gap-1.5 text-xs bg-gray-100 text-gray-600 font-medium px-3 py-1.5 rounded-full">
                        <MapPin size={11} /> {tutor.city ? `${tutor.city}, ` : ''}{tutor.state}
                      </span>
                    )}
                    {tutor.trialAvailable && (
                      <span className="flex items-center gap-1.5 text-xs bg-green-50 text-green-700 border border-green-200 font-bold px-3 py-1.5 rounded-full">
                        🏷️ {tutor.trialDiscountPercent ?? 50}% off first session
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* About */}
          {tutor.bio && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-gray-900 text-lg mb-3 flex items-center gap-2">
                <User size={18} className="text-green-600" /> About {name.split(' ')[0]}
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{tutor.bio}</p>
            </div>
          )}

          {/* Subjects & Levels */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
              <BookOpen size={18} className="text-green-600" /> Subjects & Levels
            </h2>

            {tutor.subjects?.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Subjects Taught</p>
                <div className="flex flex-wrap gap-2">
                  {tutor.subjects.map((s) => (
                    <span key={s} className="text-sm bg-green-50 text-green-800 border border-green-100 font-semibold px-3 py-1.5 rounded-xl">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {tutor.levels?.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Teaching Levels</p>
                <div className="flex flex-wrap gap-2">
                  {tutor.levels.map((l) => (
                    <span key={l} className="text-sm bg-blue-50 text-blue-800 border border-blue-100 font-medium px-3 py-1.5 rounded-xl capitalize">{l}</span>
                  ))}
                </div>
              </div>
            )}

            {tutor.specializations?.length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Specializations</p>
                <div className="flex flex-wrap gap-2">
                  {tutor.specializations.map((s) => (
                    <span key={s} className="text-sm bg-yellow-50 text-yellow-800 border border-yellow-100 font-medium px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                      <Award size={12} /> {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Qualifications */}
          {tutor.qualifications?.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                <GraduationCap size={18} className="text-green-600" /> Qualifications
              </h2>
              <div className="space-y-3">
                {tutor.qualifications.map((q, i) => (
                  <div key={i} className="flex items-start gap-3 pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                    <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                      <Award size={16} className="text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{q.title}</p>
                      {q.institution && <p className="text-xs text-gray-500 mt-0.5">{q.institution}{q.year ? ` · ${q.year}` : ''}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rates */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
              <Award size={18} className="text-green-600" /> Session Rates
            </h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {tutor.trialAvailable && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                  {tutor.hourlyRateNaira > 0 ? (
                    <>
                      <p className="text-2xl font-extrabold text-green-700">
                        ₦{Math.round(tutor.hourlyRateNaira * (1 - (tutor.trialDiscountPercent ?? 50) / 100) * ((tutor.trialDurationMins || 60) / 60)).toLocaleString()}
                      </p>
                      <p className="text-xs font-bold text-green-600 mt-1">First Session ({tutor.trialDiscountPercent ?? 50}% off)</p>
                    </>
                  ) : (
                    <>
                      <p className="text-2xl font-extrabold text-green-700">{tutor.trialDiscountPercent ?? 50}% off</p>
                      <p className="text-xs font-bold text-green-600 mt-1">First Session Discount</p>
                    </>
                  )}
                  <p className="text-xs text-green-500 mt-0.5">{tutor.trialDurationMins || 30} minutes</p>
                </div>
              )}
              {tutor.hourlyRateNaira > 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                  <p className="text-2xl font-extrabold text-gray-900">₦{tutor.hourlyRateNaira.toLocaleString()}</p>
                  <p className="text-xs font-bold text-gray-500 mt-1">1-on-1 Session</p>
                  <p className="text-xs text-gray-400 mt-0.5">per hour</p>
                </div>
              )}
              {tutor.groupRateNaira > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                  <p className="text-2xl font-extrabold text-blue-700">₦{tutor.groupRateNaira.toLocaleString()}</p>
                  <p className="text-xs font-bold text-blue-600 mt-1">Group Session</p>
                  <p className="text-xs text-blue-400 mt-0.5">per person / hour</p>
                </div>
              )}
            </div>
          </div>

          {/* Reviews */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                <Star size={18} className="text-yellow-400 fill-yellow-400" />
                Student Reviews
                {tutor.reviewCount > 0 && (
                  <span className="text-sm font-normal text-gray-400 ml-1">({tutor.reviewCount})</span>
                )}
              </h2>
              {user && !showReviewForm && (
                <button onClick={() => setShowReviewForm(true)}
                  className="text-sm font-semibold text-green-700 border border-green-300 px-4 py-1.5 rounded-xl hover:bg-green-50 transition">
                  Write a Review
                </button>
              )}
            </div>

            {/* Review form */}
            {showReviewForm && (
              <form onSubmit={handleReview} className="mb-6 bg-gray-50 rounded-xl p-5 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Your Review</h3>
                <div className="mb-4">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Your Rating</label>
                  <StarRating rating={reviewForm.rating} size={24} interactive onChange={(r) => setReviewForm((f) => ({ ...f, rating: r }))} />
                </div>
                {tutor.subjects?.length > 0 && (
                  <div className="mb-4">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Subject</label>
                    <select value={reviewForm.subject} onChange={(e) => setReviewForm((f) => ({ ...f, subject: e.target.value }))}
                      className="w-full sm:w-56 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-500">
                      {tutor.subjects.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                )}
                <div className="mb-4">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Comment (optional)</label>
                  <textarea value={reviewForm.comment} onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
                    rows={3} placeholder="Share your experience with other students…"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-500 resize-none" />
                </div>
                <div className="flex gap-2">
                  <button type="submit" disabled={submittingReview}
                    className="bg-green-700 text-white font-bold px-5 py-2 rounded-xl hover:bg-green-800 transition text-sm disabled:opacity-50">
                    {submittingReview ? 'Submitting…' : 'Submit Review'}
                  </button>
                  <button type="button" onClick={() => setShowReviewForm(false)}
                    className="border border-gray-200 text-gray-600 font-semibold px-5 py-2 rounded-xl hover:bg-gray-50 transition text-sm">
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {reviews.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Star size={28} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No reviews yet. Be the first to review after your session!</p>
              </div>
            ) : (
              <div className="space-y-5">
                {reviews.map((r) => {
                  const sName = r.student?.name || 'Student';
                  const sInitials = sName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
                  return (
                    <div key={r._id} className="pb-5 border-b border-gray-50 last:border-0 last:pb-0">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-green-700 text-white flex items-center justify-center text-xs font-bold shrink-0">
                          {sInitials}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-gray-900 text-sm">{sName}</span>
                            {r.subject && <span className="text-[11px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{r.subject}</span>}
                            <span className="text-xs text-gray-400 ml-auto">{new Date(r.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          </div>
                          <StarRating rating={r.rating} size={12} />
                          {r.comment && <p className="text-gray-600 text-sm mt-1.5 leading-relaxed">{r.comment}</p>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN ─────────────────────────────────────────── */}
        <div className="lg:sticky lg:top-24 space-y-4">

          {/* Primary CTA */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
            <div className="bg-linear-to-r from-green-800 to-green-700 px-6 pt-6 pb-5 text-white">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0 overflow-hidden border border-white/20">
                  {tutor.profilePhoto
                    ? <img src={tutor.profilePhoto} alt={name} className="w-full h-full object-cover" />
                    : <span className="text-lg font-black">{initials}</span>}
                </div>
                <div className="min-w-0">
                  <p className="font-extrabold text-base leading-tight truncate">{name}</p>
                  {tutor.trialAvailable && (
                    <p className="text-green-200 text-xs mt-0.5">{tutor.trialDiscountPercent ?? 50}% off your first session</p>
                  )}
                </div>
              </div>

              {tutor.hourlyRateNaira > 0 && (
                <div className="flex items-end gap-1.5 mb-4">
                  <span className="text-3xl font-black">₦{tutor.hourlyRateNaira.toLocaleString()}</span>
                  <span className="text-green-300 text-sm pb-0.5">/ hour</span>
                </div>
              )}

              <Link
                to={`/book/${id}`}
                className="block w-full text-center bg-yellow-400 text-green-900 font-extrabold py-3.5 rounded-xl hover:bg-yellow-300 transition text-sm shadow-lg shadow-black/20"
              >
                Book Discounted Session →
              </Link>
              <p className="text-center text-green-300 text-xs mt-2">{tutor.trialDiscountPercent ?? 50}% off your first session · {tutor.trialDurationMins || 30} minutes</p>
            </div>

            {/* Quick facts */}
            <div className="px-5 py-4 divide-y divide-gray-50 space-y-0">
              {tutor.responseTime && (
                <div className="flex items-center gap-2.5 py-2.5 text-sm">
                  <MessageSquare size={14} className="text-gray-400 shrink-0" />
                  <span className="text-gray-600">Responds <strong className="text-gray-900">{tutor.responseTime}</strong></span>
                </div>
              )}
              {tutor.languages?.length > 0 && (
                <div className="flex items-center gap-2.5 py-2.5 text-sm">
                  <BookOpen size={14} className="text-gray-400 shrink-0" />
                  <span className="text-gray-600">Teaches in <strong className="text-gray-900">{tutor.languages.join(', ')}</strong></span>
                </div>
              )}
              {tutor.teachingMode?.length > 0 && (
                <div className="flex items-center gap-2.5 py-2.5 text-sm">
                  <Monitor size={14} className="text-gray-400 shrink-0" />
                  <span className="text-gray-600 capitalize">{tutor.teachingMode.join(' & ')} lessons</span>
                </div>
              )}
              {tutor.state && (
                <div className="flex items-center gap-2.5 py-2.5 text-sm">
                  <MapPin size={14} className="text-gray-400 shrink-0" />
                  <span className="text-gray-600">{tutor.city ? `${tutor.city}, ` : ''}{tutor.state}</span>
                </div>
              )}
            </div>
          </div>

          {/* How it works + video */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

            {/* Video embed */}
            <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
              <iframe
                src={`https://www.youtube.com/embed/${HOW_IT_WORKS_VIDEO_ID}?rel=0&modestbranding=1&color=white`}
                title="How 1:1 tutoring works"
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Steps */}
            <div className="p-5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">How it works</p>
              <div className="space-y-4">
                {[
                  {
                    n: '1',
                    icon: Search,
                    color: 'bg-green-100 text-green-700',
                    title: 'Browse & choose',
                    desc: 'Read the profile, check reviews, and confirm the tutor fits your goals.',
                  },
                  {
                    n: '2',
                    icon: Video,
                    color: 'bg-blue-100 text-blue-700',
                    title: 'Book your discounted session',
                    desc: 'Pick a date & time on the next page and pay a discounted first-session rate.',
                  },
                  {
                    n: '3',
                    icon: Zap,
                    color: 'bg-yellow-100 text-yellow-700',
                    title: 'Subscribe & learn',
                    desc: 'Loved it? Subscribe for weekly sessions and pay monthly in Naira.',
                  },
                  {
                    n: '4',
                    icon: TrendingUp,
                    color: 'bg-purple-100 text-purple-700',
                    title: 'Track your progress',
                    desc: 'Sessions are auto-booked. Get reminders and watch your results improve.',
                  },
                ].map(({ n, icon: Icon, color, title, desc }) => (
                  <div key={n} className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                      <Icon size={15} />
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <p className="text-sm font-bold text-gray-900 leading-tight">{title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-4 border-t border-gray-50">
                <Link
                  to={`/book/${id}`}
                  className="block w-full text-center bg-green-700 text-white font-bold py-3 rounded-xl hover:bg-green-800 transition text-sm"
                >
                  Get Started — It's Free
                </Link>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
