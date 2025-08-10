import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, BookOpen, User, Settings, Bell, HelpCircle, MessageSquare, FileText, Target, Award, Calendar, Building } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'student' | 'teacher' | 'technical';
}

const faqData: FAQItem[] = [
  // General Questions
  {
    id: 'general-1',
    question: 'What is the Gate Preparation Portal?',
    answer: 'The Gate Preparation Portal is a comprehensive online platform designed to help students prepare for GATE (Graduate Aptitude Test in Engineering) and other competitive exams. It provides study materials, practice tests, assignments, and resources for both students and teachers.',
    category: 'general'
  },
  {
    id: 'general-2',
    question: 'How do I get started with the portal?',
    answer: 'To get started, create an account using your email address. Choose your role (Student or Teacher) and complete your profile. Students can access study materials and take tests, while teachers can create and manage content.',
    category: 'general'
  },
  {
    id: 'general-3',
    question: 'What features are available for students?',
    answer: 'Students can access study materials, take practice tests, submit assignments, view their test results, access placement resources, and track their progress. The platform also provides notifications for new content and deadlines.',
    category: 'general'
  },
  {
    id: 'general-4',
    question: 'What features are available for teachers?',
    answer: 'Teachers can create and manage tests, upload study materials, assign homework, review student submissions, track student performance, and manage course content. They also have access to analytics and reporting tools.',
    category: 'general'
  },

  // Student Questions
  {
    id: 'student-1',
    question: 'How do I take a test?',
    answer: 'Navigate to the test section from your dashboard, select a test you want to take, and click "Start Test". Read the instructions carefully, answer all questions, and submit when finished. You can review your answers before submitting.',
    category: 'student'
  },
  {
    id: 'student-2',
    question: 'Can I retake a test?',
    answer: 'This depends on the test settings. Some tests allow multiple attempts, while others are one-time only. Check the test details before starting. Your teacher can configure this setting when creating tests.',
    category: 'student'
  },
  {
    id: 'student-3',
    question: 'How do I access study materials?',
    answer: 'Go to the "Study Materials" section from your dashboard. You can browse materials by subject, download files, and access video content. Materials are organized by topics and difficulty levels.',
    category: 'student'
  },
  {
    id: 'student-4',
    question: 'How do I submit assignments?',
    answer: 'Navigate to the "Assignments" section, select the assignment you want to submit, upload your file (PDF, DOC, or other supported formats), add any comments if needed, and click "Submit Assignment".',
    category: 'student'
  },
  {
    id: 'student-5',
    question: 'How can I track my progress?',
    answer: 'View your progress in the "Test Results" section. You can see your scores, compare performance across different subjects, and track improvement over time. The dashboard also shows your completion status for various activities.',
    category: 'student'
  },
  {
    id: 'student-6',
    question: 'What placement resources are available?',
    answer: 'The placement section includes resume builders, interview preparation materials, company profiles, placement calendars, mock tests, and study resources for placement preparation.',
    category: 'student'
  },

  // Teacher Questions
  {
    id: 'teacher-1',
    question: 'How do I create a test?',
    answer: 'Go to "Create Test" from your dashboard, fill in the test details (title, subject, duration, etc.), add questions one by one or bulk upload, set the test parameters, and publish it for students.',
    category: 'teacher'
  },
  {
    id: 'teacher-2',
    question: 'How do I upload study materials?',
    answer: 'Navigate to "Course Materials", click "Upload Material", select the subject, add a title and description, upload your file (PDF, video, etc.), and publish. You can organize materials by topics and difficulty levels.',
    category: 'teacher'
  },
  {
    id: 'teacher-3',
    question: 'How do I review student submissions?',
    answer: 'Go to "Assignment Review" to see all student submissions. You can view submitted files, grade assignments, provide feedback, and track submission status. Notifications will alert you to new submissions.',
    category: 'teacher'
  },
  {
    id: 'teacher-4',
    question: 'Can I see student performance analytics?',
    answer: 'Yes, access the "Test Results" section to view detailed analytics including average scores, question-wise performance, student rankings, and progress trends. You can export reports for further analysis.',
    category: 'teacher'
  },
  {
    id: 'teacher-5',
    question: 'How do I manage assignments?',
    answer: 'Create assignments in the "Assignments" section, set due dates, upload reference materials, and publish. You can track submission status, send reminders, and review submissions with grading tools.',
    category: 'teacher'
  },

  // Technical Questions
  {
    id: 'technical-1',
    question: 'What browsers are supported?',
    answer: 'The portal works best on Chrome, Firefox, Safari, and Edge. Make sure you have JavaScript enabled and a stable internet connection for the best experience.',
    category: 'technical'
  },
  {
    id: 'technical-2',
    question: 'What file formats are supported for uploads?',
    answer: 'Supported formats include PDF, DOC, DOCX, PPT, PPTX, JPG, PNG, MP4, and other common file types. Maximum file size is typically 50MB per file.',
    category: 'technical'
  },
  {
    id: 'technical-3',
    question: 'How do I reset my password?',
    answer: 'Go to the login page and click "Forgot Password". Enter your email address, and you\'ll receive a password reset link. Follow the instructions in the email to create a new password.',
    category: 'technical'
  },
  {
    id: 'technical-4',
    question: 'How do I update my profile?',
    answer: 'Click on your profile icon in the header, select "Your Profile" or "Settings", and update your information. You can change your avatar, personal details, notification preferences, and other settings.',
    category: 'technical'
  },
  {
    id: 'technical-5',
    question: 'How do notifications work?',
    answer: 'You\'ll receive notifications for new assignments, test announcements, submission deadlines, grades, and other important updates. You can manage notification preferences in your settings.',
    category: 'technical'
  },
  {
    id: 'technical-6',
    question: 'Is my data secure?',
    answer: 'Yes, we use industry-standard security measures including encryption, secure authentication, and regular backups. Your personal information and academic data are protected and never shared with third parties.',
    category: 'technical'
  }
];

