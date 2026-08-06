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

  // Default টাইটেল ও বডি
  const title = (payload.notification && payload.notification.title) 
    || '🛎️ নতুন অর্ডার এসেছে!';
  const body = (payload.notification && payload.notification.body) 
    || 'নতুন বার্তা পেয়েছি';

  // নোটিফিকেশন অপশন
  const options = {
    body: body,
    icon: './icon-192.png',           // আপনার app icon
    badge: './icon-192.png',          // notification badge
    vibrate: [200, 100, 200],         // কম্পন প্যাটার্ন
    tag: 'order-notification',        // নোটিফিকেশন গ্রুপ (এক সাথে একাধিক আলে তো একটাই দেখাবে)
    requireInteraction: false,        // auto dismiss হবে নাকি ইউজার dismiss করবে
    data: payload.data || {},         // extra ডেটা (কাস্টম ডেটা পাঠাতে পারো)
    actions: [
      {
        action: 'open_order',
        title: 'অর্ডার দেখো'
      }
    ]
  };

  // নোটিফিকেশন দেখাও
  return self.registration.showNotification(title, options);
});

/**
 * Notification Click Handler
 * ইউজার নোটিফিকেশনে ক্লিক করলে কী হবে তা ডিফাইন করো
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] নোটিফিকেশনে ক্লিক হয়েছে:', event.notification.title);

  // নোটিফিকেশন বন্ধ করো
  event.notification.close();

  // কাস্টম action যদি থাকে
  if (event.action === 'open_order') {
    console.log('Order page খুলছি...');
    // এখানে কাস্টম পেজ খুলতে পারো, যেমন: /orders
  }

  // সব open windows খুঁজো
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      console.log('[firebase-messaging-sw.js] সক্রিয় windows:', clientList.length);

      // যদি কোনো window আছে, সেটা focus করো
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          console.log('বিদ্যমান window focus করছি');
          return client.focus();
        }
      }

      // যদি কোনো window না থাকে, নতুন window খোলো
      if (clients.openWindow) {
        console.log('নতুন window খুলছি');
        return clients.openWindow('./');
      }
    })
  );
});

/**
 * Optional: Notification Close Handler
 * ইউজার নোটিফিকেশন dismiss করলে (X দিয়ে বন্ধ করলে)
 */
self.addEventListener('notificationclose', (event) => {
  console.log('[firebase-messaging-sw.js] নোটিফিকেশন dismiss হয়েছে:', event.notification.title);
  // এখানে analytics পাঠাতে পারো, লগ করতে পারো, ইত্যাদি
});

/**
 * Optional: Push Event Handler
 * সরাসরি push event সামলাতে চাইলে (Firebase এ পাওয়া ছাড়াই)
 */
self.addEventListener('push', (event) => {
  console.log('[firebase-messaging-sw.js] Push ইভেন্ট:', event);
  // Firebase messaging library ইতিমধ্যে সামলাবে, কিন্তু এখানেও add করতে পারো
});
