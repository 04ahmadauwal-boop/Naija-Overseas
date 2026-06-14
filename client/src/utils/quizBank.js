// Subject quiz bank — 5 options (A-E), `ans` is the 0-based index of the correct option

const BANK = {
  Mathematics: [
    { topic: 'Algebra', q: 'Solve for x:  3x + 7 = 22', opts: ['x = 3', 'x = 5', 'x = 7', 'x = 4', 'x = 6'], ans: 1 },
    { topic: 'Quadratic Equations', q: 'What are the roots of x² − 5x + 6 = 0?', opts: ['x = 1 and 6', 'x = 2 and 3', 'x = −2 and −3', 'x = 1 and −6', 'x = 5 and 1'], ans: 1 },
    { topic: 'Indices', q: 'Simplify:  2³ × 2⁴', opts: ['2⁶', '2⁷', '2¹²', '4⁷', '2⁸'], ans: 1 },
    { topic: 'Statistics', q: 'The mean of 5, 9, 11, 7, and x is 8.  What is x?', opts: ['6', '7', '8', '9', '10'], ans: 2 },
    { topic: 'Geometry', q: 'Area of a circle with radius 7 cm  (use π = 22/7):', opts: ['44 cm²', '154 cm²', '22 cm²', '77 cm²', '308 cm²'], ans: 1 },
    { topic: 'Number Theory', q: 'What is the LCM of 12 and 18?', opts: ['6', '36', '72', '24', '216'], ans: 1 },
    { topic: 'Fractions', q: 'Calculate:  2/3 + 3/4', opts: ['5/7', '17/12', '5/12', '6/7', '11/12'], ans: 1 },
    { topic: 'Percentages', q: 'A shirt costs ₦2,000 and gets a 15% discount.  New price?', opts: ['₦1,700', '₦1,800', '₦1,750', '₦1,600', '₦1,850'], ans: 0 },
    { topic: 'Simultaneous Equations', q: 'If 2x + y = 7  and  x + y = 4,  find x.', opts: ['1', '2', '3', '4', '5'], ans: 2 },
    { topic: 'Probability', q: 'A bag has 3 red and 5 blue balls.  What is P(picking red)?', opts: ['1/3', '3/5', '3/8', '5/8', '1/5'], ans: 2 },
  ],

  'English Language': [
    { topic: 'Grammar – Tenses', q: 'Choose the grammatically correct sentence:', opts: ['She has went to the market.', 'She have gone to the market.', 'She has gone to the market.', 'She had went to the market.', 'She going to the market.'], ans: 2 },
    { topic: 'Vocabulary', q: 'The word closest in meaning to "eloquent" is:', opts: ['Silent', 'Articulate', 'Confused', 'Aggressive', 'Nervous'], ans: 1 },
    { topic: 'Figures of Speech', q: '"The wind sang a mournful song through the trees."  Which literary device is used?', opts: ['Simile', 'Alliteration', 'Hyperbole', 'Personification', 'Onomatopoeia'], ans: 3 },
    { topic: 'Spelling', q: 'Which of the following is correctly spelled?', opts: ['Accomodate', 'Accommmodate', 'Accommodate', 'Acommadate', 'Accommodaet'], ans: 2 },
    { topic: 'Subject-Verb Agreement', q: '"Neither the students nor the teacher ___ present."  Choose the correct verb:', opts: ['were', 'are', 'was', 'be', 'have been'], ans: 2 },
    { topic: 'Antonyms', q: 'The antonym of "benevolent" is:', opts: ['Generous', 'Kind', 'Malevolent', 'Charitable', 'Friendly'], ans: 2 },
    { topic: 'Sentence Types', q: '"Although it was raining, we continued our journey."  This is a:', opts: ['Simple sentence', 'Compound sentence', 'Complex sentence', 'Compound-complex sentence', 'Interrogative sentence'], ans: 2 },
    { topic: 'Punctuation', q: 'Which sentence uses apostrophes correctly?', opts: ["It's the teacher's book.", "Its the teachers' book.", "It's the teachers book.", "Its' the teacher's book.", "It's the teacher'es book."], ans: 0 },
    { topic: 'Comprehension', q: '"To kill two birds with one stone" means:', opts: ['To harm animals', 'To achieve two goals with one action', 'To waste time', 'To be violent', 'To be efficient at hunting'], ans: 1 },
    { topic: 'Synonyms', q: 'A synonym for "diligent" is:', opts: ['Lazy', 'Careless', 'Hardworking', 'Foolish', 'Reckless'], ans: 2 },
  ],

  Physics: [
    { topic: 'Speed & Distance', q: 'A car travels 120 km in 2 hours.  What is its average speed?', opts: ['40 km/h', '60 km/h', '80 km/h', '100 km/h', '240 km/h'], ans: 1 },
    { topic: 'Electricity', q: 'What is the SI unit of electrical resistance?', opts: ['Ampere', 'Volt', 'Watt', 'Ohm', 'Coulomb'], ans: 3 },
    { topic: 'Newton\'s Laws', q: 'According to Newton\'s 2nd law, Force equals:', opts: ['mass × velocity', 'mass × acceleration', 'mass × distance', 'momentum × time', 'work ÷ time'], ans: 1 },
    { topic: 'Waves', q: 'What type of wave is sound?', opts: ['Transverse wave', 'Electromagnetic wave', 'Longitudinal wave', 'Surface wave', 'Gravitational wave'], ans: 2 },
    { topic: 'Heat & Temperature', q: 'What is the SI unit of temperature?', opts: ['Celsius', 'Fahrenheit', 'Kelvin', 'Joule', 'Pascal'], ans: 2 },
    { topic: 'Work & Energy', q: 'A 10 kg object lifted 5 m (g = 10 m/s²).  Its potential energy is:', opts: ['50 J', '100 J', '500 J', '5000 J', '15 J'], ans: 2 },
    { topic: 'Light', q: 'Which colour in the visible spectrum has the highest frequency?', opts: ['Red', 'Orange', 'Yellow', 'Green', 'Violet'], ans: 4 },
    { topic: 'Pressure', q: 'Pressure is defined as:', opts: ['Force × Area', 'Force ÷ Area', 'Mass × Gravity', 'Weight ÷ Volume', 'Force × Distance'], ans: 1 },
    { topic: 'Circuits', q: 'Three resistors of 2Ω each are connected in series.  Total resistance:', opts: ['2/3 Ω', '6 Ω', '2 Ω', '8 Ω', '3 Ω'], ans: 1 },
    { topic: 'Optics', q: 'Light travels fastest in:', opts: ['Water', 'Glass', 'Vacuum', 'Air', 'Diamond'], ans: 2 },
  ],

  Chemistry: [
    { topic: 'Periodic Table', q: 'What is the atomic number of Carbon?', opts: ['4', '6', '8', '12', '14'], ans: 1 },
    { topic: 'Chemical Bonding', q: 'What type of bond holds Na and Cl together in table salt (NaCl)?', opts: ['Covalent bond', 'Metallic bond', 'Ionic bond', 'Hydrogen bond', 'Van der Waals bond'], ans: 2 },
    { topic: 'Acids & Bases', q: 'What is the pH of a perfectly neutral solution?', opts: ['0', '5', '7', '10', '14'], ans: 2 },
    { topic: 'States of Matter', q: 'Which change of state describes a liquid changing directly to a gas?', opts: ['Condensation', 'Sublimation', 'Freezing', 'Evaporation', 'Deposition'], ans: 3 },
    { topic: 'Chemical Formulas', q: 'What is the chemical formula for water?', opts: ['HO', 'H₂O₂', 'H₂O', 'OH₂', 'HO₂'], ans: 2 },
    { topic: 'Mole Concept', q: 'Avogadro\'s number (atoms per mole) is approximately:', opts: ['3.0 × 10²³', '6.02 × 10²³', '9.0 × 10²³', '6.02 × 10²²', '1.0 × 10²³'], ans: 1 },
    { topic: 'Organic Chemistry', q: 'Which functional group is characteristic of alcohols?', opts: ['−COOH', '−CHO', '−OH', '−NH₂', '−CO−'], ans: 2 },
    { topic: 'Electrochemistry', q: 'During electrolysis, cations are attracted to the:', opts: ['Anode', 'Cathode', 'Electrode', 'Salt bridge', 'Both electrodes equally'], ans: 1 },
    { topic: 'Reactions', q: 'In the reaction 2H₂ + O₂ → 2H₂O, what type of reaction is this?', opts: ['Decomposition', 'Displacement', 'Synthesis (Combination)', 'Acid-base', 'Redox only'], ans: 2 },
    { topic: 'Gases', q: 'Which gas makes up approximately 78% of the Earth\'s atmosphere?', opts: ['Oxygen', 'Carbon dioxide', 'Hydrogen', 'Nitrogen', 'Argon'], ans: 3 },
  ],

  Biology: [
    { topic: 'Cell Biology', q: 'Which organelle is known as the "powerhouse of the cell"?', opts: ['Nucleus', 'Ribosome', 'Endoplasmic Reticulum', 'Mitochondria', 'Golgi Apparatus'], ans: 3 },
    { topic: 'Genetics', q: 'In DNA, what base pairs with Adenine (A)?', opts: ['Adenine', 'Guanine', 'Cytosine', 'Thymine', 'Uracil'], ans: 3 },
    { topic: 'Ecology', q: 'Organisms that make their own food through photosynthesis are called:', opts: ['Consumers', 'Decomposers', 'Producers', 'Herbivores', 'Carnivores'], ans: 2 },
    { topic: 'Human Anatomy', q: 'Which blood group is the universal donor?', opts: ['A', 'B', 'AB', 'O', 'O+'], ans: 3 },
    { topic: 'Photosynthesis', q: 'In which organelle does photosynthesis take place?', opts: ['Mitochondria', 'Nucleus', 'Chloroplast', 'Vacuole', 'Cell membrane'], ans: 2 },
    { topic: 'Reproduction', q: 'What is the term for the fusion of male and female gametes?', opts: ['Mitosis', 'Meiosis', 'Pollination', 'Fertilisation', 'Germination'], ans: 3 },
    { topic: 'Digestion', q: 'Where does most chemical digestion occur in humans?', opts: ['Mouth', 'Stomach', 'Small intestine', 'Large intestine', 'Liver'], ans: 2 },
    { topic: 'Classification', q: 'The correct biological classification from broadest to most specific is:', opts: ['Species→Genus→Family→Order→Class→Phylum→Kingdom', 'Kingdom→Phylum→Class→Order→Family→Genus→Species', 'Kingdom→Class→Phylum→Order→Family→Genus→Species', 'Genus→Species→Family→Order→Class→Phylum→Kingdom', 'Kingdom→Phylum→Order→Class→Family→Genus→Species'], ans: 1 },
  ],

  Economics: [
    { topic: 'Supply & Demand', q: 'According to the Law of Demand, as price rises, quantity demanded:', opts: ['Rises', 'Falls', 'Stays the same', 'Doubles', 'Cannot be determined'], ans: 1 },
    { topic: 'Market Structures', q: 'In which market structure does a single firm control the entire market?', opts: ['Perfect competition', 'Monopolistic competition', 'Oligopoly', 'Duopoly', 'Monopoly'], ans: 4 },
    { topic: 'Macroeconomics', q: 'GDP stands for:', opts: ['General Domestic Product', 'Gross Domestic Product', 'Gross Domestic Price', 'General Development Product', 'Gross Direct Product'], ans: 1 },
    { topic: 'Inflation', q: 'Inflation is best described as:', opts: ['A fall in the money supply', 'A general rise in price levels over time', 'A rise in unemployment', 'A decrease in exports', 'A rise in interest rates'], ans: 1 },
    { topic: 'Opportunity Cost', q: 'Opportunity cost is defined as:', opts: ['The monetary cost of a good', 'The next best alternative forgone', 'The total cost of production', 'The cost of labour', 'The tax on goods'], ans: 1 },
    { topic: 'Elasticity', q: 'A 10% rise in price causes a 20% fall in quantity demanded.  PED =', opts: ['0.5', '1.0', '2.0', '0.2', '10.0'], ans: 2 },
    { topic: 'Factors of Production', q: 'Which of the following is NOT a factor of production?', opts: ['Land', 'Labour', 'Capital', 'Enterprise', 'Money'], ans: 4 },
  ],

  'Computer Science': [
    { topic: 'Binary Numbers', q: 'What is the decimal value of binary 1010?', opts: ['8', '10', '12', '14', '16'], ans: 1 },
    { topic: 'Data Structures', q: 'A Stack follows which principle?', opts: ['FIFO – First In, First Out', 'LIFO – Last In, First Out', 'FILO – First In, Last Out', 'Round Robin', 'Priority ordering'], ans: 1 },
    { topic: 'Networking', q: 'HTTP stands for:', opts: ['HyperText Transfer Protocol', 'High Transfer Text Protocol', 'Hyperlink Transfer Technology Protocol', 'HyperText Technology Protocol', 'High Text Transfer Protocol'], ans: 0 },
    { topic: 'Programming Languages', q: 'Which of the following is a high-level programming language?', opts: ['Machine code', 'Assembly language', 'Binary code', 'Python', 'Microcode'], ans: 3 },
    { topic: 'Algorithms', q: 'The time complexity of Binary Search is:', opts: ['O(n)', 'O(n²)', 'O(log n)', 'O(n log n)', 'O(1)'], ans: 2 },
    { topic: 'SQL / Databases', q: 'In SQL, which command retrieves data from a table?', opts: ['INSERT', 'UPDATE', 'DELETE', 'SELECT', 'CREATE'], ans: 3 },
    { topic: 'Hardware', q: 'CPU stands for:', opts: ['Central Processing Unit', 'Computer Processing Unit', 'Central Program Utility', 'Core Processing Unit', 'Central Power Unit'], ans: 0 },
    { topic: 'Number Systems', q: 'The hexadecimal number FF equals what in decimal?', opts: ['127', '225', '255', '256', '16'], ans: 2 },
  ],

  'Further Mathematics': [
    { topic: 'Differentiation', q: 'What is the derivative of y = x³?', opts: ['x²', '3x', '3x²', '3x³', 'x⁴/4'], ans: 2 },
    { topic: 'Integration', q: 'Evaluate:  ∫ 2x dx', opts: ['2', '2x + C', 'x² + C', 'x² + 2', '2x² + C'], ans: 2 },
    { topic: 'Vectors', q: 'If vector a = (3, 4), its magnitude |a| is:', opts: ['3', '4', '5', '7', '12'], ans: 2 },
    { topic: 'Arithmetic Sequences', q: 'The 5th term of an AP is 14 and common difference is 3.  First term?', opts: ['1', '2', '3', '4', '5'], ans: 1 },
    { topic: 'Complex Numbers', q: 'What is i²  (where i is the imaginary unit)?', opts: ['1', '−1', '0', 'i', '2i'], ans: 1 },
    { topic: 'Matrices', q: 'The determinant of matrix  [[3, 1], [2, 4]]  is:', opts: ['6', '8', '10', '12', '14'], ans: 2 },
    { topic: 'Permutations', q: 'In how many ways can 4 people be arranged in a row?', opts: ['4', '8', '12', '24', '16'], ans: 3 },
  ],

  French: [
    { topic: 'Greetings', q: '"Comment t\'appelles-tu?" means:', opts: ['How old are you?', 'What is your name?', 'Where are you from?', 'How are you?', 'What do you do?'], ans: 1 },
    { topic: 'Verbs', q: 'The verb "être" means:', opts: ['To be', 'To have', 'To go', 'To do', 'To come'], ans: 0 },
    { topic: 'Translation', q: '"Je suis étudiant(e)" means:', opts: ['I am a teacher', 'I am tired', 'I am a student', 'I am happy', 'I am French'], ans: 2 },
    { topic: 'Vocabulary', q: 'How do you say "Thank you" in French?', opts: ['Merci', 'Bonjour', 'Au revoir', 'S\'il vous plaît', 'De rien'], ans: 0 },
    { topic: 'Numbers', q: 'The French word for the number 20 is:', opts: ['Dix', 'Quinze', 'Vingt', 'Trente', 'Cent'], ans: 2 },
    { topic: 'Vocabulary', q: 'The French word for "house" is:', opts: ['École', 'Livre', 'Maison', 'Voiture', 'Chaise'], ans: 2 },
    { topic: 'Days of the Week', q: 'How do you say "Monday" in French?', opts: ['Dimanche', 'Samedi', 'Mercredi', 'Lundi', 'Vendredi'], ans: 3 },
  ],

  Spanish: [
    { topic: 'Greetings', q: '"¿Cómo te llamas?" means:', opts: ['How are you?', 'What is your name?', 'Where are you from?', 'How old are you?', 'What do you do?'], ans: 1 },
    { topic: 'Verbs', q: 'The verb "ser" means:', opts: ['To have', 'To be', 'To go', 'To eat', 'To want'], ans: 1 },
    { topic: 'Vocabulary', q: 'How do you say "Thank you" in Spanish?', opts: ['Por favor', 'De nada', 'Gracias', 'Hola', 'Adiós'], ans: 2 },
    { topic: 'Numbers', q: 'The Spanish word for the number 100 is:', opts: ['Diez', 'Veinte', 'Cincuenta', 'Cien', 'Mil'], ans: 3 },
    { topic: 'Translation', q: '"Me llamo Carlos" means:', opts: ['I am from Spain', 'My name is Carlos', 'I like Carlos', 'Carlos is here', 'I am Carlos\'s friend'], ans: 1 },
    { topic: 'Colours', q: 'The Spanish word "rojo" means:', opts: ['Blue', 'Green', 'Yellow', 'Red', 'Black'], ans: 3 },
    { topic: 'Days', q: 'How do you say "Sunday" in Spanish?', opts: ['Lunes', 'Viernes', 'Sábado', 'Domingo', 'Martes'], ans: 3 },
  ],

  // Fallback for any unlisted subject
  General: [
    { topic: 'Logical Reasoning', q: 'If all A are B, and all B are C, which statement must be true?', opts: ['All C are A', 'All A are C', 'No A are C', 'Some B are not C', 'All C are B'], ans: 1 },
    { topic: 'Number Patterns', q: 'What comes next in the sequence:  2, 4, 8, 16, ___?', opts: ['24', '30', '32', '28', '20'], ans: 2 },
    { topic: 'Basic Arithmetic', q: 'A train travels at 90 km/h for 2 hours.  Total distance?', opts: ['45 km', '90 km', '135 km', '180 km', '200 km'], ans: 3 },
    { topic: 'Comprehension', q: '"The pen is mightier than the sword" implies:', opts: ['Writing tools are heavy', 'Words have more power than violence', 'Swords are weak', 'Writing is dangerous', 'Pens can cut'], ans: 1 },
    { topic: 'Basic Maths', q: 'A shop sells 5 notebooks for ₦750.  One notebook costs:', opts: ['₦100', '₦125', '₦150', '₦175', '₦200'], ans: 2 },
    { topic: 'Geometry', q: 'A square has a perimeter of 40 cm.  What is its area?', opts: ['40 cm²', '80 cm²', '100 cm²', '160 cm²', '200 cm²'], ans: 2 },
  ],
};

