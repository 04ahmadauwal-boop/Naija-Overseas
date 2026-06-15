import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home from './pages/Home';
import SchoolDetail from './pages/SchoolDetail';
import Compare from './pages/Compare';
import StudyAbroad from './pages/StudyAbroad';
import StudyAbroadCountry from './pages/StudyAbroadCountry';
import ListYourSchool from './pages/ListYourSchool';
import About from './pages/About';
import Contact from './pages/Contact';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import SetPassword from './pages/auth/SetPassword';
import VerifyEmail from './pages/auth/VerifyEmail';
import Dashboard from './pages/admin/Dashboard';
import ManageSchools from './pages/admin/ManageSchools';
import ManageBookings from './pages/admin/ManageBookings';
import ManageApplications from './pages/admin/ManageApplications';
import ManageBlog from './pages/admin/ManageBlog';
import ManageMessages from './pages/admin/ManageMessages';
import ManageUsers from './pages/admin/ManageUsers';
import ManageTutors from './pages/admin/ManageTutors';
import StudentDashboard from './pages/dashboard/StudentDashboard';
import ParentDashboard from './pages/dashboard/ParentDashboard';
import SchoolOwnerDashboard from './pages/dashboard/SchoolOwnerDashboard';
import TutorDashboard from './pages/dashboard/TutorDashboard';
import LearningDashboard from './pages/dashboard/LearningDashboard';
import FindTutoring from './pages/FindTutoring';
import TutorDetail from './pages/TutorDetail';
import BecomeTutor from './pages/BecomeTutor';
import StudentOnboarding from './pages/StudentOnboarding';
import GoClass from './pages/GoClass';
import StateSchools from './pages/StateSchools';
import Videos from './pages/Videos';
import ManageVideos from './pages/admin/ManageVideos';
import ManageReviews from './pages/admin/ManageReviews';
import ManageBanner from './pages/admin/ManageBanner';
import ManageCoupons from './pages/admin/ManageCoupons';
import AllReviews from './pages/AllReviews';
import BookSession from './pages/schedule/BookSession';
import SchedulePage from './pages/schedule/SchedulePage';
import SubscribePage from './pages/schedule/SubscribePage';

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen text-gray-500">Loading...</div>;
  if (!user || user.role !== 'admin') return <Navigate to="/login" />;
  return children;
}

function DashboardRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen text-gray-500">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (user.role !== role) return <Navigate to="/" />;
  return children;
}

function TutorRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen text-gray-500">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
}

function LearningRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen text-gray-500">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  // Study-abroad-only students cannot access the learning hub
  if (user.role === 'student' && user.goal === 'study-abroad') return <Navigate to="/dashboard/student" />;
  return children;
}

