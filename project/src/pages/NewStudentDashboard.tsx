import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  BookOpen, 
  FileText, 
  ClipboardList, 
  BarChart2, 
  Calendar,
  Settings,
  GraduationCap,
  Target,
  Award,
  Clock,
  Book,
  X,
  TrendingUp,
  Users,
  Play
} from 'lucide-react';
import { TestCompletionStatus } from '../components/TestCompletionStatus';
import { useAuthStore } from '../store/authStore';

interface Test {
  id: string;
  title: string;
  subject: string;
  duration: number;
  teacher_id: string;
  created_at: string;
  is_scheduled: boolean;
  access_window_start: string | null;
  access_window_end: string | null;
  allow_multiple_attempts: boolean;
}

interface Subject {
  id: string;
  name: string;
  code: string;
  description?: string;
}

const GateFeatureCards = [
  {
    id: 'available-tests',
    title: 'Available Tests',
    icon: <FileText className="h-10 w-10" />,
    description: 'See and take your available GATE tests',
    color: 'bg-red-500',
    action: (_navigate: any, setShowTestsModal: any) => setShowTestsModal(true)
  },
  {
    id: 'study-materials',
    title: 'Study Materials',
    icon: <BookOpen className="h-10 w-10" />,
    description: 'Access curated GATE study resources',
    color: 'bg-pink-500',
    action: (navigate: any, _setShowTestsModal: any) => navigate('/study-materials')
  },
  {
    id: 'assignments',
    title: 'Assignments',
    icon: <ClipboardList className="h-10 w-10" />,
    description: 'View and submit GATE assignments',
    color: 'bg-blue-500',
    action: (navigate: any, _setShowTestsModal: any) => navigate('/student/assignments')
  },
  {
    id: 'results',
    title: 'Test Results',
    icon: <Award className="h-10 w-10" />,
    description: 'Check your GATE test results',
    color: 'bg-green-500',
    action: (navigate: any, _setShowTestsModal: any) => navigate('/student-test-results')
  },
  {
    id: 'schedule',
    title: 'Preparation Schedule',
    icon: <Calendar className="h-10 w-10" />,
    description: 'View and manage your GATE preparation schedule',
    color: 'bg-yellow-500',
    action: (navigate: any, _setShowTestsModal: any) => navigate('/gate/schedule')
  },
  {
    id: 'progress',
    title: 'Progress Tracker',
    icon: <TrendingUp className="h-10 w-10" />,
    description: 'Monitor your preparation progress',
    color: 'bg-indigo-500',
    action: (navigate: any, _setShowTestsModal: any) => navigate('/gate/progress')
  },
  {
    id: 'video-tutorials',
    title: 'Video Tutorials',
    icon: <Play className="h-10 w-10" />,
    description: 'Watch expert GATE video tutorials and master concepts',
    color: 'bg-purple-500',
    action: (navigate: any, _setShowTestsModal: any) => navigate('/gate/video-tutorials')
  },
  {
    id: 'mentorship',
    title: 'Mentorship',
    icon: <Users className="h-10 w-10" />,
    description: 'Connect with mentors for guidance',
    color: 'bg-emerald-500',
    action: (navigate: any, _setShowTestsModal: any) => navigate('/gate/mentorship')
  }
];

export const NewStudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const [availableTests, setAvailableTests] = useState<Test[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTestsModal, setShowTestsModal] = useState(false);
  const [completedTestIds, setCompletedTestIds] = useState<string[]>([]);

  useEffect(() => {
    // Check if we should show tests modal from navigation
    if (location.state?.showTests) {
      setShowTestsModal(true);
      // Clear the state to prevent showing modal on refresh
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, location.pathname]);

  useEffect(() => {
    if (user) {
      fetchAvailableTests();
      fetchCompletedTests();
    }
  }, [user]);

  const fetchCompletedTests = async () => {
    try {
      const { data: results, error } = await supabase
        .from('test_results')
        .select('test_id')
        .eq('student_id', user?.id)
        .eq('status', 'completed');

      if (error) throw error;

      const completedIds = results?.map(result => result.test_id) || [];
      setCompletedTestIds(completedIds);
    } catch (error) {
      console.error('Error fetching completed tests:', error);
    }
  };

  const isTestAvailableNow = (test: any) => {
    if (!test.is_scheduled) return true;
    const now = new Date();
    const start = test.access_window_start ? new Date(test.access_window_start) : null;
    const end = test.access_window_end ? new Date(test.access_window_end) : null;
    if (start && now < start) return false;
    if (end && now > end) return false;
    return true;
  };

  const fetchAvailableTests = async () => {
    try {
      const { data: tests, error } = await supabase
        .from('tests')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter out completed tests and those not in access window
      const filteredTests = (tests?.filter(test =>
        (test.allow_multiple_attempts || !completedTestIds.includes(test.id)) && isTestAvailableNow(test)
      )) || [];
      setAvailableTests(filteredTests);
    } catch (error) {
      console.error('Error fetching available tests:', error);
    }
  };

  // Update fetchAvailableTests when completedTestIds changes
  useEffect(() => {
    if (user) {
      fetchAvailableTests();
    }
  }, [completedTestIds]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch subjects from Supabase
        const { data: subjectsData, error: subjectsError } = await supabase
          .from('subjects')
          .select('*');

        if (subjectsError) throw subjectsError;

        setSubjects(subjectsData || []);
      } catch (error: any) {
        console.error('Error fetching data:', error);
        setError(error.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getSubjectName = (subjectCode: string) => {
    const subject = subjects.find(s => s.code === subjectCode);
    return subject ? subject.name : 'Unknown Subject';
  };

  const handleStartTest = (testId: string) => {
    navigate(`/take-test/${testId}`);
  };

  const handleMenuClick = (id: string) => {
    if (id === 'tests') {
      setShowTestsModal(true);
    } else if (id === 'study-materials') {
      navigate('/study-materials');
    } else if (id === 'assignments') {
      navigate('/student/assignments');
    } else {
      console.log(`Clicked menu item: ${id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <button
          onClick={() => navigate('/student-main-dashboard')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left h-5 w-5 mr-2"><path d="m12 19-7-7 7-7"></path><path d="M19 12H5"></path></svg>
          <span className="text-base font-medium">Back to Student Dashboard</span>
        </button>
        {/* Heading */}
        <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-4">GATE Preparation Dashboard</h1>
        <p className="text-center text-lg text-gray-600 mb-10">Access all your GATE resources, practice tests, and progress tools in one place.</p>
        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {GateFeatureCards.map((feature) => (
            <div
              key={feature.id}
              onClick={() => feature.action(navigate, setShowTestsModal)}
              className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center cursor-pointer hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <div className={`${feature.color} p-4 rounded-lg text-white mb-4`}>{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">{feature.title}</h3>
              <p className="text-gray-600 text-center text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
        {/* Tests Modal */}
        {showTestsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full mx-4">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Available Tests</h2>
                  <button
                    onClick={() => setShowTestsModal(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                {availableTests.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No tests available at the moment.</p>
                ) : (
                  <div className="space-y-4">
                    {availableTests.map((test) => (
                      <div
                        key={test.id}
                        className="border rounded-lg p-4 hover:border-indigo-500 cursor-pointer"
                        onClick={() => handleStartTest(test.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">{test.title}</h3>
                            <p className="text-sm text-gray-500">{getSubjectName(test.subject)}</p>
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="h-4 w-4 mr-1" />
                            {test.duration} minutes
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};