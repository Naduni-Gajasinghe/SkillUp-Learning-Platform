import { Navigate, Route, Routes } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import LearnerDashboardPage from '../pages/LearnerDashboardPage';
import LessonsPage from '../pages/LessonsPage';
import LessonDetailsPage from '../pages/LessonDetailsPage';
import LearnerBookingsPage from '../pages/LearnerBookingsPage';
import LearnerSubmissionsPage from '../pages/LearnerSubmissionsPage';
import LearnerGamificationPage from '../pages/LearnerGamificationPage';
import ProfilePage from '../pages/ProfilePage';
import BecomeTutorPage from '../pages/BecomeTutorPage';
import TutorDashboardPage from '../pages/TutorDashboardPage';
import TutorLessonsPage from '../pages/TutorLessonsPage';
import TutorBookingsPage from '../pages/TutorBookingsPage';
import TutorReviewsPage from '../pages/TutorReviewsPage';
import TutorAnalyticsPage from '../pages/TutorAnalyticsPage';
import AdminDashboardPage from '../pages/AdminDashboardPage';
import NotFoundPage from '../pages/NotFoundPage';
import ProtectedRoute from '../routes/ProtectedRoute';
import RoleRedirect from '../routes/RoleRedirect';

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/app" element={<RoleRedirect />} />

      <Route element={<ProtectedRoute allowedRoles={['LEARNER']} />}>
        <Route element={<DashboardLayout role="learner" />}>
          <Route path="/learner/dashboard" element={<LearnerDashboardPage />} />
          <Route path="/learner/profile" element={<ProfilePage />} />
          <Route path="/learner/lessons" element={<LessonsPage />} />
          <Route path="/learner/lessons/:id" element={<LessonDetailsPage />} />
          <Route path="/learner/bookings" element={<LearnerBookingsPage />} />
          <Route path="/learner/submissions" element={<LearnerSubmissionsPage />} />
          <Route path="/learner/gamification" element={<LearnerGamificationPage />} />
          <Route path="/learner/become-tutor" element={<BecomeTutorPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['TUTOR']} />}>
        <Route element={<DashboardLayout role="tutor" />}>
          <Route path="/tutor/dashboard" element={<TutorDashboardPage />} />
          <Route path="/tutor/profile" element={<ProfilePage />} />
          <Route path="/tutor/lessons" element={<TutorLessonsPage />} />
          <Route path="/tutor/bookings" element={<TutorBookingsPage />} />
          <Route path="/tutor/reviews" element={<TutorReviewsPage />} />
          <Route path="/tutor/analytics" element={<TutorAnalyticsPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route element={<DashboardLayout role="admin" />}>
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
      <Route path="/home" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
