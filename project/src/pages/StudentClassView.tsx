import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Users, FileText, MessageSquare, Upload,
    Calendar, CheckCircle
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import {
    classroomService,
    ClassroomClass,
    ClassAssignment,
    ClassAnnouncement,
    AssignmentSubmission
} from '../services/classroomService';

type TabType = 'stream' | 'classwork' | 'people';

export const StudentClassView: React.FC = () => {
    const { classId } = useParams<{ classId: string }>();
    const navigate = useNavigate();
    const { user } = useAuthStore();

    const [activeTab, setActiveTab] = useState<TabType>('stream');
    const [classData, setClassData] = useState<ClassroomClass | null>(null);
    const [assignments, setAssignments] = useState<ClassAssignment[]>([]);
    const [announcements, setAnnouncements] = useState<ClassAnnouncement[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal state
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState<ClassAssignment | null>(null);
    const [submissionText, setSubmissionText] = useState('');

    useEffect(() => {
        if (classId && user?.id) {
            loadClassData();
        }
    }, [classId, user]);

    const loadClassData = async () => {
        if (!classId || !user?.id) return;
        setLoading(true);

        const [classInfo, assignmentsList, announcementsList, studentsList, submissionsList] = await Promise.all([
            classroomService.getClassDetails(classId),
            classroomService.getClassAssignments(classId),
            classroomService.getClassAnnouncements(classId),
            classroomService.getClassStudents(classId),
            classroomService.getStudentSubmissions(user.id)
        ]);

        setClassData(classInfo);
        setAssignments(assignmentsList);
        setAnnouncements(announcementsList);
        setStudents(studentsList);
        setSubmissions(submissionsList);
        setLoading(false);
    };

    const handleSubmitAssignment = async () => {
        if (!user?.id || !selectedAssignment || !submissionText.trim()) return;

        await classroomService.submitAssignment({
            assignment_id: selectedAssignment.id,
            student_id: user.id,
            submission_text: submissionText
        });

        setSubmissionText('');
        setShowSubmitModal(false);
        setSelectedAssignment(null);
        loadClassData();
    };

    const getSubmissionStatus = (assignmentId: string) => {
        const submission = submissions.find(s => s.assignment_id === assignmentId);
        if (!submission) return { status: 'not_submitted', label: 'Not Submitted', color: 'gray' };
        if (submission.grade !== null && submission.grade !== undefined) {
            return { status: 'graded', label: `Graded: ${submission.grade} `, color: 'green' };
        }
        if (submission.submitted_at) {
            return { status: 'submitted', label: 'Turned In', color: 'blue' };
        }
        return { status: 'draft', label: 'Draft', color: 'yellow' };
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    if (!classData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Class not found</h2>
                    <button
                        onClick={() => navigate('/student-classroom-dashboard')}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg"
                    >
                        Back to Classrooms
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Banner */}
            <div
                className="h-48 relative"
                style={{ backgroundColor: classData.banner_color || '#1976d2' }}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-between py-6">
                    <button
                        onClick={() => navigate('/student-classroom-dashboard')}
                        className="flex items-center gap-2 text-white hover:text-white/80 transition-colors w-fit"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        <span>Back to Classrooms</span>
                    </button>

                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">{classData.class_name}</h1>
                        <p className="text-white/90 text-lg">{classData.subject}</p>
                        {(classData.section || classData.room) && (
                            <p className="text-white/80 text-sm mt-1">
                                {classData.section && `Section ${classData.section} `}
                                {classData.section && classData.room && ' • '}
                                {classData.room && `Room ${classData.room} `}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 -mt-6">
                <div className="bg-white rounded-lg shadow-md">
                    <div className="flex border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('stream')}
                            className={`flex - 1 px - 6 py - 4 text - center font - medium transition - colors ${activeTab === 'stream'
                                ? 'text-purple-600 border-b-2 border-purple-600'
                                : 'text-gray-600 hover:text-gray-900'
                                } `}
                        >
                            <MessageSquare className="h-5 w-5 inline-block mr-2" />
                            Stream
                        </button>
                        <button
                            onClick={() => setActiveTab('classwork')}
                            className={`flex - 1 px - 6 py - 4 text - center font - medium transition - colors ${activeTab === 'classwork'
                                ? 'text-purple-600 border-b-2 border-purple-600'
                                : 'text-gray-600 hover:text-gray-900'
                                } `}
                        >
                            <FileText className="h-5 w-5 inline-block mr-2" />
                            Classwork
                        </button>
                        <button
                            onClick={() => setActiveTab('people')}
                            className={`flex - 1 px - 6 py - 4 text - center font - medium transition - colors ${activeTab === 'people'
                                ? 'text-purple-600 border-b-2 border-purple-600'
                                : 'text-gray-600 hover:text-gray-900'
                                } `}
                        >
                            <Users className="h-5 w-5 inline-block mr-2" />
                            People
                        </button>
                    </div>
                </div>
            </div>

            {/* Tab Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                {/* Stream Tab */}
                {activeTab === 'stream' && (
                    <div className="space-y-4">
                        {announcements.length === 0 && assignments.length === 0 ? (
                            <div className="bg-white rounded-lg shadow-md p-12 text-center">
                                <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 text-lg">No posts yet</p>
                                <p className="text-gray-400 mt-2">Your teacher will post announcements and assignments here</p>
                            </div>
                        ) : (
                            <>
                                {announcements.map((announcement) => (
                                    <div key={announcement.id} className="bg-white rounded-lg shadow-md p-6">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                                                <MessageSquare className="h-5 w-5 text-purple-600" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900 mb-1">Teacher posted an announcement</p>
                                                <p className="text-sm text-gray-500 mb-3">{formatDate(announcement.created_at)}</p>
                                                <p className="text-gray-700 whitespace-pre-wrap">{announcement.content}</p>
                                                {announcement.attachment_url && (
                                                    <a
                                                        href={announcement.attachment_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors"
                                                    >
                                                        <FileText className="h-4 w-4" />
                                                        <span className="text-sm font-medium">{announcement.attachment_name || 'Download Attachment'}</span>
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {assignments.map((assignment) => {
                                    const status = getSubmissionStatus(assignment.id);
                                    const submission = submissions.find(s => s.assignment_id === assignment.id);

                                    return (
                                        <div key={assignment.id} className="bg-white rounded-lg shadow-md p-6">
                                            <div className="flex items-start gap-4">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                    <FileText className="h-5 w-5 text-blue-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div>
                                                            <p className="font-medium text-gray-900 mb-1">New assignment posted</p>
                                                            <p className="text-sm text-gray-500">{formatDate(assignment.created_at)}</p>
                                                        </div>
                                                        <span className={`px - 3 py - 1 rounded - full text - sm font - medium ${status.color === 'green' ? 'bg-green-100 text-green-700' :
                                                            status.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                                                                status.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                                                                    'bg-gray-100 text-gray-700'
                                                            } `}>
                                                            {status.label}
                                                        </span>
                                                    </div>

                                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{assignment.title}</h3>
                                                    {assignment.description && (
                                                        <p className="text-gray-700 mb-2">{assignment.description}</p>
                                                    )}

                                                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                                        {assignment.due_date && (
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="h-4 w-4" />
                                                                Due {formatDateTime(assignment.due_date)}
                                                            </span>
                                                        )}
                                                        <span>{assignment.points} points</span>
                                                    </div>

                                                    {assignment.attachment_url && (
                                                        <a
                                                            href={assignment.attachment_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors mb-3"
                                                        >
                                                            <FileText className="h-4 w-4" />
                                                            <span className="text-sm font-medium">{assignment.attachment_name || 'Download Attachment'}</span>
                                                        </a>
                                                    )}

                                                    {submission && submission.grade !== null && submission.grade !== undefined && (
                                                        <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                                                            <p className="text-sm font-medium text-green-900">
                                                                Grade: {submission.grade}/{assignment.points}
                                                            </p>
                                                            {submission.feedback && (
                                                                <p className="text-sm text-green-700 mt-1">{submission.feedback}</p>
                                                            )}
                                                        </div>
                                                    )}

                                                    {status.status === 'not_submitted' && (
                                                        <button
                                                            onClick={() => {
                                                                setSelectedAssignment(assignment);
                                                                setShowSubmitModal(true);
                                                            }}
                                                            className="mt-3 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                                                        >
                                                            Submit Assignment
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </>
                        )}
                    </div>
                )}

                {/* Classwork Tab */}
                {activeTab === 'classwork' && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900">All Assignments</h2>

                        {assignments.length === 0 ? (
                            <div className="bg-white rounded-lg shadow-md p-12 text-center">
                                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 text-lg">No assignments yet</p>
                                <p className="text-gray-400 mt-2">Your teacher hasn't posted any assignments</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {assignments.map((assignment) => {
                                    const status = getSubmissionStatus(assignment.id);
                                    const submission = submissions.find(s => s.assignment_id === assignment.id);

                                    return (
                                        <div key={assignment.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start gap-4 flex-1">
                                                    <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                                                        <FileText className="h-6 w-6 text-blue-600" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-start justify-between mb-2">
                                                            <h3 className="text-lg font-semibold text-gray-900">{assignment.title}</h3>
                                                            <span className={`px - 3 py - 1 rounded - full text - sm font - medium ${status.color === 'green' ? 'bg-green-100 text-green-700' :
                                                                status.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                                                                    status.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                                                                        'bg-gray-100 text-gray-700'
                                                                } `}>
                                                                {status.label}
                                                            </span>
                                                        </div>

                                                        {assignment.description && (
                                                            <p className="text-gray-600 mb-3">{assignment.description}</p>
                                                        )}

                                                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                                                            {assignment.due_date && (
                                                                <span className="flex items-center gap-1">
                                                                    <Calendar className="h-4 w-4" />
                                                                    Due {formatDateTime(assignment.due_date)}
                                                                </span>
                                                            )}
                                                            <span>{assignment.points} points</span>
                                                        </div>

                                                        {submission && submission.grade !== null && submission.grade !== undefined ? (
                                                            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                                                <p className="text-sm font-medium text-green-900">
                                                                    Grade: {submission.grade}/{assignment.points}
                                                                </p>
                                                                {submission.feedback && (
                                                                    <p className="text-sm text-green-700 mt-1">{submission.feedback}</p>
                                                                )}
                                                            </div>
                                                        ) : status.status === 'not_submitted' ? (
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedAssignment(assignment);
                                                                    setShowSubmitModal(true);
                                                                }}
                                                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
                                                            >
                                                                <Upload className="h-4 w-4" />
                                                                Submit Work
                                                            </button>
                                                        ) : (
                                                            <div className="flex items-center gap-2 text-sm text-blue-600">
                                                                <CheckCircle className="h-4 w-4" />
                                                                <span>Submitted on {submission && formatDate(submission.submitted_at!)}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* People Tab */}
                {activeTab === 'people' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Teacher</h2>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-lg">
                                    T
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">Teacher</p>
                                    <p className="text-sm text-gray-500">Instructor</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">
                                Classmates ({students.length})
                            </h2>

                            {students.length === 0 ? (
                                <div className="text-center py-8">
                                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500">No other students yet</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {students.map((student, idx) => (
                                        <div key={student.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">Student {idx + 1}</p>
                                                <p className="text-sm text-gray-500">Classmate</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Submit Assignment Modal */}
            {
                showSubmitModal && selectedAssignment && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
                            <div className="border-b border-gray-200 px-6 py-4">
                                <h2 className="text-2xl font-bold text-gray-900">Submit Assignment</h2>
                                <p className="text-gray-600 mt-1">{selectedAssignment.title}</p>
                            </div>

                            <div className="p-6">
                                {selectedAssignment.instructions && (
                                    <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                                        <p className="text-sm font-medium text-blue-900 mb-2">Instructions:</p>
                                        <p className="text-sm text-blue-800 whitespace-pre-wrap">{selectedAssignment.instructions}</p>
                                    </div>
                                )}

                                <div className="mb-4">
                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                        {selectedAssignment.due_date && (
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-4 w-4" />
                                                Due {formatDateTime(selectedAssignment.due_date)}
                                            </span>
                                        )}
                                        <span>{selectedAssignment.points} points</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Your Work
                                    </label>
                                    <textarea
                                        value={submissionText}
                                        onChange={(e) => setSubmissionText(e.target.value)}
                                        placeholder="Type or paste your work here..."
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                                        rows={8}
                                    />
                                </div>
                            </div>

                            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowSubmitModal(false);
                                        setSelectedAssignment(null);
                                        setSubmissionText('');
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmitAssignment}
                                    disabled={!submissionText.trim()}
                                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    <Upload className="h-4 w-4" />
                                    Submit
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default StudentClassView;
