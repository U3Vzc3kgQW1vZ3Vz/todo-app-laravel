<template>
  <div id="app">
    <!-- Authentication Forms -->
    <div v-if="!isAuthenticated" class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <h1>{{ isLogin ? 'Login' : 'Register' }}</h1>
          <p>{{ isLogin ? 'Welcome back!' : 'Create your account' }}</p>
        </div>

        <form @submit.prevent="handleAuth" class="auth-form">
          <!-- Name field for registration -->
          <div v-if="!isLogin" class="form-group">
            <label for="name">Full Name</label>
            <input
              id="name"
              type="text"
              v-model="formData.name"
              required
              :disabled="loading"
              placeholder="Enter your full name"
            />
          </div>

          <!-- Email field -->
          <div class="form-group">
            <label for="email">Email Address</label>
            <input
              id="email"
              type="email"
              v-model="formData.email"
              required
              :disabled="loading"
              placeholder="Enter your email"
            />
          </div>

          <!-- Password field -->
          <div class="form-group">
            <label for="password">Password</label>
            <div class="password-input">
              <input
                id="password"
                :type="showPassword ? 'text' : 'password'"
                v-model="formData.password"
                required
                :disabled="loading"
                :placeholder="isLogin ? 'Enter your password' : 'Choose a password'"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="password-toggle"
                :disabled="loading"
              >
                👁️
              </button>
            </div>
          </div>

          <!-- Confirm Password for registration -->
          <div v-if="!isLogin" class="form-group">
            <label for="password_confirmation">Confirm Password</label>
            <input
              id="password_confirmation"
              type="password"
              v-model="formData.password_confirmation"
              required
              :disabled="loading"
              placeholder="Confirm your password"
            />
          </div>

          <!-- Error message -->
          <div v-if="error" class="error-message">
            {{ error }}
          </div>

          <!-- Success message -->
          <div v-if="success" class="success-message">
            {{ success }}
          </div>

          <!-- Submit button -->
          <button type="submit" class="auth-button" :disabled="loading">
            <span v-if="loading">⏳ Processing...</span>
            <span v-else>{{ isLogin ? 'Login' : 'Register' }}</span>
          </button>
        </form>

        <!-- Toggle between login/register -->
        <div class="auth-toggle">
          <p v-if="isLogin">
            Don't have an account?
            <button @click="toggleAuthMode" class="toggle-button">Register here</button>
          </p>
          <p v-else>
            Already have an account?
            <button @click="toggleAuthMode" class="toggle-button">Login here</button>
          </p>
        </div>
      </div>
    </div>

    <!-- Todo App (shown when authenticated) -->
    <div v-else class="todo-container">
      <div class="todo-header">
        <h1>My Todo List</h1>
        <button @click="logout" class="logout-button">Logout</button>
      </div>

      <!-- Add new item -->
      <div class="add-item-form">
        <input
          v-model="newItemName"
          @keyup.enter="addItem"
          placeholder="Add a new todo item..."
          class="new-item-input"
        />
        <button @click="addItem" :disabled="!newItemName.trim()" class="add-button">
          Add Item
        </button>
      </div>

      <!-- Todo items list -->
      <div class="items-list">
        <div v-if="loadingItems" class="loading">Loading items...</div>
        <div v-else-if="items.length === 0" class="no-items">
          No todo items yet. Add one above!
        </div>
        <todo-item
          v-else
          v-for="item in items"
          :key="item.id"
          :item="item"
          @itemChanged="fetchItems"
        />
      </div>
    </div>
  </div>
</template>

<script>

