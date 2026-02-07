import React, { useState } from 'react';
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
  ArrowLeft,
  Clock,
  X
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const placementOptions = [
  {
    id: 'resume-builder',
    title: 'Resume Builder',
    icon: <FileText className="h-10 w-10 text-blue-500 mb-3" />,
    description: 'Create and update your professional resume',
    color: 'bg-[#3B82F6]/10',
    action: (navigate: any) => navigate('/resume-builder'),
    comingSoon: false,
  },
  {
    id: 'interview-prep',
    title: 'Interview Preparation',
    icon: <MessageSquare className="h-10 w-10 text-green-500 mb-3" />,
    description: 'Practice interviews and get feedback',
    color: 'bg-[#22C55E]/10',
    comingSoon: true,
    features: [
      'Mock interview sessions',
      'AI-powered feedback',
      'Common interview questions',
      'Video practice mode'
    ]
  },
  {
    id: 'company-profiles',
    title: 'Company Profiles',
    icon: <Building className="h-10 w-10 text-purple-500 mb-3" />,
    description: 'Explore companies and their requirements',
    color: 'bg-[#A78BFA]/10',
    comingSoon: true,
    features: [
      'Detailed company information',
      'Salary insights and trends',
      'Interview experiences',
      'Application requirements'
    ]
  },
  {
    id: 'placement-calendar',
    title: 'Placement Calendar',
    icon: <Calendar className="h-10 w-10 text-yellow-500 mb-3" />,
    description: 'Important placement dates and deadlines',
    color: 'bg-[#F59E42]/10',
    comingSoon: true,
    features: [
      'Upcoming placement drives',
      'Application deadlines',
      'Interview schedules',
      'Event reminders'
    ]
  },
  {
    id: 'placement-resources',
    title: 'Placement Resources',
    icon: <BookOpen className="h-10 w-10 text-indigo-500 mb-3" />,
    description: 'Study materials and PYQ questions for placement preparation',
    color: 'bg-[#6366F1]/10',
    action: (navigate: any) => navigate('/student/placement-resources'),
    comingSoon: false,
  },
  {
    id: 'mock-tests',
    title: 'Mock Tests',
    icon: <Target className="h-10 w-10 text-teal-500 mb-3" />,
    description: 'Practice placement aptitude tests',
    color: 'bg-[#14B8A6]/10',
    comingSoon: true,
    features: [
      'Aptitude test practice',
      'Coding challenges',
      'Timed assessments',
      'Performance analytics'
    ]
  },
  {
    id: 'video-tutorials',
    title: 'Video Tutorials',
    icon: <Video className="h-10 w-10 text-orange-500 mb-3" />,
    description: 'Learn from expert placement videos',
    color: 'bg-[#F59E42]/10',
    action: (navigate: any) => navigate('/student/video-tutorials'),
    comingSoon: false,
  },
  {
    id: 'placement-status',
    title: 'Placement Status',
    icon: <CheckCircle className="h-10 w-10 text-pink-500 mb-3" />,
    description: 'Track your placement applications',
    color: 'bg-[#EC4899]/10',
    comingSoon: true,
    features: [
      'Application tracking',
      'Status updates',
      'Offer management',
      'Interview feedback'
    ]
  },
];

const StudentPlacementDashboard: React.FC = () => {
  const navigate = useNavigate();
  useAuthStore();
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<any>(null);

  const handleOptionClick = (option: any) => {
    if (option.comingSoon) {
      setSelectedFeature(option);
      setShowComingSoon(true);
    } else if (option.action) {
      option.action(navigate);
    }
  };

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
              className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center cursor-pointer hover:shadow-lg transition-all border border-gray-100 hover:border-gray-200 relative"
              onClick={() => handleOptionClick(option)}
            >
              {option.comingSoon && (
                <div className="absolute top-3 right-3">
                  <span className="bg-purple-100 text-purple-600 text-xs font-semibold px-2 py-1 rounded-full">
                    Coming Soon
                  </span>
                </div>
              )}
              <div className={`w-16 h-16 flex items-center justify-center mb-3 ${option.color} rounded-lg`}>
                {option.icon}
              </div>
              <span className="text-lg font-bold text-gray-900 mb-1 text-center">{option.title}</span>
              <span className="text-base text-gray-600 text-center">{option.description}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Coming Soon Modal */}
      {showComingSoon && selectedFeature && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 relative animate-fadeIn">
            {/* Close Button */}
            <button
              onClick={() => setShowComingSoon(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Clock Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center">
                <Clock className="h-12 w-12 text-purple-600" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-2">
              👋 Coming Soon
            </h2>

            {/* Feature Name */}
            <h3 className="text-xl font-semibold text-gray-700 text-center mb-4">
              {selectedFeature.title}
            </h3>

            {/* Description */}
            <p className="text-gray-600 text-center mb-6">
              We're working hard to bring you powerful {selectedFeature.title.toLowerCase()} tools and features to help you succeed in your placement journey.
            </p>

            {/* Features List */}
            {selectedFeature.features && (
              <div className="bg-purple-50 rounded-xl p-6 mb-6">
                <p className="text-sm font-semibold text-gray-700 mb-3 text-center">
                  This feature will include:
                </p>
                <ul className="space-y-2">
                  {selectedFeature.features.map((feature: string, index: number) => (
                    <li key={index} className="flex items-start text-sm text-gray-600">
                      <span className="text-purple-600 mr-2">•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Close Button */}
            <button
              onClick={() => setShowComingSoon(false)}
              className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentPlacementDashboard; 