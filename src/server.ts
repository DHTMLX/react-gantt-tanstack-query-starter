import express from 'express';
import cors from 'cors';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import os from 'os';

const app = express();
app.use(express.json());
app.use(cors());

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SEED_PATH = join(__dirname, 'seed', 'data.json');
const DB_PATH = join(os.tmpdir(), 'gantt-tanstack-demo-db.json');
const PORT = 3001;

// Copy seed data to a runtime location on startup so the seed stays pristine
if (!fs.existsSync(DB_PATH)) {
  fs.copyFileSync(SEED_PATH, DB_PATH);
  console.log(`Seeded runtime DB at ${DB_PATH}`);
} else {
  console.log(`Using existing runtime DB at ${DB_PATH}`);
}

interface Task {
  id: string | number;
  [key: string]: unknown;
}

interface Link {
  id: string | number;
  [key: string]: unknown;
}

interface DB {
  tasks: Task[];
  links: Link[];
}

const readDB = (): DB => JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
const writeDB = (data: DB) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

app.get('/data', (_req, res) => {
  console.log('GET /data');
  res.json(readDB());
});

app.post('/tasks', (req, res) => {
  const db = readDB();
  const task = req.body as Task;
  const newTask = { ...task, id: `DB_ID:${task.id}` };

  db.tasks.push(newTask);
  writeDB(db);

  res.json(newTask);
});

app.put('/tasks/:id', (req, res) => {
  const db = readDB();
  const id = req.params.id;

  db.tasks = db.tasks.map((t) => (String(t.id) === id ? { ...t, ...req.body } : t));
  writeDB(db);

  res.sendStatus(200);
});

app.delete('/tasks/:id', (req, res) => {
  const db = readDB();
  const id = req.params.id;

  db.tasks = db.tasks.filter((t) => String(t.id) !== id);
  writeDB(db);

  res.sendStatus(200);
});

app.post('/links', (req, res) => {
  const db = readDB();
  const link = req.body as Link;
  const newLink = { ...link, id: `DB_ID:${link.id}` };

  db.links.push(newLink);
  writeDB(db);

  res.json(newLink);
});

app.put('/links/:id', (req, res) => {
  const db = readDB();
  const id = req.params.id;

  db.links = db.links.map((l) => (String(l.id) === id ? { ...l, ...req.body } : l));
  writeDB(db);

  res.sendStatus(200);
});

app.delete('/links/:id', (req, res) => {
  const db = readDB();
  const id = req.params.id;

  db.links = db.links.filter((l) => String(l.id) !== id);
  writeDB(db);

  res.sendStatus(200);
});

app.listen(PORT, () => console.log(`Server running on ${PORT}`));
