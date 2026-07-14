// AuthContext.jsx - Manages user login state across the whole app
// We use React Context so any component can check if user is logged in

import { createContext, useState, useEffect, useContext } from 'react'

// Create the context
const AuthContext = createContext()

// Custom hook - makes it easy to use auth in any component
export function useAuth() {
  return useContext(AuthContext)
}

// Provider component - wraps the whole app
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  // When app loads, check if we have a saved token
  useEffect(function() {
    if (token) {
      // Verify the token is still valid by getting user info
      fetch('/api/auth/me', {
        headers: { 'Authorization': 'Bearer ' + token }
      })
        .then(function(res) {
          if (res.ok) return res.json()
          throw new Error('bad token')
        })
        .then(function(data) {
          setUser(data)
          setLoading(false)
        })
        .catch(function() {
          // Token is invalid, clear it
          localStorage.removeItem('token')
          setToken(null)
          setUser(null)
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [])

  // Login function
  async function login(email, password) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, password: password })
    })
    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.message)
    }

    // Save token and user info
    localStorage.setItem('token', data.token)
    setToken(data.token)
    setUser(data.user)
    return data.user
  }

  // Register function
  async function register(name, email, password, role) {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name, email: email, password: password, role: role })
    })
    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.message)
    }

    localStorage.setItem('token', data.token)
    setToken(data.token)
    setUser(data.user)
    return data.user
  }

  // Logout function
  function logout() {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
