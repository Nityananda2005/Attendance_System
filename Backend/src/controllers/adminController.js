import User from "../models/User.js";
import Session from "../models/Session.js";
import Attendance from "../models/Attendance.js";
import { sendIndividualNotification } from "../utils/sseProvider.js";
import bcrypt from "bcryptjs";

/**
 * @desc    Get counts for admin dashboard (Students, Faculty, Active Sessions)
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 */
export const getDashboardStats = async (req, res) => {
  try {
    const studentCount = await User.countDocuments({ role: "student" });
    const facultyCount = await User.countDocuments({ role: "faculty" });
    const activeSessionsCount = await Session.countDocuments({ status: "active" });
    const totalSessions = await Session.countDocuments({});
    
    // Overall Attendance %
    let overallRate = 0;
    if (totalSessions > 0 && studentCount > 0) {
      const totalAttendance = await Attendance.countDocuments({});
      overallRate = Math.round((totalAttendance / (totalSessions * studentCount)) * 100);
    }

    res.json({
      students: studentCount,
      teachers: facultyCount,
      activeSessions: activeSessionsCount,
      overallAttendanceRate: overallRate
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get attendance trend for the last 7 days
 * @route   GET /api/admin/attendance-trend
 * @access  Private/Admin
 */
export const getAttendanceTrend = async (req, res) => {
  try {
    const studentCount = await User.countDocuments({ role: "student" });
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const trend = [];

    // Loop through the last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const sessionsOnDay = await Session.countDocuments({
        createdAt: { $gte: date, $lt: nextDate }
      });

      const attendanceOnDay = await Attendance.countDocuments({
        createdAt: { $gte: date, $lt: nextDate }
      });

      let rate = 0;
      if (sessionsOnDay > 0 && studentCount > 0) {
        rate = Math.round((attendanceOnDay / (sessionsOnDay * studentCount)) * 100);
      } else if (sessionsOnDay > 0) {
        // Fallback or just 0 if no students
        rate = 0;
      }

      trend.push({
        name: days[date.getDay()],
        value: rate
      });
    }

    res.json(trend);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get all active sessions
 * @route   GET /api/admin/ongoing-sessions
 * @access  Private/Admin
 */
export const getOngoingSessions = async (req, res) => {
  try {
    const ongoing = await Session.find({ status: "active" })
      .populate("facultyId", "name")
      .sort({ createdAt: -1 });

    res.json(ongoing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get session activity for the current day (midnight reset)
 * @route   GET /api/admin/recent-activity
 * @access  Private/Admin
 */
export const getRecentActivity = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    // Fetch sessions created today or updated (completed) today
    const activity = await Session.find({
      createdAt: { $gte: startOfDay }
    })
      .populate("facultyId", "name")
      .sort({ updatedAt: -1 });

    res.json(activity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get students with less than 40% attendance
 * @route   GET /api/admin/low-attendance
 * @access  Private/Admin
 */
export const getLowAttendanceAlerts = async (req, res) => {
  try {
    const students = await User.find({ role: "student" }).select("name enrollmentId department");
    const totalSessions = await Session.countDocuments({});

    if (totalSessions === 0) {
      return res.json([]);
    }

    // Get attendance counts for all students
    const attendanceCounts = await Attendance.aggregate([
      { $group: { _id: "$studentId", count: { $sum: 1 } } }
    ]);

    const attendanceMap = {};
    attendanceCounts.forEach(item => {
      attendanceMap[item._id.toString()] = item.count;
    });

    // Calculate rates and filter
    const alerts = students.map(student => {
      const presentCount = attendanceMap[student._id.toString()] || 0;
      const rate = Math.round((presentCount / totalSessions) * 100);
      return {
        _id: student._id,
        name: student.name,
        enrollmentId: student.enrollmentId,
        department: student.department || "N/A",
        percentage: rate
      };
    })
    .filter(student => student.percentage < 40)
    .sort((a, b) => a.percentage - b.percentage);

    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get all teachers
 * @route   GET /api/admin/teachers
 * @access  Private/Admin
 */
export const getTeachers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) === 0 ? 0 : (parseInt(req.query.limit) || 10);
    const skip = limit === 0 ? 0 : (page - 1) * limit;

    const search = req.query.search || "";
    const department = req.query.department || "All Departments";

    const query = { role: "faculty" };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    if (department !== "All Departments") {
      query.department = department;
    }

    const totalTeachers = await User.countDocuments(query);
    const teachers = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      teachers,
      totalTeachers,
      totalPages: Math.ceil(totalTeachers / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



/**
 * @desc    Add a new teacher
 * @route   POST /api/admin/teachers
 * @access  Private/Admin
 */
export const addTeacher = async (req, res) => {
  try {
    const { name, email, password, department, program, branch } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Teacher with this email already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const teacher = await User.create({
      name,
      email,
      password: hashedPassword,
      rawPassword: password,
      role: "faculty",
      department: department || (branch ? [branch] : []),
      program,
      branch
    });


    res.status(201).json({
      message: "Teacher profile created successfully",
      teacher: {
        _id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        department: teacher.department,
        joined: teacher.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Delete a teacher
 * @route   DELETE /api/admin/teachers/:id
 * @access  Private/Admin
 */
export const deleteTeacher = async (req, res) => {
  try {
    const teacherId = req.params.id;
    const teacher = await User.findById(teacherId);
    
    if (!teacher || teacher.role !== 'faculty') {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // 1. Find all sessions associated with this teacher
    const sessions = await Session.find({ facultyId: teacherId });
    const sessionIds = sessions.map(s => s._id);

    // 2. Delete all attendance records for those sessions
    if (sessionIds.length > 0) {
      await Attendance.deleteMany({ sessionId: { $in: sessionIds } });
    }

    // 3. Delete all sessions created by this teacher
    await Session.deleteMany({ facultyId: teacherId });

    // 4. Finally, delete the teacher account
    await User.findByIdAndDelete(teacherId);

    res.json({ 
      message: "Teacher account and all associated session history removed permanently" 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Update a teacher
 * @route   PUT /api/admin/teachers/:id
 * @access  Private/Admin
 */
export const updateTeacher = async (req, res) => {
  try {
    const { name, email, password, department, program, branch } = req.body;
    const teacherId = req.params.id;

    // 1. Initial checks
    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== 'faculty') {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // 2. Prepare update object
    const updateData = {};
    if (name) updateData.name = name;
    if (department) updateData.department = department;
    if (program) updateData.program = program;
    if (branch) updateData.branch = branch;
    
    if (email && email !== teacher.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) return res.status(400).json({ message: "Email already taken" });
      updateData.email = email;
    }

    // 3. Handle password update
    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
      updateData.rawPassword = password;
    }

    // 4. Perform update
    const updatedUser = await User.findByIdAndUpdate(
      teacherId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password");

    res.json({
      message: "Teacher account updated successfully",
      teacher: updatedUser
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get all students
 * @route   GET /api/admin/students
 * @access  Private/Admin
 */
export const getStudents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) === 0 ? 0 : (parseInt(req.query.limit) || 10);
    const skip = limit === 0 ? 0 : (page - 1) * limit;
    const search = req.query.search || "";
    const department = req.query.department || "All Branches";
    const program = req.query.program || "All Programs";

    const query = { role: "student" };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { enrollmentId: { $regex: search, $options: "i" } }
      ];
    }

    if (program !== "All Programs") {
      query.program = program;
    }

    if (department !== "All Branches" && department !== "All Departments") {
      query.$or = (query.$or || []).concat([
        { branch: { $regex: department, $options: "i" } },
        { department: { $regex: department, $options: "i" } }
      ]);
    }

    // Filter: Only show students with 100% complete profiles
    query.enrollmentId = { $exists: true, $ne: "" };
    query.program = { $exists: true, $ne: "" };
    query.branch = { $exists: true, $ne: "" };
    query.semester = { $exists: true, $ne: null };
    query.batchSection = { $exists: true, $ne: "" };
    query.residence = { $exists: true, $ne: "" };
    query.phone = { $exists: true, $ne: "" };


    const totalStudents = await User.countDocuments(query);
    const pendingCount = await User.countDocuments({ ...query, approvalStatus: 'pending' });
    const students = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      students,
      totalStudents,
      pendingCount,
      totalPages: limit === 0 ? 1 : Math.ceil(totalStudents / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Delete a User (Teacher or Student)
 * @route   DELETE /api/admin/users/:id
 * @access  Private/Admin
 */
export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Perform cascading deletions based on role
    if (user.role === 'faculty') {
      // Delete sessions and their attendance
      const sessions = await Session.find({ facultyId: userId });
      const sessionIds = sessions.map(s => s._id);
      
      if (sessionIds.length > 0) {
        await Attendance.deleteMany({ sessionId: { $in: sessionIds } });
      }
      await Session.deleteMany({ facultyId: userId });
      
    } else if (user.role === 'student') {
      // Delete student's attendance records
      await Attendance.deleteMany({ studentId: userId });
    }

    // Finally delete the user
    await User.findByIdAndDelete(userId);
    
    res.json({ message: "Account and associated data removed permanently" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Update student details
 * @route   PUT /api/admin/students/:id
 * @access  Private/Admin
 */
export const updateStudent = async (req, res) => {
  try {
    const { name, email, enrollmentId, department, program, branch, semester, password } = req.body;
    const student = await User.findById(req.params.id);

    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (enrollmentId) updateData.enrollmentId = enrollmentId;
    if (program) updateData.program = program;
    if (branch) {
      updateData.branch = branch;
      updateData.department = [branch];
    }
    if (semester !== undefined) updateData.semester = semester;

    if (email && email !== student.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) return res.status(400).json({ message: "Email already taken" });
      updateData.email = email;
    }

    if (password && password.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
      updateData.rawPassword = password;
    }

    const updatedStudent = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password");

    res.json({ message: "Student profile updated", student: updatedStudent });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Delete all teachers and their history
 * @route   DELETE /api/admin/teachers/all
 * @access  Private/Admin
 */
export const deleteAllTeachers = async (req, res) => {
  try {
    // 1. Delete all Attendance records
    await Attendance.deleteMany({});
    // 2. Delete all Session records
    await Session.deleteMany({});
    // 3. Delete all Faculty users
    await User.deleteMany({ role: "faculty" });

    res.json({ message: "ALL faculty members and session history removed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Delete all students and their attendance history
 * @route   DELETE /api/admin/students/all
 * @access  Private/Admin
 */
export const deleteAllStudents = async (req, res) => {
  try {
    // 1. Delete all Attendance records
    await Attendance.deleteMany({});
    // 2. Delete all Student users
    await User.deleteMany({ role: "student" });

    res.json({ message: "ALL student accounts and attendance records removed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Update a student's approval status
 * @route   PUT /api/admin/students/:id/status
 * @access  Private/Admin
 */
export const updateStudentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const studentId = req.params.id;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: "Student not found" });
    }

    student.approvalStatus = status;
    await student.save();

    // Notify student if rejected
    if (status === 'rejected') {
      sendIndividualNotification(studentId, {
        type: 'PROFILE_REJECTED',
        message: 'Your profile application has been rejected. Please review and update your information.',
      });
    }

    res.json({
      message: `Student account ${status} successfully`,
      student: {
        _id: student._id,
        name: student.name,
        approvalStatus: student.approvalStatus
      }
    });

    // Notify student if approved (Real-time access sync)
    if (status === 'approved') {
      sendIndividualNotification(studentId, {
        type: 'PROFILE_APPROVED',
        message: 'Congratulations! Your profile has been approved. You now have full access to the dashboard.',
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Approve all pending students
 * @route   PUT /api/admin/students/bulk/approve-all
 * @access  Private/Admin
 */
export const approveAllStudents = async (req, res) => {
  try {
    // 1. Get IDs of all pending students BEFORE updating
    const pendingStudents = await User.find({ role: 'student', approvalStatus: 'pending' }).select('_id');
    const studentIds = pendingStudents.map(s => s._id);

    // 2. Perform bulk update
    const result = await User.updateMany(
      { role: 'student', approvalStatus: 'pending' },
      { $set: { approvalStatus: 'approved' } }
    );

    res.json({
      message: `${result.modifiedCount} pending student accounts approved successfully`,
      count: result.modifiedCount
    });

    // 3. Notify all approved students
    studentIds.forEach(id => {
      sendIndividualNotification(id, {
        type: 'PROFILE_APPROVED',
        message: 'Great news! Your profile has been approved by the admin. Refreshing your dashboard access now.',
      });
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
