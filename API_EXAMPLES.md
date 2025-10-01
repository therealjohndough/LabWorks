# API Usage Examples

This file contains practical examples for using the LabWorks API.

## Base URL
All endpoints use the base URL: `http://localhost:3000/api`

## 1. Create a Client

```bash
curl -X POST http://localhost:3000/api/crm/clients \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Acme Corporation",
    "email": "contact@acme.com",
    "phone": "555-0100",
    "company": "Acme Corp"
  }'
```

Response:
```json
{
  "id": 1,
  "message": "Client created successfully"
}
```

## 2. List All Clients

```bash
curl http://localhost:3000/api/crm/clients
```

Response:
```json
{
  "clients": [
    {
      "id": 1,
      "name": "Acme Corporation",
      "email": "contact@acme.com",
      "phone": "555-0100",
      "company": "Acme Corp",
      "created_at": "2025-01-15 10:30:00",
      "updated_at": "2025-01-15 10:30:00"
    }
  ]
}
```

## 3. Create a Project

```bash
curl -X POST http://localhost:3000/api/crm/projects \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": 1,
    "name": "Website Redesign",
    "description": "Complete website redesign with modern UI",
    "status": "active",
    "budget": 25000
  }'
```

## 4. Add Contact Note

```bash
curl -X POST http://localhost:3000/api/crm/notes \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": 1,
    "note": "Initial meeting went well. Client approved the proposal."
  }'
```

## 5. Create a Proposal

```bash
curl -X POST http://localhost:3000/api/proposals/proposals \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": 1,
    "title": "Website Redesign Project",
    "scope": "Complete redesign including: Homepage, About, Services, Contact pages. Responsive design for all devices. SEO optimization.",
    "pricing_tier": "Premium",
    "total_amount": 25000
  }'
```

## 6. Download Proposal PDF

```bash
curl http://localhost:3000/api/proposals/proposals/1/pdf -o proposal.pdf
```

## 7. Log Time Entry

```bash
curl -X POST http://localhost:3000/api/timetracker/time-entries \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": 1,
    "description": "Initial design mockups",
    "hours": 8,
    "rate": 150,
    "date": "2025-01-15"
  }'
```

## 8. Get Time Entries for a Project

```bash
curl http://localhost:3000/api/timetracker/projects/1/time-entries
```

## 9. Create an Invoice

```bash
curl -X POST http://localhost:3000/api/timetracker/invoices \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": 1,
    "project_id": 1,
    "invoice_number": "INV-2025-001",
    "amount": 1200,
    "issue_date": "2025-01-20",
    "due_date": "2025-02-19"
  }'
```

## 10. Generate Invoice from Time Entries

```bash
curl -X POST http://localhost:3000/api/timetracker/invoices/from-time-entries \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": 1,
    "invoice_number": "INV-2025-002",
    "issue_date": "2025-01-20",
    "due_date": "2025-02-19"
  }'
```

This will automatically calculate the total amount from all time entries for the project.

## 11. Download Invoice PDF

```bash
curl http://localhost:3000/api/timetracker/invoices/1/pdf -o invoice.pdf
```

## 12. Update Client Information

```bash
curl -X PUT http://localhost:3000/api/crm/clients/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Acme Corporation",
    "email": "newcontact@acme.com",
    "phone": "555-0101",
    "company": "Acme Corp"
  }'
```

## 13. Update Invoice Status

```bash
curl -X PUT http://localhost:3000/api/timetracker/invoices/1 \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1200,
    "status": "sent",
    "issue_date": "2025-01-20",
    "due_date": "2025-02-19"
  }'
```

## 14. Delete a Time Entry

```bash
curl -X DELETE http://localhost:3000/api/timetracker/time-entries/1
```

## 15. Delete a Client

```bash
curl -X DELETE http://localhost:3000/api/crm/clients/1
```

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200` - Success
- `400` - Bad Request (missing required fields)
- `404` - Not Found
- `500` - Server Error

Error responses include a JSON object with an `error` field:
```json
{
  "error": "Client ID and name are required"
}
```

## Integration Examples

### JavaScript/Node.js

```javascript
const axios = require('axios');

// Create a client
async function createClient() {
  const response = await axios.post('http://localhost:3000/api/crm/clients', {
    name: 'Tech Startup Inc',
    email: 'info@techstartup.com',
    phone: '555-0200',
    company: 'Tech Startup'
  });
  console.log(response.data);
}

// Get all projects
async function getProjects() {
  const response = await axios.get('http://localhost:3000/api/crm/projects');
  console.log(response.data.projects);
}
```

### Python

```python
import requests

# Create a proposal
def create_proposal():
    url = 'http://localhost:3000/api/proposals/proposals'
    data = {
        'client_id': 1,
        'title': 'Mobile App Development',
        'scope': 'Native iOS and Android applications',
        'pricing_tier': 'Enterprise',
        'total_amount': 50000
    }
    response = requests.post(url, json=data)
    print(response.json())

# Download invoice PDF
def download_invoice(invoice_id):
    url = f'http://localhost:3000/api/timetracker/invoices/{invoice_id}/pdf'
    response = requests.get(url)
    with open(f'invoice-{invoice_id}.pdf', 'wb') as f:
        f.write(response.content)
```

## Tips

1. Always check the response status code before processing the response
2. Required fields are marked with `*` in the API documentation
3. Use the web UI to test the API before integrating it
4. PDFs are binary data - make sure to handle them appropriately
5. Date format should be YYYY-MM-DD
6. All monetary amounts are in the base currency (no currency conversion)
