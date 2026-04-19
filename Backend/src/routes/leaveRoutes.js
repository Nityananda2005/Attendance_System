import express from "express";
import { 
  applyLeave, 
  getMyLeaves, 
  getAllLeaves, 
  updateLeaveStatus,
  deleteLeave,
  deleteAllMyLeaves,
  deleteAllLeaves
} from "../controllers/leaveController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/apply", protect, applyLeave);
router.get("/my", protect, getMyLeaves);
router.delete("/my/all", protect, deleteAllMyLeaves);

router.get("/manage", protect, adminOnly, getAllLeaves);
router.delete("/manage/all", protect, adminOnly, deleteAllLeaves);
router.put("/:id/status", protect, adminOnly, updateLeaveStatus);
router.delete("/:id", protect, deleteLeave);

export default router;
