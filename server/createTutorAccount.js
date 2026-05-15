const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const TutorProfile = require('./models/TutorProfile');

dotenv.config();

const TUTOR = {
  // ── User account ──────────────────────────────────────────
  name: 'Mr. Yusuf Abiodun',
  email: 'yusuf@tutors.naijaandoverseas.com',
  password: 'Tutor@Admin2026',
  role: 'student', // use existing role; tutor identity comes from TutorProfile

  // ── Tutor profile ─────────────────────────────────────────
  displayName: 'Mr. Yusuf Abiodun',
  headline: 'Expert Mathematics, Physics & JAMB/WAEC Tutor — 10 Years Experience',
  bio: 'I am an experienced tutor specialising in Mathematics, Physics, and exam preparation for WAEC, JAMB, and NECO. Over 10 years I have helped more than 500 students achieve A and B grades in their external exams. My sessions are structured, practical, and student-centred — I adapt my teaching style to each student\'s unique learning pace. I offer both online and in-person sessions across Nigeria and internationally. Free 30-minute trial available.',
  subjects: [
    'Mathematics', 'Further Mathematics', 'Physics',
    'JAMB Prep', 'WAEC Prep', 'NECO Prep',
  ],
  levels: ['sss', 'waec', 'jamb', 'neco', 'university'],
  teachingMode: ['online', 'in-person'],
  country: 'Nigeria',
  state: 'Lagos',
  city: 'Ikeja',
  currency: 'NGN',
  hourlyRateNaira: 7000,
  groupRateNaira: 4000,
  trialAvailable: true,
  trialDurationMins: 30,
  yearsExperience: 10,
  languages: ['English', 'Yoruba'],
  specializations: [
    'JAMB Preparation', 'WAEC Revision', 'NECO Preparation',
    'Exam Time Management', 'Science Lab Practicals',
  ],
  qualifications: [
    { title: 'B.Sc. Physics', institution: 'University of Lagos', year: '2013' },
    { title: 'PGDE (Post-Graduate Diploma in Education)', institution: 'Ahmadu Bello University', year: '2015' },
  ],
  rating: 4.8,
  reviewCount: 42,
  totalSessions: 210,
  isVerified: true,
  isActive: true,
  responseTime: 'Within 1 hour',
};

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Remove existing account with this email
    const existing = await User.findOne({ email: TUTOR.email });
    if (existing) {
      await TutorProfile.deleteOne({ user: existing._id });
      await User.deleteOne({ _id: existing._id });
      console.log('🗑️  Removed existing account');
    }

    // Create user — pre-save hook in User model handles password hashing
    const user = await User.create({
      name: TUTOR.name,
      email: TUTOR.email,
      password: TUTOR.password,
      role: TUTOR.role,
    });

    // Create tutor profile
    const profile = await TutorProfile.create({
      user: user._id,
      displayName: TUTOR.displayName,
      headline: TUTOR.headline,
      bio: TUTOR.bio,
      subjects: TUTOR.subjects,
      levels: TUTOR.levels,
      teachingMode: TUTOR.teachingMode,
      country: TUTOR.country,
      state: TUTOR.state,
      city: TUTOR.city,
      currency: TUTOR.currency,
      hourlyRateNaira: TUTOR.hourlyRateNaira,
      groupRateNaira: TUTOR.groupRateNaira,
      trialAvailable: TUTOR.trialAvailable,
      trialDurationMins: TUTOR.trialDurationMins,
      yearsExperience: TUTOR.yearsExperience,
      languages: TUTOR.languages,
      specializations: TUTOR.specializations,
      qualifications: TUTOR.qualifications,
      rating: TUTOR.rating,
      reviewCount: TUTOR.reviewCount,
      totalSessions: TUTOR.totalSessions,
      isVerified: TUTOR.isVerified,
      isActive: TUTOR.isActive,
      responseTime: TUTOR.responseTime,
    });

    console.log('\n🎉 Tutor account created successfully!\n');
    console.log('──────────────────────────────────────────');
    console.log(`  Name     : ${TUTOR.name}`);
    console.log(`  Email    : ${TUTOR.email}`);
    console.log(`  Password : ${TUTOR.password}`);
    console.log(`  Profile  : /tutors/${profile._id}`);
    console.log(`  Dashboard: /dashboard/tutor`);
    console.log('──────────────────────────────────────────\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

run();
