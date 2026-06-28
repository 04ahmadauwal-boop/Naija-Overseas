import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Star, Search, Trash2, ChevronLeft, ChevronRight, MessageSquare, ExternalLink, Zap, RefreshCw } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { AdminNav } from './Dashboard';

function StarRow({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map((s) => (
        <Star key={s} size={11}
          className={s <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 fill-gray-200'} />
      ))}
    </div>
  );
}

export default function ManageReviews() {
  const [reviews, setReviews] = useState([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [pages, setPages]     = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [sort, setSort]       = useState('newest');
  const [deleting, setDeleting] = useState(null);
  const [seeding, setSeeding]   = useState(false);

  const fetchReviews = useCallback(async (pg = 1, q = search, s = sort) => {
    setLoading(true);
    try {
      const params = { page: pg, limit: 15, sort: s };
      if (q) params.search = q;
      const { data } = await api.get('/reviews/admin', { params });
      setReviews(data.reviews);
      setTotal(data.total);
      setPage(data.page);
      setPages(data.pages);
    } catch {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, [search, sort]);

  useEffect(() => {
    fetchReviews(1, search, sort);
  }, [sort]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    fetchReviews(1, searchInput, sort);
  };

  const handleSeed = async () => {
    if (!window.confirm('Create 2–3 demo reviews for every approved school? This cannot be undone (use Delete Demo to reverse).')) return;
    setSeeding(true);
    try {
      const { data } = await api.post('/reviews/seed-demo');
      toast.success(`Created ${data.created} reviews for ${data.schools} schools!`);
      fetchReviews(1, search, sort);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Seeding failed');
    } finally {
      setSeeding(false);
    }
  };

  const handleDeleteDemo = async () => {
    if (!window.confirm('Delete all demo/seeded reviews? Real user-submitted reviews will NOT be deleted.')) return;
    setSeeding(true);
    try {
      const { data } = await api.delete('/reviews/seed-demo');
      toast.success(`Deleted ${data.deleted} demo reviews`);
      fetchReviews(1, search, sort);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete demo reviews');
    } finally {
      setSeeding(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this review? This cannot be undone.')) return;
    setDeleting(id);
    try {
      await api.delete(`/reviews/${id}`);
      toast.success('Review deleted');
      fetchReviews(page, search, sort);
    } catch {
      toast.error('Failed to delete review');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f5f6fa]">
      <AdminNav />
      <div className="flex-1 overflow-x-hidden pt-14 lg:pt-0">

        {/* Top bar */}
        <div className="bg-white border-b border-gray-100 px-5 md:px-8 py-5">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                  <Star size={15} className="text-amber-700" />
                </div>
                Manage Reviews
              </h1>
              <p className="text-gray-400 text-sm mt-0.5 ml-10.5">
                <span className="text-xs font-bold px-3 py-1.5 rounded-full border bg-yellow-50 text-yellow-700 border-yellow-200">{total} review{total !== 1 ? 's' : ''}</span>
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={handleSeed} disabled={seeding}
                className="flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-800 transition disabled:opacity-50">
                <Zap size={14} /> {seeding ? 'Working…' : 'Seed Demo Reviews'}
              </button>
              <button onClick={handleDeleteDemo} disabled={seeding}
                className="flex items-center gap-2 border border-red-200 text-red-600 px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-50 transition disabled:opacity-50">
                <RefreshCw size={14} /> Delete Demo
              </button>
              <Link to="/reviews" target="_blank"
                className="flex items-center gap-2 border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
                <ExternalLink size={14} /> View Public
              </Link>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6 space-y-5">

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <form onSubmit={handleSearch} className="flex-1 relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search reviews..."
                value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white" />
            </form>
            <select value={sort} onChange={(e) => setSort(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {loading ? (
              <div className="space-y-0">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-16 bg-gray-50 border-b border-gray-100 animate-pulse" />
                ))}
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <MessageSquare size={36} className="mx-auto mb-3 opacity-30" />
                <p className="font-semibold text-gray-600">No reviews found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Reviewer</th>
                      <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">School</th>
                      <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Rating</th>
                      <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Review</th>
                      <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-5 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {reviews.map((r) => (
                      <tr key={r._id} className="hover:bg-gray-50 transition">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-green-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                              {r.isAnonymous ? '?' : (r.user?.name?.[0] || '?').toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 leading-tight text-xs">
                                {r.isAnonymous ? 'Anonymous' : (r.user?.name || r.authorName || '—')}
                              </p>
                              <p className="text-gray-400 text-[10px]">{r.user?.email || (r.authorName ? 'Demo review' : '')}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          {r.school ? (
                            <Link to={`/schools/${r.school.slug || r.school._id}`} target="_blank"
                              className="text-green-700 font-medium hover:underline text-xs leading-tight">
                              {r.school.name}
                              {r.school.state ? <span className="text-gray-400 font-normal"> · {r.school.state}</span> : ''}
                            </Link>
                          ) : <span className="text-gray-400">—</span>}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5">
                            <StarRow rating={r.rating} />
                            <span className="text-xs font-bold text-gray-700">{r.rating}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-[10px] bg-yellow-50 text-yellow-700 border border-yellow-200 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
                            {r.category}
                          </span>
                        </td>
                        <td className="px-5 py-4 max-w-xs">
                          {r.title && <p className="font-semibold text-gray-800 text-xs mb-0.5">{r.title}</p>}
                          <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed">{r.text}</p>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <p className="text-xs text-gray-400">
                            {new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <button onClick={() => handleDelete(r._id)} disabled={deleting === r._id}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition disabled:opacity-50">
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex justify-center items-center gap-2">
              <button disabled={page === 1} onClick={() => fetchReviews(page - 1)}
                className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition">
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm text-gray-500">Page {page} of {pages}</span>
              <button disabled={page === pages} onClick={() => fetchReviews(page + 1)}
                className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition">
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
