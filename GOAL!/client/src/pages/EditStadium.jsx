import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function EditStadium() {
  const { id } = useParams()
  const { token } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [facilities, setFacilities] = useState('')
  const [existingPhotos, setExistingPhotos] = useState([])
  const [newPhotos, setNewPhotos] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(function() {
    fetch('/api/stadiums/' + id)
      .then(function(res) { return res.json() })
      .then(function(data) {
        setName(data.name)
        setDescription(data.description)
        setLocation(data.location)
        setFacilities(data.facilities ? data.facilities.join(', ') : '')
        setExistingPhotos(data.photos || [])
        setLoading(false)
      })
  }, [id])

  function handleRemovePhoto(index) {
    var updated = []
    for (var i = 0; i < existingPhotos.length; i++) {
      if (i !== index) {
        updated.push(existingPhotos[i])
      }
    }
    setExistingPhotos(updated)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    var totalPhotos = existingPhotos.length + (newPhotos ? newPhotos.length : 0)
    if (totalPhotos > 10) {
      setError('Maximum 10 photos allowed')
      return
    }

    var formData = new FormData()
    formData.append('name', name)
    formData.append('description', description)
    formData.append('location', location)
    formData.append('facilities', facilities)
    formData.append('keepPhotos', JSON.stringify(existingPhotos))

    if (newPhotos) {
      for (var i = 0; i < newPhotos.length; i++) {
        formData.append('photos', newPhotos[i])
      }
    }

    try {
      var res = await fetch('/api/stadiums/' + id, {
        method: 'PUT',
        headers: { 'Authorization': 'Bearer ' + token },
        body: formData
      })

      if (res.ok) {
        navigate('/stadium/' + id)
      } else {
        var data = await res.json()
        setError(data.message)
      }
    } catch (err) {
      setError('Failed to update stadium')
    }
  }

  if (loading) {
    return (
      <div className="container" style={{ maxWidth: '500px', marginTop: '30px' }}>
        <div className="skeleton" style={{ height: '400px', borderRadius: '16px' }}></div>
      </div>
    )
  }

  return (
    <div className="container" style={{ maxWidth: '500px', marginTop: '30px' }}>
      <button onClick={function() { navigate(-1) }} className="back-btn">&#8592; Back</button>
      <div className="auth-card animate-in">
        <h2>Edit Stadium</h2>

        {error && <p className="error-msg">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label>Stadium Name</label>
            <input type="text" className="form-input" value={name}
              onChange={function(e) { setName(e.target.value) }} required />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label>Description</label>
            <textarea className="form-input" rows="3" value={description}
              onChange={function(e) { setDescription(e.target.value) }} />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label>Location</label>
            <input type="text" className="form-input" value={location}
              onChange={function(e) { setLocation(e.target.value) }} required />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label>Facilities (comma separated)</label>
            <input type="text" className="form-input" value={facilities}
              placeholder="Parking, Lights, Changing Rooms"
              onChange={function(e) { setFacilities(e.target.value) }} />
          </div>

          {existingPhotos.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <label>Current Photos</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '8px' }}>
                {existingPhotos.map(function(photo, index) {
                  return (
                    <div key={index} style={{ position: 'relative' }}>
                      <img src={'/uploads/' + photo} alt="Stadium"
                        style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
                      <button type="button"
                        onClick={function() { handleRemovePhoto(index) }}
                        style={{
                          position: 'absolute', top: '4px', right: '4px',
                          width: '22px', height: '22px', borderRadius: '50%',
                          background: '#ef4444', color: 'white', border: 'none',
                          cursor: 'pointer', fontSize: '12px', fontWeight: 700,
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                        X
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label>Add More Photos</label>
            <input type="file" multiple accept="image/*"
              style={{ marginTop: '8px', fontSize: '14px' }}
              onChange={function(e) {
                var totalCount = existingPhotos.length + e.target.files.length
                if (totalCount > 10) {
                  setError('Maximum 10 photos total. You have ' + existingPhotos.length + ' existing.')
                  e.target.value = ''
                } else {
                  setError('')
                  setNewPhotos(e.target.files)
                }
              }} />
            <small style={{ color: '#9ca3af', display: 'block', marginTop: '4px', fontSize: '12px' }}>
              New photos will be added to your existing ones ({existingPhotos.length} current)
            </small>
          </div>

          <button type="submit" className="btn-green" style={{ width: '100%', padding: '12px' }}>
            Save Changes
          </button>
        </form>
      </div>
    </div>
  )
}

export default EditStadium
