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
import ResetPassword from './pages/ResetPassword';
import { AdminDashboard } from './pages/AdminDashboard';
import { SuperAdminDashboard } from './pages/SuperAdminDashboard';
import { Profile } from './pages/Profile';
import Settings from './pages/Settings';
import TestManagement from './pages/TestManagement';
import TakeTestPage from './pages/TakeTestPage';
import TestResults from './pages/TestResults';
import TestResultPage from './pages/TestResultPage';
import { StudentMainDashboard } from './pages/StudentMainDashboard';
import { TeacherMainDashboard } from './pages/TeacherMainDashboard';
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
import { RequireRole, RequireAuth } from './components/RequireRole';

const TEACHER_ROLES = ['teacher', 'admin', 'super_admin'] as const;
const STUDENT_ROLES = ['student', 'admin', 'super_admin'] as const;


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
            <Route path="/create-profile" element={<RequireAuth><CreateProfile /></RequireAuth>} />
            <Route path="/student-dashboard" element={<RequireRole roles={[...STUDENT_ROLES]}><NewStudentDashboard /></RequireRole>} />
            <Route path="/student-main-dashboard" element={<RequireRole roles={[...STUDENT_ROLES]}><StudentMainDashboard /></RequireRole>} />
            <Route path="/teacher-dashboard" element={<RequireRole roles={[...TEACHER_ROLES]}><TeacherDashboard mode="academic" /></RequireRole>} />
            <Route path="/gate-teacher-dashboard" element={<RequireRole roles={[...TEACHER_ROLES]}><TeacherDashboard mode="gate" /></RequireRole>} />
            <Route path="/teacher-main-dashboard" element={<RequireRole roles={[...TEACHER_ROLES]}><TeacherMainDashboard /></RequireRole>} />
            <Route path="/admin-dashboard" element={<RequireRole roles={['admin', 'super_admin']}><AdminDashboard /></RequireRole>} />
            <Route path="/super-admin-dashboard" element={<RequireRole roles={['super_admin']}><SuperAdminDashboard /></RequireRole>} />
            <Route path="/study-materials" element={<RequireAuth><StudyMaterials /></RequireAuth>} />
            <Route path="/teacher/assignments" element={<RequireRole roles={[...TEACHER_ROLES]}><TeacherAssignmentUpload /></RequireRole>} />
            <Route path="/teacher/course-materials" element={<RequireRole roles={[...TEACHER_ROLES]}><TeacherCourseUpload /></RequireRole>} />
            <Route path="/student/assignments" element={<RequireRole roles={[...STUDENT_ROLES]}><StudentAssignmentView /></RequireRole>} />
            <Route path="/create-test" element={<RequireRole roles={[...TEACHER_ROLES]}><CreateTestPage /></RequireRole>} />
            <Route path="/teacher/test-management" element={<RequireRole roles={[...TEACHER_ROLES]}><TestManagement /></RequireRole>} />
            <Route path="/tests/:testId" element={<RequireRole roles={[...STUDENT_ROLES]}><JeeTestInterface /></RequireRole>} />
            <Route path="/take-test/:testId" element={<RequireRole roles={[...STUDENT_ROLES]}><TakeTestPage /></RequireRole>} />
            <Route path="/test-result/:testId" element={<RequireRole roles={[...STUDENT_ROLES]}><TestResultPage /></RequireRole>} />
            <Route path="/register" element={<Register />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
            <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
            <Route path="/teacher/test-results" element={<RequireRole roles={[...TEACHER_ROLES]}><TestResults /></RequireRole>} />
            <Route path="/teacher/test-results/:testId" element={<RequireRole roles={[...TEACHER_ROLES]}><TestResults /></RequireRole>} />
            <Route path="/gate-preparation/tests" element={<RequireRole roles={[...STUDENT_ROLES]}><NewStudentDashboard /></RequireRole>} />
            <Route path="/gate-preparation/materials" element={<RequireRole roles={[...STUDENT_ROLES]}><NewStudentDashboard /></RequireRole>} />
            <Route path="/gate-preparation/schedule" element={<RequireRole roles={[...STUDENT_ROLES]}><NewStudentDashboard /></RequireRole>} />
            <Route path="/gate-preparation/progress" element={<RequireRole roles={[...STUDENT_ROLES]}><NewStudentDashboard /></RequireRole>} />
            <Route path="/student-academic-dashboard" element={<RequireRole roles={[...STUDENT_ROLES]}><StudentAcademicDashboard /></RequireRole>} />
            <Route path="/student-placement-dashboard" element={<RequireRole roles={[...STUDENT_ROLES]}><StudentPlacementDashboard /></RequireRole>} />
            <Route path="/student/placement-resources" element={<RequireRole roles={[...STUDENT_ROLES]}><StudentPlacementResources /></RequireRole>} />
            <Route path="/student/video-tutorials" element={<RequireRole roles={[...STUDENT_ROLES]}><PlacementVideoTutorials /></RequireRole>} />
            <Route path="/student-test-results" element={<RequireRole roles={[...STUDENT_ROLES]}><StudentTestResults /></RequireRole>} />
            <Route path="/teacher/assignment-review" element={<RequireRole roles={[...TEACHER_ROLES]}><AssignmentReview /></RequireRole>} />
            <Route path="/teacher-placement-dashboard" element={<RequireRole roles={[...TEACHER_ROLES]}><TeacherPlacementDashboard /></RequireRole>} />
            <Route path="/teacher/pyq-questions" element={<RequireRole roles={[...TEACHER_ROLES]}><TeacherPYQQuestions /></RequireRole>} />
            <Route path="/academic/teacher-dashboard" element={<RequireRole roles={[...TEACHER_ROLES]}><AcademicTeacherDashboard /></RequireRole>} />
            <Route path="/academic/teacher-main-dashboard" element={<RequireRole roles={[...TEACHER_ROLES]}><AcademicTeacherMainDashboard /></RequireRole>} />
            <Route path="/academic/teacher/test-management" element={<RequireRole roles={[...TEACHER_ROLES]}><AcademicTestManagement /></RequireRole>} />
            <Route path="/academic/teacher/test-results" element={<RequireRole roles={[...TEACHER_ROLES]}><AcademicTestResults /></RequireRole>} />
            <Route path="/academic/teacher/test-results/:testId" element={<RequireRole roles={[...TEACHER_ROLES]}><AcademicTestResults /></RequireRole>} />
            <Route path="/academic/teacher/assignments" element={<RequireRole roles={[...TEACHER_ROLES]}><AcademicTeacherAssignmentUpload /></RequireRole>} />
            <Route path="/academic/teacher/course-materials" element={<RequireRole roles={[...TEACHER_ROLES]}><AcademicTeacherCourseUpload /></RequireRole>} />
            <Route path="/academic/teacher/assignment-review" element={<RequireRole roles={[...TEACHER_ROLES]}><AcademicTeacherAssignmentList /></RequireRole>} />
            <Route path="/academic/create-test" element={<RequireRole roles={[...TEACHER_ROLES]}><AcademicCreateTestPage /></RequireRole>} />
            <Route path="/student/academic-tests" element={<RequireRole roles={[...STUDENT_ROLES]}><StudentAcademicTestList /></RequireRole>} />
            <Route path="/student/academic-study-materials" element={<RequireRole roles={[...STUDENT_ROLES]}><StudentAcademicStudyMaterials /></RequireRole>} />
            <Route path="/student/academic-assignments" element={<RequireRole roles={[...STUDENT_ROLES]}><StudentAcademicAssignments /></RequireRole>} />
            <Route path="/student/academic-test-results" element={<RequireRole roles={[...STUDENT_ROLES]}><StudentAcademicTestResults /></RequireRole>} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/support" element={<Support />} />
            <Route path="/tutorials" element={<Tutorials />} />
            <Route path="/student/academic-video-tutorials" element={<RequireRole roles={[...STUDENT_ROLES]}><StudentAcademicVideoTutorials /></RequireRole>} />
            <Route path="/academic/teacher/video-tutorials" element={<RequireRole roles={[...TEACHER_ROLES]}><AcademicVideoTutorials /></RequireRole>} />
            <Route path="/gate/video-tutorials" element={<RequireRole roles={[...STUDENT_ROLES]}><GateVideoTutorials /></RequireRole>} />
            <Route path="/student/progress-tracker" element={<RequireRole roles={[...STUDENT_ROLES]}><AcademicProgressTracker /></RequireRole>} />
            <Route path="/gate/progress" element={<RequireRole roles={[...STUDENT_ROLES]}><GateProgressTracker /></RequireRole>} />
            <Route path="/student/time-management" element={<RequireRole roles={[...STUDENT_ROLES]}><TimeManagement /></RequireRole>} />
            <Route path="/student/mentorship" element={<RequireRole roles={[...STUDENT_ROLES]}><Mentorship /></RequireRole>} />
            <Route path="/gate/mentorship" element={<RequireRole roles={[...STUDENT_ROLES]}><GateMentorship /></RequireRole>} />
            <Route path="/gate/schedule" element={<RequireRole roles={[...STUDENT_ROLES]}><GateSchedule /></RequireRole>} />
            <Route path="/performance-dashboard" element={<RequireAuth><PerformanceDashboard /></RequireAuth>} />
            <Route path="/resume-builder" element={<RequireAuth><ResumeBuilder /></RequireAuth>} />
            <Route path="/teacher-classroom-dashboard" element={<RequireRole roles={[...TEACHER_ROLES]}><TeacherClassroomDashboard /></RequireRole>} />
            <Route path="/student-classroom-dashboard" element={<RequireRole roles={[...STUDENT_ROLES]}><StudentClassroomDashboard /></RequireRole>} />
            <Route path="/teacher-classroom/:classId" element={<RequireRole roles={[...TEACHER_ROLES]}><TeacherClassView /></RequireRole>} />
            <Route path="/student-classroom/:classId" element={<RequireRole roles={[...STUDENT_ROLES]}><StudentClassView /></RequireRole>} />

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