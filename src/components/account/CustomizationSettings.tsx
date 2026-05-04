import React, { useState, useEffect } from 'react';
import { Sparkles, X, Plus, Sun, Moon, Monitor, Loader2, Wand2, Check, AlertCircle } from 'lucide-react';
import { Button } from '../ui';
import { useAuth } from '../../hooks/useAuth';
import { useThemeStore } from '../../stores/themeStore';
import { apiService } from '../../services/api';
import type { UserPreferences } from '../../types';

export const CustomizationSettings: React.FC = () => {
  const { user } = useAuth();
  const { setTheme, resolvedTheme } = useThemeStore();
  const [preferences, setPreferences] = useState<UserPreferences>({
    display_name: '',
    profession: '',
    traits: [],
    about_me: '',
    theme: 'system',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newTrait, setNewTrait] = useState('');
  const [isGeneratingTraits, setIsGeneratingTraits] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotice = (type: 'success' | 'error', message: string) => {
    setNotice({ type, message });
    window.setTimeout(() => setNotice(null), 3000);
  };

  // Load preferences from backend
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        setIsLoading(true);
        const response = await apiService.getPreferences();
        if (response.success && response.data) {
          const data = response.data as UserPreferences;
          setPreferences({
            display_name: data.display_name || user?.name || '',
            profession: data.profession || '',
            traits: data.traits || [],
            about_me: data.about_me || '',
            theme: data.theme || 'system',
          });
          // Sync theme with global store
          if (data.theme && data.theme !== 'system') {
            setTheme(data.theme as 'light' | 'dark' | 'system');
          }
        }
      } catch (error) {
        console.warn('Error cargando preferencias:', error);
        // Use user name as fallback
        setPreferences(prev => ({
          ...prev,
          display_name: user?.name || '',
        }));
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, [user?.name]);

  const normalizeTrait = (trait: string) => trait.trim().toLowerCase();

  const addTrait = (trait: string) => {
    const cleanTrait = normalizeTrait(trait);
    if (cleanTrait && !preferences.traits.includes(cleanTrait) && preferences.traits.length < 50) {
      setPreferences(prev => ({ ...prev, traits: [...prev.traits, cleanTrait] }));
      setNewTrait('');
    }
  };

  const addTraitsFromInput = () => {
    const traits = newTrait
      .split(/[,\n]/)
      .map(normalizeTrait)
      .filter(Boolean)
      .filter((trait, index, self) => self.indexOf(trait) === index);

    if (traits.length === 0) return;

    setPreferences(prev => {
      const nextTraits = [...prev.traits];
      for (const trait of traits) {
        if (trait.length <= 100 && !nextTraits.includes(trait) && nextTraits.length < 50) {
          nextTraits.push(trait);
        }
      }
      return { ...prev, traits: nextTraits };
    });
    setNewTrait('');
  };

  const removeTrait = (traitToRemove: string) => {
    setPreferences(prev => ({
      ...prev,
      traits: prev.traits.filter(trait => trait !== traitToRemove),
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      addTraitsFromInput();
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await apiService.updatePreferences(preferences);
      // Sync theme
      if (preferences.theme) {
        setTheme(preferences.theme as 'light' | 'dark' | 'system');
      }
      showNotice('success', 'Preferencias guardadas correctamente');
    } catch (error) {
      console.error('Error guardando preferencias:', error);
      showNotice('error', 'Error al guardar preferencias');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoad = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getPreferences();
      if (response.success && response.data) {
        const data = response.data as UserPreferences;
        setPreferences({
          display_name: data.display_name || user?.name || '',
          profession: data.profession || '',
          traits: data.traits || [],
          about_me: data.about_me || '',
          theme: data.theme || 'system',
        });
      }
    } catch (error) {
      console.warn('Error cargando preferencias:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateTraitsWithAI = async () => {
    try {
      setIsGeneratingTraits(true);
      
      const response = await apiService.suggestTraits(preferences);

      if (response.success && response.data?.traits) {
        const suggestedTraits = response.data.traits
          .map(t => t.trim().toLowerCase())
          .filter(t => t.length > 0 && t.length <= 100)
          .slice(0, 5);

        if (suggestedTraits.length > 0) {
          setNewTrait(suggestedTraits.join(', '));
        }
      }
    } catch (error) {
      console.error('Error generando rasgos con IA:', error);
      showNotice('error', 'No se pudieron generar sugerencias. Intentá de nuevo más tarde.');
    } finally {
      setIsGeneratingTraits(false);
    }
  };

  const themeOptions = [
    { id: 'light', label: 'Claro', icon: Sun },
    { id: 'dark', label: 'Oscuro', icon: Moon },
    { id: 'system', label: 'Sistema', icon: Monitor },
  ] as const;

  const suggestedTraits = ['concise', 'empathetic', 'creative', 'patient'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-primary)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {notice && (
        <div
          className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${
            notice.type === 'success'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
              : 'border-red-500/30 bg-red-500/10 text-red-300'
          }`}
        >
          {notice.type === 'success' ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {notice.message}
        </div>
      )}

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
              const isActive = preferences.theme === option.id;
              return (
                <button
                  key={option.id}
                  onClick={() => setPreferences(prev => ({ ...prev, theme: option.id }))}
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
              value={preferences.display_name}
              onChange={(e) => setPreferences(prev => ({ ...prev, display_name: e.target.value }))}
              className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent-primary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/20 transition-all"
              maxLength={50}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text-tertiary)]">
              {preferences.display_name.length}/50
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
              value={preferences.profession}
              onChange={(e) => setPreferences(prev => ({ ...prev, profession: e.target.value }))}
              className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent-primary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/20 transition-all"
              maxLength={500}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text-tertiary)]">
              {preferences.profession.length}/100
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
            {preferences.traits.map((trait, index) => (
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
              placeholder="La IA pondrá sugerencias acá; editá y presioná Enter..."
              className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent-primary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/20 transition-all"
              maxLength={100}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {newTrait.trim() && (
                <button
                  type="button"
                  onClick={addTraitsFromInput}
                  className="px-2 py-1 text-xs font-medium rounded-md text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/10 transition-colors"
                >
                  Agregar
                </button>
              )}
              <span className="text-xs text-[var(--text-tertiary)]">
                {newTrait.length}/500
              </span>
            </div>
          </div>

          {/* Suggested traits */}
          <div className="mt-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-[var(--text-tertiary)]">Sugeridos:</p>
              <button
                onClick={generateTraitsWithAI}
                disabled={isGeneratingTraits || (!preferences.display_name && !preferences.profession && !preferences.about_me)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--accent-primary)] bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 rounded-lg hover:bg-[var(--accent-primary)]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isGeneratingTraits ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Wand2 className="w-3 h-3" />
                )}
                {isGeneratingTraits ? 'Generando...' : '✨ Generar con IA'}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestedTraits.map((trait) => (
                <button
                  key={trait}
                  onClick={() => addTrait(trait)}
                  disabled={preferences.traits.includes(trait) || preferences.traits.length >= 50}
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
              value={preferences.about_me}
              onChange={(e) => setPreferences(prev => ({ ...prev, about_me: e.target.value }))}
              rows={5}
              className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent-primary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/20 transition-all resize-none"
              maxLength={3000}
            />
            <div className="absolute bottom-3 right-3 text-xs text-[var(--text-tertiary)]">
              {preferences.about_me.length}/3000
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-subtle)]">
        <Button 
          variant="outline"
          onClick={handleLoad}
          disabled={isLoading}
          className="border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-white/[0.04]"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Cargar Datos'}
        </Button>
        <Button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] hover:opacity-90 text-white"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Guardar Preferencias
        </Button>
      </div>
    </div>
  );
};

export default CustomizationSettings;
