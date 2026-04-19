import express from "express";
import { 
  applyLeave, 
  getMyLeaves, 
  getAllLeaves, 
  updateLeaveStatus 
} from "../controllers/leaveController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/apply", protect, applyLeave);
router.get("/my", protect, getMyLeaves);

router.get("/manage", protect, adminOnly, getAllLeaves);
router.put("/:id/status", protect, adminOnly, updateLeaveStatus);

export default router;
