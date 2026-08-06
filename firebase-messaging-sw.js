/* firebase-messaging-sw.js
   এই ফাইলটা index.html-এর ঠিক পাশেই (একই ফোল্ডারে, রুটে) রাখতে হবে —
   ঠিক sw.js এবং manifest.json যেভাবে আছে সেভাবেই।
   এটা ব্যাকগ্রাউন্ডে / অ্যাপ পুরো বন্ধ থাকা অবস্থায় পুশ নোটিফিকেশন দেখানোর
   দায়িত্বে থাকে। index.html-এর ভেতরের FIREBASE_CONFIG-এর সাথে এই ফাইলের
   config হুবহু মিলতে হবে। */

importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCJOhYaGVS3OlMdpwHAYtNTnkc4cLNWlIU",
  authDomain: "sohanshopbd.firebaseapp.com",
  databaseURL: "https://sohanshopbd-default-rtdb.firebaseio.com",
  projectId: "sohanshopbd",
  storageBucket: "sohanshopbd.firebasestorage.app",
  messagingSenderId: "375490913858",
  appId: "1:375490913858:web:3596b25f007cc10be1efdb"
});

const messaging = firebase.messaging();

// অ্যাপ ব্যাকগ্রাউন্ডে/বন্ধ থাকা অবস্থায় পুশ এলে এখানে হ্যান্ডেল হয়
messaging.onBackgroundMessage((payload) => {
  const title = (payload.notification && payload.notification.title) || '🛎️ নতুন অর্ডার এসেছে!';
  const body = (payload.notification && payload.notification.body) || '';
  self.registration.showNotification(title, {
    body,
    icon: './icon-192.png',
    badge: './icon-192.png',
    vibrate: [200, 100, 200],
    data: payload.data || {}
  });
});

// নোটিফিকেশনে ট্যাপ করলে অ্যাপ খুলে যাবে
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('./');
    })
  );
});
