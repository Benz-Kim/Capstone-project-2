
/* ═══════════════════════════════════
   data.js — Static lookup tables
   ═══════════════════════════════════ */

const CHECK_SVG = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';

const LVL_LABELS = ['Very Low', 'Low', 'Average', 'Strong', 'Very Strong'];

const TRACK_NAMES = {
  science:    'Science & Engineering',
  medical:    'Medical / Pharmacy',
  humanities: 'Humanities / Social Sciences',
  arts:       'Arts & Performance',
  business:   'Business & Economics',
  abroad:     'Study Abroad',
};

const BIBLE_VERSES = [
  { text: '“I can do all things through him who strengthens me.”', ref: '— Philippians 4:13' },
  { text: '“For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.”', ref: '— Jeremiah 29:11' },
  { text: '“But those who hope in the Lord will renew their strength. They will soar on wings like eagles.”', ref: '— Isaiah 40:31' },
  { text: '“Trust in the Lord with all your heart, and do not lean on your own understanding.”', ref: '— Proverbs 3:5' },
  { text: '“Delight yourself in the Lord, and he will give you the desires of your heart.”', ref: '— Psalm 37:4' },
];

const TRACK_CAPS = {
  science:    ['Advanced Math', 'Physics/Chemistry', 'Coding Basics', 'Exam Prep', 'Engineering Portfolio'],
  medical:    ['Biology', 'Organic Chemistry', 'High-Level Exam Prep', 'Interview Prep', 'Research Experience'],
  humanities: ['Reading Comprehension', 'Social Studies Deep Dive', 'Essay Writing', 'Language Skills', 'Critical Thinking'],
  arts:       ['Skill Development', 'Portfolio', 'Art Theory', 'English', 'Audition Prep'],
  business:   ['Math & Statistics', 'Economics Fundamentals', 'English Essay', 'Social Studies', 'Business Writing'],
  abroad:     ['SAT/ACT', 'Advanced Math', 'Programming', 'Research Project', 'Essay & Recommendations'],
};

const TRACK_MILESTONES = {
  science:    [['Foundation Check & Plan', 'Complete'], ['Advanced Math Course', 'In Progress'], ['Physics/Chemistry Mastery', 'Planned'], ['Mock Exams & Review', 'Planned'], ['Final Applications & Interviews', 'Planned']],
  medical:    [['Foundation Check & Plan', 'Complete'], ['Biology Deep Dive', 'In Progress'], ['Chemistry Intensive', 'Planned'], ['Exam Simulations & Feedback', 'Planned'], ['Medical School Applications & Interviews', 'Planned']],
  humanities: [['Foundation Check & Plan', 'Complete'], ['Language Reading Focus', 'In Progress'], ['Social Studies Review', 'Planned'], ['Essay Practice', 'Planned'], ['College Exams & Applications', 'Planned']],
  arts:       [['Foundation Check & Plan', 'Complete'], ['Portfolio Skill Building', 'In Progress'], ['Portfolio Creation', 'Planned'], ['Audition Prep', 'Planned'], ['Performance Applications & Interviews', 'Planned']],
  business:   [['Foundation Check & Plan', 'Complete'], ['Math/Statistics Strengthening', 'In Progress'], ['Economics Mastery', 'Planned'], ['English Essay Writing', 'Planned'], ['Business Applications & Interviews', 'Planned']],
  abroad:     [['Foundation Check & Plan', 'Complete'], ['SAT Basics', 'In Progress'], ['Research Project Start', 'Planned'], ['Target Score Achievement', 'Planned'], ['University Applications & Essays', 'Planned']],
};

const TRACK_BARS = {
  science:    [['Math', '#185FA5'], ['Physics/Chemistry', '#1D9E75'], ['English', '#EF9F27'], ['Portfolio', '#D4537E']],
  medical:    [['Biology', '#185FA5'], ['Chemistry', '#1D9E75'], ['Language Arts', '#EF9F27'], ['Interview Prep', '#D4537E']],
  humanities: [['Language Arts', '#185FA5'], ['Social Studies', '#1D9E75'], ['English', '#EF9F27'], ['Essay Writing', '#D4537E']],
  arts:       [['Practical Skill', '#185FA5'], ['Portfolio', '#1D9E75'], ['Theory', '#EF9F27'], ['English', '#D4537E']],
  business:   [['Math/Statistics', '#185FA5'], ['Economics', '#1D9E75'], ['English', '#EF9F27'], ['Essay Writing', '#D4537E']],
  abroad:     [['Math', '#185FA5'], ['SAT English', '#1D9E75'], ['Coding', '#EF9F27'], ['Portfolio', '#D4537E']],
};

