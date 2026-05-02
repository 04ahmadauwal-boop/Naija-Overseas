const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const School = require('./models/School');
const slugify = require('slugify');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    // Clear existing data
    await User.deleteMany({});
    await School.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@naijaandoverseas.com',
      password: 'Admin@123456',
      role: 'admin',
      phone: '+234 800 000 0001',
      country: 'Nigeria',
      isVerified: true,
    });
    console.log('✅ Admin account created:', admin.email);

    // Create real Nigerian schools
    const schools = [
      {
        name: 'Federal Government College, Ibadan',
        type: 'federal',
        level: 'secondary',
        country: 'Nigeria',
        state: 'Oyo',
        city: 'Ibadan',
        address: 'Eleyele, Ibadan, Oyo State',
        fees: {
          tuition: 450000,
          boarding: 600000,
        },
        curriculum: ['WAEC', 'NECO'],
        facilities: ['Library', 'Science Laboratory', 'Computer Lab', 'Sports Field', 'Dormitory'],
        description: 'One of Nigeria\'s premier federal schools with excellent academic reputation and world-class facilities.',
        contact: {
          phone: '+234 803 456 7890',
          email: 'info@fgcibadan.edu.ng',
          website: 'www.fgcibadan.edu.ng',
        },
        status: 'approved',
        isFeatured: true,
        rating: 4.8,
        reviewCount: 45,
      },
      {
        name: 'Punuka Colleges of Nigeria',
        type: 'private',
        level: 'both',
        country: 'Nigeria',
        state: 'Lagos',
        city: 'Lagos',
        address: 'Lekki, Lagos State',
        fees: {
          tuition: 1200000,
          boarding: 1500000,
        },
        curriculum: ['IGCSE', 'Cambridge', 'WAEC'],
        facilities: ['Olympic Pool', 'Science Lab', 'Art Studio', 'Music Studio', 'Boarding House', 'Cafeteria'],
        description: 'Premium boarding and day school with Cambridge and IGCSE curriculum. Known for holistic education.',
        contact: {
          phone: '+234 812 345 6789',
          email: 'admissions@punuka.com',
          website: 'www.punuka.com',
        },
        status: 'approved',
        isFeatured: true,
        rating: 4.9,
        reviewCount: 78,
      },
      {
        name: 'Grange School, Lagos',
        type: 'private',
        level: 'both',
        country: 'Nigeria',
        state: 'Lagos',
        city: 'Ikoyi',
        address: 'Ikoyi, Lagos State',
        fees: {
          tuition: 1500000,
          boarding: 1800000,
        },
        curriculum: ['IGCSE', 'IB'],
        facilities: ['International Standard Facilities', 'Science Centre', 'IT Lab', 'Sports Complex', 'Boarding Facilities'],
        description: 'An international school offering IB and IGCSE programs with modern facilities.',
        contact: {
          phone: '+234 901 234 5678',
          email: 'admissions@grangeschool.com',
          website: 'www.grangeschool.com',
        },
        status: 'approved',
        isFeatured: true,
        rating: 4.7,
        reviewCount: 92,
      },
      {
        name: 'Christ\'s School Ado-Ekiti',
        type: 'federal',
        level: 'secondary',
        country: 'Nigeria',
        state: 'Ekiti',
        city: 'Ado-Ekiti',
        address: 'Ado-Ekiti, Ekiti State',
        fees: {
          tuition: 280000,
          boarding: 400000,
        },
        curriculum: ['WAEC', 'NECO'],
        facilities: ['Library', 'Science Blocks', 'Sports Ground', 'Auditorium', 'Hostels'],
        description: 'Historic federal school with strong academic excellence and character formation.',
        contact: {
          phone: '+234 910 234 5678',
          email: 'info@christsekiti.edu.ng',
          website: 'www.christsekiti.edu.ng',
        },
        status: 'approved',
        isFeatured: false,
        rating: 4.6,
        reviewCount: 34,
      },
      {
        name: 'Abuja School of Science and Technology',
        type: 'private',
        level: 'secondary',
        country: 'Nigeria',
        state: 'FCT',
        city: 'Abuja',
        address: 'Asokoro, Abuja',
        fees: {
          tuition: 950000,
          boarding: 1100000,
        },
        curriculum: ['WAEC', 'IGCSE'],
        facilities: ['Modern Science Lab', 'Computer Centre', 'Resource Library', 'Cafeteria', 'Sports Facilities'],
        description: 'Top-rated science-focused school in Abuja with qualified teachers and modern teaching aids.',
        contact: {
          phone: '+234 920 345 6789',
          email: 'info@asstn.edu.ng',
          website: 'www.asstn.edu.ng',
        },
        status: 'approved',
        isFeatured: true,
        rating: 4.5,
        reviewCount: 56,
      },
      {
        name: 'Loyola Jesuit College, Abuja',
        type: 'private',
        level: 'secondary',
        country: 'Nigeria',
        state: 'FCT',
        city: 'Abuja',
        address: 'Off Constitution Road, Kano',
        fees: {
          tuition: 1100000,
          boarding: 1300000,
        },
        curriculum: ['WAEC', 'NECO'],
        facilities: ['Chapel', 'Science Labs', 'Library', 'Boarding Facilities', 'Sports Complex'],
        description: 'Jesuit Catholic institution known for values-based education and academic excellence.',
        contact: {
          phone: '+234 803 567 8901',
          email: 'admissions@loyolaabuja.edu.ng',
          website: 'www.loyolaabuja.edu.ng',
        },
        status: 'approved',
        isFeatured: false,
        rating: 4.7,
        reviewCount: 67,
      },
      {
        name: 'Covenant Heights School, Plateau',
        type: 'private',
        level: 'both',
        country: 'Nigeria',
        state: 'Plateau',
        city: 'Jos',
        address: 'Jos North, Plateau State',
        fees: {
          tuition: 750000,
          boarding: 950000,
        },
        curriculum: ['WAEC', 'NECO', 'IGCSE'],
        facilities: ['Modern Classrooms', 'Science Labs', 'Computer Lab', 'Dormitories', 'Dining Hall'],
        description: 'Well-structured school offering both Nigerian and international curricula.',
        contact: {
          phone: '+234 804 678 9012',
          email: 'info@covenanthts.edu.ng',
          website: 'www.covenanthts.edu.ng',
        },
        status: 'approved',
        isFeatured: false,
        rating: 4.4,
        reviewCount: 28,
      },
      {
        name: 'Lead City International School',
        type: 'private',
        level: 'both',
        country: 'Nigeria',
        state: 'Oyo',
        city: 'Ibadan',
        address: 'Ibadan, Oyo State',
        fees: {
          tuition: 1300000,
          boarding: 1600000,
        },
        curriculum: ['IGCSE', 'IB', 'WAEC'],
        facilities: ['Olympic Pool', 'Science Labs', 'Art Block', 'Music Room', 'IT Centre', 'Boarding Houses'],
        description: 'International school with IB and IGCSE programs, fostering global citizenship.',
        contact: {
          phone: '+234 805 789 0123',
          email: 'admissions@liscibadan.edu.ng',
          website: 'www.liscibadan.edu.ng',
        },
        status: 'approved',
        isFeatured: true,
        rating: 4.8,
        reviewCount: 84,
      },
      {
        name: 'Caleb University Secondary School',
        type: 'private',
        level: 'secondary',
        country: 'Nigeria',
        state: 'Lagos',
        city: 'Imota',
        address: 'Imota, Lagos State',
        fees: {
          tuition: 650000,
          boarding: 800000,
        },
        curriculum: ['WAEC', 'NECO'],
        facilities: ['Well-equipped Labs', 'Computer Lab', 'Library', 'Sports Facility', 'Auditorium'],
        description: 'Quality education with emphasis on character and academic excellence.',
        contact: {
          phone: '+234 806 890 1234',
          email: 'info@calebuniversitysss.edu.ng',
          website: 'www.calebuniversitysss.edu.ng',
        },
        status: 'approved',
        isFeatured: false,
        rating: 4.3,
        reviewCount: 41,
      },
      {
        name: 'Stella Maris School, Warri',
        type: 'private',
        level: 'both',
        country: 'Nigeria',
        state: 'Delta',
        city: 'Warri',
        address: 'Warri, Delta State',
        fees: {
          tuition: 550000,
          boarding: 700000,
        },
        curriculum: ['WAEC', 'NECO'],
        facilities: ['Science Laboratory', 'Computer Centre', 'Library', 'Sports Ground', 'Cafeteria'],
        description: 'Girls\' school dedicated to providing quality education in a serene environment.',
        contact: {
          phone: '+234 807 901 2345',
          email: 'info@stellamariswarri.edu.ng',
          website: 'www.stellamariswarri.edu.ng',
        },
        status: 'approved',
        isFeatured: false,
        rating: 4.5,
        reviewCount: 33,
      },
    ];

    // Create schools with slugs
    const createdSchools = await Promise.all(
      schools.map((school) =>
        School.create({
          ...school,
          slug: slugify(school.name, { lower: true, strict: true }),
        })
      )
    );

    console.log(`✅ Created ${createdSchools.length} schools`);
    createdSchools.forEach((school) => {
      console.log(`   - ${school.name} (${school.state})`);
    });

    console.log('\n✅ Seed completed successfully!');
    console.log(`\nAdmin Login Credentials:`);
    console.log(`Email: ${admin.email}`);
    console.log(`Password: Admin@123456`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
};

seedData();
