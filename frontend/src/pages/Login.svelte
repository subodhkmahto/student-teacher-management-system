<script>
  import { authStore } from '../stores/auth';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  let email = '';
  let password = '';
  let error = '';
  let loading = false;

  const handleLogin = async () => {
    error = '';
    loading = true;
    try {
      await authStore.login(email, password);
      dispatch('page-change', 'dashboard');
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  };

  const handleRegisterClick = () => {
    dispatch('page-change', 'register');
  };

  const viewPassword = () => {
    const passwordInput = document.getElementById('password');
    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
    } else {
      passwordInput.type = 'password';
    }
  };
  
</script>

<div class="login-container">
  <div class="login-card">
    <h1>School Management</h1>
    <h2>Sign In</h2>

    {#if error}
      <div class="error-message">{error}</div>
    {/if}

    <form on:submit|preventDefault={handleLogin}>
      <div class="form-group">
        <label for="email">Email</label>
        <input
          id="email"
          type="email"
          bind:value={email}
          placeholder="Enter your email"
          required
          disabled={loading}
        />
      </div>

      <div class="form-group">
        <label for="password">Password</label>
        <input
          id="password"
          type="password"
          bind:value={password}
          placeholder="Enter your password"
          required
          disabled={loading}
          on:click={viewPassword}
        />
      </div>

      <button type="submit" class="btn-primary" disabled={loading}>
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>

    <p class="signup-link">
      Don't have an account?
      <button type="button" on:click={handleRegisterClick} class="link-button">
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
    background: linear-gradient(135deg, var(--primary) 0%, #60a5fa 100%);
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
    margin-bottom: 0.5rem;
    text-align: center;
  }

  h2 {
    font-size: 1.25rem;
    color: var(--text-dark);
    margin-bottom: 1.5rem;
    text-align: center;
  }

  .error-message {
    background: #fee2e2;
    color: #dc2626;
    padding: 0.75rem;
    border-radius: 4px;
    margin-bottom: 1rem;
    font-size: 0.875rem;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
  }

  label {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-dark);
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

  .btn-primary {
    background: var(--primary);
    color: white;
    padding: 0.75rem;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
  }

  .btn-primary:hover:not(:disabled) {
    background: #2563eb;
  }

  .btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .signup-link {
    text-align: center;
    font-size: 0.875rem;
    color: var(--text-light);
    margin-top: 1rem;
  }

  .link-button {
    background: none;
    border: none;
    color: var(--primary);
    cursor: pointer;
    font-weight: 500;
    text-decoration: underline;
    padding: 0;
  }

  .link-button:hover {
    color: #2563eb;
  }
</style>
