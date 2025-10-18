"use client"
// TODA LA PRTDE DEL LOGIN DONDE ESTA TODO SU DISEÑO Y LOGISTICA FUNCIONAL 
import type React from "react"
import { useState } from "react"
import Dashboard from "@/components/Dashboard"
import { ThemeProvider } from "@/components/ThemeContext"
import { Lock, Shield } from "lucide-react"

export default function Page() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isRegisterMode, setIsRegisterMode] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordHint, setPasswordHint] = useState("")

  const [savedPasswords] = useState<
    { id: number; site: string; username: string; password: string; category: string }[]
  >([])

  const getPasswordStrength = (password: string) => {
    let score = 0
    if (password.length >= 8) score += 2
    if (password.length >= 12) score += 1
    if (/[a-z]/.test(password)) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/\d/.test(password)) score += 1
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 2
    if (password.length >= 16) score += 1

    if (score <= 3) return { level: "Débil", color: "rgb(239 68 68)", score }
    if (score <= 6) return { level: "Media", color: "rgb(234 179 8)", score }
    return { level: "Fuerte", color: "rgb(34 197 94)", score }
  }

  const isStrongPassword = (password: string) => {
    return getPasswordStrength(password).score > 6
  }

  // 👉 Nuevo handleLogin con llamadas a la API
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username.trim()) {
      alert("El campo Usuario es obligatorio")
      return
    }
    if (!password.trim()) {
      alert("El campo Contraseña es obligatorio")
      return
    }

    if (isRegisterMode) {
      if (!isStrongPassword(password)) {
        alert(
          "La contraseña debe tener:\n- Mínimo 8 caracteres\n- Al menos 1 mayúscula\n- Al menos 1 minúscula\n- Al menos 1 número\n- Al menos 1 carácter especial (!@#$%^&*)"
        )
        return
      }
      if (!confirmPassword.trim()) {
        alert("Debe confirmar la contraseña")
        return
      }
      if (password !== confirmPassword) {
        alert("Las contraseñas no coinciden")
        return
      }

      // Llamada a la API de registro
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, hint: passwordHint }),
      })

      const data = await response.json()
      if (data.success) {
        alert("Usuario registrado exitosamente")
        setIsRegisterMode(false)
        setUsername("")
        setPassword("")
        setConfirmPassword("")
        setPasswordHint("")
      } else {
        alert(data.error || "Error al registrar usuario")
      }
    } else {
      // Llamada a la API de login
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()
      if (data.success) {
        setIsLoggedIn(true)
        localStorage.setItem("userId", data.user.id)
      } else {
        alert(data.error || "Usuario o contraseña incorrectos")
      }
    }
  }

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault()
    alert("Funcionalidad de recuperación de contraseña aún no implementada en API")
  }

  //  Pantalla de recuperar contraseña
  if (showForgotPassword) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <form onSubmit={handleForgotPassword} className="w-full max-w-md">
          <div className="rounded-xl border-2 border-orange-400 bg-card p-8 shadow-sm" style={{ boxShadow: '0 0 20px rgba(251, 117, 60, 0.94)' }}>
            <div className="mb-6 flex justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
                <Shield className="h-7 w-7 text-accent" />
              </div>
            </div>
            <h2 className="mb-6 text-center font-serif text-2xl font-semibold text-foreground">
              Recuperar Contraseña
            </h2>
            <div className="mb-6">
              <input
                type="text"
                placeholder="Ingresa tu usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>
            <button
              type="submit"
              className="mb-3 w-full rounded-lg bg-accent px-4 py-3 font-medium text-accent-foreground transition-colors hover:bg-accent/90"
            >
              Obtener Pista
            </button>
            <button
              type="button"
              onClick={() => setShowForgotPassword(false)}
              className="w-full rounded-lg border border-border bg-background px-4 py-3 font-medium text-foreground transition-colors hover:bg-muted"
            >
              Volver al Login
            </button>
          </div>
        </form>
      </div>
    )
  }

  //  Pantalla de login / registro Diseño y todo con sus colores 
  if (!isLoggedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4" style={{ background: 'linear-gradient(-45deg, #0a0a0a, #0a0a0a, #0a0a0a, #0a0a0a)', backgroundSize: '400% 400%' }}>
        <form onSubmit={handleLogin} className="w-full max-w-md">
          <div className="rounded-2xl border-2 border-black-500 bg-card p-8 shadow-lg" style={{ boxShadow: '0 0 25px rgba(81, 221, 226, 1)' }}>
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary shadow-md">
                <Lock className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <h2 className="mb-2 text-center text-3xl font-bold text-foreground">
              {isRegisterMode ? "Crear Cuenta" : "Bienvenido"}
            </h2>
            <p className="mb-8 text-center text-sm text-muted-foreground">
              {isRegisterMode ? "Registra tu cuenta para comenzar" : "Accede a tu gestor de contraseñas"}
            </p>

            {/* Usuario */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-semibold text-foreground">Usuario</label>
              <input
                type="text"
                placeholder="Ingresa tu usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg bg-muted px-4 py-3 text-foreground shadow-sm placeholder:text-muted-foreground focus:bg-background focus:shadow-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            {/* Contraseña */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-semibold text-foreground">Contraseña</label>
              <input
                type="password"
                placeholder={isRegisterMode ? "Crea una contraseña segura" : "Ingresa tu contraseña"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg bg-muted px-4 py-3 text-foreground shadow-sm placeholder:text-muted-foreground focus:bg-background focus:shadow-md focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={!username.trim()}
                required
              />
              {password && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full transition-all duration-300"
                      style={{
                        width: `${(getPasswordStrength(password).score / 9) * 100}%`,
                        backgroundColor: getPasswordStrength(password).color,
                      }}
                    />
                  </div>
                  <span
                    className="text-xs font-semibold"
                    style={{ color: getPasswordStrength(password).color }}
                  >
                    {getPasswordStrength(password).level}
                  </span>
                </div>
              )}
            </div>

            {/* Confirmar contraseña + pista */}
            {isRegisterMode && (
              <>
                <div className="mb-4">
                  <label className="mb-2 block text-sm font-semibold text-foreground">Confirmar Contraseña</label>
                  <input
                    type="password"
                    placeholder="Confirma tu contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-lg bg-muted px-4 py-3 text-foreground shadow-sm placeholder:text-muted-foreground focus:bg-background focus:shadow-md focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled={!username.trim() || !password.trim()}
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="mb-2 block text-sm font-semibold text-foreground">
                    Pista de contraseña <span className="text-muted-foreground">(opcional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Una pista para recordar tu contraseña"
                    value={passwordHint}
                    onChange={(e) => setPasswordHint(e.target.value)}
                    className="w-full rounded-lg bg-muted px-4 py-3 text-foreground shadow-sm placeholder:text-muted-foreground focus:bg-background focus:shadow-md focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled={!username.trim() || !password.trim()}
                  />
                </div>
              </>
            )}

            {/* Botones */}
            <button
              type="submit"
              className="mb-3 w-full rounded-lg bg-primary px-4 py-3 font-semibold text-primary-foreground shadow-md transition-all hover:shadow-lg hover:brightness-110"
            >
              {isRegisterMode ? "Registrarse" : "Iniciar Sesión"}
            </button>

            <button
              type="button"
              onClick={() => setIsRegisterMode(!isRegisterMode)}
              className="mb-3 w-full rounded-lg bg-muted px-4 py-3 font-semibold text-foreground shadow-sm transition-all hover:bg-muted/80 hover:shadow-md"
            >
              {isRegisterMode ? "Ya tengo cuenta" : "Crear cuenta"}
            </button>

            {!isRegisterMode && (
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="w-full text-center text-sm font-medium text-primary hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </button>
            )}
          </div>
        </form>
      </div>
    )
  }

  //  Pantalla principal (Dashboard)
  return (
    <ThemeProvider>
      <Dashboard
        username={username}
        savedPasswords={savedPasswords}
        onLogout={() => {
          setIsLoggedIn(false)
          setUsername("")
          setPassword("")
        }}
      />
    </ThemeProvider>
  )
}