<script>
  import { authStore } from '../stores/auth';
  import { createEventDispatcher } from 'svelte';
  import { isEmail, isRequired, minLength } from '../../../shared/validation.js'; 

  const dispatch = createEventDispatcher();

  let email = '';
  let password = '';
  let fullName = '';
  let role = 'student';
  let error = '';
  let loading = false;

  const autoClearMessage = () => {
    setTimeout(() => { error = ''; }, 2000);
  };

  const validateForm = () => {
    if (!isRequired(fullName)) return 'Full name is required';
    if (!minLength(fullName, 3)) return 'Full name must be at least 3 characters';
    if (!isRequired(email)) return 'Email is required';
    if (!isEmail(email)) return 'Please enter a valid email address';
    if (!isRequired(password)) return 'Password is required';
    if (!minLength(password, 6)) return 'Password must be at least 6 characters';
    if (!isRequired(role)) return 'Please select a role';
    if (!['student', 'teacher', 'admin'].includes(role)) return 'Invalid role selected';
    return null;
  };

  const handleRegister = async () => {
    error = '';
    const validationError = validateForm();
    if (validationError) { error = validationError; autoClearMessage(); return; }

    loading = true;
    try {
      const response = await authStore.register(email, password, fullName, role);
      console.log('Registration response:', response);
       if (response?.success) { 
        dispatch('page-change', {
          page: 'login',
          message: 'Account created successfully! Please check your email to verify.'
        });
      } else {
        error = 'Registration failed. Please try again.';
        autoClearMessage();
      }
    } catch (err) {
      error = err.message || 'Registration failed. Please try again.';
      autoClearMessage();
    } finally {
      loading = false;
    }
  };

  const handleLoginClick = () => dispatch('page-change', 'login');

  const handleKeyPress = (e) => { if (e.key === 'Enter') handleRegister(); };

  // Real-time validation feedback
  $: emailError = email && !isEmail(email) ? 'Invalid email format' : '';
  $: passwordError = password && !minLength(password, 6) ? 'Password too short (min 6 characters)' : '';
  $: fullNameError = fullName && !minLength(fullName, 3) ? 'Name too short (min 3 characters)' : '';
</script>

<div class="register-container">
  <div class="register-card">
    <h1>School Management</h1>
    <h2>Create Account</h2>

    {#if error}
      <div class="error-message">{error}</div>
    {/if}

    <form on:submit|preventDefault={handleRegister}>
      <div class="form-group">
        <label for="fullname">Full Name</label>
        <input
          id="fullname"
          type="text"
          bind:value={fullName}
          on:keypress={handleKeyPress}
          placeholder="Enter your full name"
          required
          disabled={loading}
          class:input-error={fullNameError}
        />
        {#if fullNameError}<span class="field-error">{fullNameError}</span>{/if}
      </div>

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
        {#if emailError}<span class="field-error">{emailError}</span>{/if}
      </div>

      <div class="form-group">
        <label for="password">Password</label>
        <input
          id="password"
          type="password"
          bind:value={password}
          on:keypress={handleKeyPress}
          placeholder="Enter a password (min 6 characters)"
          required
          disabled={loading}
          class:input-error={passwordError}
        />
        {#if passwordError}<span class="field-error">{passwordError}</span>{/if}
      </div>

      <div class="form-group">
        <label for="role">Role</label>
        <select id="role" bind:value={role} disabled={loading}>
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <button type="submit" class="btn-primary" disabled={loading}>
        {loading ? 'Creating account...' : 'Sign Up'}
      </button>
    </form>

    <p class="login-link">
      Already have an account?
      <button type="button" on:click={handleLoginClick} class="link-button">Sign in</button>
    </p>
  </div>
</div>

<style>
  .register-container { display:flex;justify-content:center;align-items:center;min-height:100vh;background:linear-gradient(135deg,var(--primary) 0%,#60a5fa 100%); }
  .register-card { background:white;padding:2rem;border-radius:8px;box-shadow:0 10px 40px rgba(0,0,0,0.1);width:100%;max-width:400px; }
  h1 { font-size:1.5rem;color:var(--primary);margin-bottom:0.5rem;text-align:center; }
  h2 { font-size:1.25rem;color:var(--text-dark);margin-bottom:1.5rem;text-align:center; }
  .error-message { background:#fee2e2;color:#dc2626;padding:0.75rem;border-radius:4px;margin-bottom:1rem;font-size:0.875rem; }
  form { display:flex;flex-direction:column;gap:1rem; }
  .form-group { display:flex;flex-direction:column; }
  label { font-size:0.875rem;font-weight:500;color:var(--text-dark);margin-bottom:0.5rem; }
  input,select { padding:0.75rem;border:1px solid var(--border);border-radius:4px;font-size:1rem;transition:border-color 0.2s; }
  input:focus,select:focus { outline:none;border-color:var(--primary);box-shadow:0 0 0 3px rgba(59,130,246,0.1); }
  input:disabled,select:disabled { background:#f3f4f6;cursor:not-allowed; }
  .input-error { border-color:#dc2626 !important; }
  .input-error:focus { box-shadow:0 0 0 3px rgba(220,38,38,0.1) !important; }
  .field-error { color:#dc2626;font-size:0.75rem;margin-top:0.25rem; }
  .btn-primary { background:var(--primary);color:white;padding:0.75rem;border:none;border-radius:4px;font-size:1rem;font-weight:500;cursor:pointer;transition:background 0.2s; }
  .btn-primary:hover:not(:disabled) { background:#2563eb; }
  .btn-primary:disabled { opacity:0.5;cursor:not-allowed; }
  .login-link { text-align:center;font-size:0.875rem;color:var(--text-light);margin-top:1rem; }
  .link-button { background:none;border:none;color:var(--primary);cursor:pointer;font-weight:500;text-decoration:underline;padding:0; }
  .link-button:hover { color:#2563eb; }
</style>
