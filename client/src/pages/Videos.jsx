import { useState, useEffect, useRef } from 'react';
import { Search, X, Play, Filter, Clock } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['All', 'Parent Review', 'Principal Interview', 'School Review', 'Study Abroad', 'General'];

function getYoutubeThumbnail(url) {
  try {
    let id = null;
    if (url.includes('youtu.be/')) id = url.split('youtu.be/')[1]?.split('?')[0];
    else if (url.includes('youtube.com/embed/')) id = url.split('youtube.com/embed/')[1]?.split('?')[0];
    else if (url.includes('youtube.com/watch')) id = new URL(url).searchParams.get('v');
    if (id) return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
  } catch { /* invalid URL */ }
  return null;
}

function getEmbedUrl(url) {
  try {
    if (url.includes('youtube.com/embed/')) return url;
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${id}?autoplay=1`;
    }
    if (url.includes('youtube.com/watch')) {
      const id = new URL(url).searchParams.get('v');
      return `https://www.youtube.com/embed/${id}?autoplay=1`;
    }
    return url;
  } catch { return url; }
}

const BADGE_COLOR = {
  'Parent Review':       'bg-green-600 text-white',
  'Principal Interview': 'bg-emerald-800 text-white',
  'School Review':       'bg-green-200 text-green-900',
  'Study Abroad':        'bg-blue-600 text-white',
  'General':             'bg-gray-600 text-white',
};

function VideoModal({ video, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-3xl bg-gray-950 rounded-2xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <iframe
            src={getEmbedUrl(video.videoUrl)}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        </div>
        <div className="p-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${BADGE_COLOR[video.category] || 'bg-gray-600 text-white'}`}>
              {video.category}
            </span>
            <h3 className="font-bold text-white text-sm sm:text-base mt-2 leading-snug">{video.title}</h3>
            {video.school && <p className="text-gray-400 text-xs mt-1">{video.school}</p>}
            {video.description && <p className="text-gray-500 text-xs mt-2 leading-relaxed">{video.description}</p>}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition shrink-0 mt-1">
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

function VideoCard({ video, onClick }) {
  const thumb = video.thumbnail || getYoutubeThumbnail(video.videoUrl);
  return (
    <div
      onClick={() => onClick(video)}
      className="group bg-white rounded-2xl border border-gray-100 hover:border-green-200 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 overflow-hidden cursor-pointer"
    >
      {/* Thumbnail */}
      <div className="relative w-full bg-gray-900 overflow-hidden" style={{ paddingBottom: '56.25%' }}>
        {thumb ? (
          <img src={thumb} alt={video.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <Play size={32} className="text-gray-600" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-12 h-12 rounded-full bg-green-600/90 flex items-center justify-center shadow-xl">
            <Play size={20} fill="white" className="text-white ml-0.5" />
          </div>
        </div>
        {/* Duration */}
        {video.duration && (
          <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/75 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
            <Clock size={9} /> {video.duration}
          </div>
        )}
        {/* Category badge */}
        <div className="absolute top-2 left-2">
          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${BADGE_COLOR[video.category] || 'bg-gray-600 text-white'}`}>
            {video.category}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-green-700 transition mb-1.5">
          {video.title}
        </h3>
        {video.school && (
          <p className="text-xs text-gray-400 truncate">{video.school}</p>
        )}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-gray-300">{new Date(video.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          <span className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-full group-hover:bg-green-100 transition">
            <Play size={10} fill="currentColor" /> Watch Now
          </span>
        </div>
      </div>
    </div>
  );
}

export default function Videos() {
  const [videos, setVideos] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeVideo, setActiveVideo] = useState(null);
  const searchRef = useRef(null);

  const fetchVideos = async (page = 1, q = search, cat = activeCategory) => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (q) params.search = q;
      if (cat !== 'All') params.category = cat;
      const { data } = await api.get('/videos', { params });
      setVideos(data.videos);
      setTotal(data.total);
      setPages(data.pages);
      setCurrentPage(page);
    } catch {
      toast.error('Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVideos(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (e) => {
    e.preventDefault();
    fetchVideos(1, search, activeCategory);
  };

  const handleCategory = (cat) => {
    setActiveCategory(cat);
    fetchVideos(1, search, cat);
  };

  return (
    <div className="min-h-screen bg-white">

      {/* ── HEADER ───────────────────────────────────────── */}
      <div className="border-b border-gray-100 bg-white sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <div>
            <h1 className="font-extrabold text-gray-900 text-lg sm:text-xl">
              Naija &amp; Overseas <span className="text-green-600">Videos</span>
            </h1>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2 sm:max-w-md sm:mx-auto">
            <div className="flex-1 flex items-center border border-gray-200 rounded-full overflow-hidden bg-gray-50 hover:border-green-400 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-100 transition">
              <Search size={15} className="text-gray-400 ml-4 shrink-0" />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search By School Name..."
                className="flex-1 px-3 py-2.5 bg-transparent text-sm text-gray-700 placeholder-gray-400 border-0 focus:outline-none"
              />
              {search && (
                <button type="button" onClick={() => { setSearch(''); fetchVideos(1, '', activeCategory); }} className="mr-2 text-gray-400 hover:text-gray-600">
                  <X size={14} />
                </button>
              )}
            </div>
            <button type="submit" className="w-9 h-9 flex items-center justify-center rounded-full bg-green-600 hover:bg-green-500 text-white shrink-0 transition shadow-sm">
              <Search size={15} />
            </button>
          </form>

          {/* Filter pill */}
          <div className="flex items-center gap-2 shrink-0">
            <Filter size={14} className="text-gray-400" />
            <span className="text-sm text-gray-500 font-medium hidden sm:inline">Filter</span>
          </div>
        </div>

        {/* Category tabs */}
        <div className="max-w-7xl mx-auto px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategory(cat)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold border transition ${
                activeCategory === cat
                  ? 'bg-green-600 border-green-600 text-white shadow-sm'
                  : 'border-gray-200 text-gray-600 bg-white hover:border-green-400 hover:text-green-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── GRID ─────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-2xl h-64 animate-pulse" />
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <Play size={44} className="mx-auto mb-4 opacity-30" />
            <p className="font-semibold text-gray-600 text-lg">No videos found</p>
            <p className="text-sm mt-1">Try a different search or category.</p>
          </div>
        ) : (
          <>
            <p className="text-gray-400 text-sm mb-6">
              Showing <span className="font-semibold text-gray-700">{videos.length}</span> of <span className="font-semibold text-gray-700">{total}</span> videos
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {videos.map((v) => (
                <VideoCard key={v._id} video={v} onClick={setActiveVideo} />
              ))}
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => fetchVideos(p)}
                    className={`w-9 h-9 rounded-lg text-sm font-semibold transition ${
                      p === currentPage ? 'bg-green-700 text-white' : 'border border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── VIDEO MODAL ──────────────────────────────────── */}
      {activeVideo && <VideoModal video={activeVideo} onClose={() => setActiveVideo(null)} />}
    </div>
  );
}
