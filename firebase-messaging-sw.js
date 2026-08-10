/* ============================================================
   firebase-messaging-sw.js — ব্যাকগ্রাউন্ড পুশ নোটিফিকেশনের জন্য
   ============================================================
   এই ফাইলটাও index.html-এর সাথে ঠিক একই ফোল্ডারে থাকতে হবে
   (registerPushToken() ফাংশনটা './firebase-messaging-sw.js'
   পাথ থেকেই এটা খোঁজে)।

   এটা কাজ করে শুধু তখনই যখন index.html-এ FCM_VAPID_KEY বসানো
   আছে। VAPID key না থাকলে এই ফাইলটা আদৌ রেজিস্টার হয় না —
   তখন শুধু লোকাল নোটিফিকেশন (অ্যাপ খোলা/ব্যাকগ্রাউন্ডে থাকা
   অবস্থায়) কাজ করবে, sw.js দিয়ে।

   firebaseConfig নিচে index.html-এর FIREBASE_CONFIG-এর সাথে
   হুবহু মিলিয়ে বসানো হয়েছে — এই দুটো আলাদা রাখলে টোকেন
   রেজিস্ট্রেশন ব্যর্থ হবে।
   ============================================================ */

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

// অ্যাপ পুরোপুরি বন্ধ বা ট্যাব বন্ধ থাকা অবস্থায় পুশ এলে এখানে হ্যান্ডেল হয়।
// (অ্যাপ খোলা/ফোরগ্রাউন্ডে থাকলে index.html-এর initFCMForegroundHandler() হ্যান্ডেল করে।)
messaging.onBackgroundMessage((payload) => {
  const title = (payload.notification && payload.notification.title) || '🛎️ নতুন অর্ডার এসেছে!';
  const body = (payload.notification && payload.notification.body) || '';
  const orderId = (payload.data && payload.data.orderId) || '';

  self.registration.showNotification(title, {
    body,
    icon: './icon-192.png',
    badge: './icon-192.png',
    tag: orderId ? ('order-' + orderId) : 'order-update',
    vibrate: [200, 100, 200],
    data: { orderId },
    renotify: true
  });
});

// নোটিফিকেশনে ট্যাপ করলে অ্যাপ ফোকাস/ওপেন করে Orders পেজে নেওয়ার চেষ্টা
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.postMessage({ type: 'GO_ORDERS' });
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow('./');
      }
    })
  );
});
