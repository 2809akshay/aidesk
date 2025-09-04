// Database Connector JavaScript Functions - Native JavaScript (No jQuery)

// Notification System (defined first to avoid reference errors)
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border-radius: 8px;
        padding: 15px 20px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        border-left: 4px solid ${type === 'success' ? '#2ecc71' : type === 'error' ? '#e74c3c' : '#f39c12'};
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 10000;
        min-width: 300px;
        animation: slideIn 0.3s ease;
    `;

    const icon = document.createElement('i');
    icon.className = `fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}`;
    icon.style.color = type === 'success' ? '#2ecc71' : type === 'error' ? '#e74c3c' : '#f39c12';

    const span = document.createElement('span');
    span.textContent = message;

    const closeButton = document.createElement('button');
    closeButton.className = 'notification-close';
    closeButton.style.cssText = `
        background: none;
        border: none;
        color: #666;
        cursor: pointer;
        padding: 5px;
        margin-left: auto;
    `;
    closeButton.innerHTML = '<i class="fas fa-times"></i>';
    closeButton.onclick = () => notification.remove();

    notification.appendChild(icon);
    notification.appendChild(span);
    notification.appendChild(closeButton);

    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 5000);
}

// Modal helper functions - uses native JavaScript, no external dependencies
function showModal(modalId) {
    console.log('Showing modal:', modalId);
    const modalEl = document.querySelector(modalId);
    if (!modalEl) {
        console.error('Modal element not found:', modalId);
        return;
    }

    // Use native modal if available, otherwise fallback to custom
    if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
    } else {
        // Fallback to custom modal
        modalEl.style.display = 'block';
        modalEl.classList.add('show');
        document.body.style.overflow = 'hidden';

        // Add backdrop
        let backdrop = document.querySelector('.modal-backdrop');
        if (!backdrop) {
            backdrop = document.createElement('div');
            backdrop.className = 'modal-backdrop show';
            document.body.appendChild(backdrop);
        }
    }
}

function hideModal(modalId) {
    console.log('Closing modal:', modalId);
    const modalEl = document.querySelector(modalId);
    if (!modalEl) {
        console.error('Modal element not found:', modalId);
        return;
    }

    // Use native modal if available, otherwise fallback to custom
    if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) {
            modal.hide();
        } else {
            modalEl.style.display = 'none';
            modalEl.classList.remove('show');
            document.body.style.overflow = '';
        }
    } else {
        // Fallback to custom modal
        modalEl.style.display = 'none';
        modalEl.classList.remove('show');
        document.body.style.overflow = '';

        // Remove backdrop
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) {
            backdrop.remove();
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Initialize database connector
    initializeDatabaseConnector();

    // Load existing connections
    loadConnections();

    // Set up event listeners
    setupDatabaseConnectorEventListeners();

    // Load supported database types
    loadSupportedTypes();
});

// Initialize Database Connector
function initializeDatabaseConnector() {
    console.log('Initializing database connector...');

    // Inject CSS styles directly to ensure they work
    injectConnectionCardStyles();

    // Initialize interface components
    updateConnectionStats();
    setupFormValidation();
    console.log('Database connector initialized');
}

// Inject CSS styles for connection cards
function injectConnectionCardStyles() {
    const styleId = 'connection-card-styles';
    if (document.getElementById(styleId)) {
        return; // Styles already injected
    }

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
        /* Connection Details Section */
        .connection-details {
            margin-bottom: 20px;
            padding: 16px;
            background: linear-gradient(135deg, rgba(248, 250, 252, 0.8) 0%, rgba(241, 245, 249, 0.8) 100%);
            border-radius: 10px;
            border: 1px solid rgba(226, 232, 240, 0.5);
            backdrop-filter: blur(5px);
            display: block !important;
            visibility: visible !important;
        }

        /* Connection Meta (Host/Port info) */
        .connection-meta {
            display: flex !important;
            gap: 20px;
            font-size: 13px;
            color: #64748b;
            margin-bottom: 12px;
            flex-wrap: wrap;
            visibility: visible !important;
        }

        .connection-meta span {
            display: flex !important;
            align-items: center;
            gap: 6px;
            padding: 6px 12px;
            background: rgba(255, 255, 255, 0.7);
            border-radius: 8px;
            border: 1px solid rgba(226, 232, 240, 0.3);
            font-weight: 500;
            transition: all 0.3s ease;
            visibility: visible !important;
        }

        .connection-meta span:hover {
            background: rgba(74, 144, 226, 0.1);
            border-color: rgba(74, 144, 226, 0.3);
            transform: translateY(-1px);
        }

        .connection-meta i {
            color: var(--pimcore-blue, #4A90E2);
            font-size: 14px;
        }

        /* Connection Last Test */
        .connection-last-test {
            font-size: 12px;
            color: #94a3b8;
            font-style: italic;
            display: flex !important;
            align-items: center;
            gap: 5px;
            visibility: visible !important;
        }

        .connection-last-test::before {
            content: '⏰';
            font-size: 14px;
        }

        .connection-last-test span {
            display: inline !important;
            visibility: visible !important;
        }

        /* Connection Actions */
        .connection-actions {
            display: flex !important;
            gap: 10px;
            justify-content: flex-end;
            align-items: center;
            visibility: visible !important;
        }

        .btn-action {
            padding: 8px 12px;
            border: none;
            background: linear-gradient(135deg, rgba(248, 249, 250, 0.9) 0%, rgba(241, 243, 244, 0.9) 100%);
            border-radius: 8px;
            cursor: pointer;
            color: #64748b;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            border: 1px solid rgba(226, 232, 240, 0.5);
            backdrop-filter: blur(5px);
            font-size: 14px;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 6px;
            position: relative;
            overflow: hidden;
            visibility: visible !important;
        }

        .btn-action::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
            transition: left 0.5s;
        }

        .btn-action:hover {
            background: var(--primary-gradient, linear-gradient(135deg, #667eea 0%, #764ba2 100%));
            color: white;
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(74, 144, 226, 0.3);
            border-color: rgba(74, 144, 226, 0.3);
        }

        .btn-action:hover::before {
            left: 100%;
        }

        .btn-action:active {
            transform: translateY(0);
            box-shadow: 0 2px 8px rgba(74, 144, 226, 0.2);
        }

        .btn-action i {
            font-size: 16px;
            transition: transform 0.3s ease;
        }

        .btn-action:hover i {
            transform: scale(1.1);
        }

        /* Specific button colors */
        .btn-action[data-action="test"] {
            background: linear-gradient(135deg, rgba(39, 174, 96, 0.1) 0%, rgba(46, 204, 113, 0.1) 100%);
            color: #27ae60;
            border-color: rgba(39, 174, 96, 0.3);
        }

        .btn-action[data-action="test"]:hover {
            background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
            color: white;
            box-shadow: 0 6px 20px rgba(39, 174, 96, 0.3);
        }

        .btn-action[data-action="edit"] {
            background: linear-gradient(135deg, rgba(52, 152, 219, 0.1) 0%, rgba(41, 128, 185, 0.1) 100%);
            color: #3498db;
            border-color: rgba(52, 152, 219, 0.3);
        }

        .btn-action[data-action="edit"]:hover {
            background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
            color: white;
            box-shadow: 0 6px 20px rgba(52, 152, 219, 0.3);
        }

        .btn-action[data-action="delete"] {
            background: linear-gradient(135deg, rgba(231, 76, 60, 0.1) 0%, rgba(192, 57, 43, 0.1) 100%);
            color: #e74c3c;
            border-color: rgba(231, 76, 60, 0.3);
        }

        .btn-action[data-action="delete"]:hover {
            background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
            color: white;
            box-shadow: 0 6px 20px rgba(231, 76, 60, 0.3);
        }

        /* Responsive design */
        @media (max-width: 768px) {
            .connection-meta {
                flex-direction: column;
                gap: 8px;
            }

            .connection-meta span {
                padding: 8px 12px;
                font-size: 12px;
            }

            .connection-actions {
                gap: 8px;
            }

            .btn-action {
                padding: 6px 10px;
                font-size: 12px;
            }

            .btn-action i {
                font-size: 14px;
            }

            .connection-header {
                flex-direction: column;
                gap: 12px;
                align-items: flex-start;
            }

            .connection-info h4 {
                font-size: 16px;
            }

            .connection-type {
                font-size: 10px;
                padding: 3px 8px;
            }

            .connection-status {
                font-size: 11px;
                padding: 4px 10px;
            }
        }
    `;

    document.head.appendChild(style);
    console.log('Connection card styles injected successfully');
}

