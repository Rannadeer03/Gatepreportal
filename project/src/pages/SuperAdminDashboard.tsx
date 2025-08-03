import React, { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  BarChart3,
  Shield,
  FileText,
  Database,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Eye,
  Trash2,
  UserPlus
} from 'lucide-react';
import { superAdminService, PendingUser, SuperAdminStats } from '../services/superAdminService';
import { loggingService, LogEntry } from '../services/loggingService';
import { useAuthStore } from '../store/authStore';
import { TeacherCreationForm } from '../components/TeacherCreationForm';

type TabType = 'dashboard' | 'pending' | 'users' | 'teachers' | 'logs';

export const SuperAdminDashboard: React.FC = () => {
  const { profile } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [allUsers, setAllUsers] = useState<PendingUser[]>([]);
  const [stats, setStats] = useState<SuperAdminStats | null>(null);
  const [recentLogs, setRecentLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showTeacherForm, setShowTeacherForm] = useState(false);

  // Define loadDashboardData function before useEffect
  const loadDashboardData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const [statsResult, pendingResult, usersResult, logsResult] = await Promise.all([
        superAdminService.getDashboardStats(),
        superAdminService.getPendingApprovals(),
        superAdminService.getAllUsers(),
        loggingService.getRecentActivities(20)
      ]);

      if (statsResult.data) setStats(statsResult.data);
      if (pendingResult.data) setPendingUsers(pendingResult.data);
      if (usersResult.data) setAllUsers(usersResult.data);
      if (logsResult.data) setRecentLogs(logsResult.data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Check if user is super admin
  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-red-500" />
          <h1 className="mt-4 text-xl font-semibold text-gray-900">Loading...</h1>
          <p className="mt-2 text-gray-600">Please wait while we load your profile.</p>
        </div>
      </div>
    );
  }

  if (profile.role !== 'super_admin') {
    console.log('Access denied. Current role:', profile.role, 'Profile:', profile);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-red-500" />
          <h1 className="mt-4 text-xl font-semibold text-gray-900">Access Denied</h1>
          <p className="mt-2 text-gray-600">You need super admin privileges to access this page.</p>
          <p className="mt-2 text-sm text-gray-500">Current role: {profile.role}</p>
          <p className="mt-1 text-sm text-gray-500">Email: {profile.email}</p>
        </div>
      </div>
    );
  }

  const handleApproveUser = async (userId: string, approved: boolean, rejectionReason?: string) => {
    try {
      const result = await superAdminService.approveUser({
        userId,
        approved,
        rejectionReason
      });

      if (result.success) {
        setSuccess(`User ${approved ? 'approved' : 'rejected'} successfully`);
        loadDashboardData(); // Refresh data
      } else {
        setError(result.error || 'Failed to process user approval');
      }
    } catch (error) {
      console.error('Failed to process user approval:', error);
      setError('Failed to process user approval');
    }
  };

  const handleTeacherCreated = () => {
    setShowTeacherForm(false);
    setSuccess('Teacher account created successfully');
    loadDashboardData(); // Refresh data
  };

  const StatCard = ({ title, value, icon, color, onClick }: {
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
    onClick?: () => void;
  }) => (
    <div 
      className={`bg-white p-6 rounded-lg shadow-md ${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const PendingApprovalsTab = () => (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Pending User Approvals</h2>
        <p className="text-gray-600">Review and approve or reject user registrations</p>
      </div>
      <div className="p-6">
        {pendingUsers.length === 0 ? (
          <div className="text-center py-8">
            <UserCheck className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No pending approvals</h3>
            <p className="mt-2 text-gray-500">All user registrations have been processed.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingUsers.map((user) => (
              <div key={user.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-gray-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-xs text-gray-500">Role: {user.role}</span>
                          <span className="text-xs text-gray-500">Department: {user.department}</span>
                          {user.registration_number && (
                            <span className="text-xs text-gray-500">Reg: {user.registration_number}</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400">
                          Registered: {new Date(user.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleApproveUser(user.id, true)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        const reason = prompt('Reason for rejection (optional):');
                        handleApproveUser(user.id, false, reason || undefined);
                      }}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const UsersManagementTab = () => (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">All Users</h2>
        <p className="text-gray-600">Manage all system users</p>
      </div>
      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="text-left border-b">
                <th className="pb-2">Name</th>
                <th className="pb-2">Role</th>
                <th className="pb-2">Department</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Registered</th>
                <th className="pb-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {allUsers.map((user) => (
                <tr key={user.id} className="border-b">
                  <td className="py-3">
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.role === 'teacher' 
                        ? 'bg-purple-100 text-purple-800' 
                        : user.role === 'super_admin'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 text-sm">{user.department}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.approval_status === 'approved' 
                        ? 'bg-green-100 text-green-800' 
                        : user.approval_status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.approval_status}
                    </span>
                  </td>
                  <td className="py-3 text-sm">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center space-x-2">
                      <button
                        className="p-1 rounded text-blue-600 hover:bg-blue-50"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {user.role !== 'super_admin' && (
                        <button
                          className="p-1 rounded text-red-600 hover:bg-red-50"
                          title="Delete User"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const ActivityLogsTab = () => (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">System Activity Logs</h2>
        <p className="text-gray-600">Monitor all system activities and user actions</p>
      </div>
      <div className="p-6">
        <div className="space-y-3">
          {recentLogs.map((log) => (
            <div key={log.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0">
                <Activity className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {log.action_type.replace('_', ' ').toUpperCase()}
                </p>
                <p className="text-sm text-gray-500">
                  User ID: {log.user_id} • {new Date(log.created_at || '').toLocaleString()}
                </p>
                {log.action_details && (
                  <p className="text-xs text-gray-400 mt-1">
                    {JSON.stringify(log.action_details)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
          <p className="text-gray-600">Manage users, monitor system performance, and oversee platform activities</p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
            <button onClick={() => setError(null)} className="float-right text-red-400 hover:text-red-600">×</button>
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md">
            {success}
            <button onClick={() => setSuccess(null)} className="float-right text-green-400 hover:text-green-600">×</button>
          </div>
        )}

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <StatCard
              title="Total Users"
              value={stats.total_users}
              icon={<Users className="h-6 w-6 text-white" />}
              color="bg-blue-500"
              onClick={() => setActiveTab('users')}
            />
            <StatCard
              title="Pending Approvals"
              value={stats.pending_approvals}
              icon={<Clock className="h-6 w-6 text-white" />}
              color="bg-yellow-500"
              onClick={() => setActiveTab('pending')}
            />
            <StatCard
              title="Students"
              value={stats.total_students}
              icon={<UserCheck className="h-6 w-6 text-white" />}
              color="bg-green-500"
            />
            <StatCard
              title="Teachers"
              value={stats.total_teachers}
              icon={<Shield className="h-6 w-6 text-white" />}
              color="bg-purple-500"
              onClick={() => setActiveTab('teachers')}
            />
            <StatCard
              title="Recent Registrations"
              value={stats.recent_registrations}
              icon={<UserPlus className="h-6 w-6 text-white" />}
              color="bg-orange-500"
            />
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'pending', label: 'Pending Approvals', icon: Clock },
              { id: 'users', label: 'All Users', icon: Users },
              { id: 'teachers', label: 'Teacher Management', icon: Shield },
              { id: 'logs', label: 'Activity Logs', icon: FileText },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === tab.id
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => setActiveTab('pending')}
                    className="w-full flex items-center p-3 text-left rounded-lg hover:bg-gray-50 border"
                  >
                    <Clock className="h-5 w-5 text-gray-600 mr-3" />
                    <span>Review Pending Approvals ({stats?.pending_approvals || 0})</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('teachers')}
                    className="w-full flex items-center p-3 text-left rounded-lg hover:bg-gray-50 border"
                  >
                    <Plus className="h-5 w-5 text-gray-600 mr-3" />
                    <span>Add New Teacher</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('logs')}
                    className="w-full flex items-center p-3 text-left rounded-lg hover:bg-gray-50 border"
                  >
                    <Activity className="h-5 w-5 text-gray-600 mr-3" />
                    <span>View System Logs</span>
                  </button>
                  <button className="w-full flex items-center p-3 text-left rounded-lg hover:bg-gray-50 border">
                    <Database className="h-5 w-5 text-gray-600 mr-3" />
                    <span>System Backup</span>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {recentLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="flex items-center space-x-3">
                      <Activity className="w-4 h-4 text-gray-400" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">
                          {log.action_type.replace('_', ' ')}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(log.created_at || '').toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pending' && <PendingApprovalsTab />}
          {activeTab === 'users' && <UsersManagementTab />}
          {activeTab === 'logs' && <ActivityLogsTab />}
          
          {activeTab === 'teachers' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Teacher Management</h2>
                    <p className="text-gray-600">Add and manage teacher accounts</p>
                  </div>
                  <button
                    onClick={() => setShowTeacherForm(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Teacher
                  </button>
                </div>

                {/* Teachers List */}
                <div className="overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead>
                      <tr className="text-left border-b">
                        <th className="pb-2">Name</th>
                        <th className="pb-2">Email</th>
                        <th className="pb-2">Faculty ID</th>
                        <th className="pb-2">Department</th>
                        <th className="pb-2">Status</th>
                        <th className="pb-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allUsers.filter(user => user.role === 'teacher').map((teacher) => (
                        <tr key={teacher.id} className="border-b">
                          <td className="py-3">
                            <div>
                              <p className="font-medium">{teacher.name}</p>
                            </div>
                          </td>
                          <td className="py-3 text-sm">{teacher.email}</td>
                          <td className="py-3 text-sm">{teacher.faculty_id}</td>
                          <td className="py-3 text-sm">{teacher.department}</td>
                          <td className="py-3">
                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                              Active
                            </span>
                          </td>
                          <td className="py-3">
                            <div className="flex items-center space-x-2">
                              <button
                                className="p-1 rounded text-blue-600 hover:bg-blue-50"
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                className="p-1 rounded text-red-600 hover:bg-red-50"
                                title="Deactivate Teacher"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {allUsers.filter(user => user.role === 'teacher').length === 0 && (
                    <div className="text-center py-8">
                      <Shield className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-4 text-lg font-medium text-gray-900">No teachers found</h3>
                      <p className="mt-2 text-gray-500">Start by adding your first teacher.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Teacher Creation Modal */}
        {showTeacherForm && (
          <TeacherCreationForm
            onSuccess={handleTeacherCreated}
            onCancel={() => setShowTeacherForm(false)}
          />
        )}
      </div>
    </div>
  );
};