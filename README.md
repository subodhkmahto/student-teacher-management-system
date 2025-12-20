# School Management System

A complete web application for managing students, teachers, courses, and enrollments. Built with Svelte frontend, Node.js/Express backend, and Supabase database.

## Project Structure

```
project/
├── src/                        # Frontend (Svelte)
│   ├── pages/                 # Application pages
│   │   ├── Login.svelte
│   │   ├── Register.svelte
│   │   ├── Dashboard.svelte
│   │   ├── StudentsList.svelte
│   │   ├── TeachersList.svelte
│   │   ├── CoursesList.svelte
│   │   ├── AssignCourse.svelte
│   │   ├── EnrollStudent.svelte
│   │   └── EnrollmentsView.svelte
│   ├── components/            # Reusable components
│   │   └── Sidebar.svelte
│   ├── stores/               # State management
│   │   └── auth.js
│   ├── lib/                  # Utilities
│   │   └── supabase.js
│   ├── App.svelte
│   └── main.js
├── backend/                   # Backend API
│   ├── src/
│   │   ├── server.js
│   │   ├── lib/
│   │   │   └── supabase.js
│   │   └── routes/
│   │       ├── auth.js
│   │       ├── students.js
│   │       ├── teachers.js
│   │       ├── courses.js
│   │       ├── enrollments.js
│   │       └── course-assignments.js
│   └── package.json
├── supabase/                  # Database migrations
├── package.json
├── vite.config.js
├── index.html
└── .env

```

## Features

- Authentication (Register/Login)
- Student Management
- Teacher Management
- Course Management
- Assign Courses to Teachers
- Enroll Students in Courses
- View All Enrollments
- Responsive Design
- Real-time Data Updates

## Setup

### Prerequisites
- Node.js 16+
- npm or yarn
- Supabase account

### Environment Variables

The `.env` file contains:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_SUPABASE_ANON_KEY=your_anon_key
```

### Installation

1. Install frontend dependencies:
```bash
npm install
```

2. Install backend dependencies:
```bash
cd backend
npm install
cd ..
```

## Running the Application

### Development

Terminal 1 - Frontend:
```bash
npm run dev
```
Frontend runs on `http://localhost:5173`

Terminal 2 - Backend:
```bash
cd backend
npm run dev
```
Backend API runs on `http://localhost:3000`

### Production Build

```bash
npm run build
```

## Database Schema

### Tables
- **profiles** - User profiles with authentication
- **students** - Student information
- **teachers** - Teacher information
- **courses** - Course catalog
- **course_assignments** - Teacher-course relationships
- **enrollments** - Student-course enrollments

### Security
- Row Level Security (RLS) enabled on all tables
- User-based data isolation
- Authentication-required access

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Students
- `GET /api/students` - List all students
- `GET /api/students/:id` - Get student details
- `POST /api/students` - Create student
- `PUT /api/students/:id` - Update student

### Teachers
- `GET /api/teachers` - List all teachers
- `GET /api/teachers/:id` - Get teacher details
- `POST /api/teachers` - Create teacher
- `PUT /api/teachers/:id` - Update teacher

### Courses
- `GET /api/courses` - List all courses
- `GET /api/courses/:id` - Get course details
- `POST /api/courses` - Create course
- `PUT /api/courses/:id` - Update course

### Course Assignments
- `GET /api/course-assignments` - List all assignments
- `POST /api/course-assignments` - Assign course to teacher

### Enrollments
- `GET /api/enrollments` - List all enrollments
- `GET /api/enrollments/student/:studentId` - Get student's enrollments
- `GET /api/enrollments/course/:courseId` - Get course enrollments
- `POST /api/enrollments` - Enroll student in course
- `PUT /api/enrollments/:id` - Update enrollment status

## Technologies Used

- **Frontend**: Svelte, Vite, TypeScript
- **Backend**: Node.js, Express, Cors
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: CSS3 with custom properties

## Features

### Dashboard
- Statistics overview (students, teachers, courses, enrollments)
- Quick access to all features

### Students Management
- View all students with details
- Student roll numbers and grades
- Linked with user profiles

### Teachers Management
- View all teachers
- Department and specialization info
- Linked with user profiles

### Courses Management
- Create and manage courses
- Course codes and credit hours
- Course descriptions

### Course Assignments
- Assign courses to teachers
- View current assignments
- Manage teacher workload

### Student Enrollment
- Enroll students in courses
- Prevent duplicate enrollments
- View enrollment status

### Enrollments View
- Filter by status (active, completed, dropped)
- Update enrollment status
- See student and course details

## Responsive Design

- Mobile-first approach
- Sidebar navigation on desktop
- Mobile menu toggle
- Optimized tables for all screen sizes

## Security Features

- Supabase authentication
- Row Level Security policies
- User data isolation
- Protected API endpoints
- CORS configuration

---

For questions or issues, please contact the development team.
