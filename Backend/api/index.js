import app from "../src/app.js";
import connectDB from "../src/DB/db.js";
import dotenv from "dotenv";

dotenv.config();

// Create a simple root route for "Server is running" display
app.get("/", (req, res) => {
  res.send("<h1>Server is running successfully!</h1><p>Attendify Backend is ready for requests.</p>");
});

// Bridge to handle DB connection in serverless environment
const handler = async (req, res) => {
  try {
    // connectDB() has its own check or we can rely on mongoose readyState
    await connectDB();
    return app(req, res);
  } catch (error) {
    console.error("Serverless handler error:", error);
    res.status(500).json({ error: "External Server Error", message: error.message });
  }
};

export default handler;
