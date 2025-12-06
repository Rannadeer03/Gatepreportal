import React from 'react';
import { Play, BookOpen } from 'lucide-react';

interface VideoTutorial {
  id: string;
  title: string;
  duration?: string;
  status: 'not_started' | 'in_progress' | 'completed';
  isImportant?: boolean;
  isPYQ?: boolean;
}

interface VideoTutorialListProps {
  tutorials: VideoTutorial[];
  onPlay: (id: string) => void;
  onContinue?: (id: string) => void;
}

const statusMap = {
  not_started: {
    text: 'Not Started', color: 'bg-gray-100 text-gray-600'
  },
  in_progress: {
    text: 'In Progress', color: 'bg-yellow-100 text-yellow-800'
  },
  completed: {
    text: 'Completed', color: 'bg-green-100 text-green-800'
  }
};

const VideoTutorialList: React.FC<VideoTutorialListProps> = ({ tutorials, onPlay, onContinue }) => (
  <div className="space-y-3">
    {tutorials.map(tutorial => (
      <div
        key={tutorial.id}
        className={`flex items-center gap-4 rounded-xl shadow-sm border-l-4 p-4 ${tutorial.status === 'completed' ? 'border-green-400' : 'border-transparent'} bg-white hover:shadow-md transition-shadow`}
      >
        <div className="flex items-center justify-center w-14 h-14 rounded-lg bg-gradient-to-br from-blue-50 via-green-50 to-purple-50 text-blue-600 flex-shrink-0">
          <BookOpen className="w-7 h-7" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-gray-900 line-clamp-1">{tutorial.title}</span>
            {tutorial.isImportant && <span className="text-xs font-bold bg-orange-100 text-orange-700 rounded px-2 ml-2">Important</span>}
            {tutorial.isPYQ && <span className="text-xs font-bold bg-blue-100 text-blue-700 rounded px-2 ml-2">PYQ</span>}
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span>{tutorial.duration}</span>
            <span className={`px-2 py-0.5 rounded-full font-medium ${statusMap[tutorial.status].color}`}>{statusMap[tutorial.status].text}</span>
          </div>
        </div>
        <button
          className="ml-4 bg-green-500 hover:bg-green-600 text-white rounded-lg px-4 py-2 font-semibold flex items-center gap-2 shadow transition-transform active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-600 group"
          onClick={() => (tutorial.status === 'completed' && onContinue ? onContinue(tutorial.id) : onPlay(tutorial.id))}
        >
          <Play className="w-4 h-4 animate-pulse group-hover:scale-110" />
          {tutorial.status === 'completed' && onContinue ? 'Watch Again' : tutorial.status === 'in_progress' ? 'Continue' : 'Play'}
        </button>
      </div>
    ))}
  </div>
);

export default VideoTutorialList;
