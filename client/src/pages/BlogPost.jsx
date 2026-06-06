import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Calendar, User, Clock, Eye, Share2,
  Link2, BookOpen, ChevronUp, Tag, ArrowRight, Send, MessageCircle,
} from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const CAT_META = {
  'Study Tips':    { color: 'bg-blue-100 text-blue-700' },
  'School Reviews':{ color: 'bg-green-100 text-green-700' },
  'Study Abroad':  { color: 'bg-purple-100 text-purple-700' },
  'Visa Guides':   { color: 'bg-orange-100 text-orange-700' },
  'News':          { color: 'bg-red-100 text-red-700' },
};

function ReadingProgress() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const handler = () => {
      const el = document.documentElement;
      const scrolled = el.scrollTop;
      const total = el.scrollHeight - el.clientHeight;
      setPct(total > 0 ? Math.round((scrolled / total) * 100) : 0);
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);
  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 z-9999">
      <div className="h-full bg-linear-to-r from-green-500 to-green-400 transition-all duration-100"
        style={{ width: `${pct}%` }} />
    </div>
  );
}

function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const h = () => setShow(window.scrollY > 400);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);
  if (!show) return null;
  return (
    <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-8 right-6 z-50 w-11 h-11 bg-green-700 hover:bg-green-600 text-white rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-110">
      <ChevronUp size={18} />
    </button>
  );
}

function ShareBar({ title, url }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      toast.success('Link copied!');
      setTimeout(() => setCopied(false), 2000);
    });
  };
  const encoded = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Share</span>
      <a href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encoded}`} target="_blank" rel="noreferrer"
        className="w-9 h-9 rounded-full bg-gray-100 hover:bg-[#1DA1F2]/10 hover:text-[#1DA1F2] flex items-center justify-center text-gray-500 transition">
        <Share2 size={15} />
      </a>
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${encoded}`} target="_blank" rel="noreferrer"
        className="w-9 h-9 rounded-full bg-gray-100 hover:bg-[#1877F2]/10 hover:text-[#1877F2] flex items-center justify-center text-gray-500 transition">
        <Send size={15} />
      </a>
      <button onClick={copy}
        className={`w-9 h-9 rounded-full flex items-center justify-center transition ${copied ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500 hover:bg-green-100 hover:text-green-700'}`}>
        {copied ? <span className="text-[10px] font-bold">✓</span> : <Link2 size={15} />}
      </button>
    </div>
  );
}

function TableOfContents({ content }) {
  const [active, setActive] = useState('');
  const headings = [];
  const regex = /<h([2-3])[^>]*id="([^"]+)"[^>]*>([^<]+)<\/h[2-3]>/g;
  let m;
  while ((m = regex.exec(content)) !== null) {
    headings.push({ level: parseInt(m[1]), id: m[2], text: m[3] });
  }
  if (headings.length < 2) return null;

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); });
      },
      { rootMargin: '-20% 0% -70% 0%' }
    );
    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [content]);

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 sticky top-24">
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Contents</p>
      <nav className="space-y-1">
        {headings.map(({ level, id, text }) => (
          <a key={id} href={`#${id}`}
            className={`block text-sm py-1 transition rounded px-2 -mx-2 ${level === 3 ? 'pl-5' : ''} ${
              active === id ? 'text-green-700 font-semibold bg-green-50' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
            }`}>
            {text}
          </a>
        ))}
      </nav>
    </div>
  );
}

