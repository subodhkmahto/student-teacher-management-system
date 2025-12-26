<script>
  import { onMount } from 'svelte';
  import { API_BASE_URL } from '../lib/api';
  import { authStore } from '../stores/auth';



  let students = [];
  let courses = [];
  let loading = true;
  let error = '';
  let selectedStudent = '';
  let selectedCourse = '';
  let submitting = false;
  let token;

  // Get access token from authStore
  authStore.subscribe(state => {
    token = state.session?.access_token;
  });

  onMount(async () => {
    try {
      const [studentsRes, coursesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/students`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/api/courses`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (studentsRes.ok) students = await studentsRes.json();
      if (coursesRes.ok) courses = await coursesRes.json();
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  });

  async function handleEnroll() {
    if (!selectedStudent || !selectedCourse) {
      error = 'Please select both student and course';
      return;
    }

    submitting = true;
    error = '';
    try {
      const response = await fetch(`${API_BASE_URL}/api/enrollments`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          student_id: selectedStudent,
          course_id: selectedCourse
        })
      });

      if (!response.ok) throw new Error('Failed to enroll student');

      selectedStudent = '';
      selectedCourse = '';
      error = '';
    } catch (err) {
      error = err.message;
    } finally {
      submitting = false;
    }
  }
</script>

<div class="page">
  <div class="page-header">
    <h1>Enroll Student in Course</h1>
  </div>

  {#if error}
    <div class="error">{error}</div>
  {/if}

  {#if loading}
    <div class="loading">Loading...</div>
  {:else}
    <div class="form-card">
      <h2>New Enrollment</h2>
      <form on:submit|preventDefault={handleEnroll}>
        <div class="form-group">
          <label for="student">Select Student</label>
          <select
            id="student"
            bind:value={selectedStudent}
            disabled={submitting}
          >
            <option value="">-- Choose a student --</option>
            {#each students as student (student.id)}
              <option value={student.id}>
                {student.full_name} ({student.roll_number})
              </option>
            {/each}
          </select>
        </div>

        <div class="form-group">
          <label for="course">Select Course</label>
          <select
            id="course"
            bind:value={selectedCourse}
            disabled={submitting}
          >
            <option value="">-- Choose a course --</option>
            {#each courses as course (course.id)}
              <option value={course.id}>
                {course.name} ({course.code})
              </option>
            {/each}
          </select>
        </div>

        <button type="submit" class="btn-primary" disabled={submitting}>
          {submitting ? 'Enrolling...' : 'Enroll Student'}
        </button>
      </form>
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

  .loading,
  .error {
    text-align: center;
    padding: 2rem;
  }

  .error {
    background: #fee2e2;
    color: #dc2626;
    border-radius: 4px;
  }

  .form-card {
    background: white;
    border-radius: 8px;
    padding: 1.5rem;
    max-width: 500px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .form-card h2 {
    margin-top: 0;
    color: var(--text-dark);
  }

  .form-group {
    margin-bottom: 1.5rem;
  }

  .form-group label {
    display: block;
    font-weight: 500;
    margin-bottom: 0.5rem;
    color: var(--text-dark);
    font-size: 0.875rem;
  }

  select {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid var(--border);
    border-radius: 4px;
    font-size: 1rem;
    font-family: inherit;
  }

  select:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .btn-primary {
    width: 100%;
    background: var(--primary);
    color: white;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    font-size: 1rem;
  }

  .btn-primary:hover:not(:disabled) {
    background: #2563eb;
  }

  .btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    .page {
      margin-left: 0;
      padding: 1rem;
    }

    .page-header h1 {
      font-size: 1.5rem;
    }

    .form-card {
      max-width: 100%;
    }
  }
</style>
