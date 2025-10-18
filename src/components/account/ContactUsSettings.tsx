import React from 'react';
import { MessageCircle, Bug, Mail, Users, FileText, Shield } from 'lucide-react';
import { Button } from '../ui';

export const ContactUsSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Contact Us */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            We're here to help!
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Choose the option that best describes what you need help with.
          </p>
        </div>

        {/* Help Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <div className="flex items-center mb-4">
              <MessageCircle className="h-6 w-6 text-purple-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Have a cool feature idea?
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Share your ideas and help us improve T3 Chat.
            </p>
            <Button variant="outline" className="w-full">
              Feature Requests
            </Button>
          </div>

          <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <div className="flex items-center mb-4">
              <Bug className="h-6 w-6 text-red-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Found a non-critical bug?
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Report bugs and help us fix them.
            </p>
            <Button variant="outline" className="w-full">
              Report Bug
            </Button>
          </div>

          <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <div className="flex items-center mb-4">
              <Mail className="h-6 w-6 text-blue-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Having account or billing issues?
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Get help with your account or billing questions.
            </p>
            <Button variant="outline" className="w-full">
              Email Support
            </Button>
          </div>

          <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <div className="flex items-center mb-4">
              <Users className="h-6 w-6 text-green-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Want to join the community?
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Connect with other users and get support.
            </p>
            <Button variant="outline" className="w-full">
              Join Discord
            </Button>
          </div>

          <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <div className="flex items-center mb-4">
              <FileText className="h-6 w-6 text-gray-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Privacy Policy
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Learn how we protect your data and privacy.
            </p>
            <Button variant="outline" className="w-full">
              View Policy
            </Button>
          </div>

          <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <div className="flex items-center mb-4">
              <Shield className="h-6 w-6 text-gray-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Terms of Service
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Read our terms and conditions.
            </p>
            <Button variant="outline" className="w-full">
              View Terms
            </Button>
          </div>
        </div>

        {/* Immediate Help */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Need immediate help?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            For urgent issues or questions, our support team is available 24/7.
          </p>
          <div className="flex space-x-4">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">
              <MessageCircle className="h-4 w-4 mr-2" />
              Live Chat
            </Button>
            <Button variant="outline">
              <Mail className="h-4 w-4 mr-2" />
              Email Support
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};