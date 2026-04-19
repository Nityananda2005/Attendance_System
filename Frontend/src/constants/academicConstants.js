export const ACADEMIC_STRUCTURE = {
  'B.Tech': [
    'CSE',
    'IT',
    'ECE',
    'EE',
    'ME',
    'CE'
  ],
  'MCA': [
    'General'
  ],
  'MBA': [
    'HR',
    'Finance',
    'Marketing'
  ],
  'Common': [
    'AI / ML Workshop',
    'Soft Skill'
  ]
};

export const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8, 'Batch A', 'Batch B'];

export const formatSemester = (sem) => {
  if (!sem) return 'N/A';
  if (typeof sem === 'number') {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const v = sem % 100;
    const suffix = suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0];
    return `${sem}${suffix} Semester`;
  }
  return sem; // Fallback for strings
};
