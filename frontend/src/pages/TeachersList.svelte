<script>
  import { onMount } from 'svelte';
  import { API_BASE_URL } from '../lib/api';
  import { authStore } from '../stores/auth';



  let teachers = [];
  let loading = true;
  let error = '';
  let showForm = false;
  let newTeacher = { full_name: '', email: '', department: '', specialization: '' };
  let submitting = false;
  let token;
  authStore.subscribe(state => {
    token = state.session?.access_token;
  });

  onMount(async () => {
    await loadTeachers();
  });

  async function loadTeachers() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/teachers`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to load teachers');
      teachers = await response.json();
      console.log(teachers);
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  }

 async function handleAddTeacher() {
  if (!newTeacher.full_name || !newTeacher.email || !newTeacher.department || !newTeacher.specialization) {
    error = 'Full name, email, department, and specialization are required';
    return;
  }

  submitting = true;
  error = '';

  try {
    const res = await fetch(`${API_BASE_URL}/api/teachers`, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      body: JSON.stringify(newTeacher)
    });

    const result = await res.json();

    if (!res.ok) {
      // Server se aaya hua error message use karo
      throw new Error(result.error || 'Failed to add teacher');
    }

    // Success
    newTeacher = { full_name: '', email: '', department: '', specialization: '' };
    showForm = false;
    await loadTeachers();
  } catch (err) {
    error = err.message; // Server ka error message view me dikhayega
  } finally {
    submitting = false;
  }
}

</script>

<div class="page-wrapper">
  <div class="container-fluid py-4">
    <div class="card shadow-sm teachers-card">

      <div class="card-header d-flex justify-content-between align-items-center">
      <h5 class="mb-0">Teachers</h5>
      <button
        class="btn btn-primary btn-sm"
        on:click={() => showForm = !showForm}
      >
        {showForm ? 'Cancel' : '+ Add Teacher'}
      </button>
    </div>

    <div class="card-body">

      <!-- ERROR -->
      {#if error}
        <div class="alert alert-danger">
          {error}
        </div>
      {/if}

      <!-- ADD TEACHER FORM -->
      {#if showForm}
        <form on:submit|preventDefault={handleAddTeacher} class="mb-4">
          <div class="mb-3">
            <label class="form-label">Full Name</label>
            <input
              type="text"
              class="form-control"
              bind:value={newTeacher.full_name}
              required
            />
          </div>

          <div class="mb-3">
            <label class="form-label">Email</label>
            <input
              type="email"
              class="form-control"
              bind:value={newTeacher.email}
              required
            />
          </div>

          <div class="mb-3">
            <label class="form-label">Department</label>
            <input
              type="text"
              class="form-control"
              bind:value={newTeacher.department}
            />
          </div>

          <div class="mb-3">
            <label class="form-label">Specialization</label>
            <input
              type="text"
              class="form-control"
              bind:value={newTeacher.specialization}
            />
          </div>

          <button type="submit" class="btn btn-success" disabled={submitting}>
            {submitting ? 'Adding...' : 'Add Teacher'}
          </button>
        </form>
      {/if}

      <!-- TEACHERS TABLE -->
      {#if loading}
        <div class="loading">Loading teachers...</div>
      {:else if teachers.length === 0}
        <div class="empty">No teachers found</div>
      {:else}
        <div class="table-responsive">
          <table class="table table-bordered table-hover">
            <thead class="table-light">
              <tr>
                <th>Full Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Specialization</th>
              </tr>
            </thead>
            <tbody>
              {#each teachers as teacher (teacher.id)}
                <tr>
                  <td>{teacher.full_name || 'N/A'}</td>
                  <td>{teacher.email || 'N/A'}</td>
                  <td>{teacher.department || 'N/A'}</td>
                  <td>{teacher.specialization || 'N/A'}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}

    </div>
  </div>
</div>
</div>



<style>
  
  body.sidebar-collapsed .page-wrapper {
  margin-left: 0;
  width: 100%;
}
.card{
  border-radius: 12px;
  border: 1px solid #e3e6f0;
  margin-top: 38px;
}

.page-wrapper {
  margin-left: 250px;
  width: calc(100% - 250px);
  min-height: 100vh;
  background: #f8f9fa;
  transition: all 0.3s ease;
  margin-bottom: 300px;

}


@media (max-width: 991px) {
  .page-wrapper {
    margin-left: 0;
    width: 100%;
  }
}

.container-fluid {
  max-width: 1400px;
}

.teachers-card {
  width: 100%;
  border-radius: 12px;
  border: 1px solid #e3e6f0;

}

.table th,
.table td {
  white-space: nowrap;
}
</style>