// Load Supported Database Types
function loadSupportedTypes() {
    fetch('/database-connector/get-supported-types', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            populateDatabaseTypes(data.database_types);
            populateDefaultPorts(data.default_ports);
        }
    })
    .catch(error => {
        console.error('Failed to load supported types:', error);
    });
}

// Populate Database Types
function populateDatabaseTypes(types) {
    const selects = ['database-type', 'quick-db-type'];
    selects.forEach(id => {
        const select = document.getElementById(id);
        if (select) {
            select.innerHTML = '<option value="">Select Database Type</option>';
            Object.entries(types).forEach(([key, value]) => {
                const option = document.createElement('option');
                option.value = key;
                option.textContent = value;
                select.appendChild(option);
            });
        }
    });
}

// Populate Default Ports
function populateDefaultPorts(ports) {
    window.defaultPorts = ports;
}

// Setup Form Validation
function setupFormValidation() {
    // Auto-fill port when database type changes
    const dbTypeSelect = document.getElementById('database-type');
    if (dbTypeSelect) {
        dbTypeSelect.addEventListener('change', function() {
            const dbType = this.value;
            if (dbType && window.defaultPorts && window.defaultPorts[dbType]) {
                const portField = document.getElementById('port');
                if (portField) {
                    portField.value = window.defaultPorts[dbType];
                }
            }
        });
    }

    const quickDbTypeSelect = document.getElementById('quick-db-type');
    if (quickDbTypeSelect) {
        quickDbTypeSelect.addEventListener('change', function() {
            const dbType = this.value;
            if (dbType && window.defaultPorts && window.defaultPorts[dbType]) {
                const quickPortField = document.getElementById('quick-port');
                if (quickPortField) {
                    quickPortField.value = window.defaultPorts[dbType];
                }
            }
        });
    }
}

