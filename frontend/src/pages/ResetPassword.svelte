<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import { isRequired, minLength } from '../../../shared/validation.js';
  import { supabase } from '../lib/supabase';
  import { authStore } from '../stores/auth';

  const dispatch = createEventDispatcher();

  let password = '';
  let confirmPassword = '';
  let error = '';
  let success = '';
  let loading = false;
  let hasRecoveryToken = false;
  let checkingToken = true;
  let currentUserEmail = ''; // Store user email for logging

  onMount(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        error = 'Invalid or expired reset link. Please request a new one.';
        hasRecoveryToken = false;
        return;
      }

      hasRecoveryToken = true;
      currentUserEmail = session.user?.email || '';
      console.log(' Recovery session detected for:', currentUserEmail);

    } catch (err) {
      console.error(err);
      error = 'Failed to verify reset link.';
    } finally {
      checkingToken = false;
    }
  });

  const clearMessages = () => {
    error = '';
    success = '';
  };

  const validatePasswordForm = () => {
    if (!isRequired(password)) {
      return 'Password is required';
    }
    if (!minLength(password, 6)) {
      return 'Password must be at least 6 characters';
    }
    if (!isRequired(confirmPassword)) {
      return 'Please confirm your password';
    }
    if (password !== confirmPassword) {
      return 'Passwords do not match';
    }
    return null;
  };

  //  Log password reset to database
  const logPasswordReset = async (userId, email, status) => {
    try {
      const { error: logError } = await supabase
        .from('password_reset_logs')
        .insert({
          user_id: userId,
          email: email,
          status: status,
          requested_at: new Date().toISOString()
        });

      if (logError) {
        console.error(' Failed to log password reset:', logError);
      } else {
        console.log(' Password reset logged successfully');
      }
    } catch (err) {
      console.error(' Logging error:', err);
    }
  };

  const handleResetPassword = async () => {
    clearMessages();

    const validationError = validatePasswordForm();
    if (validationError) {
      error = validationError;
      return;
    }

    loading = true;

    try {
      // Get current session before updating
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      const userEmail = session?.user?.email || currentUserEmail;

      //  Update password
      await authStore.updatePassword(password);

      //  Log successful password reset
      await logPasswordReset(userId, userEmail, 'success');

      //  Logout user (important)
      await supabase.auth.signOut();

      //  Clear URL completely
      if (window.location.hash) {
        window.location.hash = '';
        window.history.replaceState(null, '', window.location.pathname);
      } else {
        window.history.replaceState(null, '', '/');
      }

      //  Redirect to login with success message
      setTimeout(() => {
        dispatch('page-change', {
          page: 'login',
          message: 'Password updated successfully. Please login with your new password.'
        });
      }, 100);

    } catch (err) {
      error = err.message || 'Failed to update password';
      console.error(' Password update error:', err);

      // Log failed password reset
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await logPasswordReset(
          session.user.id, 
          session.user.email || currentUserEmail, 
          'failed'
        );
      }
    } finally {
      loading = false;
    }
  };

  const handleBackToLogin = () => {
    if (window.location.hash) {
      window.location.hash = '';
      window.history.replaceState(null, '', window.location.pathname);
    } else {
      window.history.replaceState(null, '', '/');
    }
    
    setTimeout(() => {
      dispatch('page-change', 'login');
    }, 100);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && hasRecoveryToken) {
      handleResetPassword();
    }
  };

  $: passwordError = password && !minLength(password, 6) ? 'Password too short (min 6 characters)' : '';
  $: confirmPasswordError = confirmPassword && password !== confirmPassword ? 'Passwords do not match' : '';
</script>

