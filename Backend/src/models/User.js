import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["student", "faculty", "admin"],
      required: true,
    },
    rawPassword: { type: String }, // Store for Admin to reset/provide if forgotten
    // Optional student fields
    enrollmentId: {
      type: String,
      sparse: true,
      unique: true,
    },
    department: { type: [String], default: [] },
    program: { type: String }, // e.g., B.Tech, MCA, MBA
    branch: { type: String },  // e.g., CSE, IT, HR...
    
    batchSection: { type: String },
    semester: { type: mongoose.Schema.Types.Mixed }, // Can be Number or String for backward compatibility
    residence: { type: String },
    phone: { type: String },
    emergencyContact: { type: String },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
