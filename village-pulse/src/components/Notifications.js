// src/components/Notifications.js
import React, { useEffect, useState } from "react";
import { messaging } from "../firebase";
import { getToken, onMessage } from "firebase/messaging";

const VAPID_KEY = "YOUR_PUBLIC_VAPID_KEY"; // Get from Firebase console

export default function Notifications({ onToken }) {
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    // Register Service Worker for background messages
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/firebase-messaging-sw.js")
        .then(() => console.log("Service Worker registered"));
    }
    // Request FCM token and send to backend for device registration
    getToken(messaging, { vapidKey: VAPID_KEY })
      .then((token) => {
        if (token) onToken(token);
      })
      .catch(console.error);

    // Listen to foreground messages
    onMessage(messaging, (payload) => {
      setNotification(payload.notification);
    });
  }, []);

  return notification ? (
    <div style={{background:'#eef',padding:10}}>
      <strong>{notification.title}</strong>
      <p>{notification.body}</p>
    </div>
  ) : null;
}