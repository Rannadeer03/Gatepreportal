import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  GraduationCap, 
  Calendar, 
  Users, 
  Book, 
  ArrowLeft,
  BookOpen,
  Clock,
  Award,
  TrendingUp,
  FileText,
  ClipboardList,
  BarChart2
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export const StudentAcademicDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // New dashboard options matching the main dashboard
  const dashboardOptions = [
    {
      id: 'available-tests',
      title: 'Available Tests',
      icon: <FileText className="h-10 w-10 text-red-500 mb-3" />,
      description: 'See and take your available GATE tests',
      color: 'from-red-400 to-red-600',
      action: () => navigate('/take-test-page'),
    },
    {
      id: 'study-materials',
      title: 'Study Materials',
      icon: <BookOpen className="h-10 w-10 text-pink-500 mb-3" />,
      description: 'Access curated GATE study resources',
      color: 'from-pink-400 to-pink-600',
      action: () => navigate('/study-materials'),
    },
    {
      id: 'assignments',
      title: 'Assignments',
      icon: <ClipboardList className="h-10 w-10 text-blue-500 mb-3" />,
      description: 'View and submit GATE assignments',
      color: 'from-blue-400 to-blue-600',
      action: () => navigate('/student/assignments'),
    },
    {
      id: 'test-results',
      title: 'Test Results',
      icon: <Award className="h-10 w-10 text-green-500 mb-3" />,
      description: 'Check your GATE test results',
      color: 'from-green-400 to-green-600',
      action: () => navigate('/student-test-results'),
    },
    {
      id: 'preparation-schedule',
      title: 'Preparation Schedule',
      icon: <Calendar className="h-10 w-10 text-yellow-500 mb-3" />,
      description: 'View and manage your GATE preparation schedule',
      color: 'from-yellow-400 to-yellow-600',
      action: () => navigate('/student/preparation-schedule'),
    },
    {
      id: 'progress-tracker',
      title: 'Progress Tracker',
      icon: <TrendingUp className="h-10 w-10 text-indigo-500 mb-3" />,
      description: 'Monitor your preparation progress',
      color: 'from-indigo-400 to-indigo-600',
      action: () => navigate('/student/progress-tracker'),
    },
    {
      id: 'time-management',
      title: 'Time Management',
      icon: <Clock className="h-10 w-10 text-purple-500 mb-3" />,
      description: 'Tips and tools for managing your study time',
      color: 'from-purple-400 to-purple-600',
      action: () => navigate('/student/time-management'),
    },
    {
      id: 'mentorship',
      title: 'Mentorship',
      icon: <Users className="h-10 w-10 text-green-600 mb-3" />,
      description: 'Connect with mentors for guidance',
      color: 'from-green-400 to-green-700',
      action: () => navigate('/student/mentorship'),
    },
  ];

  const renderDashboardOptions = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
      {dashboardOptions.map((option) => (
        <div
          key={option.id}
          className={`bg-gradient-to-br ${option.color} shadow-xl rounded-2xl p-6 flex flex-col items-center cursor-pointer hover:scale-105 transition-transform duration-200`}
          onClick={option.action}
        >
          <div className="flex flex-col items-center w-full px-6 py-6 bg-white bg-opacity-90 rounded-xl shadow-lg hover:bg-opacity-100 transition-all duration-200 border-2 border-transparent focus:outline-none">
            {option.icon}
            <span className="text-xl font-bold text-gray-900 mb-1">{option.title}</span>
            <span className="text-base text-gray-600 text-center">{option.description}</span>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Academic Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.email}</p>
        </div>

        {/* Dashboard Options */}
        <div className="mb-12">
          {renderDashboardOptions()}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Courses Enrolled</p>
                <p className="text-2xl font-semibold text-gray-900">6</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <Award className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">CGPA</p>
                <p className="text-2xl font-semibold text-gray-900">8.5</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Study Hours</p>
                <p className="text-2xl font-semibold text-gray-900">156</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-orange-100 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Attendance</p>
                <p className="text-2xl font-semibold text-gray-900">92%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Recent Academic Activity</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="bg-blue-100 p-2 rounded-lg mr-4">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Submitted Assignment: Data Structures</p>
                  <p className="text-sm text-gray-500">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="bg-green-100 p-2 rounded-lg mr-4">
                  <Award className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Received Grade: Computer Networks (A+)</p>
                  <p className="text-sm text-gray-500">1 day ago</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="bg-purple-100 p-2 rounded-lg mr-4">
                  <Book className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Accessed Study Material: Algorithms</p>
                  <p className="text-sm text-gray-500">2 days ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAcademicDashboard; 