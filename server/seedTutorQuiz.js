/**
 * Seed quiz questions for a tutor by email.
 * Questions are selected based on the tutor's profile subjects.
 * Run: node server/seedTutorQuiz.js [email]
 * Defaults to tutor@admin.com if no email is provided.
 */

require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');

// ── QUESTION BANK (keyed by canonical subject name) ──────────────────────────

const QUESTION_BANK = {};

QUESTION_BANK['Mathematics'] = [
  // Algebra
  { topic: 'Algebra', question: 'Solve for x: 3x + 7 = 22', options: ['x = 3', 'x = 4', 'x = 5', 'x = 6', 'x = 7'], correctIndex: 2 },
  { topic: 'Algebra', question: 'Factorise: x² + 5x + 6', options: ['(x + 1)(x + 6)', '(x + 2)(x + 3)', '(x + 2)(x + 4)', '(x + 3)(x + 4)', '(x + 1)(x + 5)'], correctIndex: 1 },
  { topic: 'Algebra', question: 'Solve the simultaneous equations: x + y = 7 and x – y = 3', options: ['x = 2, y = 5', 'x = 4, y = 3', 'x = 5, y = 2', 'x = 3, y = 4', 'x = 6, y = 1'], correctIndex: 2 },
  { topic: 'Algebra', question: 'Expand: (2x + 3)²', options: ['4x² + 9', '4x² + 6x + 9', '4x² + 12x + 9', '2x² + 12x + 9', '4x² + 12x + 6'], correctIndex: 2 },
  { topic: 'Algebra', question: 'If f(x) = 2x² – 3x + 1, find f(2)', options: ['1', '3', '5', '7', '9'], correctIndex: 1 },
  // Number Theory
  { topic: 'Number Theory', question: 'What is the Highest Common Factor (HCF) of 36 and 48?', options: ['6', '8', '12', '18', '24'], correctIndex: 2 },
  { topic: 'Number Theory', question: 'What is the Lowest Common Multiple (LCM) of 4, 6, and 8?', options: ['12', '16', '24', '32', '48'], correctIndex: 2 },
  { topic: 'Number Theory', question: 'Which of the following is a prime number?', options: ['1', '9', '15', '17', '21'], correctIndex: 3 },
  // Indices & Logarithms
  { topic: 'Indices', question: 'Simplify: 2³ × 2⁴', options: ['2⁶', '2⁷', '2¹²', '4⁷', '8⁷'], correctIndex: 1 },
  { topic: 'Indices', question: 'Evaluate: 27^(2/3)', options: ['3', '6', '9', '18', '81'], correctIndex: 2 },
  { topic: 'Logarithms', question: 'Evaluate: log₁₀ 1000', options: ['1', '2', '3', '4', '10'], correctIndex: 2 },
  // Geometry & Mensuration
  { topic: 'Geometry', question: 'The sum of interior angles of a hexagon is:', options: ['360°', '540°', '720°', '900°', '1080°'], correctIndex: 2 },
  { topic: 'Geometry', question: 'Find the area of a circle with radius 7 cm. (Take π = 22/7)', options: ['44 cm²', '154 cm²', '196 cm²', '308 cm²', '616 cm²'], correctIndex: 1 },
  { topic: 'Mensuration', question: 'The volume of a cylinder of radius 3 cm and height 10 cm is: (π ≈ 3.14)', options: ['94.2 cm³', '188.4 cm³', '282.6 cm³', '376.8 cm³', '942 cm³'], correctIndex: 2 },
  { topic: 'Geometry', question: 'Two angles of a triangle are 60° and 80°. What is the third angle?', options: ['20°', '30°', '40°', '50°', '60°'], correctIndex: 2 },
  // Statistics & Probability
  { topic: 'Statistics', question: 'The mean of 4, 7, 9, 10, and 10 is:', options: ['7', '8', '9', '10', '40'], correctIndex: 1 },
  { topic: 'Statistics', question: 'Find the median of: 3, 5, 7, 9, 11, 13', options: ['7', '8', '9', '10', '11'], correctIndex: 1 },
  { topic: 'Probability', question: 'A bag has 3 red balls and 5 blue balls. What is the probability of picking a red ball?', options: ['1/8', '3/8', '5/8', '3/5', '1/3'], correctIndex: 1 },
  // Quadratics
  { topic: 'Quadratics', question: 'What are the roots of x² – 5x + 6 = 0?', options: ['x = 1 and x = 6', 'x = 2 and x = 3', 'x = –2 and x = –3', 'x = 1 and x = 5', 'x = 3 and x = 4'], correctIndex: 1 },
  { topic: 'Quadratics', question: 'Using the quadratic formula, one root of 2x² + 3x – 2 = 0 is:', options: ['x = –2', 'x = ½', 'x = 1', 'x = 2', 'x = –1'], correctIndex: 1 },
  // Fractions, Ratio & Percentage
  { topic: 'Fractions', question: 'Evaluate: ³⁄₄ + ²⁄₃', options: ['5/7', '1 and 5/12', '1 and 1/12', '5/12', '17/12'], correctIndex: 4 },
  { topic: 'Ratio', question: 'Divide ₦720 in the ratio 3 : 5. What is the larger share?', options: ['₦270', '₦360', '₦450', '₦480', '₦540'], correctIndex: 2 },
  { topic: 'Percentage', question: 'A shirt costs ₦4,000. After a 15% discount, what is the selling price?', options: ['₦3,200', '₦3,400', '₦3,600', '₦3,800', '₦4,600'], correctIndex: 1 },
  { topic: 'Percentage', question: 'What percentage of 80 is 20?', options: ['10%', '15%', '20%', '25%', '40%'], correctIndex: 3 },
  // Trigonometry
  { topic: 'Trigonometry', question: 'What is the value of sin 30°?', options: ['0', '½', '√2/2', '√3/2', '1'], correctIndex: 1 },
  { topic: 'Trigonometry', question: 'In a right-angled triangle, if the opposite side is 3 and hypotenuse is 5, find sin θ.', options: ['3/4', '3/5', '4/5', '5/3', '5/4'], correctIndex: 1 },
  // Sequences & Series
  { topic: 'Sequences', question: 'Find the 10th term of the arithmetic sequence: 3, 7, 11, 15, …', options: ['35', '37', '39', '41', '43'], correctIndex: 2 },
  { topic: 'Sequences', question: 'Find the sum of the first 5 terms of the geometric series: 2, 6, 18, …', options: ['62', '128', '242', '244', '486'], correctIndex: 2 },
  // Sets
  { topic: 'Sets', question: 'If A = {1, 2, 3, 4} and B = {3, 4, 5, 6}, find A ∩ B.', options: ['{1, 2}', '{5, 6}', '{3, 4}', '{1, 2, 3, 4, 5, 6}', '{}'], correctIndex: 2 },
  { topic: 'Sets', question: 'In a class of 40 students, 25 study French, 20 study Spanish, and 10 study both. How many study neither?', options: ['5', '10', '15', '20', '25'], correctIndex: 0 },
];

