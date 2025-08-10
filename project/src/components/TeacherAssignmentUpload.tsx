import React, { useState, useRef, useEffect } from 'react';
import { api } from '../services/api';
import type { Subject } from '../services/api';
import TeacherAssignmentList from './TeacherAssignmentList';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../services/notificationService';

// Mock data for engineering subjects
const engineeringSubjects: Subject[] = [
  {
    id: '507f1f77bcf86cd799439011',
    name: 'Engineering Mathematics',
    code: '001',
    teacher_id: null,
    created_at: '',
    updated_at: ''
  },
  {
    id: '507f1f77bcf86cd799439012',
    name: 'Electric Circuits',
    code: '002',
    teacher_id: null,
    created_at: '',
    updated_at: ''
  },
  {
    id: '507f1f77bcf86cd799439013',
    name: 'Electromagnetic Fields',
    code: '003',
    teacher_id: null,
    created_at: '',
    updated_at: ''
  },
  {
    id: '507f1f77bcf86cd799439014',
    name: 'Signals and Systems',
    code: '004',
    teacher_id: null,
    created_at: '',
    updated_at: ''
  },
  {
    id: '507f1f77bcf86cd799439015',
    name: 'Electrical Machines',
    code: '005',
    teacher_id: null,
    created_at: '',
    updated_at: ''
  },
  {
    id: '507f1f77bcf86cd799439016',
    name: 'Power Systems',
    code: '006',
    teacher_id: null,
    created_at: '',
    updated_at: ''
  },
  {
    id: '507f1f77bcf86cd799439017',
    name: 'Control Systems',
    code: '007',
    teacher_id: null,
    created_at: '',
    updated_at: ''
  },
  {
    id: '507f1f77bcf86cd799439018',
    name: 'Electrical and Electronic Measurements',
    code: '008',
    teacher_id: null,
    created_at: '',
    updated_at: ''
  },
  {
    id: '507f1f77bcf86cd799439019',
    name: 'Analog and Digital Electronics',
    code: '009',
    teacher_id: null,
    created_at: '',
    updated_at: ''
  },
  {
    id: '507f1f77bcf86cd799439020',
    name: 'Power Electronics',
    code: '010',
    teacher_id: null,
    created_at: '',
    updated_at: ''
  }
];

interface TeacherAssignmentUploadProps {
  mode?: 'academic' | 'gate';
}

const TeacherAssignmentUpload: React.FC<TeacherAssignmentUploadProps> = ({ mode = 'gate' }) => {
  const [file, setFile] = useState<File | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const listRef = useRef<{ fetchAssignments: () => Promise<void> }>(null);
  const navigate = useNavigate();



  // Initialize subjects
  useEffect(() => {
    const initializeSubjects = async () => {
      try {
        setIsLoading(true);
        setError('');
        console.log('Initializing subjects...');

        // Use the utility function to ensure subjects exist
        let dbSubjects = await api.ensureSubjectsExist();
        console.log('Subjects after ensuring they exist:', dbSubjects);

        if (dbSubjects && dbSubjects.length > 0) {
          console.log('Setting subjects:', dbSubjects);
          setSubjects(dbSubjects);
          setMessage('Subjects loaded successfully');
        } else {
          console.error('No subjects available after initialization');
          setError('No subjects available. Please refresh the page.');
        }
      } catch (err) {
        console.error('Error initializing subjects:', err);
        setError('Failed to load subjects. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    };

    initializeSubjects();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Only PDF and Word documents are allowed');
        e.target.value = '';
        return;
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (selectedFile.size > maxSize) {
        setError('File size should not exceed 10MB');
        e.target.value = '';
        return;
      }

      setFile(selectedFile);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    if (!selectedSubject) {
      setError('Please select a subject');
      return;
    }

    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }

    if (!description.trim()) {
      setError('Please enter a description');
      return;
    }

    if (!dueDate) {
      setError('Please select a due date');
      return;
    }

    try {
      setError('');
      setMessage('Uploading assignment...');
      
      const assignment = await api.uploadAssignment(
        selectedSubject,
        title,
        description,
        dueDate,
        file!,
        mode
      );

      // Create notification for all students
      const selectedSubjectData = subjects.find(s => s.id === selectedSubject);
      if (selectedSubjectData) {
        await notificationService.createAssignmentNotification(
          assignment.id,
          title,
          selectedSubjectData.name
        );
      }

      setMessage('Assignment uploaded successfully!');
      // Reset form
      setFile(null);
      setTitle('');
      setDescription('');
      setDueDate('');
      setSelectedSubject('');
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      // Refresh the list
      if (listRef.current) {
        await listRef.current.fetchAssignments();
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload assignment. Please try again.');
      setMessage('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/academic/teacher-dashboard')}
        className="flex items-center mb-6 text-gray-600 hover:text-gray-900 transition-colors"
        aria-label="Back to Dashboard"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left h-6 w-6 text-gray-600"><path d="m12 19-7-7 7-7"></path><path d="M19 12H5"></path></svg>
        <span className="ml-2">Back to Dashboard</span>
      </button>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Upload New Assignment</h2>
          
          <div className="space-y-4">
            {/* Subject Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Subject
              </label>
              {isLoading ? (
                <div className="animate-pulse bg-gray-200 h-10 rounded-md"></div>
              ) : (
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select a subject</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name} ({subject.code})
                    </option>
                  ))}
                </select>
              )}
              {subjects.length === 0 && !isLoading && (
                <div className="text-red-500 text-sm mt-1">
                  <p>No subjects available</p>
                  <button
                    onClick={async () => {
                      try {
                        setError('');
                        setIsLoading(true);
                        const newSubjects = await api.ensureSubjectsExist();
                        setSubjects(newSubjects);
                        setMessage('Subjects loaded successfully');
                      } catch (err) {
                        console.error('Error loading subjects:', err);
                        setError('Failed to load subjects. Please try again.');
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                    className="mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                  >
                    Load Subjects
                  </button>
                </div>
              )}
            </div>

            {/* Title Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assignment Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter assignment title"
              />
            </div>

            {/* Description Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={3}
                placeholder="Enter assignment description"
              />
            </div>

            {/* Due Date Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date
              </label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assignment File
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx"
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}

            {message && (
              <div className="text-green-500 text-sm">{message}</div>
            )}

            <button
              onClick={handleUpload}
              disabled={!file || !selectedSubject || !title.trim() || !description.trim() || !dueDate}
              className={`px-4 py-2 rounded-md text-white font-medium
                ${file && selectedSubject && title.trim() && description.trim() && dueDate
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-gray-400 cursor-not-allowed'}`}
            >
              Upload Assignment
            </button>
          </div>
        </div>

        {/* List Section */}
        <TeacherAssignmentList ref={listRef} mode={mode} />
      </div>
    </div>
  );
};

export default TeacherAssignmentUpload; 