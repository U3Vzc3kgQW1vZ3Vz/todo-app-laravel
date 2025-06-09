<template>
  <div class="auth-form">
    <div class="form-header">
      <h2>Welcome Back</h2>
      <p>Please sign in to your account</p>
    </div>

    <form @submit.prevent="login" class="form">
      <div class="form-group">
        <label for="email" class="form-label">Email Address</label>
        <input
          id="email"
          v-model="form.email"
          type="email"
          class="form-input"
          :class="{ 'error': errors.email }"
          placeholder="Enter your email"
          required
          autocomplete="email"
        >
        <span v-if="errors.email" class="error-message">{{ errors.email[0] }}</span>
      </div>
      <div class="form-group">
        <label for="password" class="form-label">Password</label>
        <div class="password-input-container">
          <input
            id="password"
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            class="form-input"
            :class="{ 'error': errors.password }"
            placeholder="Enter your password"
            required
            autocomplete="current-password"
          >
          <button
            type="button"
            @click="showPassword = !showPassword"
            class="password-toggle"
          >
            {{ showPassword ? '👁️' : '👁️‍🗨️' }}
          </button>
        </div>
        <span v-if="errors.password" class="error-message">{{ errors.password[0] }}</span>
      </div>

      <button
        type="submit"
        :disabled="loading"
        class="submit-button"
      >
        <span v-if="loading" class="button-spinner"></span>
        {{ loading ? 'Signing in...' : 'Sign In' }}
      </button>

      <div v-if="generalError" class="general-error">
        {{ generalError }}
      </div>
    </form>

    <div class="form-footer">
      <p>
        Don't have an account?
        <a href="/register" class="link-button">
Sign up here
        </a>
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoginForm',
  emits: ['success', 'switch-to-register'],
  data() {
    return {
      form: {
        email: '',
        password: '',
        remember: false
      },
      errors: {},
      generalError: '',
      loading: false,
      showPassword: false
    }
  },
  methods: {
        async login() {
        try {
            this.loading = true;
            this.errors = {};
            this.generalError = '';

            
            const loginResponse = await window.fetch('/api/login', {
                method: 'POST', 
                headers: {
                    'Content-Type': 'application/json',
                   },
                body: JSON.stringify({ 
                    email: this.form.email,
                    password: this.form.password,
                    
                })
            });

            
            if (!loginResponse.ok) {
              
                const errorData = await loginResponse.json();
                
                const error = new Error('Login failed with HTTP status ' + loginResponse.status);
                error.response = { 
                    status: loginResponse.status,
                    data: errorData
                };
                throw error; 
              }

            const userResponse = await window.fetch('/api/user');

            if (!userResponse.ok) {
                const errorData = await userResponse.json();
                const error = new Error('Failed to fetch user data after successful login');
                error.response = {
                    status: userResponse.status,
                    data: errorData
                };
                throw error;
            }

            const userData = await userResponse.json(); 
            this.$emit('success', userData);

            
            this.resetForm();
            window.location.href='/';

        } catch (error) {
            console.error('Login error:', error); 
            if (error.response?.status === 422) {
                this.errors = error.response.data.errors || {};
                this.generalError = 'Please check your input for errors.';
            } else if (error.response?.status === 401) {
                this.generalError = 'Invalid email or password. Please try again.';
               } else if (error.response) {
                this.generalError = error.response.data?.message || 'An error occurred during login. Please try again later.';
            } else {
                this.generalError = 'Login failed due to a network issue or an unexpected error. Please try again.';
            }
        } finally {
            this.loading = false;
          }
    },

    resetForm() {
      this.form = {
        email: '',
        password: '',
        remember: false
      }
      this.errors = {}
      this.generalError = ''
      this.showPassword = false
    }
  }
}
</script>

<style scoped>
/* Login form */
.auth-form {
  background: rgba(255, 255, 255, 0.95);
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.form-header {
  text-align: center;
  margin-bottom: 2rem;
}

.form-header h2 {
  color: #333;
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.form-header p {
  color: #666;
  font-size: 0.9rem;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  color: #333;
  font-weight: 500;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.form-input {
  padding: 0.75rem;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input.error {
  border-color: #dc3545;
}

.password-input-container {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  color: #666;
  padding: 0;
}


.submit-button {
  background: #999999;
  color: white;
  border: none;
  padding: 0.875rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
}

.submit-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.button-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-message {
  color: #dc3545;
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

.general-error {
  background: #f8d7da;
  color: #721c24;
  padding: 0.75rem;
  border-radius: 5px;
  border: 1px solid #f5c6cb;
  font-size: 0.9rem;
  text-align: center;
}

.form-footer {
  text-align: center;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e1e5e9;
}

.form-footer p {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.link-button {
  background: none;
  border: none;
  color: #667eea;
  text-decoration: underline;
  cursor: pointer;
  font-size: inherit;
}

.link-button:hover {
  color: #5a67d8;
}

/* Responsive design */
@media (max-width: 480px) {
  .auth-form {
    padding: 1.5rem;
  }
  
  .form-header h2 {
    font-size: 1.5rem;
  }
}
</style>