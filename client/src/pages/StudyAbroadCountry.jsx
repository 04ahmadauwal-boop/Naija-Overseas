import { useState } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import {
  Globe, BookOpen, FileText, CheckCircle, ArrowRight, ArrowLeft,
  Users, Award, Shield, GraduationCap, MapPin, TrendingUp, Clock, Star
} from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

/* ─── HELPERS ────────────────────────────────────────────────── */

function FlagImg({ code, w = 40, className = '' }) {
  return (
    <img
      src={`https://flagcdn.com/w${w}/${code}.png`}
      alt={code}
      className={`inline-block ${className}`}
    />
  );
}

/* ─── COUNTRY DATA ───────────────────────────────────────────── */

const COUNTRY_DATA = {
  'united-kingdom': {
    country: 'United Kingdom', code: 'gb',
    heroImage: 'https://images.unsplash.com/photo-1529516548873-9ce57c8f155e?auto=format&fit=crop&w=1920&q=80',
    accent: 'from-blue-950/90 via-blue-900/70 to-blue-950/40',
    tagline: 'World-Class Education, Centuries of Excellence',
    intro: 'The United Kingdom is home to some of the world\'s most prestigious universities, including Oxford and Cambridge, which have shaped global leaders, Nobel laureates, and industry pioneers for over 800 years. A UK degree is globally recognised and respected by employers across every industry and continent. With 3-year undergraduate degrees and a 2-year post-study work visa, the UK remains one of the most practical international study destinations for Nigerian students.',
    quickStats: [['130+', 'Universities'], ['£10k–£25k', 'Tuition/Year'], ['3–4 Weeks', 'Visa Processing'], ['2 Years', 'Post-Study Visa']],
    whyStudyHere: [
      { icon: Award, title: 'Global Top 10 Universities', desc: 'Oxford, Cambridge, Imperial, UCL and LSE consistently rank in the global top 20, offering degrees that open doors to every career worldwide.' },
      { icon: Clock, title: 'Shorter Degree Duration', desc: '3-year undergraduate and 1-year postgraduate degrees mean less time in study and lower total costs compared to the US or Australia.' },
      { icon: Shield, title: 'Post-Study Work Visa', desc: 'The Graduate Route Visa allows you to work in the UK for 2 years (3 for PhDs) after graduation with no job offer required.' },
      { icon: Users, title: 'Multicultural Environment', desc: 'Over 600,000 international students study in the UK annually, creating a rich, diverse, and welcoming campus environment.' },
      { icon: TrendingUp, title: 'Strong Alumni Network', desc: 'UK university alumni networks span every continent and industry, providing unparalleled career connections globally.' },
      { icon: MapPin, title: 'London Access', desc: 'Many top UK universities are in London — the world\'s leading financial, cultural, and technology hub — giving students unmatched internship access.' },
    ],
    topUniversities: [
      { name: 'University of Oxford', rank: '#1 UK / Top 5 World', location: 'Oxford', type: 'Research University', programs: ['Medicine', 'Law', 'PPE', 'Engineering', 'Computer Science'], tuition: '£28,000–£45,000/yr' },
      { name: 'University of Cambridge', rank: '#2 UK / Top 5 World', location: 'Cambridge', type: 'Research University', programs: ['Natural Sciences', 'Mathematics', 'Law', 'Architecture', 'Medicine'], tuition: '£25,000–£45,000/yr' },
      { name: 'Imperial College London', rank: '#3 UK / Top 10 World', location: 'London', type: 'STEM University', programs: ['Engineering', 'Medicine', 'Business', 'Computer Science', 'Chemistry'], tuition: '£32,000–£45,000/yr' },
      { name: 'University College London', rank: 'Top 15 World', location: 'London', type: 'Research University', programs: ['Architecture', 'Laws', 'Medical Sciences', 'Social Sciences', 'Engineering'], tuition: '£22,000–£35,000/yr' },
      { name: 'London School of Economics', rank: 'Top 5 Social Sciences', location: 'London', type: 'Social Sciences', programs: ['Economics', 'Finance', 'Law', 'Political Science', 'Management'], tuition: '£20,000–£28,000/yr' },
      { name: 'University of Manchester', rank: 'Top 30 World', location: 'Manchester', type: 'Russell Group', programs: ['Business', 'Engineering', 'Medicine', 'Science', 'Arts'], tuition: '£18,000–£26,000/yr' },
    ],
    visa: {
      name: 'UK Student Visa',
      processingTime: '3 weeks (standard)',
      workRights: '20 hours/week during term',
      postStudy: 'Graduate Route Visa — 2 years (3 for PhD)',
      requirements: ['Confirmed CAS reference from your university', 'Proof of funds: £1,334/month (London) or £1,023/month (elsewhere)', 'IELTS 5.5–7.0+ depending on course', 'IHS (Immigration Health Surcharge) payment', 'Valid passport (6 months+ remaining)', 'Biometric Residence Permit on arrival'],
    },
    costs: { tuition: '£10,000 – £25,000 per year', accommodation: '£500 – £900/month', food: '£150 – £250/month', transport: '£80 – £150/month', totalEstimate: '£18,000 – £35,000/year' },
    requirements: ['WAEC/NECO with minimum B/C grades in relevant subjects', 'IELTS 6.0–7.0 overall (or equivalent)', 'Personal Statement (500–600 words)', 'Two academic references', 'UCAS application (UG) or direct application (PG)', 'Proof of financial capability', 'Academic transcripts and certificates'],
    intakes: 'September (main) and January (limited)',
    popularCourses: ['Medicine', 'Law', 'Computer Science', 'Business & Finance', 'Engineering', 'Architecture', 'Nursing', 'MBA', 'Data Science', 'Public Health'],
    testimonials: [
      { name: 'Fatima Al-Hassan', uni: "King's College London", course: 'LLM International Law', text: 'My visa was approved first attempt. Their document checklist and interview coaching made all the difference. Now studying my Masters in London.', init: 'FA', col: 'bg-green-700' },
      { name: 'Tunde Adesanya', uni: 'University of Manchester', course: 'MSc Data Science', text: 'I never thought I could afford a UK degree. The team found me a scholarship covering 40% of my tuition. Now earning in pounds on my graduate visa.', init: 'TA', col: 'bg-blue-700' },
    ],
  },

  'canada': {
    country: 'Canada', code: 'ca',
    heroImage: 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&w=1920&q=80',
    accent: 'from-red-950/90 via-red-900/70 to-red-950/40',
    tagline: 'Quality Education with Permanent Residency Pathway',
    intro: 'Canada is a global leader in higher education, innovation, and quality of life. With world-class universities, affordable tuition compared to the US and UK, and one of the clearest pathways to Permanent Residency through the Post-Graduate Work Permit (PGWP), Canada is the top choice for Nigerian students looking to build a long-term future abroad. Over 400,000 study permits are issued annually.',
    quickStats: [['100+', 'Universities'], ['CAD 15k–35k', 'Tuition/Year'], ['4–8 Weeks', 'Visa Processing'], ['Up to 3 Years', 'Post-Study PGWP']],
    whyStudyHere: [
      { icon: Award, title: 'World-Class Universities', desc: 'University of Toronto, UBC, McGill, and McMaster rank in the global top 100, recognised by employers worldwide.' },
      { icon: Shield, title: 'Clear PR Pathway', desc: 'Canada offers one of the most transparent Permanent Residency pathways via the Canadian Experience Class (CEC) and Provincial Nominee Programs (PNP).' },
      { icon: Clock, title: 'Up to 3-Year PGWP', desc: 'The Post-Graduate Work Permit allows you to work full-time in Canada for up to 3 years after graduation — building Canadian experience toward PR.' },
      { icon: TrendingUp, title: 'Affordable vs US & UK', desc: 'Canadian tuition is typically 30–40% cheaper than equivalent US or UK programs, with a lower cost of living outside major cities.' },
      { icon: Users, title: 'Welcoming Immigration Policy', desc: 'Canada actively welcomes international students and graduates. Strong Nigerian diaspora communities exist across Toronto, Calgary, and Vancouver.' },
      { icon: MapPin, title: 'Safe, Multicultural Society', desc: 'Canada consistently ranks as one of the safest, most inclusive countries in the world — ideal for Nigerian students and families.' },
    ],
    topUniversities: [
      { name: 'University of Toronto', rank: '#21 World', location: 'Toronto, Ontario', type: 'Research University', programs: ['Medicine', 'Computer Science', 'Engineering', 'Business', 'Law'], tuition: 'CAD 30,000–55,000/yr' },
      { name: 'University of British Columbia', rank: '#34 World', location: 'Vancouver, BC', type: 'Research University', programs: ['Forestry', 'Medicine', 'Computer Science', 'Arts', 'Science'], tuition: 'CAD 28,000–45,000/yr' },
      { name: 'McGill University', rank: '#37 World', location: 'Montreal, Quebec', type: 'Research University', programs: ['Medicine', 'Law', 'Engineering', 'Management', 'Science'], tuition: 'CAD 17,000–40,000/yr' },
      { name: 'McMaster University', rank: 'Top 100 World', location: 'Hamilton, Ontario', type: 'Medical/Science Focus', programs: ['Medicine', 'Engineering', 'Business', 'Social Sciences'], tuition: 'CAD 28,000–38,000/yr' },
      { name: 'University of Waterloo', rank: 'Top Tech School Canada', location: 'Waterloo, Ontario', type: 'STEM University', programs: ['Computer Science', 'Engineering', 'Mathematics', 'Accounting'], tuition: 'CAD 30,000–52,000/yr' },
      { name: 'York University', rank: 'Top 500 World', location: 'Toronto, Ontario', type: 'Comprehensive University', programs: ['Business', 'Law', 'Arts', 'Science', 'Education'], tuition: 'CAD 25,000–32,000/yr' },
    ],
    visa: {
      name: 'Canadian Study Permit',
      processingTime: '4–8 weeks (varies by season)',
      workRights: '20 hours/week off-campus, full-time during breaks',
      postStudy: 'PGWP — up to 3 years based on program length',
      requirements: ['Letter of Acceptance from a Designated Learning Institution (DLI)', 'Proof of funds: CAD 10,000+ for living expenses', 'IELTS 6.0+ or equivalent English test', 'Biometrics enrollment at nearest Canadian visa office', 'Medical examination (if applicable)', 'Police clearance certificate'],
    },
    costs: { tuition: 'CAD 15,000 – 35,000 per year', accommodation: 'CAD 700 – 1,400/month', food: 'CAD 300 – 500/month', transport: 'CAD 80 – 150/month', totalEstimate: 'CAD 25,000 – 55,000/year' },
    requirements: ['WAEC/NECO with minimum 5 credits including English and Maths', 'IELTS Academic 6.0+ overall (or TOEFL 80+)', 'Statement of Purpose (SOP)', 'Two academic or professional references', 'Academic transcripts', 'GRE/GMAT (for some graduate programs)'],
    intakes: 'January, May, and September (September is main intake)',
    popularCourses: ['Computer Science', 'Engineering', 'Business', 'Medicine', 'Nursing', 'Data Science', 'MBA', 'Public Health', 'Finance', 'Law'],
    testimonials: [
      { name: 'Chukwuemeka Obi', uni: 'University of Toronto', course: 'MSc Computer Science', text: 'After two failed solo applications, the team identified my mistakes and fixed my personal statement. I was admitted with a partial scholarship. Starting September!', init: 'CO', col: 'bg-blue-700' },
      { name: 'Sade Ogundimu', uni: 'University of British Columbia', course: 'BSc Nursing', text: 'They helped me navigate credential recognition, IELTS waiver eligibility, and the complex UBC process. Responded to every message promptly. Highly professional.', init: 'SO', col: 'bg-teal-700' },
    ],
  },

  'united-states': {
    country: 'United States', code: 'us',
    heroImage: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1920&q=80',
    accent: 'from-indigo-950/90 via-indigo-900/70 to-indigo-950/40',
    tagline: "Home to the World's Most Prestigious Universities",
    intro: 'The United States hosts more top-ranked universities than any other country in the world. From Ivy League institutions to state universities with world-leading research facilities, the US offers unmatched academic excellence, strong alumni networks, and life-changing scholarship opportunities. Billions in financial aid are awarded annually to international students, making the US accessible beyond its headline tuition costs.',
    quickStats: [['4,000+', 'Universities'], ['USD 20k–55k', 'Tuition/Year'], ['3–5 Months', 'Visa Processing'], ['OPT/CPT', 'Work Authorization']],
    whyStudyHere: [
      { icon: Award, title: "World's Best Universities", desc: 'Harvard, MIT, Stanford, Yale — the US dominates global university rankings with more top-100 institutions than any other country.' },
      { icon: TrendingUp, title: 'Scholarship Opportunities', desc: 'US universities offer billions in scholarships, grants, and assistantships annually. Many Nigerian students receive partial to full funding.' },
      { icon: Shield, title: 'OPT Work Authorization', desc: 'Optional Practical Training (OPT) allows STEM graduates to work for up to 3 years in the US after graduation.' },
      { icon: BookOpen, title: 'Flexible Education System', desc: 'The US credit system allows you to change majors, take diverse courses, and tailor your degree to your interests.' },
      { icon: Users, title: 'Global Alumni Network', desc: 'US university alumni dominate Fortune 500 boardrooms, Silicon Valley, and global governments. The network is unmatched.' },
      { icon: GraduationCap, title: 'Research & Innovation Hub', desc: 'US universities receive over $50 billion in research funding annually, giving students access to cutting-edge labs and research opportunities.' },
    ],
    topUniversities: [
      { name: 'Harvard University', rank: '#3 World', location: 'Cambridge, Massachusetts', type: 'Ivy League', programs: ['Medicine', 'Law', 'Business (MBA)', 'Government', 'Computer Science'], tuition: 'USD 54,000–58,000/yr' },
      { name: 'Massachusetts Institute of Technology', rank: '#1 World', location: 'Cambridge, Massachusetts', type: 'STEM Powerhouse', programs: ['Engineering', 'Computer Science', 'Physics', 'Architecture', 'Management'], tuition: 'USD 57,000–60,000/yr' },
      { name: 'Stanford University', rank: '#5 World', location: 'Stanford, California', type: 'Research University', programs: ['Computer Science', 'Engineering', 'Business', 'Medicine', 'Social Sciences'], tuition: 'USD 57,000–62,000/yr' },
      { name: 'Yale University', rank: 'Top 20 World', location: 'New Haven, Connecticut', type: 'Ivy League', programs: ['Law', 'Drama', 'Medicine', 'Social Sciences', 'Architecture'], tuition: 'USD 59,000–63,000/yr' },
      { name: 'Columbia University', rank: 'Top 25 World', location: 'New York City', type: 'Ivy League', programs: ['Journalism', 'Business', 'Engineering', 'Law', 'Architecture'], tuition: 'USD 61,000–65,000/yr' },
      { name: 'University of Michigan', rank: 'Top 30 World (Public)', location: 'Ann Arbor, Michigan', type: 'Public Research University', programs: ['Business', 'Engineering', 'Medicine', 'Law', 'Social Work'], tuition: 'USD 31,000–54,000/yr' },
    ],
    visa: {
      name: 'F-1 Student Visa',
      processingTime: '3–5 months (apply early)',
      workRights: 'On-campus 20 hrs/week; OPT after graduation',
      postStudy: 'OPT: 12 months (3 years for STEM graduates)',
      requirements: ['I-20 form from your SEVIS-registered university', 'DS-160 visa application form', 'SEVIS fee payment (USD 350)', 'US embassy visa interview', 'Proof of financial support (USD 40,000–70,000/year)', 'TOEFL 80+ or IELTS 6.5+', 'Academic transcripts and SAT/GRE/GMAT (program dependent)'],
    },
    costs: { tuition: 'USD 20,000 – 55,000 per year', accommodation: 'USD 800 – 1,800/month', food: 'USD 300 – 600/month', transport: 'USD 100 – 300/month', totalEstimate: 'USD 35,000 – 75,000/year' },
    requirements: ['WAEC/NECO with minimum 5 credits', 'SAT scores (UG): 1200+ recommended', 'GRE/GMAT (for graduate programs)', 'TOEFL 80+ or IELTS 6.5+', 'Statement of Purpose / Personal Essay', 'Three letters of recommendation', 'Academic transcripts'],
    intakes: 'August/September (Fall) and January (Spring)',
    popularCourses: ['Computer Science', 'Engineering', 'Business (MBA)', 'Medicine', 'Data Science', 'Finance', 'Law', 'Architecture', 'Public Health', 'Film & Media'],
    testimonials: [
      { name: 'Oluwaseun Adeyemi', uni: 'University of Michigan', course: 'MSc Computer Science', text: 'The team guided me through Common App essays, recommendation letters, and my F-1 visa. I got into Michigan with a graduate assistantship covering half my tuition.', init: 'OA', col: 'bg-indigo-700' },
      { name: 'Ngozi Eze', uni: 'Columbia University', course: 'MPA Public Administration', text: 'Columbia was my dream school. Their team knew exactly what the admissions committee was looking for. I was accepted and received a partial scholarship.', init: 'NE', col: 'bg-purple-700' },
    ],
  },

  'australia': {
    country: 'Australia', code: 'au',
    heroImage: 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?auto=format&fit=crop&w=1920&q=80',
    accent: 'from-yellow-950/90 via-yellow-900/70 to-yellow-950/40',
    tagline: 'World-Class Education with Post-Study Work Rights',
    intro: 'Australia is the third most popular destination for international students, offering exceptional education quality, a relaxed lifestyle, stunning natural landscapes, and generous post-study work rights. With 8 world-class research universities (the Group of Eight) and 40+ institutions, Australia offers globally recognised programs in medicine, engineering, business, and the sciences — alongside one of the highest minimum wages in the world.',
    quickStats: [['43+', 'Universities'], ['AUD 20k–45k', 'Tuition/Year'], ['4–6 Weeks', 'Visa Processing'], ['2–4 Years', 'Post-Study Visa']],
    whyStudyHere: [
      { icon: Award, title: 'Group of Eight Universities', desc: "Australia's Go8 — including Melbourne, ANU, and Sydney — are globally ranked and renowned for research excellence." },
      { icon: Shield, title: 'Generous Post-Study Visas', desc: 'Temporary Graduate Visa (subclass 485) allows 2–4 years of work in Australia after graduation, depending on your qualification level.' },
      { icon: Users, title: 'Welcoming Culture', desc: 'Australia is one of the safest, most multicultural countries in the world. Over 700,000 international students study there annually.' },
      { icon: TrendingUp, title: 'High Graduate Salaries', desc: 'Australia has one of the highest minimum wages globally. Students can work 48 hours/fortnight while studying and full-time during holidays.' },
      { icon: MapPin, title: 'Quality of Life', desc: 'Australian cities consistently rank in the global top 10 for quality of life. Sydney, Melbourne, and Brisbane offer a fantastic student lifestyle.' },
      { icon: Clock, title: 'Fast Visa Processing', desc: 'Australian student visas are typically processed within 4–6 weeks, with a high approval rate for genuine students.' },
    ],
    topUniversities: [
      { name: 'University of Melbourne', rank: '#33 World', location: 'Melbourne, Victoria', type: 'Research University', programs: ['Medicine', 'Law', 'Engineering', 'Business', 'Science'], tuition: 'AUD 35,000–48,000/yr' },
      { name: 'Australian National University', rank: '#34 World', location: 'Canberra, ACT', type: 'Research University', programs: ['Politics & IR', 'Science', 'Law', 'Economics', 'Engineering'], tuition: 'AUD 35,000–45,000/yr' },
      { name: 'University of Sydney', rank: '#41 World', location: 'Sydney, NSW', type: 'Sandstone University', programs: ['Medicine', 'Law', 'Business', 'Architecture', 'Arts'], tuition: 'AUD 38,000–50,000/yr' },
      { name: 'University of Queensland', rank: 'Top 60 World', location: 'Brisbane, QLD', type: 'Research University', programs: ['Medicine', 'Mining Engineering', 'Business', 'Science', 'Law'], tuition: 'AUD 32,000–44,000/yr' },
      { name: 'Monash University', rank: 'Top 60 World', location: 'Melbourne, Victoria', type: 'Research University', programs: ['Medicine', 'Engineering', 'Business', 'Pharmacy', 'Education'], tuition: 'AUD 30,000–45,000/yr' },
      { name: 'UNSW Sydney', rank: 'Top 70 World', location: 'Sydney, NSW', type: 'STEM Focus', programs: ['Engineering', 'Medicine', 'Business', 'Law', 'Science'], tuition: 'AUD 35,000–48,000/yr' },
    ],
    visa: {
      name: 'Student Visa (Subclass 500)',
      processingTime: '4–6 weeks',
      workRights: '48 hours/fortnight during study, unlimited during breaks',
      postStudy: 'Temporary Graduate Visa — 2–4 years',
      requirements: ['Confirmation of Enrolment (CoE) from your institution', 'Genuine Temporary Entrant (GTE) statement', 'IELTS 5.5–7.0+ depending on course', 'Proof of funds: AUD 21,041/year', 'Overseas Student Health Cover (OSHC)', 'Police clearance & character assessment'],
    },
    costs: { tuition: 'AUD 20,000 – 45,000 per year', accommodation: 'AUD 700 – 1,500/month', food: 'AUD 400 – 700/month', transport: 'AUD 100 – 200/month', totalEstimate: 'AUD 35,000 – 60,000/year' },
    requirements: ['WAEC/NECO minimum 5 credits including English and Maths', 'IELTS Academic 6.0+ overall', 'Personal Statement', 'Academic transcripts and certificates', 'Work experience (for postgraduate)', 'Reference letters (2)'],
    intakes: 'February (main) and July (second intake)',
    popularCourses: ['Nursing', 'Medicine', 'Engineering', 'Business', 'Computer Science', 'MBA', 'Accounting', 'Architecture', 'Data Science', 'Education'],
    testimonials: [
      { name: 'Adaeze Nwosu', uni: 'University of Melbourne', course: 'MBA', text: 'They found me a scholarship worth AUD 8,000. Their knowledge of Australian admissions is exceptional. I\'m now working in Melbourne on my graduate visa.', init: 'AN', col: 'bg-yellow-600' },
      { name: 'Kola Babarinde', uni: 'UNSW Sydney', course: 'MEng Petroleum Engineering', text: 'The team made my Australian dream a reality. From COE to visa, they handled everything professionally. I start work next month!', init: 'KB', col: 'bg-orange-600' },
    ],
  },

  'germany': {
    country: 'Germany', code: 'de',
    heroImage: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=1920&q=80',
    accent: 'from-gray-950/90 via-gray-900/70 to-gray-950/40',
    tagline: 'Tuition-Free World-Class Education in the Heart of Europe',
    intro: 'Germany offers one of the world\'s most remarkable study opportunities: public universities that charge little or no tuition fees for international students. With world-class engineering, science, and business schools — and as the economic powerhouse of Europe — Germany offers exceptional career opportunities alongside affordable education. Most German public universities charge only a semester contribution of €100–€350, covering transport and administration.',
    quickStats: [['380+', 'Universities'], ['€0–€3,000', 'Public Tuition/Year'], ['6–12 Weeks', 'Visa Processing'], ['18 Months', 'Job-Seeker Visa']],
    whyStudyHere: [
      { icon: Award, title: 'Tuition-Free Education', desc: 'Most German public universities charge no tuition for international students — only a semester contribution of €100–€350 covering transport and admin.' },
      { icon: TrendingUp, title: 'Engineering & Tech Hub', desc: 'Germany is home to BMW, Mercedes, Bosch, and SAP. Its engineering and technology programs are globally unmatched with direct industry connections.' },
      { icon: Shield, title: '18-Month Job Seeker Visa', desc: 'After graduation, you get an 18-month visa to find work in Germany — with access to the entire EU job market and some of Europe\'s highest salaries.' },
      { icon: Globe, title: 'English-Medium Programs', desc: 'Over 1,500 master\'s programs in Germany are taught entirely in English, making it accessible without German language skills.' },
      { icon: Users, title: 'Central European Location', desc: 'Germany borders 9 countries. Studying there gives you access to travel, internships, and networks across the entire European Union.' },
      { icon: MapPin, title: 'Affordable Living', desc: 'Despite being Western Europe\'s largest economy, Germany has a surprisingly affordable cost of living, especially outside Munich and Frankfurt.' },
    ],
    topUniversities: [
      { name: 'TU Munich', rank: '#37 World', location: 'Munich, Bavaria', type: 'Technical University', programs: ['Engineering', 'Computer Science', 'Natural Sciences', 'Medicine', 'Management'], tuition: '€0 (public university)' },
      { name: 'LMU Munich', rank: '#54 World', location: 'Munich, Bavaria', type: 'Research University', programs: ['Medicine', 'Law', 'Business', 'Physics', 'Psychology'], tuition: '€0 (public university)' },
      { name: 'Heidelberg University', rank: '#65 World', location: 'Heidelberg', type: 'Research University', programs: ['Medicine', 'Natural Sciences', 'Humanities', 'Law', 'Social Sciences'], tuition: '€0 (public university)' },
      { name: 'RWTH Aachen', rank: 'Top Engineering EU', location: 'Aachen, NRW', type: 'Technical University', programs: ['Engineering', 'Computer Science', 'Natural Sciences', 'Business', 'Medicine'], tuition: '€0 (public university)' },
      { name: 'Freie Universität Berlin', rank: 'Top 100 World', location: 'Berlin', type: 'Research University', programs: ['Social Sciences', 'Natural Sciences', 'Law', 'Humanities', 'Medicine'], tuition: '€0 (public university)' },
      { name: 'ESMT Berlin', rank: 'Top European Business School', location: 'Berlin', type: 'Business School', programs: ['MBA', 'Executive MBA', 'Management', 'Finance', 'Leadership'], tuition: '€25,000–€40,000/yr (private)' },
    ],
    visa: {
      name: 'German Student Visa (Type D)',
      processingTime: '6–12 weeks',
      workRights: '120 full days or 240 half days per year',
      postStudy: '18-month Job Seeker Visa to find work in Germany/EU',
      requirements: ['University admission letter or blocked account confirmation', 'Blocked account (Sperrkonto): minimum €11,208/year', 'German health insurance or international coverage', 'IELTS 6.0+ or German B1/B2 (program dependent)', 'APS certificate (for Nigerian qualifications)', 'Motivation letter and CV', 'Police clearance certificate'],
    },
    costs: { tuition: '€0 – €1,500/year (public)', accommodation: '€300 – €700/month', food: '€200 – €350/month', transport: 'Included in semester ticket', totalEstimate: '€8,000 – €15,000/year' },
    requirements: ['WAEC/NECO with university entrance qualification (min B in core subjects)', 'IELTS 6.0+ or German B2 (for German-taught programs)', 'APS Certificate (Academic Evaluation Centre for Nigerian qualifications)', 'Motivation letter and CV/Resume', 'Blocked account (Sperrkonto) with €11,208'],
    intakes: 'Winter Semester (October) and Summer Semester (April)',
    popularCourses: ['Mechanical Engineering', 'Computer Science', 'Electrical Engineering', 'MBA', 'Data Science', 'Chemical Engineering', 'Architecture', 'Economics', 'Medicine', 'Physics'],
    testimonials: [
      { name: 'Ibrahim Musa', uni: 'TU Munich', course: 'MEng Mechanical Engineering', text: "Germany wasn't even on my radar until they suggested it. Tuition-free at one of the world's best engineering schools — I would never have found this path without them.", init: 'IM', col: 'bg-gray-700' },
      { name: 'Bola Okafor', uni: 'RWTH Aachen', course: 'MSc Computer Science', text: 'Zero tuition, excellent education, and an 18-month job seeker visa. I\'m now working at a top German tech company. Best decision I ever made.', init: 'BO', col: 'bg-blue-700' },
    ],
  },

  'ireland': {
    country: 'Ireland', code: 'ie',
    heroImage: 'https://images.unsplash.com/photo-1548681528-6a5c45b66b42?auto=format&fit=crop&w=1920&q=80',
    accent: 'from-green-950/90 via-green-900/70 to-green-950/40',
    tagline: 'English-Speaking EU Gateway with 2-Year Stay-Back Permission',
    intro: 'Ireland is a hidden gem for international students — an English-speaking country within the European Union, home to Google, Meta, Apple, and Amazon European HQs, with world-class universities and a generous 2-year stay-back permission after graduation. Ireland offers an exceptional balance of academic quality, tech career opportunity, and quality of life, all in a welcoming, English-speaking environment.',
    quickStats: [['30+', 'Universities & Colleges'], ['€10k–€25k', 'Tuition/Year'], ['6–8 Weeks', 'Visa Processing'], ['2 Years', 'Graduate Stay-Back']],
    whyStudyHere: [
      { icon: Globe, title: 'English-Speaking EU Country', desc: 'Ireland is the only English-speaking country in the EU after Brexit — ideal for students who want EU access without a language barrier.' },
      { icon: TrendingUp, title: 'Tech Industry Hub', desc: 'Google, Meta, Apple, Amazon, Microsoft — virtually every global tech giant has its European HQ in Dublin, creating massive job opportunities.' },
      { icon: Shield, title: '2-Year Stay-Back Permission', desc: "After completing a degree of 1+ years, international students get a 2-year permission to live and work in Ireland with no job offer required." },
      { icon: Award, title: 'Quality University System', desc: 'Trinity College Dublin and University College Dublin rank globally. Ireland produces world-class graduates in STEM, business, and humanities.' },
      { icon: Users, title: 'Welcoming Community', desc: 'Ireland has a warm, welcoming culture with a growing African community. It\'s consistently rated as one of the most friendly countries for international students.' },
      { icon: MapPin, title: 'Gateway to Europe', desc: "Ireland's EU membership means your Irish degree opens doors across 27 EU member states and the entire European job market." },
    ],
    topUniversities: [
      { name: 'Trinity College Dublin', rank: 'Top 100 World', location: 'Dublin', type: 'Research University', programs: ['Computer Science', 'Medicine', 'Law', 'Business', 'Engineering'], tuition: '€15,000–€25,000/yr' },
      { name: 'University College Dublin', rank: 'Top 200 World', location: 'Dublin', type: 'Research University', programs: ['Business', 'Engineering', 'Medicine', 'Architecture', 'Science'], tuition: '€14,000–€22,000/yr' },
      { name: 'NUI Galway', rank: 'Top 250 World', location: 'Galway', type: 'Research University', programs: ['Engineering', 'Medicine', 'Business', 'Arts', 'Science'], tuition: '€12,000–€20,000/yr' },
      { name: 'University College Cork', rank: 'Top 300 World', location: 'Cork', type: 'Research University', programs: ['Pharmacy', 'Medicine', 'Business', 'Law', 'Science'], tuition: '€12,000–€19,000/yr' },
      { name: 'Dublin City University', rank: 'Young University Top 50', location: 'Dublin', type: 'Modern University', programs: ['Communications', 'Computing', 'Business', 'Engineering', 'Science'], tuition: '€12,000–€18,000/yr' },
      { name: 'Maynooth University', rank: 'Top Young Universities', location: 'Maynooth, Co. Kildare', type: 'Liberal Arts University', programs: ['Mathematics', 'Computer Science', 'Humanities', 'Business', 'Social Sciences'], tuition: '€11,000–€17,000/yr' },
    ],
    visa: {
      name: 'Irish Study Visa (Type D)',
      processingTime: '6–8 weeks',
      workRights: '20 hours/week during term, 40 hours/week during holidays',
      postStudy: '2-year stay permission (Third Level Graduate Programme)',
      requirements: ['Letter of acceptance from an Irish higher education institution', 'Proof of financial means: €7,000/year minimum', 'Private health insurance', 'Evidence of pre-paid accommodation', 'IELTS 5.5+ or equivalent', 'Bank statements for last 6 months'],
    },
    costs: { tuition: '€10,000 – €25,000 per year', accommodation: '€600 – €1,400/month', food: '€200 – €400/month', transport: '€100 – €150/month', totalEstimate: '€20,000 – €35,000/year' },
    requirements: ['WAEC/NECO minimum 5 credits', 'IELTS Academic 5.5–6.5 depending on course', 'Statement of Purpose', 'Academic transcripts', 'Reference letters (1–2)', 'CV/Resume (for postgraduate)'],
    intakes: 'September (main) and January (limited courses)',
    popularCourses: ['Computer Science', 'Data Analytics', 'Business', 'MBA', 'Nursing', 'Finance', 'Engineering', 'Media & Communications', 'Social Work', 'Architecture'],
    testimonials: [
      { name: 'Emeka Eze', uni: 'NUI Galway', course: 'MSc Data Analytics', text: 'Ireland was a great choice — affordable, English-speaking, EU access. Their counsellor gave me three options fitting my budget. Got into my first choice!', init: 'EE', col: 'bg-green-700' },
      { name: 'Yinka Adeleke', uni: 'Trinity College Dublin', course: 'MSc Computer Science', text: 'Working at Google Dublin 6 months after graduation on my stay-back visa. The 2-year permission is the best thing about Ireland for tech graduates.', init: 'YA', col: 'bg-blue-700' },
    ],
  },

  'netherlands': {
    country: 'Netherlands', code: 'nl',
    heroImage: 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?auto=format&fit=crop&w=1920&q=80',
    accent: 'from-orange-950/90 via-orange-900/70 to-orange-950/40',
    tagline: '2,200+ English Programs in the Heart of Europe',
    intro: 'The Netherlands offers over 2,200 programs taught entirely in English — more than any other non-English-speaking country in the world. With world-class universities, a highly international student community, and excellent quality of life in Amsterdam, Rotterdam, and Delft, the Netherlands delivers a full European education experience with outstanding career prospects across the EU.',
    quickStats: [['50+', 'Universities'], ['€8k–€20k', 'Tuition/Year'], ['4–8 Weeks', 'Visa Processing'], ['1 Year', 'Orientation Permit']],
    whyStudyHere: [
      { icon: Globe, title: '2,200+ English Programs', desc: 'More English-medium programs than any non-English-speaking country. No Dutch language required for most master\'s degrees.' },
      { icon: TrendingUp, title: 'EU Job Market Access', desc: 'Netherlands-based companies include Philips, Shell, Unilever, and KPMG. Your Dutch degree gives EU-wide career access.' },
      { icon: Shield, title: '1-Year Orientation Permit', desc: "After graduation, you get a 1-year permit to stay and find work in the Netherlands — no job offer needed upfront." },
      { icon: Award, title: 'World-Class Universities', desc: 'University of Amsterdam, Delft, and Erasmus Rotterdam consistently rank in the global top 200, known for research and innovation.' },
      { icon: Users, title: 'Most International Campus', desc: 'Over 100,000 international students study in the Netherlands — one of the most diverse student communities in Europe.' },
      { icon: MapPin, title: 'Heart of Europe', desc: 'Amsterdam is 2 hours from London and 4 from Paris by train. The Netherlands is the perfect base for exploring Western Europe.' },
    ],
    topUniversities: [
      { name: 'University of Amsterdam', rank: 'Top 60 World', location: 'Amsterdam', type: 'Research University', programs: ['Social Sciences', 'Business', 'Law', 'Natural Sciences', 'Humanities'], tuition: '€10,000–€18,000/yr' },
      { name: 'Delft University of Technology', rank: 'Top Engineering EU', location: 'Delft', type: 'Technical University', programs: ['Engineering', 'Architecture', 'Computer Science', 'Applied Mathematics', 'Industrial Design'], tuition: '€14,000–€20,000/yr' },
      { name: 'Erasmus University Rotterdam', rank: 'Top Business EU', location: 'Rotterdam', type: 'Business/Research', programs: ['Business', 'Economics', 'Law', 'Medicine', 'Social Sciences'], tuition: '€9,000–€18,000/yr' },
      { name: 'Utrecht University', rank: 'Top 100 World', location: 'Utrecht', type: 'Research University', programs: ['Science', 'Humanities', 'Law', 'Medicine', 'Social Sciences'], tuition: '€9,000–€17,000/yr' },
      { name: 'Leiden University', rank: 'Top 150 World', location: 'Leiden', type: 'Research University', programs: ['Law', 'Social Sciences', 'Arts', 'Natural Sciences', 'Medicine'], tuition: '€9,000–€16,000/yr' },
      { name: 'Wageningen University', rank: 'Top Agricultural World', location: 'Wageningen', type: 'Research University', programs: ['Agriculture', 'Life Sciences', 'Environmental Sciences', 'Food Technology', 'Biotechnology'], tuition: '€11,000–€16,000/yr' },
    ],
    visa: {
      name: 'MVV Visa + Residence Permit',
      processingTime: '4–8 weeks',
      workRights: '16 hours/week during study',
      postStudy: '1-year Orientation Year Permit (Zoekjaar)',
      requirements: ['Admission letter from an accredited Dutch university', 'Proof of funds: €900–€1,000/month', 'Health insurance', 'Accommodation confirmation', 'TB test (for Nigerian nationals)', 'Clean criminal record'],
    },
    costs: { tuition: '€8,000 – €20,000 per year', accommodation: '€500 – €1,200/month', food: '€200 – €400/month', transport: '€100 – €150/month', totalEstimate: '€15,000 – €30,000/year' },
    requirements: ['WAEC/NECO minimum 5 credits', 'IELTS Academic 6.0–6.5+', 'Motivation letter', 'Academic transcripts', 'CV/Resume', 'References (1–2)'],
    intakes: 'September (main) and February (some programs)',
    popularCourses: ['Business', 'Data Science', 'Engineering', 'Computer Science', 'Economics', 'International Law', 'Architecture', 'MBA', 'Finance', 'Social Sciences'],
    testimonials: [
      { name: 'Amara Okafor', uni: 'University of Amsterdam', course: 'MSc Business Analytics', text: 'Amsterdam is incredible and the university has 100% English programs. The team helped me from application to finding accommodation. Love it here!', init: 'AO', col: 'bg-orange-600' },
    ],
  },

  'new-zealand': {
    country: 'New Zealand', code: 'nz',
    heroImage: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1920&q=80',
    accent: 'from-teal-950/90 via-teal-900/70 to-teal-950/40',
    tagline: 'Safe, Welcoming & Beautiful — Study in Paradise',
    intro: 'New Zealand is the perfect destination for students seeking world-class education in a safe, stunning natural environment. With 8 universities, a relaxed and welcoming culture, and post-study work rights of 1–3 years, New Zealand offers a fantastic balance of academic excellence and quality of life. Auckland consistently ranks among the world\'s most liveable cities, and the country is globally recognised for its warmth toward international students.',
    quickStats: [['8', 'Universities'], ['NZD 22k–40k', 'Tuition/Year'], ['4–8 Weeks', 'Visa Processing'], ['1–3 Years', 'Post-Study Visa']],
    whyStudyHere: [
      { icon: Award, title: 'Quality Education System', desc: 'New Zealand has 8 universities, all government-funded and quality-assured. Auckland ranks in the global top 100.' },
      { icon: Shield, title: 'Post-Study Work Visa', desc: 'Graduates receive 1–3 years of post-study work rights depending on qualification level, allowing career building in New Zealand.' },
      { icon: Users, title: 'Safe & Welcoming', desc: "New Zealand is one of the world's safest countries, known for its friendly, inclusive culture and low crime rates." },
      { icon: MapPin, title: 'Stunning Environment', desc: "Study amidst world-famous landscapes — from Auckland's harbours to Queenstown's mountains, fiords, and national parks." },
      { icon: TrendingUp, title: 'Work While Studying', desc: 'International students can work 20 hours/week during semester and full-time during scheduled breaks to fund living costs.' },
      { icon: Globe, title: 'Unique Program Strengths', desc: 'NZ is globally recognised for agriculture, viticulture, marine biology, and environmental science — unique programs hard to find elsewhere.' },
    ],
    topUniversities: [
      { name: 'University of Auckland', rank: 'Top 100 World', location: 'Auckland', type: 'Research University', programs: ['Engineering', 'Medicine', 'Business', 'Law', 'Arts'], tuition: 'NZD 30,000–45,000/yr' },
      { name: 'University of Otago', rank: 'Top 200 World', location: 'Dunedin', type: 'Research University', programs: ['Medicine', 'Dentistry', 'Pharmacy', 'Science', 'Commerce'], tuition: 'NZD 28,000–40,000/yr' },
      { name: 'Victoria University of Wellington', rank: 'Top 250 World', location: 'Wellington', type: 'Research University', programs: ['Law', 'Business', 'Architecture', 'Science', 'Music'], tuition: 'NZD 25,000–38,000/yr' },
      { name: 'University of Canterbury', rank: 'Top 300 World', location: 'Christchurch', type: 'Research University', programs: ['Engineering', 'Science', 'Arts', 'Commerce', 'Education'], tuition: 'NZD 24,000–35,000/yr' },
      { name: 'Massey University', rank: 'Top 500 World', location: 'Palmerston North / Auckland', type: 'Applied University', programs: ['Agriculture', 'Business', 'Design', 'Aviation', 'Veterinary Science'], tuition: 'NZD 22,000–32,000/yr' },
      { name: 'Auckland University of Technology', rank: 'Young University Top 100', location: 'Auckland', type: 'Modern University', programs: ['Business', 'Engineering', 'Communications', 'Health Sciences', 'Computer Science'], tuition: 'NZD 22,000–32,000/yr' },
    ],
    visa: {
      name: 'New Zealand Student Visa',
      processingTime: '4–8 weeks',
      workRights: '20 hours/week during study, full-time during breaks',
      postStudy: 'Post-Study Work Visa: 1–3 years',
      requirements: ['Offer of place from a New Zealand institution', 'Proof of funds: NZD 15,000/year for living costs', 'Return ticket evidence', 'Health and character requirements', 'Medical and chest X-ray (some nationalities)', 'IELTS 5.5+'],
    },
    costs: { tuition: 'NZD 22,000 – 40,000 per year', accommodation: 'NZD 700 – 1,400/month', food: 'NZD 300 – 500/month', transport: 'NZD 100 – 200/month', totalEstimate: 'NZD 35,000 – 60,000/year' },
    requirements: ['WAEC/NECO minimum 5 credits', 'IELTS Academic 5.5–6.5+', 'Statement of Purpose', 'Academic transcripts', 'References'],
    intakes: 'February and July',
    popularCourses: ['Engineering', 'Business', 'Medicine', 'Computer Science', 'Agriculture', 'Tourism', 'Nursing', 'Architecture', 'Film & Media', 'MBA'],
    testimonials: [
      { name: 'Chioma Obi', uni: 'University of Auckland', course: 'MSc Engineering', text: 'New Zealand is beautiful and the people are incredibly welcoming. The team made my admission and visa process stress-free. Loving life in Auckland!', init: 'CO', col: 'bg-teal-700' },
    ],
  },
};

