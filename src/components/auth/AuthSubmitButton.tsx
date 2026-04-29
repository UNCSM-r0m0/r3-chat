"use client"

import type React from "react"
import { motion } from "framer-motion"

interface AuthSubmitButtonProps {
  children: React.ReactNode
  isLoading?: boolean
  disabled?: boolean
  variant?: "primary" | "secondary"
}

export const AuthSubmitButton: React.FC<AuthSubmitButtonProps> = ({
  children,
  isLoading = false,
  disabled = false,
  variant = "primary",
}) => {
  const baseStyles = "w-full h-12 rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-3"
  const variants = {
    primary: "bg-[var(--text-primary)] text-[var(--bg-primary)] shadow-lg hover:bg-[var(--text-secondary)]",
    secondary: "bg-[var(--bg-tertiary)] hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-subtle)]",
  }

  return (
    <motion.button
      type="submit"
      whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]}`}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Cargando...</span>
        </>
      ) : (
        children
      )}
    </motion.button>
  )
}

export default AuthSubmitButton
