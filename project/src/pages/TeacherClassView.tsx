import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Users, FileText, MessageSquare, Plus, Send,
    Calendar, Copy, Check, Trash2
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import {
    classroomService,
    ClassroomClass,
    ClassAssignment,
    ClassAnnouncement
} from '../services/classroomService';
import { AttachmentLink } from '../components/AttachmentLink';
import { formatDate, copyToClipboard } from '../utils/classroomUtils';

type TabType = 'stream' | 'classwork' | 'people';

export const TeacherClassView: React.FC = () => {
    const { classId } = useParams<{ classId: string }>();
    const navigate = useNavigate();
    const { user } = useAuthStore();

    const [activeTab, setActiveTab] = useState<TabType>('stream');
    const [classData, setClassData] = useState<ClassroomClass | null>(null);
    const [assignments, setAssignments] = useState<ClassAssignment[]>([]);
    const [announcements, setAnnouncements] = useState<ClassAnnouncement[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Modals
    const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
    const [showAssignmentModal, setShowAssignmentModal] = useState(false);

    // Forms
    const [announcementText, setAnnouncementText] = useState('');
    const [announcementFile, setAnnouncementFile] = useState<File | null>(null);
    const [newAssignment, setNewAssignment] = useState({
        title: '',
        description: '',
        instructions: '',
        due_date: '',
        points: 100
    });
    const [assignmentFile, setAssignmentFile] = useState<File | null>(null);
    const [uploadingFile, setUploadingFile] = useState(false);

    const [copiedCode, setCopiedCode] = useState(false);

    useEffect(() => {
        if (classId && user?.id) {
            loadClassData();
        }
    }, [classId, user]);

    const loadClassData = async () => {
        if (!classId) return;
        setLoading(true);

        const [classInfo, assignmentsList, announcementsList, studentsList] = await Promise.all([
            classroomService.getClassDetails(classId),
            classroomService.getClassAssignments(classId),
            classroomService.getClassAnnouncements(classId),
            classroomService.getClassStudents(classId)
        ]);

        setClassData(classInfo);
        setAssignments(assignmentsList);
        setAnnouncements(announcementsList);
        setStudents(studentsList);
        setLoading(false);
    };

    const handlePostAnnouncement = async () => {
        if (!classId || !user?.id || !announcementText.trim()) return;

        let fileData = null;
        if (announcementFile) {
            setUploadingFile(true);
            fileData = await classroomService.uploadFile(announcementFile, 'announcements');
            setUploadingFile(false);
        }

        await classroomService.createAnnouncement({
            class_id: classId,
            teacher_id: user.id,
            content: announcementText,
            attachment_url: fileData?.url,
            attachment_name: fileData?.name
        });

        setAnnouncementText('');
        setAnnouncementFile(null);
        setShowAnnouncementModal(false);
        loadClassData();
    };

    const handleCreateAssignment = async () => {
        if (!classId || !user?.id || !newAssignment.title.trim()) return;

        let fileData = null;
        if (assignmentFile) {
            setUploadingFile(true);
            fileData = await classroomService.uploadFile(assignmentFile, 'assignments');
            setUploadingFile(false);
        }

        await classroomService.createAssignment({
            class_id: classId,
            teacher_id: user.id,
            ...newAssignment,
            attachment_url: fileData?.url,
            attachment_name: fileData?.name
        });

        setNewAssignment({
            title: '',
            description: '',
            instructions: '',
            due_date: '',
            points: 100
        });
        setAssignmentFile(null);
        setShowAssignmentModal(false);
        loadClassData();
    };

    const handleCopyCode = useCallback(async () => {
        if (classData?.class_code) {
            const success = await copyToClipboard(classData.class_code);
            if (success) {
                setCopiedCode(true);
                setTimeout(() => setCopiedCode(false), 2000);
            }
        }
    }, [classData?.class_code]);

    const handleDeleteAnnouncement = useCallback(async (announcementId: string) => {
        if (!confirm('Are you sure you want to delete this announcement?')) return;

        const success = await classroomService.deleteAnnouncement(announcementId);
        if (success) {
            loadClassData();
        }
    }, []);

    const handleDeleteAssignment = useCallback(async (assignmentId: string) => {
        if (!confirm('Are you sure you want to delete this assignment?')) return;

        const success = await classroomService.deleteAssignment(assignmentId);
        if (success) {
            loadClassData();
        }
    }, []);

    const resetAnnouncementModal = useCallback(() => {
        setAnnouncementText('');
        setAnnouncementFile(null);
        setShowAnnouncementModal(false);
    }, []);

    const resetAssignmentModal = useCallback(() => {
        setNewAssignment({ title: '', description: '', instructions: '', due_date: '', points: 100 });
        setAssignmentFile(null);
        setShowAssignmentModal(false);
    }, []);


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
                        onClick={() => navigate('/teacher-classroom-dashboard')}
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
                        onClick={() => navigate('/teacher-classroom-dashboard')}
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
                                {classData.section && `Section ${classData.section}`}
                                {classData.section && classData.room && ' • '}
                                {classData.room && `Room ${classData.room}`}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Class Code Card */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 mb-6">
                <div className="bg-white rounded-lg shadow-lg p-4 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500">Class Code</p>
                        <p className="text-2xl font-bold font-mono text-purple-600">{classData.class_code}</p>
                    </div>
                    <button
                        onClick={handleCopyCode}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-lg transition-colors"
                    >
                        {copiedCode ? (
                            <>
                                <Check className="h-5 w-5" />
                                <span>Copied!</span>
                            </>
                        ) : (
                            <>
                                <Copy className="h-5 w-5" />
                                <span>Copy Code</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
                <div className="bg-white rounded-lg shadow-md">
                    <div className="flex border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('stream')}
                            className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${activeTab === 'stream'
                                ? 'text-purple-600 border-b-2 border-purple-600'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <MessageSquare className="h-5 w-5 inline-block mr-2" />
                            Stream
                        </button>
                        <button
                            onClick={() => setActiveTab('classwork')}
                            className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${activeTab === 'classwork'
                                ? 'text-purple-600 border-b-2 border-purple-600'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <FileText className="h-5 w-5 inline-block mr-2" />
                            Classwork
                        </button>
                        <button
                            onClick={() => setActiveTab('people')}
                            className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${activeTab === 'people'
                                ? 'text-purple-600 border-b-2 border-purple-600'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
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
                    <div className="space-y-6">
                        {/* Post Actions */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowAnnouncementModal(true)}
                                    className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
                                >
                                    <Plus className="h-5 w-5" />
                                    Announce to class
                                </button>
                                <button
                                    onClick={() => setShowAssignmentModal(true)}
                                    className="flex-1 px-4 py-3 border-2 border-purple-600 text-purple-600 hover:bg-purple-50 rounded-lg flex items-center justify-center gap-2 transition-colors"
                                >
                                    <FileText className="h-5 w-5" />
                                    Create assignment
                                </button>
                            </div>
                        </div>

                        {/* Stream Feed */}
                        <div className="space-y-4">
                            {announcements.length === 0 && assignments.length === 0 ? (
                                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                                    <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500 text-lg">No posts yet</p>
                                    <p className="text-gray-400 mt-2">Share an announcement or create an assignment</p>
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
                                                    <p className="font-medium text-gray-900 mb-1">You posted an announcement</p>
                                                    <p className="text-sm text-gray-500 mb-3">{formatDate(announcement.created_at)}</p>
                                                    <p className="text-gray-700 whitespace-pre-wrap">{announcement.content}</p>
                                                    {announcement.attachment_url && (
                                                        <div className="mt-3">
                                                            <AttachmentLink
                                                                url={announcement.attachment_url}
                                                                name={announcement.attachment_name}
                                                                variant="purple"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteAnnouncement(announcement.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete announcement"
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    {assignments.map((assignment) => (
                                        <div key={assignment.id} className="bg-white rounded-lg shadow-md p-6">
                                            <div className="flex items-start gap-4">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                    <FileText className="h-5 w-5 text-blue-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900 mb-1">You created an assignment</p>
                                                    <p className="text-sm text-gray-500 mb-3">{formatDate(assignment.created_at)}</p>
                                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{assignment.title}</h3>
                                                    {assignment.description && (
                                                        <p className="text-gray-700 mb-2">{assignment.description}</p>
                                                    )}
                                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                                        {assignment.due_date && (
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="h-4 w-4" />
                                                                Due {formatDate(assignment.due_date)}
                                                            </span>
                                                        )}
                                                        <span>{assignment.points} points</span>
                                                    </div>
                                                    {assignment.attachment_url && (
                                                        <div className="mt-3">
                                                            <AttachmentLink
                                                                url={assignment.attachment_url}
                                                                name={assignment.attachment_name}
                                                                variant="blue"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteAssignment(assignment.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete assignment"
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Classwork Tab */}
                {activeTab === 'classwork' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-900">Assignments</h2>
                            <button
                                onClick={() => setShowAssignmentModal(true)}
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2"
                            >
                                <Plus className="h-5 w-5" />
                                Create
                            </button>
                        </div>

                        {assignments.length === 0 ? (
                            <div className="bg-white rounded-lg shadow-md p-12 text-center">
                                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 text-lg">No assignments yet</p>
                                <button
                                    onClick={() => setShowAssignmentModal(true)}
                                    className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                                >
                                    Create First Assignment
                                </button>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {assignments.map((assignment) => (
                                    <div key={assignment.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-4 flex-1">
                                                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                                                    <FileText className="h-6 w-6 text-blue-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{assignment.title}</h3>
                                                    {assignment.description && (
                                                        <p className="text-gray-600 mb-3">{assignment.description}</p>
                                                    )}
                                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                                        {assignment.due_date && (
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="h-4 w-4" />
                                                                Due {formatDate(assignment.due_date)}
                                                            </span>
                                                        )}
                                                        <span>{assignment.points} points</span>
                                                        <span className="text-purple-600 font-medium">Posted {formatDate(assignment.created_at)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteAssignment(assignment.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete assignment"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
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
                                    {user?.email?.[0].toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">{user?.email}</p>
                                    <p className="text-sm text-gray-500">Teacher</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-900">
                                    Students ({students.length})
                                </h2>
                            </div>

                            {students.length === 0 ? (
                                <div className="text-center py-8">
                                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500">No students enrolled yet</p>
                                    <p className="text-sm text-gray-400 mt-2">Share the class code with students to get started</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {students.map((student, idx) => (
                                        <div key={student.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                                                {idx + 1}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900">{student.student_id}</p>
                                                <p className="text-sm text-gray-500">Enrolled {formatDate(student.enrolled_at)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Announcement Modal */}
            {showAnnouncementModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
                        <div className="border-b border-gray-200 px-6 py-4">
                            <h2 className="text-2xl font-bold text-gray-900">Post Announcement</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <textarea
                                value={announcementText}
                                onChange={(e) => setAnnouncementText(e.target.value)}
                                placeholder="Share something with your class..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                                rows={6}
                            />

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Attach File (Optional)
                                </label>
                                <div className="flex items-center gap-3">
                                    <label className="flex-1 flex items-center justify-center px-4 py-2 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                        <FileText className="h-5 w-5 text-gray-400 mr-2" />
                                        <span className="text-sm text-gray-600">
                                            {announcementFile ? announcementFile.name : 'Choose a file'}
                                        </span>
                                        <input
                                            type="file"
                                            onChange={(e) => setAnnouncementFile(e.target.files?.[0] || null)}
                                            className="hidden"
                                        />
                                    </label>
                                    {announcementFile && (
                                        <button
                                            onClick={() => setAnnouncementFile(null)}
                                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX, Images, Videos up to 50MB</p>
                            </div>
                        </div>
                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex gap-3">
                            <button
                                onClick={() => {
                                    setShowAnnouncementModal(false);
                                    setAnnouncementText('');
                                    setAnnouncementFile(null);
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handlePostAnnouncement}
                                disabled={!announcementText.trim() || uploadingFile}
                                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <Send className="h-4 w-4" />
                                {uploadingFile ? 'Uploading...' : 'Post'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Assignment Modal */}
            {showAssignmentModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
                            <h2 className="text-2xl font-bold text-gray-900">Create Assignment</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    value={newAssignment.title}
                                    onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                                    placeholder="Assignment title"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={newAssignment.description}
                                    onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                                    placeholder="Brief description"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                    rows={3}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Instructions
                                </label>
                                <textarea
                                    value={newAssignment.instructions}
                                    onChange={(e) => setNewAssignment({ ...newAssignment, instructions: e.target.value })}
                                    placeholder="Detailed instructions for students"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                    rows={4}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Due Date
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={newAssignment.due_date}
                                        onChange={(e) => setNewAssignment({ ...newAssignment, due_date: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Points
                                    </label>
                                    <input
                                        type="number"
                                        value={newAssignment.points}
                                        onChange={(e) => setNewAssignment({ ...newAssignment, points: parseInt(e.target.value) })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                        min="0"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Attach File (Optional)
                                </label>
                                <div className="flex items-center gap-3">
                                    <label className="flex-1 flex items-center justify-center px-4 py-2 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                        <FileText className="h-5 w-5 text-gray-400 mr-2" />
                                        <span className="text-sm text-gray-600">
                                            {assignmentFile ? assignmentFile.name : 'Choose a file'}
                                        </span>
                                        <input
                                            type="file"
                                            onChange={(e) => setAssignmentFile(e.target.files?.[0] || null)}
                                            className="hidden"
                                        />
                                    </label>
                                    {assignmentFile && (
                                        <button
                                            onClick={() => setAssignmentFile(null)}
                                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX, Images, Videos up to 50MB</p>
                            </div>
                        </div>
                        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex gap-3">
                            <button
                                onClick={() => {
                                    setShowAssignmentModal(false);
                                    setNewAssignment({
                                        title: '',
                                        description: '',
                                        instructions: '',
                                        due_date: '',
                                        points: 100
                                    });
                                    setAssignmentFile(null);
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateAssignment}
                                disabled={!newAssignment.title.trim() || uploadingFile}
                                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {uploadingFile ? 'Uploading...' : 'Create Assignment'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherClassView;
