import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataFile = path.join(__dirname, 'data-store.json');
const app = express();
const port = 4000;

app.use(cors());
app.use(express.json({ limit: '2mb' }));

const readStore = () => JSON.parse(fs.readFileSync(dataFile, 'utf-8'));
const writeStore = (store) => fs.writeFileSync(dataFile, JSON.stringify(store, null, 2));

const sanitizeUser = (user) => {
  const { password, ...safeUser } = user;
  return safeUser;
};

const buildCertificate = (user, internship) => ({
  internshipId: internship.id,
  internshipTitle: internship.title,
  issuedAt: new Date().toISOString(),
  certificateId: `CERT-${user.id}-${internship.id}`
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/internships', (_req, res) => {
  const store = readStore();
  res.json(store.internships);
});

app.post('/api/register', (req, res) => {
  const { name, email, password, internshipId } = req.body;
  if (!name || !email || !password || !internshipId) {
    return res.status(400).json({ message: 'Name, email, password, and internship program are required.' });
  }

  const store = readStore();
  if (store.users.some((user) => user.email.toLowerCase() === email.toLowerCase())) {
    return res.status(409).json({ message: 'An account with this email already exists.' });
  }

  const internship = store.internships.find((item) => item.id === internshipId);
  if (!internship) {
    return res.status(404).json({ message: 'Selected internship was not found.' });
  }

  const newUser = {
    id: `user-${Date.now()}`,
    name,
    email,
    password,
    role: 'intern',
    internshipId,
    progress: {
      [internshipId]: {
        unlockedDay: 1,
        completedDays: [],
        submissions: []
      }
    },
    certificates: []
  };

  store.users.push(newUser);
  writeStore(store);
  return res.status(201).json(sanitizeUser(newUser));
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const store = readStore();
  const user = store.users.find((entry) => entry.email.toLowerCase() === String(email).toLowerCase() && entry.password === password);

  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  return res.json(sanitizeUser(user));
});

app.get('/api/users/:userId/dashboard', (req, res) => {
  const store = readStore();
  const user = store.users.find((entry) => entry.id === req.params.userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  const internship = store.internships.find((entry) => entry.id === user.internshipId);
  const progress = user.progress[user.internshipId] || { unlockedDay: 1, completedDays: [], submissions: [] };
  const currentTask = progress.completedDays.length === internship?.tasks.length
    ? null
    : internship?.tasks.find((task) => task.day === progress.unlockedDay) || null;

  return res.json({
    user: sanitizeUser(user),
    internship,
    progress,
    currentTask,
    isComplete: internship ? progress.completedDays.length === internship.tasks.length : false
  });
});

app.post('/api/users/:userId/tasks/:day/submit', (req, res) => {
  const { answers, workLink, notes } = req.body;
  const day = Number(req.params.day);
  const store = readStore();
  const user = store.users.find((entry) => entry.id === req.params.userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  const internship = store.internships.find((entry) => entry.id === user.internshipId);
  const task = internship?.tasks.find((entry) => entry.day === day);
  if (!task) {
    return res.status(404).json({ message: 'Task not found.' });
  }

  const progress = user.progress[user.internshipId];
  if (day !== progress.unlockedDay) {
    return res.status(400).json({ message: 'Only the current unlocked day can be submitted.' });
  }

  const allCorrect = task.questions.every((question) => answers?.[question.id] === question.answer);
  if (!allCorrect) {
    return res.status(400).json({ message: 'All quiz answers must be correct before the next day unlocks.' });
  }

  progress.completedDays = [...new Set([...progress.completedDays, day])];
  progress.submissions.push({ day, workLink, notes, submittedAt: new Date().toISOString() });
  progress.unlockedDay = progress.completedDays.length === internship.tasks.length
    ? internship.tasks.length + 1
    : day + 1;

  if (progress.completedDays.length === internship.tasks.length) {
    const alreadyIssued = user.certificates.some((certificate) => certificate.internshipId === internship.id);
    if (!alreadyIssued) {
      user.certificates.push(buildCertificate(user, internship));
    }
  }

  writeStore(store);
  return res.json({
    message: progress.completedDays.length === internship.tasks.length
      ? 'Congratulations! Your internship is complete and certificate issued.'
      : 'Task submitted successfully. The next day is now unlocked.',
    progress,
    certificates: user.certificates
  });
});

app.get('/api/admin/summary', (_req, res) => {
  const store = readStore();
  res.json({
    internships: store.internships,
    users: store.users.map(sanitizeUser)
  });
});

app.post('/api/admin/internships', (req, res) => {
  const { title, category, duration, image, description, overview, tasks } = req.body;
  if (!title || !category || !duration || !image || !description || !overview) {
    return res.status(400).json({ message: 'All internship fields are required.' });
  }

  const store = readStore();
  const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const internship = {
    id,
    title,
    category,
    duration,
    image,
    description,
    overview,
    tasks: (tasks || []).map((task, index) => ({
      day: index + 1,
      title: task.title,
      mediaType: task.mediaType,
      mediaUrl: task.mediaUrl,
      questions: (task.questions || []).map((question, questionIndex) => ({
        id: `${id}-q-${index + 1}-${questionIndex + 1}`,
        question: question.question,
        options: question.options,
        answer: question.answer
      }))
    }))
  };

  store.internships.unshift(internship);
  writeStore(store);
  return res.status(201).json(internship);
});

app.listen(port, () => {
  console.log(`InternHub API running on http://localhost:${port}`);
});
