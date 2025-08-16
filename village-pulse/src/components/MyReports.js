// src/components/MyReports.js
import React, { useEffect, useState } from "react";

export default function MyReports({ idToken }) {
  const [reports, setReports] = useState([]);
  useEffect(() => {
    fetch("http://localhost:3000/api/v1/reports/my", {
      headers: { Authorization: `Bearer ${idToken}` }
    })
      .then(res => res.json())
      .then(data => setReports(data.reports || []));
  }, [idToken]);

  return (
    <div>
      <h3>My Reports</h3>
      <ul>
        {reports.map(r => (
          <li key={r.id}>
            <strong>{r.category}</strong> - {r.description} (
              <span className={`status ${r.status.replace(/\s/g, '')}`}>
              {r.status}
              </span>
            )          
          </li>
        ))}
      </ul>
    </div>
  );
}
