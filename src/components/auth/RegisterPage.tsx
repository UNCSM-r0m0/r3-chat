"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { motion } from "framer-motion"
import { useAuth } from "../../hooks/useAuth"
import { AuthPageLayout } from "./AuthPageLayout"
import { AuthFormInput } from "./AuthFormInput"
import { AuthSubmitButton } from "./AuthSubmitButton"

export const RegisterPage: React.FC = () => {
  const { register, isLoading, isAuthenticated, error, clearError } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [formErrors, setFormErrors] = useState<{ name?: string; email?: string; password?: string }>({})

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true })
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    return () => { clearError() }
  }, [clearError])

  const validate = () => {
    const errors: { name?: string; email?: string; password?: string } = {}
    if (!name.trim()) errors.name = "El nombre es obligatorio"
    if (!email.trim()) errors.email = "El correo es obligatorio"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Correo inválido"
    if (!password) errors.password = "La contraseña es obligatoria"
    else if (password.length < 8) errors.password = "Mínimo 8 caracteres"
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    try {
      await register(name, email, password)
      navigate("/", { replace: true })
    } catch {
      // Error manejado por el store
    }
  }

  return (
    <AuthPageLayout title="Crear cuenta" subtitle="Regístrate para empezar">
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthFormInput
          label="Nombre"
          type="text"
          value={name}
          onChange={setName}
          error={formErrors.name}
          placeholder="Tu nombre"
          required
          autoComplete="name"
        />
        <AuthFormInput
          label="Correo electrónico"
          type="email"
          value={email}
          onChange={setEmail}
          error={formErrors.email}
          placeholder="correo@ejemplo.com"
          required
          autoComplete="email"
        />
        <AuthFormInput
          label="Contraseña"
          type="password"
          value={password}
          onChange={setPassword}
          error={formErrors.password}
          placeholder="Mínimo 8 caracteres"
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
          Crear cuenta
        </AuthSubmitButton>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-[var(--text-secondary)]">
          ¿Ya tienes cuenta?{" "}
          <Link
            to="/login"
            className="text-[var(--accent-secondary)] hover:text-[var(--accent-primary)] font-medium transition-colors"
          >
            Inicia sesión
          </Link>
        </p>
      </div>
    </AuthPageLayout>
  )
}

export default RegisterPage
