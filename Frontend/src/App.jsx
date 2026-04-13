import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './auth/Login'
import Register from './auth/Register'
import Dashboard from './pages/student/Dashboard'
import MarkAttendance from './pages/student/MarkAttendance'
import History from './pages/student/History'
import Profile from './pages/student/Profile'
import Leaderboard from './pages/student/Leaderboard'
import FacultyDashboard from './pages/faculty/FacultyDashboard'
import CreateSession from './pages/faculty/CreateSession'
import AttendanceList from './pages/faculty/AttendanceList'
import FacultyProfile from './pages/faculty/FacultyProfile'

import SplashPage from './pages/splaspage'
import AdminDashboard from './pages/admin/AdminDashboard'
import Teachers from './pages/admin/Teachers'
import Students from './pages/admin/Students'
import AdminProfile from './pages/admin/AdminProfile'

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<SplashPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Student Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute allowedRole="student"><Dashboard /></ProtectedRoute>} />
          <Route path="/mark-attendance" element={<ProtectedRoute allowedRole="student"><MarkAttendance /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute allowedRole="student"><History /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute allowedRole="student"><Profile /></ProtectedRoute>} />

          <Route path="/leaderboard" element={<ProtectedRoute allowedRole="student"><Leaderboard /></ProtectedRoute>} />

          {/* Faculty Protected Routes */}
          <Route path="/faculty-dashboard" element={<ProtectedRoute allowedRole="faculty"><FacultyDashboard /></ProtectedRoute>} />
          <Route path="/create-session" element={<ProtectedRoute allowedRole="faculty"><CreateSession /></ProtectedRoute>} />
          <Route path="/attendance-list" element={<ProtectedRoute allowedRole="faculty"><AttendanceList /></ProtectedRoute>} />
          <Route path="/faculty-profile" element={<ProtectedRoute allowedRole="faculty"><FacultyProfile /></ProtectedRoute>} />


          {/* Admin Protected Routes */}
          <Route path="/admin-dashboard" element={<ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/teachers" element={<ProtectedRoute allowedRole="admin"><Teachers /></ProtectedRoute>} />
          <Route path="/admin/students" element={<ProtectedRoute allowedRole="admin"><Students /></ProtectedRoute>} />
          <Route path="/admin/profile" element={<ProtectedRoute allowedRole="admin"><AdminProfile /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </ThemeProvider>
  )
}

export default App