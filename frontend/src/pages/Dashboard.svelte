<script>
  import { onMount } from 'svelte';
  import { API_BASE_URL } from '../lib/api';


  let stats = {
    students: 0,
    teachers: 0,
    courses: 0,
    enrollments: 0
  };
  let loading = true;

  // Fetch all stats on component mount
  onMount(async () => {
    try {
      const [studentsRes, teachersRes, coursesRes, enrollmentsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/students`),
        fetch(`${API_BASE_URL}/api/teachers`),
        fetch(`${API_BASE_URL}/api/courses`),
        fetch(`${API_BASE_URL}/api/enrollments`)
      ]);

      const [students, teachers, courses, enrollments] = await Promise.all([
        studentsRes.json(),
        teachersRes.json(),
        coursesRes.json(),
        enrollmentsRes.json()
      ]);

      stats = {
        students: students.length || 0,
        teachers: teachers.length || 0,
        courses: courses.length || 0,
        enrollments: enrollments.length || 0
      };
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      loading = false;
    }
  });
</script>

<div class="dashboard-page">
  <header class="page-header">
    <h1>Dashboard</h1>
  </header>

  {#if loading}
    <div class="loading">Loading...</div>
  {:else}
    <div class="stats-grid">
      <!-- Students -->
      <div class="stat-card" style="--icon-bg: #dbeafe;">
        <div class="stat-icon">👥</div>
        <div class="stat-content">
          <h3>Students</h3>
          <p class="stat-number">{stats.students}</p>
        </div>
      </div>

      <!-- Teachers -->
      <div class="stat-card" style="--icon-bg: #dcfce7;">
        <div class="stat-icon">👨‍🏫</div>
        <div class="stat-content">
          <h3>Teachers</h3>
          <p class="stat-number">{stats.teachers}</p>
        </div>
      </div>

      <!-- Courses -->
      <div class="stat-card" style="--icon-bg: #fef3c7;">
        <div class="stat-icon">📚</div>
        <div class="stat-content">
          <h3>Courses</h3>
          <p class="stat-number">{stats.courses}</p>
        </div>
      </div>

      <!-- Enrollments -->
      <div class="stat-card" style="--icon-bg: #ede9fe;">
        <div class="stat-icon">📋</div>
        <div class="stat-content">
          <h3>Enrollments</h3>
          <p class="stat-number">{stats.enrollments}</p>
        </div>
      </div>
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
</style>
