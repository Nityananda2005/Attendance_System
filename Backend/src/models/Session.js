import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    facultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseId: {
      type: String,
      required: true,
    },
    courseName: {
      type: String,
      required: true,
    },
    topic: {
      type: String,
      required: true,
    },
    sessionCode: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
    },
    location: {
      lat: { type: Number },
      lng: { type: Number },
    },
    radiusAllowed: {
      type: Number,
      default: 50, // Defaults to 50 meters
    },
    department: {
      type: [String],
      default: [],
    },

    semester: {
      type: String,
    },
    expiresAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

const Session = mongoose.model("Session", sessionSchema);

export default Session;
