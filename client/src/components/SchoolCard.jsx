import { Link } from 'react-router-dom';
import { MapPin, BookOpen, CheckCircle } from 'lucide-react';

export default function SchoolCard({ school, onCompare, isSelected }) {
  const formatFee = (amount) =>
    amount ? `₦${Number(amount).toLocaleString()}` : 'Contact school';

  const href = `/schools/${school.slug || school._id}`;

  return (
    <div className={`group bg-white rounded-2xl border transition-all duration-200 flex flex-col overflow-hidden ${
      isSelected
        ? 'border-green-500 shadow-md ring-2 ring-green-200'
        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
    }`}>
      {/* Image — clicks through to detail page */}
      <Link to={href} className="block relative w-full h-40 bg-linear-to-br from-green-50 to-green-100 overflow-hidden">
        {school.images?.[0] ? (
          <img src={school.images[0]} alt={school.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-green-300">
            <BookOpen size={36} />
          </div>
        )}
        {school.isFeatured && (
          <div className="absolute top-2.5 right-2.5 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
            ★ Featured
          </div>
        )}
        {isSelected && (
          <div className="absolute top-2.5 left-2.5 bg-green-600 text-white rounded-full p-0.5">
            <CheckCircle size={16} />
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2.5 flex-1">
        <Link to={href} className="hover:text-green-700 transition">
          <h3 className="font-bold text-gray-900 text-[15px] leading-snug">{school.name}</h3>
        </Link>

        <div className="flex items-center gap-1 text-xs text-gray-400">
          <MapPin size={11} />
          <span>{school.city ? `${school.city}, ` : ''}{school.state}</span>
        </div>

        <div className="flex flex-wrap gap-1">
          <span className="text-[11px] bg-green-50 text-green-700 px-2 py-0.5 rounded-md font-medium capitalize">{school.type}</span>
          <span className="text-[11px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-medium capitalize">{school.level}</span>
          {school.curriculum?.slice(0, 2).map((c) => (
            <span key={c} className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">{c}</span>
          ))}
        </div>

        <div className="text-xs text-gray-500 pt-1 border-t border-gray-100">
          <span className="font-semibold text-gray-700">{formatFee(school.fees?.tuition)}</span>
          <span className="text-gray-400"> / year</span>
          {school.fees?.boarding > 0 && (
            <span className="ml-1.5 text-gray-400">· Boarding: {formatFee(school.fees.boarding)}</span>
          )}
        </div>

        <button
          onClick={() => onCompare(school)}
          className={`mt-auto w-full text-sm py-2.5 rounded-xl font-semibold transition ${
            isSelected
              ? 'bg-green-700 text-white hover:bg-green-800'
              : 'bg-gray-50 text-gray-700 hover:bg-green-50 hover:text-green-700 border border-gray-200 hover:border-green-300'
          }`}
        >
          {isSelected ? '✓ Selected' : 'Add to Compare'}
        </button>
      </div>
    </div>
  );
}
