import React from 'react';
import { Leaf, TreePine } from 'lucide-react';

interface EcoPointsCardProps {
  totalPoints: number;
  videosCompleted: number;
  quizzesCompleted: number;
  revisionsDone: number;
}

const EcoPointsCard: React.FC<EcoPointsCardProps> = ({
  totalPoints,
  videosCompleted,
  quizzesCompleted,
  revisionsDone
}) => {
  const treesSaved = Math.floor(totalPoints / 100);
  const pagesSaved = totalPoints * 2; // 1 point = 2 pages saved

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg p-6 border-2 border-green-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-green-500 p-3 rounded-xl">
          <Leaf className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">Eco Points 🌱</h3>
      </div>
      
      <div className="mb-6">
        <div className="text-4xl font-extrabold text-green-600 mb-2">{totalPoints}</div>
        <div className="text-sm text-gray-600">Total Eco Points</div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Videos Watched</span>
          <span className="font-semibold text-gray-900">{videosCompleted} × 2 pts</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Quizzes Completed</span>
          <span className="font-semibold text-gray-900">{quizzesCompleted} × 3 pts</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Revisions Done</span>
          <span className="font-semibold text-gray-900">{revisionsDone} × 1 pt</span>
        </div>
      </div>

      <div className="pt-4 border-t border-green-200">
        <div className="flex items-center gap-2 mb-2">
          <TreePine className="w-5 h-5 text-green-600" />
          <span className="text-sm font-semibold text-gray-900">Environmental Impact</span>
        </div>
        <div className="text-sm text-gray-600 space-y-1">
          <div>🌳 {treesSaved} tree{treesSaved !== 1 ? 's' : ''} saved</div>
          <div>📄 {pagesSaved.toLocaleString()} pages saved</div>
        </div>
      </div>
    </div>
  );
};

export default EcoPointsCard;

