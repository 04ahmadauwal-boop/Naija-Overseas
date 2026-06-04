import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Eye, EyeOff, Play, X, ExternalLink } from 'lucide-react';
import { AdminNav } from './Dashboard';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['Parent Review', 'Principal Interview', 'School Review', 'Study Abroad', 'General'];

const EMPTY_FORM = { title: '', school: '', category: 'General', videoUrl: '', thumbnail: '', duration: '', description: '', isPublished: true };

function getYoutubeThumbnail(url) {
  try {
    let id = null;
    if (url.includes('youtu.be/')) id = url.split('youtu.be/')[1]?.split('?')[0];
    else if (url.includes('youtube.com/embed/')) id = url.split('youtube.com/embed/')[1]?.split('?')[0];
    else if (url.includes('youtube.com/watch')) id = new URL(url).searchParams.get('v');
    if (id) return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
  } catch {}
  return null;
}

const BADGE_COLOR = {
  'Parent Review':       'bg-green-600 text-white',
  'Principal Interview': 'bg-emerald-800 text-white',
  'School Review':       'bg-green-200 text-green-900',
  'Study Abroad':        'bg-blue-600 text-white',
  'General':             'bg-gray-500 text-white',
};

export default function ManageVideos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/videos/admin/all');
      setVideos(data.videos);
    } catch {
      toast.error('Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVideos(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.videoUrl.trim()) {
      toast.error('Title and Video URL are required');
      return;
    }
    setSaving(true);
    try {
      await api.post('/videos', form);
      toast.success('Video added successfully');
      setForm(EMPTY_FORM);
      setShowForm(false);
      fetchVideos();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add video');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/videos/${id}`);
      toast.success('Video deleted');
      setVideos((prev) => prev.filter((v) => v._id !== id));
      setDeleteId(null);
    } catch {
      toast.error('Failed to delete');
    }
  };

  const togglePublish = async (video) => {
    try {
      await api.put(`/videos/${video._id}`, { isPublished: !video.isPublished });
      setVideos((prev) => prev.map((v) => v._id === video._id ? { ...v, isPublished: !v.isPublished } : v));
      toast.success(video.isPublished ? 'Video unpublished' : 'Video published');
    } catch {
      toast.error('Failed to update');
    }
  };

  const autoThumb = getYoutubeThumbnail(form.videoUrl);

  return (
    <div className="flex min-h-screen bg-gray-950">
      <AdminNav />

      <div className="flex-1 min-w-0 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

          {/* Header */}
          <div className="flex items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-xl font-extrabold text-white">Manage Videos</h1>
              <p className="text-gray-500 text-sm mt-0.5">{videos.length} video{videos.length !== 1 ? 's' : ''} total</p>
            </div>
            <div className="flex gap-3">
              <Link to="/videos" target="_blank"
                className="flex items-center gap-2 text-sm text-gray-400 border border-gray-700 px-4 py-2 rounded-xl hover:bg-gray-800 transition">
                <ExternalLink size={14} /> Preview
              </Link>
              <button
                onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-semibold px-4 py-2 rounded-xl text-sm transition shadow-lg shadow-green-900/30"
              >
                <Plus size={15} /> Add Video
              </button>
            </div>
          </div>

          {/* Add video form */}
          {showForm && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-white font-bold">Add New Video</h2>
                <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white transition"><X size={18} /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Title *</label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder="e.g. Parent Review — Corona School Lagos"
                      className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-500 placeholder-gray-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">School Name</label>
                    <input
                      type="text"
                      value={form.school}
                      onChange={(e) => setForm({ ...form, school: e.target.value })}
                      placeholder="e.g. Greensprings School"
                      className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-500 placeholder-gray-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Video URL * <span className="normal-case text-gray-600">(YouTube or direct)</span></label>
                    <input
                      type="url"
                      value={form.videoUrl}
                      onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-500 placeholder-gray-600"
                      required
                    />
                    {autoThumb && (
                      <p className="text-green-400 text-xs mt-1">✓ YouTube thumbnail detected automatically</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Category</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-500"
                    >
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Duration <span className="normal-case text-gray-600">(e.g. 6:42)</span></label>
                    <input
                      type="text"
                      value={form.duration}
                      onChange={(e) => setForm({ ...form, duration: e.target.value })}
                      placeholder="6:42"
                      className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-500 placeholder-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Custom Thumbnail URL <span className="normal-case text-gray-600">(optional)</span></label>
                    <input
                      type="url"
                      value={form.thumbnail}
                      onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
                      placeholder="Leave blank to auto-detect from YouTube"
                      className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-500 placeholder-gray-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Description <span className="normal-case text-gray-600">(optional)</span></label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={2}
                    placeholder="Short description shown in the video modal..."
                    className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-500 placeholder-gray-600 resize-none"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isPublished}
                      onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                      className="w-4 h-4 accent-green-600"
                    />
                    <span className="text-gray-300 text-sm">Publish immediately</span>
                  </label>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition disabled:opacity-60"
                  >
                    <Plus size={15} /> {saving ? 'Saving...' : 'Add Video'}
                  </button>
                  <button type="button" onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}
                    className="px-6 py-2.5 rounded-xl border border-gray-700 text-gray-400 text-sm hover:bg-gray-800 transition">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Video list */}
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-20 bg-gray-900 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-20 text-gray-600">
              <Play size={40} className="mx-auto mb-4 opacity-30" />
              <p className="font-medium text-gray-500">No videos yet.</p>
              <p className="text-sm mt-1">Click "Add Video" to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {videos.map((video) => {
                const thumb = video.thumbnail || getYoutubeThumbnail(video.videoUrl);
                return (
                  <div key={video._id} className="flex items-center gap-4 bg-gray-900 border border-gray-800 rounded-2xl p-4 hover:border-gray-700 transition">
                    {/* Thumbnail */}
                    <div className="w-24 h-14 sm:w-32 sm:h-20 rounded-xl overflow-hidden bg-gray-800 shrink-0">
                      {thumb
                        ? <img src={thumb} alt={video.title} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center"><Play size={20} className="text-gray-600" /></div>
                      }
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${BADGE_COLOR[video.category] || 'bg-gray-600 text-white'}`}>
                          {video.category}
                        </span>
                        {!video.isPublished && (
                          <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                            Draft
                          </span>
                        )}
                      </div>
                      <p className="text-white font-semibold text-sm leading-snug truncate">{video.title}</p>
                      {video.school && <p className="text-gray-500 text-xs mt-0.5 truncate">{video.school}</p>}
                      {video.duration && <p className="text-gray-600 text-xs mt-0.5">{video.duration}</p>}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => togglePublish(video)}
                        title={video.isPublished ? 'Unpublish' : 'Publish'}
                        className={`p-2 rounded-lg transition ${video.isPublished ? 'text-green-400 hover:bg-green-900/30' : 'text-gray-500 hover:bg-gray-800'}`}
                      >
                        {video.isPublished ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                      <button
                        onClick={() => setDeleteId(video._id)}
                        className="p-2 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-900/20 transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-white font-bold text-lg mb-2">Delete video?</h3>
            <p className="text-gray-400 text-sm mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => handleDelete(deleteId)}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-semibold py-2.5 rounded-xl text-sm transition">
                Delete
              </button>
              <button onClick={() => setDeleteId(null)}
                className="flex-1 border border-gray-700 text-gray-400 hover:bg-gray-800 py-2.5 rounded-xl text-sm transition">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
