const API_BASE = '/api';

// Tab switching
document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;
        
        document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        tab.classList.add('active');
        document.getElementById(tabName).classList.add('active');
        
        // Load data when switching tabs
        loadTabData(tabName);
    });
});

// Show message helper
function showMessage(elementId, message, type = 'success') {
    const msgEl = document.getElementById(elementId);
    msgEl.textContent = message;
    msgEl.className = `message ${type} show`;
    setTimeout(() => msgEl.classList.remove('show'), 3000);
}

// Load tab data
function loadTabData(tab) {
    switch(tab) {
        case 'clients':
            loadClients();
            break;
        case 'projects':
            loadProjects();
            loadClientsForDropdown();
            break;
        case 'proposals':
            loadProposals();
            loadClientsForDropdown();
            break;
        case 'timetracker':
            loadTimeEntries();
            loadProjectsForDropdown();
            break;
        case 'invoices':
            loadInvoices();
            loadClientsForDropdown();
            loadProjectsForDropdown();
            break;
    }
}

// Clients
async function loadClients() {
    try {
        const response = await fetch(`${API_BASE}/crm/clients`);
        const data = await response.json();
        const tbody = document.querySelector('#clients-table tbody');
        tbody.innerHTML = '';
        
        data.clients.forEach(client => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${client.name}</td>
                <td>${client.email || 'N/A'}</td>
                <td>${client.phone || 'N/A'}</td>
                <td>${client.company || 'N/A'}</td>
                <td class="actions">
                    <button class="btn btn-danger" onclick="deleteClient(${client.id})">Delete</button>
                </td>
            `;
        });
    } catch (error) {
        console.error('Error loading clients:', error);
    }
}

async function loadClientsForDropdown() {
    try {
        const response = await fetch(`${API_BASE}/crm/clients`);
        const data = await response.json();
        
        const selects = ['project-client', 'proposal-client', 'invoice-client'];
        selects.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (select) {
                select.innerHTML = '<option value="">Select a client</option>';
                data.clients.forEach(client => {
                    const option = document.createElement('option');
                    option.value = client.id;
                    option.textContent = client.name;
                    select.appendChild(option);
                });
            }
        });
    } catch (error) {
        console.error('Error loading clients for dropdown:', error);
    }
}

document.getElementById('client-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const clientData = {
        name: document.getElementById('client-name').value,
        email: document.getElementById('client-email').value,
        phone: document.getElementById('client-phone').value,
        company: document.getElementById('client-company').value
    };
    
    try {
        const response = await fetch(`${API_BASE}/crm/clients`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(clientData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showMessage('client-message', result.message);
            e.target.reset();
            loadClients();
        } else {
            showMessage('client-message', result.error, 'error');
        }
    } catch (error) {
        showMessage('client-message', 'Error creating client', 'error');
    }
});

async function deleteClient(id) {
    if (!confirm('Are you sure you want to delete this client?')) return;
    
    try {
        const response = await fetch(`${API_BASE}/crm/clients/${id}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        showMessage('client-message', result.message);
        loadClients();
    } catch (error) {
        showMessage('client-message', 'Error deleting client', 'error');
    }
}

// Projects
async function loadProjects() {
    try {
        const response = await fetch(`${API_BASE}/crm/projects`);
        const data = await response.json();
        const tbody = document.querySelector('#projects-table tbody');
        tbody.innerHTML = '';
        
        data.projects.forEach(project => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${project.name}</td>
                <td>${project.client_name || 'N/A'}</td>
                <td>${project.status}</td>
                <td>$${project.budget || '0.00'}</td>
                <td class="actions">
                    <button class="btn btn-danger" onclick="deleteProject(${project.id})">Delete</button>
                </td>
            `;
        });
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

async function loadProjectsForDropdown() {
    try {
        const response = await fetch(`${API_BASE}/crm/projects`);
        const data = await response.json();
        
        const selects = ['time-project', 'invoice-project'];
        selects.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (select) {
                select.innerHTML = '<option value="">Select a project</option>';
                data.projects.forEach(project => {
                    const option = document.createElement('option');
                    option.value = project.id;
                    option.textContent = `${project.name} (${project.client_name})`;
                    select.appendChild(option);
                });
            }
        });
    } catch (error) {
        console.error('Error loading projects for dropdown:', error);
    }
}

document.getElementById('project-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const projectData = {
        client_id: document.getElementById('project-client').value,
        name: document.getElementById('project-name').value,
        description: document.getElementById('project-description').value,
        status: document.getElementById('project-status').value,
        budget: document.getElementById('project-budget').value
    };
    
    try {
        const response = await fetch(`${API_BASE}/crm/projects`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(projectData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showMessage('project-message', result.message);
            e.target.reset();
            loadProjects();
        } else {
            showMessage('project-message', result.error, 'error');
        }
    } catch (error) {
        showMessage('project-message', 'Error creating project', 'error');
    }
});

async function deleteProject(id) {
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    try {
        const response = await fetch(`${API_BASE}/crm/projects/${id}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        showMessage('project-message', result.message);
        loadProjects();
    } catch (error) {
        showMessage('project-message', 'Error deleting project', 'error');
    }
}

// Proposals
async function loadProposals() {
    try {
        const response = await fetch(`${API_BASE}/proposals/proposals`);
        const data = await response.json();
        const tbody = document.querySelector('#proposals-table tbody');
        tbody.innerHTML = '';
        
        data.proposals.forEach(proposal => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${proposal.title}</td>
                <td>${proposal.client_name || 'N/A'}</td>
                <td>${proposal.pricing_tier || 'N/A'}</td>
                <td>$${proposal.total_amount || '0.00'}</td>
                <td>${proposal.status}</td>
                <td class="actions">
                    <button class="btn btn-success" onclick="downloadProposalPDF(${proposal.id})">Download PDF</button>
                </td>
            `;
        });
    } catch (error) {
        console.error('Error loading proposals:', error);
    }
}

document.getElementById('proposal-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const proposalData = {
        client_id: document.getElementById('proposal-client').value,
        title: document.getElementById('proposal-title').value,
        scope: document.getElementById('proposal-scope').value,
        pricing_tier: document.getElementById('proposal-pricing').value,
        total_amount: document.getElementById('proposal-amount').value
    };
    
    try {
        const response = await fetch(`${API_BASE}/proposals/proposals`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(proposalData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showMessage('proposal-message', result.message);
            e.target.reset();
            loadProposals();
        } else {
            showMessage('proposal-message', result.error, 'error');
        }
    } catch (error) {
        showMessage('proposal-message', 'Error creating proposal', 'error');
    }
});

function downloadProposalPDF(id) {
    window.open(`${API_BASE}/proposals/proposals/${id}/pdf`, '_blank');
}

// Time Tracker
async function loadTimeEntries() {
    try {
        const response = await fetch(`${API_BASE}/timetracker/time-entries`);
        const data = await response.json();
        const tbody = document.querySelector('#time-table tbody');
        tbody.innerHTML = '';
        
        data.timeEntries.forEach(entry => {
            const total = entry.hours && entry.rate ? (entry.hours * entry.rate).toFixed(2) : 'N/A';
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${entry.date}</td>
                <td>${entry.project_name || 'N/A'}</td>
                <td>${entry.client_name || 'N/A'}</td>
                <td>${entry.description || 'N/A'}</td>
                <td>${entry.hours}</td>
                <td>$${entry.rate || '0.00'}</td>
                <td>$${total}</td>
                <td class="actions">
                    <button class="btn btn-danger" onclick="deleteTimeEntry(${entry.id})">Delete</button>
                </td>
            `;
        });
    } catch (error) {
        console.error('Error loading time entries:', error);
    }
}

document.getElementById('time-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const timeData = {
        project_id: document.getElementById('time-project').value,
        hours: document.getElementById('time-hours').value,
        rate: document.getElementById('time-rate').value,
        date: document.getElementById('time-date').value,
        description: document.getElementById('time-description').value
    };
    
    try {
        const response = await fetch(`${API_BASE}/timetracker/time-entries`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(timeData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showMessage('time-message', result.message);
            e.target.reset();
            loadTimeEntries();
        } else {
            showMessage('time-message', result.error, 'error');
        }
    } catch (error) {
        showMessage('time-message', 'Error logging time', 'error');
    }
});

