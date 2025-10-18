import { useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
import Dashboard from './Dashboard'
import { ThemeProvider } from './ThemeContext'

function App() {
  
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isRegisterMode, setIsRegisterMode] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordHint, setPasswordHint] = useState('')
  // Array para almacenar usuarios registrados con su info
  const [registeredUsers, setRegisteredUsers] = useState<{username: string, password: string, hint: string}[]>([])
  
  // Estados para el gestor de contraseñas
  const [savedPasswords] = useState<{id: number, site: string, username: string, password: string, category: string}[]>([])

  // Validador de fortaleza de contraseña con score dinámico
  const getPasswordStrength = (password: string) => {
    let score = 0
    if (password.length >= 8) score += 2
    if (password.length >= 12) score += 1
    if (/[a-z]/.test(password)) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/\d/.test(password)) score += 1
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 2
    if (password.length >= 16) score += 1
    
    if (score <= 3) return { level: 'Débil', color: '#dc3545', score }
    if (score <= 6) return { level: 'Media', color: '#ffc107', score }
    return { level: 'Fuerte', color: '#28a745', score }
  }

  // Función para validar contraseña fuerte (compatibilidad)
  const isStrongPassword = (password: string) => {
    return getPasswordStrength(password).score > 6
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault() 
    
    // Validación de campos obligatorios
    if (!username.trim()) {
      alert('El campo Usuario es obligatorio')
      return
    }
    if (!password.trim()) {
      alert('El campo Contraseña es obligatorio')
      return
    }
    
    if (isRegisterMode) {
      // Verifica si el usuario ya existe
      const userAlreadyExists = registeredUsers.find(user => user.username === username)
      if (userAlreadyExists) {
        alert('Este usuario ya existe. Elige otro nombre de usuario.')
        return
      }
      
      if (!isStrongPassword(password)) {
        alert('La contraseña debe tener:\n- Mínimo 8 caracteres\n- Al menos 1 mayúscula\n- Al menos 1 minúscula\n- Al menos 1 número\n- Al menos 1 carácter especial (!@#$%^&*)')
        return
      }
      if (!confirmPassword.trim()) {
        alert('Debe confirmar la contraseña')
        return
      }
      if (password !== confirmPassword) {
        alert('Las contraseñas no coinciden')
        return
      }
      
      // Crea nuevo usuario y lo agrega al array de registrados
      const newUser = { username, password, hint: passwordHint }
      setRegisteredUsers([...registeredUsers, newUser])
      alert('Usuario registrado exitosamente')
      setIsRegisterMode(false)
      // Limpia todos los campos después del registro
      setUsername('')
      setPassword('')
      setConfirmPassword('')
      setPasswordHint('')
    } else {
      // Busca si el usuario existe en la lista de registrados
      const userExists = registeredUsers.find(user => user.username === username && user.password === password)
      if (userExists) {
        setIsLoggedIn(true)
      } else {
        // Solo permite login si el usuario está registrado
        alert('Usuario o contraseña incorrectos. Debes registrarte primero.')
      }
    }
  }



  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault()
    if (username) {
      // Busca el usuario en la lista de registrados
      const user = registeredUsers.find(user => user.username === username)
      if (user) {
        // Genera pista: primeras 2 letras + ... + última letra
        const hint = user.password.substring(0, 2) + '...' + user.password.slice(-1)
        alert(`Pista de contraseña: ${hint}`)
      } else {
        alert('Usuario no encontrado')
      }
    }
  }

  // Pantalla de recuperación de contraseña
  if (showForgotPassword) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <form onSubmit={handleForgotPassword} style={{ padding: '4rem', border: '2px solid #43cbf1ff', borderRadius: '8px' }}>
          <img src={reactLogo} className="logo react" alt="React logo" />
          <h2>Recuperar Contraseña</h2>
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="text"
              placeholder="Ingresa tu usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ width: '100%', padding: '0.5rem' }}
            />
          </div>
          <button type="submit" style={{ width: '100%', padding: '0.5rem', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '6px', marginBottom: '0.5rem' }}>
            Obtener Pista
          </button>
          <button type="button" onClick={() => setShowForgotPassword(false)} style={{ width: '100%', padding: '0.5rem', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '6px' }}>
            Volver al Login
          </button>
        </form>
      </div>
    )
  }


  
  // Pantalla de login/registro
  if (!isLoggedIn) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <form onSubmit={handleLogin} style={{ padding: '3rem', border: '2px solid #43cbf1ff', borderRadius: '8px', width: '320px', minHeight: '500px' }}>
          <img src={reactLogo} className="logo react" alt="React logo" />
          <h2>{isRegisterMode ? 'Registro' : 'Login'} de Gestor</h2>
          
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="text" 
              placeholder="Usuario *" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              style={{ width: '100%', padding: '0.5rem', borderColor: !username.trim() ? '#0acae3ff' : '#ccc' }}
              required
            />
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="password" 
              placeholder={isRegisterMode ? "Contraseña * (8+ chars, A-z, 0-9, !@#$)" : "Contraseña *"}
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              style={{ 
                width: '100%', 
                padding: '0.5rem', 
                borderColor: !password.trim() ? '#dc3545' : 
                  (password ? getPasswordStrength(password).color : '#ccc'),
                borderWidth: '2px'
              }}
              disabled={!username.trim()}
              required
            />
            <div style={{ height: '20px', marginTop: '5px' }}>
              {password && (
                <small style={{ color: getPasswordStrength(password).color, fontSize: '0.7rem', fontWeight: '600' }}>
                  Fortaleza: {getPasswordStrength(password).level} ({getPasswordStrength(password).score}/9)
                </small>
              )}
            </div>
          </div>

          {isRegisterMode && (
            <>
              <div style={{ marginBottom: '1rem' }}>
                <input
                  type="password"
                  placeholder="Confirmar Contraseña *"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderColor: !confirmPassword.trim() || (confirmPassword && password !== confirmPassword) ? '#dc3545' : '#ccc' }}
                  disabled={!username.trim() || !password.trim() || !isStrongPassword(password)}
                  required
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <input
                  type="text"
                  placeholder="Pista de contraseña (opcional)"
                  value={passwordHint}
                  onChange={(e) => setPasswordHint(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem' }}
                  disabled={!username.trim() || !password.trim() || !isStrongPassword(password) || !confirmPassword.trim()}
                />
              </div>
            </>
          )}
          
          <button type="submit" style={{ width: '100%', padding: '0.5rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '6px', marginBottom: '0.5rem' }}>
            {isRegisterMode ? 'Registrarse' : 'Iniciar Sesión'}
          </button>

          <button type="button" onClick={() => setIsRegisterMode(!isRegisterMode)} style={{ width: '100%', padding: '0.5rem', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '6px', marginBottom: '0.5rem' }}>
            {isRegisterMode ? 'Ya tengo cuenta' : 'Crear cuenta'}
          </button>

          {!isRegisterMode && (
            <button type="button" onClick={() => setShowForgotPassword(true)} style={{ width: '100%', padding: '0.3rem', backgroundColor: 'transparent', color: '#007bff', border: 'none', textDecoration: 'underline' }}>
              ¿Olvidaste tu contraseña?
            </button>
          )}
        </form>
      </div>
    )
  }

  // Si el usuario SÍ está logueado, muestra el panel de control
  return (
    <ThemeProvider>
      <Dashboard 
        username={username}
        savedPasswords={savedPasswords}
        onLogout={() => { setIsLoggedIn(false); setUsername(''); setPassword(''); }}
      />
    </ThemeProvider>
  )
}

export default App
