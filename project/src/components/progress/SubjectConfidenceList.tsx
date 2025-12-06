import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface SubjectProgress {
  subject: string;
  completion: number;
  averageScore: number;
  confidence: 'strong' | 'moderate' | 'weak';
}

interface SubjectConfidenceListProps {
  subjects: SubjectProgress[];
}

const SubjectConfidenceList: React.FC<SubjectConfidenceListProps> = ({ subjects }) => {
  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'strong':
        return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300', bar: 'bg-green-500' };
      case 'moderate':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300', bar: 'bg-yellow-500' };
      case 'weak':
        return { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300', bar: 'bg-red-500' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300', bar: 'bg-gray-500' };
    }
  };

  const getConfidenceIcon = (confidence: string) => {
    switch (confidence) {
      case 'strong':
        return <TrendingUp className="w-4 h-4" />;
      case 'weak':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <Minus className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Subject Confidence</h2>
      <div className="space-y-4">
        {subjects.map((subject, index) => {
          const colors = getConfidenceColor(subject.confidence);
          return (
            <div
              key={index}
              className={`border-2 ${colors.border} rounded-xl p-4 hover:shadow-md transition-shadow`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`${colors.text} font-semibold`}>
                    {getConfidenceIcon(subject.confidence)}
                  </span>
                  <h3 className="font-bold text-gray-900">{subject.subject}</h3>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${colors.bg} ${colors.text}`}>
                  {subject.confidence.toUpperCase()}
                </span>
              </div>
              
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Completion</span>
                    <span className="font-semibold text-gray-900">{subject.completion}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${colors.bar} transition-all duration-500`}
                      style={{ width: `${subject.completion}%` }}
                    />
                  </div>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Average Score</span>
                  <span className="font-semibold text-gray-900">{subject.averageScore}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SubjectConfidenceList;

