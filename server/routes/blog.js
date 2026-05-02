const express = require('express');
const router = express.Router();
const slugify = require('slugify');
const BlogPost = require('../models/BlogPost');
const { protect } = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

// GET /api/blog — public published posts
router.get('/', async (req, res) => {
  try {
    const { category, search, page = 1, limit = 9 } = req.query;
    const filter = { isPublished: true };
    if (category) filter.category = category;
    if (search) filter.title = new RegExp(search, 'i');

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
    res.json({ post });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/blog — admin creates post
router.post('/', protect, isAdmin, async (req, res) => {
  try {
    const { title, content, excerpt, category, coverImage, tags, isPublished } = req.body;
    const slug = slugify(title, { lower: true, strict: true }) + '-' + Date.now();
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
    });
    res.status(201).json({ post });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/blog/:id — admin updates post
router.put('/:id', protect, isAdmin, async (req, res) => {
  try {
    const update = req.body;
    if (update.isPublished && !update.publishedAt) update.publishedAt = new Date();
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
