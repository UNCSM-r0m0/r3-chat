import React, { useState } from 'react';
import { Sparkles, X, Plus } from 'lucide-react';
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
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-purple-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Personalización</h2>
          <p className="text-sm text-zinc-400">Configura cómo R3.chat te conoce</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            ¿Cómo debería llamarte R3.chat?
          </label>
          <div className="relative">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-900/50 border border-white/[0.06] rounded-xl text-zinc-200 placeholder:text-zinc-500 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
              maxLength={50}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500">
              {name.length}/50
            </div>
          </div>
        </div>

        {/* Profesión */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            ¿A qué te dedicas?
          </label>
          <div className="relative">
            <input
              type="text"
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-900/50 border border-white/[0.06] rounded-xl text-zinc-200 placeholder:text-zinc-500 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
              maxLength={100}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500">
              {profession.length}/100
            </div>
          </div>
        </div>

        {/* Rasgos */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            ¿Qué rasgos debería tener R3.chat?
          </label>
          <p className="text-xs text-zinc-500 mb-3">
            (hasta 50 rasgos, máximo 100 caracteres cada uno)
          </p>
          
          {/* Current traits */}
          <div className="flex flex-wrap gap-2 mb-3">
            {traits.map((trait, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20"
              >
                {trait}
                <button
                  onClick={() => removeTrait(trait)}
                  className="ml-1 p-0.5 hover:bg-purple-500/20 rounded transition-colors"
                >
                  <X className="w-3 h-3" />
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
              placeholder="Escribe un rasgo y presiona Enter..."
              className="w-full px-4 py-3 bg-zinc-900/50 border border-white/[0.06] rounded-xl text-zinc-200 placeholder:text-zinc-500 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
              maxLength={100}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500">
              {traits.length}/50
            </div>
          </div>

          {/* Suggested traits */}
          <div className="mt-3">
            <p className="text-xs text-zinc-500 mb-2">Sugeridos:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedTraits.map((trait) => (
                <button
                  key={trait}
                  onClick={() => addTrait(trait)}
                  disabled={traits.includes(trait) || traits.length >= 50}
                  className="px-3 py-1.5 text-xs font-medium text-zinc-400 bg-zinc-900/50 border border-white/[0.06] rounded-lg hover:bg-white/5 hover:text-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Plus className="w-3 h-3 inline mr-1" />
                  {trait}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Acerca de mí */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            ¿Algo más que R3.chat debería saber de ti?
          </label>
          <div className="relative">
            <textarea
              value={aboutMe}
              onChange={(e) => setAboutMe(e.target.value)}
              rows={5}
              className="w-full px-4 py-3 bg-zinc-900/50 border border-white/[0.06] rounded-xl text-zinc-200 placeholder:text-zinc-500 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
              maxLength={3000}
            />
            <div className="absolute bottom-3 right-3 text-xs text-zinc-500">
              {aboutMe.length}/3000
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.06]">
        <Button 
          variant="outline"
          className="border-white/10 text-zinc-300 hover:bg-white/5"
        >
          Cargar Datos
        </Button>
        <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white">
          Guardar Preferencias
        </Button>
      </div>
    </div>
  );
};

export default CustomizationSettings;
