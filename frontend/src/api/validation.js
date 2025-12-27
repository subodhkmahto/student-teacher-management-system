export function isEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isRequired(value) {
  return value !== null && value !== undefined && String(value).trim() !== '';
}

export function minLength(value, length) {
  return String(value).trim().length >= length;
}

export function isNumber(value) {
  return !isNaN(value);
}


export function validateStudent(student) {
  if (!isRequired(student.full_name)) return 'Full name is required';
  if (!isRequired(student.email)) return 'Email is required';
  if (!isEmail(student.email)) return 'Invalid email format';
  if (!isRequired(student.roll_number)) return 'Roll number is required';
  if (!isRequired(student.grade)) return 'Grade is required';
  return null;
}

export function validateTeacher(teacher) {
  if (!isRequired(teacher.full_name)) return 'Full name is required';
  if (!isRequired(teacher.email)) return 'Email is required';
  if (!isEmail(teacher.email)) return 'Invalid email format';
  if (!isRequired(teacher.department)) return 'Department is required';
  if (!isRequired(teacher.specialization)) return 'Specialization is required';
  return null;
}

export function validateCourse(course) {
  if (!isRequired(course.name)) return 'Course name is required';
  if (!isRequired(course.code)) return 'Course code is required';
  if (course.credit_hours && !isNumber(course.credit_hours))
    return 'Credit hours must be a number';
  return null;
}

export function validateEnrollment(studentId, courseId) {
  if (!isRequired(studentId)) return 'Please select a student';
  if (!isRequired(courseId)) return 'Please select a course';
  return null;
}

export function validateAssignment(teacherId, courseId, semester) {
  if (!isRequired(teacherId)) return 'Please select a teacher';
  if (!isRequired(courseId)) return 'Please select a course';
  if (!isRequired(semester)) return 'Please select a semester';
  return null;
}
