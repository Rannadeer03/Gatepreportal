import React, { useState } from 'react';
import { Play, BookOpen, User, Award, FileText, Target, Settings, ArrowLeft, ExternalLink, Clock, HelpCircle, MessageSquare, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Tutorial {
  id: string;
  title: string;
  description: string;
  category: 'student' | 'teacher' | 'general';
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  videoUrl?: string;
  steps: string[];
}

const tutorials: Tutorial[] = [
  {
    id: 'getting-started',
    title: 'Getting Started with the Portal',
    description: 'Learn the basics of navigating and using the Gate Preparation Portal.',
    category: 'general',
    duration: '10 minutes',
    difficulty: 'beginner',
    steps: [
      'Create your account and complete your profile',
      'Choose your role (Student or Teacher)',
      'Explore the dashboard and main features',
      'Set up your notification preferences',
      'Complete your first activity'
    ]
  },
  {
    id: 'student-dashboard',
    title: 'Student Dashboard Guide',
    description: 'Master the student dashboard and access all available features.',
    category: 'student',
    duration: '15 minutes',
    difficulty: 'beginner',
    steps: [
      'Navigate through different sections',
      'Access study materials and resources',
      'Take practice tests and assessments',
      'Submit assignments and track progress',
      'View your results and performance analytics'
    ]
  },
  {
    id: 'taking-tests',
    title: 'How to Take Tests',
    description: 'Step-by-step guide for taking tests and assessments.',
    category: 'student',
    duration: '8 minutes',
    difficulty: 'beginner',
    steps: [
      'Select a test from the available options',
      'Read the test instructions carefully',
      'Answer questions and review your responses',
      'Submit the test before the time limit',
      'View your results and feedback'
    ]
  },
  {
    id: 'teacher-dashboard',
    title: 'Teacher Dashboard Guide',
    description: 'Learn how to use the teacher dashboard and manage content.',
    category: 'teacher',
    duration: '20 minutes',
    difficulty: 'beginner',
    steps: [
      'Access the teacher dashboard',
      'Create and manage tests',
      'Upload study materials and resources',
      'Review student submissions',
      'Track student performance and analytics'
    ]
  },
  {
    id: 'creating-tests',
    title: 'Creating Tests and Assessments',
    description: 'Learn how to create effective tests and assessments for your students.',
    category: 'teacher',
    duration: '25 minutes',
    difficulty: 'intermediate',
    steps: [
      'Navigate to the test creation section',
      'Set test parameters and duration',
      'Add questions and configure options',
      'Set grading criteria and time limits',
      'Publish and manage the test'
    ]
  },
  {
    id: 'uploading-materials',
    title: 'Uploading Study Materials',
    description: 'Guide for uploading and organizing study materials.',
    category: 'teacher',
    duration: '12 minutes',
    difficulty: 'beginner',
    steps: [
      'Access the course materials section',
      'Select the appropriate subject and topic',
      'Upload files in supported formats',
      'Add descriptions and metadata',
      'Organize materials by difficulty and topic'
    ]
  },
  {
    id: 'assignment-management',
    title: 'Managing Assignments',
    description: 'How to create, assign, and review student assignments.',
    category: 'teacher',
    duration: '18 minutes',
    difficulty: 'intermediate',
    steps: [
      'Create new assignments with clear instructions',
      'Set due dates and submission requirements',
      'Upload reference materials and resources',
      'Track submission status and send reminders',
      'Review and grade student submissions'
    ]
  },
  {
    id: 'profile-settings',
    title: 'Profile and Settings Management',
    description: 'Learn how to manage your profile and customize settings.',
    category: 'general',
    duration: '10 minutes',
    difficulty: 'beginner',
    steps: [
      'Update your personal information',
      'Upload and manage your profile picture',
      'Configure notification preferences',
      'Set privacy and security settings',
      'Customize your dashboard layout'
    ]
  },
  {
    id: 'advanced-analytics',
    title: 'Understanding Analytics and Reports',
    description: 'Advanced guide for interpreting performance analytics and reports.',
    category: 'teacher',
    duration: '30 minutes',
    difficulty: 'advanced',
    steps: [
      'Access the analytics dashboard',
      'Interpret student performance metrics',
      'Generate detailed reports',
      'Identify areas for improvement',
      'Export data for further analysis'
    ]
  }
];

const Tutorials: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'student' | 'teacher' | 'general'>('all');
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null);
  const navigate = useNavigate();

  const filteredTutorials = activeCategory === 'all' 
    ? tutorials 
    : tutorials.filter(tutorial => tutorial.category === activeCategory);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const categories = [
    { id: 'all', name: 'All Tutorials', icon: <BookOpen className="h-5 w-5" /> },
    { id: 'general', name: 'General', icon: <Settings className="h-5 w-5" /> },
    { id: 'student', name: 'Student', icon: <User className="h-5 w-5" /> },
    { id: 'teacher', name: 'Teacher', icon: <Award className="h-5 w-5" /> }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Tutorials & Guides
          </h1>
          <p className="text-lg text-gray-600">
            Step-by-step guides to help you master the Gate Preparation Portal.
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
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

        {/* Tutorials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTutorials.map((tutorial) => (
            <div
              key={tutorial.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedTutorial(tutorial)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {tutorial.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    {tutorial.description}
                  </p>
                </div>
                {tutorial.videoUrl && (
                  <Play className="h-5 w-5 text-blue-600 flex-shrink-0 ml-2" />
                )}
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-500">
                  <Clock className="h-4 w-4 inline mr-1" />
                  {tutorial.duration}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(tutorial.difficulty)}`}>
                  {tutorial.difficulty}
                </span>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-900">Key Steps:</h4>
                <ul className="space-y-1">
                  {tutorial.steps.slice(0, 3).map((step, index) => (
                    <li key={index} className="text-xs text-gray-600 flex items-start">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                      {step}
                    </li>
                  ))}
                  {tutorial.steps.length > 3 && (
                    <li className="text-xs text-gray-500">
                      +{tutorial.steps.length - 3} more steps
                    </li>
                  )}
                </ul>
              </div>

              <button className="w-full mt-4 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
                View Tutorial
              </button>
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div className="mt-12 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Additional Resources</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <a
              href="/faq"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <HelpCircle className="h-6 w-6 text-blue-600 mr-3" />
              <div>
                <h4 className="font-medium text-gray-900">FAQ</h4>
                <p className="text-sm text-gray-600">Find quick answers</p>
              </div>
            </a>
            <a
              href="/support"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <MessageSquare className="h-6 w-6 text-green-600 mr-3" />
              <div>
                <h4 className="font-medium text-gray-900">Support</h4>
                <p className="text-sm text-gray-600">Contact our team</p>
              </div>
            </a>
            <a
              href="#"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ExternalLink className="h-6 w-6 text-purple-600 mr-3" />
              <div>
                <h4 className="font-medium text-gray-900">Documentation</h4>
                <p className="text-sm text-gray-600">Detailed guides</p>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* Tutorial Modal */}
      {selectedTutorial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-[calc(100vw-2rem)] sm:w-full sm:max-w-2xl mx-4 max-h-[calc(100vh-2rem)] sm:max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedTutorial.title}
                </h2>
                <button
                  onClick={() => setSelectedTutorial(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-600 mb-4">{selectedTutorial.description}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {selectedTutorial.duration}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(selectedTutorial.difficulty)}`}>
                    {selectedTutorial.difficulty}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Step-by-Step Guide</h3>
                <ol className="space-y-3">
                  {selectedTutorial.steps.map((step, index) => (
                    <li key={index} className="flex items-start">
                      <span className="bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3 flex-shrink-0">
                        {index + 1}
                      </span>
                      <span className="text-gray-700">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {selectedTutorial.videoUrl && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Video Tutorial</h3>
                  <div className="bg-gray-100 rounded-lg p-4 text-center">
                    <Play className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Video tutorial coming soon</p>
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedTutorial(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tutorials; 