QUESTION_BANK['Further Mathematics'] = [
  // Calculus
  { topic: 'Differentiation', question: 'Differentiate y = 3x⁴ – 5x² + 7 with respect to x.', options: ['12x³ – 10x', '12x³ – 5x', '4x³ – 10x', '12x³ – 10x + 7', '3x³ – 5x'], correctIndex: 0 },
  { topic: 'Differentiation', question: 'Find dy/dx if y = (2x + 1)⁵.', options: ['5(2x + 1)⁴', '10(2x + 1)⁴', '5(2x + 1)⁵', '2(2x + 1)⁴', '10(2x + 1)⁵'], correctIndex: 1 },
  { topic: 'Integration', question: 'Evaluate ∫(4x³ + 2x) dx.', options: ['x⁴ + x² + C', '12x² + 2 + C', '4x⁴ + 2x² + C', 'x⁴ + x² – C', '4x² + 2 + C'], correctIndex: 0 },
  { topic: 'Integration', question: 'Evaluate ∫₀² (3x²) dx.', options: ['4', '6', '8', '9', '12'], correctIndex: 2 },
  { topic: 'Differentiation', question: 'The gradient of the curve y = x³ – 3x at the point where x = 2 is:', options: ['3', '6', '9', '12', '15'], correctIndex: 2 },
  // Binomial Theorem
  { topic: 'Binomial Theorem', question: 'Find the coefficient of x³ in the expansion of (1 + x)⁵.', options: ['5', '10', '15', '20', '25'], correctIndex: 1 },
  { topic: 'Binomial Theorem', question: 'Using the binomial theorem, the 3rd term in the expansion of (2 + x)⁴ is:', options: ['6x²', '12x²', '24x²', '48x²', '96x²'], correctIndex: 2 },
  // Vectors
  { topic: 'Vectors', question: 'If a = 3i + 4j, find |a|.', options: ['3', '4', '5', '7', '25'], correctIndex: 2 },
  { topic: 'Vectors', question: 'Given a = (2, 3) and b = (1, –1), find a + b.', options: ['(1, 4)', '(3, 2)', '(3, 4)', '(2, 3)', '(1, 2)'], correctIndex: 1 },
  // Matrices
  { topic: 'Matrices', question: 'Find the determinant of the matrix [[3, 2], [1, 4]].', options: ['10', '12', '14', '8', '6'], correctIndex: 0 },
  { topic: 'Matrices', question: 'What is the transpose of the matrix [[1, 2], [3, 4]]?', options: ['[[1, 3], [2, 4]]', '[[4, 3], [2, 1]]', '[[1, 2], [3, 4]]', '[[2, 1], [4, 3]]', '[[3, 4], [1, 2]]'], correctIndex: 0 },
  // Complex Numbers
  { topic: 'Complex Numbers', question: 'Simplify (3 + 2i) + (1 – 4i).', options: ['4 – 2i', '2 + 6i', '4 + 6i', '2 – 2i', '4 – 6i'], correctIndex: 0 },
  { topic: 'Complex Numbers', question: 'Find the modulus of z = 5 + 12i.', options: ['7', '10', '13', '17', '25'], correctIndex: 2 },
  // Permutations & Combinations
  { topic: 'Permutations', question: 'In how many ways can 4 people be arranged in a row?', options: ['8', '12', '16', '24', '48'], correctIndex: 3 },
  { topic: 'Combinations', question: 'How many ways can a committee of 3 be chosen from 7 people?', options: ['21', '35', '42', '70', '210'], correctIndex: 1 },
  // Partial Fractions
  { topic: 'Partial Fractions', question: 'Express (5x + 1) / [(x + 1)(x – 1)] in partial fractions form. What is A if A/(x+1) + B/(x-1)?', options: ['A = –2', 'A = 2', 'A = 3', 'A = –3', 'A = 1'], correctIndex: 0 },
  // Limits
  { topic: 'Limits', question: 'Find lim(x→2) (x² – 4)/(x – 2).', options: ['0', '2', '4', '8', 'Undefined'], correctIndex: 2 },
  // Conic Sections
  { topic: 'Conic Sections', question: 'The equation x² + y² = 25 represents a circle with radius:', options: ['5', '10', '25', '√5', '2.5'], correctIndex: 0 },
  // Proof by Induction
  { topic: 'Proof', question: 'The sum of the first n natural numbers is given by:', options: ['n(n – 1)/2', 'n(n + 1)/2', 'n²/2', '2n(n + 1)', 'n(n + 1)'], correctIndex: 1 },
  // Statistics
  { topic: 'Statistics', question: 'The variance of the data set {2, 4, 4, 4, 5, 5, 7, 9} is:', options: ['2', '3', '4', '5', '6'], correctIndex: 2 },
];

