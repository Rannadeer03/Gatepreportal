import React, { useState, useEffect } from 'react';
import { MessageSquare, X, Bell } from 'lucide-react';

interface ChatNotificationProps {
  isVisible: boolean;
  onOpenChat: () => void;
  onDismiss: () => void;
  message?: string;
}

const ChatNotification: React.FC<ChatNotificationProps> = ({
  isVisible,
  onOpenChat,
  onDismiss,
  message = "New message from AI Support"
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-20 right-4 z-40">
      <div className={`
        bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm
        transform transition-all duration-300 ease-in-out
        ${isAnimating ? 'scale-105' : 'scale-100'}
      `}>
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-white" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">
              AI Support Assistant
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {message}
            </p>
            <div className="flex space-x-2 mt-3">
              <button
                onClick={onOpenChat}
                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              >
                <Bell className="h-3 w-3 mr-1" />
                Open Chat
              </button>
              <button
                onClick={onDismiss}
                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
          
          <button
            onClick={onDismiss}
            className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatNotification;
