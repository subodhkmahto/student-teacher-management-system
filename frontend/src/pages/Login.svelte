<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import { isEmail, isRequired, minLength } from '../../../shared/validation.js';
  import { authStore } from '../stores/auth';
 

  const dispatch = createEventDispatcher();

  let email = '';
  let password = '';
  let error = '';
  let loading = false;
  let success = '';

  export let message = '';

  onMount(() => {
    if (message) {
      success = message;
    }
  });


  let mode = 'login'; 
  // login | resend | forgot

  const clearMessages = () => {
    error = '';
    success = '';
  };

  const autoClearSuccess = () => {
    setTimeout(() => {
      success = '';
    }, 4000);
  };

  //  Validate login form
  const validateLogin = () => {
    if (!isRequired(email)) {
      return 'Email is required';
    }
    if (!isEmail(email)) {
      return 'Please enter a valid email address';
    }
    if (!isRequired(password)) {
      return 'Password is required';
    }
    if (!minLength(password, 6)) {
      return 'Password must be at least 6 characters';
    }
    return null;
  };

  //  Validate email-only forms (resend, forgot)
  const validateEmail = () => {
    if (!isRequired(email)) {
      return 'Email is required';
    }
    if (!isEmail(email)) {
      return 'Please enter a valid email address';
    }
    return null;
  };

  const handleLogin = async () => {
    clearMessages();

    //  Validate form
    const validationError = validateLogin();
    if (validationError) {
      error = validationError;
      return;
    }

    loading = true;

    try {
      await authStore.login(email, password);
      dispatch('page-change', 'dashboard');
    } catch (err) {
      error = err.message || 'Login failed. Please check your credentials.';
    } finally {
      loading = false;
    }
  };

  const resendVerification = async () => {
    clearMessages();

    //  Validate email
    const validationError = validateEmail();
    if (validationError) {
      error = validationError;
      return;
    }

    loading = true;

    try {
      await authStore.resendVerificationEmail(email);
      success = 'Verification email sent successfully!';
      autoClearSuccess();
      mode = 'login';
    } catch (err) {
      error = err.message || 'Failed to send verification email.';
    } finally {
      loading = false;
    }
  };

  const handleForgotPassword = async () => {
    clearMessages();

    //  Validate email
    const validationError = validateEmail();
    if (validationError) {
      error = validationError;
      return;
    }

    loading = true;

    try {
      await authStore.forgotPassword(email);
      success = 'A password reset link has been sent to your email. Please check your inbox.';
      autoClearSuccess();
      mode = 'login';
    } catch (err) {
      error = err.message || 'Failed to send reset email.';
    } finally {
      loading = false;
    }
  };

  const handleRegisterClick = () => {
    dispatch('page-change', 'register');
  };

  //  Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (mode === 'login') {
        handleLogin();
      } else if (mode === 'resend') {
        resendVerification();
      } else if (mode === 'forgot') {
        handleForgotPassword();
      }
    }
  };

  //  Real-time validation feedback
  $: emailError = email && !isEmail(email) ? 'Invalid email format' : '';
  $: passwordError = mode === 'login' && password && !minLength(password, 6) ? 'Password must be at least 6 characters' : '';
</script>

