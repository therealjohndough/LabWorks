const express = require('express');
const router = express.Router();
const db = require('../database');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Get all proposals
router.get('/proposals', (req, res) => {
  const query = `
    SELECT p.*, c.name as client_name 
    FROM proposals p 
    LEFT JOIN clients c ON p.client_id = c.id 
    ORDER BY p.created_at DESC
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ proposals: rows });
  });
});

// Get single proposal
router.get('/proposals/:id', (req, res) => {
  db.get('SELECT * FROM proposals WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Proposal not found' });
      return;
    }
    res.json({ proposal: row });
  });
});

// Create proposal
router.post('/proposals', (req, res) => {
  const { client_id, title, scope, pricing_tier, total_amount } = req.body;
  
  if (!client_id || !title) {
    res.status(400).json({ error: 'Client ID and title are required' });
    return;
  }

  db.run(
    'INSERT INTO proposals (client_id, title, scope, pricing_tier, total_amount) VALUES (?, ?, ?, ?, ?)',
    [client_id, title, scope, pricing_tier, total_amount],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, message: 'Proposal created successfully' });
    }
  );
});

// Generate PDF for proposal
router.get('/proposals/:id/pdf', (req, res) => {
  // Get proposal and client data
  const query = `
    SELECT p.*, c.name as client_name, c.email as client_email, c.company as client_company
    FROM proposals p 
    LEFT JOIN clients c ON p.client_id = c.id 
    WHERE p.id = ?
  `;
  
  db.get(query, [req.params.id], (err, proposal) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!proposal) {
      res.status(404).json({ error: 'Proposal not found' });
      return;
    }

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=proposal-${proposal.id}.pdf`);
    
    // Pipe PDF to response
    doc.pipe(res);

    // Header
    doc.fontSize(20)
       .text('STATEMENT OF WORK', { align: 'center' })
       .moveDown();

    // Client info
    doc.fontSize(12)
       .text(`Client: ${proposal.client_name}`, { continued: false })
       .text(`Company: ${proposal.client_company || 'N/A'}`)
       .text(`Email: ${proposal.client_email || 'N/A'}`)
       .moveDown();

    // Proposal details
    doc.fontSize(16)
       .text(proposal.title, { underline: true })
       .moveDown();

    doc.fontSize(12)
       .text('Project Scope:', { underline: true })
       .moveDown(0.5)
       .fontSize(11)
       .text(proposal.scope || 'No scope provided')
       .moveDown();

    // Pricing
    doc.fontSize(12)
       .text('Pricing Details:', { underline: true })
       .moveDown(0.5)
       .fontSize(11)
       .text(`Tier: ${proposal.pricing_tier || 'Standard'}`)
       .text(`Total Amount: $${proposal.total_amount || '0.00'}`)
       .moveDown();

    // Legal/Terms
    doc.fontSize(12)
       .text('Terms & Conditions:', { underline: true })
       .moveDown(0.5)
       .fontSize(9)
       .text('1. Payment terms: Net 30 days from invoice date')
       .text('2. All work is subject to change order approval')
       .text('3. Client is responsible for providing necessary materials and access')
       .text('4. Any additional work beyond scope will be billed separately')
       .moveDown();

    // Footer
    doc.fontSize(10)
       .text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' })
       .text('© 2025 LabWorks - All Rights Reserved', { align: 'center' });

    doc.end();
  });
});

// Update proposal status
router.put('/proposals/:id', (req, res) => {
  const { title, scope, pricing_tier, total_amount, status } = req.body;
  
  db.run(
    'UPDATE proposals SET title = ?, scope = ?, pricing_tier = ?, total_amount = ?, status = ? WHERE id = ?',
    [title, scope, pricing_tier, total_amount, status, req.params.id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Proposal not found' });
        return;
      }
      res.json({ message: 'Proposal updated successfully' });
    }
  );
});

module.exports = router;
