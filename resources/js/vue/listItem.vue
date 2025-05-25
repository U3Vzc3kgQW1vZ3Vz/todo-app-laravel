<template>
  <div class="item">
    <input 
      type="checkbox"
      @change="updateCheck"
      v-model="item.completed"
    />
    
    <input
      v-if="editable"
      :class="['itemText', { completed: item.completed }]"
      v-model="localItem.name"
      @input="emitUpdate"
      @keyup.enter="editItem"
      @keyup.escape="cancelEdit"
      ref="editInput"
    />
    
    <span
      v-else
      :class="['itemText', { completed: item.completed }]"
    >
      {{ item.name }}
    </span>

    <div class="button-group">
      <button
        @click="changeEditStatus"
        class="edit"
        :disabled="editable"
        title="Edit item"
      >
        <font-awesome-icon icon="pencil"/>
      </button>

      <button
        v-if="editable"
        @click="editItem"
        class="check"
        title="Save changes"
      >
        <font-awesome-icon icon="check"/>
      </button>

      <button
        v-if="editable"
        @click="cancelEdit"
        class="cancel"
        title="Cancel editing"
      >
        <font-awesome-icon icon="times"/>
      </button>

      <button
        @click="removeItem"
        class="trashcan"
        :disabled="editable"
        title="Delete item"
      >
        <font-awesome-icon icon="trash"/>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TodoItem',
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  emits: ['update:item', 'itemChanged'],
  data() {
    return {
      editable: false,
      localItem: { ...this.item },
      originalItem: null
    }
  },
  watch: {
    item: {
      handler(newVal) {
        if (!this.editable) {
          this.localItem = { ...newVal };
        }
      },
      deep: true
    }
  },
  methods: {
    emitUpdate() {
      this.$emit('update:item', this.localItem);
    },

    async updateCheck() {
      try {
        // Create updated item with the new completed status
        const updatedItem = {
          ...this.item,
          completed: this.item.completed
        };

        const response = await fetch(`api/item/${this.item.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            item: updatedItem
          })
        });

        if (response.ok) {
          this.$emit('itemChanged');
        } else {
          console.error('Failed to update item:', response.statusText);
          // Note: The checkbox state will be reverted by the parent component
          // when it refreshes the data after receiving itemChanged event
        }
      } catch (error) {
        console.error("Update check error:", error);
        // Note: The checkbox state will be reverted by the parent component
        // when it refreshes the data after receiving itemChanged event
      }
    },

    async removeItem() {
      if (!confirm('Are you sure you want to delete this item?')) {
        return;
      }

      try {
        const response = await fetch(`api/item/${this.item.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          this.$emit('itemChanged');
        } else {
          console.error('Failed to delete item:', response.statusText);
        }
      } catch (error) {
        console.error("Delete error:", error);
      }
    },

    async editItem() {
      if (!this.localItem.name.trim()) {
        alert('Item name cannot be empty');
        return;
      }

      try {
        // Create updated item with the new name but keeping other properties
        const updatedItem = {
          ...this.item,
          name: this.localItem.name
        };

        const response = await fetch(`api/item/${this.item.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            item: updatedItem
          })
        });

        if (response.ok) {
          this.$emit('itemChanged');
          this.editable = false;
          this.originalItem = null;
        } else {
          console.error('Failed to edit item:', response.statusText);
        }
      } catch (error) {
        console.error("Edit error:", error);
      }
    },

    changeEditStatus() {
      this.editable = true;
      this.originalItem = { ...this.localItem };
      
      // Focus the input after Vue updates the DOM
      this.$nextTick(() => {
        if (this.$refs.editInput) {
          this.$refs.editInput.focus();
          this.$refs.editInput.select();
        }
      });
    },

    cancelEdit() {
      this.editable = false;
      // Restore original values
      if (this.originalItem) {
        this.localItem = { ...this.originalItem };
        this.originalItem = null;
      }
    }
  }
}
</script>

<style scoped>
.item {
  display: flex;
  align-items: center;
  padding: 8px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  margin-bottom: 4px;
  background-color: #fff;
  transition: background-color 0.2s ease;
}

.item:hover {
  background-color: #f9f9f9;
}

.itemText {
  flex: 1;
  margin: 0 12px;
  padding: 4px 8px;
  border: none;
  background: transparent;
  font-size: 14px;
  line-height: 1.4;
}

.itemText.completed {
  text-decoration: line-through;
  color: #999999;
}

input.itemText {
  border: 1px solid #ddd;
  border-radius: 3px;
  background-color: #fff;
}

input.itemText:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.button-group {
  display: flex;
  gap: 4px;
}

button {
  padding: 6px 8px;
  border: 1px solid #ddd;
  border-radius: 3px;
  background: #f8f9fa;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 12px;
}

button:hover:not(:disabled) {
  background: #e9ecef;
  border-color: #adb5bd;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.trashcan {
  color: #dc3545;
}

.trashcan:hover:not(:disabled) {
  background: #dc3545;
  color: white;
  border-color: #dc3545;
}

.edit {
  color: #6c757d;
}

.edit:hover:not(:disabled) {
  background: #6c757d;
  color: white;
  border-color: #6c757d;
}

.check {
  color: #28a745;
}

.check:hover {
  background: #28a745;
  color: white;
  border-color: #28a745;
}

.cancel {
  color: #6c757d;
}

.cancel:hover {
  background: #6c757d;
  color: white;
  border-color: #6c757d;
}

input[type="checkbox"] {
  margin-right: 8px;
  transform: scale(1.1);
}
</style>