const express = require('express');
const router = express.Router();
const slugify = require('slugify');
const multer = require('multer');
const BlogPost = require('../models/BlogPost');
const { protect } = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const cloudinary = require('../utils/cloudinary');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

function calcReadTime(content) {
  const words = content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

// POST /api/blog/upload-image — admin uploads cover image
router.post('/upload-image', protect, isAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file provided' });
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'blog',
      transformation: [{ width: 1200, height: 630, crop: 'fill', quality: 'auto' }],
    });
    res.json({ url: result.secure_url });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/blog/trending — top 8 posts by views
router.get('/trending', async (req, res) => {
  try {
    const posts = await BlogPost.find({ isPublished: true })
      .populate('author', 'name')
      .sort({ views: -1, publishedAt: -1 })
      .limit(8)
      .select('title slug excerpt coverImage category views readTime publishedAt tags author');
    res.json({ posts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/blog — public published posts
router.get('/', async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;
    const filter = { isPublished: true };
    if (category) filter.category = category;
    if (search) filter.$text = { $search: search };

    const total = await BlogPost.countDocuments(filter);
    const posts = await BlogPost.find(filter)
      .populate('author', 'name')
      .sort({ publishedAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select('-content');

    res.json({ posts, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/blog/admin/all — admin sees all posts
router.get('/admin/all', protect, isAdmin, async (req, res) => {
  try {
    const posts = await BlogPost.find().populate('author', 'name').sort({ createdAt: -1 });
    res.json({ posts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/blog/:slug
router.get('/:slug', async (req, res) => {
  try {
    const post = await BlogPost.findOne({ slug: req.params.slug, isPublished: true }).populate('author', 'name');
    if (!post) return res.status(404).json({ message: 'Post not found' });
    // Return related posts (same category, excluding current)
    const related = await BlogPost.find({
      isPublished: true,
      category: post.category,
      _id: { $ne: post._id },
    })
      .sort({ publishedAt: -1 })
      .limit(3)
      .select('title slug excerpt coverImage category readTime publishedAt');
    res.json({ post, related });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/blog/:slug/view — increment view count
router.post('/:slug/view', async (req, res) => {
  try {
    await BlogPost.findOneAndUpdate({ slug: req.params.slug }, { $inc: { views: 1 } });
    res.json({ ok: true });
  } catch {
    res.json({ ok: false });
  }
});

// POST /api/blog — admin creates post
router.post('/', protect, isAdmin, async (req, res) => {
  try {
    const { title, content, excerpt, category, coverImage, tags, isPublished, metaDescription, metaKeywords } = req.body;
    const slug = slugify(title, { lower: true, strict: true }) + '-' + Date.now();
    const readTime = calcReadTime(content);
    const post = await BlogPost.create({
      title,
      slug,
      content,
      excerpt,
      author: req.user._id,
      category,
      coverImage,
      tags,
      isPublished: isPublished || false,
      publishedAt: isPublished ? new Date() : null,
      readTime,
      metaDescription,
      metaKeywords,
    });
    res.status(201).json({ post });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/blog/:id — admin updates post
router.put('/:id', protect, isAdmin, async (req, res) => {
  try {
    const update = { ...req.body };
    if (update.isPublished && !update.publishedAt) update.publishedAt = new Date();
    if (update.content) update.readTime = calcReadTime(update.content);
    const post = await BlogPost.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json({ post });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/blog/:id — admin deletes post
router.delete('/:id', protect, isAdmin, async (req, res) => {
  try {
    await BlogPost.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
