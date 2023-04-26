/* eslint-disable no-console */

import { register } from 'register-service-worker'

if (process.env.NODE_ENV === 'production') {
  register(`${process.env.BASE_URL}service-worker.js`, {
    ready () {
      console.log(
        'App is being served from cache by a service worker.'
      )
    },
    registered (registration) {
      console.log('Service worker has been registered.')
      setInterval(() => {
        registration.update()
      }, 1000 * 1 * 60) // e.g. daily checks
    },
    cached () {
      console.log('Content has been cached for offline use.')
    },
    updatefound () {
      // new content clear cache so user gets the new version
      // caches.keys().then(cacheNames => {
      //   cacheNames.forEach(cacheName => {
      //     caches.delete(cacheName)
      //   })
      // })
      console.log('New content is downloading.')
    },
    updated (registration) {
      console.log('New content is available: Please refresh.')
      document.dispatchEvent(
        new CustomEvent('swUpdated', { detail: registration })
      )
    },
    offline () {
      console.log('No internet connection found. App is running in offline mode.')
    },
    error (error) {
      console.error('Error during service worker registration:', error)
    }
  })
}
