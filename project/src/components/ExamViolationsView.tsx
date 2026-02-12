import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Shield, AlertTriangle, Clock, User } from 'lucide-react';

interface Violation {
    id: string;
    student_id: string;
    violation_type: string;
    timestamp: string;
    duration_seconds: number;
    student_name?: string;
    student_registration?: string;
}

interface ViolationSummary {
    student_id: string;
    student_name: string;
    student_registration: string;
    total_violations: number;
    tab_switches: number;
    fullscreen_exits: number;
    copy_attempts: number;
    paste_attempts: number;
    right_clicks: number;
    total_time_away: number;
}

interface ExamViolationsViewProps {
    testId: string;
    testTitle?: string;
}

/**
 * Exam Violations View Component
 * 
 * Displays all proctoring violations for a specific test.
 * Designed for teachers/admins to review student behavior during exams.
 */
const ExamViolationsView: React.FC<ExamViolationsViewProps> = ({ testId, testTitle }) => {
    const [violations, setViolations] = useState<Violation[]>([]);
    const [summary, setSummary] = useState<ViolationSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'summary' | 'detailed'>('summary');

    useEffect(() => {
        fetchViolations();
    }, [testId]);

    const fetchViolations = async () => {
        try {
            setLoading(true);

            // Fetch violations with student profile data
            const { data, error } = await supabase
                .from('exam_violations')
                .select(`
          *,
          profiles:student_id (
            name,
            registration_number
          )
        `)
                .eq('test_id', testId)
                .order('timestamp', { ascending: false });

            if (error) throw error;

            // Process violations
            const processedViolations = data.map((v: any) => ({
                ...v,
                student_name: v.profiles?.name || 'Unknown',
                student_registration: v.profiles?.registration_number || 'N/A',
            }));

            setViolations(processedViolations);

            // Calculate summary
            const summaryMap = new Map<string, ViolationSummary>();

            processedViolations.forEach((v: Violation) => {
                if (!summaryMap.has(v.student_id)) {
                    summaryMap.set(v.student_id, {
                        student_id: v.student_id,
                        student_name: v.student_name || 'Unknown',
                        student_registration: v.student_registration || 'N/A',
                        total_violations: 0,
                        tab_switches: 0,
                        fullscreen_exits: 0,
                        copy_attempts: 0,
                        paste_attempts: 0,
                        right_clicks: 0,
                        total_time_away: 0,
                    });
                }

                const studentSummary = summaryMap.get(v.student_id)!;
                studentSummary.total_violations++;

                switch (v.violation_type) {
                    case 'tab_switch':
                        studentSummary.tab_switches++;
                        studentSummary.total_time_away += v.duration_seconds || 0;
                        break;
                    case 'fullscreen_exit':
                        studentSummary.fullscreen_exits++;
                        break;
                    case 'copy_attempt':
                        studentSummary.copy_attempts++;
                        break;
                    case 'paste_attempt':
                        studentSummary.paste_attempts++;
                        break;
                    case 'right_click':
                        studentSummary.right_clicks++;
                        break;
                }
            });

            setSummary(Array.from(summaryMap.values()).sort((a, b) => b.total_violations - a.total_violations));
            setLoading(false);
        } catch (error) {
            console.error('Error fetching violations:', error);
            setLoading(false);
        }
    };

    const getViolationIcon = (type: string) => {
        switch (type) {
            case 'tab_switch':
                return '🔄';
            case 'fullscreen_exit':
                return '🖥️';
            case 'copy_attempt':
                return '📋';
            case 'paste_attempt':
                return '📌';
            case 'right_click':
                return '🖱️';
            default:
                return '⚠️';
        }
    };

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds}s`;
    };

    const formatViolationType = (type: string) => {
        return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Shield className="h-8 w-8 text-indigo-600" />
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Exam Violations</h2>
                            {testTitle && <p className="text-gray-600">{testTitle}</p>}
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setViewMode('summary')}
                            className={`px-4 py-2 rounded-md font-medium ${viewMode === 'summary'
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            Summary View
                        </button>
                        <button
                            onClick={() => setViewMode('detailed')}
                            className={`px-4 py-2 rounded-md font-medium ${viewMode === 'detailed'
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            Detailed View
                        </button>
                    </div>
                </div>

                {/* Statistics */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center space-x-2">
                            <User className="h-5 w-5 text-gray-600" />
                            <span className="text-sm text-gray-600">Students with Violations</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 mt-2">{summary.length}</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4">
                        <div className="flex items-center space-x-2">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                            <span className="text-sm text-red-600">Total Violations</span>
                        </div>
                        <p className="text-2xl font-bold text-red-900 mt-2">{violations.length}</p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4">
                        <div className="flex items-center space-x-2">
                            <span className="text-lg">🔄</span>
                            <span className="text-sm text-yellow-600">Tab Switches</span>
                        </div>
                        <p className="text-2xl font-bold text-yellow-900 mt-2">
                            {violations.filter(v => v.violation_type === 'tab_switch').length}
                        </p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-center space-x-2">
                            <Clock className="h-5 w-5 text-blue-600" />
                            <span className="text-sm text-blue-600">Total Time Away</span>
                        </div>
                        <p className="text-2xl font-bold text-blue-900 mt-2">
                            {formatTime(summary.reduce((acc, s) => acc + s.total_time_away, 0))}
                        </p>
                    </div>
                </div>
            </div>

            {/* Summary View */}
            {viewMode === 'summary' && (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Student
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Total Violations
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tab Switches
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Fullscreen Exits
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Copy/Paste
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Time Away
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {summary.map((s) => (
                                <tr key={s.student_id} className={s.total_violations >= 3 ? 'bg-red-50' : ''}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{s.student_name}</div>
                                            <div className="text-sm text-gray-500">{s.student_registration}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${s.total_violations >= 3 ? 'bg-red-100 text-red-800' :
                                                s.total_violations >= 2 ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-green-100 text-green-800'
                                            }`}>
                                            {s.total_violations}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {s.tab_switches}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {s.fullscreen_exits}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {s.copy_attempts + s.paste_attempts}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatTime(s.total_time_away)}
                                    </td>
                                </tr>
                            ))}
                            {summary.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        <Shield className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                                        <p className="text-lg font-medium">No violations recorded</p>
                                        <p className="text-sm mt-1">All students followed exam rules!</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Detailed View */}
            {viewMode === 'detailed' && (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Student
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Violation Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Timestamp
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Duration
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {violations.map((v) => (
                                <tr key={v.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{v.student_name}</div>
                                            <div className="text-sm text-gray-500">{v.student_registration}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center space-x-2">
                                            <span>{getViolationIcon(v.violation_type)}</span>
                                            <span className="text-sm text-gray-900">{formatViolationType(v.violation_type)}</span>
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {new Date(v.timestamp).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {v.duration_seconds > 0 ? formatTime(v.duration_seconds) : '-'}
                                    </td>
                                </tr>
                            ))}
                            {violations.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                        <Shield className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                                        <p className="text-lg font-medium">No violations recorded</p>
                                        <p className="text-sm mt-1">All students followed exam rules!</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ExamViolationsView;