QUESTION_BANK['Physics'] = [
  { topic: 'Mechanics', question: 'What is the unit of force in the SI system?', options: ['Joule', 'Watt', 'Newton', 'Pascal', 'Kelvin'], correctIndex: 2 },
  { topic: 'Mechanics', question: 'A car accelerates from rest to 20 m/s in 5 seconds. What is its acceleration?', options: ['2 m/s²', '4 m/s²', '5 m/s²', '10 m/s²', '100 m/s²'], correctIndex: 1 },
  { topic: 'Waves', question: 'Which of the following is a transverse wave?', options: ['Sound wave', 'Compression wave', 'Light wave', 'Seismic P-wave', 'Ultrasonic wave'], correctIndex: 2 },
  { topic: 'Electricity', question: 'What is the resistance of a conductor if a current of 2 A flows through it when a voltage of 10 V is applied?', options: ['2 Ω', '5 Ω', '8 Ω', '12 Ω', '20 Ω'], correctIndex: 1 },
  { topic: 'Optics', question: 'A concave mirror is used for which of the following purposes?', options: ['Car rear-view mirrors', 'Door peepholes', 'Shaving/makeup mirrors', 'Shop security mirrors', 'Street mirrors'], correctIndex: 2 },
  { topic: 'Thermodynamics', question: 'Which scale of temperature has its lowest point at −273 °C?', options: ['Celsius', 'Fahrenheit', 'Kelvin', 'Rankine', 'Réaumur'], correctIndex: 2 },
  { topic: 'Energy', question: 'Which form of energy is stored in a stretched rubber band?', options: ['Kinetic energy', 'Chemical energy', 'Thermal energy', 'Elastic potential energy', 'Nuclear energy'], correctIndex: 3 },
  { topic: 'Gravity', question: 'What is the approximate value of acceleration due to gravity on Earth?', options: ['5 m/s²', '8 m/s²', '9.8 m/s²', '11 m/s²', '15 m/s²'], correctIndex: 2 },
  { topic: 'Sound', question: 'Sound cannot travel through:', options: ['Water', 'Steel', 'Air', 'Vacuum', 'Wood'], correctIndex: 3 },
  { topic: 'Electricity', question: 'Three 6 Ω resistors are connected in parallel. What is the total resistance?', options: ['18 Ω', '6 Ω', '3 Ω', '2 Ω', '1 Ω'], correctIndex: 3 },
  { topic: 'Mechanics', question: "Newton's second law states that force equals:", options: ['mass / acceleration', 'mass × velocity', 'mass × acceleration', 'mass × distance', 'acceleration / mass'], correctIndex: 2 },
  { topic: 'Mechanics', question: 'What is the momentum of a 5 kg object moving at 4 m/s?', options: ['1.25 kg·m/s', '9 kg·m/s', '20 kg·m/s', '25 kg·m/s', '40 kg·m/s'], correctIndex: 2 },
  { topic: 'Work & Energy', question: 'A force of 10 N moves an object 5 m in the direction of the force. How much work is done?', options: ['2 J', '15 J', '50 J', '100 J', '500 J'], correctIndex: 2 },
  { topic: 'Electricity', question: 'Which device converts electrical energy into mechanical energy?', options: ['Generator', 'Transformer', 'Electric motor', 'Battery', 'Capacitor'], correctIndex: 2 },
  { topic: 'Waves', question: 'The speed of light in a vacuum is approximately:', options: ['3 × 10⁶ m/s', '3 × 10⁸ m/s', '3 × 10¹⁰ m/s', '3 × 10⁴ m/s', '3 × 10² m/s'], correctIndex: 1 },
];

