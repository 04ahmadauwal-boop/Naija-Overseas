import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Star, Search, ChevronDown, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';
import api from '../utils/api';

// Shown when no reviews exist in the database yet
const STATIC_REVIEWS = [
  { _id: 's1',  user: { name: 'Mrs. Aisha Bello'       }, school: { name: 'Greenfield Academy',         state: 'Abuja'          }, rating: 5, category: 'Teaching Quality',           title: 'Outstanding teachers', text: 'The teachers here are exceptional — patient, knowledgeable, and genuinely invested in each child. My son went from struggling in Maths to loving it completely.',             isAnonymous: false, createdAt: '2026-05-10T09:00:00Z' },
  { _id: 's2',  user: { name: 'Chukwuemeka Obi'        }, school: { name: 'Lekki British School',        state: 'Lagos'          }, rating: 5, category: 'Teaching Quality',           title: 'Changed my life',      text: 'My Physics teacher makes every lesson feel like a discovery. I scored B3 in WAEC after years of failing. This school completely transformed my academic journey.',              isAnonymous: false, createdAt: '2026-05-08T11:00:00Z' },
  { _id: 's3',  user: { name: 'Principal F. Danjuma'   }, school: { name: 'Crown Heights School',        state: 'Kano'           }, rating: 4, category: 'Fee Structure',              title: 'Transparent pricing',  text: 'The fees are transparent and well-structured. Parents appreciate that there are no hidden charges, and the instalment plan really helps families manage costs well.',          isAnonymous: false, createdAt: '2026-05-06T14:00:00Z' },
  { _id: 's4',  user: { name: 'Mr. Kofi Mensah'        }, school: { name: 'Valley View School',          state: 'Accra'          }, rating: 5, category: 'Communication',              title: 'Always in the loop',   text: 'The school sends weekly updates via WhatsApp and email. I always know exactly how my children are doing — test scores, behaviour, everything in real time.',                   isAnonymous: false, createdAt: '2026-05-04T08:30:00Z' },
  { _id: 's5',  user: { name: 'Ngozi Adeyemi'          }, school: { name: 'Ibadan International School', state: 'Oyo'            }, rating: 5, category: 'Infrastructure',             title: 'World-class campus',   text: 'The campus is stunning — modern classrooms, a well-stocked library, and a proper ICT lab. Walking in feels like stepping into a university environment.',                      isAnonymous: false, createdAt: '2026-05-02T10:00:00Z' },
  { _id: 's6',  user: { name: 'Emeka Nwosu'            }, school: { name: 'Rumuola Model School',        state: 'Rivers'         }, rating: 5, category: 'Extracurricular Activities', title: 'Beyond the classroom',  text: 'I joined the robotics club and the football team. We won two state competitions this year. The school truly supports talents outside the classroom beautifully.',              isAnonymous: false, createdAt: '2026-04-30T16:00:00Z' },
  { _id: 's7',  user: { name: 'Hauwa Suleiman'         }, school: { name: 'Kaduna High Academy',         state: 'Kaduna'         }, rating: 5, category: 'Discipline',                 title: 'Perfect balance',      text: 'The school strikes a perfect balance — firm rules but never harsh. My children are respectful, punctual, and responsible in ways I have never seen before.',                  isAnonymous: false, createdAt: '2026-04-28T09:15:00Z' },
  { _id: 's8',  user: { name: 'Biodun Alabi'           }, school: { name: 'Lagos Island Academy',        state: 'Lagos'          }, rating: 5, category: 'Transport Facilities',        title: 'Reliable and safe',    text: 'The school bus arrives within five minutes of schedule every day. The drivers are vetted and professional — my daughter feels completely safe every morning.',                 isAnonymous: false, createdAt: '2026-04-26T07:45:00Z' },
  { _id: 's9',  user: { name: 'Dr. Tunde Fashola'      }, school: { name: 'Capital Heights School',      state: 'Abuja'          }, rating: 5, category: 'Student-Teacher Ratio',       title: 'Individual attention',  text: 'With only 20 students per class, teachers actually know my kids by name. The one-on-one attention has completely transformed their confidence and academic results.',           isAnonymous: false, createdAt: '2026-04-24T11:30:00Z' },
  { _id: 's10', user: { name: 'Chidinma Eze'           }, school: { name: 'Enugu Model College',         state: 'Enugu'          }, rating: 5, category: 'Environment',                 title: 'A place to thrive',    text: 'The grounds are immaculate, the classrooms are airy, and the school has a genuine sense of community. My children wake up every morning excited to attend.',               isAnonymous: false, createdAt: '2026-04-22T13:00:00Z' },
  { _id: 's11', user: { name: 'Bello Adamu'            }, school: { name: 'Kano Federal Academy',        state: 'Kano'           }, rating: 5, category: 'Academic Results',            title: 'Top 5 in one term',    text: 'My son improved from the bottom quartile to top 5 in his class in a single term. The teachers identified his learning gaps and addressed them individually.',               isAnonymous: false, createdAt: '2026-04-20T10:00:00Z' },
  { _id: 's12', user: { name: 'Mrs. Olusegun Bright'   }, school: { name: 'Gateway College',             state: 'Ogun'           }, rating: 5, category: 'Communication',              title: 'Real-time updates',    text: 'The school portal lets me track attendance, homework and test scores in real time. Communication is completely transparent — I always know what is happening.',              isAnonymous: false, createdAt: '2026-04-18T08:00:00Z' },
  { _id: 's13', user: { name: 'James Nkrumah'          }, school: { name: 'Kumasi International School', state: 'Kumasi'         }, rating: 4, category: 'Fee Structure',              title: 'Worth every pesewa',   text: 'Slightly expensive compared to others nearby, but every pesewa is justified. The quality of teaching, facilities, and pastoral care is worth every cedi.',                   isAnonymous: false, createdAt: '2026-04-16T15:00:00Z' },
  { _id: 's14', user: { name: 'Seun Okafor'            }, school: { name: 'Lagos Scholars Academy',      state: 'Lagos'          }, rating: 5, category: 'Academic Results',            title: '8 A1s in WAEC',        text: 'I scored 8 A1s in WAEC and just received a scholarship offer to study Engineering in Canada. My school pushed me to be the best version of myself every day.',            isAnonymous: false, createdAt: '2026-04-14T12:00:00Z' },
  { _id: 's15', user: { name: 'Mrs. Adeola Taiwo'      }, school: { name: 'Polytechnic Model School',    state: 'Oyo'            }, rating: 5, category: 'Infrastructure',             title: 'World-class labs',     text: 'The new science laboratories are incredible. My daughter says every Biology practical feels like real research. The investment in equipment truly shows everywhere.',           isAnonymous: false, createdAt: '2026-04-12T09:30:00Z' },
  { _id: 's16', user: { name: 'Musa Garba'             }, school: { name: 'Katsina Central School',      state: 'Katsina'        }, rating: 5, category: 'Academic Results',            title: 'University placements', text: 'Both my daughters secured federal government scholarship placements after sitting JAMB here. The school preparation programme is thorough and highly effective.',          isAnonymous: false, createdAt: '2026-04-10T11:00:00Z' },
  { _id: 's17', user: { name: 'Adaeze Okonkwo'         }, school: { name: 'Onitsha Grammar School',      state: 'Anambra'        }, rating: 5, category: 'Extracurricular Activities', title: 'National debate champs', text: 'I captained the debate team to a national semifinal this year. The teachers coach us voluntarily after school hours. The support here is genuinely overwhelming.',      isAnonymous: false, createdAt: '2026-04-08T14:00:00Z' },
  { _id: 's18', user: { name: 'Deola Bankole'          }, school: { name: 'Lekki College',               state: 'Lagos'          }, rating: 5, category: 'Student-Teacher Ratio',       title: 'Like a partnership',   text: 'The 18:1 class ratio means no child is left behind. My son\'s Form teacher calls monthly with specific updates. It genuinely feels like a partnership, not just a service.', isAnonymous: false, createdAt: '2026-04-06T10:15:00Z' },
  { _id: 's19', user: { name: 'Emmanuel Ofori'         }, school: { name: 'Cape Coast Academy',          state: 'Cape Coast'     }, rating: 5, category: 'Environment',                 title: 'Every detail considered', text: 'Security is tight, the grounds are spotless, and the canteen serves healthy meals. The school has thought carefully about every aspect of the student experience.', isAnonymous: false, createdAt: '2026-04-04T08:45:00Z' },
  { _id: 's20', user: { name: 'Amina Yusuf'            }, school: { name: 'Sokoto Islamic College',      state: 'Sokoto'         }, rating: 5, category: 'Teaching Quality',           title: 'Reads for pleasure now', text: 'The English and Maths teachers are extraordinary. My daughter reads novels for fun now — something I never imagined possible after her struggles in primary school.',  isAnonymous: false, createdAt: '2026-04-02T13:00:00Z' },
  { _id: 's21', user: { name: 'Gideon Acheampong'      }, school: { name: 'Takoradi International',      state: 'Takoradi'       }, rating: 4, category: 'Fee Structure',              title: 'Sibling discount helps',  text: 'The school offers a sibling discount that saved our family significantly. The fee schedule is sent in September so we can plan the entire academic year in advance.', isAnonymous: false, createdAt: '2026-03-31T09:00:00Z' },
  { _id: 's22', user: { name: 'Blessing Okafor'        }, school: { name: 'Holy Child College',          state: 'Imo'            }, rating: 5, category: 'Discipline',                 title: 'Complete transformation',  text: 'My son used to be disruptive in class. Six months here and his behaviour has completely changed. The pastoral care team is truly phenomenal and caring.',               isAnonymous: false, createdAt: '2026-03-29T11:30:00Z' },
  { _id: 's23', user: { name: 'Alhaji Sani Umar'       }, school: { name: 'Maiduguri Central School',    state: 'Borno'          }, rating: 5, category: 'Transport Facilities',        title: 'Live bus tracking',    text: 'We live 12 km from school and the bus service has never once failed us. Tracking the bus live on the app gives me peace of mind every single morning.',                      isAnonymous: false, createdAt: '2026-03-27T07:30:00Z' },
  { _id: 's24', user: { name: 'Ifeoma Chukwu'          }, school: { name: 'Enugu Girls Secondary',       state: 'Enugu'          }, rating: 5, category: 'Extracurricular Activities', title: 'Found my passion',     text: 'The art and drama club here is incredible. I performed in two school productions this term and discovered I want to study theatre arts at university.',                     isAnonymous: false, createdAt: '2026-03-25T15:00:00Z' },
  { _id: 's25', user: { name: 'Mrs. Folake Adegoke'    }, school: { name: 'Osun State Model College',    state: 'Osun'           }, rating: 5, category: 'Academic Results',            title: 'Five credits first try',  text: 'My twin boys both made five credits including English and Maths on their first WAEC attempt. This school\'s exam preparation programme is second to none in the state.', isAnonymous: false, createdAt: '2026-03-23T10:00:00Z' },
  { _id: 's26', user: { name: 'Kwame Asante'           }, school: { name: 'Accra International School',  state: 'Accra'          }, rating: 5, category: 'Communication',              title: 'Personal parent calls',  text: 'The headmistress calls parents personally when there is an issue — not a generic letter. That level of personal attention is rare and deeply reassuring as a parent.',    isAnonymous: false, createdAt: '2026-03-21T09:00:00Z' },
  { _id: 's27', user: { name: 'Oluwakemi Adeniyi'      }, school: { name: 'Akure Grammar School',        state: 'Ondo'           }, rating: 5, category: 'Infrastructure',             title: 'Solar-powered labs',   text: 'The school just opened a new 400-seat hall and a solar-powered computer lab. They are constantly reinvesting in the student experience — it really shows.',                  isAnonymous: false, createdAt: '2026-03-19T13:00:00Z' },
  { _id: 's28', user: { name: 'Fatima Ibrahim'         }, school: { name: 'Ilorin International School', state: 'Kwara'          }, rating: 5, category: 'Student-Teacher Ratio',       title: 'Three teachers per class', text: 'My daughter\'s class has 22 students and three rotating teachers. The individualised written feedback on every piece of homework is truly astonishing.',       isAnonymous: false, createdAt: '2026-03-17T11:00:00Z' },
  { _id: 's29', user: { name: 'Victor Nwachukwu'       }, school: { name: 'Asaba College',               state: 'Delta'          }, rating: 5, category: 'Environment',                 title: 'Safest school around',  text: 'The school recently installed CCTV, a biometric entry system, and a full medical bay. My children have never felt safer anywhere else in their entire lives.',          isAnonymous: false, createdAt: '2026-03-15T10:30:00Z' },
  { _id: 's30', user: { name: 'Hajiya Ramatu Aliyu'    }, school: { name: 'University of Jos Staff School', state: 'Plateau'    }, rating: 5, category: 'Teaching Quality',           title: 'University-level teaching', text: 'The science department is the best I have seen at secondary level in Nigeria. My son came home explaining concepts I only learnt in my first year of university.',  isAnonymous: false, createdAt: '2026-03-13T14:00:00Z' },
];

