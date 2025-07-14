import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { api } from '../services/api';
import type { Assignment } from '../services/api';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { useToast } from './ui/use-toast';
import { notificationService } from '../services/notificationService';
import { ArrowLeft, FileText, Eye, Download, Trash2, Calendar, Users, CheckCircle, Star, MessageSquare, BookOpen, Clock } from 'lucide-react';

export interface TeacherAssignmentListRef {
  fetchAssignments: () => Promise<void>;
}

interface StudentSubmission {
  id: string;
  assignment_id: string;
  student_id: string;
  file_path: string;
  filename: string;
  status: 'submitted' | 'graded';
  submitted_at: string;
  grade?: number;
  feedback?: string;
  graded_at?: string;
  student?: {
    email: string;
    name?: string;
  };
}

const AcademicTeacherAssignmentList = forwardRef<TeacherAssignmentListRef, any>((props, ref) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Record<string, StudentSubmission[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);
  const [grading, setGrading] = useState<Record<string, boolean>>({});
  const [grades, setGrades] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchAssignments = async () => {
    try {
      const data = await api.getAllAssignmentsForTeacher('academic');
      setAssignments(data);
      await fetchSubmissions(data);
    } catch (err) {
      setError('Failed to fetch assignments. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async (assignmentsData: Assignment[]) => {
    try {
      if (assignmentsData.length === 0) {
        setSubmissions({});
        return;
      }
      const assignmentIds = assignmentsData.map(a => a.id);
      const { data, error } = await supabase
        .from('academic_assignment_submissions')
        .select(`*, student:profiles(email, name)`)
        .in('assignment_id', assignmentIds);
      if (error) throw error;
      const submissionsMap: Record<string, StudentSubmission[]> = {};
      (data || []).forEach((submission: any) => {
        if (!submissionsMap[submission.assignment_id]) {
          submissionsMap[submission.assignment_id] = [];
        }
        submissionsMap[submission.assignment_id].push(submission);
      });
      setSubmissions(submissionsMap);
    } catch (err) {
      setSubmissions({});
    }
  };

  useImperativeHandle(ref, () => ({ fetchAssignments }));

  useEffect(() => { fetchAssignments(); }, []);

  const handleDelete = async (assignmentId: string) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      try {
        await api.deleteAssignment(assignmentId, 'academic');
        setAssignments(assignments.filter(a => a.id !== assignmentId));
        toast({ title: 'Success', description: 'Assignment deleted successfully' });
      } catch (err) {
        setError('Failed to delete assignment. Please try again.');
        toast({ title: 'Error', description: 'Failed to delete assignment', variant: 'destructive' });
      }
    }
  };

  const handleDownloadSubmission = async (submission: StudentSubmission) => {
    try {
      const { data: { publicUrl } } = supabase.storage
        .from('academic_assignment_submissions')
        .getPublicUrl(submission.file_path);
      const link = document.createElement('a');
      link.href = publicUrl;
      link.download = submission.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({ title: 'Success', description: 'Submission downloaded successfully' });
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to download submission', variant: 'destructive' });
    }
  };

  const handleViewSubmission = (submission: StudentSubmission) => {
    const { data: { publicUrl } } = supabase.storage
      .from('academic_assignment_submissions')
      .getPublicUrl(submission.file_path);
    window.open(publicUrl, '_blank');
  };

  const handleGradeSubmission = async (submissionId: string) => {
    try {
      setGrading(prev => ({ ...prev, [submissionId]: true }));
      
      const grade = grades[submissionId];
      const feedbackText = feedback[submissionId];
      
      if (grade === undefined || grade < 0 || grade > 100) {
        toast({ 
          title: 'Error', 
          description: 'Please enter a valid grade between 0 and 100', 
          variant: 'destructive' 
        });
        return;
      }

      const { error } = await supabase
        .from('academic_assignment_submissions')
        .update({
          grade: grade,
          feedback: feedbackText
        })
        .eq('id', submissionId);

      if (error) throw error;

      // Update local state
      setSubmissions(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(assignmentId => {
          updated[assignmentId] = updated[assignmentId].map(submission => 
            submission.id === submissionId 
              ? { 
                  ...submission, 
                  status: 'graded', 
                  grade, 
                  feedback: feedbackText, 
                  graded_at: new Date().toISOString() 
                }
              : submission
          );
        });
        return updated;
      });

      // Clear form data
      setGrades(prev => {
        const { [submissionId]: _, ...rest } = prev;
        return rest;
      });
      setFeedback(prev => {
        const { [submissionId]: _, ...rest } = prev;
        return rest;
      });

      toast({ 
        title: 'Success', 
        description: 'Submission graded successfully' 
      });
    } catch (error) {
      console.error('Error grading submission:', error);
      toast({ 
        title: 'Error', 
        description: 'Failed to grade submission. Please try again.', 
        variant: 'destructive' 
      });
    } finally {
      setGrading(prev => ({ ...prev, [submissionId]: false }));
    }
  };

  // Group assignments by subject
  const groupedAssignments = assignments.reduce((acc, assignment) => {
    const subjectKey = `${assignment.subject?.name || 'Unknown'} (${assignment.subject?.code || 'N/A'})`;
    if (!acc[subjectKey]) {
      acc[subjectKey] = [];
    }
    acc[subjectKey].push(assignment);
    return acc;
  }, {} as Record<string, Assignment[]>);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading assignments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-lg">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <button
          onClick={() => navigate('/academic/teacher-dashboard')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors duration-200"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          <span className="text-base font-medium">Back to Dashboard</span>
        </button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Assignment Review</h1>
          <p className="text-lg text-gray-600">Review and grade student submissions</p>
        </div>

        {assignments.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-xl shadow-sm p-8 max-w-md mx-auto">
              <div className="p-3 bg-gray-100 rounded-full w-fit mx-auto mb-4">
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Assignments Available</h3>
              <p className="text-gray-500">There are no assignments to review at the moment.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedAssignments).map(([subject, subjectAssignments]) => (
              <div key={subject} className="space-y-6">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">{subject}</h2>
                  <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                    {subjectAssignments.length} assignment{subjectAssignments.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="grid gap-6">
                  {subjectAssignments.map((assignment) => {
                    const assignmentSubmissions = submissions[assignment.id] || [];
                    const submittedCount = assignmentSubmissions.length;
                    const gradedCount = assignmentSubmissions.filter(s => s.status === 'graded').length;

                    return (
                      <Card key={assignment.id} className="hover:shadow-lg transition-all duration-200">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-xl font-semibold text-gray-900 mb-2">
                                {assignment.title}
                              </CardTitle>
                              <p className="text-gray-600 mb-3">{assignment.description}</p>
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  Due: {new Date(assignment.due_date).toLocaleDateString()}
                                </div>
                                <div className="flex items-center">
                                  <Users className="h-4 w-4 mr-1" />
                                  {submittedCount} submission{submittedCount !== 1 ? 's' : ''}
                                </div>
                                <div className="flex items-center">
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  {gradedCount} graded
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedAssignment(
                                  selectedAssignment === assignment.id ? null : assignment.id
                                )}
                                className="border-blue-200 text-blue-700 hover:bg-blue-50"
                              >
                                {selectedAssignment === assignment.id ? 'Hide' : 'View'} Submissions
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(assignment.id)}
                                className="border-red-200 text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>

                        {selectedAssignment === assignment.id && (
                          <CardContent className="pt-0">
                            {assignmentSubmissions.length === 0 ? (
                              <div className="text-center py-8">
                                <div className="p-3 bg-gray-100 rounded-full w-fit mx-auto mb-3">
                                  <Clock className="h-6 w-6 text-gray-400" />
                                </div>
                                <p className="text-gray-500">No submissions yet</p>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                {assignmentSubmissions.map((submission) => (
                                  <div
                                    key={submission.id}
                                    className="border rounded-lg p-4 bg-gray-50"
                                  >
                                    <div className="flex items-center justify-between mb-3">
                                      <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-green-100 rounded-lg">
                                          <FileText className="h-5 w-5 text-green-600" />
                                        </div>
                                        <div>
                                          <h4 className="font-medium text-gray-900">
                                            {submission.student?.name || submission.student?.email?.split('@')[0] || 'Student'}
                                          </h4>
                                          <p className="text-sm text-gray-500">
                                            {submission.student?.email}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleViewSubmission(submission)}
                                          className="border-blue-200 text-blue-700 hover:bg-blue-50"
                                        >
                                          <Eye className="h-4 w-4 mr-1" />
                                          View
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleDownloadSubmission(submission)}
                                          className="border-green-200 text-green-700 hover:bg-green-50"
                                        >
                                          <Download className="h-4 w-4 mr-1" />
                                          Download
                                        </Button>
                                      </div>
                                    </div>

                                    <div className="text-sm text-gray-600 mb-3">
                                      <div className="flex items-center space-x-4">
                                        <span>Submitted: {new Date(submission.submitted_at).toLocaleString()}</span>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                          submission.status === 'graded' 
                                            ? 'bg-green-100 text-green-700' 
                                            : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                          {submission.status === 'graded' ? 'Graded' : 'Pending Review'}
                                        </span>
                                      </div>
                                    </div>

                                    {submission.status === 'graded' ? (
                                      <div className="bg-white rounded-lg p-3 border">
                                        <div className="flex items-center space-x-4 mb-2">
                                          <div className="flex items-center">
                                            <Star className="h-4 w-4 text-yellow-500 mr-1" />
                                            <span className="font-medium">Grade: {submission.grade}/100</span>
                                          </div>
                                          <span className="text-sm text-gray-500">
                                            Graded: {new Date(submission.graded_at!).toLocaleString()}
                                          </span>
                                        </div>
                                        {submission.feedback && (
                                          <div className="flex items-start space-x-2">
                                            <MessageSquare className="h-4 w-4 text-blue-500 mt-0.5" />
                                            <p className="text-sm text-gray-700">{submission.feedback}</p>
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <div className="bg-white rounded-lg p-3 border">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                          <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                              Grade (0-100)
                                            </label>
                                            <input
                                              type="number"
                                              min="0"
                                              max="100"
                                              value={grades[submission.id] || ''}
                                              onChange={(e) => setGrades(prev => ({
                                                ...prev,
                                                [submission.id]: parseInt(e.target.value) || 0
                                              }))}
                                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                              placeholder="Enter grade"
                                            />
                                          </div>
                                          <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                              Feedback
                                            </label>
                                            <textarea
                                              value={feedback[submission.id] || ''}
                                              onChange={(e) => setFeedback(prev => ({
                                                ...prev,
                                                [submission.id]: e.target.value
                                              }))}
                                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                              rows={2}
                                              placeholder="Add feedback (optional)"
                                            />
                                          </div>
                                        </div>
                                        <Button
                                          onClick={() => handleGradeSubmission(submission.id)}
                                          disabled={grading[submission.id]}
                                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                        >
                                          {grading[submission.id] ? 'Grading...' : 'Grade Submission'}
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        )}
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

export default AcademicTeacherAssignmentList; 