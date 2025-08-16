import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api/client.js'

export default function ItemDetail() {
  const { id } = useParams()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    api.getItem(id)
      .then(data => { if (active) setItem(data?.data ?? data) })
      .catch(err => { if (active) setError(err.message || 'Failed to load') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [id])

  if (loading) return <div className="center"><div className="muted">Loading…</div></div>
  if (error) return <div className="center"><div className="muted">Error: {error}</div></div>
  if (!item) return <div className="center"><div className="muted">Not found.</div></div>

  // Try common field names but show raw JSON as fallback
  const title = item.title || item.name || `Item #${item.id || item._id}`
  const details = {
    id: item.id || item._id,
    category: item.category,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt
  }

  return (
    <section className="stack">
      <Link to="/items" className="btn">← Back</Link>
      <div className="panel stack">
        <h2>{title}</h2>
        {item.description || item.summary ? <p>{item.description || item.summary}</p> : null}
        <div className="stack">
          {Object.entries(details).filter(([,v]) => v).map(([k,v]) => (
            <div key={k} className="row"><strong style={{minWidth: 120, display:'inline-block'}}>{k}</strong> <span className="muted">{String(v)}</span></div>
          ))}
        </div>
        <details>
          <summary>Raw JSON</summary>
          <pre style={{whiteSpace: 'pre-wrap'}}>{JSON.stringify(item, null, 2)}</pre>
        </details>
      </div>
    </section>
  )
}
