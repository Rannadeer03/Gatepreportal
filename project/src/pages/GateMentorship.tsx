import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Construction } from 'lucide-react';

const GateMentorship: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-emerald-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          {/* Back Button */}
          <button
            onClick={() => navigate('/student-dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-8 mx-auto"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to GATE Dashboard
          </button>

          {/* Coming Soon Content */}
          <div className="bg-white rounded-2xl shadow-xl p-12 border border-gray-100">
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-br from-emerald-100 to-green-100 p-6 rounded-full">
                <Users className="w-16 h-16 text-emerald-600" />
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-2 mb-4">
              <Construction className="w-6 h-6 text-yellow-500" />
              <h1 className="text-4xl font-bold text-gray-900">Coming Soon</h1>
            </div>
            
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">GATE Mentorship</h2>
            
            <p className="text-lg text-gray-600 mb-8">
              Connect with experienced GATE mentors and get personalized guidance to ace your GATE exam.
            </p>
            
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-6 border border-emerald-200">
              <p className="text-gray-700 font-medium">
                This feature will include:
              </p>
              <ul className="text-left mt-4 space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="text-emerald-500 mr-2">•</span>
                  <span>Connect with GATE toppers and experts</span>
                </li>
                <li className="flex items-start">
                  <span className="text-emerald-500 mr-2">•</span>
                  <span>One-on-one mentorship sessions</span>
                </li>
                <li className="flex items-start">
                  <span className="text-emerald-500 mr-2">•</span>
                  <span>GATE-specific study strategies</span>
                </li>
                <li className="flex items-start">
                  <span className="text-emerald-500 mr-2">•</span>
                  <span>Personalized preparation roadmap</span>
                </li>
                <li className="flex items-start">
                  <span className="text-emerald-500 mr-2">•</span>
                  <span>Doubt clearing and motivation sessions</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GateMentorship;

