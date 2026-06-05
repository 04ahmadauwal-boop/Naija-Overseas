const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const SchoolReview = require('../models/SchoolReview');
const School = require('../models/School');
const { protect, optionalAuth } = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

// Recalculate and save avg rating + reviewCount on the School document
async function updateSchoolRating(schoolId) {
  const agg = await SchoolReview.aggregate([
    { $match: { school: new mongoose.Types.ObjectId(schoolId) } },
    { $group: { _id: '$school', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  const avg   = agg[0] ? Math.round(agg[0].avg * 10) / 10 : 0;
  const count = agg[0] ? agg[0].count : 0;
  await School.findByIdAndUpdate(schoolId, { rating: avg, reviewCount: count });
}

// ── POST /api/reviews  — submit a review (auth required) ─────────────────────
router.post('/', protect, async (req, res) => {
  try {
    const { schoolId, rating, title, text, category, isAnonymous } = req.body;

    if (!schoolId || !rating || !text) {
      return res.status(400).json({ message: 'schoolId, rating, and text are required.' });
    }

    const school = await School.findById(schoolId);
    if (!school || school.status !== 'approved') {
      return res.status(404).json({ message: 'School not found.' });
    }

    const review = await SchoolReview.create({
      school: schoolId,
      user: req.user._id,
      rating,
      title,
      text,
      category: category || 'General',
      isAnonymous: !!isAnonymous,
    });

    await updateSchoolRating(schoolId);

    const populated = await SchoolReview.findById(review._id)
      .populate('user', 'name profilePhoto')
      .populate('school', 'name slug state');

    res.status(201).json({ review: populated });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'You have already reviewed this school.' });
    }
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// ── GET /api/reviews  — all reviews (public, paginated) ──────────────────────
// Query params: page, limit, sort (newest|oldest|highest|lowest), search, schoolId
router.get('/', optionalAuth, async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(30, parseInt(req.query.limit) || 12);
    const skip  = (page - 1) * limit;
    const { sort = 'newest', search, schoolId, category } = req.query;

    const filter = {};
    if (schoolId) filter.school = schoolId;
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { text:  { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
      ];
    }

    const sortMap = {
      newest:  { createdAt: -1 },
      oldest:  { createdAt:  1 },
      highest: { rating: -1 },
      lowest:  { rating:  1 },
    };
    const sortObj = sortMap[sort] || sortMap.newest;

    const [reviews, total] = await Promise.all([
      SchoolReview.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .populate('user',   'name profilePhoto')
        .populate('school', 'name slug state city'),
      SchoolReview.countDocuments(filter),
    ]);

    res.json({ reviews, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// ── GET /api/reviews/school/:schoolId  — reviews for one school ───────────────
router.get('/school/:schoolId', optionalAuth, async (req, res) => {
  try {
    const { schoolId } = req.params;
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(20, parseInt(req.query.limit) || 10);
    const skip  = (page - 1) * limit;
    const sort  = req.query.sort === 'highest' ? { rating: -1 } : { createdAt: -1 };

    const [reviews, total] = await Promise.all([
      SchoolReview.find({ school: schoolId })
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('user', 'name profilePhoto'),
      SchoolReview.countDocuments({ school: schoolId }),
    ]);

    // Rating breakdown (count per star)
    const breakdown = await SchoolReview.aggregate([
      { $match: { school: new mongoose.Types.ObjectId(schoolId) } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
    ]);
    const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    breakdown.forEach(({ _id, count }) => { dist[_id] = count; });

    // Has current user already reviewed?
    let userReview = null;
    if (req.user) {
      userReview = await SchoolReview.findOne({ school: schoolId, user: req.user._id });
    }

    res.json({ reviews, total, page, pages: Math.ceil(total / limit), dist, userReview });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// ── GET /api/reviews/owner  — reviews for school owner's school ───────────────
router.get('/owner', protect, async (req, res) => {
  try {
    const schools = await School.find({ owner: req.user._id }).select('_id name');
    if (!schools.length) return res.json({ reviews: [], total: 0 });

    const schoolIds = schools.map((s) => s._id);
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(20, parseInt(req.query.limit) || 10);
    const skip  = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      SchoolReview.find({ school: { $in: schoolIds } })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('user',   'name profilePhoto')
        .populate('school', 'name'),
      SchoolReview.countDocuments({ school: { $in: schoolIds } }),
    ]);

    res.json({ reviews, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// ── GET /api/reviews/admin  — all reviews for admin ──────────────────────────
router.get('/admin', protect, isAdmin, async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(30, parseInt(req.query.limit) || 15);
    const skip  = (page - 1) * limit;
    const { search, sort = 'newest' } = req.query;

    const filter = {};
    if (search) {
      filter.$or = [
        { text:  { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
      ];
    }
    const sortObj = sort === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };

    const [reviews, total] = await Promise.all([
      SchoolReview.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .populate('user',   'name email profilePhoto')
        .populate('school', 'name slug state'),
      SchoolReview.countDocuments(filter),
    ]);

    res.json({ reviews, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// ── DELETE /api/reviews/:id  — owner or admin can delete ─────────────────────
router.delete('/:id', protect, async (req, res) => {
  try {
    const review = await SchoolReview.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found.' });

    const isOwner = review.user.toString() === req.user._id.toString();
    const isAdminUser = req.user.role === 'admin';
    if (!isOwner && !isAdminUser) {
      return res.status(403).json({ message: 'Not authorised.' });
    }

    const schoolId = review.school;
    await review.deleteOne();
    await updateSchoolRating(schoolId);

    res.json({ message: 'Review deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// ── POST /api/reviews/seed-demo  — create 2-3 demo reviews per school ────────
const SEED_TEMPLATES = [
  { authorName: 'Mrs. Adunola Fashola',   rating: 5, category: 'Teaching Quality',           title: 'Exceptional teachers',           text: 'The quality of teaching here is outstanding. The teachers are patient, well-prepared and genuinely passionate about seeing each student succeed. My daughter\'s grades improved dramatically in one term.' },
  { authorName: 'Emeka Okafor',           rating: 5, category: 'Academic Results',            title: '5 A1s in WAEC',                  text: 'I sat my WAEC exams here and came out with five A1s including Maths and English. The after-school revision sessions the teachers ran were absolutely invaluable to my success.' },
  { authorName: 'Alhaji Musa Bello',      rating: 4, category: 'Infrastructure',              title: 'Well-maintained campus',         text: 'The campus is clean, spacious and well-organised. The science labs are properly equipped and the library has a solid collection. Overall a very impressive facility.' },
  { authorName: 'Chinyere Obi',           rating: 5, category: 'Communication',               title: 'Always kept informed',           text: 'The school keeps parents in the loop through weekly progress reports and prompt WhatsApp updates. I have never felt out of touch with my child\'s academic progress.' },
  { authorName: 'Tunde Adebisi',          rating: 5, category: 'Discipline',                  title: 'Firm but fair',                  text: 'The discipline here is firm but never unkind. My son arrived as a disruptive student and within two terms he was appointed a prefect. The pastoral care team does extraordinary work.' },
  { authorName: 'Grace Ekwueme',          rating: 5, category: 'Extracurricular Activities',  title: 'More than just academics',       text: 'The debate society, chess club and school choir are all thriving. My twins have each found something they are truly passionate about outside the classroom.' },
  { authorName: 'Yusuf Al-Amin',          rating: 4, category: 'Fee Structure',               title: 'Fair value for money',           text: 'The fees are on the higher side but clearly broken down with no hidden charges. Given the quality of teaching and facilities, I consider it money very well spent.' },
  { authorName: 'Ngozi Uchenna',          rating: 5, category: 'Environment',                 title: 'Safe and welcoming',             text: 'The school compound is secure, well-lit and always immaculately clean. My children feel safe here and actually look forward to going to school each morning.' },
  { authorName: 'Mrs. Aisha Bello',       rating: 5, category: 'Teaching Quality',            title: 'Outstanding teachers',           text: 'The teachers here are exceptional — patient, knowledgeable, and genuinely invested in each child. My son went from struggling in Maths to loving it completely.' },
  { authorName: 'Seun Okafor',            rating: 5, category: 'Academic Results',            title: '8 A1s in WAEC',                  text: 'I scored 8 A1s in WAEC and received a scholarship offer to study Engineering in Canada. My school pushed me to be the best version of myself every day.' },
  { authorName: 'Mr. Kofi Mensah',        rating: 5, category: 'Communication',               title: 'Real-time updates',              text: 'The school sends weekly updates via WhatsApp and email. I always know exactly how my children are doing — test scores, behaviour, everything in real time.' },
  { authorName: 'Dr. Tunde Fashola',      rating: 5, category: 'Student-Teacher Ratio',       title: 'Individual attention',           text: 'With only 20 students per class, teachers actually know my kids by name. The one-on-one attention has completely transformed their confidence and results.' },
  { authorName: 'Biodun Alabi',           rating: 5, category: 'Transport Facilities',        title: 'Reliable and safe buses',        text: 'The school bus arrives within five minutes of schedule every day. The drivers are vetted and professional — my daughter feels completely safe every morning.' },
  { authorName: 'Chidinma Eze',           rating: 5, category: 'Environment',                 title: 'A place to thrive',              text: 'The grounds are immaculate, classrooms are airy, and the school has a genuine sense of community. My children wake up every morning excited to attend.' },
  { authorName: 'Bello Adamu',            rating: 5, category: 'Academic Results',            title: 'Top 5 in one term',              text: 'My son improved from the bottom quartile to top 5 in his class in a single term. The teachers identified his learning gaps and addressed them individually.' },
  { authorName: 'Mrs. Adeola Taiwo',      rating: 5, category: 'Infrastructure',              title: 'World-class labs',               text: 'The new science laboratories are incredible. My daughter says every Biology practical feels like real research. The investment in equipment truly shows.' },
  { authorName: 'Musa Garba',             rating: 5, category: 'Academic Results',            title: 'University placements',          text: 'Both my daughters secured federal government scholarship placements after JAMB. The school preparation programme is thorough and highly effective.' },
  { authorName: 'Hauwa Suleiman',         rating: 5, category: 'Discipline',                  title: 'Perfect balance',                text: 'The school strikes a perfect balance — firm rules but never harsh. My children are respectful, punctual, and responsible in ways I have never seen before.' },
  { authorName: 'Adaeze Okonkwo',         rating: 5, category: 'Extracurricular Activities',  title: 'National debate champions',      text: 'I captained the debate team to a national semifinal this year. Teachers coach us voluntarily after school. The support here is genuinely overwhelming.' },
  { authorName: 'Amina Yusuf',            rating: 5, category: 'Teaching Quality',            title: 'Reads for pleasure now',         text: 'The English and Maths teachers are extraordinary. My daughter reads novels for fun now — something I never imagined after her struggles last year.' },
  { authorName: 'Blessing Okafor',        rating: 5, category: 'Discipline',                  title: 'Complete transformation',        text: 'My son used to be disruptive in class. Six months here and his behaviour has completely changed. The pastoral care team is truly phenomenal.' },
  { authorName: 'Ifeoma Chukwu',          rating: 5, category: 'Extracurricular Activities',  title: 'Found my passion',               text: 'The art and drama club here is incredible. I performed in two productions this term and discovered I want to study theatre arts at university.' },
  { authorName: 'Mrs. Folake Adegoke',    rating: 5, category: 'Academic Results',            title: 'Five credits first attempt',     text: 'My twin boys both made five credits including English and Maths on their first WAEC attempt. This school\'s exam preparation is second to none.' },
  { authorName: 'Kwame Asante',           rating: 5, category: 'Communication',               title: 'Personal parent calls',          text: 'The headmistress calls parents personally when there is an issue. That level of personal attention is very rare and deeply reassuring as a parent.' },
  { authorName: 'Oluwakemi Adeniyi',      rating: 5, category: 'Infrastructure',              title: 'Solar-powered labs',             text: 'The school just opened a solar-powered computer lab and a new 400-seat hall. They constantly reinvest in the student experience and it shows.' },
  { authorName: 'Fatima Ibrahim',         rating: 5, category: 'Student-Teacher Ratio',       title: 'Three teachers per class',       text: 'My daughter\'s class has 22 students and three rotating teachers. The individualised feedback on every piece of homework is truly astonishing.' },
  { authorName: 'Victor Nwachukwu',       rating: 5, category: 'Environment',                 title: 'Safest school around',           text: 'The school installed CCTV, biometric entry, and a full medical bay. My children have never felt safer anywhere else in their entire lives.' },
  { authorName: 'Hajiya Ramatu Aliyu',    rating: 5, category: 'Teaching Quality',            title: 'University-level teaching',      text: 'The science department is the best I have seen at secondary level in Nigeria. My son came home explaining concepts I only learnt in university.' },
  { authorName: 'Alhaji Sani Umar',       rating: 5, category: 'Transport Facilities',        title: 'Live bus tracking',              text: 'We live 12 km from school and the bus service has never once failed us. Tracking the bus live on the app gives me peace of mind every morning.' },
  { authorName: 'James Nkrumah',          rating: 4, category: 'Fee Structure',               title: 'Worth every pesewa',             text: 'Slightly expensive compared to others nearby, but every pesewa is justified. The quality of teaching, facilities, and pastoral care is excellent.' },
];

router.post('/seed-demo', protect, isAdmin, async (req, res) => {
  try {
    const existing = await SchoolReview.countDocuments();
    if (existing > 0) {
      return res.status(400).json({ message: `${existing} reviews already exist. Use "Delete all demo reviews" first.` });
    }

    const schools = await School.find({ status: 'approved' }).select('_id').lean();
    if (!schools.length) {
      return res.status(400).json({ message: 'No approved schools found to seed reviews for.' });
    }

    const docs = [];
    for (const school of schools) {
      const shuffled = [...SEED_TEMPLATES].sort(() => Math.random() - 0.5);
      const count = Math.floor(Math.random() * 2) + 2; // 2 or 3 reviews per school
      for (let i = 0; i < count; i++) {
        const t = shuffled[i % shuffled.length];
        const daysAgo = Math.floor(Math.random() * 180); // random date in last 6 months
        docs.push({
          _id:        new mongoose.Types.ObjectId(),
          school:     school._id,
          user:       new mongoose.Types.ObjectId(), // placeholder — not a real user
          authorName: t.authorName,
          rating:     t.rating,
          title:      t.title,
          text:       t.text,
          category:   t.category,
          isAnonymous: false,
          createdAt:  new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
          updatedAt:  new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
        });
      }
    }

    await SchoolReview.collection.insertMany(docs);

    // Recalculate avg rating for every school
    for (const school of schools) {
      await updateSchoolRating(school._id);
    }

    res.json({ created: docs.length, schools: schools.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// ── DELETE /api/reviews/seed-demo  — wipe all demo (seeded) reviews ───────────
router.delete('/seed-demo', protect, isAdmin, async (req, res) => {
  try {
    // Demo reviews have authorName set; real user-submitted reviews do not
    const result = await SchoolReview.deleteMany({ authorName: { $exists: true, $ne: null } });

    // Recalculate ratings after deletion
    const schools = await School.find({ status: 'approved' }).select('_id').lean();
    for (const s of schools) await updateSchoolRating(s._id);

    res.json({ deleted: result.deletedCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
