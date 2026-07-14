import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function StadiumDetail() {
  const { id } = useParams()
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const [stadium, setStadium] = useState(null)
  const [slots, setSlots] = useState([])
  const [selectedDate, setSelectedDate] = useState('')
  const [message, setMessage] = useState('')

  var dates = []
  for (var i = 0; i < 7; i++) {
    var d = new Date()
    d.setDate(d.getDate() + i)
    var year = d.getFullYear()
    var month = String(d.getMonth() + 1).padStart(2, '0')
    var day = String(d.getDate()).padStart(2, '0')
    dates.push(year + '-' + month + '-' + day)
  }

  useEffect(function() {
    fetch('/api/stadiums/' + id)
      .then(function(res) { return res.json() })
      .then(function(data) {
        setStadium(data)
        setSelectedDate(dates[0])
      })
  }, [id])

  useEffect(function() {
    if (selectedDate) {
      fetch('/api/slots/stadium/' + id + '?date=' + selectedDate)
        .then(function(res) { return res.json() })
        .then(function(data) { setSlots(data) })
    }
  }, [selectedDate])

  async function handleBook(slotId) {
    setMessage('')
    var res = await fetch('/api/reservations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({ slotId: slotId, stadiumId: id })
    })

    if (res.ok) {
      setMessage('Booked successfully!')
      var slotsRes = await fetch('/api/slots/stadium/' + id + '?date=' + selectedDate)
      var slotsData = await slotsRes.json()
      setSlots(slotsData)
    } else {
      var data = await res.json()
      setMessage(data.message)
    }
  }

  function handleMessageOwner() {
    navigate('/messages', { state: { receiverId: stadium.ownerId, stadiumName: stadium.name } })
  }

  var nowSD = new Date()
  var todaySD = nowSD.getFullYear() + '-' + String(nowSD.getMonth() + 1).padStart(2, '0') + '-' + String(nowSD.getDate()).padStart(2, '0')
  var currentTimeSD = String(nowSD.getHours()).padStart(2, '0') + ':' + String(nowSD.getMinutes()).padStart(2, '0')
  var displaySlots = slots.filter(function(slot) {
    if (selectedDate === todaySD) {
      return slot.endTime > currentTimeSD
    }
    return true
  })

  if (!stadium) {
    return (
      <div className="container">
        <div className="skeleton" style={{ height: '210px', marginBottom: '20px' }}></div>
        <div className="skeleton" style={{ height: '180px' }}></div>
      </div>
    )
  }

  return (
    <div className="container animate-in">
      <button onClick={function() { navigate(-1) }} className="back-btn">&#8592; Back</button>

      {stadium.photos && stadium.photos.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px', margin: '20px 0' }}>
          {stadium.photos.map(function(photo, index) {
            return (
              <img key={index} src={'/uploads/' + photo} alt="Stadium"
                style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
            )
          })}
        </div>
      )}

      <div className="info-card" style={{ padding: '24px', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>{stadium.name}</h1>
        <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '4px' }}>&#128205; {stadium.location}</p>
        <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '12px' }}>&#128100; Owner: {stadium.ownerName}</p>
        <p style={{ marginTop: '10px', lineHeight: '1.6', color: '#4b5563' }}>{stadium.description}</p>

        {stadium.facilities && stadium.facilities.length > 0 && stadium.facilities[0] !== '' && (
          <div style={{ marginTop: '16px' }}>
            {stadium.facilities.map(function(f, idx) {
              return <span key={idx} className="facility-tag">{f}</span>
            })}
          </div>
        )}

        {user && user.role === 'user' && (
          <button onClick={handleMessageOwner} className="btn-gray" style={{ marginTop: '16px' }}>
            &#9993; Message Owner
          </button>
        )}
      </div>

      <div className="info-card" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>Available Time Slots</h2>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
          {dates.map(function(date) {
            var isSelected = date === selectedDate
            return (
              <button key={date}
                onClick={function() { setSelectedDate(date) }}
                className={isSelected ? 'date-btn date-btn-active' : 'date-btn'}>
                {new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </button>
            )
          })}
        </div>

        {message && (
          <p className={message.includes('success') ? 'success-msg' : 'error-msg'}>
            {message}
          </p>
        )}

        {displaySlots.length === 0 ? (
          <div className="empty-state" style={{ padding: '30px' }}>
            <div className="empty-state-icon">&#128197;</div>
            <h3>No Slots Available</h3>
            <p>No time slots for this date. Try another day.</p>
          </div>
        ) : (
          <>
            {user && user.role === 'user' && (
              <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px' }}>
                &#128073; Click on an available slot to reserve it
              </p>
            )}
            {!user && (
              <div style={{ background: '#fef9c3', border: '1px solid #fde047', borderRadius: '10px', padding: '12px 16px', marginBottom: '12px', fontSize: '14px', color: '#854d0e' }}>
                &#128274; You must be <a href="/login" style={{ color: '#16a34a', fontWeight: 700 }}>logged in</a> to reserve a slot
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px', marginTop: '4px' }}>
              {displaySlots.map(function(slot) {
                var isClickable = !slot.isReserved && user && user.role === 'user'
                return (
                  <div key={slot.id}
                    className={'slot-card ' + (slot.isReserved ? 'slot-reserved' : 'slot-available') + (isClickable ? ' slot-available-clickable' : '')}
                    onClick={function() {
                      if (isClickable) handleBook(slot.id)
                    }}>
                    <span className="slot-time">{slot.startTime}</span>
                    <span className="slot-separator">to</span>
                    <span className="slot-time">{slot.endTime}</span>
                    {slot.price > 0 && (
                      <span style={{ fontWeight: 700, color: '#2563eb', fontSize: '13px' }}>{slot.price} SAR</span>
                    )}
                    <span className="slot-status" style={{ color: slot.isReserved ? '#dc2626' : '#059669' }}>
                      {slot.isReserved ? 'Reserved' : 'Available'}
                    </span>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default StadiumDetail