<div class="login-container">
  <div class="login-card">
    <h1>School Management</h1>

    <h2>
      {mode === 'login'
        ? 'Sign In'
        : mode === 'resend'
        ? 'Resend Verification'
        : 'Reset Password'}
    </h2>

    {#if error}
      <div class="error-message">{error}</div>
    {/if}

    {#if success}
      <div class="success-message">{success}</div>
    {/if}

    <!-- EMAIL -->
    <div class="form-group">
      <label for="email">Email</label>
      <input
        id="email"
        type="email"
        bind:value={email}
        on:keypress={handleKeyPress}
        placeholder="Enter your email"
        required
        disabled={loading}
        class:input-error={emailError}
      />
      {#if emailError}
        <span class="field-error">{emailError}</span>
      {/if}
    </div>

    <!-- PASSWORD (LOGIN ONLY) -->
    {#if mode === 'login'}
      <div class="form-group">
        <label for="password">Password</label>
        <input
          id="password"
          type="password"
          bind:value={password}
          on:keypress={handleKeyPress}
          placeholder="Enter your password"
          required
          disabled={loading}
          class:input-error={passwordError}
        />
        {#if passwordError}
          <span class="field-error">{passwordError}</span>
        {/if}
      </div>
    {/if}

    <!-- ACTION BUTTONS -->
    {#if mode === 'login'}
      <button
        class="btn-primary"
        on:click={handleLogin}
        disabled={loading}
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </button>

    {:else if mode === 'resend'}
      <button
        class="btn-primary"
        on:click={resendVerification}
        disabled={loading}
      >
        {loading ? 'Sending...' : 'Send Verification Email'}
      </button>

    {:else if mode === 'forgot'}
      <button
        class="btn-primary"
        on:click={handleForgotPassword}
        disabled={loading}
      >
        {loading ? 'Sending...' : 'Send Reset Link'}
      </button>
    {/if}

    <!-- LINKS -->
    {#if mode === 'login'}
      <p class="signup-link">
        Didn't receive verification email?
        <button
          class="link-button"
          on:click={() => (mode = 'resend')}
        >
          Resend Email
        </button>
      </p>

      <p class="signup-link">
        Forgot your password?
        <button
          class="link-button"
          on:click={() => (mode = 'forgot')}
        >
          Reset Password
        </button>
      </p>
    {/if}

    {#if mode !== 'login'}
      <p class="signup-link">
        <button
          class="link-button"
          on:click={() => (mode = 'login')}
        >
          Back to Sign In
        </button>
      </p>
    {/if}

    <p class="signup-link">
      Don't have an account?
      <button
        class="link-button"
        on:click={handleRegisterClick}
      >
        Sign up
      </button>
    </p>
  </div>
</div>

<style>
  .login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: linear-gradient(
      135deg,
      var(--primary) 0%,
      #60a5fa 100%
    );
  }

  .login-card {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;
  }

  h1 {
    font-size: 1.5rem;
    color: var(--primary);
    text-align: center;
  }

  h2 {
    text-align: center;
    margin-bottom: 1.5rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    margin-bottom: 1rem;
  }

  label {
    font-size: 0.875rem;
    margin-bottom: 0.5rem;
  }

  input {
    padding: 0.75rem;
    border: 1px solid var(--border);
    border-radius: 4px;
    font-size: 1rem;
    transition: border-color 0.2s;
  }

  input:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  input:disabled {
    background: #f3f4f6;
    cursor: not-allowed;
  }

  /*  Error styling for input fields */
  .input-error {
    border-color: #dc2626 !important;
  }

  .input-error:focus {
    box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1) !important;
  }

  /*  Field-level error messages */
  .field-error {
    color: #dc2626;
    font-size: 0.75rem;
    margin-top: 0.25rem;
  }

  .btn-primary {
    background: var(--primary);
    color: white;
    padding: 0.75rem;
    border: none;
    border-radius: 4px;
    width: 100%;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 500;
    transition: background 0.2s;
  }

  .btn-primary:hover:not(:disabled) {
    background: #2563eb;
  }

  .btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .signup-link {
    text-align: center;
    font-size: 0.875rem;
    margin-top: 1rem;
  }

  .link-button {
    background: none;
    border: none;
    color: var(--primary);
    cursor: pointer;
    text-decoration: underline;
    font-size: 0.875rem;
  }

  .link-button:hover {
    color: #2563eb;
  }

  .error-message {
    background: #fee2e2;
    color: #dc2626;
    padding: 0.75rem;
    border-radius: 4px;
    margin-bottom: 1rem;
  }

  .success-message {
    background: #d1fae5;
    color: #065f46;
    padding: 0.75rem;
    border-radius: 4px;
    margin-bottom: 1rem;
  }
</style>