importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCWnWWaxQ5H6Rzi6eda1wvYgtk60Hd6dxc",
  projectId: "iashopee7",
  messagingSenderId: "784750676949",
  appId: "1:784750676949:web:0582600dcdd645a79b8b5c"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  const title = payload.notification?.title || 'Shopee Viral Pro ⏰';
  const body  = payload.notification?.body  || 'Hora do envio!';
  const url   = payload.data?.url || 'https://iashopee-p7ve.vercel.app';
  self.registration.showNotification(title, {
    body,
    icon: 'https://img.icons8.com/color/192/shopee.png',
    badge: 'https://img.icons8.com/color/72/shopee.png',
    vibrate: [200, 100, 200],
    data: { url }
  });
});

// Agenda local — recebe do app via postMessage
var agendados = {};

self.addEventListener('message', function(e) {
  if (!e.data) return;

  if (e.data.type === 'SCHEDULE') {
    const { id, delay, title, body, url } = e.data;
    // Cancela se já existe
    if (agendados[id]) clearTimeout(agendados[id]);

    agendados[id] = setTimeout(function() {
      self.registration.showNotification(title || 'Shopee Viral Pro ⏰', {
        body: body || 'Hora do envio!',
        icon: 'https://img.icons8.com/color/192/shopee.png',
        vibrate: [200, 100, 200],
        tag: String(id),
        requireInteraction: true,
        data: { url: url || 'https://iashopee-p7ve.vercel.app' }
      });
      delete agendados[id];
    }, delay);
  }

  if (e.data.type === 'CANCEL') {
    if (agendados[e.data.id]) {
      clearTimeout(agendados[e.data.id]);
      delete agendados[e.data.id];
    }
  }
});

// Clique na notificação — abre URL salva (WhatsApp ou app)
self.addEventListener('notificationclick', function(e) {
  e.notification.close();
  const url = e.notification.data?.url || 'https://iashopee-p7ve.vercel.app';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(list) {
      // Se já tem janela do app aberta, foca ela e abre WhatsApp em nova aba
      for (var c of list) {
        if (c.url.includes('iashopee-p7ve.vercel.app')) {
          c.focus();
          if (url.includes('whatsapp')) clients.openWindow(url);
          return;
        }
      }
      // Senão abre direto
      return clients.openWindow(url);
    })
  );
});

self.addEventListener('install',  () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(clients.claim()));
