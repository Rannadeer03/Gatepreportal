import React from 'react';
import { Calendar } from 'lucide-react';

interface DailyActivity {
  date: string;
  count: number;
}

interface StudyHeatmapProps {
  activities: DailyActivity[];
}

const StudyHeatmap: React.FC<StudyHeatmapProps> = ({ activities }) => {
  // Generate last 60 days
  const today = new Date();
  const days: { date: string; count: number }[] = [];
  
  for (let i = 59; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const activity = activities.find(a => a.date === dateStr);
    days.push({ date: dateStr, count: activity?.count || 0 });
  }

  // Group into weeks
  const weeks: { date: string; count: number }[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const getIntensityColor = (count: number) => {
    if (count === 0) return 'bg-gray-100';
    if (count <= 2) return 'bg-green-200';
    if (count <= 5) return 'bg-green-400';
    if (count <= 10) return 'bg-green-500';
    return 'bg-green-600';
  };

  const maxCount = Math.max(...days.map(d => d.count), 1);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <Calendar className="w-6 h-6 text-gray-700" />
        <h2 className="text-2xl font-bold text-gray-900">Study Heatmap</h2>
      </div>

      <div className="overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.map((day, dayIndex) => {
                const date = new Date(day.date);
                const isToday = date.toDateString() === today.toDateString();
                return (
                  <div
                    key={dayIndex}
                    className={`w-3 h-3 ${getIntensityColor(day.count)} rounded-sm hover:ring-2 hover:ring-green-400 transition-all cursor-pointer ${
                      isToday ? 'ring-2 ring-blue-500' : ''
                    }`}
                    title={`${date.toLocaleDateString()}: ${day.count} activities`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 bg-gray-100 rounded-sm" />
          <div className="w-3 h-3 bg-green-200 rounded-sm" />
          <div className="w-3 h-3 bg-green-400 rounded-sm" />
          <div className="w-3 h-3 bg-green-500 rounded-sm" />
          <div className="w-3 h-3 bg-green-600 rounded-sm" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
};

export default StudyHeatmap;

