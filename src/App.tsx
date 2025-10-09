

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { MainLayout } from "./components/layout"
import { LoginPage, OAuthCallback } from "./components/auth"
import { SecureStorageInitializer } from "./components/ui/SecureStorageInitializer"
import { useAuth } from "./hooks/useAuth"
import { useState } from "react"

function App() {
  const { isAuthenticated, isLoading } = useAuth()
  const [isInitialized, setIsInitialized] = useState(false)

  const handleInitialized = () => {
    setIsInitialized(true)
  }

  const handleError = (error: string) => {
    console.error('Error de inicialización:', error)
    // En caso de error, continuar sin cifrado
    setIsInitialized(true)
  }

  if (!isInitialized) {
    return (
      <SecureStorageInitializer
        onInitialized={handleInitialized}
        onError={handleError}
      />
    )
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            isLoading ? (
              <div className="h-screen flex items-center justify-center bg-gray-900">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                  <p className="text-white">Cargando...</p>
                </div>
              </div>
            ) : isAuthenticated ? (
              <MainLayout />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<OAuthCallback />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
