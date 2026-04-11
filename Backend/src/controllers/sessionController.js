import Session from "../models/Session.js";
import Attendance from "../models/Attendance.js";
import crypto from "crypto";
import { sendNotificationToStudents } from "../utils/sseProvider.js";

const COLLEGE_LOCATION = {
  lat: 20.21736,
  lng: 85.682066,
};

const COLLEGE_RADIUS_METERS = 200;

// @desc    Create a new session (Faculty only)
// @route   POST /api/sessions
// @access  Private/Faculty
export const createSession = async (req, res) => {
  const { courseId, courseName, topic, radiusAllowed, department, semester } = req.body;

  try {
    const geofenceEnabled = radiusAllowed !== null && radiusAllowed !== undefined;

    // Generate a unique 6-character alphanumeric code
    const sessionCode = crypto.randomBytes(3).toString("hex").toUpperCase();

    const session = await Session.create({
      facultyId: req.user._id,
      courseId,
      courseName,
      topic,
      sessionCode,
      location: geofenceEnabled ? COLLEGE_LOCATION : undefined,
      radiusAllowed: geofenceEnabled ? COLLEGE_RADIUS_METERS : null,
      department: department || req.user.department,
      semester: semester || req.user.semester,
    });

    sendNotificationToStudents({
      type: "NEW_SESSION",
      message: `A new session for ${courseName} has been created!`,
      sessionCode
    });

    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all sessions for a logged-in faculty
// @route   GET /api/sessions/faculty
// @access  Private/Faculty
export const getFacultySessions = async (req, res) => {
  try {
    const sessions = await Session.aggregate([
      { $match: { facultyId: req.user._id } },
      {
        $lookup: {
          from: "attendances",
          localField: "_id",
          foreignField: "sessionId",
          as: "attendanceRecords",
        },
      },
      {
        $addFields: {
          presentCount: { $size: "$attendanceRecords" },
          // Using a static estimated total for now, until enrollment features exist
          totalCount: 60 
        },
      },
      {
        $project: {
          attendanceRecords: 0,
        },
      },
      { $sort: { createdAt: -1 } },
    ]);

    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get an active session by session code
// @route   GET /api/sessions/verify/:code
// @access  Private/Student
export const verifySessionCode = async (req, res) => {
  try {
    const session = await Session.findOne({ sessionCode: req.params.code, status: "active" });

    if (!session) {
      return res.status(404).json({ message: "Invalid or expired session code" });
    }

    res.json({
      _id: session._id,
      courseName: session.courseName,
      topic: session.topic,
      facultyId: session.facultyId,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current active sessions for a student
// @route   GET /api/sessions/active
// @access  Private
export const getActiveSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ status: "active" }).sort({ createdAt: -1 });
    
    // Optional: filter out sessions the student has already attended
    const attendedRecords = await Attendance.find({ studentId: req.user._id }).select("sessionId");
    const attendedIds = attendedRecords.map(r => r.sessionId.toString());

    const unMarkedSessions = sessions.filter(
       s => !attendedIds.includes(s._id.toString())
    );

    res.json(unMarkedSessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Close an active session
// @route   PUT /api/sessions/:id/close
// @access  Private/Faculty
export const closeSession = async (req, res) => {
  try {
    const session = await Session.findOne({ _id: req.params.id, facultyId: req.user._id });

    if (!session) {
      return res.status(404).json({ message: "Session not found or unauthorized" });
    }

    if (session.status === "completed") {
      return res.status(400).json({ message: "Session is already closed" });
    }

    session.status = "completed";
    await session.save();

    res.json({ message: "Session closed successfully", session });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete all sessions and history for a faculty
// @route   DELETE /api/sessions/faculty/all
// @access  Private/Faculty
export const deleteAllFacultySessions = async (req, res) => {
  try {
    const sessions = await Session.find({ facultyId: req.user._id });
    const sessionIds = sessions.map(s => s._id);

    await Attendance.deleteMany({ sessionId: { $in: sessionIds } });
    await Session.deleteMany({ facultyId: req.user._id });

    res.json({ message: "All history data deleted securely" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