// Maps common subject names / variations to a bank key
const SUBJECT_MAP = {
  'Mathematics': 'Mathematics',
  'Maths': 'Mathematics',
  'Further Mathematics': 'Further Mathematics',
  'A-Level Maths': 'Further Mathematics',
  'A-Level Mathematics': 'Further Mathematics',
  'SAT Prep': 'Mathematics',
  'SAT Maths': 'Mathematics',
  'JAMB Prep': 'Mathematics',
  'WAEC Prep': 'Mathematics',
  'English Language': 'English Language',
  'English': 'English Language',
  'IELTS': 'English Language',
  'IELTS Preparation': 'English Language',
  'Physics': 'Physics',
  'Chemistry': 'Chemistry',
  'Biology': 'Biology',
  'Economics': 'Economics',
  'Computer Science': 'Computer Science',
  'ICT': 'Computer Science',
  'Further Mathematics': 'Further Mathematics',
  'French': 'French',
  'Spanish': 'Spanish',
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Returns `count` randomised questions for the given subject.
 * Falls back to General if subject not found.
 */
export function getQuizQuestions(subject, count = 5) {
  const key = SUBJECT_MAP[subject] || subject;
  const pool = BANK[key] || BANK.General;
  return shuffle(pool).slice(0, Math.min(count, pool.length));
}

/** Returns the best quiz-able subject from an array of tutor subjects */
export function bestQuizSubject(subjects = []) {
  for (const s of subjects) {
    const key = SUBJECT_MAP[s] || s;
    if (BANK[key]) return s;
  }
  return subjects[0] || '';
}

export const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E'];
