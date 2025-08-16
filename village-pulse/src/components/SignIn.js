// src/components/SignIn.js
import React, { useState } from "react";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

export default function SignIn({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSignIn(e) {
    e.preventDefault();
    setError("");
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCred.user.getIdToken();
      // Pass user ID and ID token to parent for backend auth usage
      onLogin({ uid: userCred.user.uid, idToken });
    } catch (err) {
      setError(err.message || "Failed to sign in");
    }
  }

  return (
    <form onSubmit={handleSignIn} className="p-4 flex flex-col max-w-sm mx-auto">
      <input
        type="email"
        placeholder="Email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="mb-3 p-2 border rounded"
      />
      <input
        type="password"
        placeholder="Password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="mb-3 p-2 border rounded"
      />
      <button type="submit" className="p-2 bg-blue-600 text-white rounded">
        Sign In
      </button>
      {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}
    </form>
  );
}