async function deleteTimeEntry(id) {
    if (!confirm('Are you sure you want to delete this time entry?')) return;
    
    try {
        const response = await fetch(`${API_BASE}/timetracker/time-entries/${id}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        showMessage('time-message', result.message);
        loadTimeEntries();
    } catch (error) {
        showMessage('time-message', 'Error deleting time entry', 'error');
    }
}

// Invoices
async function loadInvoices() {
    try {
        const response = await fetch(`${API_BASE}/timetracker/invoices`);
        const data = await response.json();
        const tbody = document.querySelector('#invoices-table tbody');
        tbody.innerHTML = '';
        
        data.invoices.forEach(invoice => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${invoice.invoice_number}</td>
                <td>${invoice.client_name || 'N/A'}</td>
                <td>${invoice.project_name || 'N/A'}</td>
                <td>$${invoice.amount}</td>
                <td>${invoice.issue_date || 'N/A'}</td>
                <td>${invoice.due_date || 'N/A'}</td>
                <td>${invoice.status}</td>
                <td class="actions">
                    <button class="btn btn-success" onclick="downloadInvoicePDF(${invoice.id})">Download PDF</button>
                </td>
            `;
        });
    } catch (error) {
        console.error('Error loading invoices:', error);
    }
}

document.getElementById('invoice-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const invoiceData = {
        client_id: document.getElementById('invoice-client').value,
        project_id: document.getElementById('invoice-project').value,
        invoice_number: document.getElementById('invoice-number').value,
        amount: document.getElementById('invoice-amount').value,
        issue_date: document.getElementById('invoice-issue-date').value,
        due_date: document.getElementById('invoice-due-date').value
    };
    
    try {
        const response = await fetch(`${API_BASE}/timetracker/invoices`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(invoiceData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showMessage('invoice-message', result.message);
            e.target.reset();
            loadInvoices();
        } else {
            showMessage('invoice-message', result.error, 'error');
        }
    } catch (error) {
        showMessage('invoice-message', 'Error creating invoice', 'error');
    }
});

function downloadInvoicePDF(id) {
    window.open(`${API_BASE}/timetracker/invoices/${id}/pdf`, '_blank');
}

// Initialize: load clients on page load
loadClients();

// Set today's date as default for date inputs
const today = new Date().toISOString().split('T')[0];
document.getElementById('time-date').value = today;
document.getElementById('invoice-issue-date').value = today;
