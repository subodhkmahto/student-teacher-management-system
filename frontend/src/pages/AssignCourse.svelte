<script>
  import { onMount } from 'svelte';
  import { API_BASE_URL } from '../lib/api';


  let teachers = [];
  let courses = [];
  let assignments = [];
  let loading = true;
  let error = '';
  let selectedTeacher = '';
  let selectedCourse = '';
  let selectedSemester = '';
  let submitting = false;

  onMount(async () => {
    await loadData();
  });

  async function loadData() {
    try {
   const [teachersRes, coursesRes, assignmentsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/teachers`),
          fetch(`${API_BASE_URL}/api/courses`),
          fetch(`${API_BASE_URL}/api/course-assignments`)
        ]);

      if (teachersRes.ok) teachers = await teachersRes.json();
      if (coursesRes.ok) courses = await coursesRes.json();
      if (assignmentsRes.ok) assignments = await assignmentsRes.json();
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  }

async function handleAssignCourse() {
  if (!selectedTeacher || !selectedCourse || !selectedSemester) {
    error = 'Please select teacher, course, and semester';
    return;
  }

  submitting = true;
  error = '';

  try {
    const response = await fetch(`${API_BASE_URL}/api/course-assignments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        teacher_id: selectedTeacher,
        course_id: selectedCourse,
        semester: selectedSemester
      })
    });

    const result = await response.json(); // Parse the JSON from server

    if (!response.ok) {
      throw new Error(result.error || 'Failed to assign course'); // Use server error
    }

    // Reset selections
    selectedTeacher = '';
    selectedCourse = '';
    selectedSemester = '';

    await loadData();
  } catch (err) {
    error = err.message; // Show proper server error
  } finally {
    submitting = false;
  }
}

  function getTeacherName(teacherId) {
    return teachers.find(t => t.id === teacherId)?.full_name || 'N/A';
  }

  function getCourseName(courseId) {
    return courses.find(c => c.id === courseId)?.name || 'N/A';
  }
</script>

<div class="page">
  <div class="page-header">
    <h1>Assign Courses to Teachers</h1>
  </div>

  {#if error}
    <div class="error">{error}</div>
  {/if}

  {#if loading}
    <div class="loading">Loading...</div>
  {:else}
    <div class="form-card">
    <h2>Assign New Course</h2>
    <form on:submit|preventDefault={handleAssignCourse}>
      <div class="form-group">
        <label for="teacher">Select Teacher</label>
        <select
          id="teacher"
          bind:value={selectedTeacher}
          disabled={submitting}
        >
          <option value="">-- Choose a teacher --</option>
          {#each teachers as teacher (teacher.id)}
            <option value={teacher.id}>
              {teacher.full_name}
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

      <div class="form-group">
        <label for="semester">Select Semester</label>
        <select
          id="semester"
          bind:value={selectedSemester}
          disabled={submitting}
        >
          <option value="">-- Choose a semester --</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
          <option value="6">6</option>
          <option value="7">7</option>
          <option value="8">8</option>
        </select>
      </div>

    <button type="submit" class="btn-primary" disabled={submitting}>
      {submitting ? 'Assigning...' : 'Assign Course'}
    </button>
  </form>
</div>


    {#if assignments.length > 0}
      <div class="table-container">
        <h2>Current Assignments</h2>
        <table>
          <thead>
            <tr>
              <th>Teacher</th>
              <th>Course</th>
              <th>Semester</th>
            </tr>
          </thead>
          <tbody>
            {#each assignments as assignment (assignment.id)}
              <tr>
                <td>{getTeacherName(assignment.teacher_id)}</td>
                <td>{getCourseName(assignment.course_id)}</td>
                <td>{assignment.semester || '-'}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
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
    margin-bottom: 2rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .form-card h2 {
    margin-top: 0;
    color: var(--text-dark);
  }

  .form-group {
    margin-bottom: 1rem;
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
    background: var(--primary);
    color: white;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
  }

  .btn-primary:hover:not(:disabled) {
    background: #2563eb;
  }

  .table-container {
    background: white;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    overflow-x: auto;
  }

  .table-container h2 {
    margin-top: 0;
    color: var(--text-dark);
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

  @media (max-width: 768px) {
    .page {
      margin-left: 0;
      padding: 1rem;
    }

    .page-header h1 {
      font-size: 1.5rem;
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
