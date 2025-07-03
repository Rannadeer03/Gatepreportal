import React, { useState, useRef, useEffect } from 'react';
import { api } from '../services/api';
import type { Subject } from '../services/api';
import AcademicTeacherAssignmentList from './AcademicTeacherAssignmentList';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../services/notificationService';

const engineeringSubjects: Subject[] = [
  // ... (same as original)
];

const AcademicTeacherAssignmentUpload: React.FC = () => {
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

  useEffect(() => {
    const initializeSubjects = async () => {
      try {
        setIsLoading(true);
        setError('');
        let dbSubjects = await api.getSubjects();
        if (!dbSubjects || dbSubjects.length === 0) {
          await api.deleteAllSubjects();
          for (const subject of engineeringSubjects) {
            try {
              await api.addSubject({ name: subject.name, code: subject.code });
            } catch (err) {
              setError(`Failed to add subject ${subject.code}. Please try again.`);
            }
          }
          dbSubjects = await api.getSubjects();
        }
        if (dbSubjects && dbSubjects.length > 0) {
          setSubjects(dbSubjects);
          setMessage('Subjects loaded successfully');
        } else {
          setError('No subjects available. Please refresh the page.');
        }
      } catch (err) {
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
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Only PDF and Word documents are allowed');
        e.target.value = '';
        return;
      }
      const maxSize = 10 * 1024 * 1024;
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
    if (!file) { setError('Please select a file first'); return; }
    if (!selectedSubject) { setError('Please select a subject'); return; }
    if (!title.trim()) { setError('Please enter a title'); return; }
    if (!description.trim()) { setError('Please enter a description'); return; }
    if (!dueDate) { setError('Please select a due date'); return; }
    try {
      setError('');
      setMessage('Uploading assignment...');
      // Use only academic assignments
      const assignment = await api.uploadAssignment(
        selectedSubject,
        title,
        description,
        dueDate,
        file!,
        'academic'
      );
      const selectedSubjectData = subjects.find(s => s.id === selectedSubject);
      if (selectedSubjectData) {
        await notificationService.createAssignmentNotification(
          assignment.id,
          title,
          selectedSubjectData.name
        );
      }
      setMessage('Assignment uploaded successfully!');
      setFile(null); setTitle(''); setDescription(''); setDueDate(''); setSelectedSubject('');
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      if (listRef.current) { await listRef.current.fetchAssignments(); }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload assignment. Please try again.');
      setMessage('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate('/academic/teacher-dashboard')}
        className="flex items-center mb-6 text-gray-600 hover:text-gray-900 transition-colors"
        aria-label="Back to Dashboard"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left h-6 w-6 text-gray-600"><path d="m12 19-7-7 7-7"></path><path d="M19 12H5"></path></svg>
        <span className="ml-2">Back to Dashboard</span>
      </button>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Upload New Assignment</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Subject</label>
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
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Assignment Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter assignment title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={3}
                placeholder="Enter assignment description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Assignment File</label>
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx"
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            {error && (<div className="text-red-500 text-sm">{error}</div>)}
            {message && (<div className="text-green-500 text-sm">{message}</div>)}
            <button
              onClick={handleUpload}
              disabled={!file || !selectedSubject || !title.trim() || !description.trim() || !dueDate}
              className={`px-4 py-2 rounded-md text-white font-medium ${file && selectedSubject && title.trim() && description.trim() && dueDate ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
            >
              Upload Assignment
            </button>
          </div>
        </div>
        <AcademicTeacherAssignmentList ref={listRef} />
      </div>
    </div>
  );
};

export default AcademicTeacherAssignmentUpload; 