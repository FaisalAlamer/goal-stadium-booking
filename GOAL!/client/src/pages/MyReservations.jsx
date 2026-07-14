import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function MyReservations() {
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const { token } = useAuth()

  useEffect(function() {
    loadReservations()
  }, [])

  function loadReservations() {
    fetch('/api/reservations/my', {
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(function(res) { return res.json() })
      .then(function(data) {
        setReservations(data)
        setLoading(false)
      })
  }

  async function handleCancel(resId) {
    var confirmed = window.confirm('Are you sure you want to cancel this reservation?')
    if (!confirmed) return

    await fetch('/api/reservations/' + resId, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + token }
    })

    loadReservations()
  }

  return (
    <div className="container animate-in">
      <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '24px' }}>My Reservations</h1>

      {loading && (
        <div>
          <div className="skeleton" style={{ height: '50px', marginBottom: '8px' }}></div>
          <div className="skeleton" style={{ height: '50px', marginBottom: '8px' }}></div>
          <div className="skeleton" style={{ height: '50px' }}></div>
        </div>
      )}

      {!loading && reservations.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">&#127915;</div>
          <h3>No Reservations Yet</h3>
          <p>Browse stadiums and book your first time slot to get started.</p>
        </div>
      )}

      {!loading && reservations.length > 0 && (
        <table className="table">
          <thead>
            <tr>
              <th>Stadium</th>
              <th>Date</th>
              <th>Time</th>
              <th>Price</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map(function(res) {
              return (
                <tr key={res.id}>
                  <td>
                    <Link to={'/stadium/' + res.stadiumId} style={{ fontWeight: 600 }}>{res.stadiumName}</Link>
                  </td>
                  <td>{res.date}</td>
                  <td>{res.startTime} - {res.endTime}</td>
                  <td>{res.price > 0 ? res.price + ' SAR' : 'Free'}</td>
                  <td>
                    <span className={'badge ' + (res.status === 'confirmed' ? 'badge-green' : 'badge-red')}>
                      {res.status}
                    </span>
                  </td>
                  <td>
                    {res.status === 'confirmed' && (
                      <button className="btn-red" style={{ padding: '6px 16px', fontSize: '13px' }} onClick={function() { handleCancel(res.id) }}>
                        Cancel
                      </button>
                    )}
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

export default MyReservations
