import React from 'react';
import { CheckCircle, Target, RotateCcw } from 'lucide-react';

interface MasteryRingProps {
  percentage: number;
  label: string;
  caption: string;
  color: string;
  icon: React.ReactNode;
}

const MasteryRing: React.FC<MasteryRingProps> = ({ percentage, label, caption, color, icon }) => {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-40 h-40">
        <svg className="transform -rotate-90 w-40 h-40" viewBox="0 0 160 160">
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="currentColor"
            strokeWidth="12"
            fill="none"
            className="text-gray-200"
          />
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="currentColor"
            strokeWidth="12"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={`${color} transition-all duration-1000 ease-out`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-3xl font-bold text-gray-900">{percentage}%</div>
          <div className="text-xs text-gray-500 mt-1">{label}</div>
        </div>
      </div>
      <div className="mt-4 text-center">
        <div className="flex items-center justify-center gap-2 text-gray-700 font-medium mb-1">
          {icon}
          <span>{label}</span>
        </div>
        <div className="text-sm text-gray-500">{caption}</div>
      </div>
    </div>
  );
};

interface MasteryRingsProps {
  learningCompletion: number;
  conceptMastery: number;
  revisionConsistency: number;
}

const MasteryRings: React.FC<MasteryRingsProps> = ({
  learningCompletion,
  conceptMastery,
  revisionConsistency
}) => {
  const getCaption = (value: number, type: string) => {
    if (value >= 80) return 'Excellent! Keep it up!';
    if (value >= 60) return 'On Track';
    if (value >= 40) return 'Needs Attention';
    return 'Get Started';
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Mastery Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <MasteryRing
          percentage={learningCompletion}
          label="Learning"
          caption={getCaption(learningCompletion, 'completion')}
          color="text-blue-500"
          icon={<CheckCircle className="w-5 h-5" />}
        />
        <MasteryRing
          percentage={conceptMastery}
          label="Mastery"
          caption={getCaption(conceptMastery, 'mastery')}
          color="text-purple-500"
          icon={<Target className="w-5 h-5" />}
        />
        <MasteryRing
          percentage={revisionConsistency}
          label="Revision"
          caption={getCaption(revisionConsistency, 'revision')}
          color="text-green-500"
          icon={<RotateCcw className="w-5 h-5" />}
        />
      </div>
    </div>
  );
};

export default MasteryRings;

