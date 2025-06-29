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

  const academicFeatures = [
    {
      id: 'course-overview',
      title: 'Course Overview',
      icon: <BookOpen className="h-8 w-8" />,
      description: 'View your current courses and progress',
      color: 'bg-blue-500',
      action: () => navigate('/student/course-overview')
    },
    {
      id: 'academic-calendar',
      title: 'Academic Calendar',
      icon: <Calendar className="h-8 w-8" />,
      description: 'Important academic dates and deadlines',
      color: 'bg-green-500',
      action: () => navigate('/student/academic-calendar')
    },
    {
      id: 'academic-support',
      title: 'Academic Support',
      icon: <Users className="h-8 w-8" />,
      description: 'Connect with tutors and academic advisors',
      color: 'bg-purple-500',
      action: () => navigate('/student/academic-support')
    },
    {
      id: 'academic-resources',
      title: 'Academic Resources',
      icon: <Book className="h-8 w-8" />,
      description: 'General academic resources and tools',
      color: 'bg-yellow-500',
      action: () => navigate('/student/academic-resources')
    },
    {
      id: 'academic-tests',
      title: 'Academic Tests',
      icon: <FileText className="h-8 w-8" />,
      description: 'Take tests and assessments',
      color: 'bg-indigo-500',
      action: () => navigate('/student-dashboard', { state: { showTests: true } })
    },
    {
      id: 'study-materials',
      title: 'Study Materials',
      icon: <Book className="h-8 w-8" />,
      description: 'Access course materials and resources',
      color: 'bg-teal-500',
      action: () => navigate('/study-materials')
    },
    {
      id: 'assignments',
      title: 'Assignments',
      icon: <ClipboardList className="h-8 w-8" />,
      description: 'View and submit assignments',
      color: 'bg-orange-500',
      action: () => navigate('/student/assignments')
    },
    {
      id: 'grades-results',
      title: 'Grades & Results',
      icon: <BarChart2 className="h-8 w-8" />,
      description: 'Check your academic performance',
      color: 'bg-pink-500',
      action: () => navigate('/student/grades')
    }
  ];

  const renderFeatures = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {academicFeatures.map((feature) => (
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

        {/* Academic Features */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Academic Resources</h2>
          {renderFeatures()}
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