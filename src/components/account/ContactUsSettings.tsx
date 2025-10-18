import React from 'react';
import { ArrowLeft, Sun, Sparkles, Bug, AlertCircle, MessageCircle, Shield, FileText } from 'lucide-react';
import { Button } from '../ui';
import { useAuth } from '../../hooks/useAuth';

export const ContactUsSettings: React.FC = () => {
  const { user, logout } = useAuth();

  const helpCards = [
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: "Have a cool feature idea?",
      description: "Vote on upcoming features or suggest your own",
      action: "Feature Requests"
    },
    {
      icon: <Bug className="h-6 w-6" />,
      title: "Found a non-critical bug?",
      description: "UI glitches or formatting issues? Report them here :)",
      action: "Report Bug"
    },
    {
      icon: <AlertCircle className="h-6 w-6" />,
      title: "Having account or billing issues?",
      description: "Email us for priority support - support@ping.gg",
      action: "Email Support"
    },
    {
      icon: <MessageCircle className="h-6 w-6" />,
      title: "Want to join the community?",
      description: "Come hang out in our Discord! Chat with the team and other users",
      action: "Join Discord"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Privacy Policy",
      description: "Read our privacy policy and data handling practices",
      action: "View Policy"
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: "Terms of Service",
      description: "Review our terms of service and usage guidelines",
      action: "View Terms"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Chat
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                <Sun className="h-5 w-5" />
              </button>
              <button
                onClick={logout}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar */}
          <div className="lg:w-1/3">
            {/* User Profile */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white text-xl font-medium">
                  {(user?.name ?? user?.email ?? '?').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {user?.name ?? 'Usuario'}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
                  <button className="mt-2 px-3 py-1 rounded-full text-xs font-medium text-white bg-gray-600">
                    Free Plan
                  </button>
                </div>
              </div>
            </div>

            {/* Message Usage */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Message Usage
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Standard</span>
                    <span className="text-gray-900 dark:text-white">0/20</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                    <div className="bg-purple-600 h-2 rounded-full w-0"></div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    20 messages remaining
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                Each tool call (e.g. search grounding) used in a reply consumes an additional standard credit. 
                Models may not always utilize enabled tools.
              </p>
            </div>

            {/* Keyboard Shortcuts */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Keyboard Shortcuts
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Search</span>
                  <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">
                    Ctrl K
                  </kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">New Chat</span>
                  <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">
                    Ctrl Shift O
                  </kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Toggle Sidebar</span>
                  <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">
                    Ctrl B
                  </kbd>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-2/3">
            {/* Navigation Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-lg mb-6">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex space-x-8 px-6">
                  <button className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                    Account
                  </button>
                  <button className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                    Customization
                  </button>
                  <button className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                    History & Sync
                  </button>
                  <button className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                    Models
                  </button>
                  <button className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                    API Keys
                  </button>
                  <button className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                    Attachments
                  </button>
                  <button className="border-b-2 border-purple-600 py-4 px-1 text-sm font-medium text-purple-600">
                    Contact Us
                  </button>
                </nav>
              </div>
            </div>

            {/* Contact Us Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                We're here to help!
              </h2>

              {/* Help Cards Grid */}
              <div className="grid md:grid-cols-2 gap-4">
                {helpCards.map((card, index) => (
                  <div
                    key={index}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-300 dark:hover:border-gray-600 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="text-purple-600 dark:text-purple-400 mt-1">
                        {card.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                          {card.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {card.description}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                        >
                          {card.action}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Additional Support Info */}
              <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  Need immediate help?
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  For urgent issues or questions, our support team is available 24/7.
                </p>
                <div className="flex space-x-3">
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                    Live Chat
                  </Button>
                  <Button variant="outline">
                    Email Support
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
