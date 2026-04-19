import Leave from "../models/Leave.js";
import User from "../models/User.js";
import { sendIndividualNotification, sendRoleNotification } from "../utils/sseProvider.js";

/**
 * @desc    Apply for leave (Faculty)
 * @route   POST /api/leaves/apply
 * @access  Private/Faculty
 */
export const applyLeave = async (req, res) => {
  const { startDate, endDate, type, reason } = req.body;

  try {
    const leave = await Leave.create({
      facultyId: req.user._id,
      startDate,
      endDate,
      type,
      reason,
      status: "pending",
    });

    // Notify all Admins
    sendRoleNotification("admin", {
      type: "NEW_LEAVE_REQUEST",
      message: `${req.user.name} has submitted a new leave request.`,
      leaveId: leave._id,
      facultyName: req.user.name
    });

    res.status(201).json({
      message: "Leave application submitted successfully",
      leave,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get my leaves (Faculty)
 * @route   GET /api/leaves/my
 * @access  Private/Faculty
 */
export const getMyLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ facultyId: req.user._id }).sort({ createdAt: -1 });
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get all leaves (Admin)
 * @route   GET /api/leaves/manage
 * @access  Private/Admin
 */
export const getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({})
      .populate("facultyId", "name email department")
      .sort({ createdAt: -1 });
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Update leave status (Admin Approve/Reject)
 * @route   PUT /api/leaves/:id/status
 * @access  Private/Admin
 */
export const updateLeaveStatus = async (req, res) => {
  const { status, adminComment } = req.body;

  try {
    const leave = await Leave.findById(req.params.id).populate("facultyId", "name");

    if (!leave) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    leave.status = status;
    leave.adminComment = adminComment || leave.adminComment;
    await leave.save();

    // Notify the specific Faculty
    sendIndividualNotification(leave.facultyId._id, {
      type: "LEAVE_STATUS_UPDATED",
      message: `Your leave request has been ${status}.`,
      status: status,
      adminComment: adminComment
    });

    res.json({
      message: `Leave request ${status} successfully`,
      leave,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
