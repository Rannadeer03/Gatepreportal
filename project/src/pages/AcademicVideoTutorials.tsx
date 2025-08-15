import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, 
  Play, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  ArrowLeft,
  Plus,
  Eye,
  Calendar,
  Clock,
  Youtube
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

const AcademicVideoTutorials: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [tutorials, setTutorials] = useState<VideoTutorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTutorial, setSelectedTutorial] = useState<VideoTutorial | null>(null);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    subject: '',
    youtubeUrl: ''
  });

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

  // Function to extract YouTube video ID from URL
  const getYouTubeVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Function to generate YouTube embed URL
  const getYouTubeEmbedUrl = (videoId: string): string => {
    return `https://www.youtube.com/embed/${videoId}`;
  };

  // Function to get YouTube thumbnail
  const getYouTubeThumbnail = (videoId: string): string => {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  };

  useEffect(() => {
    fetchTutorials();
  }, []);

  const fetchTutorials = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('academic_video_tutorials')
        .select('*')
        .eq('teacher_id', user?.id)
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

  const handleUpload = async () => {
    if (!uploadForm.title || !uploadForm.subject || !uploadForm.youtubeUrl) {
      alert('Please fill in all required fields and provide a YouTube URL.');
      return;
    }

    const videoId = getYouTubeVideoId(uploadForm.youtubeUrl);
    if (!videoId) {
      alert('Please provide a valid YouTube URL.');
      return;
    }

    setUploading(true);
    try {
      const embedUrl = getYouTubeEmbedUrl(videoId);
      const thumbnailUrl = getYouTubeThumbnail(videoId);

      // Create tutorial record in database
      const { error } = await supabase
        .from('academic_video_tutorials')
        .insert([{
          title: uploadForm.title,
          description: uploadForm.description,
          subject: uploadForm.subject,
          youtube_url: uploadForm.youtubeUrl,
          youtube_embed_url: embedUrl,
          thumbnail_url: thumbnailUrl,
          teacher_id: user?.id,
          is_active: true
        }]);

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      // Reset form and close modal
      setUploadForm({
        title: '',
        description: '',
        subject: '',
        youtubeUrl: ''
      });
      setShowUploadModal(false);
      fetchTutorials();

    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload tutorial. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (tutorial: VideoTutorial) => {
    setSelectedTutorial(tutorial);
    setShowEditModal(true);
  };

  const handleDelete = async (tutorialId: string) => {
    if (!confirm('Are you sure you want to delete this tutorial?')) return;

    try {
      const { error } = await supabase
        .from('academic_video_tutorials')
        .delete()
        .eq('id', tutorialId);

      if (error) {
        console.error('Delete error:', error);
        return;
      }

      fetchTutorials();
    } catch (error) {
      console.error('Delete error:', error);
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading tutorials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => navigate('/academic/teacher-dashboard')}
              variant="outline"
              className="flex items-center"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Video Tutorials</h1>
              <p className="text-gray-600">Add and manage YouTube video tutorials for your students</p>
            </div>
          </div>
          <Button
            onClick={() => setShowUploadModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Tutorial
          </Button>
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
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
            <Card key={tutorial.id} className="hover:shadow-lg transition-shadow">
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
                  <div className="absolute top-2 right-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="bg-black bg-opacity-50 text-white hover:bg-opacity-70"
                      onClick={() => window.open(tutorial.youtube_url, '_blank')}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2">{tutorial.title}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{tutorial.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                  <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs">
                    {tutorial.subject}
                  </span>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(tutorial.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(tutorial)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(tutorial.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Eye className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-500">{tutorial.views_count || 0} views</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTutorials.length === 0 && (
          <div className="text-center py-12">
            <Youtube className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tutorials found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || filterSubject !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by adding your first YouTube video tutorial.'
              }
            </p>
            {!searchQuery && filterSubject === 'all' && (
              <Button
                onClick={() => setShowUploadModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Your First Tutorial
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-[calc(100vw-2rem)] sm:w-full sm:max-w-2xl mx-4 max-h-[calc(100vh-2rem)] sm:max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Add YouTube Video Tutorial</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter tutorial title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter tutorial description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                  <select
                    value={uploadForm.subject}
                    onChange={(e) => setUploadForm({...uploadForm, subject: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Select a subject</option>
                    {subjects.map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">YouTube URL *</label>
                  <input
                    type="url"
                    value={uploadForm.youtubeUrl}
                    onChange={(e) => setUploadForm({...uploadForm, youtubeUrl: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Paste the YouTube video URL here. Supported formats: youtube.com/watch?v=, youtu.be/, etc.
                  </p>
                </div>
                {uploadForm.youtubeUrl && getYouTubeVideoId(uploadForm.youtubeUrl) && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Preview:</h4>
                    <div className="aspect-video">
                      <iframe
                        src={getYouTubeEmbedUrl(getYouTubeVideoId(uploadForm.youtubeUrl)!)}
                        title="YouTube video preview"
                        className="w-full h-full rounded"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowUploadModal(false)}
                  disabled={uploading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {uploading ? 'Adding...' : 'Add Tutorial'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcademicVideoTutorials; 