import React from 'react';
import { Sparkles, Target, AlertCircle, Lightbulb, TrendingUp } from 'lucide-react';

interface WeeklyInsightsProps {
  totalTimeStudied: number;
  strongSubjects: string[];
  weakSubjects: string[];
  suggestedFocus: string[];
}

const WeeklyInsights: React.FC<WeeklyInsightsProps> = ({
  totalTimeStudied,
  strongSubjects,
  weakSubjects,
  suggestedFocus
}) => {
  return (
    <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 rounded-2xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-2 rounded-lg">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Weekly Learning Insights</h2>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-xl p-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-gray-900">This Week's Activity</span>
          </div>
          <p className="text-gray-700">
            You've completed <span className="font-bold text-blue-600">{totalTimeStudied}</span> learning activities this week!
          </p>
        </div>

        {strongSubjects.length > 0 && (
          <div className="bg-white rounded-xl p-4 border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-gray-900">Strong Subjects</span>
            </div>
            <p className="text-gray-700">
              You're excelling in: <span className="font-bold text-green-600">{strongSubjects.join(', ')}</span>
            </p>
          </div>
        )}

        {weakSubjects.length > 0 && (
          <div className="bg-white rounded-xl p-4 border border-yellow-200">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <span className="font-semibold text-gray-900">Areas to Improve</span>
            </div>
            <p className="text-gray-700">
              Focus more on: <span className="font-bold text-yellow-600">{weakSubjects.join(', ')}</span>
            </p>
          </div>
        )}

        {suggestedFocus.length > 0 && (
          <div className="bg-white rounded-xl p-4 border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-5 h-5 text-purple-600" />
              <span className="font-semibold text-gray-900">Suggested Focus</span>
            </div>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              {suggestedFocus.map((focus, index) => (
                <li key={index} className="text-sm">{focus}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeeklyInsights;

