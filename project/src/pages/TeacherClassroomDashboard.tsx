import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, School, Users, FileText, Copy, Check } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { classroomService, ClassroomClass } from '../services/classroomService';

export const TeacherClassroomDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [classes, setClasses] = useState<ClassroomClass[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newClass, setNewClass] = useState({
        class_name: '',
        subject: '',
        section: '',
        room: '',
        description: '',
        banner_color: '#1976d2'
    });
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    useEffect(() => {
        if (user?.id) {
            loadClasses();
        }
    }, [user]);

    const loadClasses = async () => {
        if (!user?.id) return;
        setLoading(true);
        const data = await classroomService.getTeacherClasses(user.id);
        setClasses(data);
        setLoading(false);
    };

    const handleCreateClass = async () => {
        if (!user?.id || !newClass.class_name.trim()) return;

        const created = await classroomService.createClass({
            teacher_id: user.id,
            ...newClass
        });

        if (created) {
            setClasses([created, ...classes]);
            setShowCreateModal(false);
            setNewClass({
                class_name: '',
                subject: '',
                section: '',
                room: '',
                description: '',
                banner_color: '#1976d2'
            });
        }
    };

    const copyClassCode = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const bannerColors = [
        '#1976d2', '#d32f2f', '#388e3c', '#f57c00',
        '#7b1fa2', '#0097a7', '#c2185b', '#5d4037'
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900">My Classrooms</h1>
                        <p className="text-gray-600 mt-2">Manage your classes, students, and assignments</p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-lg transition-all duration-200"
                    >
                        <Plus className="h-5 w-5" />
                        <span className="font-semibold">Create Class</span>
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
                        <p className="text-gray-500 mb-6">Create your first classroom to get started</p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all duration-200"
                        >
                            Create Your First Class
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {classes.map((cls) => (
                            <div
                                key={cls.id}
                                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-200 cursor-pointer group"
                                onClick={() => navigate(`/teacher-classroom/${cls.id}`)}
                            >
                                {/* Banner */}
                                <div
                                    className="h-24 relative"
                                    style={{ backgroundColor: cls.banner_color || '#1976d2' }}
                                >
                                    <div className="absolute bottom-3 left-4">
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

                                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                                        <div className="flex items-center gap-1">
                                            <Users className="h-4 w-4" />
                                            <span>{cls.student_count || 0} students</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <FileText className="h-4 w-4" />
                                            <span>{cls.assignment_count || 0} assignments</span>
                                        </div>
                                    </div>

                                    {/* Class Code */}
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Class Code</p>
                                            <p className="font-mono font-bold text-purple-600">{cls.class_code}</p>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                copyClassCode(cls.class_code);
                                            }}
                                            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                                        >
                                            {copiedCode === cls.class_code ? (
                                                <Check className="h-5 w-5 text-green-600" />
                                            ) : (
                                                <Copy className="h-5 w-5 text-gray-600" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Create Class Modal */}
                {showCreateModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-bold text-gray-900">Create New Class</h2>
                                    <button
                                        onClick={() => setShowCreateModal(false)}
                                        className="text-gray-400 hover:text-gray-700 text-2xl"
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Class Name (Required) *
                                    </label>
                                    <input
                                        type="text"
                                        value={newClass.class_name}
                                        onChange={(e) => setNewClass({ ...newClass, class_name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="e.g., Data Structures 2026"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Subject
                                    </label>
                                    <input
                                        type="text"
                                        value={newClass.subject}
                                        onChange={(e) => setNewClass({ ...newClass, subject: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="e.g., Computer Science"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Section
                                        </label>
                                        <input
                                            type="text"
                                            value={newClass.section}
                                            onChange={(e) => setNewClass({ ...newClass, section: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="e.g., A"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Room
                                        </label>
                                        <input
                                            type="text"
                                            value={newClass.room}
                                            onChange={(e) => setNewClass({ ...newClass, room: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="e.g., 101"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={newClass.description}
                                        onChange={(e) => setNewClass({ ...newClass, description: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        rows={3}
                                        placeholder="Brief description of the class..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Banner Color
                                    </label>
                                    <div className="grid grid-cols-8 gap-2">
                                        {bannerColors.map((color) => (
                                            <button
                                                key={color}
                                                onClick={() => setNewClass({ ...newClass, banner_color: color })}
                                                className={`w-full h-10 rounded-lg transition-all ${newClass.banner_color === color ? 'ring-4 ring-offset-2 ring-purple-500' : ''
                                                    }`}
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200">
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowCreateModal(false)}
                                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleCreateClass}
                                        disabled={!newClass.class_name.trim()}
                                        className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Create Class
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

export default TeacherClassroomDashboard;
