const express = require('express');
const router = express.Router();
const db = require('../database');
const PDFDocument = require('pdfkit');

// Get all time entries
router.get('/time-entries', (req, res) => {
  const query = `
    SELECT t.*, p.name as project_name, c.name as client_name
    FROM time_entries t
    LEFT JOIN projects p ON t.project_id = p.id
    LEFT JOIN clients c ON p.client_id = c.id
    ORDER BY t.date DESC, t.created_at DESC
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ timeEntries: rows });
  });
});

// Get time entries for a project
router.get('/projects/:id/time-entries', (req, res) => {
  db.all(
    'SELECT * FROM time_entries WHERE project_id = ? ORDER BY date DESC',
    [req.params.id],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ timeEntries: rows });
    }
  );
});

// Log time entry
router.post('/time-entries', (req, res) => {
  const { project_id, description, hours, rate, date } = req.body;
  
  if (!project_id || !hours) {
    res.status(400).json({ error: 'Project ID and hours are required' });
    return;
  }

  db.run(
    'INSERT INTO time_entries (project_id, description, hours, rate, date) VALUES (?, ?, ?, ?, ?)',
    [project_id, description, hours, rate, date || new Date().toISOString().split('T')[0]],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, message: 'Time entry logged successfully' });
    }
  );
});

// Update time entry
router.put('/time-entries/:id', (req, res) => {
  const { description, hours, rate, date } = req.body;
  
  db.run(
    'UPDATE time_entries SET description = ?, hours = ?, rate = ?, date = ? WHERE id = ?',
    [description, hours, rate, date, req.params.id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Time entry not found' });
        return;
      }
      res.json({ message: 'Time entry updated successfully' });
    }
  );
});

// Delete time entry
router.delete('/time-entries/:id', (req, res) => {
  db.run('DELETE FROM time_entries WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Time entry not found' });
      return;
    }
    res.json({ message: 'Time entry deleted successfully' });
  });
});

// Get all invoices
router.get('/invoices', (req, res) => {
  const query = `
    SELECT i.*, c.name as client_name, p.name as project_name
    FROM invoices i
    LEFT JOIN clients c ON i.client_id = c.id
    LEFT JOIN projects p ON i.project_id = p.id
    ORDER BY i.created_at DESC
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ invoices: rows });
  });
});

// Create invoice
router.post('/invoices', (req, res) => {
  const { client_id, project_id, invoice_number, amount, status, issue_date, due_date } = req.body;
  
  if (!client_id || !invoice_number || !amount) {
    res.status(400).json({ error: 'Client ID, invoice number, and amount are required' });
    return;
  }

  db.run(
    'INSERT INTO invoices (client_id, project_id, invoice_number, amount, status, issue_date, due_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [client_id, project_id, invoice_number, amount, status || 'draft', issue_date, due_date],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, message: 'Invoice created successfully' });
    }
  );
});

// Generate invoice from time entries
router.post('/invoices/from-time-entries', (req, res) => {
  const { project_id, invoice_number, issue_date, due_date } = req.body;
  
  if (!project_id || !invoice_number) {
    res.status(400).json({ error: 'Project ID and invoice number are required' });
    return;
  }

  // Get project and client info
  db.get(
    'SELECT p.*, c.id as client_id FROM projects p LEFT JOIN clients c ON p.client_id = c.id WHERE p.id = ?',
    [project_id],
    (err, project) => {
      if (err || !project) {
        res.status(500).json({ error: 'Project not found' });
        return;
      }

      // Get unbilled time entries
      db.all(
        'SELECT SUM(hours * rate) as total FROM time_entries WHERE project_id = ? AND rate IS NOT NULL',
        [project_id],
        (err, result) => {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }

          const total = result[0].total || 0;

          // Create invoice
          db.run(
            'INSERT INTO invoices (client_id, project_id, invoice_number, amount, status, issue_date, due_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [project.client_id, project_id, invoice_number, total, 'draft', issue_date, due_date],
            function(err) {
              if (err) {
                res.status(500).json({ error: err.message });
                return;
              }
              res.json({ 
                id: this.lastID, 
                amount: total,
                message: 'Invoice created successfully from time entries' 
              });
            }
          );
        }
      );
    }
  );
});

// Generate invoice PDF
router.get('/invoices/:id/pdf', (req, res) => {
  const query = `
    SELECT i.*, c.name as client_name, c.email as client_email, 
           c.company as client_company, p.name as project_name
    FROM invoices i
    LEFT JOIN clients c ON i.client_id = c.id
    LEFT JOIN projects p ON i.project_id = p.id
    WHERE i.id = ?
  `;
  
  db.get(query, [req.params.id], (err, invoice) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!invoice) {
      res.status(404).json({ error: 'Invoice not found' });
      return;
    }

    // Get time entries if project is specified
    const getTimeEntries = invoice.project_id 
      ? new Promise((resolve, reject) => {
          db.all(
            'SELECT * FROM time_entries WHERE project_id = ? ORDER BY date',
            [invoice.project_id],
            (err, rows) => {
              if (err) reject(err);
              else resolve(rows);
            }
          );
        })
      : Promise.resolve([]);

    getTimeEntries.then(timeEntries => {
      // Create PDF
      const doc = new PDFDocument({ margin: 50 });
      
      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.invoice_number}.pdf`);
      
      // Pipe PDF to response
      doc.pipe(res);

      // Header
      doc.fontSize(24)
         .text('INVOICE', { align: 'center' })
         .moveDown();

      // Invoice details
      doc.fontSize(12)
         .text(`Invoice Number: ${invoice.invoice_number}`)
         .text(`Issue Date: ${invoice.issue_date || 'N/A'}`)
         .text(`Due Date: ${invoice.due_date || 'N/A'}`)
         .moveDown();

      // Client info
      doc.fontSize(14)
         .text('Bill To:', { underline: true })
         .fontSize(12)
         .text(invoice.client_name)
         .text(invoice.client_company || '')
         .text(invoice.client_email || '')
         .moveDown();

      // Project info
      if (invoice.project_name) {
        doc.fontSize(12)
           .text(`Project: ${invoice.project_name}`)
           .moveDown();
      }

      // Time entries breakdown
      if (timeEntries.length > 0) {
        doc.fontSize(14)
           .text('Time Breakdown:', { underline: true })
           .moveDown(0.5);

        doc.fontSize(10);
        timeEntries.forEach(entry => {
          doc.text(`${entry.date} - ${entry.description || 'Work'}: ${entry.hours} hrs @ $${entry.rate}/hr = $${(entry.hours * entry.rate).toFixed(2)}`);
        });
        doc.moveDown();
      }

      // Total
      doc.fontSize(16)
         .text(`Total Amount: $${invoice.amount}`, { align: 'right', bold: true })
         .moveDown();

      // Payment terms
      doc.fontSize(10)
         .text('Payment Terms: Net 30 days')
         .text('Please make payment to: LabWorks Agency')
         .moveDown();

      // Footer
      doc.fontSize(9)
         .text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' })
         .text('© 2025 LabWorks - All Rights Reserved', { align: 'center' });

      doc.end();
    }).catch(err => {
      res.status(500).json({ error: err.message });
    });
  });
});

// Update invoice
router.put('/invoices/:id', (req, res) => {
  const { amount, status, issue_date, due_date } = req.body;
  
  db.run(
    'UPDATE invoices SET amount = ?, status = ?, issue_date = ?, due_date = ? WHERE id = ?',
    [amount, status, issue_date, due_date, req.params.id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Invoice not found' });
        return;
      }
      res.json({ message: 'Invoice updated successfully' });
    }
  );
});

module.exports = router;
