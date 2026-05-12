self.addEventListener('fetch', (event) => {
    // Ce script permet à l'app de fonctionner même avec une connexion instable
    console.log('Service Worker actif sur : ', event.request.url);
});
