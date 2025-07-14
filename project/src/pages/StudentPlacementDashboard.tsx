import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  MessageSquare,
  Building,
  Calendar,
  BookOpen,
  Target,
  Video,
  CheckCircle,
  ArrowLeft
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const placementOptions = [
    {
      id: 'resume-builder',
      title: 'Resume Builder',
    icon: <FileText className="h-10 w-10 text-blue-500 mb-3" />,
      description: 'Create and update your professional resume',
    color: 'bg-[#3B82F6]/10',
    action: (navigate: any) => navigate('/student/resume-builder'),
    },
    {
      id: 'interview-prep',
      title: 'Interview Preparation',
    icon: <MessageSquare className="h-10 w-10 text-green-500 mb-3" />,
      description: 'Practice interviews and get feedback',
    color: 'bg-[#22C55E]/10',
    action: (navigate: any) => navigate('/student/interview-prep'),
    },
    {
      id: 'company-profiles',
      title: 'Company Profiles',
    icon: <Building className="h-10 w-10 text-purple-500 mb-3" />,
      description: 'Explore companies and their requirements',
    color: 'bg-[#A78BFA]/10',
    action: (navigate: any) => navigate('/student/company-profiles'),
    },
    {
      id: 'placement-calendar',
      title: 'Placement Calendar',
    icon: <Calendar className="h-10 w-10 text-yellow-500 mb-3" />,
      description: 'Important placement dates and deadlines',
    color: 'bg-[#F59E42]/10',
    action: (navigate: any) => navigate('/student/placement-calendar'),
    },
    {
      id: 'placement-resources',
      title: 'Placement Resources',
    icon: <BookOpen className="h-10 w-10 text-indigo-500 mb-3" />,
      description: 'Study materials and PYQ questions for placement preparation',
    color: 'bg-[#6366F1]/10',
    action: (navigate: any) => navigate('/student/placement-resources'),
    },
    {
      id: 'mock-tests',
      title: 'Mock Tests',
    icon: <Target className="h-10 w-10 text-teal-500 mb-3" />,
      description: 'Practice placement aptitude tests',
    color: 'bg-[#14B8A6]/10',
    action: (navigate: any) => navigate('/student/mock-tests'),
    },
    {
      id: 'video-tutorials',
      title: 'Video Tutorials',
    icon: <Video className="h-10 w-10 text-orange-500 mb-3" />,
      description: 'Learn from expert placement videos',
    color: 'bg-[#F59E42]/10',
    action: (navigate: any) => navigate('/student/video-tutorials'),
    },
    {
      id: 'placement-status',
      title: 'Placement Status',
    icon: <CheckCircle className="h-10 w-10 text-pink-500 mb-3" />,
      description: 'Track your placement applications',
    color: 'bg-[#EC4899]/10',
    action: (navigate: any) => navigate('/student/placement-status'),
  },
  ];

const StudentPlacementDashboard: React.FC = () => {
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
        {/* Placement Dashboard Heading */}
        <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-4">Placement Preparation Dashboard</h1>
        <p className="text-lg text-gray-600 text-center mb-10">
          Access all your placement resources, mock tests, and progress tools in one place.
        </p>
        {/* Placement Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {placementOptions.map((option) => (
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

export default StudentPlacementDashboard; 