import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  Search,
  Filter,
  ArrowLeft,
  Eye,
  Calendar,
  Clock,
  Youtube,
  BookOpen,
  Code,
  Calculator,
  Atom,
  FlaskConical,
  Leaf,
  BookMarked,
  Globe,
  MapPin,
  GraduationCap
} from 'lucide-react';
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
}

const subjectIcons: Record<string, React.ReactNode> = {
  'Computer Science': <Code className="w-6 h-6" />,
  'Mathematics': <Calculator className="w-6 h-6" />,
  'Physics': <Atom className="w-6 h-6" />,
  'Chemistry': <FlaskConical className="w-6 h-6" />,
  'Biology': <Leaf className="w-6 h-6" />,
  'English': <BookMarked className="w-6 h-6" />,
  'History': <BookOpen className="w-6 h-6" />,
  'Geography': <Globe className="w-6 h-6" />
};

const StudentAcademicVideoTutorials: React.FC = () => {
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
    'Computer Science',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'English',
    'History',
    'Geography'
  ];

  useEffect(() => {
    fetchTutorials();
    fetchVideoProgress();
  }, [user]);

  const fetchTutorials = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('academic_video_tutorials')
        .select('*')
        .eq('is_active', true)
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
    // You can add logic to track in-progress videos here
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading video tutorials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => navigate('/student-academic-dashboard')}
              variant="outline"
              className="flex items-center"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Academic Dashboard
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold text-blue-900">Academic Video Tutorials</h1>
                <GraduationCap className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-gray-600 mt-1">Master your subjects with instructor-led videos</p>
            </div>
          </div>
        </div>

        {/* Eco Tip */}
        <VideoEcoTip>
          Watch videos at 1.5x speed to save time and energy while learning!
        </VideoEcoTip>

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search tutorials by title or description..."
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
            <h2 className="text-2xl font-bold text-blue-900 mb-4">Browse by Subject</h2>
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
                    icon={subjectIcons[subject] || <BookOpen className="w-6 h-6" />}
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
              <h2 className="text-2xl font-bold text-blue-900">
                {selectedSubject ? `${selectedSubject} Videos` : 'All Videos'}
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
                  isImportant: false, // You can add this field to your database
                  isPYQ: false // You can add this field to your database
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

        {filteredTutorials.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl shadow-md">
            <Youtube className="h-16 w-16 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No video tutorials found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || filterSubject !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'No video tutorials are available at the moment. Check back later!'
              }
            </p>
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

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                      {selectedTutorial.subject}
                    </span>
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
                    className="bg-blue-600 hover:bg-blue-700 text-white"
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

export default StudentAcademicVideoTutorials;
