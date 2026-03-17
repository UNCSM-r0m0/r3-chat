"use client"

import type React from "react"
import { useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Sparkles, Bot, Zap, Shield } from "lucide-react"
import { useAuth } from "../../hooks/useAuth"
import { API_BASE_URL } from "../../constants"

export const LoginPage: React.FC = () => {
  const { isLoading, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  // Si ya está autenticado, redirigir al home
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true })
    }
  }, [isAuthenticated, navigate])

  // Manejar el callback de OAuth
  const handleOAuthCallback = async () => {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get("code")
    const state = urlParams.get("state")

    if (code && state) {
      try {
        window.location.href = "/"
      } catch (error) {
        console.error("Error en OAuth callback:", error)
      }
    }
  }

  useEffect(() => {
    handleOAuthCallback()
  }, [])

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}/auth/google`
  }

  const handleGitHubLogin = () => {
    window.location.href = `${API_BASE_URL}/auth/github`
  }

  const features = [
    { icon: Bot, text: "Acceso a múltiples modelos de IA" },
    { icon: Zap, text: "Respuestas rápidas y precisas" },
    { icon: Shield, text: "Tus datos están seguros" },
  ]

  // Iconos de proveedores (SVG inline)
  const MoonshotIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4" fill="currentColor" />
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )

  const DeepSeekIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )

  const OllamaIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
      <rect x="4" y="6" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M8 10h8M8 14h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )

  const providers = [
    { name: "Moonshot AI", icon: MoonshotIcon, color: "text-emerald-400" },
    { name: "DeepSeek", icon: DeepSeekIcon, color: "text-blue-400" },
    { name: "Ollama", icon: OllamaIcon, color: "text-amber-400" },
  ]

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0a0a0a]">
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
            {/* Logo en header */}
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
              <h1 className="text-5xl font-bold text-white leading-tight mb-4">
                Tu asistente de IA{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400">
                  inteligente
                </span>
              </h1>
              <p className="text-lg text-zinc-400 leading-relaxed">
                Accede a los mejores modelos de inteligencia artificial en un solo lugar. 
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
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-purple-400" />
                  </div>
                  <span className="text-zinc-300">{feature.text}</span>
                </motion.div>
              ))}
            </div>

            {/* Proveedores de modelos */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-8 pt-6 border-t border-white/[0.06]"
            >
              <p className="text-sm text-zinc-500 mb-4">Modelos disponibles de:</p>
              <div className="flex items-center gap-4">
                {providers.map((provider) => {
                  const ProviderIcon = provider.icon
                  return (
                    <div
                      key={provider.name}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/[0.08] transition-colors"
                    >
                      <div className={provider.color}>
                        <ProviderIcon />
                      </div>
                      <span className="text-sm text-zinc-300 font-medium">{provider.name}</span>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          </motion.div>

          {/* Lado derecho - Login card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-3xl blur-xl" />
              
              <div className="relative rounded-2xl border border-white/[0.08] bg-zinc-900/50 backdrop-blur-xl p-8 shadow-2xl">
                {/* Logo móvil */}
                <div className="lg:hidden flex flex-col items-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-zinc-800 to-black rounded-2xl flex items-center justify-center border border-white/10 mb-4 shadow-lg">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold text-white">
                    R3<span className="text-purple-400">.chat</span>
                  </h1>
                </div>

                <div className="hidden lg:block mb-6">
                  <h2 className="text-2xl font-bold text-white">Bienvenido de vuelta</h2>
                  <p className="text-zinc-400 mt-1">Inicia sesión para continuar</p>
                </div>

                <p className="text-zinc-400 text-center lg:text-left mb-6 lg:hidden">
                  Inicia sesión para acceder a todos los modelos de IA
                </p>

                <div className="space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    className="w-full h-12 rounded-xl bg-white text-zinc-900 font-semibold shadow-lg hover:bg-zinc-100 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continuar con Google
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleGitHubLogin}
                    disabled={isLoading}
                    className="w-full h-12 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold border border-white/10 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 .5a12 12 0 00-3.79 23.4c.6.1.82-.26.82-.58l-.02-2.04c-3.34.73-4.04-1.61-4.04-1.61-.55-1.38-1.34-1.75-1.34-1.75-1.09-.75.08-.74.08-.74 1.2.09 1.83 1.23 1.83 1.23 1.07 1.84 2.8 1.31 3.49 1 .11-.78.42-1.31.76-1.61-2.66-.3-5.46-1.33-5.46-5.93 0-1.31.47-2.38 1.23-3.22-.12-.3-.53-1.52.12-3.17 0 0 1-.32 3.3 1.23a11.5 11.5 0 016 0c2.28-1.55 3.28-1.23 3.28-1.23.65 1.65.24 2.87.12 3.17.77.84 1.23 1.9 1.23 3.22 0 4.61-2.8 5.62-5.47 5.92.43.37.82 1.1.82 2.22l-.01 3.29c0 .33.22.7.83.58A12 12 0 0012 .5z"/>
                    </svg>
                    Continuar con GitHub
                  </motion.button>
                </div>

                <div className="mt-6 pt-6 border-t border-white/[0.06]">
                  <p className="text-center text-xs text-zinc-500 leading-relaxed">
                    Al continuar, aceptas nuestros{' '}
                    <Link 
                      to="/terms" 
                      target="_blank"
                      className="text-purple-400 hover:text-purple-300 underline underline-offset-2 transition-colors"
                    >
                      Términos de Servicio
                    </Link>{' '}
                    y{' '}
                    <Link 
                      to="/privacy" 
                      target="_blank"
                      className="text-purple-400 hover:text-purple-300 underline underline-offset-2 transition-colors"
                    >
                      Política de Privacidad
                    </Link>
                  </p>
                </div>

                {/* Benefits */}
                <div className="mt-6 flex items-center justify-center gap-4 text-xs text-zinc-500">
                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-400" />
                    Límites aumentados
                  </span>
                  <span className="w-1 h-1 rounded-full bg-zinc-700" />
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-purple-400" />
                    Historial guardado
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
