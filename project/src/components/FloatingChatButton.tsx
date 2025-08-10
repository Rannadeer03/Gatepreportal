import React, { useState } from 'react';
import { MessageSquare, X } from 'lucide-react';
import LiveChat from './LiveChat';

interface FloatingChatButtonProps {
  className?: string;
}

const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({ className = '' }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const handleToggleChat = () => {
    if (isMinimized) {
      setIsMinimized(false);
      setIsChatOpen(true);
    } else {
      setIsChatOpen(!isChatOpen);
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={handleToggleChat}
        className={`
          fixed bottom-4 right-4 z-50
          w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg
          hover:bg-blue-700 hover:scale-110
          transition-all duration-200 ease-in-out
          flex items-center justify-center
          ${className}
        `}
        aria-label="Open live chat"
      >
        {isChatOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageSquare className="h-6 w-6" />
        )}
      </button>

      {/* Chat Tooltip */}
      {!isChatOpen && !isMinimized && (
        <div className="fixed bottom-20 right-4 z-40">
          <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-lg">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span>Need help? Chat with AI Support</span>
            </div>
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      )}

      {/* Live Chat Component */}
      <LiveChat
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onMinimize={() => {
          setIsChatOpen(false);
          setIsMinimized(true);
        }}
        isMinimized={isMinimized}
      />
    </>
  );
};

export default FloatingChatButton;
