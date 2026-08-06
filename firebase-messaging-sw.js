/* firebase-messaging-sw.js
   
   এই ফাইলটা index.html-এর ঠিক পাশেই (একই ফোল্ডারে, রুটে) রাখতে হবে —
   ঠিক sw.js এবং manifest.json যেভাবে আছে সেভাবেই।
   
   পাথ: /firebase-messaging-sw.js (Root এ)
   
   কাজ:
   - অ্যাপ ব্যাকগ্রাউন্ডে বা বন্ধ থাকা অবস্থায় পুশ নোটিফিকেশন দেখায়
   - নোটিফিকেশনে ক্লিক করলে অ্যাপ খুলে যায়
*/

importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js');

// Firebase Config - index.html-এর সাথে সামঞ্জস্যপূর্ণ হতে হবে
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

/**
 * Background Message Handler
 * অ্যাপ বন্ধ থাকা বা ব্যাকগ্রাউন্ডে চলা অবস্থায় পুশ এলে এখানে হ্যান্ডেল হয়
 */
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] ব্যাকগ্রাউন্ড মেসেজ পেয়েছি:', payload);

  const title = (payload.notification && payload.notification.title) 
    || '🛎️ নতুন অর্ডার এসেছে!';
  const body = (payload.notification && payload.notification.body) 
    || 'নতুন বার্তা পেয়েছি';

  const options = {
    body: body,
    icon: './icon-192.png',
    badge: './icon-192.png',
    vibrate: [200, 100, 200],
    tag: 'order-notification',
    requireInteraction: false,
    data: payload.data || {},
    actions: [
      {
        action: 'open_order',
        title: 'অর্ডার দেখো'
      }
    ]
  };

  return self.registration.showNotification(title, options);
});

/**
 * Notification Click Handler
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] নোটিফিকেশনে ক্লিক হয়েছে:', event.notification.title);

  event.notification.close();

  if (event.action === 'open_order') {
    console.log('Order page খুলছি...');
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      console.log('[firebase-messaging-sw.js] সক্রিয় windows:', clientList.length);

      // যদি কোনো window খোলা আছে, সেটা focus করো
      // (URL সরাসরি '/' এর সাথে না মিলিয়ে — অ্যাপ subfolder-এ host হলেও কাজ করবে)
      for (const client of clientList) {
        if ('focus' in client) {
          console.log('বিদ্যমান window focus করছি');
          return client.focus();
        }
      }

      if (clients.openWindow) {
        console.log('নতুন window খুলছি');
        return clients.openWindow('./');
      }
    })
  );
});

/**
 * Optional: Notification Close Handler
 */
self.addEventListener('notificationclose', (event) => {
  console.log('[firebase-messaging-sw.js] নোটিফিকেশন dismiss হয়েছে:', event.notification.title);
});

/**
 * Optional: Push Event Handler
 */
self.addEventListener('push', (event) => {
  console.log('[firebase-messaging-sw.js] Push ইভেন্ট:', event);
});
 * Optional: Push Event Handler
 * সরাসরি push event সামলাতে চাইলে (Firebase এ পাওয়া ছাড়াই)
 */
self.addEventListener('push', (event) => {
  console.log('[firebase-messaging-sw.js] Push ইভেন্ট:', event);
  // Firebase messaging library ইতিমধ্যে সামলাবে, কিন্তু এখানেও add করতে পারো
});
