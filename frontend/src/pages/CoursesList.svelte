<script>
  import { onMount } from 'svelte';
  import { API_BASE_URL } from '../lib/api';

  let courses = [];
  let loading = true;
  let error = '';
  let showForm = false;
  let newCourse = { name: '', code: '', description: '', credit_hours: '' };
  let submitting = false;

  onMount(async () => {
    await loadCourses();
  });

  async function loadCourses() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/courses`);
      if (!response.ok) throw new Error('Failed to load courses');
      courses = await response.json();
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  }

  async function handleAddCourse() {
    if (!newCourse.name || !newCourse.code) {
      error = 'Name and code are required';
      return;
    }

    submitting = true;
    try {
      const response = await fetch(`${API_BASE_URL}/api/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCourse)
      });

      if (!response.ok) throw new Error('Failed to create course');

      newCourse = { name: '', code: '', description: '', credit_hours: '' };
      showForm = false;
      await loadCourses();
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
      <h5 class="mb-0">Courses</h5>
      <button
        class="btn btn-primary btn-sm"
        on:click={() => showForm = !showForm}
      >
        {showForm ? 'Cancel' : '+ Add Course'}
      </button>
    </div>

    <div class="card-body">
      {#if error}
        <div class="error">{error}</div>
      {/if}

      {#if showForm}
        <div class="card mb-4">
          <div class="card-body">
          <h6>Add New Course</h6>
          <form on:submit|preventDefault={handleAddCourse}>
        <div class="row mb-3">
      <div class="col-md-6">
        <label class="form-label">Course Name</label>
        <input
          type="text"
          class="form-control"
          bind:value={newCourse.name}
          placeholder="e.g. Mathematics"
          disabled={submitting}
        />
      </div>

    <div class="col-md-6">
      <label class="form-label">Course Code</label>
      <input
        type="text"
        class="form-control"
        bind:value={newCourse.code}
        placeholder="e.g. MATH101"
        disabled={submitting}
      />
    </div>
  </div>

  <div class="row mb-3">
    <div class="col-md-6">
      <label class="form-label">Credit Hours</label>
      <input
        type="number"
        class="form-control"
        bind:value={newCourse.credit_hours}
        placeholder="e.g. 3"
        disabled={submitting}
      />
    </div>

    <div class="col-md-6">
      <label class="form-label">Description</label>
      <textarea
        class="form-control"
        bind:value={newCourse.description}
        placeholder="Course description"
        disabled={submitting}
        rows="1"
      ></textarea>
    </div>
  </div>

  <button type="submit" class="btn btn-primary" disabled={submitting}>
    {submitting ? 'Adding...' : 'Add Course'}
  </button>
</form>

        </div>
        </div>
      {/if}

      {#if loading}
        <div class="loading">Loading courses...</div>
      {:else if courses.length === 0}
        <div class="empty">No courses found</div>
      {:else}
          <!-- TABLE -->
        <div class="table-responsive">
          <table class="table table-bordered table-hover">
            <thead class="table-light">
              <tr>
                <th>Course Name</th>
                <th>Code</th>
                <th>Credit Hours</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {#each courses as course (course.id)}
                <tr>
                  <td>{course.name}</td>
                  <td>{course.code}</td>
                  <td>{course.credit_hours || '-'}</td>
                  <td>{course.description || '-'}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    </div>
  </div>
</div>
