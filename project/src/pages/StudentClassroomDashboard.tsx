import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, School, User, FileText, Clock } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { classroomService, ClassroomClass } from '../services/classroomService';

export const StudentClassroomDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [classes, setClasses] = useState<ClassroomClass[]>([]);
    const [loading, setLoading] = useState(true);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [classCode, setClassCode] = useState('');
    const [joinError, setJoinError] = useState('');
    const [joining, setJoining] = useState(false);

    useEffect(() => {
        if (user?.id) {
            loadClasses();
        }
    }, [user]);

    const loadClasses = async () => {
        if (!user?.id) return;
        setLoading(true);
        const data = await classroomService.getStudentClasses(user.id);
        setClasses(data);
        setLoading(false);
    };

    const handleJoinClass = async () => {
        if (!user?.id || !classCode.trim()) {
            setJoinError('Please enter a class code');
            return;
        }

        setJoining(true);
        setJoinError('');

        const joined = await classroomService.joinClassByCode(classCode.trim().toUpperCase(), user.id);

        if (joined) {
            setClasses([joined, ...classes]);
            setShowJoinModal(false);
            setClassCode('');
        } else {
            setJoinError('Invalid class code or you are already enrolled');
        }

        setJoining(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900">My Classrooms</h1>
                        <p className="text-gray-600 mt-2">View your classes, assignments, and materials</p>
                    </div>
                    <button
                        onClick={() => setShowJoinModal(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-lg transition-all duration-200"
                    >
                        <Plus className="h-5 w-5" />
                        <span className="font-semibold">Join Class</span>
                    </button>
                </div>

                {/* Classes Grid */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading classes...</p>
                    </div>
                ) : classes.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
                        <School className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No classes yet</h3>
                        <p className="text-gray-500 mb-6">Join a class using a class code from your teacher</p>
                        <button
                            onClick={() => setShowJoinModal(true)}
                            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all duration-200"
                        >
                            Join Your First Class
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {classes.map((cls) => (
                            <div
                                key={cls.id}
                                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-200 cursor-pointer group"
                                onClick={() => navigate(`/student-classroom/${cls.id}`)}
                            >
                                {/* Banner */}
                                <div
                                    className="h-24 relative"
                                    style={{ backgroundColor: cls.banner_color || '#1976d2' }}
                                >
                                    <div className="absolute bottom-3 left-4 right-4">
                                        <h3 className="text-white font-bold text-xl line-clamp-1">{cls.class_name}</h3>
                                        <p className="text-white/90 text-sm">{cls.subject}</p>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm text-gray-600">
                                            {cls.section && `Section: ${cls.section}`}
                                            {cls.section && cls.room && ' • '}
                                            {cls.room && `Room: ${cls.room}`}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                        <div className="flex items-center gap-1">
                                            <FileText className="h-4 w-4" />
                                            <span>{cls.assignment_count || 0} assignments</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-4 w-4" />
                                            <span>Active</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Join Class Modal */}
                {showJoinModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                            <div className="border-b border-gray-200 px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-bold text-gray-900">Join Class</h2>
                                    <button
                                        onClick={() => {
                                            setShowJoinModal(false);
                                            setClassCode('');
                                            setJoinError('');
                                        }}
                                        className="text-gray-400 hover:text-gray-700 text-2xl"
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Class Code
                                    </label>
                                    <input
                                        type="text"
                                        value={classCode}
                                        onChange={(e) => {
                                            setClassCode(e.target.value.toUpperCase());
                                            setJoinError('');
                                        }}
                                        placeholder="Enter 7-character code"
                                        maxLength={7}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent uppercase font-mono text-lg tracking-wider"
                                    />
                                    <p className="mt-2 text-sm text-gray-500">
                                        Ask your teacher for the class code
                                    </p>
                                    {joinError && (
                                        <p className="mt-2 text-sm text-red-600">{joinError}</p>
                                    )}
                                </div>
                            </div>

                            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            setShowJoinModal(false);
                                            setClassCode('');
                                            setJoinError('');
                                        }}
                                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleJoinClass}
                                        disabled={!classCode.trim() || joining}
                                        className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {joining ? 'Joining...' : 'Join Class'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentClassroomDashboard;
