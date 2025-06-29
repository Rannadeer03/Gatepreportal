import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Target, 
  BookOpen, 
  Calendar, 
  TrendingUp, 
  FileText, 
  Clock,
  Award,
  BarChart2,
  Book,
  Play,
  CheckCircle,
  X,
  ArrowLeft
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

interface GateTest {
  id: string;
  title: string;
  subject: string;
  duration: number;
  totalQuestions: number;
  difficulty: 'easy' | 'medium' | 'hard';
  isCompleted: boolean;
  score?: number;
  maxScore: number;
}

interface StudyMaterial {
  id: string;
  title: string;
  subject: string;
  type: 'pdf' | 'video' | 'notes';
  description: string;
  duration?: string;
}

export const GatePreparationDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [gateTests, setGateTests] = useState<GateTest[]>([]);
  const [studyMaterials, setStudyMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTestModal, setShowTestModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState<GateTest | null>(null);

  // Mock data for GATE tests
  const mockGateTests: GateTest[] = [
    {
      id: '1',
      title: 'GATE CS: Computer Networks',
      subject: 'Computer Networks',
      duration: 180,
      totalQuestions: 65,
      difficulty: 'medium',
      isCompleted: false,
      maxScore: 100
    },
    {
      id: '2',
      title: 'GATE CS: Data Structures',
      subject: 'Data Structures',
      duration: 180,
      totalQuestions: 65,
      difficulty: 'hard',
      isCompleted: true,
      score: 78,
      maxScore: 100
    },
    {
      id: '3',
      title: 'GATE CS: Algorithms',
      subject: 'Algorithms',
      duration: 180,
      totalQuestions: 65,
      difficulty: 'hard',
      isCompleted: false,
      maxScore: 100
    },
    {
      id: '4',
      title: 'GATE CS: Operating Systems',
      subject: 'Operating Systems',
      duration: 180,
      totalQuestions: 65,
      difficulty: 'medium',
      isCompleted: false,
      maxScore: 100
    }
  ];

  // Mock data for study materials
  const mockStudyMaterials: StudyMaterial[] = [
    {
      id: '1',
      title: 'GATE CS Complete Syllabus',
      subject: 'Computer Science',
      type: 'pdf',
      description: 'Complete syllabus and important topics for GATE CS 2024'
    },
    {
      id: '2',
      title: 'Data Structures & Algorithms',
      subject: 'Algorithms',
      type: 'video',
      description: 'Complete course on DSA for GATE preparation',
      duration: '45 hours'
    },
    {
      id: '3',
      title: 'Computer Networks Notes',
      subject: 'Computer Networks',
      type: 'notes',
      description: 'Comprehensive notes on computer networks'
    },
    {
      id: '4',
      title: 'Operating Systems Concepts',
      subject: 'Operating Systems',
      type: 'video',
      description: 'Detailed explanation of OS concepts',
      duration: '32 hours'
    }
  ];

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setGateTests(mockGateTests);
      setStudyMaterials(mockStudyMaterials);
      setLoading(false);
    }, 1000);
  }, []);

  const handleStartTest = (test: GateTest) => {
    setSelectedTest(test);
    setShowTestModal(true);
  };

  const confirmStartTest = () => {
    if (selectedTest) {
      setShowTestModal(false);
      navigate(`/gate-test/${selectedTest.id}`);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="h-6 w-6" />;
      case 'video': return <Play className="h-6 w-6" />;
      case 'notes': return <Book className="h-6 w-6" />;
      default: return <BookOpen className="h-6 w-6" />;
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tests Completed</p>
              <p className="text-2xl font-semibold text-gray-900">
                {gateTests.filter(t => t.isCompleted).length}/{gateTests.length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-lg">
              <Award className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Score</p>
              <p className="text-2xl font-semibold text-gray-900">78%</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-lg">
              <BookOpen className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Materials</p>
              <p className="text-2xl font-semibold text-gray-900">{studyMaterials.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-orange-100 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Study Hours</p>
              <p className="text-2xl font-semibold text-gray-900">156</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Completed GATE CS: Data Structures</p>
                <p className="text-sm text-gray-500">Score: 78/100 • 2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center">
              <BookOpen className="h-5 w-5 text-blue-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Started Computer Networks Notes</p>
                <p className="text-sm text-gray-500">1 day ago</p>
              </div>
            </div>
            <div className="flex items-center">
              <Play className="h-5 w-5 text-purple-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Watched DSA Video Lecture</p>
                <p className="text-sm text-gray-500">2 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTests = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">GATE Practice Tests</h3>
        <div className="flex space-x-2">
          <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
            <option>All Subjects</option>
            <option>Computer Networks</option>
            <option>Data Structures</option>
            <option>Algorithms</option>
            <option>Operating Systems</option>
          </select>
          <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
            <option>All Difficulties</option>
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gateTests.map((test) => (
          <div key={test.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-lg font-semibold text-gray-900">{test.title}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(test.difficulty)}`}>
                  {test.difficulty}
                </span>
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  {test.duration} minutes
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <FileText className="h-4 w-4 mr-2" />
                  {test.totalQuestions} questions
                </div>
                {test.isCompleted && test.score && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Award className="h-4 w-4 mr-2" />
                    Score: {test.score}/{test.maxScore}
                  </div>
                )}
              </div>

              <button
                onClick={() => handleStartTest(test)}
                disabled={test.isCompleted}
                className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
                  test.isCompleted
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {test.isCompleted ? 'Completed' : 'Start Test'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderMaterials = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Study Materials</h3>
        <div className="flex space-x-2">
          <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
            <option>All Types</option>
            <option>PDF</option>
            <option>Video</option>
            <option>Notes</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {studyMaterials.map((material) => (
          <div key={material.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  {getMaterialIcon(material.type)}
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-semibold text-gray-900">{material.title}</h4>
                  <p className="text-sm text-gray-500">{material.subject}</p>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm mb-4">{material.description}</p>
              
              {material.duration && (
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <Clock className="h-4 w-4 mr-2" />
                  {material.duration}
                </div>
              )}

              <button className="w-full py-2 px-4 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors">
                Access Material
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSchedule = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">GATE 2024 Important Dates</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center p-4 bg-blue-50 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600 mr-4" />
              <div>
                <p className="font-medium text-gray-900">GATE 2024 Registration Opens</p>
                <p className="text-sm text-gray-600">August 30, 2023</p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-green-50 rounded-lg">
              <Calendar className="h-6 w-6 text-green-600 mr-4" />
              <div>
                <p className="font-medium text-gray-900">Last Date for Registration</p>
                <p className="text-sm text-gray-600">October 20, 2023</p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-yellow-50 rounded-lg">
              <Calendar className="h-6 w-6 text-yellow-600 mr-4" />
              <div>
                <p className="font-medium text-gray-900">Admit Card Release</p>
                <p className="text-sm text-gray-600">January 3, 2024</p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-red-50 rounded-lg">
              <Calendar className="h-6 w-6 text-red-600 mr-4" />
              <div>
                <p className="font-medium text-gray-900">GATE 2024 Exam</p>
                <p className="text-sm text-gray-600">February 3, 4, 10, 11, 2024</p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-purple-50 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600 mr-4" />
              <div>
                <p className="font-medium text-gray-900">Result Declaration</p>
                <p className="text-sm text-gray-600">March 16, 2024</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/student-main-dashboard')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left h-5 w-5 mr-2"><path d="m12 19-7-7 7-7"></path><path d="M19 12H5"></path></svg>
          <span className="text-base font-medium">Back to Student Dashboard</span>
        </button>
        {/* GATE Preparation Dashboard Heading */}
        <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-4">GATE Preparation Dashboard</h1>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: <BarChart2 className="h-5 w-5" /> },
                { id: 'tests', label: 'Practice Tests', icon: <Target className="h-5 w-5" /> },
                { id: 'materials', label: 'Study Materials', icon: <BookOpen className="h-5 w-5" /> },
                { id: 'schedule', label: 'Schedule', icon: <Calendar className="h-5 w-5" /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.icon}
                  <span className="ml-2">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'tests' && renderTests()}
            {activeTab === 'materials' && renderMaterials()}
            {activeTab === 'schedule' && renderSchedule()}
          </div>
        </div>

        {/* Test Start Modal */}
        {showTestModal && selectedTest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-md w-full mx-4">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Start Test</h2>
                  <button
                    onClick={() => setShowTestModal(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{selectedTest.title}</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>Duration: {selectedTest.duration} minutes</p>
                    <p>Questions: {selectedTest.totalQuestions}</p>
                    <p>Difficulty: {selectedTest.difficulty}</p>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowTestModal(false)}
                    className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmStartTest}
                    className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Start Test
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
