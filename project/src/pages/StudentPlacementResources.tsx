import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Download, 
  FileText, 
  Building, 
  Target, 
  Clock,
  Eye,
  BookOpen,
  Calendar,
  Users,
  Award
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';

interface PYQQuestion {
  id: string;
  title: string;
  description: string;
  company_name: string;
  position: string;
  year: number;
  question_type: 'aptitude' | 'technical' | 'coding' | 'interview' | 'other';
  difficulty_level: 'easy' | 'medium' | 'hard';
  question_file_path?: string;
  question_file_name?: string;
  answer_file_path?: string;
  answer_file_name?: string;
  solution?: string;
  tags?: string[];
  created_at: string;
}

export const StudentPlacementResources: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [pyqQuestions, setPyqQuestions] = useState<PYQQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCompany, setFilterCompany] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [selectedQuestion, setSelectedQuestion] = useState<PYQQuestion | null>(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);

  useEffect(() => {
    fetchPYQQuestions();
  }, []);

  const fetchPYQQuestions = async () => {
    try {
      setLoading(true);
      const { data } = await supabase
        .from('pyq_questions')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (data) {
        setPyqQuestions(data);
      }
    } catch (error) {
      console.error('Error fetching PYQ questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewQuestion = (question: PYQQuestion) => {
    setSelectedQuestion(question);
    setShowQuestionModal(true);
  };

  const handleDownloadFile = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('pyq-files')
        .download(filePath);

      if (error) throw error;

      const url = window.URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Error downloading file. Please try again.');
    }
  };

  const filteredQuestions = pyqQuestions.filter((question) => {
    const matchesSearch = question.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         question.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         question.position.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCompany = filterCompany === 'all' || question.company_name === filterCompany;
    const matchesType = filterType === 'all' || question.question_type === filterType;
    const matchesDifficulty = filterDifficulty === 'all' || question.difficulty_level === filterDifficulty;
    return matchesSearch && matchesCompany && matchesType && matchesDifficulty;
  });

  const getUniqueCompanies = () => {
    const companies = pyqQuestions.map(q => q.company_name);
    return ['all', ...Array.from(new Set(companies))];
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'aptitude': return 'bg-blue-100 text-blue-800';
      case 'technical': return 'bg-purple-100 text-purple-800';
      case 'coding': return 'bg-green-100 text-green-800';
      case 'interview': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'aptitude': return <Target className="h-5 w-5" />;
      case 'technical': return <BookOpen className="h-5 w-5" />;
      case 'coding': return <FileText className="h-5 w-5" />;
      case 'interview': return <Users className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading placement resources...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Question Modal */}
      {showQuestionModal && selectedQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{selectedQuestion.title}</h2>
              <button
                onClick={() => setShowQuestionModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Company</h3>
                  <p className="text-lg font-semibold text-gray-900">{selectedQuestion.company_name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Position</h3>
                  <p className="text-lg font-semibold text-gray-900">{selectedQuestion.position}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Year</h3>
                  <p className="text-lg font-semibold text-gray-900">{selectedQuestion.year}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Type</h3>
                  <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${getTypeColor(selectedQuestion.question_type)}`}>
                    {selectedQuestion.question_type}
                  </span>
                </div>
              </div>

              {selectedQuestion.description && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
                  <p className="text-gray-700">{selectedQuestion.description}</p>
                </div>
              )}

              {selectedQuestion.solution && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Solution</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedQuestion.solution}</p>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-4">
                {selectedQuestion.question_file_path && (
                  <button
                    onClick={() => handleDownloadFile(selectedQuestion.question_file_path!, selectedQuestion.question_file_name || 'question.pdf')}
                    className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Question
                  </button>
                )}
                
                {selectedQuestion.answer_file_path && (
                  <button
                    onClick={() => handleDownloadFile(selectedQuestion.answer_file_path!, selectedQuestion.answer_file_name || 'answer.pdf')}
                    className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Answer
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/student-placement-dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span className="text-base font-medium">Back to Placement Dashboard</span>
          </button>
          
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Placement Resources</h1>
            <p className="text-lg text-gray-600">Access Previous Year Questions (PYQ) and study materials</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total PYQ Questions</p>
                <p className="text-2xl font-semibold text-gray-900">{pyqQuestions.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Building className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Companies Covered</p>
                <p className="text-2xl font-semibold text-gray-900">{getUniqueCompanies().length - 1}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Question Types</p>
                <p className="text-2xl font-semibold text-gray-900">5</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Award className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Recent Updates</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {pyqQuestions.filter(q => {
                    const uploadDate = new Date(q.created_at);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return uploadDate > weekAgo;
                  }).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Search & Filter</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search PYQ questions..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            
            <select
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={filterCompany}
              onChange={(e) => setFilterCompany(e.target.value)}
            >
              <option value="all">All Companies</option>
              {getUniqueCompanies().slice(1).map(company => (
                <option key={company} value={company}>{company}</option>
              ))}
            </select>

            <select
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="aptitude">Aptitude</option>
              <option value="technical">Technical</option>
              <option value="coding">Coding</option>
              <option value="interview">Interview</option>
              <option value="other">Other</option>
            </select>

            <select
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        {/* PYQ Questions Grid */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Previous Year Questions (PYQ)</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuestions.map((question) => (
              <div key={question.id} className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-lg ${getTypeColor(question.question_type)}`}>
                      {getTypeIcon(question.question_type)}
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-gray-900">{question.title}</h3>
                      <p className="text-sm text-gray-600">{question.position}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Building className="h-4 w-4 mr-2" />
                    {question.company_name}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      {question.year}
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(question.difficulty_level)}`}>
                      {question.difficulty_level}
                    </span>
                  </div>

                  {question.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">{question.description}</p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <button
                    onClick={() => handleViewQuestion(question)}
                    className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </button>
                  
                  <div className="flex space-x-2">
                    {question.question_file_path && (
                      <button
                        onClick={() => handleDownloadFile(question.question_file_path!, question.question_file_name || 'question.pdf')}
                        className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50"
                        title="Download Question"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {filteredQuestions.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <FileText className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No PYQ questions found</h3>
              <p className="text-gray-500">Try adjusting your search criteria or check back later for new questions.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentPlacementResources; 