QUESTION_BANK['English Language'] = [
  { topic: 'Grammar', question: 'Which sentence is grammatically correct?', options: ["She don't like him.", "She doesn't likes him.", "She doesn't like him.", 'She not like him.', 'She do not likes him.'], correctIndex: 2 },
  { topic: 'Vocabulary', question: 'Choose the word that is CLOSEST in meaning to "benevolent".', options: ['Cruel', 'Generous', 'Lazy', 'Arrogant', 'Strict'], correctIndex: 1 },
  { topic: 'Parts of Speech', question: 'In the sentence "She runs fast", what part of speech is "fast"?', options: ['Adjective', 'Noun', 'Verb', 'Adverb', 'Pronoun'], correctIndex: 3 },
  { topic: 'Tenses', question: 'Fill in the blank: By tomorrow, she ______ the report.', options: ['finishes', 'finished', 'will finish', 'has finished', 'is finishing'], correctIndex: 2 },
  { topic: 'Figures of Speech', question: '"The world is a stage" is an example of:', options: ['Simile', 'Personification', 'Metaphor', 'Alliteration', 'Hyperbole'], correctIndex: 2 },
  { topic: 'Punctuation', question: 'Which of the following sentences uses a comma correctly?', options: ['I love, mangoes and oranges.', 'She came early, and she left late.', 'He is, tall dark and handsome.', 'The dog, ran away.', 'We, will go tomorrow.'], correctIndex: 1 },
  { topic: 'Antonyms', question: 'What is the ANTONYM of "verbose"?', options: ['Talkative', 'Loud', 'Concise', 'Wordy', 'Eloquent'], correctIndex: 2 },
  { topic: 'Spelling', question: 'Which of the following words is correctly spelt?', options: ['Accomodation', 'Accommodation', 'Acomodation', 'Accomadation', 'Acomodation'], correctIndex: 1 },
  { topic: 'Comprehension', question: 'What does a topic sentence do in a paragraph?', options: ['Provides supporting evidence', 'Concludes the essay', 'States the main idea of the paragraph', 'Introduces a new character', 'Lists examples'], correctIndex: 2 },
  { topic: 'Oral English', question: 'Which of these words has the stress on the SECOND syllable?', options: ['Music', 'Table', 'Begin', 'Open', 'Garden'], correctIndex: 2 },
];