// Setup Event Listeners
function setupDatabaseConnectorEventListeners() {
    // Search and filter
    const searchInput = document.getElementById('connection-search');
    if (searchInput) {
        searchInput.addEventListener('input', filterConnections);
    }

    const filterSelect = document.getElementById('connection-filter');
    if (filterSelect) {
        filterSelect.addEventListener('change', filterConnections);
    }

    // Form validation
    const requiredFields = document.querySelectorAll('#new-connection-form input[required], #new-connection-form select[required]');
    requiredFields.forEach(field => {
        field.addEventListener('blur', function() {
            validateField(this);
        });
    });

    // Quick connect form
    const quickConnectInputs = document.querySelectorAll('#quick-connect-form input');
    quickConnectInputs.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                quickConnect();
            }
        });
    });
}

// Load Connections
function loadConnections() {
    console.log('Loading connections...');
    fetch('/database-connector/list-connections', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => {
        console.log('Response status:', response.status);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Received data:', data);
        if (data.success) {
            displayConnections(data.connections);
            updateConnectionStats();
            console.log('Connections loaded successfully:', data.connections.length, 'connections');
        } else {
            console.error('API returned error:', data.message);
            showNotification('Failed to load connections: ' + (data.message || 'Unknown error'), 'error');
        }
    })
    // .catch(error => {
    //     console.error('Failed to load connections:', error);
    //     showNotification('Failed to load connections: ' + error.message, 'error');
    // });
}

