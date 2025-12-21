<script>
  import { onMount } from 'svelte';
  import { API_BASE_URL } from '../lib/api';


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

  async function loadStudents() {
    loading = true;
    error = '';

    try {
      const res = await fetch(`${API_BASE_URL}/api/students`);

      // Log the response for debugging
      console.log('API response:', res);

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData?.error || 'Failed to load students');
      }

      students = await res.json();
      console.log('Students loaded:', students);

    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  }

  async function handleAddStudent() {
    if (!newStudent.full_name || !newStudent.email || !newStudent.roll_number || !newStudent.grade) {
      error = 'All fields are required';
      return;
    }

    submitting = true;
    error = '';

    try {
      const res = await fetch(`${API_BASE_URL}/api/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStudent)
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData?.error || 'Failed to add student');
      }

      newStudent = { full_name: '', email: '', roll_number: '', grade: '' };
      showForm = false;
      await loadStudents();
    } catch (err) {
      error = err.message;
    } finally {
      submitting = false;
    }
  }
</script>

<div class="container-auto">
  <div class="card shadow-sm p-4" style="margin-left:250px;">

    <!-- HEADER -->
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
