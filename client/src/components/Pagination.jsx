import { ChevronLeft, ChevronRight } from 'lucide-react';

function getPages(current, total) {
  // Always show: first, last, current ± delta. Ellipsis fills gaps.
  const delta = 1; // pages each side of current
  const range = new Set([1, total]);
  for (let i = current - delta; i <= current + delta; i++) {
    if (i > 1 && i < total) range.add(i);
  }
  const sorted = [...range].sort((a, b) => a - b);

  const withEllipsis = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) withEllipsis.push('…');
    withEllipsis.push(sorted[i]);
  }
  return withEllipsis;
}

export default function Pagination({ page, pages, onPage, dark = false, activeClass }) {
  if (!pages || pages <= 1) return null;

  const items = getPages(page, pages);

  const btn =
    dark
      ? 'w-9 h-9 flex items-center justify-center rounded-xl border border-gray-700 bg-gray-900 text-gray-400 hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition text-sm font-semibold'
      : 'w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition text-gray-600 text-sm font-semibold';

  const activeCls = activeClass ?? 'bg-green-700 border-green-700 text-white shadow-sm';

  return (
    <div className="flex items-center justify-center gap-1.5 flex-wrap mt-8">
      {/* Prev */}
      <button
        onClick={() => onPage(page - 1)}
        disabled={page === 1}
        className={btn}
        aria-label="Previous page"
      >
        <ChevronLeft size={15} />
      </button>

      {items.map((p, i) =>
        p === '…' ? (
          <span
            key={`e-${i}`}
            className={`w-9 h-9 flex items-center justify-center text-sm ${dark ? 'text-gray-600' : 'text-gray-400'}`}
          >
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPage(p)}
            className={`${btn} ${p === page ? activeCls : ''}`}
            aria-label={`Page ${p}`}
            aria-current={p === page ? 'page' : undefined}
          >
            {p}
          </button>
        )
      )}

      {/* Next */}
      <button
        onClick={() => onPage(page + 1)}
        disabled={page === pages}
        className={btn}
        aria-label="Next page"
      >
        <ChevronRight size={15} />
      </button>
    </div>
  );
}
