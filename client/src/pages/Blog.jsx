import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Pagination from '../components/Pagination';
import {
  BookOpen, Search, ArrowRight, Calendar, User, Clock, Eye,
  TrendingUp, Tag, Flame,
} from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['All', 'Study Tips', 'School Reviews', 'Study Abroad', 'Visa Guides', 'News'];

const CAT_META = {
  'Study Tips':    { color: 'bg-blue-100 text-blue-700',   dot: 'bg-blue-500',   icon: '📚' },
  'School Reviews':{ color: 'bg-green-100 text-green-700', dot: 'bg-green-500',  icon: '🏫' },
  'Study Abroad':  { color: 'bg-purple-100 text-purple-700',dot: 'bg-purple-500', icon: '✈️' },
  'Visa Guides':   { color: 'bg-orange-100 text-orange-700',dot: 'bg-orange-500', icon: '🛂' },
  'News':          { color: 'bg-red-100 text-red-700',     dot: 'bg-red-500',    icon: '📰' },
};

function CategoryBadge({ category, size = 'sm' }) {
  const meta = CAT_META[category] || { color: 'bg-gray-100 text-gray-600', icon: '📄' };
  return (
    <span className={`inline-flex items-center gap-1 font-semibold rounded-full px-2.5 py-0.5 ${size === 'sm' ? 'text-xs' : 'text-sm px-3 py-1'} ${meta.color}`}>
      <span>{meta.icon}</span>{category}
    </span>
  );
}

function ReadMeta({ readTime, views }) {
  return (
    <div className="flex items-center gap-3 text-xs text-gray-400">
      {readTime && <span className="flex items-center gap-1"><Clock size={11} />{readTime} min read</span>}
      {views > 0 && <span className="flex items-center gap-1"><Eye size={11} />{views >= 1000 ? `${(views/1000).toFixed(1)}k` : views}</span>}
    </div>
  );
}

