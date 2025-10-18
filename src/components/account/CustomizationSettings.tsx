import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '../ui';
import { useAuth } from '../../hooks/useAuth';

export const CustomizationSettings: React.FC = () => {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || 'Lenin Osorio');
  const [profession, setProfession] = useState('Engineer, student');
  const [traits, setTraits] = useState(['witty', 'curious', 'friendly']);
  const [newTrait, setNewTrait] = useState('');
  const [aboutMe, setAboutMe] = useState('Soy un desarrollador apasionado por el crecimiento profesional y las mejores prácticas en el desarrollo de software. Me enfoco en crear arquitecturas escalables y seguras, con experiencia actual en APIs REST con .NET 9, NestJS, microservicios y Docker.');

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
    <div className="space-y-6">
      {/* Customize T3 Chat */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
        <div className="flex items-center mb-6">
          <Sparkles className="h-6 w-6 text-purple-600 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Customize T3 Chat
          </h2>
        </div>

        <div className="space-y-6">
          {/* What should T3 Chat call you? */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              What should T3 Chat call you?
            </label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                maxLength={50}
              />
              <div className="absolute right-3 top-2 text-xs text-gray-500 dark:text-gray-400">
                {name.length}/50
              </div>
            </div>
          </div>

          {/* What do you do? */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              What do you do?
            </label>
            <div className="relative">
              <input
                type="text"
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                maxLength={100}
              />
              <div className="absolute right-3 top-2 text-xs text-gray-500 dark:text-gray-400">
                {profession.length}/100
              </div>
            </div>
          </div>

          {/* What traits should T3 Chat have? */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              What traits should T3 Chat have?
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              (up to 50, max 100 chars each)
            </p>
            
            {/* Current traits */}
            <div className="flex flex-wrap gap-2 mb-3">
              {traits.map((trait, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200"
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
            <div className="relative">
              <input
                type="text"
                value={newTrait}
                onChange={(e) => setNewTrait(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type a trait and press Enter or Tab..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                maxLength={100}
              />
              <div className="absolute right-3 top-2 text-xs text-gray-500 dark:text-gray-400">
                {traits.length}/50
              </div>
            </div>

            {/* Suggested traits */}
            <div className="mt-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Suggested:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedTraits.map((trait) => (
                  <button
                    key={trait}
                    onClick={() => addTrait(trait)}
                    disabled={traits.includes(trait) || traits.length >= 50}
                    className="px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {trait}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Anything else T3 Chat should know about you? */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Anything else T3 Chat should know about you?
            </label>
            <div className="relative">
              <textarea
                value={aboutMe}
                onChange={(e) => setAboutMe(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white resize-none"
                maxLength={3000}
              />
              <div className="absolute bottom-3 right-3 text-xs text-gray-500 dark:text-gray-400">
                {aboutMe.length}/3000
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-8">
          <Button variant="outline">
            Load Legacy Data
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white">
            Save Preferences
          </Button>
        </div>
      </div>
    </div>
  );
};