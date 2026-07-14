import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import StadiumCard from '../components/StadiumCard'

function SearchResults() {
  const [searchParams] = useSearchParams()
  const [stadiums, setStadiums] = useState([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState(searchParams.get('name') || '')
  const [location, setLocation] = useState(searchParams.get('location') || '')
  const [date, setDate] = useState(searchParams.get('date') || '')
  const [time, setTime] = useState(searchParams.get('time') || '')

  function buildUrl() {
    var params = []
    if (name) params.push('name=' + encodeURIComponent(name))
    if (location) params.push('location=' + encodeURIComponent(location))
    if (date) params.push('date=' + date)
    if (time) params.push('time=' + time)
    return '/api/stadiums' + (params.length ? '?' + params.join('&') : '')
  }

  useEffect(function() {
    fetch(buildUrl())
      .then(function(res) { return res.json() })
      .then(function(data) {
        setStadiums(data)
        setLoading(false)
      })
  }, [])

  function handleClear() {
    setName('')
    setLocation('')
    setDate('')
    setTime('')
  }

  function handleSearch(e) {
    e.preventDefault()
    setLoading(true)
    fetch(buildUrl())
      .then(function(res) { return res.json() })
      .then(function(data) {
        setStadiums(data)
        setLoading(false)
      })
  }

  return (
    <div className="container animate-in">
      <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '20px' }}>Search Stadiums</h1>

      <form onSubmit={handleSearch} style={{ margin: '0 0 24px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'end' }}>
        <div style={{ flex: 1, minWidth: '140px' }}>
          <label>Name</label>
          <input type="text" className="form-input" placeholder="Search by name..."
            value={name}
            onChange={function(e) { setName(e.target.value) }} />
        </div>
        <div style={{ flex: 1, minWidth: '140px' }}>
          <label>Location</label>
          <input type="text" className="form-input" placeholder="Search by location..."
            value={location}
            onChange={function(e) { setLocation(e.target.value) }} />
        </div>
        <div style={{ flex: 1, minWidth: '140px' }}>
          <label>Date</label>
          <input type="date" className="form-input"
            value={date}
            onChange={function(e) { setDate(e.target.value) }} />
        </div>
        <div style={{ flex: 1, minWidth: '120px' }}>
          <label>Time</label>
          <input type="time" className="form-input"
            value={time}
            onChange={function(e) { setTime(e.target.value) }} />
        </div>
        <button type="submit" className="btn-green" style={{ marginTop: '6px', padding: '10px 24px' }}>Search</button>
        <button type="button" className="btn-search" onClick={handleClear}
          style={{ marginTop: '6px', background: '#b0b8c4', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>Clear</button>
      </form>

      <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '16px' }}>
        {loading ? 'Searching...' : stadiums.length + ' stadium(s) found'}
      </p>

      {loading && (
        <div className="grid">
          <div className="skeleton skeleton-card"></div>
          <div className="skeleton skeleton-card"></div>
        </div>
      )}

      {!loading && stadiums.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">&#128270;</div>
          <h3>No Stadiums Found</h3>
          <p>Try different search filters or check back later for new stadiums.</p>
        </div>
      )}

      {!loading && stadiums.length > 0 && (
        <div className="grid">
          {stadiums.map(function(stadium) {
            return <StadiumCard key={stadium.id} stadium={stadium} />
          })}
        </div>
      )}
    </div>
  )
}

export default SearchResults
