import { ref } from 'vue';

export const isAuthenticated = ref(false); 

export const setAuthenticated = (status) => {
    isAuthenticated.value = status;
};