<script>
  import { onMount, createEventDispatcher } from 'svelte';
  import { apiCall } from '../lib/api';

  const dispatch = createEventDispatcher();

  let students = [];
  let loading = false;
  let error = '';
  let showForm = false;
  let submitting = false;

  let newStudent = {
    full_name: '',
    email: '',
    roll_number: '',
    grade: ''
  };

  onMount(() => {
    loadStudents();
  });

  // 🔹 Load students (Authenticated)
  async function loadStudents() {
    loading = true;
    error = '';

    try {
      const data = await apiCall('/api/students');
      students = data || [];
    } catch (err) {
      console.error('Load students error:', err);
      
      // Handle session expired
      if (err.message === 'SESSION_EXPIRED') {
        dispatch('sessionExpired');
        return;
      }
      
      error = err.message || 'Failed to load students';
    } finally {
      loading = false;
    }
  }

  // 🔹 Add new student (Authenticated)
  async function handleAddStudent() {
    if (
      !newStudent.full_name ||
      !newStudent.email ||
      !newStudent.roll_number ||
      !newStudent.grade
    ) {
      error = 'All fields are required';
      return;
    }

    submitting = true;
    error = '';

    try {
      await apiCall('/api/students', {
        method: 'POST',
        body: newStudent
      });

      newStudent = {
        full_name: '',
        email: '',
        roll_number: '',
        grade: ''
      };

      showForm = false;
      await loadStudents();

    } catch (err) {
      console.error('Add student error:', err);
      
      // Handle session expired
      if (err.message === 'SESSION_EXPIRED') {
        dispatch('sessionExpired');
        return;
      }
      
      error = err.message || 'Failed to add student';
    } finally {
      submitting = false;
    }
  }
</script>

<div class="page-wrapper">
  <div class="container-fluid py-4">
    <div class="card shadow-sm students-card">

      <div class="card-header d-flex justify-content-between align-items-center">
      <h5 class="mb-0">Students</h5>
      <button class="btn btn-primary btn-sm" on:click={() => showForm = !showForm}>
        {showForm ? 'Cancel' : '+ Add Student'}
      </button>
    </div>

    <div class="card-body">

      <!-- ERROR -->
      {#if error}
        <div class="alert alert-danger">{error}</div>
      {/if}

      <!-- FORM -->
      {#if showForm}
        <div class="card mb-4">
          <div class="card-body">
            <h6 class="mb-3">Add New Student</h6>
            <form on:submit|preventDefault={handleAddStudent}>
              <div class="row mb-3">

                <div class="col-md-6">
                  <label class="form-label">Full Name</label>
                  <input type="text" class="form-control" bind:value={newStudent.full_name} required />
                </div>

                <div class="col-md-6">
                  <label class="form-label">Email</label>
                  <input type="email" class="form-control" bind:value={newStudent.email} required />
                </div>

                <div class="col-md-6">
                  <label class="form-label">Roll Number</label>
                  <input type="text" class="form-control" bind:value={newStudent.roll_number} required />
                </div>

                <div class="col-md-6">
                  <label class="form-label">Grade</label>
                  <input type="text" class="form-control" bind:value={newStudent.grade} required />
                </div>

              </div>

              <button class="btn btn-success" disabled={submitting}>
                {submitting ? 'Saving...' : 'Save Student'}
              </button>
            </form>
          </div>
        </div>
      {/if}

      <!-- LOADING -->
      {#if loading}
        <div class="text-center py-4 text-muted">Loading students...</div>
      {:else if students.length === 0}
        <div class="text-center py-4 text-muted">No students found</div>
      {:else}
        <!-- TABLE -->
        <div class="table-responsive">
          <table class="table table-bordered table-hover">
            <thead class="table-light">
              <tr>
                <th>Roll Number</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Grade</th>
              </tr>
            </thead>
            <tbody>
              {#each students as student (student.id)}
                <tr>
                  <td>{student.roll_number ?? 'N/A'}</td>
                  <td>{student.full_name ?? 'N/A'}</td>
                  <td>{student.email ?? 'N/A'}</td>
                  <td>{student.grade ?? 'N/A'}</td>
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

.students-card {
  width: 100%;
  border-radius: 12px;
  border: 1px solid #e3e6f0;

}

.table th,
.table td {
  white-space: nowrap;
}
</style>