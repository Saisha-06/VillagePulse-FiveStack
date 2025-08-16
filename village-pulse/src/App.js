import React, { useState } from "react";
import { BrowserRouter, Route, Routes, Link, useNavigate } from "react-router-dom";
import SignUp from "./components/SignUp";
import Login from "./components/SignIn";
import ReportForm from "./components/ReportForm";
import NearbyReports from "./components/NearbyReports";
import MyReports from "./components/MyReports";
import ReportDetails from "./components/ReportDetails";
import FeedbackForm from "./components/FeedbackForm";
import './App.css';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [idToken, setIdToken] = useState(null);

  // This function is passed to Login (SignIn) and called on successful login.
  function handleLogin({ uid, idToken }) {
    setLoggedIn(true);
    setIdToken(idToken);
    // Optionally: localStorage.setItem('idToken', idToken); for persistence
  }

  // For logout (optional)
  function handleLogout() {
    setLoggedIn(false);
    setIdToken(null);
    // Optionally: localStorage.removeItem('idToken');
  }

  return (
    <BrowserRouter>
      <nav style={{ display: 'flex', gap: 10, margin: 12 }}>
        <Link to="/">Nearby Reports</Link>
        <Link to="/report/new">Report Issue</Link>
        <Link to="/my-reports">My Reports</Link>
        {!loggedIn ? (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Sign Up</Link>
          </>
        ) : (
          <button onClick={handleLogout}>Logout</button>
        )}
      </nav>
      <Routes>
        {/* Public Routes */}
        <Route path="/signup" element={<SignUp />} />
        <Route
          path="/"
          element={loggedIn
            ? <NearbyReports idToken={idToken} />
            : <Login onLogin={handleLogin} />}
        />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />

        {/* Protected Routes: only render if logged in */}
        <Route
          path="/report/new"
          element={loggedIn ? <ReportForm idToken={idToken} /> : <Login onLogin={handleLogin} />}
        />
        <Route
          path="/my-reports"
          element={loggedIn ? <MyReports idToken={idToken} /> : <Login onLogin={handleLogin} />}
        />
        <Route
          path="/report/:id"
          element={loggedIn ? <ReportDetails idToken={idToken} /> : <Login onLogin={handleLogin} />}
        />
        <Route
          path="/report/:id/feedback"
          element={loggedIn ? <FeedbackForm idToken={idToken} /> : <Login onLogin={handleLogin} />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;