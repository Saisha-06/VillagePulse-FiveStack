// src/components/FeedbackForm.js
import React, { useState } from "react";

export default function FeedbackForm({ reportId, idToken }) {
  const [rating, setRating] = useState("");
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    const res = await fetch(
      `https://api.villagepulse.com/api/v1/reports/${reportId}/feedback`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`
        },
        body: JSON.stringify({ rating: parseInt(rating), comment })
      }
    );
    const data = await res.json();
    setStatus(data.message || data.error);
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="number"
        min="1" max="5"
        value={rating}
        required
        placeholder="Rating (1-5)"
        onChange={e => setRating(e.target.value)}
      />
      <input
        type="text"
        value={comment}
        placeholder="Your feedback"
        onChange={e => setComment(e.target.value)}
      />
      <button type="submit">Submit Feedback</button>
      {status && <p>{status}</p>}
    </form>
  );
}
