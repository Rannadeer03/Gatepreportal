import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Construction } from 'lucide-react';

const TimeManagement: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          {/* Back Button */}
          <button
            onClick={() => navigate('/student-academic-dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-8 mx-auto"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Academic Dashboard
          </button>

          {/* Coming Soon Content */}
          <div className="bg-white rounded-2xl shadow-xl p-12 border border-gray-100">
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-6 rounded-full">
                <Clock className="w-16 h-16 text-purple-600" />
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-2 mb-4">
              <Construction className="w-6 h-6 text-yellow-500" />
              <h1 className="text-4xl font-bold text-gray-900">Coming Soon</h1>
            </div>
            
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Time Management</h2>
            
            <p className="text-lg text-gray-600 mb-8">
              We're working hard to bring you powerful time management tools and tips to help you optimize your study schedule.
            </p>
            
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
              <p className="text-gray-700 font-medium">
                This feature will include:
              </p>
              <ul className="text-left mt-4 space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">•</span>
                  <span>Study schedule planner</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">•</span>
                  <span>Time tracking and analytics</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">•</span>
                  <span>Pomodoro timer integration</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">•</span>
                  <span>Productivity tips and techniques</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeManagement;