<div class="reset-container">
  <div class="reset-card">
    <h1>School Management</h1>
    <h2>Reset Password</h2>

    {#if checkingToken}
      <div class="info-message">
        <div class="spinner"></div>
        <p>Verifying reset link...</p>
      </div>
    {:else}
      {#if error}
        <div class="error-message">{error}</div>
      {/if}

      {#if success}
        <div class="success-message">{success}</div>
      {/if}

      {#if hasRecoveryToken}
        <form on:submit|preventDefault={handleResetPassword}>
          <div class="form-group">
            <label for="password">New Password</label>
            <input
              id="password"
              type="password"
              bind:value={password}
              on:keypress={handleKeyPress}
              placeholder="Enter new password (min 6 characters)"
              required
              disabled={loading}
              class:input-error={passwordError}
            />
            {#if passwordError}
              <span class="field-error">{passwordError}</span>
            {/if}
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              bind:value={confirmPassword}
              on:keypress={handleKeyPress}
              placeholder="Confirm new password"
              required
              disabled={loading}
              class:input-error={confirmPasswordError}
            />
            {#if confirmPasswordError}
              <span class="field-error">{confirmPasswordError}</span>
            {/if}
          </div>

          <button type="submit" class="btn-primary" disabled={loading}>
            {loading ? 'Updating...' : 'Reset Password'}
          </button>
        </form>
      {/if}
    {/if}

    <p class="login-link">
      Remember your password?
      <button
        type="button"
        class="link-button"
        on:click={handleBackToLogin}
      >
        Back to Login
      </button>
    </p>
  </div>
</div>

<style>
  .reset-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: linear-gradient(135deg, var(--primary) 0%, #60a5fa 100%);
    padding: 1rem;
  }

  .reset-card {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
    width: 100%;
    max-width: 450px;
  }

  h1 {
    font-size: 1.75rem;
    color: var(--primary);
    text-align: center;
    margin-bottom: 0.5rem;
    font-weight: 700;
  }

  h2 {
    font-size: 1.5rem;
    text-align: center;
    margin-bottom: 2rem;
    color: var(--text-dark);
    font-weight: 600;
  }

  .error-message {
    background: #fee2e2;
    color: #dc2626;
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1.5rem;
    font-size: 0.9rem;
    border-left: 4px solid #dc2626;
  }

  .success-message {
    background: #d1fae5;
    color: #065f46;
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1.5rem;
    font-size: 0.9rem;
    border-left: 4px solid #10b981;
  }

  .info-message {
    background: #dbeafe;
    color: #1e40af;
    padding: 1.5rem;
    border-radius: 8px;
    margin-bottom: 1.5rem;
    text-align: center;
    border-left: 4px solid #3b82f6;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
  }

  .info-message p {
    margin: 0;
    font-size: 0.95rem;
  }

  .spinner {
    width: 30px;
    height: 30px;
    border: 3px solid #dbeafe;
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
  }

  label {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-dark);
    margin-bottom: 0.5rem;
  }

  input {
    padding: 0.875rem;
    border: 2px solid var(--border);
    border-radius: 8px;
    font-size: 1rem;
    transition: all 0.2s;
  }

  input:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  input:disabled {
    background: #f3f4f6;
    cursor: not-allowed;
    opacity: 0.7;
  }

  .input-error {
    border-color: #dc2626 !important;
  }

  .input-error:focus {
    box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1) !important;
  }

  .field-error {
    color: #dc2626;
    font-size: 0.8rem;
    margin-top: 0.4rem;
    font-weight: 500;
  }

  .btn-primary {
    background: var(--primary);
    color: white;
    padding: 0.875rem;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    margin-top: 0.5rem;
  }

  .btn-primary:hover:not(:disabled) {
    background: #2563eb;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }

  .btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  .login-link {
    text-align: center;
    font-size: 0.9rem;
    color: var(--text-light);
    margin-top: 1.5rem;
  }

  .link-button {
    background: none;
    border: none;
    color: var(--primary);
    cursor: pointer;
    text-decoration: none;
    font-size: 0.9rem;
    font-weight: 600;
    transition: color 0.2s;
  }

  .link-button:hover {
    color: #2563eb;
    text-decoration: underline;
  }

  @media (max-width: 480px) {
    .reset-card {
      padding: 1.5rem;
    }

    h1 {
      font-size: 1.5rem;
    }

    h2 {
      font-size: 1.25rem;
    }
  }
</style>