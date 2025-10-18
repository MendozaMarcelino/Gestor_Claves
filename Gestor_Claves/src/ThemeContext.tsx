// Proporciones del tema de claro y oscuro que da la funcionalidad 
// para cambiar entre modos en toda la aplicación

import React, { createContext, useContext, useState } from 'react'

interface ThemeContextType {
  isDarkMode: boolean
  toggleTheme: () => void
  getTheme: () => any
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: React.ReactNode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false)

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  const getTheme = () => ({
    backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
    cardBackground: isDarkMode ? '#2d2d2d' : 'white',
    textColor: isDarkMode ? '#ffffff' : '#2c3e50',
    headerBackground: isDarkMode ? '#333333' : '#4d4e4eff',
    borderColor: isDarkMode ? '#404040' : '#e9ecef',
    inputBackground: isDarkMode ? '#404040' : 'white',
    inputText: isDarkMode ? '#ffffff' : '#495057'
  })

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, getTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
