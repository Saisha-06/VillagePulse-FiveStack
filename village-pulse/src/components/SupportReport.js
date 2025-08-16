// src/components/SupportReport.js
import React, { useState } from "react";

export default function SupportReport({ reportId, idToken }) {
  const [status, setStatus] = useState("");

  async function handleSupport() {
    const res = await fetch(
      `http://localhost:3000/api/v1/reports/${reportId}/support`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}` }
      }
    );
    const data = await res.json();
    setStatus(data.message || data.error);
  }

  return (
    <div>
      <button type="button" onClick={handleSupport}>Support/Upvote</button>
      {status && <p>{status}</p>}
    </div>
  );
}
