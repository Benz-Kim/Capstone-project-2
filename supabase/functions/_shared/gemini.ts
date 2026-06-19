const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const TRACK_NAMES: Record<string, string> = {
  science: 'Science & Engineering',
  medical: 'Medical / Pharmacy',
  humanities: 'Humanities / Social Sciences',
  arts: 'Arts & Performance',
  business: 'Business & Economics',
  abroad: 'Study Abroad',
};

export function buildSystemContext(profile: {
  name?: string;
  goal?: string;
  track?: string;
  year?: number | string;
  sem?: string;
  hours?: string;
  tasks?: string[];
}) {
  const track = profile.track || 'abroad';
  const trackName = TRACK_NAMES[track] || track;
  const taskList = (profile.tasks || []).join(', ') || 'none set';

  return `You are an AI study coach inside "AI Future Planner", a student planning app.
Student profile:
- Name: ${profile.name || 'Student'}
- Goal: ${profile.goal || 'Not set'}
- Academic track: ${trackName}
- Target: ${profile.year || '?'} ${profile.sem || ''}
- Daily study hours: ${profile.hours || 'Not set'}
- Today's tasks: ${taskList}

Your role: Give concise (2-3 sentences max), motivating, actionable advice specific to this student's goal and tasks.
Always be warm, supportive, and specific. Never be generic.`;
}

export async function callGemini(prompt: string, maxTokens = 200): Promise<string> {
  const key = Deno.env.get('GEMINI_API_KEY');
  if (!key) throw new Error('GEMINI_API_KEY not configured');

  const res = await fetch(`${GEMINI_API_URL}?key=${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.75, maxOutputTokens: maxTokens },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Gemini HTTP ${res.status}`);
  }

  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'No response received.';
}

export const STATIC_FALLBACK = {
  capabilities: ['Advanced Math', 'SAT/ACT', 'Programming', 'Research Project', 'Essay & Recommendations'],
  milestones: [
    { title: 'Foundation Check & Plan', status: 'Complete', focus_area: 'Math', bar_color: '#185FA5' },
    { title: 'Core Skills Building', status: 'In Progress', focus_area: 'SAT English', bar_color: '#1D9E75' },
    { title: 'Advanced Preparation', status: 'Planned', focus_area: 'Coding', bar_color: '#EF9F27' },
    { title: 'Mock Exams & Review', status: 'Planned', focus_area: 'Portfolio', bar_color: '#D4537E' },
    { title: 'Final Applications', status: 'Planned', focus_area: 'Essays', bar_color: '#185FA5' },
  ],
  dailyTasks: [
    { title: 'Solve practice problems', duration: '2 hours', subject: 's-math' },
    { title: 'Reading comprehension practice', duration: '1 hour', subject: 's-sat' },
    { title: 'Work on coding project', duration: '1.5 hours', subject: 's-cs' },
    { title: 'Draft application essay', duration: '1 hour', subject: 's-eng' },
  ],
};

export function parseRoadmapJson(text: string) {
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start < 0 || end < 0) throw new Error('No JSON object in response');
  return JSON.parse(cleaned.slice(start, end + 1));
}
