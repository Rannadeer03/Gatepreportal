import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Users, 
  BookOpen, 
  CheckCircle, 
  BarChart2, 
  Plus, 
  Search, 
  Filter, 
  Download,
  ClipboardList,
  FileText,
  Calendar,
  Settings,
  GraduationCap,
  Target,
  Award,
  Book,
  PenTool,
  ArrowLeft,
  Eye,
  Edit,
  Trash2,
  Briefcase,
  Upload,
  File,
  Building,
  Clock,
  Tag,
  MessageSquare
} from 'lucide-react';
import { api } from '../services/api';
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
  is_active: boolean;
}

interface TeacherProfile {
  id: string;
  name: string;
  email: string;
}

export const TeacherPlacementDashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [pyqQuestions, setPyqQuestions] = useState<PYQQuestion[]>([]);
  const [teacherProfile, setTeacherProfile] = useState<TeacherProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCompany, setFilterCompany] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<PYQQuestion | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    company_name: '',
    position: '',
    year: new Date().getFullYear(),
    question_type: 'aptitude' as const,
    difficulty_level: 'medium' as const,
    solution: '',
    tags: [] as string[],
    questionFile: null as File | null,
    answerFile: null as File | null
  });

  const placementFeatures = [
    {
      id: 'pyq-questions',
      title: 'PYQ Questions',
      icon: <FileText className="h-8 w-8" />,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      description: 'Upload and manage Previous Year Questions'
    },
    {
      id: 'interview-prep',
      title: 'Interview Preparation',
      icon: <MessageSquare className="h-8 w-8" />,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      description: 'Manage interview preparation materials'
    },
    {
      id: 'resume-templates',
      title: 'Resume Templates',
      icon: <FileText className="h-8 w-8" />,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      description: 'Upload resume templates and guides'
    },
    {
      id: 'company-resources',
      title: 'Company Resources',
      icon: <Building className="h-8 w-8" />,
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
      description: 'Manage company-specific resources'
    },
    {
      id: 'placement-stats',
      title: 'Placement Statistics',
      icon: <BarChart2 className="h-8 w-8" />,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
      description: 'View placement statistics and analytics'
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: <Settings className="h-8 w-8" />,
      color: 'from-gray-500 to-gray-600',
      bgColor: 'bg-gray-50',
      iconColor: 'text-gray-600',
      description: 'Manage placement settings'
    }
  ];

  useEffect(() => {
    fetchTeacherData();
  }, []);

  const fetchTeacherData = async () => {
    try {
      setLoading(true);
      
      // Fetch teacher profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (profileData) {
        setTeacherProfile({
          id: profileData.id,
          name: profileData.full_name || 'Teacher',
          email: profileData.email || user?.email || ''
        });
      }

      // Fetch PYQ questions
      const { data: pyqData } = await supabase
        .from('pyq_questions')
        .select('*')
        .order('created_at', { ascending: false });

      if (pyqData) {
        setPyqQuestions(pyqData);
      }

    } catch (error) {
      console.error('Error fetching teacher data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadPYQ = async () => {
    // Validate required fields
    if (!uploadForm.title.trim() || !uploadForm.company_name.trim() || !uploadForm.position.trim()) {
      alert('Please fill in all required fields: Title, Company Name, and Position');
      return;
    }

    // Validate file sizes (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (uploadForm.questionFile && uploadForm.questionFile.size > maxSize) {
      alert('Question file size must be less than 10MB');
      return;
    }
    if (uploadForm.answerFile && uploadForm.answerFile.size > maxSize) {
      alert('Answer file size must be less than 10MB');
      return;
    }

    try {
      setIsUploading(true);
      let questionFileUrl = null;
      let answerFileUrl = null;

      // Upload question file if provided
      if (uploadForm.questionFile) {
        const questionFileName = `${Date.now()}_${uploadForm.questionFile.name}`;
        const { data: questionData, error: questionError } = await supabase.storage
          .from('pyq-files')
          .upload(questionFileName, uploadForm.questionFile);

        if (questionError) throw questionError;
        questionFileUrl = questionData.path;
      }

      // Upload answer file if provided
      if (uploadForm.answerFile) {
        const answerFileName = `${Date.now()}_${uploadForm.answerFile.name}`;
        const { data: answerData, error: answerError } = await supabase.storage
          .from('pyq-files')
          .upload(answerFileName, uploadForm.answerFile);

        if (answerError) throw answerError;
        answerFileUrl = answerData.path;
      }

      // Create PYQ question record
      const { data, error } = await supabase
        .from('pyq_questions')
        .insert({
          title: uploadForm.title,
          description: uploadForm.description,
          company_name: uploadForm.company_name,
          position: uploadForm.position,
          year: uploadForm.year,
          question_type: uploadForm.question_type,
          difficulty_level: uploadForm.difficulty_level,
          solution: uploadForm.solution,
          tags: uploadForm.tags,
          question_file_path: questionFileUrl,
          question_file_name: uploadForm.questionFile?.name,
          answer_file_path: answerFileUrl,
          answer_file_name: uploadForm.answerFile?.name,
          created_by: user?.id
        })
        .select()
        .single();

      if (error) throw error;

      setPyqQuestions(prev => [data, ...prev]);
      setShowUploadModal(false);
      resetUploadForm();
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);

    } catch (error) {
      console.error('Error uploading PYQ:', error);
      alert('Error uploading PYQ question. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const resetUploadForm = () => {
    setUploadForm({
      title: '',
      description: '',
      company_name: '',
      position: '',
      year: new Date().getFullYear(),
      question_type: 'aptitude',
      difficulty_level: 'medium',
      solution: '',
      tags: [],
      questionFile: null,
      answerFile: null
    });
  };

  const handleEditQuestion = (question: PYQQuestion) => {
    setSelectedQuestion(question);
    setShowEditModal(true);
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (confirm('Are you sure you want to delete this PYQ question?')) {
      try {
        const { error } = await supabase
          .from('pyq_questions')
          .delete()
          .eq('id', questionId);

        if (error) throw error;

        setPyqQuestions(prev => prev.filter(q => q.id !== questionId));
      } catch (error) {
        console.error('Error deleting PYQ question:', error);
        alert('Error deleting PYQ question. Please try again.');
      }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center">
          <CheckCircle className="h-5 w-5 mr-2" />
          <span>PYQ question uploaded successfully!</span>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-xl shadow-xl w-[calc(100vw-2rem)] sm:w-full sm:max-w-2xl mx-4 max-h-[calc(100vh-2rem)] sm:max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Upload PYQ Question</h2>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-medium text-blue-900 mb-2">📋 Upload Instructions:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Fill in all required fields marked with <span className="text-red-500">*</span></li>
                <li>• Upload PDF, DOC, DOCX, or TXT files (max 10MB each)</li>
                <li>• Question files are optional but recommended</li>
                <li>• Answer files help students verify their solutions</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter question title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={3}
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter question description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={uploadForm.company_name}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, company_name: e.target.value }))}
                    placeholder="e.g., Google, Microsoft"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Position <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={uploadForm.position}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, position: e.target.value }))}
                    placeholder="e.g., Software Engineer"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={uploadForm.year}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                    min="2000"
                    max={new Date().getFullYear()}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Question Type</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={uploadForm.question_type}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, question_type: e.target.value as any }))}
                  >
                    <option value="aptitude">Aptitude</option>
                    <option value="technical">Technical</option>
                    <option value="coding">Coding</option>
                    <option value="interview">Interview</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={uploadForm.difficulty_level}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, difficulty_level: e.target.value as any }))}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Solution/Answer</label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={3}
                  value={uploadForm.solution}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, solution: e.target.value }))}
                  placeholder="Enter solution or answer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question File (Optional)
                  <span className="text-xs text-gray-500 ml-1">- PDF, DOC, DOCX, TXT files only</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-green-400 transition-colors">
                  <input
                    type="file"
                    className="w-full"
                    onChange={(e) => setUploadForm(prev => ({ ...prev, questionFile: e.target.files?.[0] || null }))}
                    accept=".pdf,.doc,.docx,.txt"
                    id="question-file"
                  />
                  <label htmlFor="question-file" className="cursor-pointer">
                    <div className="text-center">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        {uploadForm.questionFile ? uploadForm.questionFile.name : 'Click to upload question file'}
                      </p>
                      {uploadForm.questionFile && (
                        <p className="text-xs text-green-600 mt-1">
                          ✓ File selected: {uploadForm.questionFile.name} ({(uploadForm.questionFile.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      )}
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Answer File (Optional)
                  <span className="text-xs text-gray-500 ml-1">- PDF, DOC, DOCX, TXT files only</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-green-400 transition-colors">
                  <input
                    type="file"
                    className="w-full"
                    onChange={(e) => setUploadForm(prev => ({ ...prev, answerFile: e.target.files?.[0] || null }))}
                    accept=".pdf,.doc,.docx,.txt"
                    id="answer-file"
                  />
                  <label htmlFor="answer-file" className="cursor-pointer">
                    <div className="text-center">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        {uploadForm.answerFile ? uploadForm.answerFile.name : 'Click to upload answer file'}
                      </p>
                      {uploadForm.answerFile && (
                        <p className="text-xs text-green-600 mt-1">
                          ✓ File selected: {uploadForm.answerFile.name} ({(uploadForm.answerFile.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      )}
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  resetUploadForm();
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUploadPYQ}
                disabled={isUploading}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center ${
                  isUploading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700'
                } text-white`}
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  'Upload PYQ'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/teacher-main-dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span className="text-base font-medium">Back to Main Dashboard</span>
          </button>
          
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Placement Preparation Dashboard</h1>
            <p className="text-lg text-gray-600">Welcome back, {teacherProfile?.name || 'Teacher'}! 👋</p>
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
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Recent Uploads</p>
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

        {/* Menu Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Placement Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {placementFeatures.map((item) => (
              <div
                key={item.id}
                className="group bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-200 transform hover:scale-105 border-2 border-transparent hover:border-gray-200"
                onClick={() => {
                  if (item.id === 'pyq-questions') {
                    navigate('/teacher/pyq-questions');
                  } else {
                    console.log(`Clicked menu item: ${item.id}`);
                  }
                }}
              >
                <div className={`h-32 bg-gradient-to-br ${item.color} flex items-center justify-center`}>
                  <div className="bg-white bg-opacity-30 rounded-full p-4 shadow-md flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
                    {React.cloneElement(item.icon, { className: 'h-12 w-12 text-white drop-shadow' })}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PYQ Questions Management */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">PYQ Questions</h2>
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Upload PYQ
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
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

          {/* PYQ Questions Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Question
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Difficulty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Year
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredQuestions.map((question) => (
                  <tr key={question.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{question.title}</div>
                      <div className="text-sm text-gray-500">{question.position}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{question.company_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeColor(question.question_type)}`}>
                        {question.question_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getDifficultyColor(question.difficulty_level)}`}>
                        {question.difficulty_level}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{question.year}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditQuestion(question)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                          title="Edit Question"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(question.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                          title="Delete Question"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredQuestions.length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">
                <FileText className="h-12 w-12 mx-auto" />
              </div>
              <p className="text-gray-500">No PYQ questions found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherPlacementDashboard; 