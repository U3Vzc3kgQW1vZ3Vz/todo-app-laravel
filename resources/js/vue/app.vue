<template>
    <div id="todoListContainer">
        <nav class="navbar">
            <div class="nav-container">
                <h1 class="nav-title">
                    <a href="/">

                    My App
                    </a></h1>
                <div class="nav-menu">
                    <template v-if="user">
                        <span class="nav-user">Welcome, {{ user.name }}!</span>
                        <button @click="logout" class="nav-button logout-btn">Logout</button>
                    </template>
                    <template v-else>
                        <router-link to="/login" class="nav-button">Login</router-link>
                        <router-link to="/register" class="nav-button">Register</router-link>
                    </template>
                </div>
            </div>
        </nav>

        <main class="main-content">
            <div v-if="!user" class="auth-container">
                <router-view />
            </div>

            <div v-else class="dashboard">

                <div class="heading">
                    <h2 id="title">
                        Todo list
                        <add-item-form v-on:reloadList="getList()" />
                    </h2>
                </div>
                <list-view :items="items" v-on:reloadList="getList()" />

            </div>
        </main>

        <div v-if="loading" class="loading-overlay">
            <div class="loading-spinner"></div>
        </div>

        <div v-if="globalError" class="error-toast">
            {{ globalError }}
            <button @click="globalError = ''" class="error-close">&times;</button>
        </div>
    </div>
</template>
<script>
import loginView from './common/loginView.vue';
import registerView from './common/registerView.vue';
import addItemForm from './todoApp/addItemForm.vue';
import listView from './todoApp/listView.vue';
import { isAuthenticated, setAuthenticated } from '../auth.js';

export default {
    name: 'App',
    components: {
        loginView,
        registerView,
        addItemForm,
        listView,
    },
    setup() {
        const user = ref(null); // Make user a ref
        const loading = ref(false);
        const globalError = ref('');
        const items = ref([]);

        // Watch for changes in the shared isAuthenticated state
        watch(isAuthenticated, (newVal) => {
            // You might want to react to auth state changes here if needed
            // For example, trigger a refresh of user data or redirect
            if (!newVal) {
                user.value = null; // Clear user data if not authenticated
            }
        });
    },
    data() {
        return {
            user: null,
            showLogin: true,
            showRegister: false,
            loading: false,
            globalError: '',

            items: []
        }
    },
    async mounted() {
        await this.checkAuth()

        // Listen for logout events
        window.addEventListener('auth:logout', this.handleLogout)
    },
    beforeUnmount() {
        window.removeEventListener('auth:logout', this.handleLogout)
    },
    methods: {
        async getList() {
            try {
                const response = await fetch(
                    '/api/items', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'

                    }
                }
                )
                if (response.ok) {
                    const data = await response.json();
                    this.items = data;
                }
            } catch (error) {
                console.error('Fetch failed', error.stack)
            }

        },
        async checkAuth() {
            try {
                this.loading = true; 
                const response = await fetch('/api/user');
                if (!response.ok) { 
                    if (response.status === 401) {
                        
                        this.user = null;
                        return; 
                    }
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json(); 
                this.user = data;
                if (this.$route.path === '/login' || this.$route.path === '/register') {
                    console.log("test");
                    this.$router.replace('/');
                }
                this.getList();
            } catch (error) {
                this.user = null
            } finally {
                this.loading = false
            }
        },

        handleAuthSuccess(user) {
            this.user = user;
            this.showLogin = false;
            this.showRegister = false;
            this.globalError = '';

        },

        async logout() {
            try {
                this.loading = true;
                const response = await window.fetch('/api/logout', {
                    method: 'POST', 

                });
                if (!response.ok) {
                    const errorData = await response.json();
                    const error = new Error('Can\'t logout');
                    error.response = {
                        status: response.status,
                        data: errorData
                    };
                    throw error;
                }
                this.handleLogout()
            } catch (error) {
                this.globalError = 'Failed to logout. Please try again.'
            } finally {
                this.loading = false
            }
        },

        handleLogout() {
            this.user = null
            this.showLogin = true
            this.showRegister = false
            const sessionCookieName = 'todo_list_session';
            const xsrfCookieName = 'XSRF-TOKEN'; 
            document.cookie = `${sessionCookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
            document.cookie = `${xsrfCookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
            window.location.href = '/login';


        },
        created() {
            this.checkAuth();

            window.addEventListener('auth:logout', this.handleLogoutEvent);
        }
    }
}
</script>

<style scoped>
/* Global styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

#todoListContainer {
    margin: 0 auto;
    padding: 20px;
}

/* Navigation */
.navbar {
    background: #999999;
    padding: 10px;
}

.nav-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.nav-title {
    color: white;
    font-size: 1.5rem;
    font-weight: 600;
}

.nav-menu {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.nav-user {
    color: white;
    margin-right: 1rem;
}

.nav-button {
    padding: 0.5rem 1rem;
    border: 2px solid white;
    background: transparent;
    color: white;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 500;
}

.nav-button:hover {
    background: white;
    color: #999999;
}

.logout-btn {
    border-color: white;
    color: white;
}

.logout-btn:hover {
    background: #ff6b6b;
    color: white;
}

/* Main content */
.main-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
}

.auth-container {
    width: 100%;
    max-width: 400px;
}

/* Dashboard */
.dashboard {
    background: rgba(255, 255, 255, 0.95);
    padding: 2rem;
    border-radius: 10px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    text-align: center;
    width: 100%;
    max-width: 600px;
}

.dashboard h2 {
    color: #333;
    margin-bottom: 1rem;
    font-size: 2rem;
}

.user-info {
    margin-top: 2rem;
    text-align: left;
    background: #f8f9fa;
    padding: 1.5rem;
    border-radius: 8px;
}

.user-info h3 {
    color: #495057;
    margin-bottom: 1rem;
}

.user-info p {
    margin-bottom: 0.5rem;
    color: #6c757d;
}

/* Loading */
.loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

/* Error toast */
.error-toast {
    position: fixed;
    top: 20px;
    right: 20px;
    background: #dc3545;
    color: white;
    padding: 1rem;
    border-radius: 5px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    z-index: 1001;
    display: flex;
    align-items: center;
    gap: 1rem;
}

.error-close {
    background: none;
    border: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0;
    line-height: 1;
}

/* Responsive design */
@media (max-width: 768px) {
    .nav-container {
        padding: 0 1rem;
    }

    .nav-menu {
        flex-direction: column;
        gap: 0.5rem;
    }

    .main-content {
        padding: 1rem;
    }

    .dashboard {
        padding: 1.5rem;
    }
}
</style>