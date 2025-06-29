import React, { useEffect, useState } from 'react';
import { ArrowLeft, FileText, Download, Calendar, Clock, Eye, BookOpen, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { format } from 'date-fns';
import { useToast } from './ui/use-toast';
import { useNavigate } from 'react-router-dom';

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

const StudentAssignmentView: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError('');

      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('assignments')
        .select('*, subjects(name, code)');

      if (assignmentsError) throw assignmentsError;

      // Transform the data to match our interface
      const transformedAssignments = (assignmentsData || []).map(assignment => ({
        id: assignment.id,
        title: assignment.title,
        description: assignment.description,
        subject_id: assignment.subject_id,
        subject_name: assignment.subjects.name,
        subject_code: assignment.subjects.code,
        due_date: assignment.due_date,
        file_path: assignment.file_path,
        filename: assignment.filename,
        created_at: assignment.created_at
      }));

      setAssignments(transformedAssignments);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to fetch assignments. Please try again later.');
      toast({
        title: 'Error',
        description: 'Failed to fetch assignments. Please try again later.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Group assignments by subject
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
        .from('assignments')
        .getPublicUrl(assignment.file_path);

      const link = document.createElement('a');
      link.href = publicUrl;
      link.download = assignment.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: 'Success',
        description: 'Assignment downloaded successfully'
      });
    } catch (err) {
      console.error('Download error:', err);
      setError('Failed to download assignment. Please try again.');
      toast({
        title: 'Error',
        description: 'Failed to download assignment. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleViewPdf = (assignment: Assignment) => {
    const { data: { publicUrl } } = supabase.storage
      .from('assignments')
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <button
          onClick={() => window.history.length > 1 ? navigate(-1) : navigate('/student-main-dashboard')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors duration-200"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          <span className="text-base font-medium">Back to Dashboard</span>
        </button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Course Assignments</h1>
          <p className="text-lg text-gray-600">Access and download your course assignments below</p>
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
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">{subjectName}</h2>
              <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                {subjectAssignments.length} assignment{subjectAssignments.length !== 1 ? 's' : ''}
              </span>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {subjectAssignments.map((assignment) => {
                const overdue = isOverdue(assignment.due_date);
                const daysUntilDue = getDaysUntilDue(assignment.due_date);
                
                return (
                  <Card key={assignment.id} className="hover:shadow-lg transition-all duration-200 border-0 shadow-md">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
                            {assignment.title}
                          </CardTitle>
                        </div>
                        <div className="p-2 bg-blue-50 rounded-lg ml-3">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                        {assignment.description}
                      </p>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-gray-600">Due: </span>
                          <span className={`ml-1 font-medium ${overdue ? 'text-red-600' : daysUntilDue <= 3 ? 'text-orange-600' : 'text-gray-900'}`}>
                            {format(new Date(assignment.due_date), 'MMM dd, yyyy')}
                          </span>
                          {overdue && (
                            <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded">
                              Overdue
                            </span>
                          )}
                          {!overdue && daysUntilDue <= 3 && (
                            <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded">
                              Due Soon
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-4 w-4 text-gray-400 mr-2" />
                          Posted: {format(new Date(assignment.created_at), 'MMM dd, yyyy')}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewPdf(assignment)}
                          className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(assignment)}
                          className="flex-1 border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
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

export default StudentAssignmentView; 