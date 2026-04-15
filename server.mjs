import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, 'journal.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Helper to read/write the JSON file
function readEntries() {
  if (!fs.existsSync(DB_PATH)) return [];
  const data = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(data);
}

function writeEntries(entries) {
  fs.writeFileSync(DB_PATH, JSON.stringify(entries, null, 2));
}

// GET all journal entries
app.get('/api/journal', (req, res) => {
  const entries = readEntries();
  res.json(entries);
});

// POST a new journal entry
app.post('/api/journal', (req, res) => {
  const { emoji, feeling, quote, note, date } = req.body;

  if (!feeling || !quote || !date) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  const entries = readEntries();
  const newEntry = { id: Date.now(), emoji, feeling, quote, note, date };
  entries.push(newEntry);
  writeEntries(entries);

  res.status(201).json(newEntry);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
