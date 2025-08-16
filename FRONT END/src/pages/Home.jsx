export default function Home() {
  return (
    <section className="stack">
      <h1>Welcome to VillagePulse</h1>
      <p className="muted">
        This is the frontend for your Five Stack project. The current milestone focuses on:
        a running project, core UI components, a live read-only API connection, and basic responsiveness.
      </p>
      <ul>
        <li>Navigate to <strong>Items</strong> to load data from your backend.</li>
        <li>Edit <code>src/api/client.js</code> to match your exact API routes if needed.</li>
        <li>Set <code>VITE_API_BASE_URL</code> in a <code>.env</code> file for your server base URL.</li>
      </ul>
    </section>
  )
}
