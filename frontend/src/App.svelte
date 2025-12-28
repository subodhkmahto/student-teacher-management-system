  <script>
    import { onMount } from 'svelte';
    import { authStore, initAuth } from './stores/auth';

    // Pages
    import Login from './pages/Login.svelte';
    import Register from './pages/Register.svelte';
    import Dashboard from './pages/Dashboard.svelte';
    import StudentsList from './pages/StudentsList.svelte';
    import TeachersList from './pages/TeachersList.svelte';
    import CoursesList from './pages/CoursesList.svelte';
    import AssignCourse from './pages/AssignCourse.svelte';
    import EnrollStudent from './pages/EnrollStudent.svelte';
    import EnrollmentsView from './pages/EnrollmentsView.svelte';
    import ResetPassword from './pages/ResetPassword.svelte';

    // Components
    import Sidebar from './components/Sidebar.svelte';

    let currentPage = 'login';
    let isInitialized = false;
    let loginMessage = ''; //  Add this to store success messages

    onMount(async () => {
      //  Detect reset password flow
      const urlParams = new URLSearchParams(window.location.search);
      const hash = window.location.hash;

      const isResetPassword =
        window.location.pathname === '/reset-password' ||
        hash.includes('type=recovery') ||
        urlParams.get('type') === 'recovery';

      await initAuth();
      isInitialized = true;

      if (isResetPassword) {
        console.log(' Reset password page detected');
        currentPage = 'reset-password';
      } else if ($authStore.user) {
        currentPage = 'dashboard';
      } else {
        currentPage = 'login';
      }
    });

    $: if (currentPage !== 'login') {
    loginMessage = '';
  }

    //  Updated to handle both string and object
  const handlePageChange = (eventDetail) => {
    let nextPage = 'dashboard';
    let nextMessage = '';

    if (eventDetail && typeof eventDetail === 'object') {
      nextPage = eventDetail.page || nextPage;
      nextMessage = eventDetail.message || '';
    } else if (typeof eventDetail === 'string') {
      nextPage = eventDetail;
    }

    currentPage = nextPage;
    loginMessage = nextMessage;

    if (currentPage === 'dashboard') {
      loginMessage = ''; // Clear only for dashboard
    }

    if (currentPage === 'login' || currentPage === 'dashboard') {
      window.history.replaceState({}, '', '/');
    }
};


    const handleLogout = () => {
      authStore.logout();
      loginMessage = ''; // Clear any messages
      currentPage = 'login';
      window.history.replaceState({}, '', '/');
    };
  </script>

  <div class="app">
    {#if isInitialized}
      {#if currentPage === 'reset-password'}
        <!--  Reset Password Page -->
        <ResetPassword on:page-change={(e) => handlePageChange(e.detail)} />

      {:else if $authStore.user}
        <div class="app-layout">
          <Sidebar
            currentPage={currentPage}
            on:navigate={(e) => handlePageChange(e.detail)}
            on:logout={handleLogout}
          />

          <main class="app-main">
            {#if currentPage === 'dashboard'}
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
        <!--  Pass message prop to Login -->
        <Login 
          on:page-change={(e) => handlePageChange(e.detail)} 
          message={loginMessage}
        />
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