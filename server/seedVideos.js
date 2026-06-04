const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Video = require('./models/Video');

dotenv.config();

const DEMO_VIDEOS = exports.DEMO_VIDEOS = [
  {
    title: 'Corona Secondary School Lagos — Parent Review',
    school: 'Corona Secondary School',
    category: 'Parent Review',
    videoUrl: 'https://www.youtube.com/watch?v=TDIXXv34Igs',
    duration: '7:48',
    description: 'A parent shares her experience enrolling her son at Corona Secondary School Lagos — facilities, curriculum and community.',
    isPublished: true,
  },
  {
    title: 'Greensprings School — Principal Interview',
    school: 'Greensprings School',
    category: 'Principal Interview',
    videoUrl: 'https://www.youtube.com/watch?v=iG9CE55wbtY',
    duration: '19:24',
    description: 'The Head of School at Greensprings talks about their holistic approach to education, the Cambridge curriculum and student outcomes.',
    isPublished: true,
  },
  {
    title: 'Why Nigerian Students Are Choosing to Study Abroad',
    school: '',
    category: 'Study Abroad',
    videoUrl: 'https://www.youtube.com/watch?v=5MgBikgcWnY',
    duration: '19:27',
    description: 'An in-depth look at why more Nigerian families are pursuing UK, Canada and USA university placements for their children.',
    isPublished: true,
  },
  {
    title: 'Loyola Jesuit College Abuja — School Review',
    school: 'Loyola Jesuit College',
    category: 'School Review',
    videoUrl: 'https://www.youtube.com/watch?v=lmyZMtPVodo',
    duration: '11:08',
    description: 'A detailed walkthrough of Loyola Jesuit College Abuja — academic standards, boarding facilities and admission process.',
    isPublished: true,
  },
  {
    title: 'Atlantic Hall Lagos — Parent Review',
    school: 'Atlantic Hall',
    category: 'Parent Review',
    videoUrl: 'https://www.youtube.com/watch?v=Ks-_Mh1QhMc',
    duration: '8:32',
    description: 'Parents of Atlantic Hall students discuss the school\'s culture, IGCSE results and overall value for money.',
    isPublished: true,
  },
  {
    title: 'How to Get a UK Student Visa as a Nigerian',
    school: '',
    category: 'Study Abroad',
    videoUrl: 'https://www.youtube.com/watch?v=h11u3vtcpaY',
    duration: '14:55',
    description: 'Step-by-step guide on the UK Tier 4 student visa process specifically for Nigerian applicants.',
    isPublished: true,
  },
  {
    title: 'Lifeforte International School — School Review',
    school: 'Lifeforte International School',
    category: 'School Review',
    videoUrl: 'https://www.youtube.com/watch?v=qpgRwBiP5FU',
    duration: '9:14',
    description: 'Lifeforte International School Ibadan — exploring the campus, boarding houses, sports facilities and academic record.',
    isPublished: true,
  },
  {
    title: 'Federal Government College — Alumni Speak Out',
    school: 'Federal Government College',
    category: 'Parent Review',
    videoUrl: 'https://www.youtube.com/watch?v=wHGqp8lz36c',
    duration: '6:02',
    description: 'Alumni of FGC share how their secondary school education shaped their university success and career paths.',
    isPublished: true,
  },
  {
    title: 'Choosing Between Private and Public Schools in Nigeria',
    school: '',
    category: 'General',
    videoUrl: 'https://www.youtube.com/watch?v=iTQRFSVhDiM',
    duration: '12:17',
    description: 'An education consultant breaks down the key differences between private and public schooling options for Nigerian families.',
    isPublished: true,
  },
  {
    title: 'Nigerian Turkish Nile University — Principal Interview',
    school: 'Nigerian Turkish Nile University',
    category: 'Principal Interview',
    videoUrl: 'https://www.youtube.com/watch?v=IeVhMsIQ3wA',
    duration: '15:42',
    description: 'The principal discusses the school\'s Turkish-Nigerian education model, scholarships and graduate success rates.',
    isPublished: true,
  },
  {
    title: 'Studying in Canada as a Nigerian Student — Full Guide',
    school: '',
    category: 'Study Abroad',
    videoUrl: 'https://www.youtube.com/watch?v=VnpB3dIEFk0',
    duration: '22:10',
    description: 'Everything Nigerian students need to know about studying in Canada — application, visa, cost of living and scholarships.',
    isPublished: true,
  },
  {
    title: 'Meadow Hall School Lagos — School Review',
    school: 'Meadow Hall School',
    category: 'School Review',
    videoUrl: 'https://www.youtube.com/watch?v=dXTfFH1N6fI',
    duration: '8:49',
    description: 'A comprehensive review of Meadow Hall Lagos — curriculum, teaching quality, extracurriculars and fees.',
    isPublished: true,
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    const existing = await Video.countDocuments();
    if (existing > 0) {
      console.log(`⚠️  ${existing} videos already exist. Skipping seed to avoid duplicates.`);
      console.log('   Run with --force to clear and re-seed.');
      if (!process.argv.includes('--force')) {
        process.exit(0);
      }
      await Video.deleteMany({});
      console.log('🗑️  Cleared existing videos');
    }

    await Video.insertMany(DEMO_VIDEOS);
    console.log(`✅  ${DEMO_VIDEOS.length} demo videos seeded successfully`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
};

seed();
