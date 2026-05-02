import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import api from '../utils/api';

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/blog/${slug}`)
      .then(({ data }) => setPost(data.post))
      .catch(() => setPost(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-16 text-center text-gray-500">Loading...</div>;
  if (!post) return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <p className="text-gray-500 mb-4">Post not found.</p>
      <Link to="/blog" className="text-green-700 hover:underline">Back to Blog</Link>
    </div>
  );

  return (
    <article className="max-w-3xl mx-auto px-4 py-10">
      <Link to="/blog" className="flex items-center gap-1 text-sm text-gray-500 hover:text-green-700 mb-6">
        <ArrowLeft size={16} /> Back to Blog
      </Link>

      {post.coverImage && (
        <div className="w-full h-64 rounded-2xl overflow-hidden mb-6">
          <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
        </div>
      )}

      <span className="text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full font-medium">{post.category}</span>
      <h1 className="text-3xl font-bold text-gray-900 mt-3 mb-4">{post.title}</h1>

      <div className="flex items-center gap-4 text-sm text-gray-500 mb-8 pb-6 border-b border-gray-100">
        <span className="flex items-center gap-1.5"><User size={14} /> {post.author?.name}</span>
        <span className="flex items-center gap-1.5"><Calendar size={14} /> {new Date(post.publishedAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
      </div>

      <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br/>') }} />

      {post.tags?.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-100 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">#{tag}</span>
          ))}
        </div>
      )}

      <div className="mt-8 bg-green-50 rounded-2xl p-6 text-center">
        <p className="font-semibold text-gray-900 mb-1">Found this helpful?</p>
        <p className="text-sm text-gray-600 mb-4">Explore more schools or start your study abroad journey today.</p>
        <div className="flex gap-3 justify-center">
          <Link to="/" className="bg-green-700 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-green-800">Compare Schools</Link>
          <Link to="/study-abroad" className="border border-green-700 text-green-700 px-5 py-2 rounded-full text-sm font-medium hover:bg-green-50">Study Abroad</Link>
        </div>
      </div>
    </article>
  );
}
