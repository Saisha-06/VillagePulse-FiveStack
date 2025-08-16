// src/components/ReportDetails.js
import React, { useEffect, useState } from "react";

export default function ReportDetails({ reportId, idToken }) {
  const [report, setReport] = useState(null);
  useEffect(() => {
    fetch(`https://api.villagepulse.com/api/v1/reports/${reportId}`, {
      headers: { Authorization: `Bearer ${idToken}` }
    })
      .then(res => res.json())
      .then(data => setReport(data.report));
  }, [reportId, idToken]);

  if (!report) return <p>Loading...</p>;
  return (
    <div>
      <h3>Report Details</h3>
      <p><strong>Category:</strong> {report.category}</p>
      <p><strong>Description:</strong> {report.description}</p>
      <p><strong>Status:</strong> {report.status}</p>
      <p><strong>Latitude:</strong> {report.location.latitude}</p>
      <p><strong>Longitude:</strong> {report.location.longitude}</p>
      {report.imageUrl && <img src={report.imageUrl} width={200} alt="Report" />}
      <p><strong>Supporters:</strong> {report.supportersCount}</p>
    </div>
  );
}