// Display Connections
function displayConnections(connections) {
    console.log('Displaying connections:', connections);
    const connectionList = document.getElementById('connection-list');
    if (!connectionList) {
        console.error('Connection list element not found');
        return;
    }

    connectionList.innerHTML = '';

    if (connections.length === 0) {
        console.log('No connections to display');
        connectionList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-database"></i>
                <h4>No connections yet</h4>
                <p>Create your first database connection to get started</p>
                <button class="btn-primary" onclick="showNewConnectionForm()">
                    <i class="fas fa-plus"></i> Add Connection
                </button>
            </div>
        `;
        return;
    }

    console.log('Rendering', connections.length, 'connections');

    connections.forEach(connection => { 
        const statusClass = getStatusClass(connection.connectionStatus);
        const statusIcon = getStatusIcon(connection.connectionStatus);

        const connectionDiv = document.createElement('div');
        connectionDiv.className = 'connection-item';
        connectionDiv.setAttribute('data-id', connection.id);
        connectionDiv.setAttribute('data-type', connection.databaseType);
        connectionDiv.onclick = () => showConnectionDetails(connection.id);
// console.log('Rendering connection:', connection.databaseType);
        connectionDiv.innerHTML = `
            <div class="connection-header">
                <div class="connection-info">
                    <h4>${connection.connectionName}</h4>
                    <span class="connection-type">${connection.databaseType}</span>
                </div>
                <div class="connection-status ${statusClass}">
                    <i class="${statusIcon}"></i>
                    <span>${connection.connectionStatus}</span>
                </div>
            </div>
            <div class="connection-details" style=" margin-bottom: 20px;
                padding: 16px;
                background: linear-gradient(135deg, rgba(248, 250, 252, 0.8) 0%, rgba(241, 245, 249, 0.8) 100%);
                border-radius: 10px;
                border: 1px solid rgba(226, 232, 240, 0.5);
                backdrop-filter: blur(5px);
                display: block !important;
                visibility: visible !important;
                /* Debug: Add visible border to confirm styles are applied */
                border: 2px solid #ff6b6b !important;
                background: #ffeaa7 !important;">
                <div class="connection-meta">
                    <span><i class="fas fa-server"></i> ${connection.host}:${connection.port}</span>
                    <span><i class="fas fa-database"></i> ${connection.databaseName}</span>
                </div>
                <div class="connection-last-test">
                    <span>Last tested: ${connection.lastTested ? formatTimestamp(connection.lastTested) : 'Never'}</span>
                </div>
            </div>
            <div class="connection-actions">
                <button class="btn-action" data-action="test" onclick="event.stopPropagation(); testConnection(${connection.id})" title="Test Connection">
                    <i class="fas fa-flask"></i>
                </button>
                <button class="btn-action" data-action="edit" onclick="event.stopPropagation(); editConnection(${connection.id})" title="Edit Connection">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-action" data-action="delete" onclick="event.stopPropagation(); deleteConnection(${connection.id})" title="Delete Connection">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        connectionList.appendChild(connectionDiv);
    });
}

// Get Status Class
function getStatusClass(status) {
    switch (status) {
        case 'connected':
            return 'success';
        case 'failed':
            return 'error';
        case 'testing':
            return 'warning';
        default:
            return 'info';
    }
}

// Get Status Icon
function getStatusIcon(status) {
    switch (status) {
        case 'connected':
            return 'fas fa-check-circle';
        case 'failed':
            return 'fas fa-times-circle';
        case 'testing':
            return 'fas fa-spinner fa-spin';
        default:
            return 'fas fa-question-circle';
    }
}

// Format Timestamp
function formatTimestamp(timestamp) {
    if (!timestamp) return 'Never';

    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return Math.floor(diff / 60000) + ' minutes ago';
    if (diff < 86400000) return Math.floor(diff / 3600000) + ' hours ago';
    if (diff < 604800000) return Math.floor(diff / 86400000) + ' days ago';

    return date.toLocaleDateString();
}

