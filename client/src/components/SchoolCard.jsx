import { Link } from 'react-router-dom';
import { MapPin, BookOpen, BarChart3, ArrowRight, CheckCircle } from 'lucide-react';

export default function SchoolCard({ school, onCompare, isSelected }) {
  const href = `/schools/${school.slug || school._id}`;

  return (
    <div className={`group bg-white rounded-2xl border transition-all duration-300 flex flex-col overflow-hidden shadow-sm ${
      isSelected
        ? 'border-green-500 shadow-lg ring-2 ring-green-100'
        : 'border-gray-100 hover:border-green-200 hover:shadow-xl hover:-translate-y-0.5'
    }`}>

      {/* Image — taller, with location overlay */}
      <Link to={href} className="block relative w-full h-52 bg-gradient-to-br from-green-50 to-emerald-100 overflow-hidden shrink-0">
        {school.images?.[0] ? (
          <img
            src={school.images[0]}
            alt={school.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-green-200">
            <BookOpen size={48} />
          </div>
        )}

        {/* Dark gradient at bottom for overlay legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Featured badge */}
        {school.isFeatured && (
          <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-sm">
            ★ Featured
          </div>
        )}

        {/* Selected overlay */}
        {isSelected && (
          <div className="absolute top-3 left-3 bg-green-600 text-white rounded-full w-7 h-7 flex items-center justify-center shadow-md">
            <CheckCircle size={16} />
          </div>
        )}

        {/* Location chip — bottom-left overlay */}
        <div className="absolute bottom-3 left-3">
          <div className="flex items-center gap-1 bg-black/55 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-1 rounded-full">
            <MapPin size={9} />
            <span>{[school.city, school.state].filter(Boolean).join(', ')}</span>
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2.5 flex-1">

        {/* School name */}
        <Link to={href} className="group/name">
          <h3 className="font-bold text-gray-900 text-[15px] leading-snug line-clamp-2 group-hover/name:text-green-700 transition">
            {school.name}
          </h3>
        </Link>

        {/* Curriculum chips */}
        {school.curriculum?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {school.curriculum.slice(0, 3).map((c) => (
              <span key={c} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-semibold">
                {c}
              </span>
            ))}
          </div>
        )}

        {/* Action row */}
        <div className="mt-auto pt-3 border-t border-gray-50 flex gap-2">
          <Link
            to={href}
            className="flex-1 flex items-center justify-center gap-1.5 bg-green-700 text-white text-xs font-bold py-2.5 rounded-xl hover:bg-green-800 active:scale-[0.97] transition shadow-sm"
          >
            Read More <ArrowRight size={12} />
          </Link>
          <button
            onClick={() => onCompare(school)}
            title={isSelected ? 'Remove from compare' : 'Add to compare'}
            className={`flex items-center justify-center gap-1.5 text-xs font-semibold px-3.5 py-2.5 rounded-xl border-2 transition ${
              isSelected
                ? 'bg-green-600 text-white border-green-600 hover:bg-green-700'
                : 'border-gray-200 text-gray-500 hover:border-green-400 hover:text-green-700 hover:bg-green-50'
            }`}
          >
            <BarChart3 size={13} />
            {isSelected ? '✓' : 'Compare'}
          </button>
        </div>
      </div>
    </div>
  );
}
