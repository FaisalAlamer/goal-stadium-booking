import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import StadiumCard from '../components/StadiumCard'

function Home() {
  const [stadiums, setStadiums] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchName, setSearchName] = useState('')
  const [searchLocation, setSearchLocation] = useState('')
  const [searchDate, setSearchDate] = useState('')
  const [searchTime, setSearchTime] = useState('')
  const navigate = useNavigate()

  useEffect(function() {
    fetch('/api/stadiums')
      .then(function(res) { return res.json() })
      .then(function(data) {
        setStadiums(data)
        setLoading(false)
      })
  }, [])

  function handleClear() {
    setSearchName('')
    setSearchLocation('')
    setSearchDate('')
    setSearchTime('')
  }

  function handleSearch(e) {
    e.preventDefault()
    var params = []
    if (searchName) params.push('name=' + encodeURIComponent(searchName))
    if (searchLocation) params.push('location=' + encodeURIComponent(searchLocation))
    if (searchDate) params.push('date=' + searchDate)
    if (searchTime) params.push('time=' + searchTime)
    navigate('/search?' + params.join('&'))
  }

  return (
    <div>
      <div className="hero">
        <img src="/logo.png" alt="GOAL!" style={{ height: '100px', marginBottom: '16px', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))' }} />
        <h1>Find & Book Soccer Stadiums</h1>
        <p>Search for available stadiums and reserve your time slot</p>

        <form onSubmit={handleSearch} className="search-box">
          <div className="search-field">
            <label>Stadium Name</label>
            <div className="search-input-wrapper">
              <span className="search-icon">&#128269;</span>
              <input
                type="text"
                placeholder="Search stadiums..."
                value={searchName}
                onChange={function(e) { setSearchName(e.target.value) }}
                className="search-input"
              />
            </div>
          </div>

          <div className="search-field">
            <label>Location</label>
            <div className="search-input-wrapper">
              <span className="search-icon">&#128205;</span>
              <input
                type="text"
                placeholder="City or area..."
                value={searchLocation}
                onChange={function(e) { setSearchLocation(e.target.value) }}
                className="search-input"
              />
            </div>
          </div>

          <div className="search-field">
            <label>Date</label>
            <input
              type="date"
              value={searchDate}
              onChange={function(e) { setSearchDate(e.target.value) }}
              className="search-input-plain"
            />
          </div>

          <div className="search-field">
            <label>Time</label>
            <input
              type="time"
              value={searchTime}
              onChange={function(e) { setSearchTime(e.target.value) }}
              className="search-input-plain"
            />
          </div>

          <button type="submit" className="btn-search">Search</button>
          <button type="button" className="btn-search" onClick={handleClear}
            style={{ background: '#b0b8c4', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>Clear</button>
        </form>
      </div>

      <div className="container">
        <h2 className="section-title">Featured Stadiums</h2>
        <p className="section-subtitle">Discover the best venues near you</p>

        {loading && (
          <div className="grid">
            <div className="skeleton skeleton-card"></div>
            <div className="skeleton skeleton-card"></div>
            <div className="skeleton skeleton-card"></div>
          </div>
        )}

        {!loading && stadiums.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">&#9917;</div>
            <h3>No Stadiums Yet</h3>
            <p>Be the first to add a stadium, or check back later for new listings.</p>
          </div>
        )}

        {!loading && stadiums.length > 0 && (
          <div className="grid animate-in">
            {stadiums.map(function(stadium) {
              return <StadiumCard key={stadium.id} stadium={stadium} />
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Home
