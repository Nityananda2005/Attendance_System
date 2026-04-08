import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "default_secret_key", {
    expiresIn: "30d",
  });
};

export const registerUser = async (req, res) => {
  const { name, email, password, role, enrollmentId } = req.body;

  try {
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Please enter all fields" });
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
      role,
      enrollmentId: role === "student" ? enrollmentId : undefined,
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
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
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
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
    const { department, batchSection, semester, residence, phone, emergencyContact, name } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name;
    if (department !== undefined) user.department = department;
    if (batchSection !== undefined) user.batchSection = batchSection;
    if (semester !== undefined) user.semester = semester;
    if (residence !== undefined) user.residence = residence;
    if (phone !== undefined) user.phone = phone;
    if (emergencyContact !== undefined) user.emergencyContact = emergencyContact;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      enrollmentId: updatedUser.enrollmentId,
      department: updatedUser.department,
      batchSection: updatedUser.batchSection,
      semester: updatedUser.semester,
      residence: updatedUser.residence,
      phone: updatedUser.phone,
      emergencyContact: updatedUser.emergencyContact,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
