"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate, useSearchParams, Link } from "react-router-dom"
import { motion } from "framer-motion"
import { CheckCircle, AlertCircle } from "lucide-react"
import { useAuth } from "../../hooks/useAuth"
import { AuthPageLayout } from "./AuthPageLayout"
import { AuthFormInput } from "./AuthFormInput"
import { AuthSubmitButton } from "./AuthSubmitButton"

export const ResetPasswordPage: React.FC = () => {
  const { resetPassword, isLoading, error } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const token = searchParams.get("token")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [formErrors, setFormErrors] = useState<{ password?: string; confirm?: string }>({})
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        navigate("/login", { replace: true })
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [success, navigate])

  const validate = () => {
    const errors: { password?: string; confirm?: string } = {}
    if (!password) errors.password = "La contraseña es obligatoria"
    else if (password.length < 8) errors.password = "Mínimo 8 caracteres"
    if (password !== confirmPassword) errors.confirm = "Las contraseñas no coinciden"
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate() || !token) return
    try {
      await resetPassword(token, password)
      setSuccess(true)
    } catch {
      // Error manejado por el store
    }
  }

  if (!token) {
    return (
      <AuthPageLayout title="Enlace inválido" subtitle="">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-8"
        >
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-[var(--text-primary)] text-lg font-medium mb-2">
            Enlace inválido o expirado
          </p>
          <p className="text-[var(--text-secondary)] text-sm mb-6">
            Solicita un nuevo enlace de recuperación.
          </p>
          <Link
            to="/forgot-password"
            className="inline-block text-[var(--accent-secondary)] hover:text-[var(--accent-primary)] font-medium transition-colors"
          >
            Solicitar nuevo enlace
          </Link>
        </motion.div>
      </AuthPageLayout>
    )
  }

  if (success) {
    return (
      <AuthPageLayout title="Contraseña actualizada" subtitle="">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-8"
        >
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <p className="text-[var(--text-primary)] text-lg font-medium mb-2">
            ¡Listo!
          </p>
          <p className="text-[var(--text-secondary)] text-sm">
            Tu contraseña ha sido actualizada. Redirigiendo al login...
          </p>
        </motion.div>
      </AuthPageLayout>
    )
  }

  return (
    <AuthPageLayout title="Nueva contraseña" subtitle="Ingresa tu nueva contraseña">
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthFormInput
          label="Nueva contraseña"
          type="password"
          value={password}
          onChange={setPassword}
          error={formErrors.password}
          placeholder="Mínimo 8 caracteres"
          required
          autoComplete="new-password"
        />
        <AuthFormInput
          label="Confirmar contraseña"
          type="password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          error={formErrors.confirm}
          placeholder="Repite tu contraseña"
          required
          autoComplete="new-password"
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
          Restablecer contraseña
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

export default ResetPasswordPage
