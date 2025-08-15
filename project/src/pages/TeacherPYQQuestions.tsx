import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  Trash2, 
  FileText, 
  Building, 
  Target, 
  Clock,
  Upload,
  CheckCircle,
  Download,
  Eye
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
  created_at: string;
  is_active: boolean;
}

export const TeacherPYQQuestions: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [pyqQuestions, setPyqQuestions] = useState<PYQQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
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
    questionFile: null as File | null,
    answerFile: null as File | null
  });

  useEffect(() => {
    if (user?.id) {
      fetchPYQQuestions();
    }
  }, [user]);

  const fetchPYQQuestions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pyq_questions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching PYQ questions:', error);
        return;
      }

      if (data) {
        setPyqQuestions(data);
      }
    } catch (error) {
      console.error('Error fetching PYQ questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadPYQ = async () => {
    if (!user?.id) {
      alert('Please log in to upload PYQ questions.');
      return;
    }

    if (!uploadForm.title.trim() || !uploadForm.company_name.trim() || !uploadForm.position.trim()) {
      alert('Please fill in all required fields: Title, Company Name, and Position');
      return;
    }

    try {
      setIsUploading(true);
      let questionFileUrl = null;
      let answerFileUrl = null;

      if (uploadForm.questionFile) {
        const questionFileName = `${Date.now()}_${uploadForm.questionFile.name}`;
        const { data: questionData, error: questionError } = await supabase.storage
          .from('pyq-files')
          .upload(questionFileName, uploadForm.questionFile);
        
        if (questionError) {
          console.error('Error uploading question file:', questionError);
          throw questionError;
        }
        questionFileUrl = questionData?.path;
      }

      if (uploadForm.answerFile) {
        const answerFileName = `${Date.now()}_${uploadForm.answerFile.name}`;
        const { data: answerData, error: answerError } = await supabase.storage
          .from('pyq-files')
          .upload(answerFileName, uploadForm.answerFile);
        
        if (answerError) {
          console.error('Error uploading answer file:', answerError);
          throw answerError;
        }
        answerFileUrl = answerData?.path;
      }

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
          question_file_path: questionFileUrl,
          question_file_name: uploadForm.questionFile?.name,
          answer_file_path: answerFileUrl,
          answer_file_name: uploadForm.answerFile?.name,
          created_by: user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Error inserting PYQ question:', error);
        throw error;
      }

      if (data) {
        setPyqQuestions(prev => [data, ...prev]);
        setShowUploadModal(false);
        resetUploadForm();
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
      }
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
      questionFile: null,
      answerFile: null
    });
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (confirm('Are you sure you want to delete this PYQ question?')) {
      try {
        await supabase
          .from('pyq_questions')
          .delete()
          .eq('id', questionId);

        setPyqQuestions(prev => prev.filter(q => q.id !== questionId));
      } catch (error) {
        console.error('Error deleting PYQ question:', error);
      }
    }
  };

  const filteredQuestions = pyqQuestions.filter((question) => {
    return question.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           question.company_name.toLowerCase().includes(searchQuery.toLowerCase());
  });

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

  if (!user?.id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-gray-600 font-medium">Please log in to access PYQ questions.</p>
        </div>
      </div>
    );
  }

  // Check if user is a teacher
  const [userProfile, setUserProfile] = useState<any>(null);
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user?.id) {
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        setUserProfile(data);
      }
    };
    fetchUserProfile();
  }, [user]);

  if (userProfile && userProfile.role !== 'teacher') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-gray-600 font-medium">Access denied. Only teachers can manage PYQ questions.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading PYQ questions...</p>
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
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter question title"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
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
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    value={uploadForm.position}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, position: e.target.value }))}
                    placeholder="e.g., Software Engineer"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    value={uploadForm.year}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Question Type</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
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
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Question File (Optional)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <input
                    type="file"
                    className="w-full"
                    onChange={(e) => setUploadForm(prev => ({ ...prev, questionFile: e.target.files?.[0] || null }))}
                    accept=".pdf,.doc,.docx,.txt"
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    {uploadForm.questionFile ? `Selected: ${uploadForm.questionFile.name}` : 'Click to upload question file'}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Answer File (Optional)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <input
                    type="file"
                    className="w-full"
                    onChange={(e) => setUploadForm(prev => ({ ...prev, answerFile: e.target.files?.[0] || null }))}
                    accept=".pdf,.doc,.docx,.txt"
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    {uploadForm.answerFile ? `Selected: ${uploadForm.answerFile.name}` : 'Click to upload answer file'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  resetUploadForm();
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUploadPYQ}
                disabled={isUploading}
                className={`px-4 py-2 rounded-lg flex items-center ${
                  isUploading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
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
            onClick={() => navigate('/teacher-placement-dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span className="text-base font-medium">Back to Placement Dashboard</span>
          </button>
          
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">PYQ Questions Management</h1>
            <p className="text-lg text-gray-600">Upload and manage Previous Year Questions</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Questions</p>
                <p className="text-2xl font-semibold text-gray-900">{pyqQuestions.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Building className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Companies</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {new Set(pyqQuestions.map(q => q.company_name)).size}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
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
        </div>

        {/* PYQ Questions Management */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">PYQ Questions</h2>
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              Upload PYQ
            </button>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search PYQ questions..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* PYQ Questions Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Question</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Difficulty</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Files</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredQuestions.map((question) => (
                  <tr key={question.id} className="hover:bg-gray-50">
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-1">
                        {question.question_file_path && (
                          <span className="text-green-600 text-xs">📄 Q</span>
                        )}
                        {question.answer_file_path && (
                          <span className="text-blue-600 text-xs">📄 A</span>
                        )}
                        {!question.question_file_path && !question.answer_file_path && (
                          <span className="text-gray-400 text-xs">No files</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleDeleteQuestion(question.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                        title="Delete Question"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
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
              <p className="text-gray-500">No PYQ questions found. Start by uploading some questions!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherPYQQuestions;
