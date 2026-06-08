import { Link } from 'react-router-dom';
import { MapPin, BookOpen, BarChart3, ArrowRight, CheckCircle, Star, BadgeCheck } from 'lucide-react';
import { useHoverAnimation, useScaleIn } from '../hooks/useGsapAnimations';

const TYPE_STYLE = {
  private:       { bg: 'bg-violet-100',  text: 'text-violet-700',  label: 'Private'       },
  public:        { bg: 'bg-blue-100',    text: 'text-blue-700',    label: 'Public'        },
  federal:       { bg: 'bg-amber-100',   text: 'text-amber-700',   label: 'Federal'       },
  international: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'International' },
};

export default function SchoolCard({ school, onCompare, isSelected }) {
  const href = `/schools/${school.slug || school._id}`;
  const cardRef = useScaleIn(0.5, 0);
  const imageRef = useHoverAnimation(1.06, 0.3);
  const typeStyle = TYPE_STYLE[school.type] || { bg: 'bg-gray-100', text: 'text-gray-600', label: school.type || 'School' };
  const location = [school.city, school.state].filter(Boolean).join(', ');

  return (
    <div
      ref={cardRef}
      className={`group bg-white rounded-2xl flex flex-col overflow-hidden transition-all duration-300 ${
        isSelected
          ? 'shadow-xl ring-2 ring-green-500 ring-offset-2'
          : 'shadow-md hover:shadow-2xl hover:-translate-y-1'
      }`}
    >
      {/* ── IMAGE ──────────────────────────────────── */}
      <Link to={href} className="block relative w-full h-48 overflow-hidden shrink-0 bg-linear-to-br from-emerald-50 to-green-100">
        {school.images?.[0] ? (
          <img
            ref={imageRef}
            src={school.images[0]}
            alt={school.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <BookOpen size={40} className="text-green-300" />
            <span className="text-green-400 text-xs font-medium">No image yet</span>
          </div>
        )}

        {/* Gradient scrim */}
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent" />

        {/* Featured ribbon */}
        {school.isFeatured && (
          <div className="absolute top-0 right-0">
            <div className="bg-yellow-400 text-yellow-900 text-[9px] font-extrabold px-3 py-1 rounded-bl-xl flex items-center gap-1 shadow">
              <Star size={9} fill="currentColor" /> Featured
            </div>
          </div>
        )}

        {/* Selected checkmark */}
        {isSelected && (
          <div className="absolute top-3 left-3 bg-green-500 text-white rounded-full w-7 h-7 flex items-center justify-center shadow-lg ring-2 ring-white">
            <CheckCircle size={15} />
          </div>
        )}

        {/* Type badge */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          {!isSelected && (
            <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${typeStyle.bg} ${typeStyle.text}`}>
              {typeStyle.label}
            </span>
          )}
        </div>

        {/* Location — bottom overlay */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-1 rounded-full">
            <MapPin size={9} className="shrink-0" />
            <span className="truncate">{location || 'Nigeria'}</span>
          </div>
          {school.level && (
            <span className="bg-white/20 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize">
              {school.level}
            </span>
          )}
        </div>
      </Link>

      {/* ── CONTENT ────────────────────────────────── */}
      <div className="flex flex-col flex-1 p-4 gap-3">

        {/* School name + verified */}
        <Link to={href}>
          <h3 className="font-extrabold text-gray-900 text-[14px] leading-snug line-clamp-2 group-hover:text-green-700 transition flex items-start gap-1">
            {school.name}
            {school.isFeatured && <BadgeCheck size={14} className="text-green-500 shrink-0 mt-0.5" />}
          </h3>
        </Link>

        {/* Curriculum chips */}
        {school.curriculum?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {school.curriculum.slice(0, 3).map((c) => (
              <span key={c} className="text-[10px] bg-green-50 text-green-700 border border-green-100 px-2 py-0.5 rounded-full font-semibold">
                {c}
              </span>
            ))}
          </div>
        )}

        {/* Fee */}
        {school.fees?.tuition ? (
          <div className="flex items-center gap-1.5 text-gray-500 text-xs">
            <span className="font-bold text-gray-900 text-sm">₦{Number(school.fees.tuition).toLocaleString()}</span>
            <span className="text-gray-400">/ year</span>
          </div>
        ) : null}

        {/* Divider */}
        <div className="h-px bg-gray-100 mt-auto" />

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onCompare(school)}
            title={isSelected ? 'Remove from compare' : 'Add to compare'}
            className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 rounded-xl border-2 transition active:scale-[0.97] ${
              isSelected
                ? 'bg-green-600 border-green-600 text-white shadow-sm shadow-green-200'
                : 'border-green-600 text-green-700 hover:bg-green-600 hover:text-white hover:shadow-sm hover:shadow-green-200'
            }`}
          >
            <BarChart3 size={13} />
            {isSelected ? 'Added ✓' : 'Compare School'}
          </button>
          <Link
            to={href}
            title="View school profile"
            className="flex items-center justify-center px-3 py-2.5 rounded-xl border-2 border-gray-200 text-gray-500 hover:border-green-400 hover:text-green-700 hover:bg-green-50 transition"
          >
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}