const FAQ: React.FC = () => {
  const [openItems, setOpenItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, profile, isLoading } = useAuthStore();
  const navigate = useNavigate();

  // Determine user role and set appropriate default category
  const getUserRole = () => {
    if (!user) return 'general';
    
    // The role is stored in the profile object, not the user object
    const role = profile?.role;
    
    if (role === 'student') return 'student';
    if (role === 'teacher') return 'teacher';
    if (role === 'admin' || role === 'super_admin') return 'teacher';
    
    // Fallback: check user email for role hints
    if (user.email && user.email.includes('student')) return 'student';
    if (user.email && user.email.includes('teacher')) return 'teacher';
    
    return 'general';
  };

  const userRole = getUserRole();
  
  // Show loading state while profile is loading
  if (isLoading || (user && !profile)) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading FAQ...</p>
          </div>
        </div>
      </div>
    );
  }
  
  const [activeCategory, setActiveCategory] = useState<'all' | 'general' | 'student' | 'teacher' | 'technical'>(userRole);

  const toggleItem = (itemId: string) => {
    setOpenItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Filter FAQ based on active category and user role
  const getFilteredFAQ = () => {
    if (activeCategory === 'all') {
      // Show all categories that the user has access to
      if (userRole === 'student') {
        return faqData.filter(item => 
          item.category === 'general' || 
          item.category === 'student' || 
          item.category === 'technical'
        );
      } else if (userRole === 'teacher') {
        return faqData.filter(item => 
          item.category === 'general' || 
          item.category === 'teacher' || 
          item.category === 'technical'
        );
      } else {
        // General users see only general and technical
        return faqData.filter(item => 
          item.category === 'general' || 
          item.category === 'technical'
        );
      }
    } else {
      // Show only the selected category
      return faqData.filter(item => item.category === activeCategory);
    }
  };

  const filteredFAQ = getFilteredFAQ().filter(item =>
    searchQuery === '' || 
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get available categories based on user role
  const getAvailableCategories = () => {
    const baseCategories = [
      { id: 'general', name: 'General', icon: <BookOpen className="h-5 w-5" /> },
      { id: 'technical', name: 'Technical', icon: <Settings className="h-5 w-5" /> }
    ];

    if (userRole === 'student') {
      return [
        { id: 'all', name: 'All Questions', icon: <HelpCircle className="h-5 w-5" /> },
        ...baseCategories,
        { id: 'student', name: 'Student', icon: <User className="h-5 w-5" /> }
      ];
    } else if (userRole === 'teacher') {
      return [
        { id: 'all', name: 'All Questions', icon: <HelpCircle className="h-5 w-5" /> },
        ...baseCategories,
        { id: 'teacher', name: 'Teacher', icon: <Award className="h-5 w-5" /> }
      ];
    } else {
      // General users see only general and technical
      return [
        { id: 'all', name: 'All Questions', icon: <HelpCircle className="h-5 w-5" /> },
        ...baseCategories
      ];
    }
  };

  const categories = getAvailableCategories();

  // Auto-open relevant questions based on user role
  useEffect(() => {
    const autoOpenQuestions = () => {
      const questionsToOpen: string[] = [];
      
      if (userRole === 'student') {
        questionsToOpen.push('student-1', 'general-1'); // How to take test, What is portal
      } else if (userRole === 'teacher') {
        questionsToOpen.push('teacher-1', 'general-1'); // How to create test, What is portal
      } else {
        questionsToOpen.push('general-1'); // What is portal
      }
      
      setOpenItems(questionsToOpen);
    };

    autoOpenQuestions();
  }, [userRole, profile]); // Also depend on profile to re-run when profile loads

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-4">
            Find answers to common questions about the Gate Preparation Portal. 
            Can't find what you're looking for? Contact our support team.
          </p>
                     {user && (
             <div className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg">
               <User className="h-4 w-4 mr-2" />
               <span className="text-sm font-medium">
                 Showing {userRole === 'student' ? 'Student' : userRole === 'teacher' ? 'Teacher' : 'General'} related questions
                 {profile?.role && ` (Logged in as: ${profile.role})`}
               </span>
             </div>
           )}
        </div>

        {/* Search and Category Filter */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="max-w-md mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <HelpCircle className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeCategory === category.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {category.icon}
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredFAQ.length > 0 ? (
            filteredFAQ.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              >
                <button
                  onClick={() => toggleItem(item.id)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-900 pr-4">
                    {item.question}
                  </span>
                  {openItems.includes(item.id) ? (
                    <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                  )}
                </button>
                {openItems.includes(item.id) && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-700 leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No questions found
              </h3>
              <p className="text-gray-600 mb-4">
                {searchQuery 
                  ? `No questions match "${searchQuery}". Try different keywords or browse all categories.`
                  : 'No questions available for your current selection.'
                }
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                }}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                View All Questions
              </button>
            </div>
          )}
        </div>

        {/* Contact Support */}
        <div className="mt-12 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center">
            <MessageSquare className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Still have questions?
            </h3>
            <p className="text-gray-600 mb-4">
              Can't find the answer you're looking for? Our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate('/support')}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Contact Support
              </button>
              <button
                onClick={() => navigate('/tutorials')}
                className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                View Tutorials
              </button>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-blue-600" />
              <div>
                <h4 className="font-medium text-gray-900">Study Materials</h4>
                <p className="text-sm text-gray-600">Access course materials and resources</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <Target className="h-8 w-8 text-green-600" />
              <div>
                <h4 className="font-medium text-gray-900">Practice Tests</h4>
                <p className="text-sm text-gray-600">Take mock tests and assessments</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <Building className="h-8 w-8 text-purple-600" />
              <div>
                <h4 className="font-medium text-gray-900">Placement Resources</h4>
                <p className="text-sm text-gray-600">Career guidance and placement prep</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ; 