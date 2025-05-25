<template>
    <div class="item">
        <input type="checkbox" 
        @change="updateCheck()"
        v-model="item.completed"
        />
        <span
        :class="[item.completed?'completed':'','itemText']"
        >
            {{ item.name }}
        </span>
        <button
        @click="removeItem()" class="trashcan"
        >
        <font-awesome-icon icon="trash" />
        </button>
    </div>
</template>
<script>
export default {
props:['item'],
methods:{
    async updateCheck(){
        try{

        const response= await fetch('api/item/'+this.item.id,{
            method:'PUT',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify({
                item:this.item
            })
        }

        );

        if(response.ok){
            this.$emit('itemChanged')
        }
        }catch(error){
            console.error("Fetch error:",error.stack)

        }
    },
    async removeItem(){
        try{
                    const response= await fetch('api/item/'+this.item.id,{
            method:'DELETE',
            headers:{
                'Content-Type':'application/json'
            },
        }

        );

        if(response.ok){
            this.$emit('itemChanged')
        }

        }catch(error){
            console.error("Fetch error:",error.stack)
        }
    }
}
}
</script>
<style
scoped
>
.completed{
    text-decoration: line-through;
    color: #999999;
}
.itemText{
    width: 100%;
    margin-left:20px ;
}
.item{
    display: flex;
    justify-content: center;
    align-items: center;
}
.trashcan{
    background: #e6e6e6;
    border: none;
    color: #ff0000;
    outline: none;
}
</style>