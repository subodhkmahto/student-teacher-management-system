import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

import { authenticate } from './middleware/auth.js';
import authRoutes from './routes/auth.js';
import courseAssignmentRoutes from './routes/course-assignments.js';
import courseRoutes from './routes/courses.js';
import enrollmentRoutes from './routes/enrollments.js';
import studentRoutes from './routes/students.js';
import teacherRoutes from './routes/teachers.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

//  Enable CORS before routes
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://student-teacher-management-system-nine.vercel.app"
  ],
  credentials: true
}));

//  Body parser
app.use(express.json());

//  Cookie parser must be before routes
app.use(cookieParser());

// ============================================
// PUBLIC ROUTES (No Authentication Required)
// ============================================
app.use('/api/auth', authRoutes); // Login, Signup, etc.


//  Health check route (Public)
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});


// ============================================
// PROTECTED ROUTES (Authentication Required)
// ============================================

// Student Routes - Only authenticated users
app.use('/api/students', authenticate, studentRoutes);

// Teacher Routes - Only authenticated users
app.use('/api/teachers', authenticate, teacherRoutes);

// Course Routes - Only authenticated users
app.use('/api/courses', authenticate, courseRoutes);

// Course Assignment Routes - Only authenticated users
app.use('/api/course-assignments', authenticate, courseAssignmentRoutes);

// Enrollment Routes - Only authenticated users
app.use('/api/enrollments', authenticate, enrollmentRoutes);

// ============================================
// ROLE-BASED PROTECTED ROUTES (Examples)
// ============================================

// Example: Only teachers can create courses
// app.use('/api/courses', authenticate, authorize('teacher'), courseRoutes);

// Example: Only students can view their enrollments
// app.use('/api/enrollments', authenticate, authorize('student'), enrollmentRoutes);

// Example: Both students and teachers can access
// app.use('/api/courses', authenticate, authorize('student', 'teacher'), courseRoutes);

// ============================================
// ERROR HANDLING MIDDLEWARE
// ============================================

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl 
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(' Global Error:', err.message);
  
  // JWT errors
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }
  
  // Default server error
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

//  Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;