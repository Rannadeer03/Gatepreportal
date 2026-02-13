import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { useAuthStore } from "./store/authStore";
import { monitoringService } from './services/monitoringService';
import { performanceService } from './services/performanceService';
import { adBlockerService } from './services/adBlockerService';
import { analyticsSettings } from './config/environment';
import './config/security'; // Import security configuration

import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import SplashScreen from "./components/splashScreen";
import { Login } from "./pages/Login";
import { TeacherDashboard } from "./pages/TeacherDashboard";
import { NewStudentDashboard } from './pages/NewStudentDashboard';
import { StudyMaterials } from './pages/StudyMaterials';
import Home from "./pages/Home";
import { CreateProfile } from './pages/CreateProfile';
import TeacherAssignmentUpload from "./components/TeacherAssignmentUpload";
import TeacherCourseUpload from "./components/TeacherCourseUpload";
import StudentAssignmentView from "./components/StudentAssignmentView";
import CreateTestPage from './pages/CreateTestPage';
import JeeTestInterface from './pages/JeeTestInterface';
import { Register } from './pages/Register';
import { AuthCallback } from './pages/AuthCallback';
import { AdminDashboard } from './pages/AdminDashboard';
import { SuperAdminDashboard } from './pages/SuperAdminDashboard';
import { Profile } from './pages/Profile';
import Settings from './pages/Settings';
import TestManagement from './pages/TestManagement';
import TakeTestPage from './pages/TakeTestPage';
import TestResults from './pages/TestResults';
import { StudentMainDashboard } from './pages/StudentMainDashboard';
import { TeacherMainDashboard } from './pages/TeacherMainDashboard';
import { GatePreparationDashboard } from './pages/GatePreparationDashboard';
import StudentAcademicDashboard from './pages/StudentAcademicDashboard';
import StudentPlacementDashboard from './pages/StudentPlacementDashboard';
import StudentPlacementResources from './pages/StudentPlacementResources';
import StudentTestResults from './pages/StudentTestResults';
import AssignmentReview from "./components/TeacherAssignmentList";
import TeacherPlacementDashboard from './pages/TeacherPlacementDashboard';
import TeacherPYQQuestions from './pages/TeacherPYQQuestions';
import AcademicTeacherMainDashboard from './pages/AcademicTeacherMainDashboard';
import AcademicTeacherDashboard from './pages/AcademicTeacherDashboard';
import AcademicTestManagement from './pages/AcademicTestManagement';
import AcademicTestResults from './pages/AcademicTestResults';
import AcademicTeacherAssignmentUpload from './components/AcademicTeacherAssignmentUpload';
import AcademicTeacherCourseUpload from './components/AcademicTeacherCourseUpload';
import AcademicTeacherAssignmentList from './components/AcademicTeacherAssignmentList';
import AcademicCreateTestPage from './pages/AcademicCreateTestPage';
import StudentAcademicTestList from './pages/StudentAcademicTestList';
import StudentAcademicStudyMaterials from './pages/StudentAcademicStudyMaterials';
import StudentAcademicAssignments from './pages/StudentAcademicAssignments';
import StudentAcademicTestResults from './pages/StudentAcademicTestResults';
import FAQ from './pages/FAQ';
import Support from './pages/Support';
import Tutorials from './pages/Tutorials';
import AcademicVideoTutorials from './pages/AcademicVideoTutorials';
import StudentAcademicVideoTutorials from './pages/StudentAcademicVideoTutorials';
import GateVideoTutorials from './pages/GateVideoTutorials';
import AcademicProgressTracker from './pages/AcademicProgressTracker';
import GateProgressTracker from './pages/GateProgressTracker';
import TimeManagement from './pages/TimeManagement';
import Mentorship from './pages/Mentorship';
import GateMentorship from './pages/GateMentorship';
import GateSchedule from './pages/GateSchedule';
import PerformanceDashboard from './pages/PerformanceDashboard';
import ResumeBuilder from './pages/ResumeBuilder';
import PlacementVideoTutorials from './pages/PlacementVideoTutorials';
import TeacherClassroomDashboard from './pages/TeacherClassroomDashboard';
import StudentClassroomDashboard from './pages/StudentClassroomDashboard';
import TeacherClassView from './pages/TeacherClassView';
import StudentClassView from './pages/StudentClassView';


// Simple loading screen component
const LoadingScreen = () => (
  <div className="fixed inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
    <div className="w-16 h-16 border-t-4 border-b-4 border-white rounded-full animate-spin" />
  </div>
);



