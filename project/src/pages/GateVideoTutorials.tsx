import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  ArrowLeft,
  Eye,
  Calendar,
  Youtube,
  BookOpen,
  Code,
  Zap,
  Database,
  Network,
  Cpu,
  Target} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/button';
import VideoEcoTip from '../components/ui/VideoEcoTip';
import VideoSubjectCard from '../components/ui/VideoSubjectCard';
import VideoTutorialList from '../components/ui/VideoTutorialList';

interface VideoTutorial {
  id: string;
  title: string;
  description: string;
  subject: string;
  youtube_url: string;
  youtube_embed_url: string;
  thumbnail_url?: string;
  duration?: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  teacher_id: string;
  views_count?: number;
  is_pyq?: boolean;
  difficulty?: 'easy' | 'medium' | 'hard';
}

const gateSubjectIcons: Record<string, React.ReactNode> = {
  'Data Structures & Algorithms': <Code className="w-6 h-6" />,
  'Operating Systems': <Cpu className="w-6 h-6" />,
  'Database Management': <Database className="w-6 h-6" />,
  'Computer Networks': <Network className="w-6 h-6" />,
  'Software Engineering': <Code className="w-6 h-6" />,
  'Digital Logic': <Zap className="w-6 h-6" />,
  'Computer Organization': <Cpu className="w-6 h-6" />,
  'Theory of Computation': <BookOpen className="w-6 h-6" />
};