QUESTION_BANK['Chemistry'] = [
  { topic: 'Atomic Structure', question: 'The atomic number of an element is determined by:', options: ['Number of neutrons', 'Number of protons', 'Number of electrons + protons', 'Atomic mass', 'Number of nucleons'], correctIndex: 1 },
  { topic: 'Periodicity', question: 'Elements in the same GROUP of the periodic table have the same:', options: ['Atomic mass', 'Number of neutrons', 'Number of valence electrons', 'Atomic radius', 'Electron configuration'], correctIndex: 2 },
  { topic: 'Chemical Bonding', question: 'What type of bond is formed between Na and Cl in NaCl?', options: ['Covalent bond', 'Metallic bond', 'Ionic bond', 'Hydrogen bond', 'Van der Waals bond'], correctIndex: 2 },
  { topic: 'Acids & Bases', question: 'What is the pH of a neutral solution at 25°C?', options: ['0', '5', '7', '10', '14'], correctIndex: 2 },
  { topic: 'Organic Chemistry', question: 'Which of the following is a hydrocarbon?', options: ['H₂O', 'NaCl', 'CH₄', 'CO₂', 'H₂SO₄'], correctIndex: 2 },
];

QUESTION_BANK['Biology'] = [
  { topic: 'Cell Biology', question: 'The powerhouse of the cell is the:', options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Cell membrane', 'Endoplasmic reticulum'], correctIndex: 2 },
  { topic: 'Genetics', question: 'DNA stands for:', options: ['Deoxyribonucleic Acid', 'Deoxyribose Nucleic Acid', 'Deoxyribo Nucleic Acid', 'Deoxyribonicotinic Acid', 'None of the above'], correctIndex: 0 },
  { topic: 'Ecology', question: 'Which of the following is a producer in a food chain?', options: ['Lion', 'Grasshopper', 'Grass', 'Frog', 'Snake'], correctIndex: 2 },
  { topic: 'Human Biology', question: 'Which organ produces insulin?', options: ['Liver', 'Kidney', 'Pancreas', 'Stomach', 'Spleen'], correctIndex: 2 },
  { topic: 'Photosynthesis', question: 'What gas do plants absorb during photosynthesis?', options: ['Oxygen', 'Nitrogen', 'Carbon dioxide', 'Hydrogen', 'Helium'], correctIndex: 2 },
];

QUESTION_BANK['Economics'] = [
  { topic: 'Demand & Supply', question: 'When price falls and quantity demanded rises, demand is said to be:', options: ['Perfectly inelastic', 'Inelastic', 'Elastic', 'Unit elastic', 'Negative'], correctIndex: 2 },
  { topic: 'Market Structures', question: 'A market in which there is only ONE seller is called:', options: ['Oligopoly', 'Monopoly', 'Perfect competition', 'Monopsony', 'Duopoly'], correctIndex: 1 },
  { topic: 'National Income', question: 'GDP stands for:', options: ['Gross Domestic Product', 'General Domestic Profit', 'Gross Demand Price', 'Government Domestic Policy', 'General Development Plan'], correctIndex: 0 },
  { topic: 'Money & Banking', question: 'Which of the following is NOT a function of money?', options: ['Medium of exchange', 'Store of value', 'Unit of account', 'Producer of wealth', 'Standard of deferred payment'], correctIndex: 3 },
  { topic: 'Production', question: 'The law of diminishing returns states that as more of a variable factor is added:', options: ['Total product keeps rising', 'Marginal product eventually decreases', 'Fixed costs rise', 'Total costs fall', 'Marginal product always increases'], correctIndex: 1 },
];

// Maps tutor profile subject names → canonical question bank keys
// Exam-prep subjects map to the core subjects they cover.
const SUBJECT_MAP = {
  'Mathematics':        ['Mathematics'],
  'Further Mathematics':['Further Mathematics'],
  'Physics':            ['Physics'],
  'Chemistry':          ['Chemistry'],
  'Biology':            ['Biology'],
  'English Language':   ['English Language'],
  'Economics':          ['Economics'],
  // GCSE covers core Mathematics curriculum
  'GCSE Mathematics':   ['Mathematics', 'Further Mathematics'],
  // Nigerian exam prep covers the tutor's core science/math subjects
  'JAMB Prep':          ['Mathematics', 'English Language', 'Physics', 'Chemistry', 'Biology', 'Economics'],
  'WAEC Prep':          ['Mathematics', 'English Language', 'Physics', 'Chemistry', 'Biology', 'Economics'],
  'NECO Prep':          ['Mathematics', 'English Language', 'Physics', 'Chemistry', 'Biology', 'Economics'],
};

// ─────────────────────────────────────────────────────────────────────────────

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const User          = require('./models/User');
  const TutorProfile  = require('./models/TutorProfile');
  const TutorQuestion = require('./models/TutorQuestion');

  const targetEmail = process.argv[2] || 'tutor@admin.com';
  console.log(`Seeding quiz for: ${targetEmail}`);

  const user = await User.findOne({ email: targetEmail });
  if (!user) { console.error(`User ${targetEmail} not found`); process.exit(1); }

  const profile = await TutorProfile.findOne({ user: user._id });
  if (!profile) { console.error(`TutorProfile not found for ${targetEmail}`); process.exit(1); }

  console.log(`Found profile: ${profile.displayName || user.email}`);
  console.log(`Subjects offered: ${(profile.subjects || []).join(', ') || 'none'}`);

  // Resolve which canonical question-bank keys to include
  const canonicalKeys = new Set();
  for (const subject of (profile.subjects || [])) {
    const mappedKeys = SUBJECT_MAP[subject];
    if (mappedKeys) {
      mappedKeys.forEach(k => canonicalKeys.add(k));
    } else {
      // If the subject name exactly matches a key in QUESTION_BANK, use it directly
      if (QUESTION_BANK[subject]) canonicalKeys.add(subject);
    }
  }

  if (canonicalKeys.size === 0) {
    console.error('No matching question sets found for this tutor\'s subjects.');
    await mongoose.disconnect();
    process.exit(1);
  }

  console.log(`Resolved question sets: ${[...canonicalKeys].join(', ')}`);

  // Build question docs
  const allQuestions = [];
  for (const key of canonicalKeys) {
    const qs = QUESTION_BANK[key] || [];
    qs.forEach(q => allQuestions.push({ ...q, subject: key, tutor: profile._id }));
  }

  // Clear existing questions and re-seed
  await TutorQuestion.deleteMany({ tutor: profile._id });
  console.log('Cleared existing questions');

  const inserted = await TutorQuestion.insertMany(allQuestions);
  console.log(`\n✅ Inserted ${inserted.length} questions for ${profile.displayName || targetEmail}:`);
  const counts = {};
  inserted.forEach(q => { counts[q.subject] = (counts[q.subject] || 0) + 1; });
  Object.entries(counts).forEach(([s, n]) => console.log(`   • ${s}: ${n} questions`));

  await mongoose.disconnect();
  console.log('\nDone!');
}

seed().catch(err => { console.error(err); process.exit(1); });
