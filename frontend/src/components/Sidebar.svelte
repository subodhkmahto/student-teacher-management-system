<script>
  import { authStore } from '../stores/auth';
  import { createEventDispatcher } from 'svelte';

  // page name from parent
  export let currentPage = '';

  const dispatch = createEventDispatcher();

  let isOpen = false;

  const navigate = (page) => {
    dispatch('navigate', page);
    isOpen = false;
  };

  const logout = () => {
    dispatch('logout');
    isOpen = false;
  };

  const toggleSidebar = () => {
    isOpen = !isOpen;
  };
</script>

<!-- Sidebar -->
<aside class="sidebar" class:open={isOpen}>
  <div class="sidebar-header" style="margin-left: 50px;">
    <h2>Menu</h2>
    <button class="close-btn" on:click={() => (isOpen = false)}>×</button>
  </div>

  <nav class="sidebar-nav">
    <button
      class="nav-item"
      class:active={currentPage === 'dashboard'}
      on:click={() => navigate('dashboard')}
    >
      Dashboard
    </button>

    <button
      class="nav-item"
      class:active={currentPage === 'students'}
      on:click={() => navigate('students')}
    >
      Students
    </button>

    <button
      class="nav-item"
      class:active={currentPage === 'teachers'}
      on:click={() => navigate('teachers')}
    >
      Teachers
    </button>

    <button
      class="nav-item"
      class:active={currentPage === 'courses'}
      on:click={() => navigate('courses')}
    >
      Courses
    </button>

    <button
      class="nav-item"
      class:active={currentPage === 'assign-course'}
      on:click={() => navigate('assign-course')}
    >
      Assign Course
    </button>

    <button
      class="nav-item"
      class:active={currentPage === 'enroll-student'}
      on:click={() => navigate('enroll-student')}
    >
      Enroll Student
    </button>

    <button
      class="nav-item"
      class:active={currentPage === 'enrollments'}
      on:click={() => navigate('enrollments')}
    >
      Enrollments
    </button>
  </nav>

  <div class="sidebar-footer">
    <p class="user-email">{$authStore.user?.email}</p>
    <button class="btn-logout" on:click={logout}>
      Logout
    </button>
  </div>
</aside>

<!-- Mobile Toggle Button -->
<button class="menu-toggle" on:click={toggleSidebar}>☰</button>

<!-- Overlay -->
{#if isOpen}
  <div class="sidebar-overlay" on:click={() => (isOpen = false)}></div>
{/if}

<style>
  /* ===== Sidebar ===== */
  .sidebar {
    width: 250px;
    height: 100vh;
    background: #ffffff;
    border-right: 1px solid #e5e7eb;
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 100;
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.08);
  }

  /* ===== Header ===== */
  .sidebar-header {
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .sidebar-header h2 {
    margin: 0;
    font-size: 1.2rem;
    font-weight: 600;
    color: #111827;
  }

  .close-btn {
    display: none;
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #111827;
  }

  /* ===== Navigation ===== */
  .sidebar-nav {
    flex: 1;
    padding: 0.5rem 0;
    overflow-y: auto;
  }

  .nav-item {
    width: 100%;
    padding: 0.75rem 1.5rem;
    background: none;
    border: none;
    text-align: left;
    font-size: 0.95rem;
    color: #374151;
    cursor: pointer;
    border-left: 3px solid transparent;
    transition: background 0.2s, border-color 0.2s;
  }

  .nav-item:hover {
    background: #f3f4f6;
  }

  .nav-item.active {
    background: #eef2ff;
    border-left-color: #4f46e5;
    font-weight: 600;
    color: #1e3a8a;
  }

  /* ===== Footer ===== */
  .sidebar-footer {
    padding: 1rem 1.5rem;
    border-top: 1px solid #e5e7eb;
  }

  .user-email {
    font-size: 0.8rem;
    color: #6b7280;
    margin-bottom: 0.75rem;
    word-break: break-all;
  }

  .btn-logout {
    width: 100%;
    padding: 0.5rem;
    background: #ef4444;
    color: #ffffff;
    border: none;
    border-radius: 4px;
    font-size: 0.85rem;
    cursor: pointer;
    transition: background 0.2s;
  }

  .btn-logout:hover {
    background: #dc2626;
  }

  /* ===== Mobile Toggle ===== */
  .menu-toggle {
    display: none;
    position: fixed;
    top: 1rem;
    left: 1rem;
    width: 40px;
    height: 40px;
    background: #4f46e5;
    color: #ffffff;
    border: none;
    border-radius: 6px;
    font-size: 1.25rem;
    cursor: pointer;
    z-index: 110;
  }

  /* ===== Overlay ===== */
  .sidebar-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 99;
  }

  /* ===== Responsive ===== */
  @media (max-width: 768px) {
    .sidebar {
      transform: translateX(-100%);
      transition: transform 0.3s ease;
    }

    .sidebar.open {
      transform: translateX(0);
    }

    .menu-toggle {
      display: block;
    }

    .close-btn {
      display: block;
    }
  }
</style>
