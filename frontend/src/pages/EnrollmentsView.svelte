<script>
  import { onMount } from 'svelte';
  import { API_BASE_URL } from '../lib/api';
  import { authStore } from '../stores/auth';



  let enrollments = [];
  let loading = true;
  let error = '';
  let filterStatus = 'all';
  let token;
  // Get access token from authStore
  authStore.subscribe(state => {
    token = state.session?.access_token;
  });

  onMount(async () => {
    await loadEnrollments();
  });

  async function loadEnrollments() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/enrollments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to load enrollments');
      enrollments = await response.json();
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  }

  function getFilteredEnrollments() {
    if (filterStatus === 'all') return enrollments;
    return enrollments.filter(e => e.status === filterStatus);
  }

  async function updateStatus(enrollmentId, newStatus) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/enrollments/${enrollmentId}`, {
        method: 'PUT',
         headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error('Failed to update status');
      await loadEnrollments();
    } catch (err) {
      error = err.message;
    }
  }

  function getStatusColor(status) {
    if (status === 'active') return '#10b981';
    if (status === 'completed') return '#3b82f6';
    if (status === 'dropped') return '#ef4444';
    return '#64748b';
  }
</script>

<div class="page">
  <div class="page-header">
    <h1>Enrollments</h1>
  </div>

  {#if error}
    <div class="error">{error}</div>
  {/if}

  <div class="filter-bar">
    <label for="filter">Filter by Status:</label>
    <select id="filter" bind:value={filterStatus}>
      <option value="all">All</option>
      <option value="active">Active</option>
      <option value="completed">Completed</option>
      <option value="dropped">Dropped</option>
    </select>
  </div>

  {#if loading}
    <div class="loading">Loading enrollments...</div>
  {:else if getFilteredEnrollments().length === 0}
    <div class="empty">No enrollments found</div>
  {:else}
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Student</th>
            <th>Roll Number</th>
            <th>Course</th>
            <th>Status</th>
            <th>Enrollment Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each getFilteredEnrollments() as enrollment (enrollment.id)}
            <tr>
              <td>{enrollment.students?.full_name || 'N/A'}</td>
              <td>{enrollment.students?.roll_number || 'N/A'}</td>
              <td>{enrollment.courses?.name || 'N/A'}</td>
              <td>
                <span class="status-badge" style="background: {getStatusColor(enrollment.status)}">
                  {enrollment.status}
                </span>
              </td>
              <td>{new Date(enrollment.enrollment_date).toLocaleDateString()}</td>
              <td>
                <select
                  value={enrollment.status}
                  on:change={(e) => updateStatus(enrollment.id, e.target.value)}
                  class="status-select"
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="dropped">Dropped</option>
                </select>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>

<style>
  .page {
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

  .filter-bar {
    background: white;
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .filter-bar label {
    font-weight: 500;
    color: var(--text-dark);
  }

  .filter-bar select {
    padding: 0.5rem;
    border: 1px solid var(--border);
    border-radius: 4px;
    font-size: 0.875rem;
  }

  .loading,
  .empty,
  .error {
    text-align: center;
    padding: 2rem;
    color: var(--text-light);
  }

  .error {
    background: #fee2e2;
    color: #dc2626;
    border-radius: 4px;
  }

  .table-container {
    background: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    overflow-x: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  thead {
    background: var(--bg-light);
    border-bottom: 2px solid var(--border);
  }

  th {
    padding: 1rem;
    text-align: left;
    font-weight: 600;
    color: var(--text-dark);
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  td {
    padding: 1rem;
    border-bottom: 1px solid var(--border);
    color: var(--text-dark);
  }

  tbody tr:hover {
    background: var(--bg-light);
  }

  .status-badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    color: white;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
  }

  .status-select {
    padding: 0.5rem;
    border: 1px solid var(--border);
    border-radius: 4px;
    font-size: 0.875rem;
    cursor: pointer;
  }

  .status-select:focus {
    outline: none;
    border-color: var(--primary);
  }

  @media (max-width: 768px) {
    .page {
      margin-left: 0;
      padding: 1rem;
    }

    .page-header h1 {
      font-size: 1.5rem;
    }

    .filter-bar {
      flex-direction: column;
      align-items: flex-start;
    }

    .filter-bar select {
      width: 100%;
    }

    table {
      font-size: 0.875rem;
    }

    th,
    td {
      padding: 0.75rem;
    }
  }
</style>
