import express from "express";
import { 
  getDashboardStats, 
  getOngoingSessions, 
  getRecentActivity, 
  getLowAttendanceAlerts, 
  getAttendanceTrend,
  getTeachers,
  addTeacher,
  deleteTeacher,
  updateTeacher,
  getStudents,
  updateStudent,
  deleteUser
} from "../controllers/adminController.js";


import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/stats", protect, adminOnly, getDashboardStats);
router.get("/ongoing-sessions", protect, adminOnly, getOngoingSessions);
router.get("/recent-activity", protect, adminOnly, getRecentActivity);
router.get("/low-attendance", protect, adminOnly, getLowAttendanceAlerts);
router.get("/attendance-trend", protect, adminOnly, getAttendanceTrend);
router.get("/teachers", protect, adminOnly, getTeachers);
router.post("/teachers", protect, adminOnly, addTeacher);
router.put("/teachers/:id", protect, adminOnly, updateTeacher);
router.delete("/teachers/:id", protect, adminOnly, deleteTeacher);
router.get("/students", protect, adminOnly, getStudents);
router.put("/students/:id", protect, adminOnly, updateStudent);
router.delete("/users/:id", protect, adminOnly, deleteUser);



export default router;
