<script>
  import { onMount } from 'svelte';
  import { authStore } from '../../../stores/auth';
  import { goto } from '$app/navigation';

  let accessToken = null;
  let newPassword = '';
  let confirmPassword = '';
  let message = '';
  let loading = false;
  let success = false;

  onMount(async () => {
    // 1️⃣ Logout user
    await authStore.logout();

    // 2️⃣ Check for token in hash (#access_token=...)
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      accessToken = params.get('access_token');
    }

    // 3️⃣ Check for token in query params (?access_token=...)
    if (!accessToken) {
      const searchParams = new URLSearchParams(window.location.search);
      accessToken = searchParams.get('access_token');
    }

    // 4️⃣ Check for errors
    const searchParams = new URLSearchParams(window.location.search);
    const error = searchParams.get('error');
    const errorDesc = searchParams.get('error_description');

    if (error) {
      message = decodeURIComponent(errorDesc || 'Invalid or expired link.');
    } else if (!accessToken) {
      message = 'Invalid or expired link. Please request a new reset email.';
    }
  });

  async function handleResetPassword() {
    // Validation
    if (!newPassword || !confirmPassword) {
      message = 'Please fill in all fields.';
      return;
    }

    if (newPassword !== confirmPassword) {
      message = 'Passwords do not match.';
      return;
    }

    if (newPassword.length < 6) {
      message = 'Password must be at least 6 characters long.';
      return;
    }

    loading = true;
    message = '';

    try {
      await authStore.updatePassword(accessToken, newPassword);
      success = true;
      message = 'Password updated successfully! Redirecting to login...';

      setTimeout(() => goto('/login'), 2000);
    } catch (err) {
      message = err.message || 'Failed to reset password.';
    } finally {
      loading = false;
    }
  }
</script>

<div class="reset-container">
  <div class="reset-card">
    <h1>School Management</h1>
    <h2>Reset Password</h2>

    {#if message}
      <div class={success ? 'success-message' : 'error-message'}>
        {message}
      </div>
    {/if}

    {#if accessToken}
      <form on:submit|preventDefault={handleResetPassword}>
        <div class="form-group">
          <label for="new-password">New Password</label>
          <input
            id="new-password"
            type="password"
            bind:value={newPassword}
            placeholder="Enter new password (min 6 characters)"
            required
            disabled={loading || success}
            minlength="6"
          />
        </div>

        <div class="form-group">
          <label for="confirm-password">Confirm Password</label>
          <input
            id="confirm-password"
            type="password"
            bind:value={confirmPassword}
            placeholder="Confirm new password"
            required
            disabled={loading || success}
            minlength="6"
          />
        </div>

        <button 
          type="submit" 
          class="btn-primary" 
          disabled={loading || success || !newPassword || !confirmPassword}
        >
          {loading ? 'Resetting...' : success ? '✓ Password Updated' : 'Reset Password'}
        </button>
      </form>
    {:else}
      <div class="no-token-message">
        <p>The reset link is invalid or has expired.</p>
        <a href="/login" class="btn-secondary">Go to Login</a>
      </div>
    {/if}

    <p class="back-link">
      <a href="/login" class="link-button">← Back to Login</a>
    </p>
  </div>
</div>

<style>
  .reset-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: linear-gradient(135deg, #3b82f6 0%, #764ba2 100%);
  }

  .reset-card {
    background: white;
    padding: 2.5rem;
    border-radius: 12px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
    width: 100%;
    max-width: 420px;
  }

  h1 {
    font-size: 1.75rem;
    color: #3b82f6;
    margin-bottom: 0.5rem;
    text-align: center;
    font-weight: 600;
  }

  h2 {
    font-size: 1.25rem;
    color: #1f2937;
    margin-bottom: 1.5rem;
    text-align: center;
    font-weight: 500;
  }

  .error-message {
    background: #fee2e2;
    color: #dc2626;
    padding: 0.875rem;
    border-radius: 6px;
    margin-bottom: 1rem;
    font-size: 0.875rem;
    border-left: 4px solid #dc2626;
  }

  .success-message {
    background: #d1fae5;
    color: #065f46;
    padding: 0.875rem;
    border-radius: 6px;
    margin-bottom: 1rem;
    font-size: 0.875rem;
    border-left: 4px solid #10b981;
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
    font-size: 0.875rem;
    font-weight: 600;
    color: #374151;
    margin-bottom: 0.5rem;
  }

  input {
    padding: 0.875rem;
    border: 2px solid #e5e7eb;
    border-radius: 6px;
    font-size: 1rem;
    transition: all 0.2s;
  }

  input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
  }

  input:disabled {
    background: #f9fafb;
    cursor: not-allowed;
    opacity: 0.6;
  }

  .btn-primary {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    color: white;
    padding: 0.875rem;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }

  .btn-primary:hover:not(:disabled) {
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
  }

  .btn-primary:active:not(:disabled) {
    transform: translateY(0);
  }

  .btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  .btn-secondary {
    display: inline-block;
    background: #6b7280;
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    text-decoration: none;
    font-weight: 500;
    transition: background 0.2s;
  }

  .btn-secondary:hover {
    background: #4b5563;
  }

  .no-token-message {
    text-align: center;
    padding: 2rem 1rem;
  }

  .no-token-message p {
    color: #6b7280;
    margin-bottom: 1.5rem;
    font-size: 1rem;
  }

  .back-link {
    text-align: center;
    margin-top: 1.5rem;
  }

  .link-button {
    color: #3b82f6;
    text-decoration: none;
    font-weight: 500;
    font-size: 0.875rem;
    transition: color 0.2s;
  }

  .link-button:hover {
    color: #2563eb;
    text-decoration: underline;
  }

  @media (max-width: 480px) {
    .reset-card {
      padding: 1.5rem;
      margin: 1rem;
    }

    h1 {
      font-size: 1.5rem;
    }

    h2 {
      font-size: 1.125rem;
    }
  }
</style>