export default {
  
  data() {
    return {
      isAuthenticated: false,
      isLogin: true,
      loading: false,
      loadingItems: false,
      showPassword: false,
      error: '',
      success: '',
      authToken: null,
      user: null,
      
      // Form data
      formData: {
        name: '',
        email: '',
        password: '',
        password_confirmation: ''
      },

      // Todo app data
      items: [],
      newItemName: ''
    }
  },

  mounted() {
    // Check if user is already authenticated
    this.checkAuthStatus();
  },

  methods: {
    async checkAuthStatus() {
      const token = localStorage.getItem('auth_token');
      if (token) {
        this.authToken = token;
        try {
          await this.fetchUser();
          this.isAuthenticated = true;
          await this.fetchItems();
        } catch (error) {
          // Token is invalid, remove it
          localStorage.removeItem('auth_token');
          this.authToken = null;
        }
      }
    },

    async fetchUser() {
      const response = await fetch('/api/user', {
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }

      this.user = await response.json();
    },

    async handleAuth() {
      this.loading = true;
      this.error = '';
      this.success = '';

      try {
        // Get CSRF token first
        await fetch('/sanctum/csrf-cookie');

        const endpoint = this.isLogin ? '/api/login' : '/api/register';
        const payload = this.isLogin 
          ? { 
              email: this.formData.email, 
              password: this.formData.password 
            }
          : {
              name: this.formData.name,
              email: this.formData.email,
              password: this.formData.password,
              password_confirmation: this.formData.password_confirmation
            };

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          },
          credentials: 'same-origin',
          body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok) {
          if (this.isLogin) {
            // Login successful
            this.authToken = data.token;
            localStorage.setItem('auth_token', data.token);
            this.user = data.user;
            this.isAuthenticated = true;
            this.success = 'Login successful!';
            await this.fetchItems();
          } else {
            // Registration successful
            this.success = 'Registration successful! Please login.';
            this.isLogin = true;
            this.resetForm();
          }
        } else {
          // Handle validation errors
          if (data.errors) {
            const errorMessages = Object.values(data.errors).flat();
            this.error = errorMessages.join(', ');
          } else {
            this.error = data.message || 'An error occurred';
          }
        }
      } catch (error) {
        console.error('Auth error:', error);
        this.error = 'Network error. Please try again.';
      }

      this.loading = false;
    },

    async fetchItems() {
      this.loadingItems = true;
      try {
        const response = await fetch('/api/items', {
          headers: {
            'Authorization': `Bearer ${this.authToken}`,
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          this.items = await response.json();
        } else {
          console.error('Failed to fetch items');
        }
      } catch (error) {
        console.error('Error fetching items:', error);
      }
      this.loadingItems = false;
    },

    async addItem() {
      if (!this.newItemName.trim()) return;

      try {
        const response = await fetch('/api/item/store', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.authToken}`,
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            name: this.newItemName.trim(),
            completed: false
          })
        });

        if (response.ok) {
          this.newItemName = '';
          await this.fetchItems();
        } else {
          console.error('Failed to add item');
        }
      } catch (error) {
        console.error('Error adding item:', error);
      }
    },

    async logout() {
      try {
        await fetch('/api/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.authToken}`,
            'Accept': 'application/json'
          }
        });
      } catch (error) {
        console.error('Logout error:', error);
      }

      // Clear local state regardless of API response
      this.authToken = null;
      this.user = null;
      this.isAuthenticated = false;
      this.items = [];
      localStorage.removeItem('auth_token');
      this.resetForm();
    },

    toggleAuthMode() {
      this.isLogin = !this.isLogin;
      this.resetForm();
      this.error = '';
      this.success = '';
    },

    resetForm() {
      this.formData = {
        name: '',
        email: '',
        password: '',
        password_confirmation: ''
      };
    }
  }
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

#app {
    
  margin: 0 auto;
  padding: 20px;
}

/* Authentication Styles */
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #999999;
  margin: -20px;
  padding: 20px;
}

.auth-card {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-header h1 {
  color: #333;
  margin-bottom: 0.5rem;
}

.auth-header p {
  color: #666;
  margin: 0;
}

.auth-form {
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e1e5e9;
  border-radius: 5px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
}

.form-group input:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
}

.password-input {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
}

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  padding: 0.75rem;
  border-radius: 5px;
  margin-bottom: 1rem;
  border: 1px solid #f5c6cb;
}

.success-message {
  background-color: #d4edda;
  color: #155724;
  padding: 0.75rem;
  border-radius: 5px;
  margin-bottom: 1rem;
  border: 1px solid #c3e6cb;
}

.auth-button {
  width: 100%;
  padding: 0.75rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.3s ease;
}

.auth-button:hover:not(:disabled) {
  opacity: 0.9;
}

.auth-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.auth-toggle {
  text-align: center;
  color: #666;
}

.toggle-button {
  background: none;
  border: none;
  color: #667eea;
  cursor: pointer;
  text-decoration: underline;
  font-size: inherit;
}

.toggle-button:hover {
  color: #764ba2;
}

/* Todo App Styles */
.todo-container {
  padding: 2rem 0;
}

.todo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e1e5e9;
}

.todo-header h1 {
  color: #333;
  margin: 0;
}

.logout-button {
  padding: 0.5rem 1rem;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9rem;
}

.logout-button:hover {
  background-color: #c82333;
}

.add-item-form {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.new-item-input {
  flex: 1;
  padding: 0.75rem;
  border: 2px solid #e1e5e9;
  border-radius: 5px;
  font-size: 1rem;
}

.new-item-input:focus {
  outline: none;
  border-color: #667eea;
}

.add-button {
  padding: 0.75rem 1.5rem;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
}

.add-button:hover:not(:disabled) {
  background-color: #218838;
}

.add-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.items-list {
  margin-top: 1rem;
}

.loading, .no-items {
  text-align: center;
  color: #666;
  padding: 2rem;
  font-style: italic;
}

/* Responsive design */
@media (max-width: 768px) {
  .add-item-form {
    flex-direction: column;
  }
  
  .todo-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
}
</style>