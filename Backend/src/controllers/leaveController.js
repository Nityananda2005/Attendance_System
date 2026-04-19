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

/**
 * @desc    Delete a leave request (Faculty can only delete pending, Admin can delete any)
 * @route   DELETE /api/leaves/:id
 * @access  Private
 */
export const deleteLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ message: "Leave record not found" });
    }

    // Authorization: Must be owner OR admin
    const isOwner = leave.facultyId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "You are not authorized to delete this record" });
    }

    // Faculty can only delete if it's still pending
    if (!isAdmin && leave.status !== 'pending') {
      return res.status(400).json({ message: "Processed leaves cannot be deleted by faculty" });
    }

    await leave.deleteOne();

    res.json({ message: "Leave record deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Delete all my leaves (Faculty)
 * @route   DELETE /api/leaves/my/all
 * @access  Private
 */
export const deleteAllMyLeaves = async (req, res) => {
  try {
    const result = await Leave.deleteMany({ facultyId: req.user._id, status: 'pending' });
    res.json({ message: `Successfully cancelled ${result.deletedCount} pending leave requests.` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Delete all leaves (Admin)
 * @route   DELETE /api/leaves/manage/all
 * @access  Private/Admin
 */
export const deleteAllLeaves = async (req, res) => {
  try {
    const result = await Leave.deleteMany({});
    res.json({ message: `Successfully cleared ${result.deletedCount} leave records from database.` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