function RelatedCard({ post }) {
  return (
    <Link to={`/blog/${post.slug}`}
      className="group flex gap-3 p-3 rounded-xl hover:bg-gray-50 transition">
      {post.coverImage ? (
        <img src={post.coverImage} alt={post.title}
          className="w-20 h-16 object-cover rounded-lg shrink-0 group-hover:scale-105 transition-transform" />
      ) : (
        <div className="w-20 h-16 bg-gray-100 rounded-lg shrink-0 flex items-center justify-center">
          <BookOpen size={18} className="text-gray-300" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-green-700 transition leading-snug">
          {post.title}
        </p>
        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
          <Clock size={10} />{post.readTime} min read
        </p>
      </div>
    </Link>
  );
}

function processContent(html) {
  let counter = {};
  return html
    .replace(/\n/g, '<br/>')
    .replace(/<h([2-3])>([^<]+)<\/h[2-3]>/g, (_, level, text) => {
      const base = text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      counter[base] = (counter[base] || 0) + 1;
      const id = counter[base] > 1 ? `${base}-${counter[base]}` : base;
      return `<h${level} id="${id}">${text}</h${level}>`;
    });
}

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const viewFired = useRef(false);

  useEffect(() => {
    setLoading(true);
    viewFired.current = false;
    api.get(`/blog/${slug}`)
      .then(({ data }) => {
        setPost(data.post);
        setRelated(data.related || []);
      })
      .catch(() => setPost(null))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (post && !viewFired.current) {
      viewFired.current = true;
      api.post(`/blog/${slug}/view`).catch(() => {});
    }
  }, [post, slug]);

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <ReadingProgress />
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-4">
        <div className="h-80 skeleton-shimmer rounded-3xl" />
        <div className="h-8 skeleton-shimmer rounded w-3/4" />
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => <div key={i} className="h-4 skeleton-shimmer rounded" style={{ width: `${85 + Math.random() * 15}%` }} />)}
        </div>
      </div>
    </div>
  );

  if (!post) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <BookOpen className="text-gray-300 mx-auto mb-4" size={48} />
        <p className="text-gray-500 mb-4">Post not found.</p>
        <Link to="/blog" className="bg-green-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-green-800 transition">
          Back to Blog
        </Link>
      </div>
    </div>
  );

  const processed = processContent(post.content);
  const catMeta = CAT_META[post.category] || { color: 'bg-gray-100 text-gray-600' };
  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <div className="min-h-screen bg-gray-50">
      <ReadingProgress />
      <BackToTop />

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <div className="relative w-full" style={{ height: '460px' }}>
        {post.coverImage ? (
          <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-green-900 to-green-950" />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-gray-950/95 via-gray-950/60 to-gray-950/30" />

        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="max-w-4xl mx-auto px-4 pb-10 w-full">
            <Link to="/blog"
              className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white mb-5 transition">
              <ArrowLeft size={15} /> Back to Blog
            </Link>
            <span className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full ${catMeta.color} mb-3`}>
              {post.category}
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white leading-tight mb-4 max-w-3xl">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-white/50">
              <span className="flex items-center gap-1.5"><User size={13} />{post.author?.name || 'N&O Team'}</span>
              <span className="flex items-center gap-1.5">
                <Calendar size={13} />
                {new Date(post.publishedAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
              {post.readTime && <span className="flex items-center gap-1.5"><Clock size={13} />{post.readTime} min read</span>}
              {post.views > 0 && <span className="flex items-center gap-1.5"><Eye size={13} />{post.views.toLocaleString()} views</span>}
            </div>
          </div>
        </div>
      </div>

      {/* ── ARTICLE BODY ─────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid lg:grid-cols-[1fr_300px] gap-10">

          {/* Main content */}
          <div>
            {/* Share row */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
              <div className="flex flex-wrap gap-1.5">
                {post.tags?.map((tag) => (
                  <Link key={tag} to={`/blog?search=${encodeURIComponent(tag)}`}
                    className="inline-flex items-center gap-1 text-xs bg-gray-100 hover:bg-green-100 hover:text-green-800 text-gray-600 px-2.5 py-1 rounded-full transition font-medium">
                    <Tag size={10} />{tag}
                  </Link>
                ))}
              </div>
              <ShareBar title={post.title} url={pageUrl} />
            </div>

            {/* Article content */}
            <div
              className="prose prose-lg prose-gray max-w-none
                prose-headings:font-extrabold prose-headings:text-gray-900 prose-headings:scroll-mt-24
                prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:pb-3 prose-h2:border-b prose-h2:border-gray-100
                prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                prose-p:text-black prose-p:leading-relaxed prose-p:mb-5
                prose-li:text-black prose-li:leading-relaxed
                prose-strong:text-black prose-strong:font-bold
                prose-a:text-green-700 prose-a:no-underline hover:prose-a:underline
                prose-blockquote:border-l-4 prose-blockquote:border-green-500 prose-blockquote:bg-green-50 prose-blockquote:rounded-r-xl prose-blockquote:py-3 prose-blockquote:px-5
                prose-img:rounded-2xl prose-img:shadow-md
                prose-ul:list-disc prose-ol:list-decimal"
              dangerouslySetInnerHTML={{ __html: processed }}
            />

            {/* Bottom share */}
            <div className="mt-10 pt-8 border-t border-gray-200 flex items-center justify-between flex-wrap gap-4">
              <p className="text-sm font-semibold text-gray-700">Found this helpful? Share it</p>
              <ShareBar title={post.title} url={pageUrl} />
            </div>

            {/* Author card */}
            <div className="mt-8 bg-linear-to-br from-green-50 to-emerald-50 border border-green-100 rounded-3xl p-6 flex gap-5">
              <div className="w-14 h-14 rounded-2xl bg-green-700 text-white flex items-center justify-center font-extrabold text-xl shrink-0">
                {(post.author?.name || 'N')[0]}
              </div>
              <div>
                <p className="font-bold text-gray-900">{post.author?.name || 'N&O Editorial Team'}</p>
                <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                  Educational content writer at Naija &amp; Overseas, focused on helping West African students navigate
                  secondary school choices, university admissions, and study abroad opportunities.
                </p>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-8 rounded-3xl overflow-hidden"
              style={{ background: 'linear-gradient(135deg,#021a0e,#064e3b)' }}>
              <div className="px-8 py-8 text-center">
                <p className="font-extrabold text-white text-xl mb-2">Ready to find your ideal school?</p>
                <p className="text-green-300/70 text-sm mb-6">
                  Explore 500+ Nigerian schools, compare fees, facilities and results side by side.
                </p>
                <div className="flex gap-3 justify-center flex-wrap">
                  <Link to="/" className="bg-white text-green-950 font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-green-50 transition shadow-lg">
                    Compare Schools
                  </Link>
                  <Link to="/study-abroad" className="border border-green-600/50 text-white font-semibold px-6 py-2.5 rounded-xl text-sm hover:bg-green-800/30 transition">
                    Study Abroad →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="space-y-6">
              <TableOfContents content={processed} />

              {related.length > 0 && (
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Related Articles</p>
                  <div className="space-y-1 divide-y divide-gray-50">
                    {related.map((r) => <RelatedCard key={r._id} post={r} />)}
                  </div>
                  <Link to="/blog" className="mt-4 flex items-center gap-1.5 text-sm text-green-700 font-semibold hover:gap-2.5 transition-all">
                    See all articles <ArrowRight size={14} />
                  </Link>
                </div>
              )}

              <div className="bg-green-950 rounded-2xl p-5 text-white">
                <p className="font-bold mb-1">Get weekly tips</p>
                <p className="text-green-400/70 text-xs mb-4">School news, visa guides, and scholarship alerts.</p>
                <input type="email" placeholder="Your email address"
                  className="w-full px-3 py-2.5 rounded-lg bg-green-900 border border-green-800 text-white text-xs placeholder-green-700 focus:outline-none focus:ring-1 focus:ring-green-500 mb-2" />
                <button className="w-full bg-green-600 hover:bg-green-500 text-white text-xs font-bold py-2.5 rounded-lg transition">
                  Subscribe Free →
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
