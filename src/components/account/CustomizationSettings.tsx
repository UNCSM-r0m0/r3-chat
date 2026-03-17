import React, { useState } from 'react';
import { Sparkles, X, Plus, Sun, Moon, Monitor } from 'lucide-react';
import { Button } from '../ui';
import { useAuth } from '../../hooks/useAuth';
import { useThemeStore } from '../../stores/themeStore';

export const CustomizationSettings: React.FC = () => {
  const { user } = useAuth();
  const { theme, setTheme, resolvedTheme } = useThemeStore();
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

  const themeOptions = [
    { id: 'light', label: 'Claro', icon: Sun },
    { id: 'dark', label: 'Oscuro', icon: Moon },
    { id: 'system', label: 'Sistema', icon: Monitor },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-[var(--accent-primary)]/10 flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-[var(--accent-primary)]" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Personalización</h2>
          <p className="text-sm text-[var(--text-secondary)]">Configura cómo R3.chat te conoce</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Theme Selector */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-3">
            Tema de la interfaz
          </label>
          <div className="flex items-center gap-2">
            {themeOptions.map((option) => {
              const Icon = option.icon;
              const isActive = theme === option.id;
              return (
                <button
                  key={option.id}
                  onClick={() => setTheme(option.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                    ${isActive
                      ? 'bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] border border-[var(--accent-primary)]/30'
                      : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:border-[var(--border-hover)]'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {option.label}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-[var(--text-tertiary)] mt-2">
            Tema actual: {resolvedTheme === 'dark' ? 'Oscuro' : 'Claro'}
          </p>
        </div>
        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
            ¿Cómo debería llamarte R3.chat?
          </label>
          <div className="relative">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent-primary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/20 transition-all"
              maxLength={50}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text-tertiary)]">
              {name.length}/50
            </div>
          </div>
        </div>

        {/* Profesión */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
            ¿A qué te dedicas?
          </label>
          <div className="relative">
            <input
              type="text"
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
              className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent-primary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/20 transition-all"
              maxLength={100}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text-tertiary)]">
              {profession.length}/100
            </div>
          </div>
        </div>

        {/* Rasgos */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
            ¿Qué rasgos debería tener R3.chat?
          </label>
          <p className="text-xs text-[var(--text-tertiary)] mb-3">
            (hasta 50 rasgos, máximo 100 caracteres cada uno)
          </p>
          
          {/* Current traits */}
          <div className="flex flex-wrap gap-2 mb-3">
            {traits.map((trait, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20"
              >
                {trait}
                <button
                  onClick={() => removeTrait(trait)}
                  className="ml-1 p-0.5 hover:bg-[var(--accent-primary)]/20 rounded transition-colors"
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
              className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent-primary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/20 transition-all"
              maxLength={100}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text-tertiary)]">
              {traits.length}/50
            </div>
          </div>

          {/* Suggested traits */}
          <div className="mt-3">
            <p className="text-xs text-[var(--text-tertiary)] mb-2">Sugeridos:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedTraits.map((trait) => (
                <button
                  key={trait}
                  onClick={() => addTrait(trait)}
                  disabled={traits.includes(trait) || traits.length >= 50}
                  className="px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-lg hover:bg-white/[0.04] hover:text-[var(--text-primary)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
            ¿Algo más que R3.chat debería saber de ti?
          </label>
          <div className="relative">
            <textarea
              value={aboutMe}
              onChange={(e) => setAboutMe(e.target.value)}
              rows={5}
              className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent-primary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/20 transition-all resize-none"
              maxLength={3000}
            />
            <div className="absolute bottom-3 right-3 text-xs text-[var(--text-tertiary)]">
              {aboutMe.length}/3000
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-subtle)]">
        <Button 
          variant="outline"
          className="border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-white/[0.04]"
        >
          Cargar Datos
        </Button>
        <Button className="bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] hover:opacity-90 text-white">
          Guardar Preferencias
        </Button>
      </div>
    </div>
  );
};

export default CustomizationSettings;
