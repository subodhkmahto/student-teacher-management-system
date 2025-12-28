<script>
  import { createEventDispatcher } from 'svelte';
  import { apiCall } from '../lib/api';
  import { authStore } from '../stores/auth';

  let stats = {
    students: 0,
    teachers: 0,
    courses: 0,
    enrollments: 0
  };

  let loading = true;
  let isFetching = false;

  const dispatch = createEventDispatcher();

  // Get user role
  $: userRole = $authStore.role || '';

  // Define which stats are visible for each role
  const statCards = [
    {
      key: 'students',
      title: 'Students',
      icon: '👥',
      iconBg: '#dbeafe',
      roles: ['admin', 'teacher','student']  // Removed 'student' from here
    },
    {
      key: 'teachers',
      title: 'Teachers',
      icon: '👨‍🏫',
      iconBg: '#dcfce7',
      roles: ['admin', 'teacher']
    },
    {
      key: 'courses',
      title: 'Courses',
      icon: '📚',
      iconBg: '#fef3c7',
      roles: ['student', 'admin']
    },
    {
      key: 'enrollments',
      title: 'Enrollments',
      icon: '📋',
      iconBg: '#ede9fe',
      roles: ['admin']
    }
  ];

  // Filter stats based on user role
  $: visibleStats = statCards.filter(card => 
    card.roles.includes(userRole)
  );

  async function fetchStats() {
    if (isFetching) return;
    isFetching = true;

    try {
      const [students, teachers, courses, enrollments] = await Promise.all([
        apiCall('/api/students'),
        apiCall('/api/teachers'),
        apiCall('/api/courses'),
        apiCall('/api/enrollments')
      ]);

      stats = {
        students: students?.length || 0,
        teachers: teachers?.length || 0,
        courses: courses?.length || 0,
        enrollments: enrollments?.length || 0
      };

      console.log('Dashboard stats loaded:', stats);
    } catch (error) {
      console.error('Dashboard error:', error.message);

      if (error.message === 'SESSION_EXPIRED') {
        dispatch('page-change', 'login');
      }
    } finally {
      loading = false;
      isFetching = false;
    }
  }

  // Wait for authStore to finish loading before calling API
  $: if (!$authStore.loading && $authStore.user) {
    fetchStats();
  }

</script>

<div class="dashboard-page">
  <header class="page-header">
    <h1>Dashboard</h1>
  </header>

  {#if loading}
    <div class="loading">Loading...</div>
  {:else}
    <div class="stats-grid">
      {#each visibleStats as card}
        <div class="stat-card" style="--icon-bg: {card.iconBg};">
          <div class="stat-icon">{card.icon}</div>
          <div class="stat-content">
            <h3>{card.title}</h3>
            <p class="stat-number">{stats[card.key]}</p>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .dashboard-page {
    padding: 2rem;
    margin-left: 250px;
  }

  .page-header {
    margin-bottom: 2rem;
  }

  .page-header h1 {
    font-size: 1.875rem;
    color: var(--text-dark);
    margin: 0;
  }

  .loading {
    text-align: center;
    padding: 2rem;
    color: var(--text-light);
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
  }

  .stat-card {
    background: #fff;
    border-radius: 8px;
    padding: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    transition: box-shadow 0.2s;
  }

  .stat-card:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }

  .stat-icon {
    width: 60px;
    height: 60px;
    border-radius: 8px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.75rem;
    background-color: var(--icon-bg);
  }

  .stat-content h3 {
    font-size: 0.875rem;
    color: var(--text-light);
    margin: 0 0 0.5rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .stat-number {
    font-size: 2rem;
    font-weight: 600;
    color: var(--text-dark);
    margin: 0;
  }

  @media (max-width: 768px) {
    .dashboard-page {
      margin-left: 0;
      padding: 1rem;
    }

    .page-header h1 {
      font-size: 1.5rem;
    }

    .stats-grid {
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
    }

    .stat-card {
      flex-direction: column;
      text-align: center;
      padding: 1rem;
    }

    .stat-icon {
      width: 50px;
      height: 50px;
      font-size: 1.5rem;
    }

    .stat-number {
      font-size: 1.5rem;
    }
  }
</style>z