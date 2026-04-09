import Attendance from "../models/Attendance.js";
import Session from "../models/Session.js";

// Haversine formula to calculate distance between two lat/lng coordinates in meters
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth's radius in meters
  const toRadians = (deg) => (deg * Math.PI) / 180;
  
  const φ1 = toRadians(lat1);
  const φ2 = toRadians(lat2);
  const Δφ = toRadians(lat2 - lat1);
  const Δλ = toRadians(lon2 - lon1);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

// @desc    Student marks attendance
// @route   POST /api/attendance/mark
// @access  Private/Student
export const markAttendance = async (req, res) => {
  const { sessionCode, location } = req.body;
  const lat = location?.lat;
  const lng = location?.lng;

  try {
    // 1. Verify session constraints
    const session = await Session.findOne({ sessionCode, status: "active" });

    if (!session) {
      return res.status(404).json({ message: "Invalid or inactive session code" });
    }

    // 2. Location verification (If faculty required location)
    if (session.location && session.location.lat && session.location.lng) {
      if (!lat || !lng) {
        return res.status(400).json({ message: "Location data is required for this session" });
      }

      const distance = calculateDistance(
        session.location.lat,
        session.location.lng,
        lat,
        lng
      );

      if (distance > session.radiusAllowed) {
        return res.status(403).json({ 
          message: "You are too far from the class location to mark attendance",
          distance: Math.round(distance),
        });
      }
    }

    // 3. Prevent duplicate marking
    const alreadyMarked = await Attendance.findOne({
      sessionId: session._id,
      studentId: req.user._id,
    });

    if (alreadyMarked) {
      return res.status(400).json({ message: "You have already marked your attendance" });
    }

    // 4. Mark attendance
    const attendance = await Attendance.create({
      sessionId: session._id,
      studentId: req.user._id,
      status: "present",
    });

    res.status(201).json({ message: "Attendance marked successfully!", attendance });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Attendance already marked" });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get attendance records for a specific session
// @route   GET /api/attendance/session/:sessionId
// @access  Private/Faculty
export const getSessionAttendance = async (req, res) => {
  try {
    const attendanceRecords = await Attendance.find({ sessionId: req.params.sessionId })
      .populate("studentId", "name email enrollmentId")
      .sort({ markedAt: -1 });

    res.json(attendanceRecords);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get attendance history for a student
// @route   GET /api/attendance/student/history
// @access  Private/Student
export const getStudentHistory = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { department, semester } = req.user;

    const attendedRecords = await Attendance.find({ studentId })
      .populate({
        path: "sessionId",
        select: "courseId courseName topic sessionCode createdAt status location radiusAllowed",
        populate: { path: "facultyId", select: "name" }
      });

    const attendedCourseIds = [...new Set(attendedRecords.map(r => r.sessionId?.courseId).filter(Boolean))];

    // As requested: EVERY created session globally is tracked for every student
    let allExpectedSessions = await Session.find({}).populate({ path: "facultyId", select: "name" });

    const historyList = [];
    const attendedMapping = {};
    attendedRecords.forEach(record => {
       if (record.sessionId && record.sessionId._id) {
          attendedMapping[record.sessionId._id.toString()] = record;
       }
    });

    allExpectedSessions.forEach(session => {
       const record = attendedMapping[session._id.toString()];
       if (record) {
          historyList.push({
             _id: record._id,
             sessionId: session,
             markedAt: record.createdAt,
             status: 'Present'
          });
       } else if (session.status === 'completed') {
          historyList.push({
             _id: `absent_${session._id}`,
             sessionId: session,
             markedAt: null,
             status: 'Absent'
          });
       }
    });

    historyList.sort((a, b) => new Date(b.sessionId?.createdAt) - new Date(a.sessionId?.createdAt));

    res.json(historyList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get attendance analytics for a student
// @route   GET /api/attendance/student/analytics
// @access  Private/Student
export const getStudentAnalytics = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { department, semester } = req.user;

    const attendedRecords = await Attendance.find({ studentId }).populate("sessionId");
    const attendedCourseIds = [...new Set(attendedRecords.map(r => r.sessionId?.courseId).filter(Boolean))];

    // As requested: EVERY created session globally is tracked for every student
    let finalSessions = await Session.find({});

    if (finalSessions.length === 0) {
      return res.json({
        totalSessions: 0,
        totalPresentDays: 0,
        overallAttendanceRate: 0,
        courseAttendance: []
      });
    }

    // Count presence based on the new absent tracking rules
    // Only 'completed' sessions count towards total if not attended. 
    // Actually, all active AND completed sessions count towards total.
    let totalSessions = 0;
    let totalPresentDays = 0;
    
    // We already found all sessions. Attended ones are always present. 
    // But what if they attended an active session? They are present.
    totalSessions = finalSessions.length;
    
    // Attended mapping
    const attendedMapping = {};
    attendedRecords.forEach(record => {
       if (record.sessionId && record.sessionId._id) {
          attendedMapping[record.sessionId._id.toString()] = record;
       }
    });

    finalSessions.forEach(session => {
       if (attendedMapping[session._id.toString()]) {
          totalPresentDays++;
       } else if (session.status === 'active') {
          // You could choose to exclude active sessions from 'Total' until ended.
          // But to be consistent with historyList showing absent for ended:
          // Let's keep it in totalSessions but they aren't marked present.
       }
    });
    const overallAttendanceRate = totalSessions > 0 ? Math.round((totalPresentDays / totalSessions) * 100) : 0;

    // Group sessions by course
    const courseData = {};
    finalSessions.forEach(session => {
       if (!courseData[session.courseId]) {
          courseData[session.courseId] = {
             courseId: session.courseId,
             courseName: session.courseName,
             total: 0,
             present: 0
          };
       }
       courseData[session.courseId].total += 1;
    });

    // Count presence in those sessions
    attendedRecords.forEach(record => {
       if (record.sessionId && courseData[record.sessionId.courseId]) {
          courseData[record.sessionId.courseId].present += 1;
       }
    });

    // Convert to array and calculate rates
    const courseAttendance = Object.values(courseData).map(course => ({
       ...course,
       rate: course.total > 0 ? Math.round((course.present / course.total) * 100) : 0
    }));

    res.json({
      totalSessions,
      totalPresentDays,
      overallAttendanceRate,
      courseAttendance
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete an attendance record
// @route   DELETE /api/attendance/:id
// @access  Private/Faculty
export const deleteAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) {
      return res.status(404).json({ message: "Attendance record not found" });
    }

    // Verify the faculty owns the session before deleting
    const session = await Session.findById(attendance.sessionId);
    if (!session || session.facultyId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this record" });
    }

    await Attendance.findByIdAndDelete(req.params.id);
    res.json({ message: "Attendance record deleted securely" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
