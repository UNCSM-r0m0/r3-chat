"use client"

import type React from "react"
import { motion } from "framer-motion"
import { Sparkles, Bot, Zap, Shield } from "lucide-react"
import { MoonshotIcon, DeepSeekIcon, OllamaIcon } from "./ProviderIcons"

interface AuthPageLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
}

const features = [
  { icon: Bot, text: "Acceso a múltiples modelos de IA" },
  { icon: Zap, text: "Respuestas rápidas y precisas" },
  { icon: Shield, text: "Tus datos están seguros" },
]

const providers = [
  { name: "Moonshot AI", Icon: MoonshotIcon, color: "text-emerald-400" },
  { name: "DeepSeek", Icon: DeepSeekIcon, color: "text-blue-400" },
  { name: "Ollama", Icon: OllamaIcon, color: "text-amber-400" },
]

export const AuthPageLayout: React.FC<AuthPageLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen relative overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* Fondo con gradientes animados */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-pink-600/15 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[150px]" />
      </div>

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-zinc-800 to-black rounded-lg flex items-center justify-center border border-white/10">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-white tracking-tight">R3.chat</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="min-h-screen flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-4xl grid lg:grid-cols-2 gap-12 items-center">

          {/* Lado izquierdo - Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="hidden lg:block"
          >
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm mb-6">
                <Sparkles className="w-4 h-4" />
                <span>IA Avanzada para todos</span>
              </div>
              <h1 className="text-5xl font-bold text-[var(--text-primary)] leading-tight mb-4">
                Tu asistente de IA{' '}
                <span className="gradient-text">
                  inteligente
                </span>
              </h1>
              <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
                Accede a los mejores modelos de inteligencia artificial open source en un solo lugar.
                Crea, aprende y conversa sin límites.
              </p>
            </div>

            <div className="space-y-4">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.text}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-[var(--border-subtle)] flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-[var(--accent-secondary)]" />
                  </div>
                  <span className="text-[var(--text-secondary)]">{feature.text}</span>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-8 pt-6 border-t border-[var(--border-subtle)]"
            >
              <p className="text-sm text-[var(--text-tertiary)] mb-4">Modelos disponibles de:</p>
              <div className="flex items-center gap-4">
                {providers.map((provider) => (
                  <div
                    key={provider.name}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.04] border border-[var(--border-subtle)] hover:bg-white/[0.06] transition-colors"
                  >
                    <provider.Icon className={`w-4 h-4 ${provider.color}`} />
                    <span className="text-sm text-[var(--text-secondary)] font-medium">{provider.name}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Lado derecho - Form card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-3xl blur-xl" />

              <div className="relative rounded-2xl border border-[var(--border-default)] bg-[var(--bg-secondary)]/80 backdrop-blur-xl p-8 shadow-2xl">
                {/* Logo móvil */}
                <div className="lg:hidden flex flex-col items-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-zinc-800 to-black rounded-2xl flex items-center justify-center border border-white/10 mb-4 shadow-lg">
                    <Sparkles className="w-8 h-8 text-[var(--text-primary)]" />
                  </div>
                  <h1 className="text-3xl font-bold text-[var(--text-primary)]">
                    R3<span className="text-[var(--accent-secondary)]">.chat</span>
                  </h1>
                </div>

                {title && (
                  <div className="hidden lg:block mb-6">
                    <h2 className="text-2xl font-bold text-[var(--text-primary)]">{title}</h2>
                    {subtitle && <p className="text-[var(--text-secondary)] mt-1">{subtitle}</p>}
                  </div>
                )}

                {children}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default AuthPageLayout
