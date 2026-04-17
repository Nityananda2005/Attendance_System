import Attendance from "../models/Attendance.js";
import Session from "../models/Session.js";
import User from "../models/User.js";
import { isMatchingSession } from "../utils/sessionMatchers.js";

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

const hasValidCoordinates = (location) =>
  Number.isFinite(location?.lat) && Number.isFinite(location?.lng);

// @desc    Student marks attendance
// @route   POST /api/attendance/mark
// @access  Private/Student
export const markAttendance = async (req, res) => {
  const { sessionCode, location, accuracy } = req.body;
  const lat = location?.lat;
  const lng = location?.lng;

  try {
    // 0. Ensure student's profile is complete
    const student = await User.findById(req.user._id);
    const requiredFields = ['department', 'semester', 'batchSection', 'residence', 'phone'];
    const isIncomplete = requiredFields.some(field => !student[field] || student[field].toString().trim() === '');
    
    if (isIncomplete) {
      return res.status(403).json({ 
        message: "Attendance locked. Please complete your profile details (Department, Semester, Batch, Residence, Phone) first." 
      });
    }

    // 1. Verify session constraints
    const session = await Session.findOne({ sessionCode });

    if (!session || session.status !== "active") {
      return res.status(400).json({ message: "This session is not active or has been closed." });
    }

    // 2. Check for session expiration
    if (session.expiresAt && Date.now() > new Date(session.expiresAt).getTime()) {
      return res.status(400).json({ message: "This session has expired." });
    }


    // 2. NEW: Branch & Semester Lock Verification (using consolidated helper)
    const canMark = isMatchingSession(student, session);

    if (!canMark) {
      const studentDepts = (Array.isArray(student.department) ? student.department : [student.department]);
      const sessionDepts = (Array.isArray(session.department) ? session.department : [session.department]);
      return res.status(403).json({ 
        message: `Access Denied: This session is for ${sessionDepts.join(', ')} (${session.semester || 'All Sem'}). Your profile says ${studentDepts.join(', ')} (${student.semester || 'None'}).` 
      });
    }




    // Geolocation verification is now STRICTLY ENABLED
    const geofenceEnabled = true; 

    if (geofenceEnabled) {
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return res.status(400).json({ message: "Location permission denied. Please enable GPS to mark attendance." });
      }

      if (accuracy && accuracy > 100) {
        return res.status(400).json({ message: "Location accuracy is too low. Please move to an open area and try again." });
      }

      if (!session.location || !session.location.lat || !session.location.lng) {
        // Fallback or error if session has no location stored
        return res.status(400).json({ message: "This session does not have a valid location set by the teacher." });
      }

      const distance = calculateDistance(
        session.location.lat,
        session.location.lng,
        lat,
        lng
      );

      const tolerance = 50;
      const maxAllowed = (session.radiusAllowed || 200) + tolerance;

      if (distance > maxAllowed) {
        return res.status(403).json({
          message: `You are ${Math.round(distance)}m away. Move closer to the classroom to mark attendance.`,
          distance: Math.round(distance),
          radiusAllowed: maxAllowed,
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

    // Filter sessions using the robust helper
    const allSessions = await Session.find({}).populate({ path: "facultyId", select: "name" });
    const allExpectedSessions = allSessions.filter(s => isMatchingSession(req.user, s));


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

    // Consolidate analytics filtering with the same robust helper
    const allSessions = await Session.find({}).populate({ path: "facultyId", select: "name" });
    const finalSessions = allSessions.filter(s => isMatchingSession(req.user, s));


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

    // Group sessions by course (Case-insensitive)
    const courseData = {};
    finalSessions.forEach(session => {
       const groupKey = session.courseName.trim().toLowerCase();
       if (!courseData[groupKey]) {
          courseData[groupKey] = {
             courseId: session.courseId,
             courseName: session.courseName, // Store original for display (first occurrence)
             total: 0,
             present: 0
          };
       }
       courseData[groupKey].total += 1;
    });

    // Count presence in those sessions
    attendedRecords.forEach(record => {
       const groupKey = record.sessionId?.courseName?.trim().toLowerCase();
       if (groupKey && courseData[groupKey]) {
          courseData[groupKey].present += 1;
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