const App: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const { initialize, isLoading } = useAuthStore();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize auth state
        await initialize();
        // Initialize monitoring service
        monitoringService.init();
        // Initialize performance optimizations
        performanceService.init();
        // Initialize ad blocker detection
        await adBlockerService.init();
      } catch (error) {
        // Silent error handling for security
      } finally {
        // Set loading to false after auth initialization
        setLoading(false);
      }
    };

    initializeApp();
  }, [initialize]);

  // Track page load performance
  useEffect(() => {
    const pageLoadTime = performance.now();
    monitoringService.trackPageLoad('App', pageLoadTime);
  }, []);

  // Show loading screen while auth is initializing
  if (loading || isLoading) {
    return <LoadingScreen />;
  }

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/splash" element={<SplashScreen />} />
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/create-profile" element={<CreateProfile />} />
            <Route path="/student-dashboard" element={<NewStudentDashboard />} />
            <Route path="/student-main-dashboard" element={<StudentMainDashboard />} />
            <Route path="/teacher-dashboard" element={<TeacherDashboard mode="academic" />} />
            <Route path="/gate-teacher-dashboard" element={<TeacherDashboard mode="gate" />} />
            <Route path="/teacher-main-dashboard" element={<TeacherMainDashboard />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/super-admin-dashboard" element={<SuperAdminDashboard />} />
            <Route path="/study-materials" element={<StudyMaterials />} />
            <Route path="/teacher/assignments" element={<TeacherAssignmentUpload />} />
            <Route path="/teacher/course-materials" element={<TeacherCourseUpload />} />
            <Route path="/student/assignments" element={<StudentAssignmentView />} />
            <Route path="/create-test" element={<CreateTestPage />} />
            <Route path="/teacher/test-management" element={<TestManagement />} />
            <Route path="/tests/:testId" element={<JeeTestInterface />} />
            <Route path="/take-test/:testId" element={<TakeTestPage />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/teacher/test-results" element={<TestResults />} />
            <Route path="/gate-preparation/tests" element={<GatePreparationDashboard />} />
            <Route path="/gate-preparation/materials" element={<GatePreparationDashboard />} />
            <Route path="/gate-preparation/schedule" element={<GatePreparationDashboard />} />
            <Route path="/gate-preparation/progress" element={<GatePreparationDashboard />} />
            <Route path="/student-academic-dashboard" element={<StudentAcademicDashboard />} />
            <Route path="/student-placement-dashboard" element={<StudentPlacementDashboard />} />
            <Route path="/student/placement-resources" element={<StudentPlacementResources />} />
            <Route path="/student/video-tutorials" element={<PlacementVideoTutorials />} />
            <Route path="/student-test-results" element={<StudentTestResults />} />
            <Route path="/teacher/assignment-review" element={<AssignmentReview />} />
            <Route path="/teacher-placement-dashboard" element={<TeacherPlacementDashboard />} />
            <Route path="/teacher/pyq-questions" element={<TeacherPYQQuestions />} />
            <Route path="/academic/teacher-dashboard" element={<AcademicTeacherDashboard />} />
            <Route path="/academic/teacher-main-dashboard" element={<AcademicTeacherMainDashboard />} />
            <Route path="/academic/teacher/test-management" element={<AcademicTestManagement />} />
            <Route path="/academic/teacher/test-results" element={<AcademicTestResults />} />
            <Route path="/academic/teacher/assignments" element={<AcademicTeacherAssignmentUpload />} />
            <Route path="/academic/teacher/course-materials" element={<AcademicTeacherCourseUpload />} />
            <Route path="/academic/teacher/assignment-review" element={<AcademicTeacherAssignmentList />} />
            <Route path="/academic/create-test" element={<AcademicCreateTestPage />} />
            <Route path="/student/academic-tests" element={<StudentAcademicTestList />} />
            <Route path="/student/academic-study-materials" element={<StudentAcademicStudyMaterials />} />
            <Route path="/student/academic-assignments" element={<StudentAcademicAssignments />} />
            <Route path="/student/academic-test-results" element={<StudentAcademicTestResults />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/support" element={<Support />} />
            <Route path="/tutorials" element={<Tutorials />} />
            <Route path="/student/academic-video-tutorials" element={<StudentAcademicVideoTutorials />} />
            <Route path="/academic/teacher/video-tutorials" element={<AcademicVideoTutorials />} />
            <Route path="/gate/video-tutorials" element={<GateVideoTutorials />} />
            <Route path="/student/progress-tracker" element={<AcademicProgressTracker />} />
            <Route path="/gate/progress" element={<GateProgressTracker />} />
            <Route path="/student/time-management" element={<TimeManagement />} />
            <Route path="/student/mentorship" element={<Mentorship />} />
            <Route path="/gate/mentorship" element={<GateMentorship />} />
            <Route path="/gate/schedule" element={<GateSchedule />} />
            <Route path="/performance-dashboard" element={<PerformanceDashboard />} />
            <Route path="/resume-builder" element={<ResumeBuilder />} />
            <Route path="/teacher-classroom-dashboard" element={<TeacherClassroomDashboard />} />
            <Route path="/student-classroom-dashboard" element={<StudentClassroomDashboard />} />
            <Route path="/teacher-classroom/:classId" element={<TeacherClassView />} />
            <Route path="/student-classroom/:classId" element={<StudentClassView />} />

            {/* Catch all route - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
        {/* Only load analytics based on configuration */}
        {analyticsSettings.enableVercelAnalytics && <Analytics />}
      </div>
    </BrowserRouter>
  );
};

export default App;