import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.js';
import studentRoutes from './routes/students.js';
import teacherRoutes from './routes/teachers.js';
import courseRoutes from './routes/courses.js';
import enrollmentRoutes from './routes/enrollments.js';
import courseAssignmentRoutes from './routes/course-assignments.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

//  Enable CORS before routes
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://student-teacher-management-system-iahm1654l.vercel.app",
    "https://student-teacher-managem-git-679121-subodh-kumar-mahtos-projects.vercel.app", //  Add this
    "https://student-teacher-management-system-nine.vercel.app" // add this

  ],
  credentials: true // important for cookies
}));

//  Body parser
app.use(express.json());

//  Cookie parser must be before routes
app.use(cookieParser());

//  Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/course-assignments', courseAssignmentRoutes);
app.use('/api/enrollments', enrollmentRoutes);

//  Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

//  Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
