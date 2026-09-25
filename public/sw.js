const OFFLINE_CACHE = "nwb-offline-v1";
const OFFLINE_URLS = ["/offline.html", "/icon-192.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(OFFLINE_CACHE).then((cache) => cache.addAll(OFFLINE_URLS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== OFFLINE_CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// Pages always come from the network (data must be live); only when there is no signal we show the offline page.
self.addEventListener("fetch", (event) => {
  if (event.request.mode !== "navigate") return;
  event.respondWith(fetch(event.request).catch(() => caches.match("/offline.html")));
});

self.addEventListener("push", (event) => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag: data.tag,
      renotify: Boolean(data.tag),
      requireInteraction: Boolean(data.actions && data.actions.length),
      vibrate: [100, 50, 100],
      actions: data.actions || [],
      data: { url: data.url || "/", ...(data.data || {}) },
    }),
  );
});

function openUrl(path) {
  const url = new URL(path || "/", self.location.origin).href;
  return clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
    for (const win of windows) {
      if (win.url.startsWith(self.location.origin) && "focus" in win) {
        win.navigate(url);
        return win.focus();
      }
    }
    return clients.openWindow(url);
  });
}

async function respond(raidId, status, fallbackUrl) {
  try {
    const res = await fetch(`/api/raids/${raidId}/respond`, {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error(String(res.status));
    await self.registration.showNotification(status === "confirmed" ? "Listo, vas a la raid" : "Anotado: no vas", {
      body: status === "confirmed" ? "Te esperamos. Puedes cambiar tu respuesta en la app." : "Avisamos a los oficiales.",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag: `raid-${raidId}`,
      data: { url: fallbackUrl },
    });
  } catch {
    await openUrl(fallbackUrl);
  }
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const data = event.notification.data || {};

  if ((event.action === "accept" || event.action === "decline") && data.raidId) {
    event.waitUntil(respond(data.raidId, event.action === "accept" ? "confirmed" : "absent", data.url));
    return;
  }

  event.waitUntil(openUrl(data.url));
});