const GateVideoTutorials: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [tutorials, setTutorials] = useState<VideoTutorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedTutorial, setSelectedTutorial] = useState<VideoTutorial | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [completedVideos, setCompletedVideos] = useState<Set<string>>(new Set());

  const subjects = [
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
    fetchTutorials();
    fetchVideoProgress();
  }, [user]);

  const fetchTutorials = async () => {
    try {
      setLoading(true);
      // For now, we'll use academic_video_tutorials but filter by subject
      // In production, you'd have a separate gate_video_tutorials table
      const { data, error } = await supabase
        .from('academic_video_tutorials')
        .select('*')
        .eq('is_active', true)
        .in('subject', subjects)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tutorials:', error);
        return;
      }

      setTutorials(data || []);
    } catch (error) {
      console.error('Error fetching tutorials:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVideoProgress = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('video_progress')
        .select('video_id, completed')
        .eq('student_id', user.id)
        .eq('completed', true);

      if (error) {
        console.error('Error fetching video progress:', error);
        return;
      }

      setCompletedVideos(new Set(data?.map(p => p.video_id) || []));
    } catch (error) {
      console.error('Error fetching video progress:', error);
    }
  };

  const handleVideoClick = (tutorial: VideoTutorial) => {
    setSelectedTutorial(tutorial);
    setShowVideoModal(true);
  };

  const handleViewCount = async (tutorialId: string) => {
    try {
      const { error } = await supabase
        .from('academic_video_tutorials')
        .update({ views_count: (tutorials.find(t => t.id === tutorialId)?.views_count || 0) + 1 })
        .eq('id', tutorialId);

      if (!error) {
        setTutorials(prev => prev.map(t =>
          t.id === tutorialId
            ? { ...t, views_count: (t.views_count || 0) + 1 }
            : t
        ));
      }
    } catch (error) {
      console.error('Error updating view count:', error);
    }
  };

  const handleVideoComplete = async (videoId: string) => {
    if (!user?.id) return;

    try {
      // Update database
      const { error } = await supabase
        .from('video_progress')
        .upsert({
          student_id: user.id,
          video_id: videoId,
          completed: true,
          completed_at: new Date().toISOString(),
          last_watched_at: new Date().toISOString()
        }, {
          onConflict: 'student_id,video_id'
        });

      if (error) {
        console.error('Error saving video progress:', error);
        return;
      }

      // Update local state
      const newCompleted = new Set(completedVideos);
      newCompleted.add(videoId);
      setCompletedVideos(newCompleted);
    } catch (error) {
      console.error('Error saving video progress:', error);
    }
  };

  const filteredTutorials = useMemo(() => {
    return tutorials.filter(tutorial => {
      const matchesSearch = tutorial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tutorial.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSubject = filterSubject === 'all' || tutorial.subject === filterSubject;
      return matchesSearch && matchesSubject;
    });
  }, [tutorials, searchQuery, filterSubject]);

  const tutorialsBySubject = useMemo(() => {
    const grouped: Record<string, VideoTutorial[]> = {};
    filteredTutorials.forEach(tutorial => {
      if (!grouped[tutorial.subject]) {
        grouped[tutorial.subject] = [];
      }
      grouped[tutorial.subject].push(tutorial);
    });
    return grouped;
  }, [filteredTutorials]);

  const getSubjectStats = (subject: string) => {
    const subjectTutorials = tutorialsBySubject[subject] || [];
    const completed = subjectTutorials.filter(t => completedVideos.has(t.id)).length;
    const total = subjectTutorials.length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percent };
  };

  const getVideoStatus = (tutorial: VideoTutorial): 'not_started' | 'in_progress' | 'completed' => {
    if (completedVideos.has(tutorial.id)) return 'completed';
    return 'not_started';
  };

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading GATE video tutorials...</p>
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
            <Button
              onClick={() => navigate('/gate-preparation/tests')}
              variant="outline"
              className="flex items-center"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to GATE Dashboard
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold text-indigo-900">GATE Video Tutorials</h1>
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-gray-600 mt-1">Ace your GATE exam with expert video tutorials</p>
            </div>
          </div>
        </div>

        {/* Eco Tip */}
        <VideoEcoTip>
          Review past year videos online — reduce your paper usage and study smarter!
        </VideoEcoTip>

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search GATE tutorials by topic or concept..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={filterSubject}
                onChange={(e) => {
                  setFilterSubject(e.target.value);
                  setSelectedSubject(null);
                }}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all"
              >
                <option value="all">All Subjects</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Subject Cards Grid - Show when no subject is selected */}
        {!selectedSubject && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-indigo-900 mb-4">Browse by Subject</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {subjects.map(subject => {
                const stats = getSubjectStats(subject);
                if (stats.total === 0 && filterSubject !== 'all' && filterSubject !== subject) return null;
                return (
                  <VideoSubjectCard
                    key={subject}
                    subject={subject}
                    videoCount={stats.total}
                    completedCount={stats.completed}
                    icon={gateSubjectIcons[subject] || <BookOpen className="w-6 h-6" />}
                    onClick={() => setSelectedSubject(subject)}
                    completedPercent={stats.percent}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Video List - Show when subject is selected or showing all */}
        {(selectedSubject || filterSubject !== 'all') && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-indigo-900">
                {selectedSubject ? `${selectedSubject} Videos` : 'All GATE Videos'}
              </h2>
              {selectedSubject && (
                <Button
                  variant="outline"
                  onClick={() => setSelectedSubject(null)}
                  className="text-sm"
                >
                  ← Back to Subjects
                </Button>
              )}
            </div>
            <VideoTutorialList
              tutorials={filteredTutorials
                .filter(t => !selectedSubject || t.subject === selectedSubject)
                .map(tutorial => ({
                  id: tutorial.id,
                  title: tutorial.title,
                  duration: formatDuration(tutorial.duration),
                  status: getVideoStatus(tutorial),
                  isImportant: tutorial.difficulty === 'hard',
                  isPYQ: tutorial.is_pyq || false
                }))}
              onPlay={(id) => {
                const tutorial = tutorials.find(t => t.id === id);
                if (tutorial) handleVideoClick(tutorial);
              }}
              onContinue={(id) => {
                const tutorial = tutorials.find(t => t.id === id);
                if (tutorial) handleVideoClick(tutorial);
              }}
            />
          </div>
        )}
      </div>

      {/* Video Modal */}
      {showVideoModal && selectedTutorial && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-[calc(100vw-2rem)] sm:w-full sm:max-w-4xl mx-4 max-h-[calc(100vh-2rem)] sm:max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{selectedTutorial.title}</h2>
                <Button
                  onClick={() => setShowVideoModal(false)}
                  variant="outline"
                  size="sm"
                >
                  ✕
                </Button>
              </div>

              <div className="aspect-video mb-4 rounded-xl overflow-hidden">
                <iframe
                  src={selectedTutorial.youtube_embed_url}
                  title={selectedTutorial.title}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  onLoad={() => {
                    handleViewCount(selectedTutorial.id);
                    handleVideoComplete(selectedTutorial.id);
                  }}
                ></iframe>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-gray-900">Description</h3>
                  <p className="text-gray-600">{selectedTutorial.description}</p>
                </div>

                <div className="flex items-center justify-between text-sm flex-wrap gap-2">
                  <div className="flex items-center space-x-4 flex-wrap">
                    <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full font-medium">
                      {selectedTutorial.subject}
                    </span>
                    {selectedTutorial.is_pyq && (
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                        Previous Year Question
                      </span>
                    )}
                    {selectedTutorial.difficulty && (
                      <span className={`px-3 py-1 rounded-full font-medium ${selectedTutorial.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                          selectedTutorial.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                        }`}>
                        {selectedTutorial.difficulty}
                      </span>
                    )}
                    <div className="flex items-center space-x-1 text-gray-500">
                      <Eye className="h-4 w-4" />
                      <span>{selectedTutorial.views_count || 0} views</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span>Added {new Date(selectedTutorial.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => window.open(selectedTutorial.youtube_url, '_blank')}
                  >
                    <Youtube className="h-4 w-4 mr-2" />
                    Watch on YouTube
                  </Button>
                  <Button
                    onClick={() => setShowVideoModal(false)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GateVideoTutorials;

