import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import SignUp from './components/SignUp';
import RequireAuth from './components/RequireAuth';
import PublicOnlyRoute from './components/PublicOnlyRoute';
import ComingSoon from './components/ComingSoon';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataCacheProvider } from './contexts/DataCacheContext';
import AdminPlaceholder from './components/AdminPlaceholder';
import LandingPage from './components/LandingPage';
import ChapterDetails from './components/ChapterDetails';
import Tests from './components/Tests';
import TestPage from './components/TestPage';
import TestSubmitted from './components/TestSubmitted';
import TestResult from './components/TestResult';
import TestReview from './components/TestReview';
import Super30 from './components/Super30';
import Pyq2026 from './components/Pyq2026';
import AppLayout from "./components/AppLayout";
import ChapterSelection from './components/ChapterSelection';
import QuestionPractice from './components/QuestionPractice';
import ShiftPractice from './components/ShiftPractice';
import PageSkeleton from './components/PageSkeleton';
import QuestionSet from './components/QuestionSet';
import CondensedPractice from './components/CondensedPractice';
import PricingPlans from './components/PricingPlans';
import ResponseUpload from './components/ResponseUpload';
import ResponseResult from './components/ResponseResult';
import AIPTPage from './components/AIPTPage';
import AIPTAnnouncementModal from './components/AIPTAnnouncementModal';
import Waitlist from './components/Waitlist';
import WaitlistSuccess from './components/WaitlistSuccess';
import RegisterSuccess from './components/RegisterSuccess';
import OrganicQuestion from './components/OrganicQuestion';
import OrganicQuestionList from './components/OrganicQuestionList';
import SingleQuestion from './components/SingleQuestion';
import PrivacyPolicy from './components/PrivacyPolicy';
import DeleteAccount from './components/DeleteAccount';

/**
 * HomeRoute - Handles the root "/" route
 * 
 * Access Rules:
 * - Loading → Show spinner
 * - Not authenticated → Show landing page
 * - Authenticated + free tier → Show landing page
 * - Authenticated + paid tier → Redirect to /dashboard
 */
const HomeRoute: React.FC = () => {
  const { isAuthenticated, isPaidUser, loading } = useAuth();

  if (loading) {
    return (
      <PageSkeleton />
    );
  }

  // Paid users get redirected to question-set
  if (isAuthenticated && isPaidUser) {
    return <Navigate to="/question-set" replace />;
  }

  // Free users get redirected to question-set
  if (isAuthenticated && !isPaidUser) {
    return <Navigate to="/question-set" replace />;
  }

  // Everyone else sees the landing page
  return <LandingPage />;
};

