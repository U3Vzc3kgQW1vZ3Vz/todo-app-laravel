<template>
    <div class="addItem">
        <input type="itemText" v-model="item.name"/>
        <font-awesome-icon icon="plus-square"
        @click="addItem()"
        :class="[item.name?'active':'inactive','plus']"
        />
        
    </div>
</template>
<script>
export default {
    data:function(){
        return {
            item:{
                name:""
            }
        }
    },

    methods: {
    async addItem() {
                    if(this.item.name==''){
                return;
            }
      try {
        const response = await window.fetch('/api/item/store', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            item: {
              name: this.item.name
            }
          })
        });

        if (response.status === 201) {
          this.item.name = '';
          this.$emit('reloadList')
        } else {
          const errorData = await response.json();
          console.error('API error:', errorData);
        }
      } catch (error) {
        console.error('Fetch failed:', error.stack);
      }
    }
  }
}
</script>
<style scoped>
.addItem{
    display: flex;
    justify-content: center;
    align-items: center;
}
input{
    background: #f7f7f7;
    border: 0px;
    outline: none;
    padding: 5px;
    margin-right: 10px;
    width: 100%;
}
input.itemText:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}
input:hover{
     outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}
.plus{
    font-size: 20px;
}
.plus:hover{
    background: #6c757d;
  color: white;
  border-color: #6c757d;
}
.active{
    color: #00CE25;
}
.inactive{
    color: #999999;
}
</style>