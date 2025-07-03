import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Target, Briefcase } from 'lucide-react';

const AcademicTeacherMainDashboard = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-4">Academic Teacher Dashboard</h1>
        <div className="flex flex-col md:flex-row justify-center items-center gap-8">
          <div className="flex justify-center items-center py-4">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-500 shadow-xl rounded-2xl p-6 flex flex-col items-center w-full max-w-sm">
              <button
                onClick={() => navigate('/academic/teacher-dashboard')}
                className="flex flex-col items-center w-full px-6 py-6 bg-white bg-opacity-90 rounded-xl shadow-lg hover:bg-opacity-100 transition-all duration-200 border-2 border-transparent hover:border-blue-500 focus:outline-none"
              >
                <GraduationCap className="h-10 w-10 text-blue-500 mb-3" />
                <span className="text-xl font-bold text-gray-900 mb-1">Academic Management</span>
                <span className="text-base text-gray-600 text-center">Manage academic tests, assignments, and course materials</span>
              </button>
            </div>
          </div>
          <div className="flex justify-center items-center py-4">
            <div className="bg-gradient-to-br from-red-500 to-pink-500 shadow-xl rounded-2xl p-6 flex flex-col items-center w-full max-w-sm">
              <button
                onClick={() => navigate('/gate-teacher-dashboard')}
                className="flex flex-col items-center w-full px-6 py-6 bg-white bg-opacity-90 rounded-xl shadow-lg hover:bg-opacity-100 transition-all duration-200 border-2 border-transparent hover:border-red-500 focus:outline-none"
              >
                <Target className="h-10 w-10 text-red-500 mb-3" />
                <span className="text-xl font-bold text-gray-900 mb-1">GATE Preparation</span>
                <span className="text-base text-gray-600 text-center">Create and manage GATE tests, assignments, and materials</span>
              </button>
            </div>
          </div>
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
      </div>
    </div>
  );
};
export default AcademicTeacherMainDashboard; 