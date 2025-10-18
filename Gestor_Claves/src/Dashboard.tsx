"use client"

import React, { useState, useEffect } from "react"
import { useTheme } from "./ThemeContext"

interface Password {
  id: number
  site: string
  username: string
  password: string
  category: string
}

interface DashboardProps {
  username: string
  savedPasswords: Password[]
  onLogout: () => void
}

const Dashboard: React.FC<DashboardProps> = ({ username, savedPasswords: initialPasswords, onLogout }) => {
  const { isDarkMode, toggleTheme, getTheme } = useTheme()
  const theme = getTheme()

  const [savedPasswords, setSavedPasswords] = useState<Password[]>(initialPasswords || [])
  const [showAddForm, setShowAddForm] = useState(false)
  const [showReports, setShowReports] = useState(false)
  const [newSite, setNewSite] = useState("")
  const [newUsername, setNewUsername] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [newCategory, setNewCategory] = useState("Social")

  // 🔹 useEffect para cargar contraseñas desde la API
  useEffect(() => {
    const loadPasswords = async () => {
      const userId = localStorage.getItem("userId")
      if (!userId) return

      try {
        const response = await fetch(/api/passwords?userId=${userId})
        const data = await response.json()
        if (data.success) {
          setSavedPasswords(data.passwords)
        }
      } catch (err) {
        console.error("Error al cargar contraseñas:", err)
      }
    }
    loadPasswords()
  }, [])

  // 🔹 Validador de fortaleza
  const getPasswordStrength = (password: string) => {
    let score = 0
    if (password.length >= 8) score += 2
    if (password.length >= 12) score += 1
    if (/[a-z]/.test(password)) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/\d/.test(password)) score += 1
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 2
    if (password.length >= 16) score += 1

    if (score <= 3) return { level: "Débil", color: "#dc3545", score }
    if (score <= 6) return { level: "Media", color: "#ffc107", score }
    return { level: "Fuerte", color: "#28a745", score }
  }

  // 🔹 Generador
  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"
    let password = ""
    for (let i = 0; i < 16; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setNewPassword(password)
  }

  // 🔹 Calcular score general
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

  // 🔹 Guardar contraseña en API
  const addPassword = async () => {
    const userId = localStorage.getItem("userId")
    if (!userId) {
      alert("No se encontró usuario. Inicia sesión de nuevo.")
      return
    }

    if (newSite && newUsername && newPassword) {
      try {
        const response = await fetch("/api/passwords", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            site: newSite,
            username: newUsername,
            password: newPassword,
            category: newCategory,
          }),
        })

        const data = await response.json()
        if (data.success) {
          setSavedPasswords([...savedPasswords, data.password])
          setNewSite("")
          setNewUsername("")
          setNewPassword("")
          setNewCategory("Social")
          setShowAddForm(false)
        } else {
          alert(data.error || "Error al guardar contraseña")
        }
      } catch (err) {
        console.error("Error en addPassword:", err)
      }
    }
  }

  // 🔹 Eliminar contraseña en API
  const deletePassword = async (id: number) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta contraseña?")) {
      try {
        await fetch(/api/passwords/${id}, { method: "DELETE" })
        setSavedPasswords(savedPasswords.filter((item) => item.id !== id))
      } catch (err) {
        console.error("Error al eliminar contraseña:", err)
      }
    }
  }

  


  return (
    <div style={{ 
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: theme.backgroundColor, 
      margin: 0, 
      padding: 0, 
      overflow: 'hidden', 
      display: 'flex', 
      flexDirection: 'column',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header/Banner */}
      <div style={{ 
        backgroundColor: theme.headerBackground, 
        color: 'white', 
        padding: '1.2rem 2rem', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        boxShadow: '0 4px 6px rgba(251, 3, 3, 0.1)', 
        flexShrink: 0,
        borderBottom: `3px solid ${isDarkMode ? '#555' : '#0b0b0bff'}`
      }}>
        <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '600' }}>Gestor de Claves - {username}</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button 
            onClick={toggleTheme}
            style={{ 
              padding: '0.6rem', 
              backgroundColor: 'transparent', 
              color: 'white', 
              border: '2px solid white', 
              borderRadius: '6px', 
              cursor: 'pointer',
              fontSize: '1.2rem'
            }}
            title={isDarkMode ? 'Modo claro' : 'Modo oscuro'}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
          <button 
            onClick={onLogout} 
            style={{ 
              padding: '0.6rem 1.2rem', 
              backgroundColor: '#dc3545', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px', 
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '500',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#c82333'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#dc3545'}
          >
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Panel de Control */}
      <div style={{ 
        flex: 1, 
        padding: '2rem', 
        overflow: 'auto',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%'
      }}>
        {/* Estadísticas principales */}
        <div style={{ marginBottom: '3rem' }}>
          <h2 style={{ color: theme.textColor, marginBottom: '1.5rem', fontSize: '2rem', fontWeight: '600' }}>Panel de Control y Gestion de Contraseñas</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            <div style={{ backgroundColor: theme.cardBackground, padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(6, 211, 252, 1)', textAlign: 'center', border: `1px solid ${theme.borderColor}` }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔑</div>
              <h3 style={{ margin: '0 0 0.8rem 0', color: '#0a0a0aff', fontSize: '1.1rem', fontWeight: '600' }}>Total Contraseñas</h3>
              <p style={{ fontSize: '2.5rem', margin: 0, fontWeight: '700', color: theme.textColor }}>{savedPasswords.length}</p>
            </div>
            
            <div style={{ backgroundColor: theme.cardBackground, padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(6, 211, 252, 1)', textAlign: 'center', border: `1px solid ${theme.borderColor}` }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📁</div>
              <h3 style={{ margin: '0 0 0.8rem 0', color: '#0f0f0fff', fontSize: '1.1rem', fontWeight: '600' }}>Categorías</h3>
              <p style={{ fontSize: '2.5rem', margin: 0, fontWeight: '700', color: theme.textColor }}>{new Set(savedPasswords.map(p => p.category)).size}</p>
            </div>
            
            <div style={{ backgroundColor: theme.cardBackground, padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(6, 211, 252, 1)', textAlign: 'center', border: `1px solid ${theme.borderColor}` }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👤</div>
              <h3 style={{ margin: '0 0 0.8rem 0', color: '#0b0b0bff', fontSize: '1.1rem', fontWeight: '600' }}>Usuario Activo</h3>
              <p style={{ fontSize: '1.4rem', margin: 0, fontWeight: '600', color: theme.textColor }}>{username}</p>
            </div>
            
            <div style={{ backgroundColor: theme.cardBackground, padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(6, 211, 252, 1)', textAlign: 'center', border: `1px solid ${theme.borderColor}` }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
              <h3 style={{ margin: '0 0 0.8rem 0', color: '#070707ff', fontSize: '1.1rem', fontWeight: '600' }}>Score de Seguridad</h3>
              <p style={{ fontSize: '2.5rem', margin: 0, fontWeight: '700', color: getSecurityScore() >= 7 ? '#28a745' : getSecurityScore() >= 4 ? '#ffc107' : '#dc3545' }}>{getSecurityScore()}/10</p>
            </div>
          </div>
        </div>

        {/* Acciones rápidas */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ color: theme.textColor, marginBottom: '1rem' }}>Acciones Rápidas</h3>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button 
              onClick={() => setShowAddForm(true)}
              style={{ padding: '0.75rem 1.5rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              ➕ Agregar Contraseña
            </button>
            <button 
              onClick={() => setShowReports(true)}
              style={{ padding: '0.75rem 1.5rem', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              📊 Ver Reportes
            </button>
            <button style={{ padding: '0.75rem 1.5rem', backgroundColor: '#5d5f60ff', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              ⚙️ Configuración
            </button>
          </div>
        </div>

        {/* Formulario agregar contraseña */}
        {showAddForm && (
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ backgroundColor: theme.cardBackground, padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(252, 119, 3, 0.95)', border: `1px solid ${theme.borderColor}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, color: theme.textColor, fontSize: '1.3rem' }}>Nueva Contraseña</h3>
                <button 
                  onClick={() => setShowAddForm(false)}
                  style={{ backgroundColor: '#f70505ff', color: 'white', border: 'none', borderRadius: '50%', width: '50px', height: '40px', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: theme.inputText }}>Sitio Web/App:</label>
                  <input
                    type="text"
                    placeholder="Ej: Facebook, Gmail"
                    value={newSite}
                    onChange={(e) => setNewSite(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', border: `2px solid ${theme.borderColor}`, borderRadius: '6px', fontSize: '0.9rem', backgroundColor: theme.inputBackground, color: theme.inputText }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: theme.inputText }}>Usuario/Email:</label>
                  <input
                    type="text"
                    placeholder="Tu usuario o email"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', border: `2px solid ${theme.borderColor}`, borderRadius: '6px', fontSize: '0.9rem', backgroundColor: theme.inputBackground, color: theme.inputText }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: theme.inputText }}>Contraseña:</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="password"
                      placeholder="Tu contraseña"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      style={{ flex: 1, padding: '0.75rem', border: `2px solid ${newPassword ? getPasswordStrength(newPassword).color : theme.borderColor}`, borderRadius: '6px', fontSize: '0.9rem', backgroundColor: theme.inputBackground, color: theme.inputText }}
                    />
                  </div>
                  {newPassword && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
                      <span style={{ color: getPasswordStrength(newPassword).color, fontWeight: '600' }}>
                        Fortaleza: {getPasswordStrength(newPassword).level}
                      </span>
                    </div>
                  )}
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: theme.inputText }}>Categoría:</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', border: `2px solid ${theme.borderColor}`, borderRadius: '6px', fontSize: '0.9rem', backgroundColor: theme.inputBackground, color: theme.inputText }}
                  >
                    <option value="Social">Social</option>
                    <option value="Trabajo">Trabajo</option>
                    <option value="Bancario">Bancario</option>
                    <option value="Entretenimiento">Entretenimiento</option>
                    <option value="Otros">Otros</option>
                  </select>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  onClick={addPassword}
                  style={{ padding: '0.75rem 2rem', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                >
                  Guardar Contraseña
                </button>
                <button 
                  onClick={() => setShowAddForm(false)}
                  style={{ padding: '0.75rem 2rem', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Vista de Reportes */}
        {showReports && (
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ backgroundColor: theme.cardBackground, padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(249, 241, 4, 0.95)', border: `1px solid ${theme.borderColor}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3 style={{ margin: 0, color: theme.textColor, fontSize: '1.8rem' }}> Reportes de Seguridad</h3>
                <button 
                  onClick={() => setShowReports(false)}
                  style={{ backgroundColor: '#f64b08ff', color: 'white', border: 'none', borderRadius: '50%', width: '50px', height: '40px', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                {/* Distribución por Categorías */}
                <div>
                  <h4 style={{ color: theme.textColor, marginBottom: '1rem' }}>Distribución por Categorías</h4>
                  <div style={{ backgroundColor: theme.backgroundColor, padding: '1rem', borderRadius: '8px', border: `1px solid ${theme.borderColor}` }}>
                    {['Social', 'Trabajo', 'Bancario', 'Entretenimiento', 'Otros'].map(category => {
                      const count = savedPasswords.filter(p => p.category === category).length
                      const percentage = savedPasswords.length > 0 ? Math.round((count / savedPasswords.length) * 100) : 0
                      return (
                        <div key={category} style={{ marginBottom: '0.8rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                            <span style={{ color: theme.textColor, fontSize: '0.9rem' }}>{category}</span>
                            <span style={{ color: theme.textColor, fontSize: '0.9rem' }}>{count} ({percentage}%)</span>
                          </div>
                          <div style={{ backgroundColor: theme.borderColor, height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ backgroundColor: '#007bff', height: '100%', width: `${percentage}%`, transition: 'width 0.3s' }}></div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Análisis de Fortaleza */}
                <div>
                  <h4 style={{ color: theme.textColor, marginBottom: '1rem' }}>Análisis de Fortaleza</h4>
                  <div style={{ backgroundColor: theme.backgroundColor, padding: '1rem', borderRadius: '8px', border: `1px solid ${theme.borderColor}` }}>
                    {(() => {
                      const weak = savedPasswords.filter(p => getPasswordStrength(p.password).score <= 3).length
                      const medium = savedPasswords.filter(p => getPasswordStrength(p.password).score > 3 && getPasswordStrength(p.password).score <= 6).length
                      const strong = savedPasswords.filter(p => getPasswordStrength(p.password).score > 6).length
                      const total = savedPasswords.length
                      
                      return [
                        { label: 'Contraseñas Débiles', count: weak, color: '#dc3545' },
                        { label: 'Contraseñas Medias', count: medium, color: '#ffc107' },
                        { label: 'Contraseñas Fuertes', count: strong, color: '#28a745' }
                      ].map(item => {
                        const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0
                        return (
                          <div key={item.label} style={{ marginBottom: '0.8rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                              <span style={{ color: theme.textColor, fontSize: '0.9rem' }}>{item.label}</span>
                              <span style={{ color: item.color, fontSize: '0.9rem', fontWeight: '600' }}>{item.count} ({percentage}%)</span>
                            </div>
                            <div style={{ backgroundColor: theme.borderColor, height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ backgroundColor: item.color, height: '100%', width: `${percentage}%`, transition: 'width 0.3s' }}></div>
                            </div>
                          </div>
                        )
                      })
                    })()}
                  </div>
                </div>

                {/* Recomendaciones */}
                <div>
                  <h4 style={{ color: theme.textColor, marginBottom: '1rem' }}>Recomendaciones</h4>
                  <div style={{ backgroundColor: theme.backgroundColor, padding: '1rem', borderRadius: '8px', border: `1px solid ${theme.borderColor}` }}>
                    {(() => {
                      const recommendations = []
                      const weakPasswords = savedPasswords.filter(p => getPasswordStrength(p.password).score <= 3).length
                      const duplicates = new Set(savedPasswords.map(p => p.password)).size !== savedPasswords.length
                      
                      if (weakPasswords > 0) {
                        recommendations.push(`⚠️ Tienes ${weakPasswords} contraseña(s) débil(es). Considéralas cambiar.`)
                      }
                      if (duplicates) {
                        recommendations.push('⚠️ Tienes contraseñas duplicadas. Usa contraseñas únicas para cada sitio.')
                      }
                      if (savedPasswords.length < 5) {
                        recommendations.push('📝 Agrega más contraseñas para mejorar tu gestión de seguridad.')
                      }
                      if (recommendations.length === 0) {
                        recommendations.push('✅ ¡Excelente! Tus contraseñas están bien gestionadas.')
                      }
                      
                      return recommendations.map((rec, index) => (
                        <div key={index} style={{ 
                          padding: '0.8rem', 
                          marginBottom: '0.5rem', 
                          backgroundColor: rec.includes('✅') ? 'rgba(40, 167, 69, 0.1)' : 'rgba(255, 193, 7, 0.1)',
                          border: `1px solid ${rec.includes('✅') ? '#28a745' : '#ffc107'}`,
                          borderRadius: '6px',
                          fontSize: '0.9rem',
                          color: theme.textColor
                        }}>
                          {rec}
                        </div>
                      ))
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lista de contraseñas guardadas */}
        <div>
          <h3 style={{ color: '#333', marginBottom: '1rem' }}>Mis Contraseñas ({savedPasswords.length})</h3>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(253, 0, 198, 0.99)', overflow: 'hidden', border: '1px solid #e9ecef' }}>
            {savedPasswords.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📝</div>
                <h4 style={{ color: '#495057', marginBottom: '0.5rem' }}>No hay contraseñas guardadas aún</h4>
                <p style={{ fontSize: '0.9rem', margin: 0 }}>Haz clic en "Agregar Contraseña" para comenzar</p>
              </div>
            ) : (
              <div>
                <div style={{ padding: '1.2rem', backgroundColor: '#b3acadff', fontWeight: '700', color: '#040404ff' }}>
                  Todas las Contraseñas
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem', padding: '1rem' }}>
                  {savedPasswords.map((item) => (
                    <div key={item.id} style={{ 
                      backgroundColor: '#f8fafaff', 
                      padding: '1.5rem', 
                      borderRadius: '8px', 
                      border: '3px solid #d3f707ff',
                      position: 'relative'
                    }}>
                      <button 
                        onClick={() => deletePassword(item.id)}
                        style={{ 
                          position: 'absolute', 
                          top: '0.5rem', 
                          right: '0.5rem', 
                          backgroundColor: '#dc3545', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '50%', 
                          width: '28px', 
                          height: '28px', 
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="Eliminar contraseña"
                      >
                        ✕
                      </button>
                      
                      <h4 style={{ margin: '0 0 1rem 0', color: '#007bff', fontSize: '1.1rem' }}>{item.site}</h4>
                      
                      <div style={{ marginBottom: '0.8rem' }}>
                        <strong style={{ color: '#495057', fontSize: '0.9rem' }}>Usuario:</strong>
                        <p style={{ margin: '0.2rem 0 0 0', color: '#6c757d' }}>{item.username}</p>
                      </div>
                      
                      <div style={{ marginBottom: '0.8rem' }}>
                        <strong style={{ color: '#495057', fontSize: '0.9rem' }}>Contraseña:</strong>
                        <p style={{ margin: '0.2rem 0 0 0', color: '#6c757d', fontFamily: 'monospace' }}>••••••••</p>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ 
                          fontSize: '0.8rem', 
                          backgroundColor: '#007bff', 
                          color: 'white',
                          padding: '0.3rem 0.8rem', 
                          borderRadius: '15px',
                          fontWeight: '500'
                        }}>
                          {item.category}
                        </span>
                        <button 
                          onClick={() => navigator.clipboard.writeText(item.password)}
                          style={{
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '0.4rem 0.8rem',
                            cursor: 'pointer',
                            fontSize: '0.8rem'
                          }}
                          title="Copiar contraseña"
                        >
                          📋 Copiar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
