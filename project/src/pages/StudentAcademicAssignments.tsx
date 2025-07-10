import React, { useEffect, useState } from 'react';
import { ArrowLeft, FileText, Download, Calendar, Clock, Eye, BookOpen, AlertCircle, Star, MessageSquare } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { format } from 'date-fns';

interface Assignment {
  id: string;
  title: string;
  description: string;
  subject_id: string;
  subject_name: string;
  subject_code: string;
  due_date: string;
  file_path: string;
  filename: string;
  created_at: string;
}

const StudentAcademicAssignments: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [submissions, setSubmissions] = useState<Record<string, any>>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user, profile } = useAuthStore();

  useEffect(() => {
    fetchAssignments();
    if (user?.id) fetchSubmissions();
  }, [user]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError('');
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('academic_assignments')
        .select('*, subjects(name, code)');
      if (assignmentsError) throw assignmentsError;
      const transformedAssignments = (assignmentsData || []).map((assignment: any) => ({
        id: assignment.id,
        title: assignment.title,
        description: assignment.description,
        subject_id: assignment.subject_id,
        subject_name: assignment.subjects?.name || '',
        subject_code: assignment.subjects?.code || '',
        due_date: assignment.due_date,
        file_path: assignment.file_path,
        filename: assignment.filename,
        created_at: assignment.created_at
      }));
      setAssignments(transformedAssignments);
    } catch (err) {
      setError('Failed to fetch assignments. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from('academic_assignment_submissions')
        .select('*')
        .eq('student_id', user.id);
      if (error) throw error;
      const map: Record<string, any> = {};
      (data || []).forEach((sub: any) => { map[sub.assignment_id] = sub; });
      setSubmissions(map);
    } catch (err) {
      // ignore
    }
  };

  const handleUpload = async (assignment: Assignment, file: File) => {
    if (!user?.id) return;
    setUploading(assignment.id);
    try {
      const ext = file.name.split('.').pop();
      const filePath = `${user.id}/${assignment.id}-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('academic-assignments')
        .upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { error: insertError } = await supabase
        .from('academic_assignment_submissions')
        .upsert({
          assignment_id: assignment.id,
          student_id: user.id,
          file_path: filePath,
          filename: file.name,
          status: 'submitted',
          submitted_at: new Date().toISOString()
        });
      if (insertError) throw insertError;
      fetchSubmissions();
    } catch (err) {
      // ignore
    } finally {
      setUploading(null);
    }
  };

  const groupedAssignments = assignments.reduce((acc, assignment) => {
    const subjectKey = `${assignment.subject_name} (${assignment.subject_code})`;
    if (!acc[subjectKey]) {
      acc[subjectKey] = [];
    }
    acc[subjectKey].push(assignment);
    return acc;
  }, {} as Record<string, Assignment[]>);

  const handleDownload = async (assignment: Assignment) => {
    try {
      const { data: { publicUrl } } = supabase.storage
        .from('academic_assignments')
        .getPublicUrl(assignment.file_path);
      const link = document.createElement('a');
      link.href = publicUrl;
      link.download = assignment.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      // ignore
    }
  };

  const handleViewPdf = (assignment: Assignment) => {
    const { data: { publicUrl } } = supabase.storage
      .from('academic_assignments')
      .getPublicUrl(assignment.file_path);
    window.open(publicUrl, '_blank');
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (!user?.id) {
    return <div className="min-h-screen flex items-center justify-center text-lg text-gray-600">No user found. Please log in again.</div>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading assignments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <button
          onClick={() => window.history.length > 1 ? navigate(-1) : navigate('/student-academic-dashboard')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors duration-200"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          <span className="text-base font-medium">Back to Dashboard</span>
        </button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Academic Assignments</h1>
          <p className="text-lg text-gray-600">Access and download your academic assignments below</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        {Object.entries(groupedAssignments).map(([subjectName, subjectAssignments]) => (
          <div key={subjectName} className="mb-8">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-pink-100 rounded-lg mr-3">
                <BookOpen className="h-6 w-6 text-pink-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">{subjectName}</h2>
              <span className="ml-3 px-3 py-1 bg-pink-100 text-pink-800 text-sm font-medium rounded-full">
                {subjectAssignments.length} assignment{subjectAssignments.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {subjectAssignments.map((assignment) => {
                const overdue = isOverdue(assignment.due_date);
                const daysUntilDue = getDaysUntilDue(assignment.due_date);
                const submission = submissions[assignment.id];
                return (
                  <div key={assignment.id} className="bg-white rounded-xl shadow border-0 p-4 flex flex-col h-full justify-between hover:shadow-lg transition-all duration-200">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="text-lg font-semibold text-gray-900 line-clamp-2">{assignment.title}</div>
                      </div>
                      <div className="p-2 bg-pink-50 rounded-lg ml-3">
                        <FileText className="h-5 w-5 text-pink-600" />
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">{assignment.description}</p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">Due: </span>
                        <span className={`ml-1 font-medium ${overdue ? 'text-red-600' : daysUntilDue <= 3 ? 'text-orange-600' : 'text-gray-900'}`}>{format(new Date(assignment.due_date), 'MMM dd, yyyy')}</span>
                        {overdue && !submission && (
                          <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded">Overdue</span>
                        )}
                        {!overdue && daysUntilDue <= 3 && !submission && (
                          <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded">Due Soon</span>
                        )}
                        {submission && (
                          <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">Submitted</span>
                        )}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 text-gray-400 mr-2" />
                        Posted: {format(new Date(assignment.created_at), 'MMM dd, yyyy')}
                      </div>
                    </div>
                    <div className="flex gap-2 mb-2">
                      <button
                        onClick={() => handleViewPdf(assignment)}
                        className="flex-1 border border-pink-200 text-pink-700 hover:bg-pink-50 hover:border-pink-300 rounded-lg px-3 py-1.5 text-xs font-semibold transition"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </button>
                      <button
                        onClick={() => handleDownload(assignment)}
                        className="flex-1 border border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 rounded-lg px-3 py-1.5 text-xs font-semibold transition"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </button>
                    </div>
                    {/* Assignment Submission UI */}
                    {submission ? (
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${submission.status === 'graded' ? 'bg-green-100 text-green-700' : 'bg-pink-100 text-pink-700'}`}>{submission.status === 'graded' ? 'Graded' : 'Assignment Done'}</span>
                          <a
                            href={supabase.storage.from('academic-assignments').getPublicUrl(submission.file_path).data.publicUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-pink-600 underline text-xs"
                          >
                            View Submission
                          </a>
                        </div>
                        {/* Show grade and feedback if graded */}
                        {submission.status === 'graded' && submission.grade !== null && (
                          <div className="bg-white rounded-lg p-3 border border-gray-200">
                            <div className="flex items-center space-x-2 mb-2">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span className="font-medium text-gray-900">Grade: {submission.grade}/100</span>
                              {submission.graded_at && (
                                <span className="text-xs text-gray-500">Graded: {format(new Date(submission.graded_at), 'MMM dd, yyyy')}</span>
                              )}
                            </div>
                            {submission.feedback && (
                              <div className="flex items-start space-x-2">
                                <MessageSquare className="h-4 w-4 text-pink-500 mt-0.5" />
                                <p className="text-sm text-gray-700">{submission.feedback}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <form
                        className="mt-2 flex items-center gap-2"
                        onSubmit={e => {
                          e.preventDefault();
                          const file = (e.target as any).file.files[0];
                          if (file) handleUpload(assignment, file);
                        }}
                      >
                        <input
                          type="file"
                          name="file"
                          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                          className="block text-xs"
                          required
                          disabled={uploading === assignment.id}
                        />
                        <button
                          type="submit"
                          disabled={uploading === assignment.id}
                          className="bg-pink-600 text-white px-3 py-1 rounded text-xs font-semibold"
                        >
                          {uploading === assignment.id ? 'Uploading...' : 'Upload'}
                        </button>
                      </form>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {Object.keys(groupedAssignments).length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white rounded-xl shadow-sm p-8 max-w-md mx-auto">
              <div className="p-3 bg-gray-100 rounded-full w-fit mx-auto mb-4">
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Assignments Available</h3>
              <p className="text-gray-500">There are no assignments posted at the moment. Check back later for new assignments.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentAcademicAssignments; 