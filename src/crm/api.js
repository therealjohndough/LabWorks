const express = require('express');
const router = express.Router();
const db = require('../database');

// Get all clients
router.get('/clients', (req, res) => {
  db.all('SELECT * FROM clients ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ clients: rows });
  });
});

// Get single client
router.get('/clients/:id', (req, res) => {
  db.get('SELECT * FROM clients WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Client not found' });
      return;
    }
    res.json({ client: row });
  });
});

// Create client
router.post('/clients', (req, res) => {
  const { name, email, phone, company } = req.body;
  
  if (!name) {
    res.status(400).json({ error: 'Name is required' });
    return;
  }

  db.run(
    'INSERT INTO clients (name, email, phone, company) VALUES (?, ?, ?, ?)',
    [name, email, phone, company],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, message: 'Client created successfully' });
    }
  );
});

// Update client
router.put('/clients/:id', (req, res) => {
  const { name, email, phone, company } = req.body;
  
  db.run(
    'UPDATE clients SET name = ?, email = ?, phone = ?, company = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [name, email, phone, company, req.params.id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Client not found' });
        return;
      }
      res.json({ message: 'Client updated successfully' });
    }
  );
});

// Delete client
router.delete('/clients/:id', (req, res) => {
  db.run('DELETE FROM clients WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Client not found' });
      return;
    }
    res.json({ message: 'Client deleted successfully' });
  });
});

// Get all projects
router.get('/projects', (req, res) => {
  const query = `
    SELECT p.*, c.name as client_name 
    FROM projects p 
    LEFT JOIN clients c ON p.client_id = c.id 
    ORDER BY p.created_at DESC
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ projects: rows });
  });
});

// Get projects by client
router.get('/clients/:id/projects', (req, res) => {
  db.all(
    'SELECT * FROM projects WHERE client_id = ? ORDER BY created_at DESC',
    [req.params.id],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ projects: rows });
    }
  );
});

// Create project
router.post('/projects', (req, res) => {
  const { client_id, name, description, status, budget } = req.body;
  
  if (!client_id || !name) {
    res.status(400).json({ error: 'Client ID and name are required' });
    return;
  }

  db.run(
    'INSERT INTO projects (client_id, name, description, status, budget) VALUES (?, ?, ?, ?, ?)',
    [client_id, name, description, status || 'active', budget],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, message: 'Project created successfully' });
    }
  );
});

// Update project
router.put('/projects/:id', (req, res) => {
  const { name, description, status, budget } = req.body;
  
  db.run(
    'UPDATE projects SET name = ?, description = ?, status = ?, budget = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [name, description, status, budget, req.params.id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Project not found' });
        return;
      }
      res.json({ message: 'Project updated successfully' });
    }
  );
});

// Get contact notes for a client
router.get('/clients/:id/notes', (req, res) => {
  db.all(
    'SELECT * FROM contact_notes WHERE client_id = ? ORDER BY created_at DESC',
    [req.params.id],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ notes: rows });
    }
  );
});

// Create contact note
router.post('/notes', (req, res) => {
  const { client_id, note } = req.body;
  
  if (!client_id || !note) {
    res.status(400).json({ error: 'Client ID and note are required' });
    return;
  }

  db.run(
    'INSERT INTO contact_notes (client_id, note) VALUES (?, ?)',
    [client_id, note],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, message: 'Note created successfully' });
    }
  );
});

module.exports = router;
