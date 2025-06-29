import React from 'react';
import { notificationService } from '../services/notificationService';
import { useAuthStore } from '../store/authStore';
import { Button } from './ui/button';
import { supabase } from '../lib/supabase';

const NotificationTest: React.FC = () => {
  const { user } = useAuthStore();

  const testCreateNotification = async () => {
    if (!user?.id) {
      console.log('No user found');
      return;
    }

    try {
      console.log('Testing notification creation for user:', user.id);
      
      // Test creating a notification directly for the current user
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          title: 'Test Notification',
          message: 'This is a test notification to verify the system is working.',
          type: 'general',
          is_read: false
        });

      if (error) {
        console.error('Error creating test notification:', error);
      } else {
        console.log('Test notification created successfully');
        // Refresh the page to see the notification
        window.location.reload();
      }
    } catch (error) {
      console.error('Error in test notification:', error);
    }
  };

  const testFetchNotifications = async () => {
    if (!user?.id) {
      console.log('No user found');
      return;
    }

    try {
      console.log('Testing notification fetching for user:', user.id);
      const notifications = await notificationService.getUserNotifications(user.id);
      console.log('Fetched notifications:', notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const checkTableExists = async () => {
    try {
      console.log('Checking if notifications table exists...');
      const { data, error } = await supabase
        .from('notifications')
        .select('count', { count: 'exact', head: true });

      if (error) {
        console.error('Notifications table error:', error);
      } else {
        console.log('Notifications table exists and is accessible');
      }
    } catch (error) {
      console.error('Error checking notifications table:', error);
    }
  };

  if (!user) {
    return <div>Please log in to test notifications</div>;
  }

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-semibold">Notification System Test</h3>
      <div className="space-y-2">
        <Button onClick={checkTableExists} variant="outline">
          Check Table Exists
        </Button>
        <Button onClick={testFetchNotifications} variant="outline">
          Test Fetch Notifications
        </Button>
        <Button onClick={testCreateNotification} variant="outline">
          Create Test Notification
        </Button>
      </div>
      <div className="text-sm text-gray-600">
        Check the browser console for detailed logs
      </div>
    </div>
  );
};

export default NotificationTest; 