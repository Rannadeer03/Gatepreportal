import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  GraduationCap, 
  Target, 
  Briefcase,
  Users,
  BookOpen,
  FileText,
  ClipboardList,
  BarChart2,
  Settings,
  Award,
  Book,
  PenTool,
  Calendar,
  TrendingUp,
  Plus
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export const TeacherMainDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Dashboard Heading */}
        <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-4">Teacher Dashboard</h1>
        
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Welcome back, {user?.email?.split('@')[0]}!
          </h2>
          <p className="text-xl text-gray-600">
            Choose your section to manage and create content
          </p>
        </div>

        {/* Main Sections */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-8">
          {/* Academic Management Section Button */}
          <div className="flex justify-center items-center py-4">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-500 shadow-xl rounded-2xl p-6 flex flex-col items-center w-full max-w-sm">
              <button
                onClick={() => navigate('/teacher-dashboard')}
                className="flex flex-col items-center w-full px-6 py-6 bg-white bg-opacity-90 rounded-xl shadow-lg hover:bg-opacity-100 transition-all duration-200 border-2 border-transparent hover:border-blue-500 focus:outline-none"
              >
                <GraduationCap className="h-10 w-10 text-blue-500 mb-3" />
                <span className="text-xl font-bold text-gray-900 mb-1">Academic Management</span>
                <span className="text-base text-gray-600 text-center">Manage tests, assignments, and course materials</span>
              </button>
            </div>
          </div>

          {/* GATE Preparation Management Section Button */}
          <div className="flex justify-center items-center py-4">
            <div className="bg-gradient-to-br from-red-500 to-pink-500 shadow-xl rounded-2xl p-6 flex flex-col items-center w-full max-w-sm">
              <button
                onClick={() => navigate('/teacher-dashboard')}
                className="flex flex-col items-center w-full px-6 py-6 bg-white bg-opacity-90 rounded-xl shadow-lg hover:bg-opacity-100 transition-all duration-200 border-2 border-transparent hover:border-red-500 focus:outline-none"
              >
                <Target className="h-10 w-10 text-red-500 mb-3" />
                <span className="text-xl font-bold text-gray-900 mb-1">GATE Preparation</span>
                <span className="text-base text-gray-600 text-center">Create and manage GATE tests, assignments, and materials</span>
              </button>
            </div>
          </div>

          {/* Placement Preparation Management Section Button */}
          <div className="flex justify-center items-center py-4">
            <div className="bg-gradient-to-br from-green-500 to-emerald-500 shadow-xl rounded-2xl p-6 flex flex-col items-center w-full max-w-sm">
              <button
                onClick={() => navigate('/teacher-placement-dashboard')}
                className="flex flex-col items-center w-full px-6 py-6 bg-white bg-opacity-90 rounded-xl shadow-lg hover:bg-opacity-100 transition-all duration-200 border-2 border-transparent hover:border-green-500 focus:outline-none"
              >
                <Briefcase className="h-10 w-10 text-green-500 mb-3" />
                <span className="text-xl font-bold text-gray-900 mb-1">Placement Preparation</span>
                <span className="text-base text-gray-600 text-center">Manage placement resources, interviews, and career materials</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats Section */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">Quick Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-2xl font-semibold text-gray-900">156</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-lg">
                  <ClipboardList className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Tests</p>
                  <p className="text-2xl font-semibold text-gray-900">24</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
              <div className="flex items-center">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Book className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Materials</p>
                  <p className="text-2xl font-semibold text-gray-900">89</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
              <div className="flex items-center">
                <div className="bg-orange-100 p-3 rounded-lg">
                  <BarChart2 className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg. Score</p>
                  <p className="text-2xl font-semibold text-gray-900">76%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <button
              onClick={() => navigate('/teacher/test-management')}
              className="flex items-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-transparent hover:border-blue-500"
            >
              <div className="bg-blue-100 p-3 rounded-lg mr-4">
                <Plus className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900 text-lg">Create New Test</p>
                <p className="text-sm text-gray-600">Set up a new assessment</p>
              </div>
            </button>
            
            <button
              onClick={() => navigate('/teacher/assignments')}
              className="flex items-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-transparent hover:border-green-500"
            >
              <div className="bg-green-100 p-3 rounded-lg mr-4">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900 text-lg">Upload Assignment</p>
                <p className="text-sm text-gray-600">Add new assignment</p>
              </div>
            </button>
            
            <button
              onClick={() => navigate('/teacher/course-materials')}
              className="flex items-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-transparent hover:border-purple-500"
            >
              <div className="bg-purple-100 p-3 rounded-lg mr-4">
                <Book className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900 text-lg">Add Materials</p>
                <p className="text-sm text-gray-600">Upload study resources</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherMainDashboard;
