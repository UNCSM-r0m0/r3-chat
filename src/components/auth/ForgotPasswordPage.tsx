"use client"

import type React from "react"
import { useState } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Mail, CheckCircle } from "lucide-react"
import { useAuth } from "../../hooks/useAuth"
import { AuthPageLayout } from "./AuthPageLayout"
import { AuthFormInput } from "./AuthFormInput"
import { AuthSubmitButton } from "./AuthSubmitButton"

export const ForgotPasswordPage: React.FC = () => {
  const { forgotPassword, isLoading, error } = useAuth()

  const [email, setEmail] = useState("")
  const [formError, setFormError] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const validate = () => {
    if (!email.trim()) {
      setFormError("El correo es obligatorio")
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError("Correo inválido")
      return false
    }
    setFormError("")
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    try {
      await forgotPassword(email)
      setSubmitted(true)
    } catch {
      // Aún así mostramos el mensaje genérico de éxito por seguridad
      setSubmitted(true)
    }
  }

  if (submitted) {
    return (
      <AuthPageLayout title="Revisa tu correo" subtitle="">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-8"
        >
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <p className="text-[var(--text-primary)] text-lg font-medium mb-2">
            Enlace enviado
          </p>
          <p className="text-[var(--text-secondary)] text-sm">
            Si el correo existe, recibirás un enlace de recuperación.
          </p>
          <Link
            to="/login"
            className="inline-block mt-6 text-[var(--accent-secondary)] hover:text-[var(--accent-primary)] font-medium transition-colors"
          >
            Volver al login
          </Link>
        </motion.div>
      </AuthPageLayout>
    )
  }

  return (
    <AuthPageLayout title="Recuperar contraseña" subtitle="Ingresa tu correo para recibir un enlace">
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthFormInput
          label="Correo electrónico"
          type="email"
          value={email}
          onChange={setEmail}
          error={formError}
          placeholder="correo@ejemplo.com"
          required
          autoComplete="email"
        />

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2"
          >
            {error}
          </motion.p>
        )}

        <AuthSubmitButton isLoading={isLoading}>
          <Mail className="w-4 h-4" />
          Enviar enlace de recuperación
        </AuthSubmitButton>
      </form>

      <div className="mt-6 text-center">
        <Link
          to="/login"
          className="text-sm text-[var(--accent-secondary)] hover:text-[var(--accent-primary)] transition-colors"
        >
          Volver al login
        </Link>
      </div>
    </AuthPageLayout>
  )
}

export default ForgotPasswordPage