function SkeletonCard({ large }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 overflow-hidden ${large ? 'md:col-span-2 md:row-span-2' : ''}`}>
      <div className={`skeleton-shimmer ${large ? 'h-80' : 'h-48'}`} />
      <div className="p-5 space-y-3">
        <div className="h-3 skeleton-shimmer rounded w-20" />
        <div className="h-5 skeleton-shimmer rounded w-3/4" />
        <div className="h-3 skeleton-shimmer rounded w-full" />
        <div className="h-3 skeleton-shimmer rounded w-2/3" />
      </div>
    </div>
  );
}

function TrendingBar({ posts }) {
  const ref = useRef(null);
  if (!posts?.length) return null;
  const scroll = (dir) => {
    if (ref.current) ref.current.scrollBy({ left: dir * 300, behavior: 'smooth' });
  };
  return (
    <div className="bg-linear-to-r from-green-950 to-green-900 text-white py-3">
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-3">
        <div className="flex items-center gap-1.5 shrink-0">
          <Flame size={14} className="text-orange-400" />
          <span className="text-xs font-bold uppercase tracking-widest text-green-300">Trending</span>
        </div>
        <div className="w-px h-4 bg-green-700 shrink-0" />
        <button onClick={() => scroll(-1)} className="shrink-0 p-1 rounded hover:bg-green-800 transition">
          <ChevronLeft size={14} />
        </button>
        <div ref={ref} className="flex gap-5 overflow-x-auto scrollbar-hide scroll-smooth flex-1 min-w-0">
          {posts.map((p, i) => (
            <Link key={p._id} to={`/blog/${p.slug}`}
              className="flex items-center gap-2 whitespace-nowrap text-xs text-white/80 hover:text-white transition group shrink-0">
              <span className="text-green-500 font-bold">#{i + 1}</span>
              <span className="group-hover:underline line-clamp-1 max-w-50">{p.title}</span>
            </Link>
          ))}
        </div>
        <button onClick={() => scroll(1)} className="shrink-0 p-1 rounded hover:bg-green-800 transition">
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

function FeaturedCard({ post }) {
  return (
    <Link to={`/blog/${post.slug}`}
      className="group relative block rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 md:col-span-2">
      <div className="relative h-72 md:h-96">
        {post.coverImage ? (
          <img src={post.coverImage} alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-green-800 to-green-950 flex items-center justify-center">
            <BookOpen className="text-green-600" size={64} />
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-gray-950/95 via-gray-950/50 to-transparent" />
        <div className="absolute top-5 left-5">
          <span className="inline-flex items-center gap-1.5 bg-green-600/90 backdrop-blur-sm border border-green-500/50 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
            <TrendingUp size={10} /> Featured
          </span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <CategoryBadge category={post.category} />
          <h2 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-white leading-tight mt-3 mb-3 group-hover:text-green-300 transition line-clamp-2">
            {post.title}
          </h2>
          {post.excerpt && (
            <p className="text-white/60 text-sm leading-relaxed line-clamp-2 mb-4 hidden md:block">{post.excerpt}</p>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-white/50">
              <span className="flex items-center gap-1.5"><User size={11} />{post.author?.name || 'N&O Team'}</span>
              <span className="flex items-center gap-1.5"><Calendar size={11} />
                {new Date(post.publishedAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
              <ReadMeta readTime={post.readTime} views={post.views} />
            </div>
            <span className="flex items-center gap-1 text-green-400 text-sm font-bold group-hover:gap-2 transition-all">
              Read <ArrowRight size={14} />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function PostCard({ post }) {
  return (
    <Link to={`/blog/${post.slug}`}
      className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col">
      <div className="relative h-44 bg-gray-100 overflow-hidden shrink-0">
        {post.coverImage ? (
          <img src={post.coverImage} alt={post.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-gray-100 to-gray-200">
            <BookOpen className="text-gray-300" size={36} />
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition" />
        <div className="absolute top-3 left-3">
          <CategoryBadge category={post.category} />
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-gray-900 leading-snug mb-1.5 group-hover:text-green-700 transition line-clamp-2 text-[14.5px]">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="text-gray-500 text-xs line-clamp-2 flex-1 leading-relaxed">{post.excerpt}</p>
        )}
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2.5">
            {post.tags.slice(0, 2).map((t) => (
              <span key={t} className="inline-flex items-center gap-0.5 text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                <Tag size={8} />{t}
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-gray-50">
          <ReadMeta readTime={post.readTime} views={post.views} />
          <span className="flex items-center gap-0.5 text-[11px] font-bold text-green-700 group-hover:gap-1.5 transition-all">
            Read <ArrowRight size={11} />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPosts = async (p = 1) => {
    setLoading(true);
    try {
      const params = { page: p, limit: 13 };
      if (category && category !== 'All') params.category = category;
      if (search) params.search = search;
      const { data } = await api.get('/blog', { params });
      setPosts(data.posts);
      setTotalPages(data.pages || 1);
      setPage(p);
    } catch {
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.get('/blog/trending').then(({ data }) => setTrending(data.posts || [])).catch(() => {});
  }, []);

  useEffect(() => {
    fetchPosts(1);
  }, [category]);

  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ minHeight: '340px' }}>
        <div className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1920&q=80')" }} />
        <div className="absolute inset-0 bg-linear-to-b from-gray-950/85 via-gray-950/70 to-gray-950/85" />
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle,white 1px,transparent 1px)', backgroundSize: '24px 24px' }} />

        <div className="relative max-w-3xl mx-auto px-4 text-center py-16">
          <div className="inline-flex items-center gap-2 bg-green-500/15 backdrop-blur-sm border border-green-500/25 text-green-300 text-[10px] font-bold uppercase tracking-[0.18em] px-4 py-1.5 rounded-full mb-5">
            <BookOpen size={10} /> Education Insights for West Africa
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-3 tracking-tight leading-[1.1]">
            Learn. Explore. <span className="text-green-400">Succeed.</span>
          </h1>
          <p className="text-white/55 text-sm md:text-base mb-7 max-w-lg mx-auto leading-relaxed">
            Expert guides, school rankings, study abroad tips and visa information for students across West Africa.
          </p>

          <form onSubmit={(e) => { e.preventDefault(); fetchPosts(1); }}
            className="flex max-w-lg mx-auto gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search articles, schools, visa tips..."
                className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-white/95 backdrop-blur-sm text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-xl" />
            </div>
            <button type="submit"
              className="bg-green-600 hover:bg-green-500 text-white px-5 rounded-xl text-sm font-bold transition shadow-xl whitespace-nowrap">
              Search
            </button>
          </form>

          {/* Stats row */}
          <div className="flex items-center justify-center gap-6 mt-7 text-white/35 text-[11px]">
            <span className="flex items-center gap-1.5"><BookOpen size={11} /> 500+ Articles</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span>5 Categories</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span>Weekly Updates</span>
          </div>
        </div>
      </section>

      {/* ── TRENDING BAR ─────────────────────────────────────────────── */}
      <TrendingBar posts={trending} />

      {/* ── CATEGORY TABS ────────────────────────────────────────────── */}
      <div className="border-b border-gray-100 bg-white/95 backdrop-blur-sm sticky top-16 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex gap-1 overflow-x-auto py-2.5 scrollbar-hide">
          {CATEGORIES.map((cat) => {
            const active = (cat === 'All' && !category) || cat === category;
            const meta = CAT_META[cat];
            return (
              <button key={cat} onClick={() => setCategory(cat === 'All' ? '' : cat)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs whitespace-nowrap transition font-semibold ${
                  active
                    ? 'bg-green-700 text-white shadow-md ring-2 ring-green-700/20'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                }`}>
                {meta && <span className="text-sm">{meta.icon}</span>}
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── POSTS ────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <SkeletonCard large />
            </div>
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-3xl border border-gray-100">
            <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="text-gray-300" size={32} />
            </div>
            <h3 className="font-bold text-gray-900 mb-2 text-lg">No articles found</h3>
            <p className="text-gray-500 text-sm">Try a different category or search term.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Main grid */}
            <div className="grid md:grid-cols-3 gap-5">
              {featured && <FeaturedCard post={featured} />}
              {rest.slice(0, 4).map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>

            {/* Secondary grid */}
            {rest.length > 4 && (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-1 h-5 rounded-full bg-green-600 shrink-0" />
                  <h2 className="text-base font-extrabold text-gray-900">
                    {category ? `More ${category} Articles` : 'More Articles'}
                  </h2>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>
                <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {rest.slice(4).map((post) => (
                    <PostCard key={post._id} post={post} />
                  ))}
                </div>
              </>
            )}

            {/* Pagination */}
            <Pagination page={page} pages={totalPages} onPage={fetchPosts} />
          </div>
        )}
      </section>

      {/* ── TOP TOPICS ───────────────────────────────────────────────── */}
      <section className="bg-white border-t border-gray-100 py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-5">
            <Flame className="text-orange-500" size={18} />
            <h2 className="text-base font-extrabold text-gray-900">Explore by Topic</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {[
              'Top Schools in Lagos', 'JAMB 2024', 'UK Student Visa', 'WAEC Tips',
              'Study in Canada', 'Federal Government Colleges', 'IELTS Guide',
              'Scholarships 2024', 'Study in USA', 'School Fees', 'Best Universities Nigeria',
              'Study Abroad Checklist',
            ].map((tag) => (
              <button key={tag}
                onClick={() => { setSearch(tag); fetchPosts(1); }}
                className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-green-100 hover:text-green-800 text-gray-700 text-sm font-medium px-4 py-2 rounded-full transition">
                <Tag size={12} /> {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER CTA ───────────────────────────────────────────── */}
      <section className="relative py-16 px-4 overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#021a0e 0%,#064e3b 100%)' }}>
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle,white 1px,transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="relative max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-green-900/50 border border-green-700/40 text-green-300 text-[11px] font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Weekly Newsletter
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3">Stay ahead with education insights</h2>
          <p className="text-green-300/70 mb-8 text-sm leading-relaxed">
            Join 5,000+ parents and students receiving our weekly education newsletter — school rankings, visa tips, scholarship alerts.
          </p>
          <div className="flex max-w-md mx-auto gap-2">
            <input type="email" placeholder="Enter your email address"
              className="flex-1 px-4 py-3.5 rounded-xl bg-green-900/50 border border-green-700 text-white placeholder-green-600 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            <button className="bg-green-500 hover:bg-green-400 text-white font-bold px-6 py-3.5 rounded-xl transition text-sm whitespace-nowrap shadow-lg">
              Subscribe →
            </button>
          </div>
          <p className="text-green-800 text-xs mt-3">No spam. Unsubscribe anytime.</p>
        </div>
      </section>
    </div>
  );
}
