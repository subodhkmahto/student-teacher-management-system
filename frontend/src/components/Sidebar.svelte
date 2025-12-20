<script>
  import { authStore } from '../stores/auth';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  let isOpen = false;

  const handleNavigate = (page) => {
    dispatch('navigate', page);
    isOpen = false;
  };

  const handleLogout = () => {
    dispatch('logout');
    isOpen = false;
  };

  const toggleSidebar = () => {
    isOpen = !isOpen;
  };
</script>

<aside class="sidebar" class:open={isOpen}>
  <div class="sidebar-header">
    <h2>Menu</h2>
    <button class="close-btn" on:click={() => (isOpen = false)}>×</button>
  </div>

  <nav class="sidebar-nav">
    <button class="nav-item" on:click={() => handleNavigate('dashboard')}>
      Dashboard
    </button>
    <button class="nav-item" on:click={() => handleNavigate('students')}>
      Students
    </button>
    <button class="nav-item" on:click={() => handleNavigate('teachers')}>
      Teachers
    </button>
    <button class="nav-item" on:click={() => handleNavigate('courses')}>
      Courses
    </button>
    <button class="nav-item" on:click={() => handleNavigate('assign-course')}>
      Assign Course
    </button>
    <button class="nav-item" on:click={() => handleNavigate('enroll-student')}>
      Enroll Student
    </button>
    <button class="nav-item" on:click={() => handleNavigate('enrollments')}>
      Enrollments
    </button>
  </nav>

  <div class="sidebar-footer">
    <p class="user-email">{$authStore.user?.email}</p>
    <button class="btn-logout" on:click={handleLogout}>
      Logout
    </button>
  </div>
</aside>

<button class="menu-toggle" on:click={toggleSidebar}>☰</button>

{#if isOpen}
  <div class="sidebar-overlay" on:click={() => (isOpen = false)}></div>
{/if}

<style>
  .sidebar {
    width: 250px;
    background: white;
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    height: 100vh;
    position: fixed;
    left: 0;
    top: 0;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
    z-index: 100;
  }

  .sidebar-header {
    padding: 1.5rem;
    border-bottom: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .sidebar-header h2 {
    font-size: 1.25rem;
    color: var(--text-dark);
    margin: 0;
  }

  .close-btn {
    display: none;
    background: none;
    border: none;
    font-size: 1.5rem;
    color: var(--text-dark);
    cursor: pointer;
  }

  .sidebar-nav {
    flex: 1;
    padding: 1rem 0;
    overflow-y: auto;
  }

  .nav-item {
    display: block;
    width: 100%;
    padding: 0.75rem 1.5rem;
    text-align: left;
    background: none;
    border: none;
    color: var(--text-dark);
    cursor: pointer;
    font-size: 1rem;
    transition: background 0.2s;
    border-left: 3px solid transparent;
  }

  .nav-item:hover {
    background: var(--bg-light);
    border-left-color: var(--primary);
  }

  .sidebar-footer {
    padding: 1rem 1.5rem;
    border-top: 1px solid var(--border);
  }

  .user-email {
    font-size: 0.875rem;
    color: var(--text-light);
    margin-bottom: 0.75rem;
    word-break: break-all;
  }

  .btn-logout {
    width: 100%;
    padding: 0.5rem;
    background: var(--error);
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
  }

  .btn-logout:hover {
    background: #dc2626;
  }

  .menu-toggle {
    display: none;
    position: fixed;
    top: 1rem;
    left: 1rem;
    background: var(--primary);
    color: white;
    border: none;
    border-radius: 4px;
    width: 40px;
    height: 40px;
    font-size: 1.25rem;
    cursor: pointer;
    z-index: 110;
  }

  .sidebar-overlay {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 99;
  }

  @media (max-width: 768px) {
    .sidebar {
      transform: translateX(-100%);
      transition: transform 0.3s;
      z-index: 101;
    }

    .sidebar.open {
      transform: translateX(0);
    }

    .sidebar-header {
      justify-content: space-between;
    }

    .close-btn {
      display: block;
    }

    .menu-toggle {
      display: block;
    }

    .sidebar-overlay.open {
      display: block;
    }

    .sidebar-overlay {
      display: none;
    }

    .sidebar-overlay:not(.open) {
      display: none !important;
    }
  }
</style>
