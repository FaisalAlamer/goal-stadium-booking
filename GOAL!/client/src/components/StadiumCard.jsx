import { Link } from 'react-router-dom'

function StadiumCard({ stadium }) {
  return (
    <div className="card">
      {stadium.photos && stadium.photos.length > 0 ? (
        <img
          src={'/uploads/' + stadium.photos[0]}
          alt={stadium.name}
          style={{ width: '100%', height: '200px', objectFit: 'cover' }}
        />
      ) : (
        <div style={{ width: '100%', height: '200px', background: 'linear-gradient(135deg, #e8f5e9, #c8e6c9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px' }}>
          &#9917;
        </div>
      )}

      <div style={{ padding: '18px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>{stadium.name}</h3>
        <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          &#128205; {stadium.location}
        </p>
        <p style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '14px', lineHeight: '1.5' }}>
          {stadium.description ? stadium.description.substring(0, 80) + '...' : 'No description available'}
        </p>
        <Link to={'/stadium/' + stadium.id}>
          <button className="btn-green" style={{ width: '100%' }}>View Details</button>
        </Link>
      </div>
    </div>
  )
}

export default StadiumCard
