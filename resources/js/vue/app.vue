<template>
    <div class="todoListContainer">
        <div class="heading">
            <h2 id="title">
                Todo list
                <add-item-form
                v-on:reloadList="getList()"
                />

            </h2>
        </div>
        <list-view :items="items"
        v-on:reloadList="getList()"
        />
    </div>
</template>
<script>
import addItemForm from './addItemForm.vue';
import listView from './listView.vue';
export default {
    components: {
        addItemForm,
        listView
    },
      data() {
        return {
            items: []
        }
    },
    methods: {
        async getList() {
            try {
                const response = await fetch(
                    'api/items', {
                    method: 'GET',
                    headers: {
                        'Content-Type':'application/json'

                    }
            }
                )
                if (response.ok) {
                    const data=await response.json();
                    this.items = data;
                }
            } catch (error) {
                console.error('Fetch failed', error.stack)
            }

        }
    },
    created(){
        this.getList();
    }
    
}
</script>
<style scoped>
.todoListContainer {
    width: 350px;
    margin: auto;
}

.heading {
    background: #e6e6e6;
    padding: 10px;
}

#title {
    text-align: center;
}
</style>