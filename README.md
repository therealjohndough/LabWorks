# LabWorks

A comprehensive agency management toolkit with three powerful features:

1. **Client Database + CRM Helper** - Manage clients, projects, and contact notes
2. **SOW/Proposal Auto-Generator** - Create branded PDF proposals with custom scopes and pricing
3. **Time Tracker + Invoice Bridge** - Log hours and generate professional invoices

## Features

### 📋 Client Database & CRM
- **Client Management**: Add, view, and manage client information (name, email, phone, company)
- **Project Tracking**: Create and monitor projects linked to clients with budgets and status
- **Contact Notes**: Keep track of all client communications and interactions
- **RESTful API**: Full CRUD operations via REST endpoints

### 📄 Proposal Generator
- **Template-Based System**: Pre-configured proposal templates
- **Custom Scopes**: Add detailed project scopes and descriptions
- **Pricing Tiers**: Choose from Basic, Standard, Premium, or Enterprise tiers
- **PDF Generation**: Automatically generate branded PDF proposals with:
  - Client information
  - Project scope
  - Pricing details
  - Legal terms and conditions
- **Downloadable PDFs**: Export proposals as PDF documents

### ⏱️ Time Tracker & Invoice System
- **Time Logging**: Track hours worked on projects with descriptions and rates
- **Project Association**: Link time entries to specific projects and clients
- **Automated Invoice Creation**: Generate invoices from time entries
- **Invoice Management**: Create, track, and manage invoices with:
  - Unique invoice numbers
  - Issue and due dates
  - Status tracking (draft, sent, paid)
- **Professional PDF Invoices**: Generate branded invoice PDFs with:
  - Client and project details
  - Time entry breakdowns
  - Total calculations
  - Payment terms

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### Setup

1. Clone the repository:
```bash
git clone https://github.com/therealjohndough/LabWorks.git
cd LabWorks
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

The server will start on `http://localhost:3000`

## Usage

### Web Interface

Open your browser and navigate to:
```
http://localhost:3000
```

The admin dashboard provides a clean interface with tabs for:
- **Clients & CRM**: Manage clients and contact information
- **Projects**: Create and track projects
- **Proposals**: Generate and download proposal PDFs
- **Time Tracker**: Log work hours
- **Invoices**: Create and manage invoices

### API Endpoints

#### Client Management
- `GET /api/crm/clients` - List all clients
- `POST /api/crm/clients` - Create a new client
- `GET /api/crm/clients/:id` - Get a specific client
- `PUT /api/crm/clients/:id` - Update a client
- `DELETE /api/crm/clients/:id` - Delete a client

#### Project Management
- `GET /api/crm/projects` - List all projects
- `POST /api/crm/projects` - Create a new project
- `GET /api/crm/clients/:id/projects` - Get projects for a client
- `PUT /api/crm/projects/:id` - Update a project

#### Contact Notes
- `GET /api/crm/clients/:id/notes` - Get notes for a client
- `POST /api/crm/notes` - Create a new note

#### Proposals
- `GET /api/proposals/proposals` - List all proposals
- `POST /api/proposals/proposals` - Create a new proposal
- `GET /api/proposals/proposals/:id` - Get a specific proposal
- `GET /api/proposals/proposals/:id/pdf` - Download proposal as PDF
- `PUT /api/proposals/proposals/:id` - Update a proposal

#### Time Tracking
- `GET /api/timetracker/time-entries` - List all time entries
- `POST /api/timetracker/time-entries` - Log a new time entry
- `GET /api/timetracker/projects/:id/time-entries` - Get time entries for a project
- `PUT /api/timetracker/time-entries/:id` - Update a time entry
- `DELETE /api/timetracker/time-entries/:id` - Delete a time entry

#### Invoices
- `GET /api/timetracker/invoices` - List all invoices
- `POST /api/timetracker/invoices` - Create a new invoice
- `POST /api/timetracker/invoices/from-time-entries` - Generate invoice from time entries
- `GET /api/timetracker/invoices/:id/pdf` - Download invoice as PDF
- `PUT /api/timetracker/invoices/:id` - Update an invoice

## Database

The application uses SQLite for data storage. The database file is automatically created at `data/labworks.db` on first run.

### Schema

- **clients**: Client information
- **projects**: Project details linked to clients
- **contact_notes**: Communication history
- **time_entries**: Time tracking records
- **invoices**: Invoice information
- **proposals**: Proposal data

## Configuration

The server runs on port 3000 by default. You can change this by setting the `PORT` environment variable:

```bash
PORT=8080 npm start
```

## Development

### Project Structure
```
LabWorks/
├── src/
│   ├── index.js           # Main server file
│   ├── database.js        # Database initialization
│   ├── crm/
│   │   └── api.js         # CRM API routes
│   ├── proposal/
│   │   └── api.js         # Proposal API routes
│   └── timetracker/
│       └── api.js         # Time tracker API routes
├── public/
│   ├── index.html         # Admin dashboard UI
│   └── app.js             # Frontend JavaScript
├── data/                  # Database directory
├── package.json
└── README.md
```

### Technologies Used
- **Backend**: Node.js, Express.js
- **Database**: SQLite3
- **PDF Generation**: PDFKit
- **Frontend**: Vanilla JavaScript, HTML5, CSS3

## API Examples

### Create a Client
```bash
curl -X POST http://localhost:3000/api/crm/clients \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "555-1234",
    "company": "Acme Corp"
  }'
```

### Create a Proposal
```bash
curl -X POST http://localhost:3000/api/proposals/proposals \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": 1,
    "title": "Website Redesign Project",
    "scope": "Complete redesign of company website with responsive design",
    "pricing_tier": "Premium",
    "total_amount": 15000
  }'
```

### Log Time Entry
```bash
curl -X POST http://localhost:3000/api/timetracker/time-entries \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": 1,
    "description": "Frontend development",
    "hours": 4.5,
    "rate": 100,
    "date": "2025-01-15"
  }'
```

## License

MIT License - see [LICENSE](LICENSE) file for details

## Author

John Dough

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues, questions, or contributions, please open an issue on GitHub.