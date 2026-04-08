import app from "./src/app.js";
import connectDB from "./src/DB/db.js";
import dotenv from "dotenv";
dotenv.config();



connectDB();

app.listen(4000,()=>{
    console.log("Server is running on Port 4000...")
})