export const AppContent: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const [showAIPTModal, setShowAIPTModal] = useState(false);
  const prevAuthRef = useRef(false);

  // Show AIPT announcement modal when user logs in (every login, not on refresh)
  useEffect(() => {
    if (!loading && isAuthenticated && !prevAuthRef.current) {
      const dismissed = sessionStorage.getItem('aipt_announcement_dismissed');
      if (!dismissed) {
        setShowAIPTModal(true);
        sessionStorage.setItem('aipt_announcement_dismissed', 'true');
      }
    }
    // Clear dismissed flag on logout so it shows again on next login
    if (!loading && !isAuthenticated && prevAuthRef.current) {
      sessionStorage.removeItem('aipt_announcement_dismissed');
    }
    if (!loading) {
      prevAuthRef.current = isAuthenticated;
    }
  }, [isAuthenticated, loading]);

  const handleCloseAIPTModal = () => {
    setShowAIPTModal(false);
  };

  // TEMPORARY: Mocking lite user for verification
  const isLiteUser = true; // subscriptionType?.toLowerCase() === 'lite';

  // Check if user is on a test-taking route (hide sidebar during test)
  // Matches /tests/:testId but not /tests (the list page)
  const isTestRoute = /^\/tests\/[^/]+$/.test(location.pathname);

  // Also hide sidebar on the test-submitted page
  const isTestSubmittedRoute = location.pathname === '/test-submitted';

  // Determine if we should show the sidebar
  // Show sidebar for all authenticated users on protected routes OR on specific public routes for everyone
  // Hide sidebar when user is taking a test or on submission page or waitlist pages
  const isCondensedPracticeRoute = /^\/question-set\/[^/]+\/practice$/.test(location.pathname);
  const isReviewRoute = /^\/review\/[^/]+$/.test(location.pathname);
  const isWaitlistRoute = location.pathname.startsWith('/waitlist');
  const isRegisterSuccessRoute = location.pathname.startsWith('/register-success');
  const isPublicRouteWithSidebar = ['/super30', '/pyq-2026', '/pyq', '/question-set', '/pricing', '/response-upload', '/response-result', '/question', '/questions'].some(path => location.pathname.startsWith(path)) && !isCondensedPracticeRoute && !isWaitlistRoute && !isRegisterSuccessRoute;
  const showSidebar = !loading && (isAuthenticated || isPublicRouteWithSidebar) && !isTestRoute && !isTestSubmittedRoute && !isWaitlistRoute && !isRegisterSuccessRoute && !isReviewRoute;

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative">
      {/* Background layer: color + grid image */}
      <div className="absolute inset-0 bg-background-light dark:bg-background-dark grid-bg-light dark:grid-bg-dark -z-10"></div>
      {/* AIPT Announcement Modal */}
      <AIPTAnnouncementModal isOpen={showAIPTModal} onClose={handleCloseAIPTModal} />
      {showSidebar && <Sidebar />}
      <main className="flex-1 w-full relative flex flex-col min-h-0">
        <Routes>
          <Route element={<AppLayout />}>
            {/* Public routes */}
            <Route path="/" element={<HomeRoute />} />

            {/* Auth routes - only for non-paid users */}
            <Route path="/login" element={
              <PublicOnlyRoute>
                <Login />
              </PublicOnlyRoute>
            } />
            <Route path="/register" element={
              <PublicOnlyRoute>
                <SignUp />
              </PublicOnlyRoute>
            } />

            {/* Protected routes - require IPFT-01-2026 subscription */}
            <Route path="/dashboard" element={
              isLiteUser ? (
                <RequireAuth allowFree>
                  <ComingSoon
                    title="Dashboard for"
                    subtitle="Performance Analytics"
                    message="Detailed performance tracking and analytics coming soon for Lite plan users."
                    highlight="Lite Plan"
                    date="15 March 2025"
                  />
                </RequireAuth>
              ) : (
                <RequireAuth>
                  <Dashboard />
                </RequireAuth>
              )
            } />
            <Route path="/subjects/:subject/:grade/:chapter" element={
              <RequireAuth>
                <ChapterDetails />
              </RequireAuth>
            } />
            <Route path="/admin" element={
              <RequireAuth>
                <AdminPlaceholder />
              </RequireAuth>
            } />
            <Route path="/subjects" element={
              <RequireAuth>
                <ComingSoon />
              </RequireAuth>
            } />
            <Route path="/subjects/:subject/:grade" element={
              <RequireAuth allowFree>
                <ChapterSelection />
              </RequireAuth>
            } />

            {/* Public Access Routes (Guests & Users) */}
            <Route path="/pyq-2026/:subject" element={
              <ChapterSelection />
            } />
            <Route path="/pyq-2026/:subject/practice/:chapterCode" element={
              <QuestionPractice />
            } />
            <Route path="/pyq-2026/shift/practice/:shiftId" element={
              <ShiftPractice />
            } />
            <Route path="/pyq-2026" element={
              <Pyq2026 />
            } />
            <Route path="/super30" element={
              <Super30 />
            } />
            <Route path="/question-set" element={
              <QuestionSet />
            } />
            <Route path="/question-set/:subject/practice" element={
              <CondensedPractice />
            } />
            <Route path="/question-set/:setId/:subject/practice" element={
              <CondensedPractice />
            } />
            <Route path="/response-upload" element={
              <ResponseUpload />
            } />
            <Route path="/response-result" element={
              <ResponseResult />
            } />
            <Route path="/pricing" element={
              <PricingPlans />
            } />
            <Route path="/privacy" element={
              <PrivacyPolicy />
            } />
            <Route path="/delete-account" element={
              <DeleteAccount />
            } />
            <Route path="/waitlist" element={
              <Waitlist />
            } />
            <Route path="/waitlist-success" element={
              <WaitlistSuccess />
            } />
            <Route path="/register-success" element={
              <RegisterSuccess />
            } />

            {/* Organic Questions - Public, SEO-optimized */}
            <Route path="/question/:slug" element={
              <OrganicQuestion />
            } />
            <Route path="/questions/organic" element={
              <OrganicQuestionList />
            } />

            {/* PYQ Individual Questions - SEO-optimized */}
            <Route path="/pyq/:uuid" element={
              <SingleQuestion />
            } />

            <Route path="/aipt" element={
              <RequireAuth allowFree>
                <AIPTPage />
              </RequireAuth>
            } />
            <Route path="/tests" element={
              isLiteUser ? (
                <RequireAuth allowFree>
                  <ComingSoon
                    title="Test Series for"
                    subtitle="Lite Plan"
                    message="Full mock tests and deep analysis coming soon for Lite plan users."
                    highlight="Lite Users"
                    date="15 March 2025"
                  />
                </RequireAuth>
              ) : (
                <RequireAuth>
                  <Tests />
                </RequireAuth>
              )
            } />
            <Route path="/tests/:testId" element={
              isLiteUser ? (
                <RequireAuth allowFree>
                  <ComingSoon
                    title="Test Interface for"
                    subtitle="Lite Plan"
                    message="Test taking interface coming soon for Lite plan users."
                    highlight="Lite Users"
                    date="15 March 2025"
                  />
                </RequireAuth>
              ) : (
                <RequireAuth>
                  <TestPage />
                </RequireAuth>
              )
            } />

            <Route path="/coming-soon" element={
              <RequireAuth allowFree>
                <ComingSoon />
              </RequireAuth>
            } />
            <Route path="/test-submitted" element={
              <RequireAuth allowFree>
                <TestSubmitted />
              </RequireAuth>
            } />
            <Route path="/results/:submissionId" element={
              <RequireAuth allowFree>
                <TestResult />
              </RequireAuth>
            } />
            <Route path="/review/:submissionId" element={
              <RequireAuth allowFree>
                <TestReview />
              </RequireAuth>
            } />

            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <DataCacheProvider>
          <AppContent />
        </DataCacheProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
