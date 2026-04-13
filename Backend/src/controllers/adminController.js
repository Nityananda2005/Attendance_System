import User from "../models/User.js";
import Session from "../models/Session.js";
import Attendance from "../models/Attendance.js";
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
    const { name, email, password, department } = req.body;

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
      rawPassword: password, // Store plain text for Admin
      role: "faculty",
      department
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
    const teacher = await User.findById(req.params.id);
    if (!teacher || teacher.role !== 'faculty') {
      return res.status(404).json({ message: "Teacher not found" });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Teacher account removed permanently" });
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
    const { name, email, password, department } = req.body;
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

    const query = { role: "student" };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { enrollmentId: { $regex: search, $options: "i" } }
      ];
    }

    if (department !== "All Branches" && department !== "All Departments") {
      query.department = { $regex: department, $options: "i" }; 
    }


    const totalStudents = await User.countDocuments(query);
    const students = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      students,
      totalStudents,
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
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Account removed permanently" });
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
    const { name, email, enrollmentId, department, semester, password } = req.body;
    const student = await User.findById(req.params.id);

    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (enrollmentId) updateData.enrollmentId = enrollmentId;
    if (department) updateData.department = department;
    if (semester) updateData.semester = semester;

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
