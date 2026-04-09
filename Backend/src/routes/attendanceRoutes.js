import express from "express";
import {
  markAttendance,
  getSessionAttendance,
  getStudentHistory,
  getStudentAnalytics,
  deleteAttendance
} from "../controllers/attendanceController.js";
import { protect, facultyOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/mark", protect, markAttendance);
router.get("/session/:sessionId", protect, facultyOnly, getSessionAttendance);
router.get("/student/history", protect, getStudentHistory);
router.get("/student/analytics", protect, getStudentAnalytics);
router.delete("/:id", protect, facultyOnly, deleteAttendance);

export default router;
