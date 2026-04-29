"use client"

import type React from "react"

interface AuthFormInputProps {
  label: string
  type?: string
  value: string
  onChange: (value: string) => void
  error?: string
  placeholder?: string
  required?: boolean
  autoComplete?: string
}

export const AuthFormInput: React.FC<AuthFormInputProps> = ({
  label,
  type = "text",
  value,
  onChange,
  error,
  placeholder,
  required = false,
  autoComplete,
}) => {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-[var(--text-secondary)]">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        className={`
          w-full h-11 px-4 rounded-xl
          bg-[var(--bg-tertiary)] border
          text-[var(--text-primary)] placeholder-[var(--text-tertiary)]
          focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50
          transition-all
          ${error ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/50' : 'border-[var(--border-subtle)]'}
        `}
      />
      {error && (
        <p className="text-xs text-red-400 mt-1">{error}</p>
      )}
    </div>
  )
}

export default AuthFormInput
