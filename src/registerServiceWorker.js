/* eslint-disable */

import {
    register
} from 'register-service-worker'
//const shouldRegister = true;
const shouldRegister = process.env.NODE_ENV === 'production';

function notifyUpdateFound() {
    try {
        if (window.vm) {
            window.vm.$store.dispatch('app/wsUpdateFound');
        }
    } catch (ex) {}
}

function notifyUpdated() {
    try {
        if (window.vm) {
            window.vm.$store.dispatch('app/wsUpdated');
        }
    } catch (ex) {}
}

if (shouldRegister) {
    register(`${process.env.BASE_URL}service-worker.js`, {
        ready() {

            console.log(
                'App is being served from cache by a service worker.'
            )
        },

        registered() {
            console.log('Service worker has been registered.')
        },
        cached() {
            console.log('Content has been cached for offline use.')
        },
        updatefound() {
            notifyUpdateFound();
            console.log('New content is downloading.')
        },
        updated() {
            notifyUpdated();
            console.log('New content is available; please refresh.')
        },
        offline() {
            console.log('No internet connection found. App is running in offline mode.')
        },
        error(error) {
            console.error('Error during service worker registration:', error)
        }
    })
}