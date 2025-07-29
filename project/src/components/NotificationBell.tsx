import React, { useState, useEffect } from 'react';
import { Bell, X, Check, FileText, BookOpen, Award, MessageSquare, Clock, CheckCircle, RefreshCw } from 'lucide-react';
import { notificationService, Notification } from '../services/notificationService';
import { useAuthStore } from '../store/authStore';
import { format } from 'date-fns';

interface NotificationBellProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ isOpen, onToggle }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();

  // Use internal state if no external control is provided
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isDropdownOpen = isOpen !== undefined ? isOpen : internalIsOpen;
  const handleToggle = onToggle || (() => setInternalIsOpen(!internalIsOpen));

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
      fetchUnreadCount();
      
      // Set up periodic refresh every 30 seconds
      const interval = setInterval(() => {
        fetchNotifications();
        fetchUnreadCount();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await notificationService.getUserNotifications(user.id);
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    if (!user?.id) return;
    try {
      const count = await notificationService.getUnreadCount(user.id);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;
    try {
      await notificationService.markAllAsRead(user.id);
      setNotifications(prev => prev.map(notif => ({ ...notif, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleRefresh = () => {
    fetchNotifications();
    fetchUnreadCount();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'assignment':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'test':
        return <BookOpen className="h-4 w-4 text-green-500" />;
      case 'submission':
        return <MessageSquare className="h-4 w-4 text-orange-500" />;
      case 'grade':
        return <Award className="h-4 w-4 text-yellow-500" />;
      case 'course_material':
        return <FileText className="h-4 w-4 text-purple-500" />;
      case 'test_completion':
        return <CheckCircle className="h-4 w-4 text-indigo-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'assignment':
        return 'border-l-blue-500 bg-blue-50';
      case 'test':
        return 'border-l-green-500 bg-green-50';
      case 'submission':
        return 'border-l-orange-500 bg-orange-50';
      case 'grade':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'course_material':
        return 'border-l-purple-500 bg-purple-50';
      case 'test_completion':
        return 'border-l-indigo-500 bg-indigo-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="relative notification-menu">
      {/* Notification Bell Button */}
      <button
        onClick={handleToggle}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleRefresh}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title="Refresh notifications"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={handleToggle}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-l-4 ${getNotificationColor(notification.type)} ${
                      !notification.is_read ? 'bg-opacity-100' : 'bg-opacity-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${
                            !notification.is_read ? 'text-gray-900' : 'text-gray-600'
                          }`}>
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <div className="flex items-center mt-2 text-xs text-gray-500">
                            <Clock className="h-3 w-3 mr-1" />
                            {format(new Date(notification.created_at), 'MMM dd, h:mm a')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-2">
                        {!notification.is_read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="text-gray-400 hover:text-green-600 transition-colors"
                            title="Mark as read"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell; 