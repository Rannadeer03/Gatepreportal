import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  BookOpen, 
  FileText, 
  ClipboardList,
  BarChart2,
  Settings,
  GraduationCap,
  Target,
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
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const academicMenuItems = [
    {
      id: 'test-management',
      title: 'Test Management',
      icon: <ClipboardList className="h-6 w-6" />,
      description: 'Create and manage tests',
      color: 'bg-blue-500',
      action: () => navigate('/teacher/test-management')
    },
    {
      id: 'assignments',
      title: 'Assignments',
      icon: <FileText className="h-6 w-6" />,
      description: 'Manage student assignments',
      color: 'bg-green-500',
      action: () => navigate('/teacher/assignments')
    },
    {
      id: 'course-materials',
      title: 'Course Materials',
      icon: <Book className="h-6 w-6" />,
      description: 'Upload and manage study materials',
      color: 'bg-purple-500',
      action: () => navigate('/teacher/course-materials')
    },
    {
      id: 'student-results',
      title: 'Student Results',
      icon: <BarChart2 className="h-6 w-6" />,
      description: 'View and analyze student performance',
      color: 'bg-yellow-500',
      action: () => navigate('/teacher/test-results')
    }
  ];

  const gateMenuItems = [
    {
      id: 'gate-test-creation',
      title: 'GATE Test Creation',
      icon: <Target className="h-6 w-6" />,
      description: 'Create GATE-specific practice tests',
      color: 'bg-red-500',
      action: () => navigate('/teacher/gate-test-creation')
    },
    {
      id: 'gate-materials',
      title: 'GATE Materials',
      icon: <BookOpen className="h-6 w-6" />,
      description: 'Upload GATE study materials',
      color: 'bg-indigo-500',
      action: () => navigate('/teacher/gate-materials')
    },
    {
      id: 'gate-analytics',
      title: 'GATE Analytics',
      icon: <TrendingUp className="h-6 w-6" />,
      description: 'Track GATE preparation progress',
      color: 'bg-orange-500',
      action: () => navigate('/teacher/gate-analytics')
    },
    {
      id: 'gate-schedule',
      title: 'GATE Schedule',
      icon: <Calendar className="h-6 w-6" />,
      description: 'Manage GATE preparation timeline',
      color: 'bg-teal-500',
      action: () => navigate('/teacher/gate-schedule')
    }
  ];

  const placementMenuItems = [
    {
      id: 'placement-tests',
      title: 'Placement Tests',
      icon: <Award className="h-6 w-6" />,
      description: 'Create placement aptitude tests',
      color: 'bg-pink-500',
      action: () => navigate('/teacher/placement-tests')
    },
    {
      id: 'interview-prep',
      title: 'Interview Resources',
      icon: <Users className="h-6 w-6" />,
      description: 'Manage interview preparation materials',
      color: 'bg-cyan-500',
      action: () => navigate('/teacher/interview-resources')
    },
    {
      id: 'resume-templates',
      title: 'Resume Templates',
      icon: <PenTool className="h-6 w-6" />,
      description: 'Create resume templates and guides',
      color: 'bg-emerald-500',
      action: () => navigate('/teacher/resume-templates')
    },
    {
      id: 'company-database',
      title: 'Company Database',
      icon: <GraduationCap className="h-6 w-6" />,
      description: 'Manage company information and requirements',
      color: 'bg-violet-500',
      action: () => navigate('/teacher/company-database')
    }
  ];

  const handleSectionClick = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  const renderMenuItems = (items: any[]) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={item.action}
            className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            <div className="flex items-center mb-4">
              <div className={`${item.color} p-3 rounded-lg text-white`}>
                {item.icon}
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900">{item.title}</h3>
            </div>
            <p className="text-gray-600 text-sm">{item.description}</p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Teacher Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.email}</p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => navigate('/teacher/test-management')}
                className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Plus className="h-6 w-6 text-blue-600 mr-3" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Create New Test</p>
                  <p className="text-sm text-gray-600">Set up a new assessment</p>
                </div>
              </button>
              <button
                onClick={() => navigate('/teacher/assignments')}
                className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <FileText className="h-6 w-6 text-green-600 mr-3" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Upload Assignment</p>
                  <p className="text-sm text-gray-600">Add new assignment</p>
                </div>
              </button>
              <button
                onClick={() => navigate('/teacher/course-materials')}
                className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <Book className="h-6 w-6 text-purple-600 mr-3" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Add Materials</p>
                  <p className="text-sm text-gray-600">Upload study resources</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Main Sections */}
        <div className="space-y-8">
          {/* Academic Management Section */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 cursor-pointer"
              onClick={() => handleSectionClick('academic')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <GraduationCap className="h-8 w-8 text-white" />
                  <h2 className="ml-3 text-xl font-semibold text-white">Academic Management</h2>
                </div>
                <div className={`transform transition-transform duration-200 ${activeSection === 'academic' ? 'rotate-180' : ''}`}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <p className="text-blue-100 mt-2">Manage tests, assignments, and course materials</p>
            </div>
            {activeSection === 'academic' && (
              <div className="p-6">
                {renderMenuItems(academicMenuItems)}
              </div>
            )}
          </div>

          {/* GATE Preparation Management Section */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div 
              className="bg-gradient-to-r from-red-500 to-red-600 p-6 cursor-pointer"
              onClick={() => handleSectionClick('gate')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Target className="h-8 w-8 text-white" />
                  <h2 className="ml-3 text-xl font-semibold text-white">GATE Preparation Management</h2>
                </div>
                <div className={`transform transition-transform duration-200 ${activeSection === 'gate' ? 'rotate-180' : ''}`}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <p className="text-red-100 mt-2">Create and manage GATE preparation resources</p>
            </div>
            {activeSection === 'gate' && (
              <div className="p-6">
                {renderMenuItems(gateMenuItems)}
              </div>
            )}
          </div>

          {/* Placement Preparation Management Section */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div 
              className="bg-gradient-to-r from-green-500 to-green-600 p-6 cursor-pointer"
              onClick={() => handleSectionClick('placement')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Award className="h-8 w-8 text-white" />
                  <h2 className="ml-3 text-xl font-semibold text-white">Placement Preparation Management</h2>
                </div>
                <div className={`transform transition-transform duration-200 ${activeSection === 'placement' ? 'rotate-180' : ''}`}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <p className="text-green-100 mt-2">Manage placement preparation resources and materials</p>
            </div>
            {activeSection === 'placement' && (
              <div className="p-6">
                {renderMenuItems(placementMenuItems)}
              </div>
            )}
          </div>
        </div>

        {/* Statistics Overview */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
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
          <div className="bg-white rounded-lg shadow p-6">
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
          <div className="bg-white rounded-lg shadow p-6">
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
          <div className="bg-white rounded-lg shadow p-6">
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

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="bg-blue-100 p-2 rounded-lg mr-4">
                  <Plus className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Created new test: "Data Structures Quiz"</p>
                  <p className="text-sm text-gray-500">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="bg-green-100 p-2 rounded-lg mr-4">
                  <FileText className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Uploaded assignment: "Algorithm Analysis"</p>
                  <p className="text-sm text-gray-500">1 day ago</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="bg-purple-100 p-2 rounded-lg mr-4">
                  <Book className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Added study material: "Computer Networks Notes"</p>
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
