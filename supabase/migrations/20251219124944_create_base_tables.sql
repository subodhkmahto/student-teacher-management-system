/*
  # Student-Teacher Management System Database

  1. New Tables
    - `profiles` - User profiles (students/teachers)
    - `students` - Student information
    - `teachers` - Teacher information
    - `courses` - Course information
    - `course_assignments` - Courses assigned to teachers
    - `enrollments` - Student enrollments in courses

  2. Security
    - RLS enabled on all tables
    - Policies for authenticated access control
    - Data isolation by user
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  role text CHECK (role IN ('student', 'teacher', 'admin')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  roll_number text UNIQUE NOT NULL,
  grade text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS teachers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  department text,
  specialization text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  description text,
  credit_hours integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS course_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  teacher_id uuid REFERENCES teachers(id) ON DELETE CASCADE,
  semester text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(course_id, teacher_id)
);

CREATE TABLE IF NOT EXISTS enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  enrollment_date timestamptz DEFAULT now(),
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'dropped')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(student_id, course_id)
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for students
CREATE POLICY "Everyone can view students" ON students
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Students can update own record" ON students
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for teachers
CREATE POLICY "Everyone can view teachers" ON teachers
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Teachers can update own record" ON teachers
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for courses
CREATE POLICY "Everyone can view courses" ON courses
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage courses" ON courses
  FOR INSERT TO authenticated
  -- WITH CHECK (false);
  USING (true)
  WITH CHECK (role = 'admin'); -- assuming you track role in profiles

-- RLS Policies for course_assignments
CREATE POLICY "Everyone can view course assignments" ON course_assignments
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage assignments" ON course_assignments
  FOR INSERT TO authenticated
  WITH CHECK (false);

-- RLS Policies for enrollments
CREATE POLICY "Everyone can view enrollments" ON enrollments
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Students can enroll in courses" ON enrollments
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.user_id = auth.uid()
      AND students.id = enrollments.student_id
    )
  );

CREATE POLICY "Students can update own enrollment" ON enrollments
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.user_id = auth.uid()
      AND students.id = enrollments.student_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.user_id = auth.uid()
      AND students.id = enrollments.student_id
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id);
CREATE INDEX IF NOT EXISTS idx_teachers_user_id ON teachers(user_id);
CREATE INDEX IF NOT EXISTS idx_course_assignments_teacher_id ON course_assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student_id ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments(course_id);