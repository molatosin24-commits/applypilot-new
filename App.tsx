import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/HomePage'
import JobsPage from './pages/JobsPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import DashboardPage from './pages/DashboardPage'
import ProfilePage from './pages/ProfilePage'
import SavedJobsPage from './pages/SavedJobsPage'
import TrackerPage from './pages/TrackerPage'
import CvsPage from './pages/CvsPage'
import CvEditorPage from './pages/CvEditorPage'
import CoverLetterPage from './pages/CoverLetterPage'
import TailorPage from './pages/TailorPage'
import InterviewPage from './pages/InterviewPage'
import SafetyPage from './pages/SafetyPage'
import AlertsPage from './pages/AlertsPage'
import PrivacyPage from './pages/PrivacyPage'
import NotFoundPage from './pages/NotFoundPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="jobs" element={<JobsPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
        <Route path="safety" element={<SafetyPage />} />
        <Route path="privacy" element={<PrivacyPage />} />

        <Route path="dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="saved" element={<ProtectedRoute><SavedJobsPage /></ProtectedRoute>} />
        <Route path="tracker" element={<ProtectedRoute><TrackerPage /></ProtectedRoute>} />
        <Route path="cvs" element={<ProtectedRoute><CvsPage /></ProtectedRoute>} />
        <Route path="cv/:id" element={<ProtectedRoute><CvEditorPage /></ProtectedRoute>} />
        <Route path="cover-letters" element={<ProtectedRoute><CoverLetterPage /></ProtectedRoute>} />
        <Route path="tailor" element={<ProtectedRoute><TailorPage /></ProtectedRoute>} />
        <Route path="interview" element={<ProtectedRoute><InterviewPage /></ProtectedRoute>} />
        <Route path="alerts" element={<ProtectedRoute><AlertsPage /></ProtectedRoute>} />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App
