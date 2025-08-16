const BASE = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:3000'

async function http(path, init={}) {
  const url = `${BASE}${path}`
  const res = await fetch(url, {
    headers: { 'Accept': 'application/json', ...(init.headers || {}) },
    ...init
  })
  const contentType = res.headers.get('content-type') || ''
  if (!res.ok) {
    let message = `${res.status} ${res.statusText}`
    if (contentType.includes('application/json')) {
      try {
        const body = await res.json()
        message = body.message || JSON.stringify(body)
      } catch {}
    } else {
      try { message = await res.text() } catch {}
    }
    throw new Error(message)
  }
  if (contentType.includes('application/json')) return res.json()
  return res.text()
}

// READ endpoints (adjust these paths to match your backend)
export const api = {
  // e.g., GET /api/items
  async listItems() {
    return http('/api/items')
  },
  // e.g., GET /api/items/:id
  async getItem(id) {
    return http(`/api/items/${id}`)
  }
  // Post-milestone: create/update/delete methods can be added here
}
