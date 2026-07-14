import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <div className="navbar">
      <Link to="/" className="navbar-brand">
        <img src="/logo.png" alt="GOAL!" className="navbar-logo" />
      </Link>

      

      <div className="navbar-links">
        <Link to="/">Home</Link>
        {!user && (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}

        {user && user.role === 'owner' && (
          <>
            <Link to="/dashboard">My Stadiums</Link>
            <Link to="/add-stadium">Add Stadium</Link>
            <Link to="/messages">Messages</Link>
            <span>Hi, {user.name}</span>
            <button onClick={handleLogout}>Logout</button>
          </>
        )}

        {user && user.role === 'user' && (
          <>
            <Link to="/my-reservations">My Reservations</Link>
            <Link to="/messages">Messages</Link>
            <span>Hi, {user.name}</span>
            <button onClick={handleLogout}>Logout</button>
          </>
        )}
      </div>
    </div>
  )
}


