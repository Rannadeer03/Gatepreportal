import React, { useState, useEffect } from 'react';
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
  BookOpen
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

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

const StudentAcademicVideoTutorials: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [tutorials, setTutorials] = useState<VideoTutorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [selectedTutorial, setSelectedTutorial] = useState<VideoTutorial | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);

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
  }, []);

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
        // Update local state
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

  const filteredTutorials = tutorials.filter(tutorial => {
    const matchesSearch = tutorial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tutorial.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = filterSubject === 'all' || tutorial.subject === filterSubject;
    return matchesSearch && matchesSubject;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading video tutorials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100">
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
              <h1 className="text-3xl font-bold text-gray-900">Video Tutorials</h1>
              <p className="text-gray-600">Watch educational videos from your teachers</p>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search tutorials..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="all">All Subjects</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tutorials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTutorials.map(tutorial => (
            <Card key={tutorial.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleVideoClick(tutorial)}>
              <CardHeader className="p-0">
                <div className="relative">
                  {tutorial.thumbnail_url ? (
                    <img
                      src={tutorial.thumbnail_url}
                      alt={tutorial.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                      <Youtube className="h-12 w-12 text-red-500" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                    <div className="bg-white bg-opacity-90 rounded-full p-3 opacity-0 hover:opacity-100 transition-opacity">
                      <Play className="h-8 w-8 text-red-600" />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">{tutorial.title}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{tutorial.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
                    {tutorial.subject}
                  </span>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(tutorial.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Eye className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-500">{tutorial.views_count || 0} views</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <BookOpen className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-500">Academic</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTutorials.length === 0 && (
          <div className="text-center py-12">
            <Youtube className="h-16 w-16 text-red-500 mx-auto mb-4" />
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
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
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
              
              <div className="aspect-video mb-4">
                <iframe
                  src={selectedTutorial.youtube_embed_url}
                  title={selectedTutorial.title}
                  className="w-full h-full rounded-lg"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  onLoad={() => handleViewCount(selectedTutorial.id)}
                ></iframe>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Description</h3>
                  <p className="text-gray-600">{selectedTutorial.description}</p>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full">
                      {selectedTutorial.subject}
                    </span>
                    <div className="flex items-center space-x-1">
                      <Eye className="h-4 w-4" />
                      <span>{selectedTutorial.views_count || 0} views</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Added {new Date(selectedTutorial.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => window.open(selectedTutorial.youtube_url, '_blank')}
                  >
                    <Youtube className="h-4 w-4 mr-2" />
                    Watch on YouTube
                  </Button>
                  <Button
                    onClick={() => setShowVideoModal(false)}
                    className="bg-red-600 hover:bg-red-700 text-white"
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