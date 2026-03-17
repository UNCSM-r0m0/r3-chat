import React from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Code2, 
  BookOpen, 
  Lightbulb,
  MessageSquare,
  Terminal,
  Palette,
  Calculator
} from 'lucide-react';

interface WelcomeScreenProps {
  onPromptClick: (prompt: string) => void;
}

const quickActions = [
  { 
    icon: Sparkles, 
    label: 'Create', 
    prompt: 'Ayúdame a crear algo increíble',
    gradient: 'from-amber-500 to-orange-600'
  },
  { 
    icon: Code2, 
    label: 'Code', 
    prompt: 'Escribe código para...',
    gradient: 'from-blue-500 to-cyan-500'
  },
  { 
    icon: BookOpen, 
    label: 'Learn', 
    prompt: 'Explícame cómo funciona...',
    gradient: 'from-emerald-500 to-teal-500'
  },
  { 
    icon: Lightbulb, 
    label: 'Ideas', 
    prompt: 'Dame ideas para...',
    gradient: 'from-purple-500 to-pink-500'
  },
];

const suggestionPrompts = [
  { icon: Terminal, text: 'Optimiza este código Python para mejor rendimiento' },
  { icon: MessageSquare, text: 'Resume este texto de forma concisa' },
  { icon: Palette, text: 'Diseña una interfaz minimalista para una app de notas' },
  { icon: Calculator, text: 'Explica el teorema de Bayes con ejemplos prácticos' },
  { icon: Code2, text: 'Crea una API REST con Node.js y Express' },
  { icon: Lightbulb, text: 'Brainstorming para un proyecto de startup tecnológica' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut' as const,
    },
  },
};

const logoVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: 'easeOut' as const,
    },
  },
};

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onPromptClick }) => {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center justify-center min-h-full px-4 py-8 md:py-12"
    >
      {/* Logo */}
      <motion.div variants={logoVariants} className="mb-6 md:mb-8">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent-primary)] via-[var(--accent-secondary)] to-[var(--accent-tertiary)] blur-2xl opacity-30 rounded-full" />
          <div className="relative w-20 h-20 bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--bg-primary)] rounded-2xl flex items-center justify-center border border-[var(--border-subtle)] shadow-2xl">
            <Sparkles className="w-10 h-10 text-[var(--text-primary)]" />
          </div>
        </div>
      </motion.div>

      {/* Title */}
      <motion.h1 
        variants={itemVariants}
        className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-3"
      >
        <span className="text-[var(--text-primary)]">
          ¿Qué quieres
        </span>
        <br />
        <span className="gradient-text">crear hoy?</span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p 
        variants={itemVariants}
        className="text-[var(--text-secondary)] text-center text-base md:text-lg mb-8 md:mb-10 max-w-md px-4"
      >
        Tu asistente de IA para crear, codear, aprender y mucho más.
      </motion.p>

      {/* Quick Action Buttons */}
      <motion.div 
        variants={itemVariants}
        className="flex flex-wrap justify-center gap-3 mb-12"
      >
        {quickActions.map((action) => (
          <motion.button
            key={action.label}
            onClick={() => onPromptClick(action.prompt)}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="group relative flex items-center gap-2 px-5 py-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] hover:border-[var(--border-hover)] transition-all duration-300"
          >
            <div className={`p-1.5 rounded-lg bg-gradient-to-br ${action.gradient}`}>
              <action.icon className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
              {action.label}
            </span>
          </motion.button>
        ))}
      </motion.div>

      {/* Suggestion Prompts */}
      <motion.div 
        variants={itemVariants}
        className="w-full max-w-2xl"
      >
        <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-medium mb-4 text-center">
          Sugerencias
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {suggestionPrompts.map((prompt, index) => (
            <motion.button
              key={index}
              onClick={() => onPromptClick(prompt.text)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              whileHover={{ scale: 1.02, backgroundColor: 'rgba(128,128,128,0.08)' }}
              whileTap={{ scale: 0.99 }}
              className="flex items-center gap-3 p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] hover:border-[var(--border-hover)] text-left transition-all duration-200 group"
            >
              <div className="p-2 rounded-lg bg-[var(--bg-elevated)] group-hover:bg-[var(--bg-secondary)] transition-colors">
                <prompt.icon className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]" />
              </div>
              <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] line-clamp-2">
                {prompt.text}
              </span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Footer hint */}
      <motion.p 
        variants={itemVariants}
        className="mt-12 text-xs text-[var(--text-muted)] text-center"
      >
        Presiona <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-elevated)] text-[var(--text-secondary)] font-mono text-xs">Enter</kbd> para enviar · <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-elevated)] text-[var(--text-secondary)] font-mono text-xs">Shift + Enter</kbd> para nueva línea
      </motion.p>
    </motion.div>
  );
};

export default WelcomeScreen;
