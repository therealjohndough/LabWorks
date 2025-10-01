# LabWorks Quick Start Guide

## Overview
LabWorks is a complete agency management system with three integrated tools:
1. Client Database + CRM Helper
2. SOW/Proposal Auto-Generator  
3. Time Tracker + Invoice Bridge

## Installation

```bash
# Clone the repository
git clone https://github.com/therealjohndough/LabWorks.git
cd LabWorks

# Install dependencies
npm install

# Start the server
npm start
```

The server will start on http://localhost:3000

## Basic Usage

### 1. Managing Clients

Navigate to the **Clients & CRM** tab to:
- Add new clients with contact information
- View all clients in a table
- Delete clients when needed

Example API call:
```bash
curl -X POST http://localhost:3000/api/crm/clients \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com"}'
```

### 2. Creating Projects

In the **Projects** tab:
- Select a client from the dropdown
- Enter project name, description, budget, and status
- Track all projects in one place

### 3. Generating Proposals

Use the **Proposals** tab to:
- Create a new proposal for a client
- Add scope of work details
- Select pricing tier (Basic, Standard, Premium, Enterprise)
- Download as branded PDF

### 4. Logging Time

In the **Time Tracker** tab:
- Select a project
- Enter hours worked and hourly rate
- Add description of work performed
- All entries are automatically calculated

### 5. Creating Invoices

Go to the **Invoices** tab to:
- Create invoices manually or from time entries
- Set invoice number, dates, and amounts
- Generate professional PDF invoices
- Download and send to clients

## API Documentation

All endpoints return JSON responses.

### Client Endpoints
- `GET /api/crm/clients` - List all clients
- `POST /api/crm/clients` - Create new client
- `GET /api/crm/clients/:id` - Get specific client
- `PUT /api/crm/clients/:id` - Update client
- `DELETE /api/crm/clients/:id` - Delete client

### Project Endpoints  
- `GET /api/crm/projects` - List all projects
- `POST /api/crm/projects` - Create new project
- `GET /api/crm/clients/:id/projects` - Get projects for client

### Proposal Endpoints
- `GET /api/proposals/proposals` - List all proposals
- `POST /api/proposals/proposals` - Create new proposal
- `GET /api/proposals/proposals/:id/pdf` - Download PDF

### Time Tracker Endpoints
- `GET /api/timetracker/time-entries` - List all time entries
- `POST /api/timetracker/time-entries` - Log new time entry
- `DELETE /api/timetracker/time-entries/:id` - Delete time entry

### Invoice Endpoints
- `GET /api/timetracker/invoices` - List all invoices
- `POST /api/timetracker/invoices` - Create new invoice
- `POST /api/timetracker/invoices/from-time-entries` - Generate from time
- `GET /api/timetracker/invoices/:id/pdf` - Download PDF

## Tips

1. **Create clients first** - You need clients before adding projects
2. **Add projects** - Projects link to clients for better organization
3. **Track your time** - Log hours as you work on projects
4. **Generate invoices** - Use time entries to auto-calculate amounts
5. **Download PDFs** - Both proposals and invoices can be exported as PDFs

## Configuration

Default port is 3000. To change:
```bash
PORT=8080 npm start
```

## Database

The application uses SQLite. Database file is stored at `data/labworks.db` and is automatically created on first run.

## Support

For issues or questions, please open an issue on GitHub.
