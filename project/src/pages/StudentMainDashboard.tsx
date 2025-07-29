import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  GraduationCap, 
  Target, 
  Briefcase,
  User,
  Bell,
  Settings
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export const StudentMainDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [showEducationModal, setShowEducationModal] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Dashboard Heading */}
        <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-4">Student Dashboard</h1>
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Welcome back, {user?.email?.split('@')[0]}!
          </h2>
          <p className="text-xl text-gray-600">
            Choose your section to get started
          </p>
        </div>

        {/* Main Sections */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-8">
          {/* Education Section Card */}
          <div className="flex justify-center items-center py-4">
            <div className="bg-gradient-to-br from-blue-400 to-pink-400 shadow-2xl rounded-2xl p-8 flex flex-col items-center w-full max-w-md">
              <button
                onClick={() => setShowEducationModal(true)}
                className="flex flex-col items-center w-full px-8 py-8 bg-white bg-opacity-90 rounded-xl shadow-lg hover:bg-opacity-100 transition-all duration-200 border-2 border-transparent hover:border-blue-500 focus:outline-none"
              >
                <GraduationCap className="h-12 w-12 text-blue-500 mb-4" />
                <span className="text-2xl font-bold text-gray-900 mb-2">Education Section</span>
                <span className="text-base text-gray-600 text-center">Access Academic & GATE Preparation</span>
              </button>
            </div>
          </div>

          {/* Placement Preparation Section Button */}
          <div className="flex justify-center items-center py-4">
            <div className="bg-gradient-to-br from-green-500 to-emerald-500 shadow-xl rounded-2xl p-6 flex flex-col items-center w-full max-w-sm">
              <button
                onClick={() => navigate('/student-placement-dashboard')}
                className="flex flex-col items-center w-full px-6 py-6 bg-white bg-opacity-90 rounded-xl shadow-lg hover:bg-opacity-100 transition-all duration-200 border-2 border-transparent hover:border-green-500 focus:outline-none"
              >
                <Briefcase className="h-10 w-10 text-green-500 mb-3" />
                <span className="text-xl font-bold text-gray-900 mb-1">Placement Preparation</span>
                <span className="text-base text-gray-600 text-center">Prepare for placements, interviews, and build your resume</span>
              </button>
            </div>
          </div>
        </div>

        {/* Education Modal */}
        {showEducationModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md flex flex-col items-center relative">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold"
                onClick={() => setShowEducationModal(false)}
                aria-label="Close"
              >
                ×
              </button>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose Section</h2>
              <div className="flex flex-col gap-4 w-full">
                <button
                  onClick={() => { setShowEducationModal(false); navigate('/student-academic-dashboard'); }}
                  className="flex flex-row items-center w-full px-6 py-4 bg-blue-50 rounded-xl shadow hover:bg-blue-100 transition-all duration-200 border border-blue-200"
                >
                  <GraduationCap className="h-8 w-8 text-blue-500 mr-3" />
                  <div className="flex flex-col items-start">
                    <span className="text-lg font-bold text-gray-900">Academic Section</span>
                    <span className="text-sm text-gray-600">View your courses, academic progress, and resources</span>
                  </div>
                </button>
                <button
                  onClick={() => { setShowEducationModal(false); navigate('/student-dashboard'); }}
                  className="flex flex-row items-center w-full px-6 py-4 bg-pink-50 rounded-xl shadow hover:bg-pink-100 transition-all duration-200 border border-pink-200"
                >
                  <Target className="h-8 w-8 text-red-500 mr-3" />
                  <div className="flex flex-col items-start">
                    <span className="text-lg font-bold text-gray-900">GATE Preparation</span>
                    <span className="text-sm text-gray-600">Access all your GATE resources, tests, and materials</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentMainDashboard; 