import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import MasteryRings from '../components/progress/MasteryRings';
import EcoPointsCard from '../components/progress/EcoPointsCard';
import SubjectConfidenceList from '../components/progress/SubjectConfidenceList';
import WeeklyInsights from '../components/progress/WeeklyInsights';
import StudyHeatmap from '../components/progress/StudyHeatmap';

interface TestResult {
  id: string;
  test_id: string;
  score: number;
  status: string;
  created_at: string;
  test_title?: string;
  subject?: string;
  max_score?: number;
}

interface VideoTutorial {
  id: string;
  subject: string;
  created_at: string;
}

interface DailyActivity {
  date: string;
  count: number;
}

const GateProgressTracker: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [videos, setVideos] = useState<VideoTutorial[]>([]);
  const [completedVideos, setCompletedVideos] = useState<Set<string>>(new Set());

  const gateSubjects = [
    'Data Structures & Algorithms',
    'Operating Systems',
    'Database Management',
    'Computer Networks',
    'Software Engineering',
    'Digital Logic',
    'Computer Organization',
    'Theory of Computation'
  ];

  useEffect(() => {
    if (user?.id) {
      fetchProgressData();
    }
  }, [user]);

  const fetchProgressData = async () => {
    try {
      setLoading(true);

      // Fetch test results (assuming GATE tests are in the same table but filtered by subject)
      const { data: resultsData } = await supabase
        .from('test_results')
        .select('id, test_id, score, status, created_at')
        .eq('student_id', user?.id)
        .order('created_at', { ascending: false });

      if (resultsData) {
        const testIds = Array.from(new Set(resultsData.map(r => r.test_id))).filter(Boolean);
        if (testIds.length > 0) {
          const { data: testsData } = await supabase
            .from('tests')
            .select('id, title, subject, max_score')
            .in('id', testIds)
            .in('subject', gateSubjects);

          const testMap: Record<string, any> = {};
          (testsData || []).forEach(t => {
            testMap[t.id] = { title: t.title, subject: t.subject, max_score: t.max_score };
          });

          const merged = resultsData
            .map(r => ({
              ...r,
              test_title: testMap[r.test_id]?.title || 'Untitled',
              subject: testMap[r.test_id]?.subject || 'Unknown',
              max_score: testMap[r.test_id]?.max_score || 100
            }))
            .filter(r => gateSubjects.includes(r.subject || ''));

          setTestResults(merged);
        }
      }

      // Fetch GATE videos (filtered by GATE subjects)
      const { data: videosData } = await supabase
        .from('academic_video_tutorials')
        .select('id, subject, created_at')
        .eq('is_active', true)
        .in('subject', gateSubjects);

      setVideos(videosData || []);

      // Load completed videos
      const saved = localStorage.getItem('completedGateVideos');
      if (saved) {
        try {
          setCompletedVideos(new Set(JSON.parse(saved)));
        } catch (e) {
          console.error('Error loading completed videos:', e);
        }
      }
    } catch (error) {
      console.error('Error fetching progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalVideos = videos.length;
    const completedVideoCount = Array.from(completedVideos).length;
    const totalTests = testResults.length;
    const completedTests = testResults.filter(r => r.status === 'completed').length;

    // Learning Completion: % of videos watched
    const learningCompletion = totalVideos > 0
      ? Math.round((completedVideoCount / totalVideos) * 100)
      : 0;

    // Concept Mastery: Average test score
    const conceptMastery = totalTests > 0
      ? Math.round(
          testResults
            .filter(r => r.status === 'completed' && r.max_score)
            .reduce((sum, r) => sum + (r.score / (r.max_score || 100)) * 100, 0) / completedTests
        )
      : 0;

    // Revision Consistency: Based on recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentActivity = testResults.filter(r => new Date(r.created_at) >= sevenDaysAgo).length;
    const revisionConsistency = Math.min(100, recentActivity * 15);

    return {
      learningCompletion,
      conceptMastery: isNaN(conceptMastery) ? 0 : conceptMastery,
      revisionConsistency
    };
  }, [videos, completedVideos, testResults]);

  // Calculate Eco Points
  const ecoPoints = useMemo(() => {
    const videosCompleted = completedVideos.size;
    const quizzesCompleted = testResults.filter(r => r.status === 'completed').length;
    const revisionsDone = completedVideos.size;

    return {
      total: videosCompleted * 2 + quizzesCompleted * 3 + revisionsDone * 1,
      videosCompleted,
      quizzesCompleted,
      revisionsDone
    };
  }, [completedVideos, testResults]);

  // Calculate subject confidence
  const subjectConfidence = useMemo(() => {
    const subjectMap: Record<string, { videos: number; completed: number; scores: number[] }> = {};

    videos.forEach(v => {
      if (!subjectMap[v.subject]) {
        subjectMap[v.subject] = { videos: 0, completed: 0, scores: [] };
      }
      subjectMap[v.subject].videos++;
      if (completedVideos.has(v.id)) {
        subjectMap[v.subject].completed++;
      }
    });

    testResults.forEach(r => {
      if (r.subject && r.status === 'completed' && r.max_score) {
        if (!subjectMap[r.subject]) {
          subjectMap[r.subject] = { videos: 0, completed: 0, scores: [] };
        }
        subjectMap[r.subject].scores.push((r.score / r.max_score) * 100);
      }
    });

    return gateSubjects.map(subject => {
      const data = subjectMap[subject] || { videos: 0, completed: 0, scores: [] };
      const completion = data.videos > 0
        ? Math.round((data.completed / data.videos) * 100)
        : 0;
      const averageScore = data.scores.length > 0
        ? Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length)
        : 0;

      // Determine confidence
      let confidence: 'strong' | 'moderate' | 'weak' = 'weak';
      const combinedScore = (completion * 0.6 + averageScore * 0.4);
      if (combinedScore >= 70) confidence = 'strong';
      else if (combinedScore >= 40) confidence = 'moderate';

      return { subject, completion, averageScore, confidence };
    }).sort((a, b) => b.completion - a.completion);
  }, [videos, completedVideos, testResults, gateSubjects]);

  // Weekly insights
  const weeklyInsights = useMemo(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const weeklyTests = testResults.filter(r => new Date(r.created_at) >= sevenDaysAgo).length;
    const weeklyVideos = Array.from(completedVideos).filter(id => {
      const video = videos.find(v => v.id === id);
      return video && new Date(video.created_at) >= sevenDaysAgo;
    }).length;
    const totalTimeStudied = weeklyTests + weeklyVideos;

    const strongSubjects = subjectConfidence
      .filter(s => s.confidence === 'strong')
      .slice(0, 3)
      .map(s => s.subject);

    const weakSubjects = subjectConfidence
      .filter(s => s.confidence === 'weak')
      .slice(0, 3)
      .map(s => s.subject);

    const suggestedFocus: string[] = [];
    if (weakSubjects.length > 0) {
      suggestedFocus.push(`Focus on ${weakSubjects[0]} - critical for GATE`);
      suggestedFocus.push(`Solve more PYQs in ${weakSubjects[0]}`);
    }
    if (strongSubjects.length > 0) {
      suggestedFocus.push(`Maintain strength in ${strongSubjects[0]}`);
    }
    suggestedFocus.push('Complete at least 1 mock test this week');

    return {
      totalTimeStudied,
      strongSubjects,
      weakSubjects,
      suggestedFocus
    };
  }, [testResults, completedVideos, videos, subjectConfidence]);

  // Daily activities for heatmap
  const dailyActivities = useMemo(() => {
    const activityMap: Record<string, number> = {};

    testResults.forEach(r => {
      const date = new Date(r.created_at).toISOString().split('T')[0];
      activityMap[date] = (activityMap[date] || 0) + 1;
    });

    Array.from(completedVideos).forEach(id => {
      const video = videos.find(v => v.id === id);
      if (video) {
        const date = new Date(video.created_at).toISOString().split('T')[0];
        activityMap[date] = (activityMap[date] || 0) + 1;
      }
    });

    return Object.entries(activityMap).map(([date, count]) => ({ date, count }));
  }, [testResults, completedVideos, videos]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading your GATE progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-emerald-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/student-dashboard')}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to GATE Dashboard
            </button>
            <div>
              <h1 className="text-3xl font-bold text-indigo-900">GATE Progress Tracker</h1>
              <p className="text-gray-600 mt-1">Track your GATE preparation journey</p>
            </div>
          </div>
        </div>

        {/* Mastery Rings */}
        <div className="mb-6">
          <MasteryRings
            learningCompletion={metrics.learningCompletion}
            conceptMastery={metrics.conceptMastery}
            revisionConsistency={metrics.revisionConsistency}
          />
        </div>

        {/* Eco Points and Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-1">
            <EcoPointsCard
              totalPoints={ecoPoints.total}
              videosCompleted={ecoPoints.videosCompleted}
              quizzesCompleted={ecoPoints.quizzesCompleted}
              revisionsDone={ecoPoints.revisionsDone}
            />
          </div>
          <div className="lg:col-span-2">
            <SubjectConfidenceList subjects={subjectConfidence} />
          </div>
        </div>

        {/* Weekly Insights */}
        <div className="mb-6">
          <WeeklyInsights
            totalTimeStudied={weeklyInsights.totalTimeStudied}
            strongSubjects={weeklyInsights.strongSubjects}
            weakSubjects={weeklyInsights.weakSubjects}
            suggestedFocus={weeklyInsights.suggestedFocus}
          />
        </div>

        {/* Study Heatmap */}
        <div>
          <StudyHeatmap activities={dailyActivities} />
        </div>
      </div>
    </div>
  );
};

export default GateProgressTracker;

