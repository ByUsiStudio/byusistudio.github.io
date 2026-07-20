import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5780;

const GITEE_API_BASE = 'https://gitee.com/api/v5';
const GITEE_ORG_NAME = process.env.GITEE_ORG_NAME || 'byusistudio';
const GITEE_ACCESS_TOKEN = process.env.GITEE_ACCESS_TOKEN;

app.use(cors());
app.use(express.json());

async function fetchFromGitee(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'ByUsi-Backend/1.0',
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Gitee API request failed: ${response.status}`);
  }

  return response.json();
}

app.get('/api/repos', async (req, res) => {
  try {
    if (!GITEE_ACCESS_TOKEN) {
      return res.status(500).json({ error: 'Gitee access token not configured' });
    }

    const url = `${GITEE_API_BASE}/orgs/${GITEE_ORG_NAME}/repos?type=all&page=1&per_page=100&access_token=${GITEE_ACCESS_TOKEN}`;
    const data = await fetchFromGitee(url);

    res.json(data);
  } catch (error) {
    console.error('Error fetching repos:', error);
    res.status(500).json({ error: 'Failed to fetch repos' });
  }
});

app.get('/api/repos/*/readme', async (req, res) => {
  try {
    if (!GITEE_ACCESS_TOKEN) {
      return res.status(500).json({ error: 'Gitee access token not configured' });
    }

    const fullName = req.params[0];
    const url = `${GITEE_API_BASE}/repos/${fullName}/readme?access_token=${GITEE_ACCESS_TOKEN}`;
    const data = await fetchFromGitee(url);

    res.json({
      ...data,
      repoFullName: fullName,
    });
  } catch (error) {
    console.error(`Error fetching README for ${req.params[0]}:`, error);
    res.status(500).json({ error: 'Failed to fetch README' });
  }
});

app.use(express.static(path.join(__dirname, '../dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});