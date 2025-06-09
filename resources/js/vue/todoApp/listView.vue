<template>
    <div class="list-container">
        <div v-for="(item, index) in items" :key="index" class="list-item-wrapper">
            <list-item :item="item" class="item" v-on:itemChanged="$emit('reloadList')" />
        </div>
    </div>
</template>
<script>
import listItem from './listItem.vue';
export default {
    props: ['items'],
    components: {
        listItem
    },

}
</script>
<style scoped>
.list-container {
    display: flex;
    flex-direction: column;
    gap: 5px;
}


.item {
    padding: 5px;
    margin-top: 5px;
    border-bottom: 1px solid #ccc;
}


/* Responsiveness design */
@media (max-width: 480px) {
    .list-container {
        gap: 10px;
    }

    .item {
        padding: 10px;
        margin-top: 10px;
    }
}
</style>