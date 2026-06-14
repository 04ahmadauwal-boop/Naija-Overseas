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
    </div>
  );
}
