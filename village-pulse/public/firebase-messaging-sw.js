importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCxSnKvNH2rpqMMwWxMe3P2eh4Qz68t0ts",
  authDomain: "villagepulse-276d3.firebaseapp.com",
  projectId: "villagepulse-276d3",
  storageBucket: "villagepulse-276d3.firebasestorage.app",
  messagingSenderId: "127727379466",
  appId: "1:127727379466:web:7a5f374acc2e2083a8abf3"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    // icon, etc can be added here
  });
});
