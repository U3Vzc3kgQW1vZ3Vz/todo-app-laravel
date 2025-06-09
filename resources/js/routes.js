import { createRouter, createWebHistory } from 'vue-router';
import listView from './vue/todoApp/listView.vue';
import loginView from './vue/common/loginView.vue'; 
import registerView from './vue/common/registerView.vue'; 
const routes = [
    {
        path: '/',
        name: 'home',
        component: listView,
        meta:{requiresAuth:true}
    },
    {
        path: '/login',
        name: 'login',
        component: loginView,
        meta:{guestOnly:true}
    },
    {
        path: '/register',
        name: 'register',
        component: registerView,
        meta:{guestOnly:true}
    },
];

const router = createRouter({
    history: createWebHistory(), 
    routes,
});

export default router;