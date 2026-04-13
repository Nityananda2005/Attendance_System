import Session from "../models/Session.js";
import Attendance from "../models/Attendance.js";
import User from "../models/User.js";
import crypto from "crypto";
import mongoose from "mongoose";
import { sendNotificationToStudents } from "../utils/sseProvider.js";
import { isMatchingSession } from "../utils/sessionMatchers.js";


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

    // 1. Determine departments for the session
    let sessionDepts = department;
    if (!sessionDepts) {
      sessionDepts = req.user.department; // Fallback to faculty departments (already an array)
    } else if (!Array.isArray(sessionDepts)) {
      sessionDepts = [sessionDepts]; // Ensure it's an array
    }


    const session = await Session.create({
      facultyId: req.user._id,
      courseId,
      courseName,
      topic,
      sessionCode,
      location: geofenceEnabled ? COLLEGE_LOCATION : undefined,
      radiusAllowed: geofenceEnabled ? COLLEGE_RADIUS_METERS : null,
      department: sessionDepts,
      semester: semester || req.user.semester,
    });


    sendNotificationToStudents({
      type: "NEW_SESSION",
      message: `A new session for ${courseName} has been created!`,
      sessionCode
    }, sessionDepts, semester || req.user.semester);


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
      { $match: { facultyId: new mongoose.Types.ObjectId(req.user._id) } },
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
          presentCount: { $size: "$attendanceRecords" }
        },
      },
      {
        $project: {
          attendanceRecords: 0
        },
      },
      { $sort: { createdAt: -1 } },
    ]);

    if (sessions.length === 0) return res.json([]);

    // Fetch all students to calculate total targeted count in JS for consistency
    const students = await User.find({ role: 'student' }).select('department semester');

    const sessionsWithCounts = sessions.map(session => {
       const targetedStudents = students.filter(student => isMatchingSession(student, session));
       return {
         ...session,
         totalCount: targetedStudents.length
       };
    });

    
    res.json(sessionsWithCounts);

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

    // Filter by branch/semester targeting
    const targetMatchedSessions = sessions.filter(s => isMatchingSession(req.user, s));

    const unMarkedSessions = targetMatchedSessions.filter(
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


