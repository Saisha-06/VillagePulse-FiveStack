import { Routes, Route, Link, NavLink } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Items from './pages/Items.jsx'
import ItemDetail from './pages/ItemDetail.jsx'

function Navbar() {
  return (
    <nav className="navbar">
      <div className="container nav-inner">
        <Link to="/" className="brand">VillagePulse</Link>
        <div className="spacer" />
        <NavLink to="/" className="nav-link">Home</NavLink>
        <NavLink to="/items" className="nav-link">Items</NavLink>
      </div>
    </nav>
  )
}

export default function App() {
  return (
    <>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/items" element={<Items />} />
          <Route path="/items/:id" element={<ItemDetail />} />
        </Routes>
      </div>
      <footer>© {new Date().getFullYear()} VillagePulse • Five Stack</footer>
    </>
  )
}
