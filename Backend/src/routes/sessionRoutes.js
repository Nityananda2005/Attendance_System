import express from "express";
import {
  createSession,
  getFacultySessions,
  verifySessionCode,
  closeSession
} from "../controllers/sessionController.js";
import { protect, facultyOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, facultyOnly, createSession);
router.get("/faculty", protect, facultyOnly, getFacultySessions);
router.get("/verify/:code", protect, verifySessionCode);
router.put("/:id/close", protect, facultyOnly, closeSession);

export default router;
