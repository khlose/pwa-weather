var version = "pwa-weather-v1";
var dcache = "pwa-weather-data";
var weatherAPIUrlBase = 'https://publicdata-weather.firebaseio.com/';
var thingsToCache = [
    '/index.html',
    '/scripts/app.js',
    '/scripts/localforage.js',
    '/styles/ud811.css',
    '/images/clear.png',
    '/images/cloudy_s_sunny.png',
    '/images/cloudy.png',
    '/images/cloudy-scattered-showers.png',
    '/images/fog.png',
    '/images/ic_add_white_24px.svg',
    '/images/ic_refresh_white_24px.svg',
    '/images/partly-cloudy.png',
    '/images/rain.png',
    '/images/scattered-showers.png',
    '/images/sleet.png',
    '/images/snow.png',
    '/images/thunderstorm.png',
    '/images/wind.png'
];

self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(version).then(function(cache) {
            console.log('[Service Worker]caching.....');
            return cache.addAll(thingsToCache);
        })
    );
});

self.addEventListener('activate', function(event){
    event.waitUntil(
        caches.keys().then(function(keylist) {
            return Promise.all(keylist.map(function(key){
                if(key != version && key != dcache){
                    console.log("wipe old record");
                    return caches.delete(key);
                }
            }));
        })
    );
});


self.addEventListener('fetch',function(event) {
    console.log("Fetching ....");
    
    if(event.request.url.startsWith(weatherAPIUrlBase)){
        event.respondWith(
            fetch(event.request).then(function(response) {
                return caches.open(dcache).then(function(cache){
                    console.log("add to dcache");
                    cache.put(event.request.url, response.clone());
                    return response;
                })
            })
        );
    }
    
    else{
        event.respondWith(
        caches.match(event.request).then(function(response) {
            return response || fetch(event.request).then(function(webResponse) {
                return caches.open(version).then(function(cache){
                    console.log('new response found, saving in cache')
                    cache.put(event.request, webResponse.clone());
                    return webResponse
                    })
                })
            })
        );
    }
});
