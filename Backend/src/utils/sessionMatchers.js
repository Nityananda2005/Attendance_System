
// Helper to extract acronym from department string e.g. "Computer Science (CSE)" -> "cse"
export const extractAcronym = (str) => {
  if (!str) return null;
  const match = str.match(/\((.*?)\)/);
  return match ? match[1].toLowerCase().trim() : null;
};

/**
 * Robust check if student matches session branch/semester
 * @param {Object} student - The student user object (requires department and semester)
 * @param {Object} session - The session object (requires department and semester)
 * @returns {Boolean}
 */
export const isMatchingSession = (student, session) => {
  if (!student || !session) return false;
  
  // 1. Branch/Department Matching
  const studentDepts = (Array.isArray(student.department) ? student.department : [student.department || student.branch])
    .filter(Boolean).map(d => d.toString().toLowerCase().trim());
  const sessionDepts = (Array.isArray(session.department) ? session.department : [session.department])
    .filter(Boolean).map(d => d.toString().toLowerCase().trim());

  // Program Check (Optional cross-check if session targets a program)
  if (session.program && student.program && session.program !== student.program) {
    if (session.program !== 'All Programs') return false;
  }

  const isMatchingBranch = sessionDepts.length === 0 || sessionDepts.some(tDept => {
    return studentDepts.some(sDept => {
      if (!sDept || !tDept) return false;
      // Direct substring match
      if (sDept.includes(tDept) || tDept.includes(sDept)) return true;
      // Acronym match
      const sAcronym = extractAcronym(sDept);
      const tAcronym = extractAcronym(tDept);
      if (sAcronym && tAcronym && sAcronym === tAcronym) return true;
      return false;
    });
  });

  // 2. Flexible Semester Match
  const sSemRaw = student.semester;
  const tSemRaw = session.semester;

  if (!tSemRaw) return isMatchingBranch; // Global semester

  // Standardize both to numbers if possible
  const sSemNum = parseInt(sSemRaw);
  const tSemNum = parseInt(tSemRaw);

  const matchesSem = (!isNaN(sSemNum) && !isNaN(tSemNum)) 
    ? sSemNum === tSemNum 
    : sSemRaw.toString().toLowerCase().trim().includes(tSemRaw.toString().toLowerCase().trim());
  
  return isMatchingBranch && matchesSem;
};