// Filter Connections
function filterConnections() {
    const searchInput = document.getElementById('connection-search');
    const filterSelect = document.getElementById('connection-filter');

    if (!searchInput || !filterSelect) return;

    const searchTerm = searchInput.value.toLowerCase();
    const filterType = filterSelect.value;

    const connectionItems = document.querySelectorAll('.connection-item');
    connectionItems.forEach(item => {
        const connectionName = item.querySelector('h4').textContent.toLowerCase();
        const connectionType = item.getAttribute('data-type');

        const matchesSearch = connectionName.includes(searchTerm);
        const matchesFilter = filterType === 'all' || connectionType === filterType;

        if (matchesSearch && matchesFilter) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// Update Connection Stats
function updateConnectionStats() {
    fetch('/database-connector/list-connections', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const connections = data.connections;
            const total = connections.length;
            const connected = connections.filter(c => c.connectionStatus === 'connected').length;
            const failed = connections.filter(c => c.connectionStatus === 'failed').length;

            const totalEl = document.getElementById('total-connections');
            const connectedEl = document.getElementById('connected-count');
            const failedEl = document.getElementById('failed-count');
            const lastTestEl = document.getElementById('last-test-time');

            if (totalEl) totalEl.textContent = total;
            if (connectedEl) connectedEl.textContent = connected;
            if (failedEl) failedEl.textContent = failed;

            // Update last test time
            const lastTested = connections
                .filter(c => c.lastTested)
                .sort((a, b) => b.lastTested - a.lastTested)[0];

            if (lastTested && lastTestEl) {
                lastTestEl.textContent = formatTimestamp(lastTested.lastTested);
            }
        }
    })
    .catch(error => {
        console.error('Failed to update connection stats:', error);
    });
}

// Show New Connection Form
function showNewConnectionForm() {
    resetConnectionForm();
    showModal('#newConnectionModal');
}

// Reset Connection Form
function resetConnectionForm() {
    const form = document.getElementById('new-connection-form');
    if (form) {
        form.reset();
    }

    const connectionNameField = document.getElementById('connection-name');
    if (connectionNameField) {
        connectionNameField.removeAttribute('data-connection-id');
    }

    const modalTitle = document.querySelector('#newConnectionModal .modal-title');
    if (modalTitle) {
        modalTitle.innerHTML = '<i class="fas fa-plus"></i> New Database Connection';
    }
}

// Show Quick Connect
function showQuickConnect() {
    showModal('#quickConnectModal');
}

// Show Bulk Test
function showBulkTest() {
    showModal('#bulkTestModal');
}

// Show Connection Details
function showConnectionDetails(connectionId) {
    fetch(`/database-connector/get-connection/${connectionId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            displayConnectionDetails(data.connection);
            showModal('#connectionDetailsModal');
        }
    })
    .catch(error => {
        showNotification('Failed to load connection details: ' + error.message, 'error');
    });
}

// Display Connection Details
function displayConnectionDetails(connection) {
    const statusClass = getStatusClass(connection.connectionStatus);
    const statusIcon = getStatusIcon(connection.connectionStatus);

    const detailsHtml = `
        <div class="connection-details-grid">
            <div class="detail-section">
                <h6>Basic Information</h6>
                <div class="detail-item">
                    <label>Connection Name:</label>
                    <span>${connection.connectionName}</span>
                </div>
                <div class="detail-item">
                    <label>Database Type:</label>
                    <span>${connection.databaseType.toUpperCase()}</span>
                </div>
                <div class="detail-item">
                    <label>Description:</label>
                    <span>${connection.description || 'No description'}</span>
                </div>
                <div class="detail-item">
                    <label>Tags:</label>
                    <span>${connection.tags || 'No tags'}</span>
                </div>
            </div>

            <div class="detail-section">
                <h6>Connection Details</h6>
                <div class="detail-item">
                    <label>Host:</label>
                    <span>${connection.host}</span>
                </div>
                <div class="detail-item">
                    <label>Port:</label>
                    <span>${connection.port}</span>
                </div>
                <div class="detail-item">
                    <label>Database:</label>
                    <span>${connection.databaseName}</span>
                </div>
                <div class="detail-item">
                    <label>Charset:</label>
                    <span>${connection.charset}</span>
                </div>
                <div class="detail-item">
                    <label>SSL Mode:</label>
                    <span>${connection.sslMode}</span>
                </div>
            </div>

            <div class="detail-section">
                <h6>Status & History</h6>
                <div class="detail-item">
                    <label>Status:</label>
                    <span class="status-badge ${statusClass}">
                        <i class="${statusIcon}"></i> ${connection.connectionStatus}
                    </span>
                </div>
                <div class="detail-item">
                    <label>Last Tested:</label>
                    <span>${connection.lastTested ? formatTimestamp(connection.lastTested) : 'Never'}</span>
                </div>
                <div class="detail-item">
                    <label>Connection History:</label>
                    <span>${connection.connectionHistory ? connection.connectionHistory.length : 0} tests</span>
                </div>
            </div>
        </div>

        <div class="connection-history-section">
            <h6>Recent Test History</h6>
            <div class="history-entries">
                ${connection.connectionHistory && connection.connectionHistory.length > 0 ?
                    connection.connectionHistory.slice(-5).reverse().map(entry => `
                        <div class="history-entry ${entry.status}">
                            <span class="history-time">${formatTimestamp(entry.timestamp)}</span>
                            <span class="history-status">${entry.status}</span>
                            <span class="history-response">${entry.response_time}ms</span>
                        </div>
                    `).join('') :
                    '<p class="no-history">No test history available</p>'
                }
            </div>
        </div>
    `;

    const detailsContent = document.getElementById('connection-details-content');
    const detailsTitle = document.getElementById('connection-details-title');
    const detailsModal = document.getElementById('connectionDetailsModal');

    if (detailsContent) detailsContent.innerHTML = detailsHtml;
    if (detailsTitle) detailsTitle.innerHTML = `<i class="fas fa-database"></i> ${connection.connectionName}`;
    if (detailsModal) detailsModal.setAttribute('data-connection-id', connection.id);
}

// Test Connection
function testConnection(connectionId = null) {
    if (!connectionId) {
        const detailsModal = document.getElementById('connectionDetailsModal');
        if (detailsModal) {
            connectionId = detailsModal.getAttribute('data-connection-id');
        }
    }

    if (!connectionId) {
        showNotification('No connection selected', 'warning');
        return;
    }

    // Update UI to show testing
    const connectionItem = document.querySelector(`.connection-item[data-id="${connectionId}"] .connection-status`);
    if (connectionItem) {
        connectionItem.innerHTML = `
            <i class="fas fa-spinner fa-spin"></i>
            <span>Testing...</span>
        `;
        connectionItem.classList.remove('success', 'error', 'info');
        connectionItem.classList.add('warning');
    }

    // Use the correct endpoint with connection ID
    fetch(`/database-connector/test-connection/${encodeURIComponent(connectionId)}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showNotification(`Connection test successful! (${data.response_time ?? 0}ms)`, 'success');
            } else {
                showNotification(`Connection test failed: ${data.message}`, 'error');
            }

            // Refresh connections list
            loadConnections();
        })
        .catch(error => {
            showNotification('Connection test failed: ' + error.message, 'error');
            loadConnections();
        });
}

