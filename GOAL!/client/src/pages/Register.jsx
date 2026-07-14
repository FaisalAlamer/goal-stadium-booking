import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState('user')
  const [error, setError] = useState('')
  const { register } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    try {
      var user = await register(name, email, password, role)
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
    <div className="container" style={{ maxWidth: '420px', marginTop: '40px' }}>
      <div className=" animate-in">
        <h2>Create Account</h2>

        {error && <p className="error-msg">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label>Full Name</label>
            <input type="text" className="form-input" value={name}
              onChange={function(e) { setName(e.target.value) }}
              placeholder="Enter your name" required />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label>Email</label>
            <input type="email" className="form-input" value={email}
              onChange={function(e) { setEmail(e.target.value) }}
              placeholder="your@email.com" required />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label>Password</label>
            <input type="password" className="form-input" value={password}
              onChange={function(e) { setPassword(e.target.value) }}
              placeholder="Create a password" required />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label>Confirm Password</label>
            <input type="password" className="form-input" value={confirmPassword}
              onChange={function(e) { setConfirmPassword(e.target.value) }}
              placeholder="Confirm your password" required />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label>I am a:</label>
            <div style={{ marginTop: '10px', display: 'flex', gap: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 500, fontSize: '14px', textTransform: 'none', color: '#1a1a2e' }}>
                <input type="radio" name="role" value="user"
                  checked={role === 'user'}
                  onChange={function() { setRole('user') }}
                  style={{ accentColor: '#1b6b2e' }} />
                Match Organizer
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 500, fontSize: '14px', textTransform: 'none', color: '#1a1a2e' }}>
                <input type="radio" name="role" value="owner"
                  checked={role === 'owner'}
                  onChange={function() { setRole('owner') }}
                  style={{ accentColor: '#1b6b2e' }} />
                Stadium Owner
              </label>
            </div>
          </div>

          <button type="submit" className="btn-green" style={{ width: '100%', padding: '12px' }}>
            Register
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', color: '#6b7280', fontSize: '14px' }}>
          Already have an account? <Link to="/login" style={{ fontWeight: 600 }}>Login here</Link>
        </p>
      </div>
    </div>
  )
}