const TRACK_TASKS = {
  science:    [{n:'Solve 30 advanced math problems', d:'2 hours', s:'s-math'}, {n:'Review physics concepts', d:'1 hour', s:'s-sci'}, {n:'Analyze past exam questions', d:'45 min', s:'s-kor'}, {n:'Memorize English vocabulary', d:'30 min', s:'s-eng'}],
  medical:    [{n:'Organize biology units', d:'2 hours', s:'s-sci'}, {n:'Practice organic chemistry reactions', d:'1.5 hours', s:'s-sci'}, {n:'Read advanced Korean passages', d:'1 hour', s:'s-kor'}, {n:'Study medical English articles', d:'30 min', s:'s-eng'}],
  humanities: [{n:'Read 5 critical passages', d:'1 hour', s:'s-kor'}, {n:'Review social studies concepts', d:'1.5 hours', s:'s-soc'}, {n:'Write one essay', d:'2 hours', s:'s-kor'}, {n:'Practice English reading', d:'30 min', s:'s-eng'}],
  arts:       [{n:'Practice fundamentals', d:'2 hours', s:'s-math'}, {n:'Work on portfolio', d:'1.5 hours', s:'s-cs'}, {n:'Study art theory', d:'1 hour', s:'s-soc'}, {n:'Practice English conversation', d:'30 min', s:'s-eng'}],
  business:   [{n:'Solve calculus/statistics problems', d:'1.5 hours', s:'s-math'}, {n:'Review economics concepts', d:'1 hour', s:'s-soc'}, {n:'Write an English essay', d:'1 hour', s:'s-eng'}, {n:'Summarize current affairs', d:'30 min', s:'s-soc'}],
  abroad:     [{n:'Solve SAT Math problems', d:'2 hours', s:'s-math'}, {n:'Practice SAT English reading', d:'1 hour', s:'s-sat'}, {n:'Work on coding project', d:'1.5 hours', s:'s-cs'}, {n:'Draft an application essay', d:'1 hour', s:'s-eng'}],
};

const TRACK_PRESETS = {
  science:    ['KAIST Electrical Engineering', 'POSTECH Computer Engineering', 'Seoul National University Engineering', 'Samsung Research'],
  medical:    ['Seoul National University Medicine', 'Yonsei University Medical School', 'Korea University Medical School', 'Pharmacy School Admission'],
  humanities: ['Seoul National University Law', 'HUFS International Studies', 'Yonsei Social Sciences', 'Diplomatic Service Exam'],
  arts:       ['Hongik University Art', 'K-Arts Admission', 'K-POP Artist Debut', 'National Ballet Troupe'],
  business:   ['Seoul National University Business', 'Korea University Business', 'CFA Certification', 'Corporate Management Job'],
  abroad:     ['Stanford CS', 'MIT Engineering', 'Harvard Business School', 'Oxford / Cambridge'],
};

const TRACK_SUBJECTS = {
  science:    ['Math', 'Physics', 'Chemistry', 'English', 'Computer Science'],
  medical:    ['Math', 'Biology', 'Chemistry', 'English', 'Korean'],
  humanities: ['Korean', 'Social Studies', 'History', 'English', 'Essay Writing'],
  arts:       ['Major Skills', 'Korean', 'English', 'Art Theory', 'Portfolio'],
  business:   ['Math', 'Economics', 'English', 'Social Studies', 'Essay Writing'],
  abroad:     ['Math', 'SAT English', 'Coding', 'Science', 'Essay'],
};

const TASK_SUBJECT_LIST  = ['s-math','s-cs','s-sat','s-sci','s-eng','s-kor','s-soc'];
const TASK_SUBJECT_NAMES = ['Math','CS','SAT','Science','English','Korean','Social Studies'];