// Test Connection from Form (keep this for form-based testing)
function testConnectionFromForm() {
    let formData = getFormData();
    
    if (!validateForm()) {
        return;
    }

    showNotification('Testing connection...', 'info');

    // Convert to query string
    const queryString = new URLSearchParams(formData).toString();
    
    fetch(`/database-connector/test-connection?${queryString}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showNotification(
                    `Connection test successful! (${data.response_time ?? 0}ms)`,
                    'success'
                );
            } else {
                showNotification(`Connection test failed: ${data.message}`, 'error');
                console.error('Connection error details:', data);
            }
        })
        .catch(error => {
            showNotification('Connection test failed: ' + error.message, 'error');
        });
}
// Save Connection
function saveConnection() {
    const formData = getFormData();

    if (!validateForm()) {
        return;
    }

    const connectionNameField = document.getElementById('connection-name');
    if (connectionNameField && connectionNameField.getAttribute('data-connection-id')) {
        formData.id = connectionNameField.getAttribute('data-connection-id');
    }

    showNotification('Saving connection...', 'info');

    // Send data as JSON in POST request
    console.log('Saving connection with data:', formData);
    fetch('/database-connector/save-connection', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('Connection saved successfully!', 'success');
            hideModal('#newConnectionModal');
            loadConnections();
        } else {
            showNotification('Failed to save connection: ' + data.message, 'error');
        }
    })
    .catch(error => {
        showNotification('Failed to save connection: ' + error.message, 'error');
    });
}

// Get Form Data
function getFormData() {
    return {
        connectionName: document.getElementById('connection-name').value,
        databaseType: document.getElementById('database-type').value,
        host: document.getElementById('host').value,
        port: parseInt(document.getElementById('port').value),
        databaseName: document.getElementById('database-name').value,
        username: document.getElementById('username').value,
        password: document.getElementById('password').value,
        charset: document.getElementById('charset').value,
        sslMode: document.getElementById('ssl-mode').value,
        description: document.getElementById('connection-description').value,
        tags: document.getElementById('connection-tags').value
    };
}

// Validate Form
function validateForm() {
    let isValid = true;
    const requiredFields = ['connection-name', 'database-type', 'host', 'port', 'database-name', 'username', 'password'];

    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field && !field.value.trim()) {
            field.classList.add('error');
            isValid = false;
        } else if (field) {
            field.classList.remove('error');
        }
    });

    if (!isValid) {
        showNotification('Please fill in all required fields', 'warning');
    }

    return isValid;
}

// Validate Field
function validateField(field) {
    if (field.required && !field.value.trim()) {
        field.classList.add('error');
    } else {
        field.classList.remove('error');
    }
}

// Quick Connect
function quickConnect() {
    const formData = {
        databaseType: document.getElementById('quick-db-type').value,
        host: document.getElementById('quick-host').value,
        port: parseInt(document.getElementById('quick-port').value),
        databaseName: document.getElementById('quick-database').value,
        username: document.getElementById('quick-username').value,
        password: document.getElementById('quick-password').value,
        charset: 'utf8mb4'
    };

    if (!formData.databaseType || !formData.host || !formData.databaseName || !formData.username) {
        showNotification('Please fill in all required fields', 'warning');
        return;
    }

    showNotification('Testing quick connection...', 'info');

    fetch('/database-connector/quick-connect', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification(`Quick connection successful! (${data.response_time}ms)`, 'success');
            hideModal('#quickConnectModal');

            // Optionally save this connection
            if (confirm('Would you like to save this connection?')) {
                showNewConnectionForm();
                populateFormFromData(formData);
            }
        } else {
            showNotification(`Quick connection failed: ${data.message}`, 'error');
        }
    })
    .catch(error => {
        showNotification('Quick connection failed: ' + error.message, 'error');
    });
}

// Populate Form from Data
function populateFormFromData(data) {
    const connectionNameField = document.getElementById('connection-name');
    const databaseTypeField = document.getElementById('database-type');
    const hostField = document.getElementById('host');
    const portField = document.getElementById('port');
    const databaseNameField = document.getElementById('database-name');
    const usernameField = document.getElementById('username');
    const passwordField = document.getElementById('password');

    if (connectionNameField) connectionNameField.value = `${data.databaseType}_${data.databaseName}`;
    if (databaseTypeField) databaseTypeField.value = data.databaseType;
    if (hostField) hostField.value = data.host;
    if (portField) portField.value = data.port;
    if (databaseNameField) databaseNameField.value = data.databaseName;
    if (usernameField) usernameField.value = data.username;
    if (passwordField) passwordField.value = data.password;
}

// Edit Connection
function editConnection(connectionId = null) {
    if (!connectionId) {
        const detailsModal = document.getElementById('connectionDetailsModal');
        if (detailsModal) {
            connectionId = detailsModal.getAttribute('data-connection-id');
        }
    }

    if (!connectionId) {
        showNotification('No connection selected', 'warning');
        return;
    }

    fetch(`/database-connector/get-connection/${connectionId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            populateFormFromConnection(data.connection);
            showModal('#newConnectionModal');
            hideModal('#connectionDetailsModal');
        }
    })
    .catch(error => {
        showNotification('Failed to load connection for editing: ' + error.message, 'error');
    });
}

