
import mongoose from 'mongoose';
import Session from './src/models/Session.js';
import User from './src/models/User.js';
import Attendance from './src/models/Attendance.js';
import { isMatchingSession } from './src/utils/sessionMatchers.js';
import dotenv from 'dotenv';

dotenv.config();

async function debugExport() {
  try {
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
    console.log('Connected to DB');

    const session = await Session.findOne().sort({ createdAt: -1 });
    if (!session) {
      console.log('No session found');
      return;
    }
    console.log('Session:', session.courseName, 'Dept:', session.department, 'Sem:', session.semester);

    const students = await User.find({ role: 'student' });
    console.log('Total Students:', students.length);

    const matchingStudents = students.filter(s => isMatchingSession(s, session));
    console.log('Matching Students:', matchingStudents.length);
    
    if (matchingStudents.length > 0) {
        console.log('Sample Matching Student:', matchingStudents[0].name, matchingStudents[0].department, matchingStudents[0].semester);
    } else {
        console.log('No students matching this session.');
        console.log('Sample Candidate Student:', students[0]?.name, students[0]?.department, students[0]?.semester);
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

debugExport();
