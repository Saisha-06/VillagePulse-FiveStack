import React, { useEffect, useState } from "react";
import { auth } from "../firebase";
import { Link } from "react-router-dom";

export default function NearbyReports() {
  const [reports, setReports] = useState([]);
  useEffect(() => {
    async function fetchReports() {
      const user = auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();
      const res = await fetch(`http://localhost:3000/api/v1/reports/nearby?latitude=15.3&longitude=74.14&radius=3`, {
        headers: { Authorization: "Bearer " + token }
      });
      const data = await res.json();
      setReports(data.reports || []);
    }
    fetchReports();
  }, []);

  return (
    <div>
      <h2>Nearby Issues</h2>
      {reports.map(r => (
        <div key={r.id} style={{border:'1px solid #eee',margin:8,padding:8}}>
          <div>{r.category}</div>
          <div>{r.description}</div>
          <div>
            Status:
            {" "}
            <span className={`status ${r.status.replace(/\s/g, '')}`}>
            {r.status}
            </span>
            </div>
          <Link to={`/report/${r.id}`}>Details</Link>
        </div>
      ))}
    </div>
  );
}