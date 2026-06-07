/**
 * Seed script — creates "Best Schools in Lagos" blog post.
 * Usage: node server/seedLagosBlog.js
 *
 * Queries the DB for Lagos schools and uses their real data where available.
 * Falls back to a well-known static list if fewer than 3 approved schools exist.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const slugify = require('slugify');
const BlogPost = require('./models/BlogPost');
const School = require('./models/School');
const User = require('./models/User');

// ---------- Static fallback schools (used when DB has no Lagos data) ----------
const STATIC_SCHOOLS = [
  {
    name: "King's College Lagos",
    slug: 'kings-college-lagos',
    type: 'Public',
    curriculum: 'WAEC',
    state: 'Lagos',
    description: "One of Nigeria's most prestigious secondary schools, founded in 1909. King's College has produced numerous national leaders, professionals, and scholars across all fields.",
    images: ['https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Kings_College_Lagos.jpg/320px-Kings_College_Lagos.jpg'],
  },
  {
    name: "Queen's College Lagos",
    slug: 'queens-college-lagos',
    type: 'Public',
    curriculum: 'WAEC',
    state: 'Lagos',
    description: "The premier federal government girls' secondary school in Lagos, established in 1927. Queen's College is renowned for academic excellence and has consistently produced top WAEC and JAMB candidates.",
    images: [],
  },
  {
    name: 'Atlantic Hall Lagos',
    slug: 'atlantic-hall-lagos',
    type: 'Private',
    curriculum: 'British/WAEC',
    state: 'Lagos',
    description: 'A co-educational boarding school in Epe, Lagos State, offering both Nigerian and British curricula. Known for holistic development, strong arts programme, and beautiful waterfront campus.',
    images: [],
  },
  {
    name: 'Greensprings School',
    slug: 'greensprings-school-lagos',
    type: 'Private',
    curriculum: 'British',
    state: 'Lagos',
    description: 'A leading international school with campuses in Lekki and Anthony Village. Greensprings follows the British curriculum and is well-known for its technology integration and student welfare.',
    images: [],
  },
  {
    name: 'British International School Lagos',
    slug: 'british-international-school-lagos',
    type: 'International',
    curriculum: 'British/IB',
    state: 'Lagos',
    description: 'One of the top international schools in Lagos, offering the British National Curriculum and International Baccalaureate. Serves both expatriate and Nigerian families seeking a globally recognised education.',
    images: [],
  },
  {
    name: 'Corona Schools Lagos',
    slug: 'corona-schools-lagos',
    type: 'Private',
    curriculum: 'Nigerian/British',
    state: 'Lagos',
    description: "Established in 1957, Corona Schools is among Nigeria's oldest private schools. With campuses across Lagos, it blends Nigerian values with international academic standards from nursery through secondary level.",
    images: [],
  },
  {
    name: "St. Gregory's College Lagos",
    slug: 'st-gregorys-college-lagos',
    type: 'Private (Mission)',
    curriculum: 'WAEC',
    state: 'Lagos',
    description: "A Catholic secondary school founded in 1928 by the Society of African Missions. St. Gregory's is consistently among Lagos' top WAEC performers and has produced many distinguished Nigerians.",
    images: [],
  },
  {
    name: 'Chrisland Schools Lagos',
    slug: 'chrisland-schools-lagos',
    type: 'Private',
    curriculum: 'Nigerian/British',
    state: 'Lagos',
    description: "With multiple campuses across Lagos, Chrisland Schools is a household name in Nigerian education. It offers nursery, primary, and secondary education with a strong emphasis on character development and academics.",
    images: [],
  },
  {
    name: 'Dowen College Lagos',
    slug: 'dowen-college-lekki',
    type: 'Private',
    curriculum: 'Nigerian',
    state: 'Lagos',
    description: 'Located in Lekki, Dowen College offers a rigorous academic programme within a disciplined boarding environment. The school has strong results in WAEC and JAMB examinations.',
    images: [],
  },
  {
    name: 'Lagos Anglican Model College',
    slug: 'lagos-anglican-model-college',
    type: 'Private (Mission)',
    curriculum: 'WAEC',
    state: 'Lagos',
    description: "An Anglican Church of Nigeria secondary school that consistently ranks among Lagos' best public examination performers. Known for strong Christian values and disciplined academic culture.",
    images: [],
  },
];

// ---------- HTML builder ----------
function buildSchoolCard(school, index) {
  const num = index + 1;
  const img = Array.isArray(school.images) ? school.images[0] : school.images;
  const desc = school.description
    ? school.description.length > 280
      ? school.description.slice(0, 280) + '…'
      : school.description
    : '';
  const tags = [school.type, school.curriculum, school.state]
    .filter(Boolean)
    .map((t) => `<span>${t}</span>`)
    .join('');
  const slug = school.slug || slugify(school.name, { lower: true, strict: true });

  return `
<div class="school-embed">
  ${img ? `<img src="${img}" alt="${school.name}" class="school-embed-img"/>` : ''}
  <div class="school-embed-body">
    <h3 class="school-embed-title"><span class="school-embed-num">${num}</span> ${school.name}</h3>
    ${tags ? `<div class="school-embed-tags">${tags}</div>` : ''}
    ${desc ? `<p class="school-embed-desc">${desc}</p>` : ''}
    <div class="school-embed-actions">
      <a href="/schools/${slug}">View School →</a>
      <a href="/schools/${slug}#reviews">View Reviews</a>
      <a href="/schools/${slug}#admission">Get Admission</a>
    </div>
  </div>
</div>`.trim();
}

function buildContent(schools) {
  const cards = schools.map((s, i) => buildSchoolCard(s, i)).join('\n\n');

  return `<p>Lagos is home to some of the finest educational institutions in Nigeria — from elite federal government colleges to world-class international schools. Whether you are a parent looking for the best learning environment for your child or a student researching options, this guide covers the top schools in Lagos State ranked by academic reputation, facilities, and student outcomes.</p>

<h2>How We Ranked These Schools</h2>
<p>Our ranking considers WAEC and JAMB performance data, school facilities, extracurricular programmes, alumni distinction, and feedback from parents and students on the Naija &amp; Overseas platform. Both public and private institutions are included so families across all budgets can find the right fit.</p>

${cards}

<h2>How to Choose the Right School in Lagos</h2>
<p>Choosing a school is one of the most important decisions a family makes. Here are the key factors to weigh:</p>
<ul>
  <li><strong>Curriculum alignment</strong> — decide early whether you want Nigerian (WAEC/NECO), British, American, or IB for your child's long-term pathway.</li>
  <li><strong>Location and commute</strong> — Lagos traffic is real. A school 5 km away might take 90 minutes each way. Consider boarding options if distance is a concern.</li>
  <li><strong>Tuition and hidden costs</strong> — always request the full fee schedule including levies, uniforms, and excursion costs before committing.</li>
  <li><strong>Teacher-to-student ratio</strong> — smaller class sizes often correlate with better individual attention and academic outcomes.</li>
  <li><strong>Safety and welfare</strong> — visit the school, speak to current parents, and review their policies on bullying and student welfare.</li>
</ul>

<h2>Apply and Get Admission Assistance</h2>
<p>Naija &amp; Overseas helps families navigate school admissions across Nigeria and abroad. Use our platform to compare schools, read verified reviews, and connect directly with admissions offices. Click <strong>Get Admission</strong> on any school above to start your application journey.</p>`;
}

// ---------- Main ----------
async function main() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌  MONGO_URI not set in .env');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('✅  Connected to MongoDB');

  // Find an admin user to set as author
  const admin = await User.findOne({ role: 'admin' }).lean();
  if (!admin) {
    console.error('❌  No admin user found. Create an admin account first.');
    await mongoose.disconnect();
    process.exit(1);
  }
  console.log(`✅  Using author: ${admin.name} (${admin.email})`);

  // Try to pull real Lagos schools from the DB
  const dbSchools = await School.find({ state: /lagos/i, status: 'approved' })
    .limit(10)
    .lean();

  const schools = dbSchools.length >= 3 ? dbSchools : STATIC_SCHOOLS;
  console.log(`📚  Using ${schools.length} schools (${dbSchools.length >= 3 ? 'from DB' : 'static fallback'})`);

  const title = 'Best Schools in Lagos: Top 10 Ranked for 2025';
  const slug = slugify(title, { lower: true, strict: true });

  // Remove any existing post with this slug
  await BlogPost.deleteOne({ slug });

  const content = buildContent(schools);
  const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  const post = await BlogPost.create({
    title,
    slug,
    excerpt: 'A comprehensive guide to the best schools in Lagos State — covering public, private, and international institutions ranked by academic results, facilities, and parent feedback.',
    content,
    category: 'School Reviews',
    coverImage: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1200&q=80',
    tags: ['Lagos Schools', 'Best Schools Nigeria', 'Secondary School Lagos', 'School Admission'],
    isPublished: true,
    publishedAt: new Date(),
    readTime,
    metaDescription: 'Discover the best schools in Lagos State 2025 — top-ranked public, private, and international schools with admission links and parent reviews.',
    metaKeywords: ['best schools Lagos', 'top schools Lagos State', 'Lagos secondary schools', 'international schools Lagos', 'school admission Nigeria'],
    author: admin._id,
  });

  console.log(`\n🎉  Blog post created!`);
  console.log(`    Title    : ${post.title}`);
  console.log(`    Slug     : /blog/${post.slug}`);
  console.log(`    Schools  : ${schools.length} entries`);
  console.log(`    Read time: ${readTime} min`);
  console.log(`    Published: ${post.isPublished}`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
