import React, { useState } from 'react';
import { ArrowLeft, Sun, Sparkles, User, Palette, Settings } from 'lucide-react';
import { Button } from '../ui';
import { useAuth } from '../../hooks/useAuth';

export const CustomizationSettings: React.FC = () => {
  const { user, logout } = useAuth();
  const [name, setName] = useState(user?.name || 'Lenin Osorio');
  const [profession, setProfession] = useState('Engineer, student');
  const [traits, setTraits] = useState(['witty', 'curious', 'friendly']);
  const [newTrait, setNewTrait] = useState('');
  const [aboutMe, setAboutMe] = useState('Soy un desarrollador apasionado por el crecimiento profesional y las mejores prácticas en el desarrollo de software. Me enfoco en crear arquitecturas escalables y seguras, con experiencia actual en APIs REST con .NET 9, NestJS, microservicios y Docker.');
  
  const [disableExternalWarning, setDisableExternalWarning] = useState(false);
  const [invertSendBehavior, setInvertSendBehavior] = useState(false);
  const [boringTheme, setBoringTheme] = useState(false);
  const [hidePersonalInfo, setHidePersonalInfo] = useState(false);
  const [disableThematicBreaks, setDisableThematicBreaks] = useState(false);
  const [statsForNerds, setStatsForNerds] = useState(false);
  const [mainFont, setMainFont] = useState('System Font');
  const [codeFont, setCodeFont] = useState('System Font');

  const suggestedTraits = ['concise', 'empathetic', 'creative', 'patient'];

  const addTrait = (trait: string) => {
    if (trait && !traits.includes(trait) && traits.length < 50) {
      setTraits([...traits, trait]);
      setNewTrait('');
    }
  };

  const removeTrait = (traitToRemove: string) => {
    setTraits(traits.filter(trait => trait !== traitToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      addTrait(newTrait);
    }
  };

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
                  <button className="border-b-2 border-purple-600 py-4 px-1 text-sm font-medium text-purple-600">
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
                  <button className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                    Contact Us
                  </button>
                </nav>
              </div>
            </div>

            {/* Customize T3 Chat */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Customize T3 Chat
              </h2>

              {/* What should T3 Chat call you? */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  What should T3 Chat call you?
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  maxLength={50}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {name.length}/50
                </p>
              </div>

              {/* What do you do? */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  What do you do?
                </label>
                <input
                  type="text"
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  maxLength={100}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {profession.length}/100
                </p>
              </div>

              {/* What traits should T3 Chat have? */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  What traits should T3 Chat have?
                </label>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  (up to 50, max 100 chars each)
                </p>
                
                {/* Existing traits */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {traits.map((trait, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200"
                    >
                      {trait}
                      <button
                        onClick={() => removeTrait(trait)}
                        className="ml-2 text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                {/* Add new trait */}
                <input
                  type="text"
                  value={newTrait}
                  onChange={(e) => setNewTrait(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a trait and press Enter or Tab..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  maxLength={100}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {traits.length}/50
                </p>

                {/* Suggested traits */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {suggestedTraits.map((trait) => (
                    <button
                      key={trait}
                      onClick={() => addTrait(trait)}
                      className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      {trait}
                    </button>
                  ))}
                </div>
              </div>

              {/* Anything else T3 Chat should know about you? */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Anything else T3 Chat should know about you?
                </label>
                <textarea
                  value={aboutMe}
                  onChange={(e) => setAboutMe(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  maxLength={3000}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {aboutMe.length}/3000
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4 mb-8">
                <Button variant="outline" className="px-6">
                  Load Legacy Data
                </Button>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white px-6">
                  Save Preferences
                </Button>
              </div>

              {/* Behavior Options */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Behavior Options
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Disable External Link Warning
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Skip confirmation for external links. External links may be unsafe.
                      </p>
                    </div>
                    <button
                      onClick={() => setDisableExternalWarning(!disableExternalWarning)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        disableExternalWarning ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          disableExternalWarning ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Invert Send/New Line Behavior
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Enter sends message, Shift/Ctrl + Enter creates new line.
                      </p>
                    </div>
                    <button
                      onClick={() => setInvertSendBehavior(!invertSendBehavior)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        invertSendBehavior ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          invertSendBehavior ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Visual Options */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Visual Options
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Boring Theme
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Tone down the "pink" theme.
                      </p>
                    </div>
                    <button
                      onClick={() => setBoringTheme(!boringTheme)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        boringTheme ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          boringTheme ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Hide Personal Information
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Hide name and email from the UI.
                      </p>
                    </div>
                    <button
                      onClick={() => setHidePersonalInfo(!hidePersonalInfo)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        hidePersonalInfo ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          hidePersonalInfo ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Disable Thematic Breaks
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Hide horizontal lines in chat messages to fix rendering bugs.
                      </p>
                    </div>
                    <button
                      onClick={() => setDisableThematicBreaks(!disableThematicBreaks)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        disableThematicBreaks ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          disableThematicBreaks ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Stats for Nerds
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Enable insights into message stats (tokens per second, time to first token, estimated tokens).
                      </p>
                    </div>
                    <button
                      onClick={() => setStatsForNerds(!statsForNerds)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        statsForNerds ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          statsForNerds ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Main Text Font
                      </p>
                    </div>
                    <select
                      value={mainFont}
                      onChange={(e) => setMainFont(e.target.value)}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option>System Font</option>
                      <option>Inter</option>
                      <option>Roboto</option>
                      <option>Open Sans</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Code Font
                      </p>
                    </div>
                    <select
                      value={codeFont}
                      onChange={(e) => setCodeFont(e.target.value)}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option>System Font</option>
                      <option>Fira Code</option>
                      <option>JetBrains Mono</option>
                      <option>Source Code Pro</option>
                    </select>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Fonts Preview
                    </p>
                    <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <p className="text-gray-900 dark:text-white">
                        Can you write me a simple hello world program?
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
