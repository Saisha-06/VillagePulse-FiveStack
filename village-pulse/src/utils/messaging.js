// src/utils/messaging.js
import { messaging } from "../firebase";
import { getToken, onMessage } from "firebase/messaging";

/**
 * Requests notification permission and retrieves FCM token
 * @param {string} vapidKey - VAPID key for FCM
 * @returns {Promise<string>} FCM device token
 * @throws Will throw error if permission denied or token retrieval fails
 */
export async function requestFCMPermissionAndGetToken(vapidKey) {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      throw new Error("Notification permission denied");
    }
    const token = await getToken(messaging, { vapidKey });
    if (!token) {
      throw new Error("Failed to get FCM token");
    }
    return token;
  } catch (err) {
    console.error("FCM token error:", err);
    throw err;
  }
}

/**
 * Listen for incoming foreground messages
 * @param {function} callback - receives payload of message
 */
export function onMessageListener(callback) {
  onMessage(messaging, (payload) => {
    callback(payload);
  });
}
