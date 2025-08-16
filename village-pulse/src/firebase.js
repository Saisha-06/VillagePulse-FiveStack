// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getMessaging } from "firebase/messaging";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
  apiKey: "AIzaSyCxSnKvNH2rpqMMwWxMe3P2eh4Qz68t0ts",
  authDomain: "villagepulse-276d3.firebaseapp.com",
  projectId: "villagepulse-276d3",
  storageBucket: "villagepulse-276d3.firebasestorage.app",
  messagingSenderId: "127727379466",
  appId: "1:127727379466:web:7a5f374acc2e2083a8abf3"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);         // For authentication (login, register)
export const messaging = getMessaging(app); // For notifications (alerts)
export const storage = getStorage(app);     // For uploading images/files

export default app;