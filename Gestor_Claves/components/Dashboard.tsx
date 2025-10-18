"use client"
// TODA LA PRTDE DEL PANEL DE CONTROL DONDE TIENEN SUS FUNCIONALIDADES Y DISEÑO 
import type React from "react"
import { useState } from "react"
import { useTheme } from "./ThemeContext"
import {
  Lock,Plus,
  BarChart3,
  Settings,
  LogOut,
  Sun,
  Moon,
  X,
  Key,
  Grid3X3,
  User,
  Shield,
  Copy,
  Trash2,
  Search,
  Eye,
  EyeOff,
} from "lucide-react"

interface DashboardProps {
  username: string
  savedPasswords: { id: number; site: string; username: string; password: string; category: string }[]
  onLogout: () => void
}

const Dashboard: React.FC<DashboardProps> = ({ username, savedPasswords: initialPasswords, onLogout }) => {
  const { isDarkMode, toggleTheme } = useTheme()

  const [savedPasswords, setSavedPasswords] = useState(initialPasswords)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showReports, setShowReports] = useState(false)

  const [showSettings, setShowSettings] = useState(false)
  const [newSite, setNewSite] = useState("")
  const [newUsername, setNewUsername] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [newCategory, setNewCategory] = useState("Social")
  const [searchQuery, setSearchQuery] = useState("")
  const [visiblePasswords, setVisiblePasswords] = useState<Set<number>>(new Set())
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null)

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

  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"
    let password = ""
    for (let i = 0; i < 16; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setNewPassword(password)
  }

  const getSecurityScore = () => {
    if (savedPasswords.length === 0) return 0

    let totalScore = 0
    const duplicates = new Set(savedPasswords.map((p) => p.password)).size !== savedPasswords.length

    savedPasswords.forEach((pwd) => {
      const strength = getPasswordStrength(pwd.password)
      totalScore += strength.score
    })

    const avgScore = totalScore / savedPasswords.length
    const finalScore = duplicates ? Math.max(1, avgScore - 2) : avgScore

    return Math.min(10, Math.max(1, Math.round(finalScore)))
  }

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  const addPassword = () => {
    if (newSite && newUsername && newPassword) {
      const newEntry = {
        id: Date.now(),
        site: newSite,
        username: newUsername,
        password: newPassword,
        category: newCategory,

      }
      setSavedPasswords([...savedPasswords, newEntry])
      setNewSite("")
      setNewUsername("")
      setNewPassword("")
      setNewCategory("Social")
      setShowAddForm(false)
      showNotification(`Contraseña para ${newSite} creada exitosamente`, 'success')
    }
  }

  const deletePassword = (id: number) => {
    const password = savedPasswords.find(p => p.id === id)
    if (confirm("¿Estás seguro de que quieres eliminar esta contraseña?")) {
      setSavedPasswords(savedPasswords.filter((item) => item.id !== id))
      showNotification(`Contraseña de ${password?.site} eliminada`, 'info')
    }
  }

  const togglePasswordVisibility = (id: number) => {
    const newVisible = new Set(visiblePasswords)
    if (newVisible.has(id)) {
      newVisible.delete(id)
    } else {
      newVisible.add(id)
    }
    setVisiblePasswords(newVisible)
  }

  const filteredPasswords = savedPasswords.filter(
    (pwd) =>
      pwd.site.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pwd.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pwd.category.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* SISTEMA DE NOTIFICACIONES MODALES - Esquina superior derecha */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
          <div className={`rounded-lg border-2 p-4 shadow-lg min-w-[300px] ${
            notification.type === 'success' ? 'bg-green-50 border-green-500 text-green-800' :
            notification.type === 'error' ? 'bg-red-50 border-red-500 text-red-800' :
            'bg-blue-50 border-blue-500 text-blue-800'
          }`}>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                {notification.type === 'success' && <Shield className="h-5 w-5 text-green-600" />}
                {notification.type === 'error' && <X className="h-5 w-5 text-red-600" />}
                {notification.type === 'info' && <Key className="h-5 w-5 text-blue-600" />}
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{notification.message}</p>
              </div>
              <button 
                onClick={() => setNotification(null)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background">
              <Lock className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">Gestor de Contraseñas</h1>
              <p className="text-xs text-muted-foreground">{username}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-foreground transition-colors hover:bg-accent"
              title={isDarkMode ? "Modo claro" : "Modo oscuro"}
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              <LogOut className="h-5 w-7" />
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">
        {/* Cuadrícula de estadísticas */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border-2 border-border bg-background p-4 transition-all duration-300 hover:border-red-400 cursor-pointer" onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 0 15px rgba(4, 4, 4, 0.93)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}>
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-25 w-15 items-center justify-center rounded-lg bg-red-500/40">
                <Key className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Contraseñas</p>
                <p className="text-2xl font-semibold text-foreground">{savedPasswords.length}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border-2 border-border bg-background p-4 transition-all duration-300 hover:border-red-400 cursor-pointer" onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 0 15px rgba(4, 4, 4, 0.93)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}>
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-25 w-15 items-center justify-center rounded-lg bg-red-500/40">
                <Grid3X3 className="h-5 w-5 text-black-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Categorías</p>
                <p className="text-2xl font-semibold text-foreground">
                  {new Set(savedPasswords.map((p) => p.category)).size}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border-2 border-border bg-background p-4 transition-all duration-300 hover:border-red-400 cursor-pointer" onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 0 15px rgba(4, 4, 4, 0.93)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}>
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-25 w-15 items-center justify-center rounded-lg bg-red-500/40">
                <User className="h-5 w-5 text-black-3" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Usuario</p>
                <p className="truncate text-lg font-semibold text-foreground">{username}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border-2 border-border bg-background p-4 transition-all duration-300 hover:border-red-400 cursor-pointer" onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 0 15px rgba(4, 4, 4, 0.93)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}>
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-25 w-15 items-center justify-center rounded-lg bg-red-500/40">
                <Shield className="h-5 w-5 text-black-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Score Seguridad</p>
                <p
                  className="text-3xl font-semibold"
                  style={{
                    color:
                      getSecurityScore() >= 7
                        ? "rgb(34 197 94)"
                        : getSecurityScore() >= 4
                          ? "rgb(234 179 8)"
                          : "rgb(239 68 68)",
                  }}
                >
                  {getSecurityScore()}/10
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Barra de acción */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 rounded-lg bg-primary px-10 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Nueva Contraseña
          </button>
          <button
            onClick={() => setShowReports(true)}
            className="flex items-center gap-2 rounded-lg border border-border bg-card px-10 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            <BarChart3 className="h-4 w-4" />
            Reportes
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-2 rounded-lg border border-border bg-card px-10 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            <Settings className="h-4 w-4" />
            Configuración
          </button>

          {/* Barra de busqueda */}
          <div className="ml-auto flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar contraseñas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-48 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
        </div>

        {/* Formulario para agregar contraseña */}
        {showAddForm && (
          <div className="mb-6 rounded-lg border border-border bg-card p-6 shadow-lg">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Nueva Contraseña</h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-6 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Sitio Web/App</label>
                <input
                  type="text"
                  placeholder="Ej: Facebook, Gmail"
                  value={newSite}
                  onChange={(e) => setNewSite(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Usuario/Email</label>
                <input
                  type="text"
                  placeholder="Tu usuario o email"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Contraseña</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Tu contraseña"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <button
                    onClick={generatePassword}
                    className="rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent"
                  >
                    Generar
                  </button>
                </div>
                {newPassword && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full transition-all duration-300"
                        style={{
                          width: `${(getPasswordStrength(newPassword).score / 9) * 100}%`,
                          backgroundColor: getPasswordStrength(newPassword).color,
                        }}
                      />
                    </div>
                    <span className="text-xs font-medium" style={{ color: getPasswordStrength(newPassword).color }}>
                      {getPasswordStrength(newPassword).level}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Categoría</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="Social">Social</option>
                  <option value="Trabajo">Trabajo</option>
                  <option value="Bancario">Bancario</option>
                  <option value="Entretenimiento">Entretenimiento</option>
                  <option value="Otros">Otros</option>
                </select>
              </div>


            </div>

            <div className="flex gap-2">
              <button
                onClick={addPassword}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Guardar
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Sección de configuración */}
        {showSettings && (
          <div className="mb-6 rounded-lg border border-border bg-card p-6 shadow-lg">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground"> Configuración</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {/* DISEÑO DE LAS CARD DE CONFIGURACIONES */}
              <div className="rounded-lg border-2 border-border bg-background p-4 transition-all duration-300 hover:border-red-400 cursor-pointer" onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 0, 0, 0.93)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}>
                <h4 className="mb-4 text-sm font-medium text-foreground"> Apariencia</h4>
                <button 
                  onClick={toggleTheme}
                  className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    isDarkMode 
                      ? 'bg-yellow-500 text-black hover:bg-yellow-400' 
                      : 'bg-slate-800 text-white hover:bg-slate-700'
                  }`}
                >
                  {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  {isDarkMode ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
                </button>
              </div>

              {/* Seguridad */}
              <div className="rounded-lg border-2 border-border bg-background p-4 transition-all duration-300 hover:border-red-400 cursor-pointer" onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 0, 0, 0.93)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}>
                <h4 className="mb-4 text-sm font-medium text-foreground"> Seguridad</h4>
                <button 
                  onClick={() => {
                    if (confirm('¿Estás seguro de que quieres eliminar TODAS las contraseñas? Esta acción no se puede deshacer.')) {
                      setSavedPasswords([])
                      alert('Todas las contraseñas han sido eliminadas.')
                    }
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                  Eliminar Todas
                </button>
                <p className="mt-2 text-xs text-muted-foreground">Esta acción eliminará permanentemente todas tus contraseñas.</p>
              </div>

              {/* Información del sistema */}
              <div className="rounded-lg border-2 border-border bg-background p-4 transition-all duration-300 hover:border-red-400 cursor-pointer" onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 0, 0, 0.93)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}>
                <h4 className="mb-4 text-sm font-medium text-foreground">Información</h4>
                <div className="space-y-2 text-xs">
                  <p className="text-foreground"><strong>Usuario:</strong> {username}</p>
                  <p className="text-foreground"><strong>Total Contraseñas:</strong> {savedPasswords.length}</p>
                  <p className="text-foreground"><strong>Score de Seguridad:</strong> {getSecurityScore()}/10</p>
                  <p className="text-foreground"><strong>Tema:</strong> {isDarkMode ? 'Oscuro' : 'Claro'}</p>
                </div>
                <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-3">
                  <p className="text-center text-xs text-foreground">
                    💡 <strong>Gestor de Claves v1.0</strong><br/>
                    Mantén tus contraseñas seguras
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sección de Reportes */}
        {showReports && (
          <div className="mb-6 rounded-lg border border-border bg-card p-6 shadow-lg">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Reportes de Seguridad</h3>
              <button
                onClick={() => setShowReports(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {/* Distribución de categorías */}
              <div className="rounded-lg border-2 border-border bg-background p-4 transition-all duration-300 hover:border-red-400 cursor-pointer" onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 0 15px rgba(4, 4, 4, 0.93)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}>
                <h4 className="mb-4 text-sm font-medium text-foreground">Distribución por Categorías</h4>
                <div className="space-y-3">
                  {["Social", "Trabajo", "Bancario", "Entretenimiento", "Otros"].map((category) => {
                    const count = savedPasswords.filter((p) => p.category === category).length
                    const percentage = savedPasswords.length > 0 ? Math.round((count / savedPasswords.length) * 100) : 0
                    return (
                      <div key={category}>
                        <div className="mb-1 flex justify-between text-xs">
                          <span className="text-foreground">{category}</span>
                          <span className="text-muted-foreground">
                            {count} ({percentage}%)
                          </span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Análisis de Fortaleza */}
              <div className="rounded-lg border-2 border-border bg-background p-4 transition-all duration-300 hover:border-red-400 cursor-pointer" onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 0, 0, 0.93)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}>
                <h4 className="mb-4 text-sm font-medium text-foreground">Análisis de Fortaleza</h4>
                <div className="space-y-3">
                  {(() => {
                    const weak = savedPasswords.filter((p) => getPasswordStrength(p.password).score <= 3).length
                    const medium = savedPasswords.filter(
                      (p) => getPasswordStrength(p.password).score > 3 && getPasswordStrength(p.password).score <= 6,
                    ).length
                    const strong = savedPasswords.filter((p) => getPasswordStrength(p.password).score > 6).length
                    const total = savedPasswords.length

                    return [
                      { label: "Débiles", count: weak, color: "rgb(239 68 68)" },
                      { label: "Medias", count: medium, color: "rgb(234 179 8)" },
                      { label: "Fuertes", count: strong, color: "rgb(34 197 94)" },
                    ].map((item) => {
                      const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0
                      return (
                        <div key={item.label}>
                          <div className="mb-1 flex justify-between text-xs">
                            <span className="text-foreground">{item.label}</span>
                            <span className="font-medium" style={{ color: item.color }}>
                              {item.count} ({percentage}%)
                            </span>
                          </div>
                          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full transition-all duration-300"
                              style={{ width: `${percentage}%`, backgroundColor: item.color }}
                            />
                          </div>
                        </div>
                      )
                    })
                  })()}
                </div>
              </div>

              {/* Recomendaciones */}
              <div className="rounded-lg border-2 border-border bg-background p-4 transition-all duration-300 hover:border-red-400 cursor-pointer" onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 0, 0, 0.93)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}>
                <h4 className="mb-4 text-sm font-medium text-foreground">Recomendaciones</h4>
                <div className="space-y-2">
                  {(() => {
                    const recommendations = []
                    const weakPasswords = savedPasswords.filter(
                      (p) => getPasswordStrength(p.password).score <= 3,
                    ).length
                    const duplicates = new Set(savedPasswords.map((p) => p.password)).size !== savedPasswords.length

                    if (weakPasswords > 0) {
                      recommendations.push({
                        text: `Tienes ${weakPasswords} contraseña(s) débil(es)`,
                        type: "warning",
                      })
                    }
                    if (duplicates) {
                      recommendations.push({ text: "Contraseñas duplicadas detectadas", type: "warning" })
                    }
                    if (savedPasswords.length < 5) {
                      recommendations.push({ text: "Agrega más contraseñas", type: "info" })
                    }
                    if (recommendations.length === 0) {
                      recommendations.push({ text: "Excelente gestión de seguridad", type: "success" })
                    }

                    return recommendations.map((rec, index) => (
                      <div
                        key={index}
                        className="rounded-lg border p-3 text-xs"
                        style={{
                          borderColor:
                            rec.type === "success"
                              ? "rgb(34 197 94)"
                              : rec.type === "warning"
                                ? "rgb(234 179 8)"
                                : "rgb(59 130 246)",
                          backgroundColor:
                            rec.type === "success"
                              ? "rgba(34, 197, 94, 0.1)"
                              : rec.type === "warning"
                                ? "rgba(234, 179, 8, 0.1)"
                                : "rgba(241, 88, 0, 0.1)",
                        }}
                      >
                        <p className="text-foreground">{rec.text}</p>
                      </div>
                    ))
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Listas de contraseñas */}
        <div>
          <h3 className="mb-4 text-sm font-medium text-muted-foreground">
            {searchQuery
              ? `Resultados (${filteredPasswords.length})`
              : `Todas las contraseñas (${savedPasswords.length})`}
          </h3>
          {filteredPasswords.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card py-16 shadow-sm">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-lg border border-border bg-background">
                <Lock className="h-8 w-8 text-muted-foreground" />
              </div>
              <h4 className="mb-2 font-medium text-foreground">
                {searchQuery ? "No se encontraron contraseñas" : "No hay contraseñas guardadas"}
              </h4>
              <p className="text-sm text-muted-foreground">
                {searchQuery ? "Intenta con otro término de búsqueda" : 'Haz clic en "Nueva Contraseña" para comenzar'}
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredPasswords.map((item) => (
                <div
                  key={item.id}
                  className="group relative rounded-lg border-2 border-border bg-card p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-red-400 cursor-pointer"
                  onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 0, 0, 0.93)'}
                  onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                >
                  <button
                    onClick={() => deletePassword(item.id)}
                    className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground opacity-0 transition-all hover:bg-destructive hover:text-destructive-foreground group-hover:opacity-100"
                    title="Eliminar"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>

                  <div className="mb-3 pr-8">
                    <h4 className="mb-1 font-semibold text-foreground">{item.site}</h4>
                    <span className="inline-block rounded-md border border-border bg-background px-2 py-0.5 text-xs text-muted-foreground">
                      {item.category}
                    </span>
                  </div>

                  <div className="mb-3 space-y-2">
                    <div>
                      <p className="mb-1 text-xs text-muted-foreground">Usuario</p>
                      <p className="text-sm text-foreground">{item.username}</p>
                    </div>

                    <div>
                      <p className="mb-1 text-xs text-muted-foreground">Contraseña</p>
                      <div className="flex items-center gap-2">
                        <p className="flex-1 font-mono text-sm text-foreground">
                          {visiblePasswords.has(item.id) ? item.password : "••••••••••••"}
                        </p>
                        <button
                          onClick={() => togglePasswordVisibility(item.id)}
                          className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                          title={visiblePasswords.has(item.id) ? "Ocultar" : "Mostrar"}
                        >
                          {visiblePasswords.has(item.id) ? (
                            <EyeOff className="h-3.5 w-3.5" />
                          ) : (
                            <Eye className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(item.password)
                      showNotification(`Contraseña de ${item.site} copiada al portapapeles`, 'success')
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent"
                    title="Copiar contraseña"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copiar contraseña
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>


    </div>
  )
}

export default Dashboard
