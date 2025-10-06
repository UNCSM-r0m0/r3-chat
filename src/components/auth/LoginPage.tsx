"use client"

import type React from "react"
import { useEffect } from "react"
import { ArrowLeft, Github } from "lucide-react"
import { useAuth } from "../../hooks/useAuth"
import { API_BASE_URL } from "../../constants"

export const LoginPage: React.FC = () => {
  const { isLoading } = useAuth()

  // Manejar el callback de OAuth
  const handleOAuthCallback = async () => {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get("code")
    const state = urlParams.get("state")

    if (code && state) {
      try {
        // Aquí deberías hacer una llamada a tu backend para intercambiar el code por un token
        // Por ahora, redirigimos directamente a la página principal
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

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* fondo tipo T3: radial + sutiles brillos */}
      <div className="absolute inset-0 -z-10 bg-[#0b0a0e]" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(1000px_600px_at_50%_-100px,rgba(139,92,246,0.25),transparent_60%)]" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(800px_400px_at_80%_120%,rgba(236,72,153,0.15),transparent_60%)]" />
     

      {/* Header volver */}
      <div className="absolute top-6 left-6">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-white/80 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/5"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span className="text-sm font-medium">Back to Chat</span>
        </button>
      </div>
  
      {/* Card centrada */}
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm p-8 shadow-2xl">
          <h1 className="text-center text-4xl md:text-5xl font-bold tracking-tight text-white">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">R3.chat</span>
          </h1>
          <p className="mt-3 text-center text-white/70">
            Sign in below (we'll increase your message limits if you do) 😊
          </p>
  
          <div className="mt-8 space-y-3">
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full h-12 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-400 hover:to-fuchsia-400 text-white font-semibold shadow-lg transition-all disabled:opacity-50"
            >
              Continue with Google
            </button>
  
            <button
              onClick={handleGitHubLogin}
              disabled={isLoading}
              className="w-full h-12 rounded-lg bg-white/5 hover:bg-white/10 text-white font-semibold border border-white/10 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5a12 12 0 00-3.79 23.4c.6.1.82-.26.82-.58l-.02-2.04c-3.34.73-4.04-1.61-4.04-1.61-.55-1.38-1.34-1.75-1.34-1.75-1.09-.75.08-.74.08-.74 1.2.09 1.83 1.23 1.83 1.23 1.07 1.84 2.8 1.31 3.49 1 .11-.78.42-1.31.76-1.61-2.66-.3-5.46-1.33-5.46-5.93 0-1.31.47-2.38 1.23-3.22-.12-.3-.53-1.52.12-3.17 0 0 1-.32 3.3 1.23a11.5 11.5 0 016 0c2.28-1.55 3.28-1.23 3.28-1.23.65 1.65.24 2.87.12 3.17.77.84 1.23 1.9 1.23 3.22 0 4.61-2.8 5.62-5.47 5.92.43.37.82 1.1.82 2.22l-.01 3.29c0 .33.22.7.83.58A12 12 0 0012 .5z"/></svg>
              Continue with GitHub
            </button>
          </div>
  
          <p className="mt-8 text-center text-xs text-white/40">
            By continuing, you agree to our <a className="underline text-violet-400 hover:text-violet-300" href="#">Terms of Service</a> and <a className="underline text-violet-400 hover:text-violet-300" href="#">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  )
  
}
