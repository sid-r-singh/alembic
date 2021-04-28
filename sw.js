const version = '20210428055635';
const cacheName = `static::${version}`;

const buildContentBlob = () => {
  return ["/alembic/general/2016/08/29/example-post-three/","/alembic/history/2016/08/28/example-post-two/","/alembic/general/2016/08/27/example-post-one/","/alembic/categories/","/alembic/elements/","/alembic/blog/","/alembic/","/alembic/manifest.json","/alembic/offline/","/alembic/assets/search.json","/alembic/search/","/alembic/assets/styles.css","/alembic/thanks/","/alembic/redirects.json","/alembic/sitemap.xml","/alembic/robots.txt","/alembic/blog/page2/","/alembic/feed.xml","/alembic/assets/styles.css.map","/alembic/assets/logos/logo.svg", "/alembic//assets/default-offline-image.png", "/alembic//assets/scripts/fetch.js"
  ]
}

const updateStaticCache = () => {
  return caches.open(cacheName).then(cache => {
    return cache.addAll(buildContentBlob());
  });
};

const clearOldCache = () => {
  return caches.keys().then(keys => {
    // Remove caches whose name is no longer valid.
    return Promise.all(
      keys
        .filter(key => {
          return key !== cacheName;
        })
        .map(key => {
          console.log(`Service Worker: removing cache ${key}`);
          return caches.delete(key);
        })
    );
  });
};

self.addEventListener("install", event => {
  event.waitUntil(
    updateStaticCache().then(() => {
      console.log(`Service Worker: cache updated to version: ${cacheName}`);
    })
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(clearOldCache());
});

self.addEventListener("fetch", event => {
  let request = event.request;
  let url = new URL(request.url);

  // Only deal with requests from the same domain.
  if (url.origin !== location.origin) {
    return;
  }

  // Always fetch non-GET requests from the network.
  if (request.method !== "GET") {
    event.respondWith(fetch(request));
    return;
  }

  // Default url returned if page isn't cached
  let offlineAsset = "/offline/";

  if (request.url.match(/\.(jpe?g|png|gif|svg)$/)) {
    // If url requested is an image and isn't cached, return default offline image
    offlineAsset = "/alembic//assets/default-offline-image.png";
  }

  // For all urls request image from network, then fallback to cache, then fallback to offline page
  event.respondWith(
    fetch(request).catch(async () => {
      return (await caches.match(request)) || caches.match(offlineAsset);
    })
  );
  return;
});
