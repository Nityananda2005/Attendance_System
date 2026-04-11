import Attendance from "../models/Attendance.js";
import Session from "../models/Session.js";
import User from "../models/User.js";

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

    const COLLEGE_LAT = 20.217364;
    const COLLEGE_LNG = 85.682077;
    // TEMPORARY BYPASS: Expanded the radius to 99,999 KM so you can test it successfully from your house!
    // Change this back to 100 when you deploy.
    const ALLOWED_RADIUS = 99999999; 

    if (!lat || !lng) {
      return res.status(400).json({ message: "Device location is required to verify your attendance!" });
    }
    
    if (lat === 0 && lng === 0) {
      return res.status(400).json({ message: "We couldn't get your GPS location. Please allow location access in your browser or wait a few seconds and try again." });
    }

    const distance = calculateDistance(
      COLLEGE_LAT,
      COLLEGE_LNG,
      lat,
      lng
    );

    if (distance > ALLOWED_RADIUS) {
      return res.status(403).json({ 
        message: `You are outside the college premises (${Math.round(distance)}m away). Attendance denied and marked as absent.`,
        distance: Math.round(distance),
      });
    }

    // Console log the accurate distance so the developer can see how far away they are
    console.log(`[TESTING] Student marked attendance from ${Math.round(distance)} meters away from college.`);

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

    // Calculate Streak
    // Sort all sessions descending to find unbroken attendance chain
    const sortedSessions = [...finalSessions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    let currentStreak = 0;
    
    for (const session of sortedSessions) {
       if (attendedMapping[session._id.toString()]) {
          currentStreak++;
       } else if (session.status === 'completed') {
          break; // Missed a completed session -> chain breaks
       }
    }

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
      currentStreak,
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
// @desc    Get global leaderboard
// @route   GET /api/attendance/leaderboard
// @access  Private/Student
export const getLeaderboard = async (req, res) => {
  try {
    const students = await User.find({ role: "student" }).select("name email profilePic department");
    const sessions = await Session.find({});
    const totalSessions = sessions.length;

    if (totalSessions === 0) {
      return res.json([]);
    }

    // Get all attendances to map to students
    const allAttendances = await Attendance.find({}).select("studentId sessionId");
    
    const attendanceMap = {};
    for (const att of allAttendances) {
      const sId = att.studentId.toString();
      if (!attendanceMap[sId]) attendanceMap[sId] = new Set();
      attendanceMap[sId].add(att.sessionId.toString());
    }

    // Calculate streaks and rates for all students
    const sortedSessions = [...sessions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const leaderboard = students.map(student => {
      const sId = student._id.toString();
      const attendedSet = attendanceMap[sId] || new Set();
      
      const totalPresentDays = attendedSet.size;
      const rate = Math.round((totalPresentDays / totalSessions) * 100);

      // Streak calculation
      let currentStreak = 0;
      for (const session of sortedSessions) {
        if (attendedSet.has(session._id.toString())) {
          currentStreak++;
        } else if (session.status === 'completed') {
          break;
        }
      }

      // Generate a mock avatar if profilePic is not implemented, else pass name mapping
      const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=334155&color=94a3b8&font-size=0.33`;

      return {
        _id: student._id,
        name: student.name,
        department: student.department || 'B.Tech',
        avatar: avatarUrl,
        attendanceRate: rate,
        totalPresentDays,
        currentStreak
      };
    });

    // Sort leaderboard primarily by attendance rate, then streak
    leaderboard.sort((a, b) => {
      if (b.attendanceRate === a.attendanceRate) {
        return b.currentStreak - a.currentStreak;
      }
      return b.attendanceRate - a.attendanceRate;
    });

    res.json(leaderboard.slice(0, 50)); // Return top 50
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
