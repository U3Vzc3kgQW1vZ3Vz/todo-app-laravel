
import { createApp } from 'vue'
import app from './vue/app.vue'
import router from './routes.js';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faPlusSquare,faTrash,faPencil,faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';


const BASE_URL = 'http://localhost:8000';
const originalFetch=window.fetch;
/**
 * Custom fetch wrapper to handle common configurations like
 * withCredentials, headers, CSRF token, and error handling.
 *
 * @param {string} url The URL to fetch.
 * @param {Object} options Fetch options (method, headers, body, etc.).
 * @returns {Promise<Response>} The fetch response.
 */
async function authenticatedFetch(url, options = {}) {
    options.credentials = 'include'; 

    options.headers = {
        'X-Requested-With': 'XMLHttpRequest',
        ...options.headers, 
    };

    const method = options.method ? options.method.toUpperCase() : 'GET';
    const isMutatingMethod = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

    
    if (isMutatingMethod) {
        try {
            
            await originalFetch(`${BASE_URL}/sanctum/csrf-cookie`, { credentials: 'include' });
        } catch (error) {
            console.error('Failed to obtain CSRF cookie before mutating request:', error);
            
            throw new Error('Failed to obtain CSRF cookie. Please try again.');
        }
    }

    
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

    if (csrfToken) {
        options.headers['X-CSRF-TOKEN'] = csrfToken;
    } else {
        console.warn('CSRF meta tag not found. Request might fail.');
        
    }
    
    try {
        const response = await originalFetch(`${BASE_URL}${url}`, options);

        // Handle authentication errors (401)
        if (response.status === 401) {
            window.dispatchEvent(new CustomEvent('auth:logout'));
            throw new Error('Unauthorized');
        }

        return response;
    } catch (error) {
        console.error('Fetch error for URL:', url, error);
        return Promise.reject(error);
    }
}


window.fetch = authenticatedFetch;

library.add(faPlusSquare,faTrash,faPencil,faCheck);

const vueApp = createApp(app)

vueApp.use(router);
vueApp.component('font-awesome-icon',FontAwesomeIcon);

// Global error handler
vueApp.config.errorHandler = (err, vm, info) => {
    console.error('Vue error:', err, info)
}

vueApp.mount('#app')