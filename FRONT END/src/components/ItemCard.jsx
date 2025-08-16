import { Link } from 'react-router-dom'

export default function ItemCard({ item }) {
  return (
    <article className="card">
      <div className="card-title">{item.title || item.name || `Item #${item.id}`}</div>
      {item.subtitle || item.category ? (
        <div className="card-meta">{item.subtitle || item.category}</div>
      ) : null}
      {item.summary || item.description ? (
        <p className="muted">{(item.summary || item.description).slice(0, 120)}{(item.summary || item.description)?.length > 120 ? '…' : ''}</p>
      ) : null}
      <div className="row">
        <Link className="btn" to={`/items/${item.id}`}>View details</Link>
      </div>
    </article>
  )
}
