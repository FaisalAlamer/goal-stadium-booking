import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    try {
      var user = await login(email, password)
      if (user.role === 'owner') {
        navigate('/dashboard')
      } else {
        navigate('/')
      }
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="container" style={{ maxWidth: '420px', marginTop: '60px' }}>
      <div className="animate-in">
        <h2>Login</h2>

        {error && <p className="error-msg">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label>Email</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={function(e) { setEmail(e.target.value) }}
              placeholder="your@email.com"
              required
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label>Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={function(e) { setPassword(e.target.value) }}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className="btn-green" style={{ width: '100%', padding: '12px' }}>
            Login
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', color: '#6b7280', fontSize: '14px' }}>
          Don't have an account? <Link to="/register" style={{ fontWeight: 600 }}>Register here</Link>
        </p>
      </div>
    </div>
  )
}

 
