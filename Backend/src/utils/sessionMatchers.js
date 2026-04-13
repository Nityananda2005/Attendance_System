
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
  
  const studentDepts = (Array.isArray(student.department) ? student.department : [student.department])
    .filter(Boolean).map(d => d.toString().toLowerCase().trim());
  const sessionDepts = (Array.isArray(session.department) ? session.department : [session.department])
    .filter(Boolean).map(d => d.toString().toLowerCase().trim());

  const sSem = (student.semester || '').toString().toLowerCase().trim();
  const tSem = (session.semester || '').toString().toLowerCase().trim();

  // If session doesn't target any specific department, it's global
  const isMatchingBranch = sessionDepts.length === 0 || sessionDepts.some(tDept => {
    return studentDepts.some(sDept => {
      if (!sDept || !tDept) return false;

      // Direct substring match (case insensitive already handled by map)
      if (sDept.includes(tDept) || tDept.includes(sDept)) return true;

      // Acronym match
      const sAcronym = extractAcronym(sDept);
      const tAcronym = extractAcronym(tDept);
      if (sAcronym && tAcronym && sAcronym === tAcronym) return true;

      // Shorthand match (e.g. "CSE" at the end of string)
      const sAbbr = sDept.split(' ').pop().replace(/[()]/g, '');
      const tAbbr = tDept.split(' ').pop().replace(/[()]/g, '');
      if (sAbbr.length > 1 && (tDept.includes(sAbbr) || sDept.includes(tAbbr))) return true;

      return false;
    });
  });

  // Flexible Semester Match
  const matchesSem = !tSem || sSem === tSem || sSem.includes(tSem) || tSem.includes(sSem);
  
  return isMatchingBranch && matchesSem;
};