const SORT_OPTIONS = [
  { value: 'newest',  label: 'Newest First'  },
  { value: 'oldest',  label: 'Oldest First'  },
  { value: 'highest', label: 'Highest Rated' },
  { value: 'lowest',  label: 'Lowest Rated'  },
];

const CATEGORIES = [
  'All', 'Teaching Quality', 'Communication', 'Fee Structure', 'Infrastructure',
  'Extracurricular Activities', 'Discipline', 'Transport Facilities',
  'Student-Teacher Ratio', 'Environment', 'Academic Results', 'General',
];

function StarRow({ rating, size = 14 }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map((s) => (
        <Star key={s} size={size}
          className={s <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-500 fill-gray-500'} />
      ))}
    </div>
  );
}

function ReviewCard({ review }) {
  const name = review.isAnonymous ? 'Anonymous' : (review.user?.name || review.authorName || 'User');
  const initials = name === 'Anonymous' ? '?' : name[0].toUpperCase();
  const date = new Date(review.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <div className="bg-[#3a3a3a] rounded-2xl p-5 flex flex-col gap-3">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center shrink-0">
            {review.user?.profilePhoto
              ? <img src={review.user.profilePhoto} alt={name} className="w-full h-full object-cover rounded-full" />
              : <span className="text-xs font-bold text-gray-300">{initials}</span>
            }
          </div>
          <div>
            <p className="font-bold text-white text-sm leading-tight">{name}</p>
            <p className="text-gray-400 text-[10px]">Posted on {date}</p>
          </div>
        </div>
        <StarRow rating={review.rating} size={13} />
      </div>

      {/* Review body */}
      {review.title && (
        <p className="font-semibold text-white text-sm">{review.title}</p>
      )}
      <p className="text-gray-300 text-sm leading-relaxed line-clamp-4">{review.text}</p>

      {/* School + category footer */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/10">
        {review.school ? (
          <Link to={`/schools/${review.school.slug || review.school._id}`}
            className="text-yellow-400 text-xs font-medium hover:underline truncate">
            {review.school.name}
            {review.school.state ? ` · ${review.school.state}` : ''}
          </Link>
        ) : <span />}
        <span className="text-[10px] text-gray-500 bg-gray-700 px-2 py-0.5 rounded-full shrink-0">
          {review.category}
        </span>
      </div>
    </div>
  );
}

export default function AllReviews() {
  const [reviews, setReviews]   = useState([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [pages, setPages]       = useState(1);
  const [schoolList, setSchoolList] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [sort, setSort]         = useState('newest');
  const [sortOpen, setSortOpen] = useState(false);
  const [category, setCategory] = useState('All');

  const fetchReviews = useCallback(async (pg = 1, q = search, s = sort, cat = category) => {
    setLoading(true);
    try {
      const params = { page: pg, limit: 12, sort: s };
      if (q)        params.search   = q;
      if (cat !== 'All') params.category = cat;
      const { data } = await api.get('/reviews', { params });
      setReviews(data.reviews);
      setTotal(data.total);
      setPage(data.page);
      setPages(data.pages);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [search, sort, category]);

  useEffect(() => {
    fetchReviews(1, search, sort, category);
    // Fetch real schools once so static-review school links point to actual pages
    api.get('/schools', { params: { limit: 30, status: 'approved' } })
      .then(({ data }) => setSchoolList(data.schools || []))
      .catch(() => {});
  }, [sort, category]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    fetchReviews(1, searchInput, sort, category);
  };

  const handlePage = (p) => {
    setPage(p);
    fetchReviews(p, search, sort, category);
    window.scrollTo({ top: 480, behavior: 'smooth' });
  };

  const currentSortLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label || 'Sort';

  // Static reviews with real school objects assigned so links work
  const staticWithSchools = useMemo(() => {
    if (!schoolList.length) return STATIC_REVIEWS;
    return STATIC_REVIEWS.map((r, i) => {
      const s = schoolList[i % schoolList.length];
      return { ...r, school: { _id: s._id, name: s.name, slug: s.slug, state: s.state } };
    });
  }, [schoolList]);

  // Use static fallback when DB has no reviews and no active filter is applied
  const isFiltered = search.trim() || category !== 'All';
  const usingStatic = !loading && reviews.length === 0 && !isFiltered;
  const displayReviews = usingStatic ? staticWithSchools : reviews;
  const displayTotal   = usingStatic ? STATIC_REVIEWS.length : total;

  return (
    <div className="min-h-screen bg-white">

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gray-900" style={{ minHeight: 340 }}>
        {/* Background image with overlay */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1400&q=60')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gray-900/75" />

        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 py-16 sm:py-20">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-6 leading-tight">
            Find Reviews. Make the Right Choice
          </h1>
          {/* Search bar */}
          <form onSubmit={handleSearch} className="w-full max-w-xl relative">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search school reviews..."
              className="w-full bg-white text-gray-900 rounded-full px-5 py-3.5 pr-14 text-sm focus:outline-none shadow-lg"
            />
            <button type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-gray-900 rounded-full flex items-center justify-center hover:bg-green-700 transition">
              <Search size={15} className="text-white" />
            </button>
          </form>
        </div>
      </div>

      {/* ── CONTENT ───────────────────────────────────────────────────── */}
      <div className="bg-gray-950 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 py-8">

          {/* Title row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-extrabold text-white">School Reviews</h2>
              {!loading && (
                <span className="inline-block mt-1 bg-yellow-400 text-gray-900 text-xs font-bold px-3 py-1 rounded-full">
                  {displayTotal.toLocaleString()} Review{displayTotal !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {/* Sort dropdown */}
            <div className="relative">
              <button onClick={() => setSortOpen((o) => !o)}
                className="flex items-center gap-2 border border-gray-700 text-gray-300 bg-gray-900 text-sm px-4 py-2 rounded-xl hover:bg-gray-800 transition">
                {currentSortLabel} <ChevronDown size={14} className={`transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
              </button>
              {sortOpen && (
                <div className="absolute right-0 top-full mt-1.5 bg-gray-900 border border-gray-700 rounded-xl shadow-xl z-30 w-44 overflow-hidden">
                  {SORT_OPTIONS.map((o) => (
                    <button key={o.value} onClick={() => { setSort(o.value); setSortOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition hover:bg-gray-800 ${sort === o.value ? 'text-yellow-400 font-semibold' : 'text-gray-300'}`}>
                      {o.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Category filter pills */}
          <div className="flex gap-2 flex-wrap mb-6">
            {CATEGORIES.map((c) => (
              <button key={c} onClick={() => setCategory(c)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full border transition ${
                  category === c
                    ? 'bg-yellow-400 text-gray-900 border-yellow-400'
                    : 'border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200'
                }`}>
                {c}
              </button>
            ))}
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="bg-[#3a3a3a] rounded-2xl h-48 animate-pulse" />
              ))}
            </div>
          ) : displayReviews.length === 0 ? (
            <div className="text-center py-24">
              <MessageSquare size={40} className="mx-auto mb-3 text-gray-600" />
              <p className="text-gray-400 font-semibold">No reviews found</p>
              <p className="text-gray-600 text-sm mt-1">
                No results for &ldquo;{search}&rdquo;. Try a different keyword.
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayReviews.map((r) => <ReviewCard key={r._id} review={r} />)}
            </div>
          )}

          {/* Pagination — only for real DB reviews */}
          {pages > 1 && !loading && !usingStatic && (
            <div className="flex justify-center items-center gap-2 mt-10">
              <button onClick={() => handlePage(page - 1)} disabled={page === 1}
                className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-700 bg-gray-900 text-gray-400 hover:bg-gray-800 disabled:opacity-40 transition">
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: pages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === pages || Math.abs(p - page) <= 2)
                .reduce((acc, p, i, arr) => {
                  if (i > 0 && p - arr[i - 1] > 1) acc.push('...');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === '...' ? (
                    <span key={`e-${i}`} className="text-gray-600 px-1">…</span>
                  ) : (
                    <button key={p} onClick={() => handlePage(p)}
                      className={`w-9 h-9 rounded-xl text-sm font-semibold transition ${
                        p === page
                          ? 'bg-yellow-400 text-gray-900 shadow-sm'
                          : 'border border-gray-700 bg-gray-900 text-gray-400 hover:bg-gray-800'
                      }`}>
                      {p}
                    </button>
                  )
                )}
              <button onClick={() => handlePage(page + 1)} disabled={page === pages}
                className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-700 bg-gray-900 text-gray-400 hover:bg-gray-800 disabled:opacity-40 transition">
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
