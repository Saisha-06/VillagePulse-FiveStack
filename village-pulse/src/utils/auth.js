// src/utils/auth.js
import { auth } from "../firebase";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";

/**
 * Sign in using email and password
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise} resolves with user credential
 */
export function signIn(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

/**
 * Sign out current user
 * @returns {Promise}
 */
export function logOut() {
  return signOut(auth);
}

/**
 * Subscribe to auth state changes
 * @param {function} callback receives user or null
 * @returns Unsubscribe function
 */
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, (user) => {
    callback(user);
  });
}

/**
 * Get current user's ID token for authenticated requests
 * @returns {Promise<string|null>} ID token or null if no user
 */
export async function getIdToken() {
  const user = auth.currentUser;
  if (user) {
    try {
      return await user.getIdToken();
    } catch (err) {
      console.error("Failed to get ID token:", err);
      return null;
    }
  }
  return null;
}
