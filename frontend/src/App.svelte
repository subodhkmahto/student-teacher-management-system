<script>
  import { onMount } from 'svelte';
  import { authStore, initAuth } from './stores/auth';

  import Login from './pages/Login.svelte';
  import Register from './pages/Register.svelte';
  import Dashboard from './pages/Dashboard.svelte';
  import StudentsList from './pages/StudentsList.svelte';
  import TeachersList from './pages/TeachersList.svelte';
  import CoursesList from './pages/CoursesList.svelte';
  import AssignCourse from './pages/AssignCourse.svelte';
  import EnrollStudent from './pages/EnrollStudent.svelte';
  import EnrollmentsView from './pages/EnrollmentsView.svelte';
  import Sidebar from './components/Sidebar.svelte';

  let currentPage = 'login';
  let isInitialized = false;

  onMount(async () => {
    await initAuth();
    isInitialized = true;

    if ($authStore.user) {
      currentPage = 'dashboard';
    } else {
      currentPage = 'login';
    }
  });

  const handlePageChange = (page) => {
    currentPage = page || 'dashboard';
  };

  const handleLogout = () => {
    authStore.logout();
    currentPage = 'login';
  };
</script>

<div class="app">
  {#if isInitialized}
    {#if $authStore.user}
      <div class="app-layout">
        <Sidebar
          currentPage={currentPage}
          on:navigate={(e) => handlePageChange(e.detail)}
          on:logout={handleLogout}
        />

        <main class="app-main">
          {#if currentPage === 'dashboard' || !currentPage}
            <Dashboard />
          {:else if currentPage === 'students'}
            <StudentsList />
          {:else if currentPage === 'teachers'}
            <TeachersList />
          {:else if currentPage === 'courses'}
            <CoursesList />
          {:else if currentPage === 'assign-course'}
            <AssignCourse />
          {:else if currentPage === 'enroll-student'}
            <EnrollStudent />
          {:else if currentPage === 'enrollments'}
            <EnrollmentsView />
          {/if}
        </main>
      </div>

    {:else if currentPage === 'register'}
      <Register on:page-change={(e) => handlePageChange(e.detail)} />

    {:else}
      <Login on:page-change={(e) => handlePageChange(e.detail)} />
    {/if}
  {/if}
</div>

<style>
  :global(:root) {
    --primary: #3b82f6;
    --secondary: #64748b;
    --success: #10b981;
    --error: #ef4444;
    --warning: #f59e0b;
    --bg-light: #f8fafc;
    --bg-white: #ffffff;
    --text-dark: #1e293b;
    --text-light: #475569;
    --border: #e2e8f0;
  }

  :global(*) {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  :global(body) {
    font-family: system-ui, sans-serif;
    background: var(--bg-light);
    color: var(--text-dark);
  }

  .app {
    min-height: 100vh;
  }

  .app-layout {
    display: flex;
    min-height: 100vh;
  }

  .app-main {
    flex: 1;
    overflow-y: auto;
    background: var(--bg-light);
  }

  @media (max-width: 768px) {
    .app-layout {
      flex-direction: column;
      margin-left: 40px;
    }
  }
</style>
