import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function OwnerDashboard() {
  const [stadiums, setStadiums] = useState([])
  const [loading, setLoading] = useState(true)
  const { token } = useAuth()

  function loadStadiums() {
    fetch('/api/stadiums/owner/my', {
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(function(res) { return res.json() })
      .then(function(data) {
        setStadiums(data)
        setLoading(false)
      })
  }

  useEffect(function() {
    loadStadiums()
  }, [])

  async function handleDelete(stadiumId) {
    if (!window.confirm('Are you sure you want to delete this stadium? All slots and reservations will be removed.')) return
    await fetch('/api/stadiums/' + stadiumId, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + token }
    })
    loadStadiums()
  }

  return (
    <div className="container animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '2px solid #f3f4f6' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800 }}>My Stadiums</h1>
        <Link to="/add-stadium">
          <button className="btn-green">+ Add Stadium</button>
        </Link>
      </div>

      {loading && (
        <div>
          <div className="skeleton" style={{ height: '120px', marginBottom: '16px', borderRadius: '12px' }}></div>
          <div className="skeleton" style={{ height: '120px', borderRadius: '12px' }}></div>
        </div>
      )}

      {!loading && stadiums.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">&#127967;</div>
          <h3>No Stadiums Yet</h3>
          <p>Add your first stadium to start managing bookings.</p>
        </div>
      )}

      {!loading && stadiums.map(function(stadium) {
        return (
          <div key={stadium.id} className="stadium-list-card" style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
            {stadium.photos && stadium.photos.length > 0 ? (
              <img src={'/uploads/' + stadium.photos[0]} alt={stadium.name}
                style={{ width: '160px', height: '110px', objectFit: 'cover', borderRadius: '10px', flexShrink: 0 }} />
            ) : (
              <div style={{ width: '160px', height: '110px', background: 'linear-gradient(135deg, #e8f5e9, #c8e6c9)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', flexShrink: 0 }}>
                &#9917;
              </div>
            )}

            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>{stadium.name}</h3>
              <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '4px' }}>&#128205; {stadium.location}</p>
              <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '14px' }}>{stadium.description}</p>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <Link to={'/stadium/' + stadium.id}>
                  <button className="btn-green">View</button>
                </Link>
                <Link to={'/stadium/' + stadium.id + '/manage-slots'}>
                  <button className="btn-green">Manage Slots</button>
                </Link>
                <Link to={'/stadium/' + stadium.id + '/edit'}>
                  <button className="btn-gray">Edit</button>
                </Link>
                <Link to={'/statistics/' + stadium.id}>
                  <button className="btn-green">Statistics</button>
                </Link>
                <button className="btn-red" onClick={function() { handleDelete(stadium.id) }}>Remove</button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default OwnerDashboard
