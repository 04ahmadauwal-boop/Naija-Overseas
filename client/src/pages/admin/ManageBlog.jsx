import { useState, useEffect, useRef } from 'react';
import { AdminNav } from './Dashboard';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import {
  Plus, Edit2, Trash2, FileText, X, Eye, EyeOff,
  Upload, Image, Clock, Tag, Globe, AlignLeft,
  ChevronDown, ChevronUp, Search, Building2,
} from 'lucide-react';

const CATEGORIES = ['Study Tips', 'School Reviews', 'Study Abroad', 'Visa Guides', 'News'];

const BLANK = {
  title: '', excerpt: '', content: '', category: 'News',
  coverImage: '', tags: '', isPublished: false,
  metaDescription: '', metaKeywords: '',
};

function calcReadTime(text) {
  const words = text.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export default function ManageBlog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(BLANK);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(false);
  const [seoOpen, setSeoOpen] = useState(false);
  const [showSchoolPicker, setShowSchoolPicker] = useState(false);
  const [schoolSearch, setSchoolSearch] = useState('');
  const [schoolResults, setSchoolResults] = useState([]);
  const [schoolSearching, setSchoolSearching] = useState(false);
  const fileRef = useRef();

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/blog/admin/all');
      setPosts(data.posts);
    } catch { toast.error('Failed to load posts'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error('Image too large (max 10 MB)'); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const { data } = await api.post('/blog/upload-image', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm((f) => ({ ...f, coverImage: data.url }));
      toast.success('Image uploaded');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      metaKeywords: form.metaKeywords.split(',').map((t) => t.trim()).filter(Boolean),
    };
    try {
      if (editing) {
        await api.put(`/blog/${editing}`, payload);
        toast.success('Post updated');
      } else {
        await api.post('/blog', payload);
        toast.success('Post published');
      }
      setShowForm(false); setEditing(null); setForm(BLANK); setPreview(false);
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
    setForm({
      ...post,
      tags: post.tags?.join(', ') || '',
      metaKeywords: post.metaKeywords?.join(', ') || '',
      metaDescription: post.metaDescription || '',
    });
    setEditing(post._id);
    setShowForm(true);
    setPreview(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const searchSchools = async (q) => {
    setSchoolSearch(q);
    if (!q.trim()) { setSchoolResults([]); return; }
    setSchoolSearching(true);
    try {
      const { data } = await api.get(`/schools?search=${encodeURIComponent(q)}&limit=8`);
      setSchoolResults(data.schools || []);
    } catch { setSchoolResults([]); }
    finally { setSchoolSearching(false); }
  };

  const insertSchool = (school) => {
    const ta = document.getElementById('blog-content');
    const start = ta?.selectionStart ?? form.content.length;
    const count = (form.content.match(/class="school-embed"/g) || []).length;
    const num = count + 1;
    const img = school.images?.[0] || '';
    const rawDesc = school.description || '';
    const desc = rawDesc.length > 220 ? rawDesc.slice(0, 220) + '…' : rawDesc;
    const tags = [school.type, school.curriculum, school.state]
      .filter(Boolean).map((t) => `<span>${t}</span>`).join('');
    const lines = [
      `\n<div class="school-embed">`,
      img ? `  <img src="${img}" alt="${school.name}" class="school-embed-img"/>` : null,
      `  <div class="school-embed-body">`,
      `    <h3 class="school-embed-title"><span class="school-embed-num">${num}</span> ${school.name}</h3>`,
      tags ? `    <div class="school-embed-tags">${tags}</div>` : null,
      desc ? `    <p class="school-embed-desc">${desc}</p>` : null,
      `    <div class="school-embed-actions">`,
      `      <a href="/schools/${school.slug}">View School →</a>`,
      `      <a href="/schools/${school.slug}#reviews">View Reviews</a>`,
      `      <a href="/schools/${school.slug}#admission">Get Admission</a>`,
      `    </div>`,
      `  </div>`,
      `</div>\n`,
    ].filter((l) => l !== null);
    const html = lines.join('\n');
    const newContent = form.content.slice(0, start) + html + form.content.slice(start);
    setForm((f) => ({ ...f, content: newContent }));
    setShowSchoolPicker(false);
    setSchoolSearch('');
    setSchoolResults([]);
    setTimeout(() => { ta?.focus(); }, 10);
  };

  const inp = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white transition';
  const readTime = calcReadTime(form.content);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminNav />
      <div className="flex-1 overflow-x-hidden pt-14 lg:pt-0">

        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-4 md:px-8 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">Blog Posts</h1>
              <p className="text-gray-400 text-sm mt-0.5">{posts.length} article{posts.length !== 1 ? 's' : ''} total</p>
            </div>
            <button
              onClick={() => { setShowForm(true); setEditing(null); setForm(BLANK); setPreview(false); }}
              className="flex items-center gap-2 bg-green-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-green-800 transition">
              <Plus size={15} /> New Post
            </button>
          </div>
        </div>

        <div className="p-4 md:p-8 space-y-6">

          {/* ── FORM PANEL ───────────────────────────────────────── */}
          {showForm && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h2 className="font-bold text-gray-900">{editing ? 'Edit Post' : 'Create New Post'}</h2>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPreview(!preview)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${preview ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                    <Eye size={13} /> {preview ? 'Edit' : 'Preview'}
                  </button>
                  <button onClick={() => { setShowForm(false); setEditing(null); setForm(BLANK); setPreview(false); }}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition">
                    <X size={16} />
                  </button>
                </div>
              </div>

              {preview ? (
                /* ── PREVIEW MODE ── */
                <div className="p-6">
                  {form.coverImage && (
                    <img src={form.coverImage} alt="Cover" className="w-full h-64 object-cover rounded-2xl mb-6" />
                  )}
                  <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-semibold">{form.category}</span>
                  <h1 className="text-2xl font-extrabold text-gray-900 mt-3 mb-2">{form.title || 'Untitled'}</h1>
                  {form.excerpt && <p className="text-gray-500 mb-4 text-sm">{form.excerpt}</p>}
                  <div className="flex items-center gap-3 text-xs text-gray-400 mb-6 pb-4 border-b">
                    <span className="flex items-center gap-1"><Clock size={11} />{readTime} min read</span>
                    {form.tags && <span className="flex items-center gap-1"><Tag size={11} />{form.tags}</span>}
                  </div>
                  <div
                    className="prose prose-sm max-w-none prose-headings:font-bold prose-h2:text-xl prose-h2:mt-6 prose-p:text-gray-700"
                    dangerouslySetInnerHTML={{ __html: form.content.replace(/\n/g, '<br/>') }}
                  />
                  {form.metaDescription && (
                    <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                      <p className="text-xs font-bold text-blue-700 mb-1">SEO Meta Description</p>
                      <p className="text-sm text-blue-800">{form.metaDescription}</p>
                    </div>
                  )}
                </div>
              ) : (
                /* ── EDIT MODE ── */
                <form onSubmit={save} className="p-6 space-y-5">

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Post Title <span className="text-red-500">*</span>
                    </label>
                    <input required placeholder="Enter a compelling, SEO-friendly title..."
                      value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                      className={inp} />
                  </div>

                  {/* Excerpt */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Excerpt</label>
                    <textarea placeholder="One or two sentences that summarise the article..."
                      value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                      className={inp + ' resize-none'} rows={2} />
                  </div>

                  {/* Cover Image */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Cover Image</label>
                    <div className="flex gap-3">
                      <div className="flex-1 relative">
                        <Image className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                        <input placeholder="Paste image URL or upload below..."
                          value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                          className={inp + ' pl-9'} />
                      </div>
                      <button type="button" onClick={() => fileRef.current?.click()}
                        disabled={uploading}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition disabled:opacity-60 shrink-0">
                        <Upload size={14} /> {uploading ? 'Uploading…' : 'Upload'}
                      </button>
                      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </div>
                    {form.coverImage && (
                      <div className="mt-3 relative rounded-xl overflow-hidden border border-gray-100">
                        <img src={form.coverImage} alt="Preview" className="w-full h-40 object-cover" />
                        <button type="button"
                          onClick={() => setForm({ ...form, coverImage: '' })}
                          className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center text-gray-600 hover:text-red-600 shadow">
                          <X size={13} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Category + Tags */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category</label>
                      <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inp}>
                        {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tags (comma separated)</label>
                      <input placeholder="e.g. JAMB, Study Tips, UK" value={form.tags}
                        onChange={(e) => setForm({ ...form, tags: e.target.value })} className={inp} />
                    </div>
                  </div>

                  {/* Content */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-sm font-semibold text-gray-700">
                        Content <span className="text-red-500">*</span>
                      </label>
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock size={11} />{readTime} min read · {form.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length} words
                      </span>
                    </div>
                    <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-green-500">
                      <div className="bg-gray-50 border-b border-gray-200 px-3 py-2 flex gap-2 flex-wrap">
                        {[
                          ['B', '<strong>$</strong>'],
                          ['I', '<em>$</em>'],
                          ['H2', '<h2>$</h2>'],
                          ['H3', '<h3>$</h3>'],
                          ['UL', '<ul>\n  <li>$</li>\n</ul>'],
                          ['OL', '<ol>\n  <li>$</li>\n</ol>'],
                          ['Quote', '<blockquote>$</blockquote>'],
                        ].map(([label, wrap]) => (
                          <button key={label} type="button"
                            className="text-xs px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-100 font-mono font-bold transition"
                            onClick={() => {
                              const ta = document.getElementById('blog-content');
                              const start = ta.selectionStart;
                              const end = ta.selectionEnd;
                              const selected = form.content.slice(start, end);
                              const inserted = wrap.replace('$', selected || 'text');
                              const newContent = form.content.slice(0, start) + inserted + form.content.slice(end);
                              setForm({ ...form, content: newContent });
                              setTimeout(() => { ta.focus(); ta.setSelectionRange(start + inserted.length, start + inserted.length); }, 10);
                            }}>
                            {label}
                          </button>
                        ))}
                        <button type="button"
                          onClick={() => { setShowSchoolPicker(true); setSchoolSearch(''); setSchoolResults([]); }}
                          className="flex items-center gap-1.5 text-xs px-2.5 py-1 bg-green-50 border border-green-200 rounded-lg text-green-700 hover:bg-green-100 font-semibold transition ml-1">
                          <Building2 size={12} /> Insert School
                        </button>
                      </div>
                      <textarea id="blog-content" required
                        placeholder="Write the full article here. Use HTML tags for formatting — <h2>, <p>, <ul>, <strong>, <blockquote>, etc."
                        value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })}
                        className="w-full px-4 py-3 text-sm focus:outline-none resize-y font-mono bg-white" rows={18} />
                    </div>
                  </div>

                  {/* SEO Accordion */}
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <button type="button"
                      onClick={() => setSeoOpen(!seoOpen)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition text-sm font-semibold text-gray-700">
                      <span className="flex items-center gap-2"><Globe size={14} /> SEO Settings</span>
                      {seoOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    {seoOpen && (
                      <div className="px-4 py-4 space-y-4 border-t border-gray-200">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Meta Description</label>
                          <textarea placeholder="SEO description (150-160 characters recommended)..."
                            value={form.metaDescription} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
                            className={inp + ' resize-none'} rows={2} maxLength={200} />
                          <p className="text-xs text-gray-400 mt-1">{form.metaDescription.length}/200 characters</p>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Meta Keywords (comma separated)</label>
                          <input placeholder="e.g. best schools Lagos, JAMB tips Nigeria"
                            value={form.metaKeywords} onChange={(e) => setForm({ ...form, metaKeywords: e.target.value })}
                            className={inp} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Publish toggle */}
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
                    <button type="button" onClick={() => { setShowForm(false); setEditing(null); setForm(BLANK); setPreview(false); }}
                      className="flex-1 border border-gray-200 py-3 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
                      Cancel
                    </button>
                    <button type="submit" disabled={saving}
                      className="flex-1 bg-green-700 text-white py-3 rounded-xl text-sm font-bold hover:bg-green-800 transition disabled:opacity-60">
                      {saving ? 'Saving…' : editing ? 'Update Post' : 'Publish Post'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ── POSTS TABLE ──────────────────────────────────────── */}
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl h-16 skeleton-shimmer border border-gray-100" />
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
                    {['Title', 'Category', 'Read Time', 'Views', 'Status', 'Date', 'Actions'].map((h) => (
                      <th key={h} className="px-5 py-4 font-semibold whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {posts.map((post) => (
                    <tr key={post._id} className="hover:bg-gray-50/60 transition">
                      <td className="px-5 py-4 max-w-xs">
                        <div className="flex items-center gap-3">
                          {post.coverImage ? (
                            <img src={post.coverImage} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                              <AlignLeft size={14} className="text-gray-300" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 line-clamp-1">{post.title}</p>
                            {post.excerpt && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{post.excerpt}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">{post.category}</span>
                      </td>
                      <td className="px-5 py-4 text-gray-500 text-xs whitespace-nowrap">
                        <span className="flex items-center gap-1"><Clock size={11} />{post.readTime || '—'} min</span>
                      </td>
                      <td className="px-5 py-4 text-gray-500 text-xs">
                        {(post.views || 0).toLocaleString()}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold ${
                          post.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {post.isPublished ? <Eye size={10} /> : <EyeOff size={10} />}
                          {post.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-400 text-xs whitespace-nowrap">
                        {new Date(post.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-4">
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

      {/* ── SCHOOL PICKER MODAL ───────────────────────────────── */}
      {showSchoolPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden">
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/60">
              <div className="flex items-center gap-2">
                <Building2 size={16} className="text-green-600" />
                <h3 className="font-bold text-gray-900 text-sm">Insert School Card</h3>
              </div>
              <button onClick={() => setShowSchoolPicker(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition">
                <X size={15} />
              </button>
            </div>

            {/* Search input */}
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search schools by name…"
                  value={schoolSearch}
                  onChange={(e) => searchSchools(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                />
                {schoolSearching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1.5 pl-1">Type to search. Click a school to insert a card into the article.</p>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto">
              {schoolResults.length === 0 && schoolSearch.trim() && !schoolSearching ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <Building2 size={28} className="mb-2 opacity-40" />
                  <p className="text-sm">No schools found for &quot;{schoolSearch}&quot;</p>
                </div>
              ) : schoolResults.length === 0 && !schoolSearch.trim() ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-300">
                  <Search size={28} className="mb-2" />
                  <p className="text-sm text-gray-400">Start typing to search schools</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-50">
                  {schoolResults.map((school) => (
                    <li key={school._id}>
                      <button
                        type="button"
                        onClick={() => insertSchool(school)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-green-50 transition text-left group">
                        {school.images?.[0] ? (
                          <img src={school.images[0]} alt={school.name}
                            className="w-12 h-12 rounded-lg object-cover shrink-0 border border-gray-100" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                            <Building2 size={18} className="text-gray-300" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-gray-900 group-hover:text-green-700 truncate">{school.name}</p>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            {school.state && <span className="text-xs text-gray-500">{school.state}</span>}
                            {school.type && <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">{school.type}</span>}
                            {school.curriculum && <span className="text-xs bg-green-50 text-green-600 px-1.5 py-0.5 rounded-full">{school.curriculum}</span>}
                          </div>
                        </div>
                        <span className="text-xs text-green-600 font-semibold opacity-0 group-hover:opacity-100 transition shrink-0">Insert →</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
