import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function AddStadium() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [facilities, setFacilities] = useState('')
  const [photos, setPhotos] = useState(null)
  const [error, setError] = useState('')
  const { token } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    var formData = new FormData()
    formData.append('name', name)
    formData.append('description', description)
    formData.append('location', location)
    formData.append('facilities', facilities)

    if (photos) {
      for (var i = 0; i < photos.length; i++) {
        formData.append('photos', photos[i])
      }
    }

    try {
      var res = await fetch('/api/stadiums', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token },
        body: formData
      })

      if (res.ok) {
        navigate('/dashboard')
      } else {
        var data = await res.json()
        setError(data.message)
      }
    } catch (err) {
      setError('Failed to add stadium')
    }
  }

  return (
    <div className="container" style={{ maxWidth: '500px', marginTop: '30px' }}>
      <button onClick={function() { navigate(-1) }} className="back-btn">&#8592; Back</button>
      <div className="animate-in">
        <h2>Add New Stadium</h2>

        {error && <p className="error-msg">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label>Stadium Name</label>
            <input type="text" className="form-input" value={name}
              onChange={function(e) { setName(e.target.value) }}
              placeholder="Enter stadium name" required />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label>Description</label>
            <textarea className="form-input" rows="3" value={description}
              onChange={function(e) { setDescription(e.target.value) }}
              placeholder="Describe your stadium..." />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label>Location</label>
            <input type="text" className="form-input" value={location}
              onChange={function(e) { setLocation(e.target.value) }}
              placeholder="City, area, or address" required />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label>Facilities (comma separated)</label>
            <input type="text" className="form-input" value={facilities}
              placeholder="Parking, Lights, Changing Rooms"
              onChange={function(e) { setFacilities(e.target.value) }} />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label>Photos (up to 5)</label>
            <input type="file" multiple accept="image/*"
              style={{ marginTop: '8px', fontSize: '14px' }}
              onChange={function(e) {
                if (e.target.files.length > 5) {
                  setError('You can only upload up to 5 photos')
                  e.target.value = ''
                } else {
                  setError('')
                  setPhotos(e.target.files)
                }
              }} />
            <p style={{ color: '#9ca3af', display: 'block', marginTop: '4px', fontSize: '12px' }}>
              Hold Ctrl (or Cmd on Mac) to select multiple photos
            </p>
          </div>

          <button type="submit" className="btn-green" style={{ width: '100%', padding: '12px' }}>
            Add Stadium
          </button>
        </form>
      </div>
    </div>
  )
}

export default AddStadium
