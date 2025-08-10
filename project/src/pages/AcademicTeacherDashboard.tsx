import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Users, 
  ClipboardList,
  FileText,
  BarChart2,
  PenTool,
  Settings,
  Book,
  ArrowLeft,
  Eye,
  Edit,
  Search,
  Video,
  HelpCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface TestData {
  id: string;
  title: string;
  subject: string;
  created_at: string;
  is_active: boolean;
}

interface TeacherProfile {
  id: string;
  name: string;
  email: string;
}

const AcademicTeacherDashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [tests, setTests] = useState<TestData[]>([]);
  const [teacherProfile, setTeacherProfile] = useState<TeacherProfile | null>(null);
  const [totalStudents, setTotalStudents] = useState(0);
  const [activeTests, setActiveTests] = useState(0);
  const [averageScore, setAverageScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showNewTestModal, setShowNewTestModal] = useState(false);
  const [showEditTestModal, setShowEditTestModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState<any>(null);

  const menuItems = [
    {
      id: 'tests',
      title: 'Test Management',
      icon: <ClipboardList className="h-8 w-8" />, 
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      description: 'Create and manage tests'
    },
    {
      id: 'assignments',
      title: 'Assignments',
      icon: <FileText className="h-8 w-8" />, 
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      description: 'Manage student assignments'
    },
    {
      id: 'materials',
      title: 'Course Materials',
      icon: <Book className="h-8 w-8" />, 
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      description: 'Upload and manage study materials'
    },
    {
      id: 'video-tutorials',
      title: 'Video Tutorials',
      icon: <Video className="h-8 w-8" />, 
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      description: 'Upload and manage video tutorials'
    },
    {
      id: 'student-results',
      title: 'Student Results',
      icon: <BarChart2 className="h-8 w-8" />, 
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
      description: 'View student test results'
    },
    {
      id: 'grades',
      title: 'Assignment Review',
      icon: <PenTool className="h-8 w-8" />, 
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
      description: 'Review student assignment submissions'
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: <Settings className="h-8 w-8" />, 
      color: 'from-gray-500 to-gray-600',
      bgColor: 'bg-gray-50',
      iconColor: 'text-gray-600',
      description: 'Manage account settings'
    },
    {
      id: 'faq',
      title: 'FAQ & Help',
      icon: <HelpCircle className="h-8 w-8" />, 
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      description: 'Find answers to common questions'
    }
  ];

  const handleMenuClick = (id: string) => {
    setActiveMenu(id);
    if (id === 'tests') {
      navigate('/academic/teacher/test-management');
    } else if (id === 'assignments') {
      navigate('/academic/teacher/assignments');
    } else if (id === 'materials') {
      navigate('/academic/teacher/course-materials');
    } else if (id === 'video-tutorials') {
      navigate('/academic/teacher/video-tutorials');
    } else if (id === 'student-results') {
      navigate('/academic/teacher/test-results');
    } else if (id === 'grades') {
      navigate('/academic/teacher/assignment-review');
    } else if (id === 'faq') {
      navigate('/faq');
    } else {
      console.log(`Clicked menu item: ${id}`);
    }
  };

  useEffect(() => {
    fetchTeacherData();
  }, []);

  const fetchTeacherData = async () => {
    try {
      setLoading(true);
      // Fetch teacher profile (assume user is in localStorage/session)
      const userId = localStorage.getItem('user_id');
      if (!userId) return;
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (profileData) {
        setTeacherProfile({
          id: profileData.id,
          name: profileData.full_name || 'Teacher',
          email: profileData.email || ''
        });
      }
      // Fetch tests from academic_tests
      const { data: testsData } = await supabase
        .from('academic_tests')
        .select('*')
        .order('created_at', { ascending: false });
      if (testsData) {
        setTests(testsData);
        setActiveTests(testsData.filter(test => test.is_active).length);
      }
      setTotalStudents(156);
      setAverageScore(76);
    } catch (error) {
      console.error('Error fetching teacher data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditTest = (testId: string) => {
    const testToEdit = tests.find((test) => test.id === testId);
    if (testToEdit) {
      setSelectedTest(testToEdit);
      setShowEditTestModal(true);
    }
  };

  const filteredTests = tests.filter((test) => {
    const matchesSearch = test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         test.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && test.is_active) ||
                         (filterStatus === 'inactive' && !test.is_active);
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {showNewTestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Test Created Successfully!</h2>
            <p className="text-gray-600 mb-6">The test has been successfully created.</p>
            <button
              onClick={() => setShowNewTestModal(false)}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showEditTestModal && selectedTest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Edit Test</h2>
            <p className="text-gray-600 mb-6">Edit functionality will be implemented here.</p>
            <button
              onClick={() => setShowEditTestModal(false)}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/academic/teacher-main-dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span className="text-base font-medium">Back to Main Dashboard</span>
          </button>
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Academic Teacher Dashboard</h1>
            <p className="text-lg text-gray-600">Welcome back, {teacherProfile?.name || 'Teacher'}! 👋</p>
          </div>
        </div>
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-semibold text-gray-900">{totalStudents}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <ClipboardList className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Tests</p>
                <p className="text-2xl font-semibold text-gray-900">{activeTests}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-lg">
                <BarChart2 className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-2xl font-semibold text-gray-900">{averageScore}%</p>
              </div>
            </div>
          </div>
        </div>
        {/* Menu Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map((item) => (
              <div
                key={item.id}
                className="group bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-200 transform hover:scale-105 border-2 border-transparent hover:border-gray-200"
                onClick={() => handleMenuClick(item.id)}
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
        {/* Test Management */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">Recent Tests</h2>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search tests..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              <select
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Test Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTests.map((test) => (
                  <tr key={test.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{test.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{test.subject}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(test.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          test.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {test.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditTest(test.id)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                          title="Edit Test"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/academic/teacher/test-results/${test.id}`)}
                          className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 transition-colors"
                          title="View Results"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredTests.length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">
                <ClipboardList className="h-12 w-12 mx-auto" />
              </div>
              <p className="text-gray-500">No tests found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AcademicTeacherDashboard; 