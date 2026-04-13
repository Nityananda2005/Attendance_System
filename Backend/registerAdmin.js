import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

const registerAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB...");

        const email = "superadmin@attendify.com";
        const userExists = await User.findOne({ email });

        if (userExists) {
            console.log("Admin user already exists. Updating details...");
            const salt = await bcrypt.genSalt(10);
            userExists.name = "Principal";
            userExists.password = await bcrypt.hash("admin@2292", salt);
            userExists.role = "admin";
            await userExists.save();
            console.log("Admin user updated successfully.");
        } else {
            console.log("Creating new Admin user...");
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash("admin@2292", salt);

            await User.create({
                name: "Principal",
                email: email,
                password: hashedPassword,
                role: "admin"
            });
            console.log("Admin user registered successfully.");
        }

        process.exit(0);
    } catch (error) {
        console.error("Error registering admin:", error.message);
        process.exit(1);
    }
};

registerAdmin();