// Populate Form from Connection
function populateFormFromConnection(connection) {
    const connectionNameField = document.getElementById('connection-name');
    const databaseTypeField = document.getElementById('database-type');
    const hostField = document.getElementById('host');
    const portField = document.getElementById('port');
    const databaseNameField = document.getElementById('database-name');
    const usernameField = document.getElementById('username');
    const passwordField = document.getElementById('password');
    const charsetField = document.getElementById('charset');
    const sslModeField = document.getElementById('ssl-mode');
    const descriptionField = document.getElementById('connection-description');
    const tagsField = document.getElementById('connection-tags');
    const modalTitle = document.querySelector('#newConnectionModal .modal-title');

    if (connectionNameField) {
        connectionNameField.value = connection.connectionName;
        connectionNameField.setAttribute('data-connection-id', connection.id);
    }
    if (databaseTypeField) databaseTypeField.value = connection.databaseType;
    if (hostField) hostField.value = connection.host;
    if (portField) portField.value = connection.port;
    if (databaseNameField) databaseNameField.value = connection.databaseName;
    if (usernameField) usernameField.value = connection.username;
    if (passwordField) passwordField.value = connection.password;
    if (charsetField) charsetField.value = connection.charset;
    if (sslModeField) sslModeField.value = connection.sslMode;
    if (descriptionField) descriptionField.value = connection.description;
    if (tagsField) tagsField.value = connection.tags;

    if (modalTitle) {
        modalTitle.innerHTML = '<i class="fas fa-edit"></i> Edit Database Connection';
    }
}

