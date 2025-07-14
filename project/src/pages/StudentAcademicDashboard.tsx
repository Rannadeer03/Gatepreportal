import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText,
  BookOpen,
  ClipboardList,
  Award,
  Calendar,
  TrendingUp,
  Clock,
  Users,
  ArrowLeft
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

  const dashboardOptions = [
    {
      id: 'available-tests',
      title: 'Available Tests',
      icon: <FileText className="h-10 w-10 text-red-500 mb-3" />,
    description: 'See and take your available academic tests',
    color: 'bg-[#F87171]/10',
    action: (navigate: any) => navigate('/student/academic-tests'),
    },
    {
      id: 'study-materials',
      title: 'Study Materials',
      icon: <BookOpen className="h-10 w-10 text-pink-500 mb-3" />,
    description: 'Access curated academic study resources',
    color: 'bg-[#EC4899]/10',
    action: (navigate: any) => navigate('/student/academic-study-materials'),
    },
    {
      id: 'assignments',
      title: 'Assignments',
      icon: <ClipboardList className="h-10 w-10 text-blue-500 mb-3" />,
    description: 'View and submit academic assignments',
    color: 'bg-[#3B82F6]/10',
    action: (navigate: any) => navigate('/student/academic-assignments'),
    },
    {
      id: 'test-results',
      title: 'Test Results',
      icon: <Award className="h-10 w-10 text-green-500 mb-3" />, 
      description: 'Check your academic test results',
      color: 'bg-[#22C55E]/10',
      action: (navigate: any) => navigate('/student/academic-test-results'),
    },
    {
      id: 'preparation-schedule',
      title: 'Preparation Schedule',
      icon: <Calendar className="h-10 w-10 text-yellow-500 mb-3" />,
      description: 'View and manage your GATE preparation schedule',
    color: 'bg-[#F59E42]/10',
    action: (navigate: any) => navigate('/student/preparation-schedule'),
    },
    {
      id: 'progress-tracker',
      title: 'Progress Tracker',
      icon: <TrendingUp className="h-10 w-10 text-indigo-500 mb-3" />,
      description: 'Monitor your preparation progress',
    color: 'bg-[#6366F1]/10',
    action: (navigate: any) => navigate('/student/progress-tracker'),
    },
    {
      id: 'time-management',
      title: 'Time Management',
      icon: <Clock className="h-10 w-10 text-purple-500 mb-3" />,
      description: 'Tips and tools for managing your study time',
    color: 'bg-[#A78BFA]/10',
    action: (navigate: any) => navigate('/student/time-management'),
    },
    {
      id: 'mentorship',
      title: 'Mentorship',
      icon: <Users className="h-10 w-10 text-green-600 mb-3" />,
      description: 'Connect with mentors for guidance',
    color: 'bg-[#22C55E]/10',
    action: (navigate: any) => navigate('/student/mentorship'),
    },
  ];

const StudentAcademicDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
          <button
            onClick={() => navigate('/student-main-dashboard')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
          <span className="text-base font-medium">Back to Student Dashboard</span>
          </button>
        {/* Academic Dashboard Heading */}
        <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-4">Academic Dashboard</h1>
        <p className="text-lg text-gray-600 text-center mb-10">
          Access all your academic resources, tests, and progress tools in one place.
        </p>
        {/* Dashboard Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {dashboardOptions.map((option) => (
            <div
              key={option.id}
              className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center cursor-pointer hover:shadow-lg transition-all border border-gray-100 hover:border-gray-200"
              onClick={() => option.action(navigate)}
            >
              <div className={`w-16 h-16 flex items-center justify-center mb-3 ${option.color} rounded-lg`}>
                {option.icon}
              </div>
              <span className="text-lg font-bold text-gray-900 mb-1 text-center">{option.title}</span>
              <span className="text-base text-gray-600 text-center">{option.description}</span>
            </div>
          ))}
        </div>
      </div>
      <footer className="w-full text-center py-6 text-gray-400 text-sm">
        Made with <span className="text-pink-500">♥</span> by MockTest Pro Team
      </footer>
    </div>
  );
};

export default StudentAcademicDashboard; 