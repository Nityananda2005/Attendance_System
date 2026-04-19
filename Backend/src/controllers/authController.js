import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendRoleNotification } from "../utils/sseProvider.js";

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "default_secret_key", {
    expiresIn: "30d",
  });
};

export const registerUser = async (req, res) => {
  const { name, email, password, role, enrollmentId, program, branch, semester, additionalCourses } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please enter all fields" });
    }

    // Force role to student for public registration
    const userRole = "student";
    
    // Explicitly reject non-student roles
    if (role && role !== "student") {
       return res.status(403).json({ message: "Registering as Faculty or Admin is restricted. Contact the Administrator." });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      rawPassword: password,
      role: userRole,
      enrollmentId: enrollmentId?.trim() || `STU-${Math.random().toString(36).substring(7).toUpperCase()}`,
      department: branch ? [branch] : [], // For backward compatibility
      program,
      branch,
      semester,
      additionalCourses: additionalCourses || [],
      approvalStatus: 'pending' // New students start as pending
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        enrollmentId: user.enrollmentId,
        department: user.department,
        program: user.program,
        branch: user.branch,
        semester: user.semester,
        batch: user.batch,
        batchSection: user.batchSection,
        residence: user.residence,
        phone: user.phone,
        emergencyContact: user.emergencyContact,
        additionalCourses: user.additionalCourses,
        approvalStatus: user.approvalStatus,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        enrollmentId: user.enrollmentId,
        department: user.department,
        program: user.program,
        branch: user.branch,
        semester: user.semester,
        batch: user.batch,
        batchSection: user.batchSection,
        residence: user.residence,
        phone: user.phone,
        emergencyContact: user.emergencyContact,
        additionalCourses: user.additionalCourses,
        approvalStatus: user.approvalStatus,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { department, program, branch, batchSection, batch, semester, residence, phone, emergencyContact, name, enrollmentId, additionalCourses } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name;
    if (enrollmentId !== undefined) user.enrollmentId = enrollmentId;
    if (department !== undefined) user.department = department;
    if (program !== undefined) user.program = program;
    if (branch !== undefined) {
      user.branch = branch;
      // Also update department array for backward compatibility
      user.department = [branch];
    }
    if (batchSection !== undefined) user.batchSection = batchSection;
    if (batch !== undefined) user.batch = batch;
    if (semester !== undefined) user.semester = semester;
    if (residence !== undefined) user.residence = residence;
    if (phone !== undefined) user.phone = phone;
    if (emergencyContact !== undefined) user.emergencyContact = emergencyContact;
    if (additionalCourses !== undefined) user.additionalCourses = additionalCourses;

    // Reset status to pending if it was rejected (allows resubmission)
    if (user.role === 'student' && user.approvalStatus === 'rejected') {
      user.approvalStatus = 'pending';
    }

    const updatedUser = await user.save();

    // Trigger Real-time update for Admin if student profile is complete
    if (updatedUser.role === 'student') {
      const requiredFields = ['enrollmentId', 'program', 'branch', 'semester', 'batchSection', 'residence', 'phone'];
      const isComplete = requiredFields.every(f => updatedUser[f] && updatedUser[f].toString().trim() !== '');
      
      if (isComplete) {
        sendRoleNotification('admin', {
          type: 'STUDENT_PROFILE_UPDATED',
          message: `${updatedUser.name} has updated their profile and is waiting for approval.`,
          studentId: updatedUser._id,
          studentName: updatedUser.name
        });
      }
    }

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      enrollmentId: updatedUser.enrollmentId,
      department: updatedUser.department,
      program: updatedUser.program,
      branch: updatedUser.branch,
      batchSection: updatedUser.batchSection,
      semester: updatedUser.semester,
      residence: updatedUser.residence,
      phone: updatedUser.phone,
      emergencyContact: updatedUser.emergencyContact,
      additionalCourses: updatedUser.additionalCourses,
      approvalStatus: updatedUser.approvalStatus,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
