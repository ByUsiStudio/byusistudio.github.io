import express from 'express';
import fetch from 'node-fetch';
import config from '../../config.json' assert { type: 'json' };

const router = express.Router();

const { baseUrl, orgName, accessToken } = config.api;

router.get('/repos', async (req, res) => {
  try {
    const page = req.query.page || 1;
    const perPage = req.query.per_page || 100;
    
    const url = `${baseUrl}/orgs/${orgName}/repos?type=all&page=${page}&per_page=${perPage}&access_token=${accessToken}`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'ByUsi-Server/1.0',
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ 
        error: `Failed to fetch repos: ${response.statusText}`,
        details: errorText 
      });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching repos:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/repos/:owner/:repo/readme', async (req, res) => {
  try {
    const { owner, repo } = req.params;
    
    const url = `${baseUrl}/repos/${owner}/${repo}/readme?access_token=${accessToken}`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'ByUsi-Server/1.0',
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ 
        error: `Failed to fetch README: ${response.statusText}`,
        details: errorText 
      });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching README:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/repos/:owner/:repo', async (req, res) => {
  try {
    const { owner, repo } = req.params;
    
    const url = `${baseUrl}/repos/${owner}/${repo}?access_token=${accessToken}`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'ByUsi-Server/1.0',
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ 
        error: `Failed to fetch repo: ${response.statusText}`,
        details: errorText 
      });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching repo:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/org', async (req, res) => {
  try {
    const url = `${baseUrl}/orgs/${orgName}?access_token=${accessToken}`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'ByUsi-Server/1.0',
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ 
        error: `Failed to fetch org: ${response.statusText}`,
        details: errorText 
      });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching org:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/org/members', async (req, res) => {
  try {
    const page = req.query.page || 1;
    const perPage = req.query.per_page || 100;
    
    const url = `${baseUrl}/orgs/${orgName}/members?page=${page}&per_page=${perPage}&access_token=${accessToken}`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'ByUsi-Server/1.0',
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ 
        error: `Failed to fetch members: ${response.statusText}`,
        details: errorText 
      });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
