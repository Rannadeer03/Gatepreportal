import React from 'react';

interface VideoSubjectCardProps {
  subject: string;
  videoCount: number;
  completedCount: number;
  icon: React.ReactNode;
  onClick: () => void;
  completedPercent?: number;
}

const VideoSubjectCard: React.FC<VideoSubjectCardProps> = ({ subject, videoCount, completedCount, icon, onClick, completedPercent }) => (
  <button
    className="bg-white rounded-2xl shadow-lg hover:shadow-2xl border border-gray-100 w-full p-5 flex flex-col items-center gap-3 transition-transform hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-green-400 group"
    onClick={onClick}
  >
    <div className="relative flex items-center justify-center">
      <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 via-purple-100 to-green-100 text-blue-700 group-hover:scale-110 transition-transform">
        {icon}
      </span>
      <span className="absolute -top-2 -right-2 bg-green-200 text-green-800 text-xs rounded-full px-2 py-0.5 font-semibold shadow border border-green-300">Eco</span>
    </div>
    <div className="font-bold text-blue-900 text-lg text-center group-hover:text-green-700 transition-colors">{subject}</div>
    <div className="flex gap-1 text-sm text-gray-500 mt-1">{completedCount}/{videoCount} videos completed</div>
    {typeof completedPercent === 'number' && (
      <div className="w-full h-2 bg-green-100 rounded-full mt-2">
        <div style={{width: `${completedPercent}%`}} className="h-2 rounded-full bg-green-400 transition-all" />
      </div>
    )}
  </button>
);

export default VideoSubjectCard;
