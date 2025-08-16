import React, { useState } from "react";
import { auth } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { Link } from "react-router-dom";
import "./SignUp.css"; // import the CSS

export default function SignUp({ onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setSuccess("Account created! You can now log in.");
      setEmail(""); setPassword(""); setConfirm("");
      if(onSuccess) onSuccess(); // e.g., redirect to login or auto-login
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form className="signup-form" onSubmit={handleSubmit}>
      <h2>Create an Account</h2>
      <input
        type="email"
        autoComplete="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <input
        type="password"
        autoComplete="new-password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <input
        type="password"
        autoComplete="new-password"
        placeholder="Confirm Password"
        value={confirm}
        onChange={e => setConfirm(e.target.value)}
      />
      <button type="submit">Sign Up</button>
      {error && <div className="signup-error">{error}</div>}
      {success && (<div className="signup-success">{success}<div style={{ marginTop: 10 }}>
          {/* This shows a login link after success */}
          <Link to="/login">Go to Login</Link>
        </div>
      </div>
    )}
    {/* Show login link even before success if you want: */}
    <div style={{ marginTop: 10 }}>
      Already have an account? <Link to="/login">Login</Link>
    </div>
      
    </form>
  );
}