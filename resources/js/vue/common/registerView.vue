<template>
  <div class="auth-form">
    <div class="form-header">
      <h2>Create Account</h2>
      <p>Join us today and get started</p>
    </div>

    <form @submit.prevent="register" class="form">
      
      <div class="form-group">
        <label for="name" class="form-label">Full Name</label>
        <input
          id="name"
          v-model="form.name"
          type="text"
          class="form-input"
          :class="{ 'error': errors.name }"
          placeholder="Enter your full name"
          required
          autocomplete="name"
        >
        <span v-if="errors.name" class="error-message">{{ errors.name[0] }}</span>
      </div>

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
            placeholder="Create a password"
            required
            autocomplete="new-password"
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
        
        <div class="password-strength">
          <div class="strength-bar">
            <div 
              class="strength-fill" 
              :class="passwordStrengthClass"
              :style="{ width: passwordStrengthWidth }"
            ></div>
          </div>
          <span class="strength-text">{{ passwordStrengthText }}</span>
        </div>
      </div>

      <div class="form-group">
        <label for="password_confirmation" class="form-label">Confirm Password</label>
        <div class="password-input-container">
          <input
            id="password_confirmation"
            v-model="form.password_confirmation"
            :type="showConfirmPassword ? 'text' : 'password'"
            class="form-input"
            :class="{ 'error': errors.password_confirmation || !passwordsMatch }"
            placeholder="Confirm your password"
            required
            autocomplete="new-password"
          >
          <button
            type="button"
            @click="showConfirmPassword = !showConfirmPassword"
            class="password-toggle"
          >
            {{ showConfirmPassword ? '👁️' : '👁️‍🗨️' }}
          </button>
        </div>
        <span v-if="errors.password_confirmation" class="error-message">{{ errors.password_confirmation[0] }}</span>
        <span v-else-if="form.password_confirmation && !passwordsMatch" class="error-message">
          Passwords do not match
        </span>
      </div>

   
      <button
        type="submit"
        :disabled="loading || !isFormValid"
        class="submit-button"
      >
        <span v-if="loading" class="button-spinner"></span>
        {{ loading ? 'Creating Account...' : 'Create Account' }}
      </button>

      <div v-if="generalError" class="general-error">
        {{ generalError }}
      </div>
    </form>

    <div class="form-footer">
      <p>
        Already have an account?
        <!-- <button @click="$emit('switch-to-login')" class="link-button">
          Sign in here
        </button> -->
        <a href="/login" class="link-button">
          Sign in
        </a>
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RegisterForm',
  emits: ['success', 'switch-to-login'],
  data() {
    return {
      form: {
        name: '',
        email: '',
        password: '',
        password_confirmation: ''
      },
      errors: {},
      generalError: '',
      loading: false,
      showPassword: false,
      showConfirmPassword: false
    }
  },
  computed: {
    passwordsMatch() {
      return this.form.password === this.form.password_confirmation
    },
    
    passwordStrength() {
      const password = this.form.password
      let score = 0
      
      if (password.length >= 8) score++
      if (password.length >= 12) score++
      if (/[a-z]/.test(password)) score++
      if (/[A-Z]/.test(password)) score++
      if (/[0-9]/.test(password)) score++
      if (/[^A-Za-z0-9]/.test(password)) score++
      
      return score
    },
    
    passwordStrengthClass() {
      if (this.passwordStrength <= 2) return 'weak'
      if (this.passwordStrength <= 4) return 'medium'
      return 'strong'
    },
    
    passwordStrengthWidth() {
      return `${(this.passwordStrength / 6) * 100}%`
    },
    
    passwordStrengthText() {
      if (!this.form.password) return ''
      if (this.passwordStrength <= 2) return 'Weak'
      if (this.passwordStrength <= 4) return 'Medium'
      return 'Strong'
    },
    
    isFormValid() {
      return this.form.name && 
             this.form.email && 
             this.form.password && 
             this.passwordsMatch 
    }
  },
  methods: {
      async register() {
        try {
            this.loading = true;
            this.errors = {};
            this.generalError = '';

            const response = await window.fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', 
                  },
                body: JSON.stringify({ 
                  name: this.form.name,
                    email: this.form.email,
                    password: this.form.password,
                    password_confirmation: this.form.password_confirmation
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                const error = new Error('Registration failed with HTTP status ' + response.status);
                error.response = {
                    status: response.status,
                    data: errorData
                };
                throw error; 
              }

            const userResponse = await window.fetch('/api/user');

            if (!userResponse.ok) {
                const errorData = await userResponse.json();
                const error = new Error('Failed to fetch user data after registration');
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
            console.error('Registration error:', error); 
            if (error.response?.status === 422) {
                this.errors = error.response.data.errors || {};
                this.generalError = 'Please correct the validation errors.';
            } else if (error.response) {
                this.generalError = error.response.data?.message || 'Registration failed. Please try again later.';
            } else {
                this.generalError = 'A network error occurred or registration failed. Please check your connection.';
            }
        } finally {
            this.loading = false;
          }
    },

    resetForm() {
      this.form = {
        name: '',
        email: '',
        password: '',
        password_confirmation: ''
      }
      this.errors = {}
      this.generalError = ''
      this.showPassword = false
      this.showConfirmPassword = false
    }
  }
}
</script>

<style scoped>
/* Register form */
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

.password-strength {
  margin-top: 0.5rem;
}

.strength-bar {
  width: 100%;
  height: 4px;
  background: #e1e5e9;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 0.25rem;
}

.strength-fill {
  height: 100%;
  transition: all 0.3s ease;
  border-radius: 2px;
}

.strength-fill.weak {
  background: #dc3545;
}

.strength-fill.medium {
  background: #ffc107;
}

.strength-fill.strong {
  background: #28a745;
}

.strength-text {
  font-size: 0.8rem;
  color: #666;
}

.checkbox-group {
  flex-direction: row;
  align-items: flex-start;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  cursor: pointer;
  font-size: 0.9rem;
  color: #666;
  line-height: 1.4;
}

.checkbox-input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

.checkbox-custom {
  width: 18px;
  height: 18px;
  border: 2px solid #e1e5e9;
  border-radius: 3px;
  margin-right: 0.5rem;
  margin-top: 0.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.checkbox-input:checked + .checkbox-custom {
  background: #667eea;
  border-color: #667eea;
}

.checkbox-input:checked + .checkbox-custom::after {
  content: '✓';
  color: white;
  font-size: 12px;
  font-weight: bold;
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
  
  .form {
    gap: 1.25rem;
  }
}
</style>