/* ─── MAIN COMPONENT ────────────────────────────────────────── */

export default function StudyAbroadCountry() {
  const { countrySlug } = useParams();
  const data = COUNTRY_DATA[countrySlug];

  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    fullName: '', email: '', phone: '',
    destinationCountry: data?.country || '',
    university: '', program: '', intake: '',
    currentQualification: '', requiresVisa: true,
  });

  if (!data) return <Navigate to="/study-abroad" />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/study-abroad', { ...form, destinationCountry: data.country });
      setSubmitted(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inp = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50 transition';

  return (
    <div>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative min-h-[75vh] flex flex-col justify-end overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${data.heroImage}')` }} />
        <div className={`absolute inset-0 bg-linear-to-r ${data.accent}`} />
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-black/20" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 pb-16 pt-10 w-full">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-white/50 text-xs mb-8">
            <Link to="/" className="hover:text-white transition">Home</Link>
            <span>/</span>
            <Link to="/study-abroad" className="hover:text-white transition">Study Abroad</Link>
            <span>/</span>
            <span className="text-white font-semibold">{data.country}</span>
          </div>

          <div className="max-w-4xl">
            <div className="flex items-center gap-4 mb-5">
              <FlagImg code={data.code} w={80} className="h-12 rounded-md shadow-lg" />
              <span className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/25 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                <Globe size={12} /> Study Abroad Destination
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 leading-tight">
              Study in <span className="text-green-400">{data.country}</span>
            </h1>
            <p className="text-white/80 text-lg md:text-xl mb-8 max-w-2xl leading-relaxed">{data.tagline}</p>

            {/* Quick stat chips */}
            <div className="flex flex-wrap gap-3 mb-8">
              {data.quickStats.map(([n, l]) => (
                <div key={l} className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2.5 text-center min-w-22.5">
                  <div className="text-white font-extrabold text-base leading-none">{n}</div>
                  <div className="text-white/60 text-[11px] mt-0.5">{l}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <button onClick={() => setShowForm(true)}
                className="flex items-center gap-2 bg-green-600 text-white font-bold px-8 py-4 rounded-xl hover:bg-green-700 transition shadow-lg">
                Apply Now — Free Consultation <ArrowRight size={16} />
              </button>
              <Link to="/study-abroad"
                className="flex items-center gap-2 border border-white/30 text-white font-semibold px-6 py-4 rounded-xl hover:bg-white/10 transition">
                <ArrowLeft size={15} /> All Destinations
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── INTRO ────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="inline-block bg-green-50 text-green-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4">
            Why {data.country}?
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-5 max-w-3xl leading-tight">
            Your Complete Guide to Studying in {data.country}
          </h2>
          <p className="text-gray-500 leading-relaxed text-sm md:text-base max-w-3xl">{data.intro}</p>
        </div>
      </section>

      {/* ── WHY STUDY HERE ───────────────────────────────────── */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-3">
              Why Study in {data.country}?
            </h2>
            <p className="text-gray-500 text-sm max-w-xl mx-auto">
              Key reasons why thousands of Nigerian students choose {data.country} every year.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {data.whyStudyHere.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition">
                <div className="w-11 h-11 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                  <Icon size={20} className="text-green-700" />
                </div>
                <h3 className="font-extrabold text-gray-900 mb-2 text-sm">{title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TOP UNIVERSITIES ─────────────────────────────────── */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-block bg-green-50 text-green-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3">
              Top Picks
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-3">
              Top Universities in {data.country}
            </h2>
            <p className="text-gray-500 text-sm max-w-xl mx-auto">
              We are official partners with leading universities in {data.country}. Here are our top recommendations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {data.topUniversities.map(({ name, rank, location, type, programs, tuition }) => (
              <div key={name} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition group">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-green-700 rounded-xl flex items-center justify-center text-white font-extrabold text-xs shrink-0">
                    {name.split(' ').filter(w => w.length > 1).slice(0, 3).map(w => w[0]).join('')}
                  </div>
                  <span className="text-[11px] bg-green-50 text-green-700 font-semibold px-2.5 py-1 rounded-full text-center leading-tight">{rank}</span>
                </div>
                <h3 className="font-extrabold text-gray-900 text-sm mb-1.5 group-hover:text-green-700 transition leading-snug">{name}</h3>
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
                  <MapPin size={11} /> {location}
                  <span className="ml-1 bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full text-[10px]">{type}</span>
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {programs.slice(0, 3).map(p => (
                    <span key={p} className="text-[11px] bg-gray-50 text-gray-600 px-2 py-0.5 rounded-full border border-gray-100">{p}</span>
                  ))}
                  {programs.length > 3 && (
                    <span className="text-[11px] text-gray-400">+{programs.length - 3} more</span>
                  )}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                  <span className="text-xs text-gray-500 font-medium">{tuition}</span>
                  <button onClick={() => setShowForm(true)}
                    className="text-green-700 text-xs font-bold flex items-center gap-1 hover:gap-1.5 transition-all">
                    Apply <ArrowRight size={11} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <button onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 bg-green-700 text-white font-bold px-8 py-4 rounded-xl hover:bg-green-800 transition">
              Get Personalised University Shortlist <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* ── VISA GUIDE ───────────────────────────────────────── */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-block bg-purple-50 text-purple-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3">
              Visa Info
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-3">
              {data.country} Student Visa Guide
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
              <h3 className="font-extrabold text-gray-900 mb-5 flex items-center gap-2.5">
                <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
                  <Shield size={16} className="text-purple-700" />
                </div>
                {data.visa.name}
              </h3>
              <div className="space-y-1">
                {[
                  ['Processing Time', data.visa.processingTime, Clock],
                  ['Work Rights', data.visa.workRights, TrendingUp],
                  ['Post-Study Visa', data.visa.postStudy, GraduationCap],
                ].map(([label, value, Icon]) => (
                  <div key={label} className="flex items-start gap-3 py-3.5 border-b border-gray-50 last:border-0">
                    <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
                      <Icon size={14} className="text-green-700" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium">{label}</p>
                      <p className="text-sm text-gray-800 font-semibold mt-0.5">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
              <h3 className="font-extrabold text-gray-900 mb-5 flex items-center gap-2.5">
                <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                  <FileText size={16} className="text-blue-700" />
                </div>
                Visa Requirements
              </h3>
              <ul className="space-y-3">
                {data.visa.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <CheckCircle size={15} className="text-green-500 shrink-0 mt-0.5" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── COSTS ────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-block bg-orange-50 text-orange-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3">
              Budget Planning
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-3">
              Cost of Studying in {data.country}
            </h2>
            <p className="text-gray-500 text-sm max-w-lg mx-auto">
              Estimated annual costs for Nigerian students. Scholarships can significantly reduce tuition expenses.
            </p>
          </div>

          <div className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden">
            {[
              ['Tuition Fees', data.costs.tuition, 'bg-green-600'],
              ['Accommodation', data.costs.accommodation, 'bg-blue-600'],
              ['Food & Groceries', data.costs.food, 'bg-purple-600'],
              ['Transport', data.costs.transport, 'bg-orange-500'],
            ].map(([label, value, color], i) => (
              <div key={label} className={`flex items-center justify-between px-7 py-4 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
                  <span className="text-sm text-gray-700 font-medium">{label}</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{value}</span>
              </div>
            ))}
            <div className="flex items-center justify-between px-7 py-5 bg-green-700 text-white">
              <span className="font-bold text-sm">Estimated Annual Total</span>
              <span className="font-extrabold text-lg">{data.costs.totalEstimate}</span>
            </div>
          </div>
          <p className="text-gray-400 text-xs mt-3 text-center">
            *Estimates vary by city, lifestyle and institution. Contact us to get a personalised cost breakdown.
          </p>
        </div>
      </section>

      {/* ── REQUIREMENTS + COURSES ───────────────────────────── */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                <FileText size={18} className="text-green-700" />
              </div>
              <h3 className="font-extrabold text-gray-900">Admission Requirements</h3>
            </div>
            <ul className="space-y-3">
              {data.requirements.map((req, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                  <CheckCircle size={15} className="text-green-500 shrink-0 mt-0.5" />
                  {req}
                </li>
              ))}
            </ul>
            <div className="mt-5 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider">Intake Dates</p>
              <p className="text-sm text-blue-900 font-bold mt-1">{data.intakes}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
                <BookOpen size={18} className="text-purple-700" />
              </div>
              <h3 className="font-extrabold text-gray-900">Popular Courses</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.popularCourses.map(c => (
                <span key={c}
                  className="text-sm bg-gray-50 text-gray-700 font-medium px-4 py-2 rounded-xl border border-gray-100 hover:border-green-300 hover:bg-green-50 hover:text-green-700 transition cursor-default">
                  {c}
                </span>
              ))}
            </div>
            <button onClick={() => setShowForm(true)}
              className="mt-6 w-full bg-green-700 text-white font-bold py-3.5 rounded-xl hover:bg-green-800 transition text-sm flex items-center justify-center gap-2">
              Get Course Guidance <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────── */}
      {data.testimonials?.length > 0 && (
        <section className="py-16 px-4 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-extrabold text-gray-900 mb-3">
                Success Stories from {data.country}
              </h2>
              <p className="text-gray-500 text-sm">
                Nigerian students who made it to {data.country} with our help.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {data.testimonials.map(({ name, uni, course, text, init, col }) => (
                <div key={name} className="bg-gray-50 rounded-2xl p-7 border border-gray-100">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed mb-5 italic">"{text}"</p>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${col} rounded-xl flex items-center justify-center text-white text-sm font-extrabold shrink-0`}>
                      {init}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{name}</p>
                      <p className="text-gray-400 text-xs">{course} — {uni}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA BANNER ───────────────────────────────────────── */}
      <section className="bg-green-900 text-white py-10 md:py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="mb-5 flex justify-center"><FlagImg code={data.code} w={80} className="h-14 rounded-md shadow-lg" /></div>
          <h2 className="text-3xl font-extrabold mb-3">Ready to Study in {data.country}?</h2>
          <p className="text-green-200 mb-8 max-w-xl mx-auto">
            Get a free consultation with our {data.country} admissions experts. We'll assess your profile
            and tell you exactly which universities you can get into.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button onClick={() => setShowForm(true)}
              className="bg-white text-green-900 font-bold px-8 py-4 rounded-xl hover:bg-green-50 transition">
              Book Free Consultation →
            </button>
            <Link to="/study-abroad"
              className="border border-white/40 text-white font-bold px-8 py-4 rounded-xl hover:bg-green-800 transition flex items-center gap-2">
              <ArrowLeft size={15} /> All Destinations
            </Link>
          </div>
        </div>
      </section>

      {/* ── APPLICATION MODAL ────────────────────────────────── */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-7 py-5 flex items-center justify-between rounded-t-3xl">
              <div>
                <h3 className="font-extrabold text-gray-900">Apply for {data.country}</h3>
                <p className="text-gray-400 text-xs mt-0.5">Free consultation. Response within 48 hours.</p>
              </div>
              <button onClick={() => setShowForm(false)}
                className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition text-gray-600 text-xl font-bold">
                Ã—
              </button>
            </div>

            {submitted ? (
              <div className="p-10 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <CheckCircle className="text-green-600" size={28} />
                </div>
                <h4 className="text-xl font-extrabold text-gray-900 mb-2">Application Submitted!</h4>
                <p className="text-gray-500 text-sm mb-6">
                  Our {data.country} specialist will contact you within 48 hours.
                </p>
                <button onClick={() => { setShowForm(false); setSubmitted(false); }}
                  className="bg-green-700 text-white font-bold px-8 py-3.5 rounded-xl hover:bg-green-800 transition">
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-7 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Full Name *</label>
                  <input className={inp} required placeholder="Your full name"
                    value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Email *</label>
                    <input type="email" className={inp} required placeholder="you@email.com"
                      value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Phone *</label>
                    <input className={inp} required placeholder="+234..."
                      value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Destination</label>
                  <input className={`${inp} bg-green-50 text-green-800 font-semibold`} readOnly value={data.country} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Program of Interest</label>
                    <input className={inp} placeholder="e.g. Computer Science"
                      value={form.program} onChange={e => setForm(f => ({ ...f, program: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Intended Intake</label>
                    <select className={inp} value={form.intake} onChange={e => setForm(f => ({ ...f, intake: e.target.value }))}>
                      <option value="">Select intake</option>
                      <option>2025 Entry</option>
                      <option>Jan 2026 Entry</option>
                      <option>Sep 2026 Entry</option>
                      <option>2027 Entry</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Highest Qualification</label>
                  <select className={inp} value={form.currentQualification} onChange={e => setForm(f => ({ ...f, currentQualification: e.target.value }))}>
                    <option value="">Select qualification</option>
                    <option>WAEC/NECO</option>
                    <option>OND</option>
                    <option>HND</option>
                    <option>BSc/BA/BEng</option>
                    <option>MSc/MBA/MA</option>
                    <option>PhD</option>
                  </select>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-green-700 text-white font-bold py-4 rounded-xl hover:bg-green-800 disabled:opacity-60 transition flex items-center justify-center gap-2">
                  {loading
                    ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
                    : <>Submit Application <ArrowRight size={15} /></>}
                </button>
                <p className="text-gray-400 text-xs text-center">
                  Free consultation. No obligation. Response within 48 hours.
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
