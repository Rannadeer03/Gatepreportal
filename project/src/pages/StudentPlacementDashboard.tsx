import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  FileText, 
  Users, 
  Calendar, 
  ArrowLeft,
  Building,
  MessageSquare,
  Award,
  TrendingUp,
  BookOpen,
  Video,
  Target,
  CheckCircle,
  Clock,
  Star
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export const StudentPlacementDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const placementFeatures = [
    {
      id: 'resume-builder',
      title: 'Resume Builder',
      icon: <FileText className="h-8 w-8" />,
      description: 'Create and update your professional resume',
      color: 'bg-blue-500',
      action: () => navigate('/student/resume-builder')
    },
    {
      id: 'interview-prep',
      title: 'Interview Preparation',
      icon: <MessageSquare className="h-8 w-8" />,
      description: 'Practice interviews and get feedback',
      color: 'bg-green-500',
      action: () => navigate('/student/interview-prep')
    },
    {
      id: 'company-profiles',
      title: 'Company Profiles',
      icon: <Building className="h-8 w-8" />,
      description: 'Explore companies and their requirements',
      color: 'bg-purple-500',
      action: () => navigate('/student/company-profiles')
    },
    {
      id: 'placement-calendar',
      title: 'Placement Calendar',
      icon: <Calendar className="h-8 w-8" />,
      description: 'Important placement dates and deadlines',
      color: 'bg-yellow-500',
      action: () => navigate('/student/placement-calendar')
    },
    {
      id: 'placement-resources',
      title: 'Placement Resources',
      icon: <BookOpen className="h-8 w-8" />,
      description: 'Study materials and PYQ questions for placement preparation',
      color: 'bg-indigo-500',
      action: () => navigate('/student/placement-resources')
    },
    {
      id: 'mock-tests',
      title: 'Mock Tests',
      icon: <Target className="h-8 w-8" />,
      description: 'Practice placement aptitude tests',
      color: 'bg-teal-500',
      action: () => navigate('/student/mock-tests')
    },
    {
      id: 'video-tutorials',
      title: 'Video Tutorials',
      icon: <Video className="h-8 w-8" />,
      description: 'Learn from expert placement videos',
      color: 'bg-orange-500',
      action: () => navigate('/student/video-tutorials')
    },
    {
      id: 'placement-status',
      title: 'Placement Status',
      icon: <CheckCircle className="h-8 w-8" />,
      description: 'Track your placement applications',
      color: 'bg-pink-500',
      action: () => navigate('/student/placement-status')
    }
  ];

  const renderFeatures = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {placementFeatures.map((feature) => (
          <div
            key={feature.id}
            onClick={feature.action}
            className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            <div className="flex items-center mb-4">
              <div className={`${feature.color} p-3 rounded-lg text-white`}>
                {feature.icon}
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900">{feature.title}</h3>
            </div>
            <p className="text-gray-600 text-sm">{feature.description}</p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/student-main-dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Placement Preparation Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.email}</p>
        </div>

        {/* Placement Features */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Placement Resources</h2>
          {renderFeatures()}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Building className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Companies Applied</p>
                <p className="text-2xl font-semibold text-gray-900">12</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Interviews</p>
                <p className="text-2xl font-semibold text-gray-900">8</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Offers</p>
                <p className="text-2xl font-semibold text-gray-900">3</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-orange-100 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-semibold text-gray-900">75%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Placements */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Placement Drives</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-2 rounded-lg mr-4">
                    <Building className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Google - Software Engineer</p>
                    <p className="text-sm text-gray-500">Campus Drive</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">Dec 15, 2024</p>
                  <p className="text-sm text-gray-500">2 days left</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <div className="bg-green-100 p-2 rounded-lg mr-4">
                    <Building className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Microsoft - Data Scientist</p>
                    <p className="text-sm text-gray-500">Off-campus Drive</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">Dec 20, 2024</p>
                  <p className="text-sm text-gray-500">7 days left</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center">
                  <div className="bg-purple-100 p-2 rounded-lg mr-4">
                    <Building className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Amazon - Full Stack Developer</p>
                    <p className="text-sm text-gray-500">Campus Drive</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">Dec 25, 2024</p>
                  <p className="text-sm text-gray-500">12 days left</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Recent Placement Activity</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="bg-blue-100 p-2 rounded-lg mr-4">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Updated Resume for Google Drive</p>
                  <p className="text-sm text-gray-500">1 hour ago</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="bg-green-100 p-2 rounded-lg mr-4">
                  <MessageSquare className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Completed Mock Interview - Microsoft</p>
                  <p className="text-sm text-gray-500">3 hours ago</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="bg-purple-100 p-2 rounded-lg mr-4">
                  <Target className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Scored 85% in Aptitude Test</p>
                  <p className="text-sm text-gray-500">1 day ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentPlacementDashboard; 