import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Statistics() {
  const { stadiumId } = useParams()
  const { token } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)

  useEffect(function() {
    fetch('/api/stats/stadium/' + stadiumId, {
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(function(res) { return res.json() })
      .then(function(data) { setStats(data) })
  }, [])

  if (!stats) {
    return (
      <div className="container">
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div className="skeleton" style={{ height: '100px', flex: 1, minWidth: '150px', borderRadius: '12px' }}></div>
          <div className="skeleton" style={{ height: '100px', flex: 1, minWidth: '150px', borderRadius: '12px' }}></div>
          <div className="skeleton" style={{ height: '100px', flex: 1, minWidth: '150px', borderRadius: '12px' }}></div>
          <div className="skeleton" style={{ height: '100px', flex: 1, minWidth: '150px', borderRadius: '12px' }}></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container animate-in">
      <button onClick={function() { navigate(-1) }} className="back-btn">&#8592; Back</button>
      <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '24px' }}>Stadium Statistics</h1>

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '32px' }}>
        <div className="stat-box">
          <h2 style={{ color: '#1b6b2e' }}>{stats.totalSlots}</h2>
          <p>Total Slots</p>
        </div>
        <div className="stat-box">
          <h2 style={{ color: '#dc2626' }}>{stats.reservedSlots}</h2>
          <p>Reserved</p>
        </div>
        <div className="stat-box">
          <h2 style={{ color: '#059669' }}>{stats.availableSlots}</h2>
          <p>Available</p>
        </div>
        <div className="stat-box">
          <h2 style={{ color: '#145222' }}>{stats.occupancyRate}%</h2>
          <p>Occupancy</p>
        </div>
      </div>

      <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>Recent Reservations</h2>
      {stats.recentReservations.length === 0 ? (
        <div className="empty-state" style={{ padding: '30px' }}>
          <div className="empty-state-icon">&#128202;</div>
          <h3>No Reservations Yet</h3>
          <p>Stats will appear here once users start booking.</p>
        </div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>User</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {stats.recentReservations.map(function(res) {
              return (
                <tr key={res.id}>
                  <td style={{ fontWeight: 600 }}>{res.userName}</td>
                  <td>{res.date}</td>
                  <td>{res.startTime} - {res.endTime}</td>
                  <td>
                    <span className="badge badge-green">{res.status}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default Statistics
