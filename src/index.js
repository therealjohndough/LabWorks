const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

// Initialize database
require('./database');

// Import API routes
const crmApi = require('./crm/api');
const proposalApi = require('./proposal/api');
const timeTrackerApi = require('./timetracker/api');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/api/crm', crmApi);
app.use('/api/proposals', proposalApi);
app.use('/api/timetracker', timeTrackerApi);

// Root endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'LabWorks API Server',
    version: '1.0.0',
    endpoints: {
      crm: {
        clients: '/api/crm/clients',
        projects: '/api/crm/projects',
        notes: '/api/crm/notes'
      },
      proposals: {
        proposals: '/api/proposals/proposals',
        generatePdf: '/api/proposals/proposals/:id/pdf'
      },
      timeTracker: {
        timeEntries: '/api/timetracker/time-entries',
        invoices: '/api/timetracker/invoices',
        generateInvoicePdf: '/api/timetracker/invoices/:id/pdf'
      }
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`LabWorks server running on http://localhost:${PORT}`);
  console.log(`API documentation available at http://localhost:${PORT}/api`);
});

module.exports = app;