// Delete Connection
function deleteConnection(connectionId = null) {
    if (!connectionId) {
        const detailsModal = document.getElementById('connectionDetailsModal');
        if (detailsModal) {
            connectionId = detailsModal.getAttribute('data-connection-id');
        }
    }

    if (!connectionId) {
        showNotification('No connection selected', 'warning');
        return;
    }

    if (!confirm('Are you sure you want to delete this connection?')) {
        return;
    }

    fetch(`/database-connector/delete-connection/${connectionId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('Connection deleted successfully', 'success');
            hideModal('#connectionDetailsModal');
            loadConnections();
        } else {
            showNotification('Failed to delete connection: ' + data.message, 'error');
        }
    })
    .catch(error => {
        showNotification('Failed to delete connection: ' + error.message, 'error');
    });
}

// Run Bulk Test
function runBulkTest() {
    const testTypeInputs = document.querySelectorAll('input[name="bulk-test-type"]:checked');
    const testType = testTypeInputs.length > 0 ? testTypeInputs[0].value : null;

    if (!testType) {
        showNotification('Please select a test type', 'warning');
        return;
    }

    showNotification('Running bulk connection tests...', 'info');

    // Attach testType as a query parameter
    fetch(`/database-connector/bulk-test?test_type=${encodeURIComponent(testType)}`, {
        method: 'GET'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            displayBulkTestResults(data.results);
            showNotification(`Bulk test completed. ${data.results.length} connections tested.`, 'success');
        } else {
            showNotification('Bulk test failed: ' + data.message, 'error');
        }
    })
    .catch(error => {
        showNotification('Bulk test failed: ' + error.message, 'error');
    });
}

// Display Bulk Test Results
function displayBulkTestResults(results) {
    const resultsList = document.getElementById('bulk-results-list');
    if (!resultsList) return;

    resultsList.innerHTML = '';

    results.forEach(result => {
        const statusClass = result.result.success ? 'success' : 'error';
        const statusIcon = result.result.success ? 'fas fa-check-circle' : 'fas fa-times-circle';

        const resultDiv = document.createElement('div');
        resultDiv.className = `bulk-result-item ${statusClass}`;
        resultDiv.innerHTML = `
            <div class="result-header">
                <span class="result-name">${result.name}</span>
                <span class="result-status">
                    <i class="${statusIcon}"></i>
                    ${result.result.success ? 'Success' : 'Failed'}
                </span>
            </div>
            <div class="result-details">
                <span class="result-time">${result.result.response_time}ms</span>
                ${!result.result.success ? `<span class="result-error">${result.result.message}</span>` : ''}
            </div>
        `;

        resultsList.appendChild(resultDiv);
    });

    const bulkTestResults = document.getElementById('bulk-test-results');
    if (bulkTestResults) {
        bulkTestResults.style.display = 'block';
    }
}

// Notification System - Already defined at the top

// Modal helper functions - Already defined at the top

// Initialize on page load - Already handled at the top