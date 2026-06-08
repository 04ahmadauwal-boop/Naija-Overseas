const mongoose = require('mongoose');
const dotenv = require('dotenv');
const slugify = require('slugify');
const School = require('./models/School');

dotenv.config();

const facilities = {
  standard: ['Basic Science Lab', 'Library', 'Sports Facilities'],
  mid: ['Science Lab', 'Library', 'Sports Ground'],
  midplus: ['Science Lab', 'ICT Lab', 'Library', 'Sports Facilities'],
  faithBased: ['Chapel', 'Library', 'Science Lab', 'Sports Ground'],
  premium: ['ICT Lab', 'Library', 'Science Lab', 'Sports Ground'],
  international: ['ICT Lab', 'Library', 'Sports', 'AC Classrooms', 'Language Lab'],
  montessori: ['Montessori Materials', 'Library', 'ICT Lab', 'Play Area'],
  islamic: ['Mosque', 'Islamic Library', 'Science Lab', 'Hostel'],
};

const lagosSchools = [
  // ─── AGEGE ───────────────────────────────────────────────
  { name: 'Methodist Boys High School, Agege', address: 'Agege, Lagos', lga: 'Agege', city: 'Agege', fees: { tuition: 120000 }, facilities: facilities.faithBased },
  { name: 'Ansar-Ud-Deen College, Agege', address: 'Isale Oja, Agege, Lagos', lga: 'Agege', city: 'Agege', fees: { tuition: 100000 }, facilities: facilities.islamic },
  { name: 'Victory Secondary School, Agege', address: 'Agege, Lagos State', lga: 'Agege', city: 'Agege', fees: { tuition: 90000 }, facilities: facilities.standard },
  { name: 'Calvary International Secondary School', address: 'Agege, Lagos', lga: 'Agege', city: 'Agege', fees: { tuition: 150000 }, facilities: facilities.faithBased },
  { name: 'Destiny Secondary School, Agege', address: 'Agege, Lagos State', lga: 'Agege', city: 'Agege', fees: { tuition: 80000 }, facilities: facilities.standard },
  { name: 'International College of Excellence, Agege', address: 'Agege, Lagos', lga: 'Agege', city: 'Agege', fees: { tuition: 180000 }, facilities: facilities.midplus },
  { name: 'El-Shaddai Secondary School, Agege', address: 'Agege, Lagos', lga: 'Agege', city: 'Agege', fees: { tuition: 110000 }, facilities: facilities.faithBased },
  { name: 'Celestial Academy, Agege', address: 'Agege, Lagos', lga: 'Agege', city: 'Agege', fees: { tuition: 95000 }, facilities: facilities.standard },
  { name: 'God\'s Grace Secondary School, Agege', address: 'Agege, Lagos', lga: 'Agege', city: 'Agege', fees: { tuition: 85000 }, facilities: facilities.standard },
  { name: 'Khalifah Islamic Academy, Agege', address: 'Agege, Lagos', lga: 'Agege', city: 'Agege', fees: { tuition: 90000 }, facilities: facilities.islamic },

  // ─── ALIMOSHO ────────────────────────────────────────────
  { name: 'Excel High School, Alimosho', address: 'Dopemu, Agege, Lagos', lga: 'Alimosho', city: 'Alimosho', fees: { tuition: 130000 }, facilities: facilities.mid },
  { name: 'Deeper Life High School, Alimosho', address: 'Alimosho, Lagos', lga: 'Alimosho', city: 'Alimosho', fees: { tuition: 150000 }, facilities: facilities.faithBased },
  { name: 'Foursquare College, Alimosho', address: 'Alimosho, Lagos', lga: 'Alimosho', city: 'Alimosho', fees: { tuition: 140000 }, facilities: facilities.faithBased },
  { name: 'Greenfield International School, Alimosho', address: 'Alimosho, Lagos', lga: 'Alimosho', city: 'Alimosho', fees: { tuition: 200000 }, facilities: facilities.midplus },
  { name: 'Life Gate College, Alimosho', address: 'Alimosho, Lagos', lga: 'Alimosho', city: 'Alimosho', fees: { tuition: 120000 }, facilities: facilities.faithBased },
  { name: 'Model Secondary School, Alimosho', address: 'Alimosho, Lagos', lga: 'Alimosho', city: 'Alimosho', fees: { tuition: 110000 }, facilities: facilities.mid },
  { name: 'Harmony Secondary School, Alimosho', address: 'Alimosho, Lagos', lga: 'Alimosho', city: 'Alimosho', fees: { tuition: 100000 }, facilities: facilities.standard },
  { name: 'Heritage Academy, Alimosho', address: 'Alimosho, Lagos', lga: 'Alimosho', city: 'Alimosho', fees: { tuition: 160000 }, facilities: facilities.midplus },
  { name: 'Al-Hikmah Secondary School, Alimosho', address: 'Alimosho, Lagos', lga: 'Alimosho', city: 'Alimosho', fees: { tuition: 95000 }, facilities: facilities.islamic },
  { name: 'Royal Heritage Academy, Alimosho', address: 'Alimosho, Lagos', lga: 'Alimosho', city: 'Alimosho', fees: { tuition: 175000 }, facilities: facilities.premium },
  { name: 'Wisdom International School, Alimosho', address: 'Alimosho, Lagos', lga: 'Alimosho', city: 'Alimosho', fees: { tuition: 130000 }, facilities: facilities.mid },
  { name: 'Emmanuel College, Alimosho', address: 'Alimosho, Lagos', lga: 'Alimosho', city: 'Alimosho', fees: { tuition: 120000 }, facilities: facilities.faithBased },
  { name: 'Prime Secondary School, Alimosho', address: 'Alimosho, Lagos', lga: 'Alimosho', city: 'Alimosho', fees: { tuition: 115000 }, facilities: facilities.standard },

  // ─── IKORODU ──────────────────────────────────────────────
  { name: 'Adeola Odutola College, Ikorodu', address: 'Ikorodu, Lagos', lga: 'Ikorodu', city: 'Ikorodu', fees: { tuition: 110000 }, facilities: facilities.mid },
  { name: 'St. Mary\'s Catholic Secondary School, Ikorodu', address: 'Ikorodu, Lagos State', lga: 'Ikorodu', city: 'Ikorodu', fees: { tuition: 130000 }, facilities: facilities.faithBased },
  { name: 'Ikorodu High School', address: 'Ikorodu, Lagos', lga: 'Ikorodu', city: 'Ikorodu', fees: { tuition: 100000 }, facilities: facilities.mid },
  { name: 'Ansar-Ud-Deen College, Ikorodu', address: 'Ikorodu, Lagos', lga: 'Ikorodu', city: 'Ikorodu', fees: { tuition: 90000 }, facilities: facilities.islamic },
  { name: 'CMS Grammar School, Ikorodu', address: 'Ikorodu, Lagos', lga: 'Ikorodu', city: 'Ikorodu', fees: { tuition: 120000 }, facilities: facilities.faithBased },
  { name: 'Ikorodu Grammar School', address: 'Ikorodu, Lagos', lga: 'Ikorodu', city: 'Ikorodu', fees: { tuition: 95000 }, facilities: facilities.standard },
  { name: 'Victory Academy, Ikorodu', address: 'Ikorodu, Lagos', lga: 'Ikorodu', city: 'Ikorodu', fees: { tuition: 105000 }, facilities: facilities.faithBased },
  { name: 'Lighthouse Secondary School, Ikorodu', address: 'Ikorodu, Lagos', lga: 'Ikorodu', city: 'Ikorodu', fees: { tuition: 115000 }, facilities: facilities.midplus },
  { name: 'Faith Academy, Ikorodu', address: 'Ikorodu, Lagos', lga: 'Ikorodu', city: 'Ikorodu', fees: { tuition: 130000 }, facilities: facilities.faithBased },
  { name: 'Excellence Secondary School, Ikorodu', address: 'Ikorodu, Lagos', lga: 'Ikorodu', city: 'Ikorodu', fees: { tuition: 120000 }, facilities: facilities.mid },
  { name: 'Bright Future International College, Ikorodu', address: 'Ikorodu, Lagos', lga: 'Ikorodu', city: 'Ikorodu', fees: { tuition: 180000 }, facilities: facilities.premium },
  { name: 'Adekoya Memorial College, Ikorodu', address: 'Ikorodu, Lagos', lga: 'Ikorodu', city: 'Ikorodu', fees: { tuition: 110000 }, facilities: facilities.mid },
  { name: 'Islamic Mission Secondary School, Ikorodu', address: 'Ikorodu, Lagos', lga: 'Ikorodu', city: 'Ikorodu', fees: { tuition: 85000 }, facilities: facilities.islamic },
  { name: 'Obafemi Awolowo Memorial College, Ikorodu', address: 'Ikorodu, Lagos', lga: 'Ikorodu', city: 'Ikorodu', fees: { tuition: 100000 }, facilities: facilities.mid },
  { name: 'Ikorodu British International School', address: 'Ikorodu, Lagos', lga: 'Ikorodu', city: 'Ikorodu', fees: { tuition: 500000 }, facilities: facilities.international },

  // ─── BADAGRY ──────────────────────────────────────────────
  { name: 'Badagry Comprehensive High School', address: 'Badagry, Lagos', lga: 'Badagry', city: 'Badagry', fees: { tuition: 80000 }, facilities: facilities.standard },
  { name: 'Anglican Grammar School, Badagry', address: 'Badagry, Lagos State', lga: 'Badagry', city: 'Badagry', fees: { tuition: 90000 }, facilities: facilities.faithBased },
  { name: 'Methodist Secondary School, Badagry', address: 'Badagry, Lagos', lga: 'Badagry', city: 'Badagry', fees: { tuition: 85000 }, facilities: facilities.faithBased },
  { name: 'Catholic Secondary School, Badagry', address: 'Badagry, Lagos', lga: 'Badagry', city: 'Badagry', fees: { tuition: 95000 }, facilities: facilities.faithBased },
  { name: 'Badagry Grammar School', address: 'Badagry, Lagos', lga: 'Badagry', city: 'Badagry', fees: { tuition: 75000 }, facilities: facilities.standard },
  { name: 'Victory International Academy, Badagry', address: 'Badagry, Lagos', lga: 'Badagry', city: 'Badagry', fees: { tuition: 110000 }, facilities: facilities.faithBased },
  { name: 'Heritage College, Badagry', address: 'Badagry, Lagos', lga: 'Badagry', city: 'Badagry', fees: { tuition: 100000 }, facilities: facilities.mid },
  { name: 'Islamic Mission School, Badagry', address: 'Badagry, Lagos', lga: 'Badagry', city: 'Badagry', fees: { tuition: 80000 }, facilities: facilities.islamic },

  // ─── OSHODI-ISOLO ─────────────────────────────────────────
  { name: 'Olivet Baptist High School, Isolo', address: 'Isolo, Lagos', lga: 'Oshodi-Isolo', city: 'Isolo', fees: { tuition: 130000 }, facilities: facilities.faithBased },
  { name: 'Navy Secondary School, Oshodi', address: 'Oshodi, Lagos', lga: 'Oshodi-Isolo', city: 'Oshodi', fees: { tuition: 200000 }, facilities: facilities.premium },
  { name: 'St. Francis Catholic School, Isolo', address: 'Isolo, Lagos', lga: 'Oshodi-Isolo', city: 'Isolo', fees: { tuition: 140000 }, facilities: facilities.faithBased },
  { name: 'Oshodi Grammar School', address: 'Oshodi, Lagos', lga: 'Oshodi-Isolo', city: 'Oshodi', fees: { tuition: 100000 }, facilities: facilities.mid },
  { name: 'Redeemed Christian High School, Isolo', address: 'Isolo, Lagos', lga: 'Oshodi-Isolo', city: 'Isolo', fees: { tuition: 160000 }, facilities: facilities.faithBased },
  { name: 'Al-Muhibbah Islamic Secondary School', address: 'Oshodi, Lagos', lga: 'Oshodi-Isolo', city: 'Oshodi', fees: { tuition: 90000 }, facilities: facilities.islamic },
  { name: 'Zenith International School, Isolo', address: 'Isolo, Lagos', lga: 'Oshodi-Isolo', city: 'Isolo', fees: { tuition: 220000 }, facilities: facilities.premium },
  { name: 'Divine Heritage Academy, Isolo', address: 'Isolo, Lagos', lga: 'Oshodi-Isolo', city: 'Isolo', fees: { tuition: 150000 }, facilities: facilities.midplus },
  { name: 'Ikotun Comprehensive High School', address: 'Ikotun, Lagos', lga: 'Oshodi-Isolo', city: 'Ikotun', fees: { tuition: 95000 }, facilities: facilities.standard },
  { name: 'Graceland Secondary School, Isolo', address: 'Isolo, Lagos', lga: 'Oshodi-Isolo', city: 'Isolo', fees: { tuition: 120000 }, facilities: facilities.faithBased },
  { name: 'International School of Leadership, Isolo', address: 'Isolo, Lagos', lga: 'Oshodi-Isolo', city: 'Isolo', fees: { tuition: 180000 }, facilities: facilities.midplus },
  { name: 'Ansar-Ud-Deen Grammar School, Isolo', address: 'Isolo, Lagos', lga: 'Oshodi-Isolo', city: 'Isolo', fees: { tuition: 100000 }, facilities: facilities.islamic },

  // ─── KOSOFE ───────────────────────────────────────────────
  { name: 'Maryland Comprehensive Secondary School', address: 'Maryland, Lagos', lga: 'Kosofe', city: 'Maryland', fees: { tuition: 150000 }, facilities: facilities.midplus },
  { name: 'St. Anthony\'s Secondary School, Kosofe', address: 'Kosofe, Lagos', lga: 'Kosofe', city: 'Kosofe', fees: { tuition: 130000 }, facilities: facilities.faithBased },
  { name: 'Community Secondary School, Kosofe', address: 'Kosofe, Lagos', lga: 'Kosofe', city: 'Kosofe', fees: { tuition: 95000 }, facilities: facilities.standard },
  { name: 'Ketu High School', address: 'Ketu, Lagos', lga: 'Kosofe', city: 'Ketu', fees: { tuition: 110000 }, facilities: facilities.mid },
  { name: 'Lagos State Model College, Kosofe', address: 'Kosofe, Lagos', lga: 'Kosofe', city: 'Kosofe', fees: { tuition: 120000 }, facilities: facilities.midplus },
  { name: 'Bright Future Secondary School, Kosofe', address: 'Kosofe, Lagos', lga: 'Kosofe', city: 'Kosofe', fees: { tuition: 140000 }, facilities: facilities.mid },
  { name: 'Unique High School, Kosofe', address: 'Kosofe, Lagos', lga: 'Kosofe', city: 'Kosofe', fees: { tuition: 100000 }, facilities: facilities.standard },
  { name: 'Redeemer\'s International Secondary, Kosofe', address: 'Kosofe, Lagos', lga: 'Kosofe', city: 'Kosofe', fees: { tuition: 170000 }, facilities: facilities.faithBased },
  { name: 'Faith Legacy College, Kosofe', address: 'Kosofe, Lagos', lga: 'Kosofe', city: 'Kosofe', fees: { tuition: 130000 }, facilities: facilities.faithBased },
  { name: 'Noble Academy, Kosofe', address: 'Kosofe, Lagos', lga: 'Kosofe', city: 'Kosofe', fees: { tuition: 115000 }, facilities: facilities.mid },

  // ─── MUSHIN ───────────────────────────────────────────────
  { name: 'Ahmadiyya Muslim Grammar School, Mushin', address: 'Mushin, Lagos', lga: 'Mushin', city: 'Mushin', fees: { tuition: 90000 }, facilities: facilities.islamic },
  { name: 'Baptist Academy, Mushin', address: 'Mushin, Lagos', lga: 'Mushin', city: 'Mushin', fees: { tuition: 120000 }, facilities: facilities.faithBased },
  { name: 'Mushin Model High School', address: 'Mushin, Lagos', lga: 'Mushin', city: 'Mushin', fees: { tuition: 100000 }, facilities: facilities.mid },
  { name: 'Ansar-Ud-Deen Girls College, Mushin', address: 'Mushin, Lagos', lga: 'Mushin', city: 'Mushin', fees: { tuition: 90000 }, facilities: facilities.islamic },
  { name: 'St. Finbarr\'s College, Akoka', address: 'Akoka, Mushin, Lagos', lga: 'Mushin', city: 'Mushin', fees: { tuition: 140000 }, facilities: facilities.faithBased },
  { name: 'Remo Secondary School, Mushin', address: 'Mushin, Lagos', lga: 'Mushin', city: 'Mushin', fees: { tuition: 95000 }, facilities: facilities.standard },
  { name: 'Mushin Grammar School', address: 'Mushin, Lagos', lga: 'Mushin', city: 'Mushin', fees: { tuition: 85000 }, facilities: facilities.standard },
  { name: 'Victory College, Mushin', address: 'Mushin, Lagos', lga: 'Mushin', city: 'Mushin', fees: { tuition: 110000 }, facilities: facilities.faithBased },
  { name: 'Sunrise Secondary School, Mushin', address: 'Mushin, Lagos', lga: 'Mushin', city: 'Mushin', fees: { tuition: 100000 }, facilities: facilities.standard },
  { name: 'Al-Amin College, Mushin', address: 'Mushin, Lagos', lga: 'Mushin', city: 'Mushin', fees: { tuition: 90000 }, facilities: facilities.islamic },
  { name: 'New Horizon College, Mushin', address: 'Mushin, Lagos', lga: 'Mushin', city: 'Mushin', fees: { tuition: 130000 }, facilities: facilities.midplus },

  // ─── SURULERE ─────────────────────────────────────────────
  { name: 'Birch Freeman High School, Surulere', address: 'Surulere, Lagos', lga: 'Surulere', city: 'Surulere', fees: { tuition: 150000 }, facilities: facilities.midplus },
  { name: 'Lagos State Model College, Surulere', address: 'Surulere, Lagos', lga: 'Surulere', city: 'Surulere', fees: { tuition: 130000 }, facilities: facilities.midplus },
  { name: 'International School, University of Lagos', address: 'Akoka, Lagos', lga: 'Surulere', city: 'Yaba', fees: { tuition: 350000 }, facilities: facilities.premium },
  { name: 'Surulere Grammar School', address: 'Surulere, Lagos', lga: 'Surulere', city: 'Surulere', fees: { tuition: 100000 }, facilities: facilities.mid },
  { name: 'Holy Child College, Surulere', address: 'Surulere, Lagos', lga: 'Surulere', city: 'Surulere', fees: { tuition: 200000 }, facilities: facilities.faithBased },
  { name: 'St. Gregory\'s College, Surulere', address: 'Surulere, Lagos', lga: 'Surulere', city: 'Surulere', fees: { tuition: 180000 }, facilities: facilities.faithBased },
  { name: 'Corona Secondary School, Gbagada', address: 'Gbagada, Lagos', lga: 'Surulere', city: 'Gbagada', fees: { tuition: 700000 }, facilities: facilities.international },
  { name: 'Yaba College of Technology Secondary', address: 'Yaba, Lagos', lga: 'Surulere', city: 'Yaba', fees: { tuition: 110000 }, facilities: facilities.mid },
  { name: 'Randle Academy, Surulere', address: 'Surulere, Lagos', lga: 'Surulere', city: 'Surulere', fees: { tuition: 130000 }, facilities: facilities.mid },
  { name: 'Mount Carmel College, Surulere', address: 'Surulere, Lagos', lga: 'Surulere', city: 'Surulere', fees: { tuition: 170000 }, facilities: facilities.faithBased },
  { name: 'Redeemed Christian High School, Surulere', address: 'Surulere, Lagos', lga: 'Surulere', city: 'Surulere', fees: { tuition: 160000 }, facilities: facilities.faithBased },

  // ─── IKEJA ────────────────────────────────────────────────
  { name: 'Nigerian Turkish International School, Ikeja', address: 'Ikeja, Lagos', lga: 'Ikeja', city: 'Ikeja', fees: { tuition: 900000 }, facilities: facilities.international },
  { name: 'Regent College, Ikeja', address: 'Ikeja, Lagos', lga: 'Ikeja', city: 'Ikeja', fees: { tuition: 400000 }, facilities: facilities.premium },
  { name: 'Chrisland High School, Alausa', address: 'Alausa, Ikeja, Lagos', lga: 'Ikeja', city: 'Ikeja', fees: { tuition: 600000 }, facilities: facilities.premium },
  { name: 'Lagos State Model College, Ikeja', address: 'Ikeja, Lagos', lga: 'Ikeja', city: 'Ikeja', fees: { tuition: 150000 }, facilities: facilities.midplus },
  { name: 'Lagos Anglican Girls Grammar School', address: 'Ikeja, Lagos', lga: 'Ikeja', city: 'Ikeja', fees: { tuition: 170000 }, facilities: facilities.faithBased },
  { name: 'Ikeja Senior High School', address: 'Ikeja, Lagos', lga: 'Ikeja', city: 'Ikeja', fees: { tuition: 120000 }, facilities: facilities.mid },
  { name: 'St. Jude\'s Catholic High School, Ikeja', address: 'Ikeja, Lagos', lga: 'Ikeja', city: 'Ikeja', fees: { tuition: 180000 }, facilities: facilities.faithBased },
  { name: 'City Comprehensive College, Ikeja', address: 'Ikeja, Lagos', lga: 'Ikeja', city: 'Ikeja', fees: { tuition: 200000 }, facilities: facilities.midplus },
  { name: 'Adeleke International School', address: 'Ikeja, Lagos', lga: 'Ikeja', city: 'Ikeja', fees: { tuition: 350000 }, facilities: facilities.premium },
  { name: 'Hilton Academy, Ikeja', address: 'Ikeja, Lagos', lga: 'Ikeja', city: 'Ikeja', fees: { tuition: 250000 }, facilities: facilities.premium },
  { name: 'Ansar-Ud-Deen College, Isale Oja', address: 'Ikeja, Lagos', lga: 'Ikeja', city: 'Ikeja', fees: { tuition: 100000 }, facilities: facilities.islamic },
  { name: 'Archbishop Aggrey Memorial School', address: 'Ikeja, Lagos', lga: 'Ikeja', city: 'Ikeja', fees: { tuition: 180000 }, facilities: facilities.faithBased },
  { name: 'Greensprings School, Ikeja', address: 'Ikeja, Lagos', lga: 'Ikeja', city: 'Ikeja', fees: { tuition: 1200000 }, facilities: facilities.international },
  { name: 'Premier Academy, Ikeja', address: 'Ikeja, Lagos', lga: 'Ikeja', city: 'Ikeja', fees: { tuition: 300000 }, facilities: facilities.premium },
  { name: 'Rancept Nigeria International Secondary', address: 'Ikeja, Lagos', lga: 'Ikeja', city: 'Ikeja', fees: { tuition: 280000 }, facilities: facilities.premium },

  // ─── ETI-OSA (LEKKI / VICTORIA ISLAND / AJAH) ─────────────
  { name: 'Atlantic Hall Educational Centre', address: 'Epe, Lagos', lga: 'Eti-Osa', city: 'Epe', fees: { tuition: 2500000 }, facilities: facilities.international },
  { name: 'Chrisland College, Lekki', address: 'Lekki, Lagos', lga: 'Eti-Osa', city: 'Lekki', fees: { tuition: 1000000 }, facilities: facilities.international },
  { name: 'Lekki British International High School', address: 'Lekki, Lagos', lga: 'Eti-Osa', city: 'Lekki', fees: { tuition: 2000000 }, facilities: facilities.international },
  { name: 'Lead British International School, Lekki', address: 'Lekki, Lagos', lga: 'Eti-Osa', city: 'Lekki', fees: { tuition: 1800000 }, facilities: facilities.international },
  { name: 'The Ambassadors College, Lekki', address: 'Lekki, Lagos', lga: 'Eti-Osa', city: 'Lekki', fees: { tuition: 800000 }, facilities: facilities.international },
  { name: 'Greensprings School, Lekki', address: 'Anthony Village, Lagos', lga: 'Eti-Osa', city: 'Lekki', fees: { tuition: 1200000 }, facilities: facilities.international },
  { name: 'Lagos Preparatory School', address: 'Victoria Island, Lagos', lga: 'Eti-Osa', city: 'Victoria Island', fees: { tuition: 1500000 }, facilities: facilities.international },
  { name: 'Nike Art Gallery Secondary, Lekki', address: 'Lekki, Lagos', lga: 'Eti-Osa', city: 'Lekki', fees: { tuition: 500000 }, facilities: facilities.premium },
  { name: 'Lycee Louis Pasteur, Ikoyi', address: 'Ikoyi, Lagos', lga: 'Eti-Osa', city: 'Ikoyi', fees: { tuition: 1800000 }, facilities: facilities.international },
  { name: 'Meadow Hall School, Lekki', address: 'Lekki, Lagos', lga: 'Eti-Osa', city: 'Lekki', fees: { tuition: 2000000 }, facilities: facilities.international },
  { name: 'Olashore International School, Lekki', address: 'Lekki, Lagos', lga: 'Eti-Osa', city: 'Lekki', fees: { tuition: 1500000 }, facilities: facilities.international },
  { name: 'Dowen College, Lekki', address: 'Lekki, Lagos', lga: 'Eti-Osa', city: 'Lekki', fees: { tuition: 900000 }, facilities: facilities.international },
  { name: 'Spring Field School, Lekki', address: 'Lekki, Lagos', lga: 'Eti-Osa', city: 'Lekki', fees: { tuition: 700000 }, facilities: facilities.premium },
  { name: 'Lagos International School', address: 'Victoria Island, Lagos', lga: 'Eti-Osa', city: 'Victoria Island', fees: { tuition: 2000000 }, facilities: facilities.international },
  { name: 'American International School of Lagos', address: 'Victoria Island, Lagos', lga: 'Eti-Osa', city: 'Victoria Island', fees: { tuition: 2500000 }, facilities: facilities.international },
  { name: 'British International School, Lagos', address: 'Victoria Island, Lagos', lga: 'Eti-Osa', city: 'Victoria Island', fees: { tuition: 2200000 }, facilities: facilities.international },
  { name: 'Vivian Fowler Memorial College', address: 'Ikeja, Lagos', lga: 'Eti-Osa', city: 'Ikeja', fees: { tuition: 1000000 }, facilities: facilities.premium },
  { name: 'Ajah International Academy', address: 'Ajah, Lagos', lga: 'Eti-Osa', city: 'Ajah', fees: { tuition: 400000 }, facilities: facilities.premium },
  { name: 'Jakande High School, Lekki', address: 'Lekki Phase 1, Lagos', lga: 'Eti-Osa', city: 'Lekki', fees: { tuition: 180000 }, facilities: facilities.midplus },
  { name: 'Ikoyi Grammar School', address: 'Ikoyi, Lagos', lga: 'Eti-Osa', city: 'Ikoyi', fees: { tuition: 130000 }, facilities: facilities.mid },

  // ─── AMUWO ODOFIN ─────────────────────────────────────────
  { name: 'Amuwo Odofin High School', address: 'Amuwo Odofin, Lagos', lga: 'Amuwo-Odofin', city: 'Amuwo Odofin', fees: { tuition: 100000 }, facilities: facilities.mid },
  { name: 'St. John\'s Secondary School, Amuwo', address: 'Amuwo Odofin, Lagos', lga: 'Amuwo-Odofin', city: 'Amuwo Odofin', fees: { tuition: 130000 }, facilities: facilities.faithBased },
  { name: 'Federal Housing Authority Secondary, Amuwo', address: 'Amuwo Odofin, Lagos', lga: 'Amuwo-Odofin', city: 'Amuwo Odofin', fees: { tuition: 120000 }, facilities: facilities.mid },
  { name: 'Mile 2 Grammar School', address: 'Mile 2, Lagos', lga: 'Amuwo-Odofin', city: 'Mile 2', fees: { tuition: 90000 }, facilities: facilities.standard },
  { name: 'Festac High School', address: 'Festac Town, Lagos', lga: 'Amuwo-Odofin', city: 'Festac', fees: { tuition: 150000 }, facilities: facilities.midplus },
  { name: 'Community High School, Festac', address: 'Festac Town, Lagos', lga: 'Amuwo-Odofin', city: 'Festac', fees: { tuition: 110000 }, facilities: facilities.mid },
  { name: 'St. Luke\'s Catholic School, Amuwo', address: 'Amuwo Odofin, Lagos', lga: 'Amuwo-Odofin', city: 'Amuwo Odofin', fees: { tuition: 140000 }, facilities: facilities.faithBased },
  { name: 'National Grammar School, Amuwo', address: 'Amuwo Odofin, Lagos', lga: 'Amuwo-Odofin', city: 'Amuwo Odofin', fees: { tuition: 100000 }, facilities: facilities.mid },
  { name: 'Redeemed High School, Festac', address: 'Festac Town, Lagos', lga: 'Amuwo-Odofin', city: 'Festac', fees: { tuition: 160000 }, facilities: facilities.faithBased },

  // ─── IFAKO-IJAIYE ─────────────────────────────────────────
  { name: 'Ifako Comprehensive High School', address: 'Ifako, Lagos', lga: 'Ifako-Ijaiye', city: 'Ifako', fees: { tuition: 100000 }, facilities: facilities.mid },
  { name: 'Ijaiye Grammar School', address: 'Ijaiye, Lagos', lga: 'Ifako-Ijaiye', city: 'Ijaiye', fees: { tuition: 90000 }, facilities: facilities.standard },
  { name: 'Ojokoro Secondary School', address: 'Ojokoro, Lagos', lga: 'Ifako-Ijaiye', city: 'Ojokoro', fees: { tuition: 85000 }, facilities: facilities.standard },
  { name: 'St. Peter\'s Anglican School, Ifako', address: 'Ifako, Lagos', lga: 'Ifako-Ijaiye', city: 'Ifako', fees: { tuition: 110000 }, facilities: facilities.faithBased },
  { name: 'Mountain of Fire Academy, Ifako', address: 'Ifako, Lagos', lga: 'Ifako-Ijaiye', city: 'Ifako', fees: { tuition: 130000 }, facilities: facilities.faithBased },
  { name: 'Excellence Academy, Ifako', address: 'Ifako, Lagos', lga: 'Ifako-Ijaiye', city: 'Ifako', fees: { tuition: 120000 }, facilities: facilities.mid },
  { name: 'Agboville High School', address: 'Ifako, Lagos', lga: 'Ifako-Ijaiye', city: 'Ifako', fees: { tuition: 95000 }, facilities: facilities.standard },
  { name: 'Divine Grace Secondary School, Ijaiye', address: 'Ijaiye, Lagos', lga: 'Ifako-Ijaiye', city: 'Ijaiye', fees: { tuition: 110000 }, facilities: facilities.faithBased },

  // ─── SOMOLU ───────────────────────────────────────────────
  { name: 'Lagos High School', address: 'Bariga, Lagos', lga: 'Somolu', city: 'Bariga', fees: { tuition: 110000 }, facilities: facilities.mid },
  { name: 'Bariga High School', address: 'Bariga, Lagos', lga: 'Somolu', city: 'Bariga', fees: { tuition: 100000 }, facilities: facilities.mid },
  { name: 'Somolu Grammar School', address: 'Somolu, Lagos', lga: 'Somolu', city: 'Somolu', fees: { tuition: 90000 }, facilities: facilities.standard },
  { name: 'Akoka High School', address: 'Akoka, Lagos', lga: 'Somolu', city: 'Akoka', fees: { tuition: 100000 }, facilities: facilities.mid },
  { name: 'Community Secondary School, Bariga', address: 'Bariga, Lagos', lga: 'Somolu', city: 'Bariga', fees: { tuition: 85000 }, facilities: facilities.standard },
  { name: 'St. John\'s Catholic Secondary, Somolu', address: 'Somolu, Lagos', lga: 'Somolu', city: 'Somolu', fees: { tuition: 120000 }, facilities: facilities.faithBased },
  { name: 'Ansar-Ud-Deen College, Bariga', address: 'Bariga, Lagos', lga: 'Somolu', city: 'Bariga', fees: { tuition: 90000 }, facilities: facilities.islamic },
  { name: 'Calvary International School, Bariga', address: 'Bariga, Lagos', lga: 'Somolu', city: 'Bariga', fees: { tuition: 130000 }, facilities: facilities.faithBased },

  // ─── APAPA ────────────────────────────────────────────────
  { name: 'Apapa High School', address: 'Apapa, Lagos', lga: 'Apapa', city: 'Apapa', fees: { tuition: 130000 }, facilities: facilities.mid },
  { name: 'Navy Town Secondary School, Apapa', address: 'Apapa, Lagos', lga: 'Apapa', city: 'Apapa', fees: { tuition: 200000 }, facilities: facilities.premium },
  { name: 'Western Nigeria Trading Company School', address: 'Apapa, Lagos', lga: 'Apapa', city: 'Apapa', fees: { tuition: 120000 }, facilities: facilities.mid },
  { name: 'St. Patrick\'s Catholic School, Apapa', address: 'Apapa, Lagos', lga: 'Apapa', city: 'Apapa', fees: { tuition: 150000 }, facilities: facilities.faithBased },
  { name: 'Lagos Port Secondary School', address: 'Apapa, Lagos', lga: 'Apapa', city: 'Apapa', fees: { tuition: 110000 }, facilities: facilities.mid },
  { name: 'Apapa Grammar School', address: 'Apapa, Lagos', lga: 'Apapa', city: 'Apapa', fees: { tuition: 100000 }, facilities: facilities.mid },

  // ─── AJEROMI-IFELODUN ─────────────────────────────────────
  { name: 'Orile Agege High School', address: 'Orile, Lagos', lga: 'Ajeromi-Ifelodun', city: 'Orile', fees: { tuition: 85000 }, facilities: facilities.standard },
  { name: 'Ajegunle Comprehensive High School', address: 'Ajegunle, Lagos', lga: 'Ajeromi-Ifelodun', city: 'Ajegunle', fees: { tuition: 75000 }, facilities: facilities.standard },
  { name: 'Ifelodun Grammar School', address: 'Ifelodun, Lagos', lga: 'Ajeromi-Ifelodun', city: 'Ifelodun', fees: { tuition: 80000 }, facilities: facilities.standard },
  { name: 'Holy Rosary Secondary School, Ajegunle', address: 'Ajegunle, Lagos', lga: 'Ajeromi-Ifelodun', city: 'Ajegunle', fees: { tuition: 100000 }, facilities: facilities.faithBased },
  { name: 'Ajeromi Community Secondary School', address: 'Ajeromi, Lagos', lga: 'Ajeromi-Ifelodun', city: 'Ajeromi', fees: { tuition: 80000 }, facilities: facilities.standard },
  { name: 'Islamic Mission School, Ajegunle', address: 'Ajegunle, Lagos', lga: 'Ajeromi-Ifelodun', city: 'Ajegunle', fees: { tuition: 75000 }, facilities: facilities.islamic },
  { name: 'St. Mary\'s Secondary School, Orile', address: 'Orile, Lagos', lga: 'Ajeromi-Ifelodun', city: 'Orile', fees: { tuition: 100000 }, facilities: facilities.faithBased },

  // ─── EPE ──────────────────────────────────────────────────
  { name: 'Epe Grammar School', address: 'Epe, Lagos', lga: 'Epe', city: 'Epe', fees: { tuition: 85000 }, facilities: facilities.standard },
  { name: 'Agboville High School, Epe', address: 'Epe, Lagos', lga: 'Epe', city: 'Epe', fees: { tuition: 80000 }, facilities: facilities.standard },
  { name: 'Lagos State Model College, Epe', address: 'Epe, Lagos', lga: 'Epe', city: 'Epe', fees: { tuition: 100000 }, facilities: facilities.mid },
  { name: 'Community Secondary School, Epe', address: 'Epe, Lagos', lga: 'Epe', city: 'Epe', fees: { tuition: 75000 }, facilities: facilities.standard },
  { name: 'Unity High School, Epe', address: 'Epe, Lagos', lga: 'Epe', city: 'Epe', fees: { tuition: 80000 }, facilities: facilities.standard },
  { name: 'St. Luke\'s Anglican School, Epe', address: 'Epe, Lagos', lga: 'Epe', city: 'Epe', fees: { tuition: 90000 }, facilities: facilities.faithBased },
  { name: 'Ansar-Ud-Deen Grammar School, Epe', address: 'Epe, Lagos', lga: 'Epe', city: 'Epe', fees: { tuition: 80000 }, facilities: facilities.islamic },
  { name: 'Islamic Mission Secondary School, Epe', address: 'Epe, Lagos', lga: 'Epe', city: 'Epe', fees: { tuition: 75000 }, facilities: facilities.islamic },

  // ─── IBEJU-LEKKI ─────────────────────────────────────────
  { name: 'Ibeju-Lekki Senior High School', address: 'Ibeju-Lekki, Lagos', lga: 'Ibeju-Lekki', city: 'Ibeju', fees: { tuition: 90000 }, facilities: facilities.standard },
  { name: 'Lagos Free Zone International School', address: 'Ibeju-Lekki, Lagos', lga: 'Ibeju-Lekki', city: 'Lekki', fees: { tuition: 500000 }, facilities: facilities.premium },
  { name: 'Community Secondary School, Ibeju', address: 'Ibeju, Lagos', lga: 'Ibeju-Lekki', city: 'Ibeju', fees: { tuition: 75000 }, facilities: facilities.standard },
  { name: 'Salvation Army Secondary School, Ibeju', address: 'Ibeju-Lekki, Lagos', lga: 'Ibeju-Lekki', city: 'Ibeju', fees: { tuition: 85000 }, facilities: facilities.faithBased },
  { name: 'Progressive Secondary School, Lekki', address: 'Lekki, Lagos', lga: 'Ibeju-Lekki', city: 'Lekki', fees: { tuition: 300000 }, facilities: facilities.premium },
  { name: 'Future Leaders Academy, Ibeju-Lekki', address: 'Ibeju-Lekki, Lagos', lga: 'Ibeju-Lekki', city: 'Ibeju', fees: { tuition: 200000 }, facilities: facilities.midplus },
  { name: 'Al-Nur Islamic High School, Ibeju', address: 'Ibeju-Lekki, Lagos', lga: 'Ibeju-Lekki', city: 'Ibeju', fees: { tuition: 80000 }, facilities: facilities.islamic },

  // ─── OJO ──────────────────────────────────────────────────
  { name: 'Ojo High School', address: 'Ojo, Lagos', lga: 'Ojo', city: 'Ojo', fees: { tuition: 95000 }, facilities: facilities.mid },
  { name: 'Lagos State Model College, Ojo', address: 'Ojo, Lagos', lga: 'Ojo', city: 'Ojo', fees: { tuition: 110000 }, facilities: facilities.midplus },
  { name: 'Ojo Grammar School', address: 'Ojo, Lagos', lga: 'Ojo', city: 'Ojo', fees: { tuition: 90000 }, facilities: facilities.standard },
  { name: 'St. Augustine\'s Secondary School, Ojo', address: 'Ojo, Lagos', lga: 'Ojo', city: 'Ojo', fees: { tuition: 130000 }, facilities: facilities.faithBased },
  { name: 'Naval College, Ojo', address: 'Ojo, Lagos', lga: 'Ojo', city: 'Ojo', fees: { tuition: 250000 }, facilities: facilities.premium },
  { name: 'Alimosho Grammar School, Ojo', address: 'Ojo, Lagos', lga: 'Ojo', city: 'Ojo', fees: { tuition: 95000 }, facilities: facilities.standard },
  { name: 'Community Secondary School, Ojo', address: 'Ojo, Lagos', lga: 'Ojo', city: 'Ojo', fees: { tuition: 80000 }, facilities: facilities.standard },
  { name: 'Calvary Secondary School, Ojo', address: 'Ojo, Lagos', lga: 'Ojo', city: 'Ojo', fees: { tuition: 120000 }, facilities: facilities.faithBased },
  { name: 'Green Valley Secondary School, Ojo', address: 'Ojo, Lagos', lga: 'Ojo', city: 'Ojo', fees: { tuition: 140000 }, facilities: facilities.midplus },

  // ─── LAGOS ISLAND ─────────────────────────────────────────
  { name: 'Methodist Girls High School, Lagos', address: 'Lagos Island, Lagos', lga: 'Lagos Island', city: 'Lagos Island', fees: { tuition: 180000 }, facilities: facilities.faithBased },
  { name: 'CMS Grammar School, Lagos', address: 'Lagos Island, Lagos', lga: 'Lagos Island', city: 'Lagos Island', fees: { tuition: 200000 }, facilities: facilities.faithBased },
  { name: 'Lagos Island Girls Grammar School', address: 'Lagos Island, Lagos', lga: 'Lagos Island', city: 'Lagos Island', fees: { tuition: 130000 }, facilities: facilities.mid },
  { name: 'Islamic Mission Grammar School, Lagos', address: 'Lagos Island, Lagos', lga: 'Lagos Island', city: 'Lagos Island', fees: { tuition: 100000 }, facilities: facilities.islamic },
  { name: 'Holy Cross College, Lagos', address: 'Lagos Island, Lagos', lga: 'Lagos Island', city: 'Lagos Island', fees: { tuition: 200000 }, facilities: facilities.faithBased },
  { name: 'Ahmadiyya Grammar School, Lagos Island', address: 'Lagos Island, Lagos', lga: 'Lagos Island', city: 'Lagos Island', fees: { tuition: 100000 }, facilities: facilities.islamic },
  { name: 'Lagos Island Secondary School', address: 'Lagos Island, Lagos', lga: 'Lagos Island', city: 'Lagos Island', fees: { tuition: 110000 }, facilities: facilities.mid },
  { name: 'Ansar-Ud-Deen College, Lagos Island', address: 'Lagos Island, Lagos', lga: 'Lagos Island', city: 'Lagos Island', fees: { tuition: 100000 }, facilities: facilities.islamic },
  { name: 'De Wisdom International School, Lagos Island', address: 'Lagos Island, Lagos', lga: 'Lagos Island', city: 'Lagos Island', fees: { tuition: 200000 }, facilities: facilities.midplus },
  { name: 'St. Thomas Aquinas College, Lagos Island', address: 'Lagos Island, Lagos', lga: 'Lagos Island', city: 'Lagos Island', fees: { tuition: 170000 }, facilities: facilities.faithBased },

  // ─── LAGOS MAINLAND ───────────────────────────────────────
  { name: 'Igbobi College', address: 'Yaba, Lagos', lga: 'Lagos Mainland', city: 'Yaba', fees: { tuition: 200000 }, facilities: facilities.premium },
  { name: 'Yaba College, Lagos', address: 'Yaba, Lagos', lga: 'Lagos Mainland', city: 'Yaba', fees: { tuition: 150000 }, facilities: facilities.midplus },
  { name: 'Ebun Secondary School, Yaba', address: 'Yaba, Lagos', lga: 'Lagos Mainland', city: 'Yaba', fees: { tuition: 130000 }, facilities: facilities.mid },
  { name: 'St. Finbarr\'s College, Yaba', address: 'Yaba, Lagos', lga: 'Lagos Mainland', city: 'Yaba', fees: { tuition: 180000 }, facilities: facilities.faithBased },
  { name: 'Lagos Mainland Senior High School', address: 'Yaba, Lagos', lga: 'Lagos Mainland', city: 'Yaba', fees: { tuition: 120000 }, facilities: facilities.mid },
  { name: 'Our Lady of Apostles Secondary School', address: 'Yaba, Lagos', lga: 'Lagos Mainland', city: 'Yaba', fees: { tuition: 200000 }, facilities: facilities.faithBased },
  { name: 'Ribadu Secondary School', address: 'Yaba, Lagos', lga: 'Lagos Mainland', city: 'Yaba', fees: { tuition: 110000 }, facilities: facilities.mid },
  { name: 'Eko Secondary School, Lagos', address: 'Lagos Mainland, Lagos', lga: 'Lagos Mainland', city: 'Lagos Mainland', fees: { tuition: 100000 }, facilities: facilities.mid },
  { name: 'Remo Secondary School, Yaba', address: 'Yaba, Lagos', lga: 'Lagos Mainland', city: 'Yaba', fees: { tuition: 110000 }, facilities: facilities.mid },
  { name: 'Anwar-Ul-Islam Secondary School', address: 'Lagos Mainland, Lagos', lga: 'Lagos Mainland', city: 'Lagos Mainland', fees: { tuition: 95000 }, facilities: facilities.islamic },
  { name: 'Western Boys High School', address: 'Lagos Mainland, Lagos', lga: 'Lagos Mainland', city: 'Lagos Mainland', fees: { tuition: 130000 }, facilities: facilities.mid },
  { name: 'Government College, Lagos', address: 'Lagos Mainland, Lagos', lga: 'Lagos Mainland', city: 'Lagos Mainland', fees: { tuition: 150000 }, facilities: facilities.midplus },
];

const seedLagosSchools = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    let inserted = 0;
    let skipped = 0;

    for (const school of lagosSchools) {
      const exists = await School.findOne({
        name: new RegExp(`^${school.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
        lga: new RegExp(`^${school.lga.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
      });

      if (exists) {
        console.log(`⏭  Skipped (exists): ${school.name}`);
        skipped++;
        continue;
      }

      const slug =
        slugify(school.name, { lower: true, strict: true }) +
        '-' +
        Date.now() +
        '-' +
        Math.floor(Math.random() * 1000);

      await School.create({
        ...school,
        state: 'Lagos',
        country: 'Nigeria',
        type: 'private',
        level: 'secondary',
        status: 'approved',
        curriculum: ['WAEC'],
        slug,
      });

      console.log(`✅ Inserted: ${school.name}`);
      inserted++;
    }

    console.log(`\n✅ Done! Inserted: ${inserted} | Skipped (already in DB): ${skipped}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
};

seedLagosSchools();
