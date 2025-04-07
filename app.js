// Initialize localStorage data structure if not exists
if (!localStorage.getItem('queueData')) {
    const initialData = {
        claims: [
            {
                id: 'CLM-001',
                patient: 'John Smith',
                type: 'Emergency Surgery',
                priority: 'Emergency',
                status: 'Pending',
                timestamp: new Date().toISOString(),
                details: 'Patient requires immediate coverage approval for emergency appendectomy'
            },
            {
                id: 'CLM-002',
                patient: 'Sarah Johnson',
                type: 'Physical Therapy',
                priority: 'Medium',
                status: 'In Progress',
                timestamp: new Date(Date.now() - 86400000).toISOString(),
                details: 'Ongoing physical therapy sessions for knee replacement'
            }
        ],
        users: [
            { username: 'admin', password: 'admin123', role: 'admin' },
            { username: 'agent1', password: 'agent123', role: 'agent' },
            { username: 'patient1', password: 'patient123', role: 'patient' }
        ]
    };
    localStorage.setItem('queueData', JSON.stringify(initialData));
}

// Login functionality
document.getElementById('loginForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;
    
    const queueData = JSON.parse(localStorage.getItem('queueData'));
    const user = queueData.users.find(u => 
        u.username === username && 
        u.password === password && 
        u.role === role
    );
    
    if (user) {
        // Store current session
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        
        // Redirect based on role
        switch(role) {
            case 'admin':
            case 'agent':
                window.location.href = 'queue-dashboard.html';
                break;
            case 'patient':
                window.location.href = 'patient-view.html';
                break;
        }
    } else {
        alert('Invalid credentials. Please try again.');
    }
});

// Utility functions for queue management
function generateClaimId() {
    const data = JSON.parse(localStorage.getItem('queueData'));
    const lastId = data.claims.length > 0 
        ? parseInt(data.claims[data.claims.length - 1].id.split('-')[1]) 
        : 0;
    return `CLM-${(lastId + 1).toString().padStart(3, '0')}`;
}

function renderQueue() {
    const data = JSON.parse(localStorage.getItem('queueData'));
    const queueContainer = document.getElementById('queueItems');
    
    if (!queueContainer) return;
    
    queueContainer.innerHTML = '';
    
    data.claims.forEach(claim => {
        const priorityClass = `priority-${claim.priority.toLowerCase().replace(' ', '-')}`;
        const statusClass = `status-${claim.status.toLowerCase().replace(' ', '-')}`;
        
        const claimElement = document.createElement('div');
        claimElement.className = `grid grid-cols-12 p-4 items-center ${priorityClass} ${statusClass}`;
        claimElement.innerHTML = `
            <div class="col-span-1 font-medium">${claim.id}</div>
            <div class="col-span-2">${claim.patient}</div>
            <div class="col-span-2">${claim.type}</div>
            <div class="col-span-1">
                <span class="px-2 py-1 text-xs font-semibold rounded-full 
                    ${claim.priority === 'Emergency' ? 'bg-red-100 text-red-800' : 
                      claim.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                      claim.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-green-100 text-green-800'}">
                    ${claim.priority}
                </span>
            </div>
            <div class="col-span-2">
                <select onchange="updateStatus('${claim.id}', this.value)" 
                    class="border border-gray-300 rounded px-2 py-1 text-sm">
                    <option value="Pending" ${claim.status === 'Pending' ? 'selected' : ''}>Pending</option>
                    <option value="In Progress" ${claim.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                    <option value="Completed" ${claim.status === 'Completed' ? 'selected' : ''}>Completed</option>
                </select>
            </div>
            <div class="col-span-2 text-sm text-gray-500">${new Date(claim.timestamp).toLocaleString()}</div>
            <div class="col-span-2 flex space-x-2">
                <button onclick="viewDetails('${claim.id}')" class="text-blue-600 hover:text-blue-800">
                    <i class="fas fa-eye"></i>
                </button>
                <button onclick="editClaim('${claim.id}')" class="text-yellow-600 hover:text-yellow-800">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteClaim('${claim.id}')" class="text-red-600 hover:text-red-800">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        queueContainer.appendChild(claimElement);
    });
}

function updateStatus(claimId, newStatus) {
    const data = JSON.parse(localStorage.getItem('queueData'));
    const claimIndex = data.claims.findIndex(c => c.id === claimId);
    
    if (claimIndex !== -1) {
        data.claims[claimIndex].status = newStatus;
        localStorage.setItem('queueData', JSON.stringify(data));
        renderQueue();
    }
}

function showAddClaimModal() {
    document.getElementById('addClaimModal').classList.remove('hidden');
}

function hideAddClaimModal() {
    document.getElementById('addClaimModal').classList.add('hidden');
}

function addNewClaim(event) {
    event.preventDefault();
    
    const newClaim = {
        id: generateClaimId(),
        patient: document.getElementById('patientName').value,
        type: document.getElementById('claimType').value,
        priority: document.getElementById('priority').value,
        status: 'Pending',
        timestamp: new Date().toISOString(),
        details: document.getElementById('details').value
    };
    
    const data = JSON.parse(localStorage.getItem('queueData'));
    data.claims.push(newClaim);
    localStorage.setItem('queueData', JSON.stringify(data));
    
    hideAddClaimModal();
    renderQueue();
    document.getElementById('addClaimForm').reset();
}

function renderPatientClaims(username) {
    const data = JSON.parse(localStorage.getItem('queueData'));
    const patientClaimsContainer = document.getElementById('patientClaims');
    
    if (!patientClaimsContainer) return;
    
    patientClaimsContainer.innerHTML = '';
    
    const patientClaims = data.claims.filter(claim => claim.patient === username);
    
    patientClaims.forEach(claim => {
        const priorityClass = `priority-${claim.priority.toLowerCase().replace(' ', '-')}`;
        const claimElement = document.createElement('div');
        claimElement.className = `grid grid-cols-12 p-4 items-center ${priorityClass}`;
        claimElement.innerHTML = `
            <div class="col-span-1 font-medium">${claim.id}</div>
            <div class="col-span-3">${claim.type}</div>
            <div class="col-span-2">${claim.priority}</div>
            <div class="col-span-2">${claim.status}</div>
            <div class="col-span-2">${new Date(claim.timestamp).toLocaleString()}</div>
            <div class="col-span-2 flex space-x-2">
                <button onclick="viewDetails('${claim.id}')" class="text-blue-600 hover:text-blue-800">
                    <i class="fas fa-eye"></i>
                </button>
            </div>
        `;
        patientClaimsContainer.appendChild(claimElement);
    });
}

function logout() {
    sessionStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Initialize dashboard when loaded
if (window.location.pathname.includes('queue-dashboard.html')) {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'index.html';
    } else {
        document.getElementById('currentUser').textContent = 
            `Logged in as ${currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}`;
        renderQueue();
        document.getElementById('addClaimForm').addEventListener('submit', addNewClaim);
    }
}

// Initialize patient view when loaded
if (window.location.pathname.includes('patient-view.html')) {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'patient') {
        window.location.href = 'index.html';
    } else {
        document.getElementById('currentPatient').textContent = 
            `Logged in as ${currentUser.username}`;
        renderPatientClaims(currentUser.username);
    }
}
