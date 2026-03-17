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
      className="flex flex-col items-center justify-center min-h-full px-4 py-12"
    >
      {/* Logo */}
      <motion.div variants={logoVariants} className="mb-8">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 blur-2xl opacity-30 rounded-full" />
          <div className="relative w-20 h-20 bg-gradient-to-br from-gray-900 to-black rounded-2xl flex items-center justify-center border border-white/10 shadow-2xl">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
        </div>
      </motion.div>

      {/* Title */}
      <motion.h1 
        variants={itemVariants}
        className="text-4xl md:text-5xl font-bold text-center mb-3"
      >
        <span className="bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">
          ¿Qué quieres
        </span>
        <br />
        <span className="gradient-text">crear hoy?</span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p 
        variants={itemVariants}
        className="text-zinc-400 text-center text-lg mb-10 max-w-md"
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
            className="group relative flex items-center gap-2 px-5 py-3 rounded-xl bg-zinc-900/80 border border-white/8 hover:border-white/15 transition-all duration-300"
          >
            <div className={`p-1.5 rounded-lg bg-gradient-to-br ${action.gradient}`}>
              <action.icon className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors">
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
        <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-4 text-center">
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
              whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.06)' }}
              whileTap={{ scale: 0.99 }}
              className="flex items-center gap-3 p-4 rounded-xl bg-zinc-900/50 border border-white/5 hover:border-white/10 text-left transition-all duration-200 group"
            >
              <div className="p-2 rounded-lg bg-zinc-800 group-hover:bg-zinc-700/80 transition-colors">
                <prompt.icon className="w-4 h-4 text-zinc-400 group-hover:text-zinc-300" />
              </div>
              <span className="text-sm text-zinc-400 group-hover:text-zinc-200 line-clamp-2">
                {prompt.text}
              </span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Footer hint */}
      <motion.p 
        variants={itemVariants}
        className="mt-12 text-xs text-zinc-600 text-center"
      >
        Presiona <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono text-xs">Enter</kbd> para enviar · <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono text-xs">Shift + Enter</kbd> para nueva línea
      </motion.p>
    </motion.div>
  );
};

export default WelcomeScreen;
