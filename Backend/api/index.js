import app from "../src/app.js";
import connectDB from "../src/DB/db.js";
import dotenv from "dotenv";

dotenv.config();

// Connect to database only once
connectDB();

// Export the app as a Vercel serverless function
export default app;
