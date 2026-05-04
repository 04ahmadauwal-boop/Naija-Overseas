import { useState, useEffect } from 'react';
import { AdminNav } from './Dashboard';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, FileText, X, Eye, EyeOff } from 'lucide-react';

const CATEGORIES = ['Study Tips', 'School Reviews', 'Study Abroad', 'Visa Guides', 'News'];
const BLANK = { title: '', excerpt: '', content: '', category: 'News', coverImage: '', tags: '', isPublished: false };

export default function ManageBlog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(BLANK);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/blog/admin/all');
      setPosts(data.posts);
    } catch { toast.error('Failed to load posts'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPosts(); }, []);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean) };
    try {
      if (editing) {
        await api.put(`/blog/${editing}`, payload);
        toast.success('Post updated');
      } else {
        await api.post('/blog', payload);
        toast.success('Post created');
      }
      setShowForm(false); setEditing(null); setForm(BLANK);
      fetchPosts();
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const deletePost = async (id) => {
    if (!confirm('Delete this blog post permanently?')) return;
    try { await api.delete(`/blog/${id}`); toast.success('Post deleted'); fetchPosts(); }
    catch { toast.error('Delete failed'); }
  };

  const editPost = (post) => {
    setForm({ ...post, tags: post.tags?.join(', ') || '' });
    setEditing(post._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const inp = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white transition';

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminNav />
      <div className="flex-1 overflow-x-hidden pt-14 lg:pt-0">

        <div className="bg-white border-b border-gray-100 px-8 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">Blog Posts</h1>
              <p className="text-gray-400 text-sm mt-0.5">Create and manage educational articles</p>
            </div>
            <button
              onClick={() => { setShowForm(true); setEditing(null); setForm(BLANK); }}
              className="flex items-center gap-2 bg-green-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-green-800 transition">
              <Plus size={15} /> New Post
            </button>
          </div>
        </div>

        <div className="p-8 space-y-6">

          {/* Form Panel */}
          {showForm && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-900">{editing ? 'Edit Post' : 'Create New Post'}</h2>
                <button onClick={() => { setShowForm(false); setEditing(null); setForm(BLANK); }}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition">
                  <X size={16} />
                </button>
              </div>
              <form onSubmit={save} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Post Title <span className="text-red-500">*</span></label>
                  <input required placeholder="Enter a compelling title..." value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })} className={inp} />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Excerpt (short summary)</label>
                  <input placeholder="One or two sentences that summarise the article..." value={form.excerpt}
                    onChange={(e) => setForm({ ...form, excerpt: e.target.value })} className={inp} />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Content <span className="text-red-500">*</span></label>
                  <textarea required placeholder="Write the full article content here (plain text or HTML)..."
                    value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })}
                    className={inp + ' resize-y'} rows={10} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category</label>
                    <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inp}>
                      {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Cover Image URL</label>
                    <input placeholder="https://..." value={form.coverImage}
                      onChange={(e) => setForm({ ...form, coverImage: e.target.value })} className={inp} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tags (comma separated)</label>
                  <input placeholder="e.g. JAMB, Study Tips, UK Universities" value={form.tags}
                    onChange={(e) => setForm({ ...form, tags: e.target.value })} className={inp} />
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <button type="button" onClick={() => setForm({ ...form, isPublished: !form.isPublished })}
                    className={`relative w-11 h-6 rounded-full transition-colors ${form.isPublished ? 'bg-green-600' : 'bg-gray-300'}`}>
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.isPublished ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">{form.isPublished ? 'Published' : 'Draft'}</p>
                    <p className="text-xs text-gray-400">{form.isPublished ? 'Visible to all visitors' : 'Only visible to admins'}</p>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => { setShowForm(false); setEditing(null); setForm(BLANK); }}
                    className="flex-1 border border-gray-200 py-3 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving}
                    className="flex-1 bg-green-700 text-white py-3 rounded-xl text-sm font-bold hover:bg-green-800 transition disabled:opacity-60">
                    {saving ? 'Saving...' : editing ? 'Update Post' : 'Publish Post'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Posts table */}
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl h-16 animate-pulse border border-gray-100" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-2xl border border-gray-100">
              <FileText size={36} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No blog posts yet</p>
              <p className="text-gray-400 text-sm">Click &quot;New Post&quot; to create your first article</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-left border-b border-gray-100">
                  <tr>
                    {['Title', 'Category', 'Status', 'Date', 'Actions'].map((h) => (
                      <th key={h} className="px-6 py-4 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {posts.map((post) => (
                    <tr key={post._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900 line-clamp-1">{post.title}</p>
                        {post.excerpt && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{post.excerpt}</p>}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">{post.category}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold ${
                          post.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {post.isPublished ? <Eye size={10} /> : <EyeOff size={10} />}
                          {post.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-xs whitespace-nowrap">
                        {new Date(post.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => editPost(post)}
                            className="flex items-center gap-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs font-semibold px-3 py-1.5 rounded-lg transition">
                            <Edit2 size={12} /> Edit
                          </button>
                          <button onClick={() => deletePost(post._id)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-600 transition">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
