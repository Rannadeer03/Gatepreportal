import React from 'react';
import { BookOpen } from 'lucide-react';

interface VideoEcoTipProps {
  children: React.ReactNode;
}

const VideoEcoTip: React.FC<VideoEcoTipProps> = ({ children }) => (
  <div className="flex items-center gap-2 bg-green-50 border-l-4 border-green-300 rounded-xl py-2 px-4 mt-2 mb-4">
    <BookOpen className="w-5 h-5 text-green-600" />
    <span className="font-medium text-green-800 text-sm">{children}</span>
  </div>
);

export default VideoEcoTip;
