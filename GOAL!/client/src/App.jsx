import { Routes, Route, Link } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import OwnerDashboard from './pages/OwnerDashboard'
import AddStadium from './pages/AddStadium'
import StadiumDetail from './pages/StadiumDetail'
import ManageSlots from './pages/ManageSlots'
import Messages from './pages/Messages'
import MyReservations from './pages/MyReservations'
import SearchResults from './pages/SearchResults'
import Statistics from './pages/Statistics'
import EditStadium from './pages/EditStadium'
import './App.css'

function NotFound() {

<Link to="/">Return to Home</Link>
  return (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}  >
      <h1 style={{ fontSize: '100px', fontWeight: 800, color:'red' }}>404</h1>
      <h2 style={{ fontSize: '24px', marginBottom: '12px' }}>Page Not Found</h2>
      <p style={{ color: '#9ca3af', marginBottom: '32px' }}>
        The page you're looking for doesn't exist.
      </p>
      <Link to="/">
        <button className="btn-green">
          Return to Home
        </button>
      </Link>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<OwnerDashboard />} />
        <Route path="/add-stadium" element={<AddStadium />} />
        <Route path="/stadium/:id" element={<StadiumDetail />} />
        <Route path="/stadium/:id/manage-slots" element={<ManageSlots />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/my-reservations" element={<MyReservations />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/statistics/:stadiumId" element={<Statistics />} />
        <Route path="/stadium/:id/edit" element={<EditStadium />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
