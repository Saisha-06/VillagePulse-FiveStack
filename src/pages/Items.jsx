import { useEffect, useState } from 'react'
import ItemCard from '../components/ItemCard.jsx'
import { api } from '../api/client.js'

export default function Items() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    api.listItems()
      .then(data => {
        if (!active) return
        // Accept both array or {data: [...]}
        setItems(Array.isArray(data) ? data : (data.data ?? []))
      })
      .catch(err => { if (active) setError(err.message || 'Failed to load') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  if (loading) return <div className="center"><div className="muted">Loading items…</div></div>
  if (error) return <div className="center"><div className="muted">Error: {error}</div></div>
  if (!items.length) return <div className="center"><div className="muted">No items yet.</div></div>

  return (
    <section className="stack">
      <h2>Items</h2>
      <div className="grid">
        {items.map(item => <ItemCard key={item.id || item._id} item={{ id: item.id || item._id, ...item }} />)}
      </div>
    </section>
  )
}
