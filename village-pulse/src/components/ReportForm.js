// src/components/ReportForm.js
import React, { useState } from "react";
import { auth } from "../firebase";
import FileUpload from "./FileUpload";

export default function ReportForm() {
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [message, setMessage] = useState("");
  const [reportId, setReportId] = useState("");

  const submitReport = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return setMessage("Login required");
    try {
      const token = await user.getIdToken();
      const res = await fetch("http://localhost:3000/api/v1/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          category,
          description,
          location: { latitude: Number(latitude), longitude: Number(longitude) },
          imageUrl,
        }),
      });
      const data = await res.json();
      setMessage(data.message || data.error);
      if (data.id) setReportId(data.id);
    } catch (error) {
      setMessage("Failed to submit report, please try again.");
    }
  };

  return (
    <form className="p-4 flex flex-col" onSubmit={submitReport}>
      <input
        placeholder="Category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        required
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />
      <input
        placeholder="Latitude"
        type="number"
        value={latitude}
        onChange={(e) => setLatitude(e.target.value)}
        required
      />
      <input
        placeholder="Longitude"
        type="number"
        value={longitude}
        onChange={(e) => setLongitude(e.target.value)}
        required
      />
      <FileUpload onUpload={(url) => setImageUrl(url)} />
      <button type="submit">Submit Report</button>
      {message && <div>{message}</div>}
      {reportId && (
        <div>
          Report submitted successfully. Report ID: <b>{reportId}</b>
        </div>
      )}
    </form>
  );
}
