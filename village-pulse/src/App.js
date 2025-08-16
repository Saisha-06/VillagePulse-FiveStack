import React, { useState } from "react";
import { BrowserRouter, Route, Routes, Link } from "react-router-dom";
import Login from "./components/SignIn";
import ReportForm from "./components/ReportForm";
import NearbyReports from "./components/NearbyReports";
import MyReports from "./components/MyReports";
import ReportDetails from "./components/ReportDetails";
import FeedbackForm from "./components/FeedbackForm";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  return (
    <BrowserRouter>
      <nav style={{display:'flex',gap:10,margin:12}}>
        <Link to="/">Nearby Reports</Link>
        <Link to="/report/new">Report Issue</Link>
        <Link to="/my-reports">My Reports</Link>
      </nav>
      <Routes>
        <Route path="/" element={loggedIn ? <NearbyReports /> : <Login setLoggedIn={setLoggedIn} />} />
        <Route path="/login" element={<Login setLoggedIn={setLoggedIn} />} />
        <Route path="/report/new" element={<ReportForm />} />
        <Route path="/my-reports" element={<MyReports />} />
        <Route path="/report/:id" element={<ReportDetails />} />
        <Route path="/report/:id/feedback" element={<FeedbackForm />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;