export default function App() {
  const location = useLocation();
  const isShellless = location.pathname.startsWith('/admin') || location.pathname.startsWith('/dashboard') || location.pathname === '/dashboard/tutor' || location.pathname === '/student-onboarding' || location.pathname.startsWith('/classroom') || location.pathname.startsWith('/learning') || location.pathname.startsWith('/schedule') || location.pathname.startsWith('/book/') || location.pathname.startsWith('/subscribe/');

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {!isShellless && <Navbar />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/study-abroad" element={<StudyAbroad />} />
          <Route path="/study-abroad/:countrySlug" element={<StudyAbroadCountry />} />
          <Route path="/list-your-school" element={<ListYourSchool />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/schools/state/:state" element={<StateSchools />} />
          <Route path="/videos" element={<Videos />} />
          <Route path="/reviews" element={<AllReviews />} />
          <Route path="/schools/:identifier" element={<SchoolDetail />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/set-password/:token" element={<SetPassword />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
          <Route path="/find-tutoring" element={<FindTutoring />} />
          <Route path="/tutors/:id" element={<TutorDetail />} />
          <Route path="/become-a-tutor" element={<BecomeTutor />} />
          <Route path="/student-onboarding" element={<TutorRoute><StudentOnboarding /></TutorRoute>} />
          <Route path="/classroom/:roomId" element={<TutorRoute><GoClass /></TutorRoute>} />

          <Route path="/admin" element={<AdminRoute><Dashboard /></AdminRoute>} />
          <Route path="/admin/schools" element={<AdminRoute><ManageSchools /></AdminRoute>} />
          <Route path="/admin/bookings" element={<AdminRoute><ManageBookings /></AdminRoute>} />
          <Route path="/admin/applications" element={<AdminRoute><ManageApplications /></AdminRoute>} />
          <Route path="/admin/blog" element={<AdminRoute><ManageBlog /></AdminRoute>} />
          <Route path="/admin/messages" element={<AdminRoute><ManageMessages /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><ManageUsers /></AdminRoute>} />
          <Route path="/admin/tutors" element={<AdminRoute><ManageTutors /></AdminRoute>} />
          <Route path="/admin/videos" element={<AdminRoute><ManageVideos /></AdminRoute>} />
          <Route path="/admin/reviews" element={<AdminRoute><ManageReviews /></AdminRoute>} />
          <Route path="/admin/banner" element={<AdminRoute><ManageBanner /></AdminRoute>} />
          <Route path="/admin/coupons" element={<AdminRoute><ManageCoupons /></AdminRoute>} />

          <Route path="/dashboard/student" element={<DashboardRoute role="student"><StudentDashboard /></DashboardRoute>} />
          <Route path="/dashboard/parent" element={<DashboardRoute role="parent"><ParentDashboard /></DashboardRoute>} />
          <Route path="/dashboard/school-owner" element={<DashboardRoute role="school-owner"><SchoolOwnerDashboard /></DashboardRoute>} />
          <Route path="/dashboard/tutor" element={<TutorRoute><TutorDashboard /></TutorRoute>} />

          <Route path="/learning" element={<LearningRoute><LearningDashboard /></LearningRoute>} />

          {/* Public tutor booking page (trial session) */}
          <Route path="/book/:tutorId" element={<BookSession />} />
          {/* Monthly subscription flow */}
          <Route path="/subscribe/:tutorId" element={<SubscribePage />} />
          {/* Tutor schedule management (auth required) */}
          <Route path="/schedule" element={<TutorRoute><SchedulePage /></TutorRoute>} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      {!isShellless && <Footer />}

      {/* ── Fixed WhatsApp Help Button ─────────────────────────────── */}
      <a
        href="https://wa.me/2347065896598"
        target="_blank"
        rel="noreferrer"
        aria-label="Chat with us on WhatsApp"
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-lg hover:scale-110 transition-transform duration-200"
        style={{ backgroundColor: '#25D366' }}
      >
        <svg viewBox="0 0 32 32" width="30" height="30" fill="white" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 0C7.163 0 0 7.163 0 16c0 2.822.737 5.469 2.027 7.773L0 32l8.466-2.001A15.93 15.93 0 0016 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm0 29.333a13.27 13.27 0 01-6.77-1.854l-.486-.29-5.026 1.188 1.232-4.892-.317-.502A13.267 13.267 0 012.667 16C2.667 8.637 8.637 2.667 16 2.667S29.333 8.637 29.333 16 23.363 29.333 16 29.333zm7.273-9.969c-.398-.199-2.355-1.162-2.72-1.295-.365-.133-.631-.199-.897.199-.265.398-1.029 1.295-1.261 1.561-.232.265-.465.298-.863.1-.398-.199-1.681-.619-3.202-1.977-1.184-1.056-1.983-2.36-2.215-2.758-.232-.398-.025-.613.174-.811.179-.178.398-.465.597-.698.199-.232.265-.398.398-.664.133-.265.066-.498-.033-.697-.1-.199-.897-2.162-1.229-2.96-.324-.777-.653-.672-.897-.684l-.764-.013c-.265 0-.697.1-.1063.498-.365.398-1.395 1.362-1.395 3.322 0 1.96 1.428 3.854 1.627 4.12.199.265 2.811 4.292 6.811 6.021.952.411 1.695.656 2.274.84.955.304 1.824.261 2.511.158.766-.114 2.355-.963 2.687-1.893.332-.93.332-1.727.232-1.893-.099-.166-.365-.265-.764-.464z"/>
        </svg>
      </a>
    </div>
  );
}
