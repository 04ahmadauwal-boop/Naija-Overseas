const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const { protect } = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

const BASE_AMOUNT = 10000;

// ── PUBLIC ────────────────────────────────────────────────────────────────────

// POST /api/coupons/validate
router.post('/validate', async (req, res) => {
  try {
    const code = (req.body.code || '').trim().toUpperCase();
    if (!code) return res.status(400).json({ message: 'Please enter a coupon code.' });

    const coupon = await Coupon.findOne({ code });

    if (!coupon || !coupon.isActive) {
      return res.status(404).json({ message: 'Invalid or inactive coupon code.' });
    }
    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return res.status(400).json({ message: 'This coupon has expired.' });
    }
    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
      return res.status(400).json({ message: 'This coupon has reached its usage limit.' });
    }

    const isFull = coupon.type === 'full';
    const discountAmount = isFull ? BASE_AMOUNT : Math.round((coupon.value / 100) * BASE_AMOUNT);
    const finalAmount = BASE_AMOUNT - discountAmount;

    res.json({
      valid: true,
      type: coupon.type,
      value: coupon.value,
      discountAmount,
      finalAmount,
      message: isFull
        ? 'Full discount applied — this consultation is free!'
        : `${coupon.value}% discount applied — you pay ₦${finalAmount.toLocaleString()}`,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── ADMIN ─────────────────────────────────────────────────────────────────────

// POST /api/coupons — create
router.post('/', protect, isAdmin, async (req, res) => {
  try {
    const { code, type, value, maxUses, expiresAt } = req.body;
    if (!code || !type) return res.status(400).json({ message: 'code and type are required.' });
    if (type === 'percent' && (value === undefined || value < 1 || value > 100)) {
      return res.status(400).json({ message: 'value must be 1–100 for percent coupons.' });
    }
    const coupon = await Coupon.create({
      code: code.trim().toUpperCase(),
      type,
      value: type === 'full' ? 100 : value,
      maxUses: maxUses || null,
      expiresAt: expiresAt || null,
    });
    res.status(201).json({ coupon });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Coupon code already exists.' });
    res.status(500).json({ message: err.message });
  }
});

// GET /api/coupons — list all
router.get('/', protect, isAdmin, async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ coupons });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/coupons/:id — update (toggle active, change value, etc.)
router.patch('/:id', protect, isAdmin, async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!coupon) return res.status(404).json({ message: 'Coupon not found.' });
    res.json({ coupon });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/coupons/:id
router.delete('/:id', protect, isAdmin, async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ message: 'Coupon deleted.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
