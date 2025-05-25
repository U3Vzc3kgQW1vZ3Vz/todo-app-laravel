import { createApp } from 'vue';
import App from './vue/app.vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faPlusSquare,faTrash,faPencil,faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

library.add(faPlusSquare,faTrash,faPencil,faCheck);
const app=createApp(App);
app.component('font-awesome-icon',FontAwesomeIcon);

app.mount('#app');
