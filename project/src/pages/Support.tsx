import React, { useState } from 'react';
import { Mail, Phone, MessageSquare, Clock, MapPin, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LiveChat from '../components/LiveChat';

const Support: React.FC = () => {
  const navigate = useNavigate();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isChatMinimized, setIsChatMinimized] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Contact Support
          </h1>
          <p className="text-lg text-gray-600">
            Need help? Our support team is here to assist you with any questions or issues.
          </p>
        </div>

        {/* Contact Methods */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <Mail className="h-8 w-8 text-blue-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900">Email Support</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Send us an email and we'll get back to you within 24 hours.
            </p>
            <a
              href="mailto:support@gatepreportal.com"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
            >
              support@gatepreportal.com
            </a>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <Phone className="h-8 w-8 text-green-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900">Phone Support</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Call us during business hours for immediate assistance.
            </p>
            <div className="space-y-2">
              <a
                href="tel:+91-8757010589"
                className="block text-green-600 hover:text-green-800 font-medium"
              >
                +91-8757010589
              </a>
              <a
                href="tel:+91-8519947343"
                className="block text-green-600 hover:text-green-800 font-medium"
              >
                +91-8519947343
              </a>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <MessageSquare className="h-8 w-8 text-purple-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900">Live Chat</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Chat with our support team in real-time during business hours.
            </p>
            <button 
              onClick={() => setIsChatOpen(true)}
              className="inline-flex items-center text-purple-600 hover:text-purple-800 font-medium"
            >
              Start Chat
            </button>
          </div>
        </div>

        {/* Business Hours */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center mb-4">
            <Clock className="h-8 w-8 text-orange-600 mr-3" />
            <h3 className="text-xl font-semibold text-gray-900">Business Hours</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Monday - Friday</h4>
              <p className="text-gray-600">9:00 AM - 6:00 PM IST</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Saturday</h4>
              <p className="text-gray-600">10:00 AM - 4:00 PM IST</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Sunday</h4>
              <p className="text-gray-600">Closed</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Emergency Support</h4>
              <p className="text-gray-600">Available 24/7 for critical issues</p>
              <p className="text-sm text-gray-500 mt-1">
                Call: +91-8757010589 or +91-8519947343
              </p>
            </div>
          </div>
        </div>

        {/* Office Location */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center mb-4">
            <MapPin className="h-8 w-8 text-red-600 mr-3" />
            <h3 className="text-xl font-semibold text-gray-900">Office Location</h3>
          </div>
          <div className="text-gray-600">
            <p className="mb-2">
              <strong>Gate Preparation Portal</strong><br />
              SRM Institute of Science and Technology<br />
              Kattankulathur, Chennai - 603203<br />
              Tamil Nadu, India
            </p>
            <p className="text-sm text-gray-500">
              For in-person support, please schedule an appointment in advance.
            </p>
          </div>
        </div>

        {/* Common Issues */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Common Issues & Solutions</h3>
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-medium text-gray-900">Can't log in to my account</h4>
              <p className="text-gray-600 text-sm">
                Try resetting your password or check if your email is verified. If the issue persists, contact support.
              </p>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-medium text-gray-900">Test not loading properly</h4>
              <p className="text-gray-600 text-sm">
                Clear your browser cache, try a different browser, or check your internet connection.
              </p>
            </div>
            <div className="border-l-4 border-purple-500 pl-4">
              <h4 className="font-medium text-gray-900">File upload issues</h4>
              <p className="text-gray-600 text-sm">
                Ensure your file is in a supported format and under 50MB. Try uploading again or contact support.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Live Chat Component */}
      <LiveChat
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onMinimize={() => {
          setIsChatOpen(false);
          setIsChatMinimized(true);
        }}
        isMinimized={isChatMinimized}
      />
    </div>
  );
};

export default Support; 