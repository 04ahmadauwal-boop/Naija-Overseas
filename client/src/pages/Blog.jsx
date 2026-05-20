import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Search, ArrowRight, Calendar, User } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['All', 'Study Tips', 'School Reviews', 'Study Abroad', 'Visa Guides', 'News'];

const CAT_COLORS = {
  'Study Tips': 'bg-blue-50 text-blue-700',
  'School Reviews': 'bg-green-50 text-green-700',
  'Study Abroad': 'bg-purple-50 text-purple-700',
  'Visa Guides': 'bg-orange-50 text-orange-700',
  'News': 'bg-red-50 text-red-700',
};

function SkeletonCard({ large }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 overflow-hidden ${large ? 'md:col-span-3' : ''}`}>
      <div className={`skeleton-shimmer ${large ? 'h-72' : 'h-48'}`} />
      <div className="p-5 space-y-3">
        <div className="h-3 skeleton-shimmer rounded w-20" />
        <div className="h-5 skeleton-shimmer rounded w-3/4" />
        <div className="h-3 skeleton-shimmer rounded w-full" />
        <div className="h-3 skeleton-shimmer rounded w-2/3" />
      </div>
    </div>
  );
}

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (category && category !== 'All') params.category = category;
      if (search) params.search = search;
      const { data } = await api.get('/blog', { params });
      setPosts(data.posts);
    } catch {
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadPosts = async () => {
      await fetchPosts();
    };

    loadPosts();
  }, [category]);

  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <div>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative min-h-90 flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1920&q=80')" }} />
        <div className="absolute inset-0 bg-linear-to-b from-gray-950/80 via-gray-950/65 to-gray-950/80" />

        <div className="relative w-full max-w-3xl mx-auto px-4 text-center py-20">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/25 text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
            <BookOpen size={12} /> Education Insights for West Africa
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
            Education Insights &amp; Guides
          </h1>
          <p className="text-white/70 text-lg mb-8">
            Tips, guides and stories for students, parents and school seekers across West Africa.
          </p>

          <form onSubmit={(e) => { e.preventDefault(); fetchPosts(); }}
            className="flex max-w-lg mx-auto gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search articles..."
                className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-white text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-lg" />
            </div>
            <button type="submit"
              className="bg-green-600 text-white px-6 rounded-xl text-sm font-semibold hover:bg-green-700 transition shadow-lg">
              Search
            </button>
          </form>
        </div>
      </section>

      {/* ── CATEGORY TABS ────────────────────────────────────── */}
      <div className="border-b border-gray-200 bg-white sticky top-16 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex gap-1 overflow-x-auto py-3 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => setCategory(cat === 'All' ? '' : cat)}
              className={`px-5 py-2 rounded-full text-sm whitespace-nowrap transition font-semibold ${
                (cat === 'All' && !category) || cat === category
                  ? 'bg-green-700 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
              }`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── POSTS ────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        {loading ? (
          <div className="grid md:grid-cols-3 gap-6">
            <SkeletonCard large />
            {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="text-gray-300" size={28} />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">No articles found</h3>
            <p className="text-gray-500 text-sm">Try a different category or search term.</p>
          </div>
        ) : (
          <div className="space-y-10">

            {/* Featured post */}
            {featured && (
              <Link to={`/blog/${featured.slug}`}
                className="group block bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition overflow-hidden md:flex">
                <div className="md:w-1/2 h-60 md:h-auto bg-gray-100 overflow-hidden shrink-0">
                  {featured.coverImage ? (
                    <img src={featured.coverImage} alt={featured.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-200">
                      <BookOpen size={56} />
                    </div>
                  )}
                </div>
                <div className="p-8 md:p-10 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${CAT_COLORS[featured.category] || 'bg-gray-100 text-gray-600'}`}>
                      {featured.category}
                    </span>
                    <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Featured Article</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight mb-3 group-hover:text-green-700 transition">
                    {featured.title}
                  </h2>
                  {featured.excerpt && (
                    <p className="text-gray-500 leading-relaxed mb-6 line-clamp-3">{featured.excerpt}</p>
                  )}
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1.5"><User size={12} />{featured.author?.name || 'Naija & Overseas'}</span>
                      <span className="flex items-center gap-1.5"><Calendar size={12} />{new Date(featured.publishedAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <span className="flex items-center gap-1 text-green-700 text-sm font-semibold group-hover:gap-2 transition-all">
                      Read More <ArrowRight size={15} />
                    </span>
                  </div>
                </div>
              </Link>
            )}

            {/* Remaining posts grid */}
            {rest.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  {category ? `${category} Articles` : 'Latest Articles'}
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {rest.map((post) => (
                    <Link key={post._id} to={`/blog/${post.slug}`}
                      className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col">
                      <div className="h-48 bg-gray-100 overflow-hidden shrink-0">
                        {post.coverImage ? (
                          <img src={post.coverImage} alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-200">
                            <BookOpen size={36} />
                          </div>
                        )}
                      </div>
                      <div className="p-5 flex flex-col flex-1">
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full self-start mb-2 ${CAT_COLORS[post.category] || 'bg-gray-100 text-gray-600'}`}>
                          {post.category}
                        </span>
                        <h3 className="font-bold text-gray-900 leading-snug mb-2 group-hover:text-green-700 transition line-clamp-2">
                          {post.title}
                        </h3>
                        {post.excerpt && (
                          <p className="text-gray-500 text-sm line-clamp-2 flex-1">{post.excerpt}</p>
                        )}
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50 text-xs text-gray-400">
                          <span className="flex items-center gap-1.5"><User size={11} />{post.author?.name || 'N&O Team'}</span>
                          <span className="flex items-center gap-1.5"><Calendar size={11} />
                            {new Date(post.publishedAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ── NEWSLETTER CTA ───────────────────────────────────── */}
      <section className="bg-green-900 text-white py-8 md:py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-extrabold mb-2">Get education tips in your inbox</h2>
          <p className="text-green-300 mb-7 text-sm">Join 5,000+ parents and students receiving our weekly education newsletter.</p>
          <div className="flex max-w-md mx-auto gap-2">
            <input type="email" placeholder="Enter your email address"
              className="flex-1 px-4 py-3.5 rounded-xl bg-green-800 border border-green-700 text-white placeholder-green-500 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            <button className="bg-white text-green-900 font-bold px-6 py-3.5 rounded-xl hover:bg-green-50 transition text-sm whitespace-nowrap">
              Subscribe →
            </button>
          </div>
          <p className="text-green-600 text-xs mt-3">No spam. Unsubscribe anytime.</p>
        </div>
      </section>
    </div>
  );
}
