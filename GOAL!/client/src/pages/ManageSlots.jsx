import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function ManageSlots() {
  const { id } = useParams()
  const { token } = useAuth()
  const navigate = useNavigate()
  const [stadiumName, setStadiumName] = useState('')
  const [slots, setSlots] = useState([])
  const [selectedDate, setSelectedDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [price, setPrice] = useState('')
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
        setStadiumName(data.name)
        setSelectedDate(dates[0])
      })
  }, [])

  useEffect(function() {
    if (selectedDate) {
      loadSlots()
    }
  }, [selectedDate])

  function loadSlots() {
    fetch('/api/slots/stadium/' + id + '?date=' + selectedDate)
      .then(function(res) { return res.json() })
      .then(function(data) { setSlots(data) })
  }

  async function handleDeleteSlot(slotId) {
    if (!window.confirm('Delete this slot?')) return
    await fetch('/api/slots/' + slotId, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + token }
    })
    loadSlots()
  }

  async function handleAddSlot(e) {
    e.preventDefault()
    setMessage('')

    if (!startTime || !endTime) {
      setMessage('Please select start and end times')
      return
    }

    if (!price || Number(price) <= 0) {
      setMessage('Please enter a price')
      return
    }

    // Prevent adding slots in the past
    var now = new Date()
    var todayYear = now.getFullYear()
    var todayMonth = String(now.getMonth() + 1).padStart(2, '0')
    var todayDay = String(now.getDate()).padStart(2, '0')
    var todayStr = todayYear + '-' + todayMonth + '-' + todayDay
    if (selectedDate === todayStr) {
      var currentTime = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0')
      if (startTime <= currentTime) {
        setMessage('Cannot add a slot in the past')
        return
      }
    }

    var res = await fetch('/api/slots/stadium/' + id, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({ date: selectedDate, startTime: startTime, endTime: endTime, price: Number(price) || 0 })
    })

    if (res.ok) {
      setMessage('Slot added!')
      setStartTime('')
      setEndTime('')
      setPrice('')
      loadSlots()
    } else {
      var data = await res.json()
      setMessage(data.message)
    }
  }

  var nowForFilter = new Date()
  var todayForFilter = nowForFilter.getFullYear() + '-' + String(nowForFilter.getMonth() + 1).padStart(2, '0') + '-' + String(nowForFilter.getDate()).padStart(2, '0')
  var currentTimeForFilter = String(nowForFilter.getHours()).padStart(2, '0') + ':' + String(nowForFilter.getMinutes()).padStart(2, '0')
  var displaySlots = slots.filter(function(slot) {
    if (selectedDate === todayForFilter) {
      return slot.endTime > currentTimeForFilter
    }
    return true
  })

  return (
    <div className="container animate-in">
      <button onClick={function() { navigate(-1) }} className="back-btn">&#8592; Back</button>
      <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '20px' }}>Manage Slots - {stadiumName}</h1>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
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
        <p className={message.includes('added') ? 'success-msg' : 'error-msg'}>{message}</p>
      )}

      <div className="info-card" style={{ padding: '24px', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Add Time Slot</h3>
        <form onSubmit={handleAddSlot} style={{ display: 'flex', gap: '12px', alignItems: 'end', flexWrap: 'wrap' }}>
          <div>
            <label>Start Time</label>
            <input type="time" className="form-input" value={startTime}
              onChange={function(e) { setStartTime(e.target.value) }} />
          </div>
          <div>
            <label>End Time</label>
            <input type="time" className="form-input" value={endTime}
              onChange={function(e) { setEndTime(e.target.value) }} />
          </div>
          <div>
            <label>Price</label>
            <input type="number" className="form-input" value={price} placeholder="0"
              min="0" step="1"
              onChange={function(e) { setPrice(e.target.value) }} />
          </div>
          <button type="submit" className="btn-green">Add Slot</button>
        </form>
      </div>

      <div className="info-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Slots for {selectedDate}</h3>
        {displaySlots.length === 0 ? (
          <div className="empty-state" style={{ padding: '30px' }}>
            <div className="empty-state-icon">&#128197;</div>
            <h3>No Slots Yet</h3>
            <p>Add your first time slot for this date above.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px' }}>
            {displaySlots.map(function(slot) {
              return (
                <div key={slot.id}
                  className={'slot-card ' + (slot.isReserved ? 'slot-reserved' : 'slot-available')}>
                  <span className="slot-time">{slot.startTime}</span>
                  <span className="slot-separator">to</span>
                  <span className="slot-time">{slot.endTime}</span>
                  {slot.price > 0 && (
                    <span style={{ fontWeight: 700, color: '#2563eb', fontSize: '13px' }}>{slot.price} SAR</span>
                  )}
                  <span className="slot-status" style={{ color: slot.isReserved ? '#dc2626' : '#059669' }}>
                    {slot.isReserved ? 'Reserved' : 'Available'}
                  </span>
                  {!slot.isReserved && (
                    <button onClick={function() { handleDeleteSlot(slot.id) }}
                      style={{ marginTop: '6px', fontSize: '11px', padding: '3px 10px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit' }}>
                      Remove
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default ManageSlots
