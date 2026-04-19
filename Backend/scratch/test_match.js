import { isMatchingSession } from '../src/utils/sessionMatchers.js';

const testCases = [
  {
    name: "Nityananda matching AI Workshop AND Batch A",
    student: {
      name: "Nityananda",
      department: ["CSE"],
      semester: 6,
      batch: "Batch A",
      additionalCourses: ["AI/ML"]
    },
    session: {
      courseName: "AI Workshop",
      department: ["AI / ML Workshop"],
      semester: "Batch A"
    },
    expected: true
  },
  {
    name: "Regular Semester Match (Sem 6)",
    student: {
      name: "Nityananda",
      department: ["CSE"],
      semester: 6,
      batch: "Batch A",
      additionalCourses: []
    },
    session: {
      courseName: "Data Structures",
      department: ["CSE"],
      semester: 6
    },
    expected: true
  },
  {
    name: "Mismatch Batch (Student Batch B vs Session Batch A)",
    student: {
      name: "Sayed",
      department: ["CSE"],
      semester: 6,
      batch: "Batch B",
      additionalCourses: ["AI/ML"]
    },
    session: {
      courseName: "AI Workshop",
      department: ["AI / ML Workshop"],
      semester: "Batch A"
    },
    expected: false
  },
  {
    name: "Workshop Enrolled but Wrong Dept Session",
    student: {
      name: "Nityananda",
      department: ["CSE"],
      semester: 6,
      batch: "Batch A",
      additionalCourses: ["AI/ML"]
    },
    session: {
      courseName: "Soft Skill Session",
      department: ["Soft Skill"],
      semester: "Batch A"
    },
    expected: false
  }
];

testCases.forEach(tc => {
  const result = isMatchingSession(tc.student, tc.session);
  console.log(`[${result === tc.expected ? 'PASS' : 'FAIL'}] ${tc.name}`);
  if (result !== tc.expected) {
    console.log(`   Expected ${tc.expected}, got ${result}`);
  }
});
