// API Connections JavaScript
$(document).ready(function() {
    // Small delay to ensure all scripts are loaded
    setTimeout(function() {
        loadApiConnections();
        setupEventListeners();
        updateApiStats();
    }, 100);
});

function setupEventListeners() {
    // Search functionality
    $('#api-search').on('input', function() {
        filterApiConnections();
    });

    // Status filter
    $('#status-filter').change(function() {
        filterApiConnections();
    });

    // Authentication type change
    $('#auth-type').change(function() {
        showAuthFields($(this).val());
    });
}

function loadApiConnections() {
    // Load saved API connections from localStorage
    const savedApis = JSON.parse(localStorage.getItem('apiConnections') || '[]');

    if (savedApis.length === 0) {
        showEmptyState();
        return;
    }

    const grid = $('#api-connections-grid');
    grid.empty();

    savedApis.forEach((api, index) => {
        const apiCard = createApiCard(api, index);
        grid.append(apiCard);
    });

    // Update test API select
    updateTestApiSelect(savedApis);
}

function createApiCard(api, index) {
    const statusClass = api.status || 'inactive';
    const statusText = api.status === 'active' ? 'Active' :
                      api.status === 'error' ? 'Error' : 'Inactive';

    return `
        <div class="api-connection-card" data-index="${index}">
            <div class="api-connection-header">
                <div class="api-info">
                    <h3>${api.name}</h3>
                    <span class="api-type">${api.type.toUpperCase()}</span>
                </div>
                <div class="api-status ${statusClass}">
                    <i class="fas fa-circle"></i>
                    ${statusText}
                </div>
            </div>

            <div class="api-details">
                <div class="api-detail">
                    <span class="api-detail-label">Base URL:</span>
                    <span class="api-detail-value">${api.baseUrl}</span>
                </div>
                <div class="api-detail">
                    <span class="api-detail-label">Auth Type:</span>
                    <span class="api-detail-value">${api.authType || 'None'}</span>
                </div>
                <div class="api-detail">
                    <span class="api-detail-label">Last Test:</span>
                    <span class="api-detail-value">${api.lastTest || 'Never'}</span>
                </div>
            </div>

            <div class="api-actions">
                <button class="btn-api-action btn-test" onclick="testApiConnection(${index})">
                    <i class="fas fa-play"></i> Test
                </button>
                <button class="btn-api-action btn-edit" onclick="editApiConnection(${index})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn-api-action btn-logs" onclick="viewApiLogs(${index})">
                    <i class="fas fa-file-alt"></i> Logs
                </button>
                <button class="btn-api-action btn-delete" onclick="deleteApiConnection(${index})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `;
}

function showEmptyState() {
    const grid = $('#api-connections-grid');
    grid.html(`
        <div class="empty-state">
            <i class="fas fa-plug"></i>
            <h3>No API Connections</h3>
            <p>Get started by adding your first API connection</p>
            <button class="btn-add-api" onclick="openAddApiModal()">
                <i class="fas fa-plus"></i> Add API Connection
            </button>
        </div>
    `);
}

function updateTestApiSelect(apis) {
    const select = $('#test-api-select');
    select.empty().append('<option value="">Choose API to test</option>');

    apis.forEach((api, index) => {
        select.append(`<option value="${index}">${api.name}</option>`);
    });
}

function openAddApiModal() {
    console.log('Attempting to open modal...');
    console.log('jQuery available:', typeof $);
    console.log('Bootstrap modal available:', typeof $.fn.modal);

    if (typeof $.fn.modal === 'function') {
        console.log('Using Bootstrap modal');
        $('#addApiModal').modal('show');
        clearAddApiForm();
    } else {
        console.error('Bootstrap modal plugin not loaded');
        // Fallback: try to show modal with basic JavaScript
        const modal = document.getElementById('addApiModal');
        if (modal) {
            console.log('Using fallback modal display');
            modal.style.display = 'block';
            modal.classList.add('show');
            document.body.classList.add('modal-open');
            clearAddApiForm();
            showNotification('Using fallback modal display', 'warning');
        } else {
            showNotification('Modal functionality not available. Please refresh the page.', 'error');
        }
    }
}

function clearAddApiForm() {
    $('#add-api-form')[0].reset();
    $('#auth-details').hide();
    $('#auth-fields').empty();
}

function showAuthFields(authType) {
    const authDetails = $('#auth-details');
    const authFields = $('#auth-fields');

    if (authType === 'none' || authType === '') {
        authDetails.hide();
        return;
    }

    authDetails.show();
    authFields.empty();

    switch (authType) {
        case 'basic':
            authFields.html(`
                <div class="form-row">
                    <div class="form-group">
                        <label for="basic-username">Username</label>
                        <input type="text" id="basic-username" required>
                    </div>
                    <div class="form-group">
                        <label for="basic-password">Password</label>
                        <input type="password" id="basic-password" required>
                    </div>
                </div>
            `);
            break;
        case 'bearer':
            authFields.html(`
                <div class="form-row">
                    <div class="form-group">
                        <label for="bearer-token">Bearer Token</label>
                        <input type="text" id="bearer-token" placeholder="Enter your bearer token" required>
                    </div>
                </div>
            `);
            break;
        case 'api-key':
            authFields.html(`
                <div class="form-row">
                    <div class="form-group">
                        <label for="api-key-name">Header Name</label>
                        <input type="text" id="api-key-name" placeholder="X-API-Key" required>
                    </div>
                    <div class="form-group">
                        <label for="api-key-value">API Key</label>
                        <input type="text" id="api-key-value" required>
                    </div>
                </div>
            `);
            break;
        case 'oauth2':
            authFields.html(`
                <div class="form-row">
                    <div class="form-group">
                        <label for="oauth-client-id">Client ID</label>
                        <input type="text" id="oauth-client-id" required>
                    </div>
                    <div class="form-group">
                        <label for="oauth-client-secret">Client Secret</label>
                        <input type="password" id="oauth-client-secret" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="oauth-token-url">Token URL</label>
                        <input type="url" id="oauth-token-url" placeholder="https://api.example.com/oauth/token" required>
                    </div>
                </div>
            `);
            break;
    }
}

function saveApiConnection() {
    const form = $('#add-api-form')[0];

    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const apiData = {
        name: $('#api-name').val(),
        type: $('#api-type').val(),
        baseUrl: $('#api-base-url').val(),
        version: $('#api-version').val(),
        authType: $('#auth-type').val(),
        description: $('#api-description').val(),
        timeout: parseInt($('#timeout').val()),
        retryCount: parseInt($('#retry-count').val()),
        rateLimit: parseInt($('#rate-limit').val()),
        cacheEnabled: $('#cache-enabled').is(':checked'),
        status: 'inactive',
        createdAt: new Date().toISOString(),
        lastTest: null
    };

    // Add authentication details
    if (apiData.authType !== 'none') {
        apiData.authDetails = getAuthDetails(apiData.authType);
    }

    // Save to localStorage
    const savedApis = JSON.parse(localStorage.getItem('apiConnections') || '[]');
    savedApis.push(apiData);
    localStorage.setItem('apiConnections', JSON.stringify(savedApis));

    $('#addApiModal').modal('hide');
    loadApiConnections();
    updateApiStats();

    showNotification('API connection saved successfully!', 'success');
}

function getAuthDetails(authType) {
    switch (authType) {
        case 'basic':
            return {
                username: $('#basic-username').val(),
                password: $('#basic-password').val()
            };
        case 'bearer':
            return {
                token: $('#bearer-token').val()
            };
        case 'api-key':
            return {
                headerName: $('#api-key-name').val(),
                key: $('#api-key-value').val()
            };
        case 'oauth2':
            return {
                clientId: $('#oauth-client-id').val(),
                clientSecret: $('#oauth-client-secret').val(),
                tokenUrl: $('#oauth-token-url').val()
            };
        default:
            return {};
    }
}

function testApiConnection(index) {
    const savedApis = JSON.parse(localStorage.getItem('apiConnections') || '[]');
    const api = savedApis[index];

    if (!api) return;

    showNotification(`Testing connection to ${api.name}...`, 'info');

    // Prepare request options
    const requestOptions = {
        method: 'GET',
        headers: {}
    };

    // Add authentication headers
    if (api.authType && api.authType !== 'none' && api.authDetails) {
        switch (api.authType) {
            case 'basic':
                const credentials = btoa(`${api.authDetails.username}:${api.authDetails.password}`);
                requestOptions.headers['Authorization'] = `Basic ${credentials}`;
                break;
            case 'bearer':
                requestOptions.headers['Authorization'] = `Bearer ${api.authDetails.token}`;
                break;
            case 'api-key':
                requestOptions.headers[api.authDetails.headerName] = api.authDetails.key;
                break;
        }
    }

    // Add timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), (api.timeout || 30) * 1000);
    requestOptions.signal = controller.signal;

    // Make the actual API call
    fetch(api.baseUrl, requestOptions)
        .then(response => {
            clearTimeout(timeoutId);
            api.status = response.ok ? 'active' : 'error';
            api.lastTest = new Date().toLocaleString();
            api.lastResponseCode = response.status;

            // Update in localStorage
            savedApis[index] = api;
            localStorage.setItem('apiConnections', JSON.stringify(savedApis));

            loadApiConnections();
            updateApiStats();

            if (response.ok) {
                showNotification(`✅ ${api.name} connection test successful! (${response.status})`, 'success');
            } else {
                showNotification(`❌ ${api.name} connection test failed! (${response.status})`, 'error');
            }
        })
        .catch(error => {
            clearTimeout(timeoutId);
            api.status = 'error';
            api.lastTest = new Date().toLocaleString();
            api.lastError = error.message;

            // Update in localStorage
            savedApis[index] = api;
            localStorage.setItem('apiConnections', JSON.stringify(savedApis));

            loadApiConnections();
            updateApiStats();

            showNotification(`❌ ${api.name} connection test failed: ${error.message}`, 'error');
        });
}

function editApiConnection(index) {
    const savedApis = JSON.parse(localStorage.getItem('apiConnections') || '[]');
    const api = savedApis[index];

    if (!api) return;

    // Populate form with existing data
    $('#api-name').val(api.name);
    $('#api-type').val(api.type);
    $('#api-base-url').val(api.baseUrl);
    $('#api-version').val(api.version || '');
    $('#auth-type').val(api.authType || 'none');
    $('#api-description').val(api.description || '');
    $('#timeout').val(api.timeout || 30);
    $('#retry-count').val(api.retryCount || 3);
    $('#rate-limit').val(api.rateLimit || 60);
    $('#cache-enabled').prop('checked', api.cacheEnabled !== false);

    // Show auth fields if needed
    if (api.authType && api.authType !== 'none') {
        showAuthFields(api.authType);
        populateAuthFields(api.authType, api.authDetails);
    }

    // Change modal title and button
    $('#addApiModal .modal-title').html('<i class="fas fa-edit"></i> Edit API Connection');
    $('#addApiModal .btn-primary').text('Update Connection').attr('onclick', `updateApiConnection(${index})`);

    $('#addApiModal').modal('show');
}

function populateAuthFields(authType, authDetails) {
    if (!authDetails) return;

    switch (authType) {
        case 'basic':
            $('#basic-username').val(authDetails.username || '');
            $('#basic-password').val(authDetails.password || '');
            break;
        case 'bearer':
            $('#bearer-token').val(authDetails.token || '');
            break;
        case 'api-key':
            $('#api-key-name').val(authDetails.headerName || '');
            $('#api-key-value').val(authDetails.key || '');
            break;
        case 'oauth2':
            $('#oauth-client-id').val(authDetails.clientId || '');
            $('#oauth-client-secret').val(authDetails.clientSecret || '');
            $('#oauth-token-url').val(authDetails.tokenUrl || '');
            break;
    }
}

function updateApiConnection(index) {
    const form = $('#add-api-form')[0];

    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const savedApis = JSON.parse(localStorage.getItem('apiConnections') || '[]');

    const apiData = {
        ...savedApis[index],
        name: $('#api-name').val(),
        type: $('#api-type').val(),
        baseUrl: $('#api-base-url').val(),
        version: $('#api-version').val(),
        authType: $('#auth-type').val(),
        description: $('#api-description').val(),
        timeout: parseInt($('#timeout').val()),
        retryCount: parseInt($('#retry-count').val()),
        rateLimit: parseInt($('#rate-limit').val()),
        cacheEnabled: $('#cache-enabled').is(':checked')
    };

    // Update authentication details
    if (apiData.authType !== 'none') {
        apiData.authDetails = getAuthDetails(apiData.authType);
    }

    // Update in array
    savedApis[index] = apiData;
    localStorage.setItem('apiConnections', JSON.stringify(savedApis));

    $('#addApiModal').modal('hide');
    loadApiConnections();
    updateApiStats();

    // Reset modal
    $('#addApiModal .modal-title').html('<i class="fas fa-plus"></i> Add New API Connection');
    $('#addApiModal .btn-primary').text('Save Connection').attr('onclick', 'saveApiConnection()');

    showNotification('API connection updated successfully!', 'success');
}

function deleteApiConnection(index) {
    if (!confirm('Are you sure you want to delete this API connection?')) {
        return;
    }

    const savedApis = JSON.parse(localStorage.getItem('apiConnections') || '[]');
    savedApis.splice(index, 1);
    localStorage.setItem('apiConnections', JSON.stringify(savedApis));

    loadApiConnections();
    updateApiStats();
    showNotification('API connection deleted successfully!', 'success');
}

function viewApiLogs(index) {
    showNotification('API logs feature coming soon!', 'info');
}

function filterApiConnections() {
    const searchTerm = $('#api-search').val().toLowerCase();
    const statusFilter = $('#status-filter').val();

    $('.api-connection-card').each(function() {
        const card = $(this);
        const apiName = card.find('h3').text().toLowerCase();
        const apiStatus = card.find('.api-status').hasClass('active') ? 'active' :
                         card.find('.api-status').hasClass('error') ? 'error' : 'inactive';

        const matchesSearch = apiName.includes(searchTerm);
        const matchesStatus = statusFilter === 'all' || apiStatus === statusFilter;

        if (matchesSearch && matchesStatus) {
            card.show();
        } else {
            card.hide();
        }
    });
}

function updateApiStats() {
    const savedApis = JSON.parse(localStorage.getItem('apiConnections') || '[]');

    const activeConnections = savedApis.filter(api => api.status === 'active').length;
    const totalCalls = savedApis.reduce((sum, api) => sum + (api.callCount || 0), 0);
    const successfulCalls = savedApis.reduce((sum, api) => sum + (api.successCount || 0), 0);
    const failedCalls = totalCalls - successfulCalls;
    const avgResponseTime = savedApis.length > 0 ?
        savedApis.reduce((sum, api) => sum + (api.avgResponseTime || 0), 0) / savedApis.length : 0;

    $('#active-connections').text(activeConnections);
    $('#successful-calls').text(successfulCalls);
    $('#failed-calls').text(failedCalls);
    $('#avg-response-time').text(avgResponseTime.toFixed(1) + 'ms');
}

function testApiEndpoint() {
    const apiIndex = $('#test-api-select').val();
    const method = $('#test-method').val();
    const endpoint = $('#test-endpoint').val();
    const headers = $('#test-headers').val();
    const body = $('#test-body').val();

    if (!apiIndex || !endpoint) {
        showNotification('Please select an API and enter an endpoint', 'warning');
        return;
    }

    const savedApis = JSON.parse(localStorage.getItem('apiConnections') || '[]');
    const api = savedApis[apiIndex];

    if (!api) {
        showNotification('Selected API not found', 'error');
        return;
    }

    // Update status
    $('#response-status').text('Testing...').css('color', '#f39c12');
    $('#response-time').text('...');
    $('#response-headers').text('Testing...');
    $('#response-body').text('Testing...');

    // Prepare request options
    const requestOptions = {
        method: method,
        headers: {}
    };

    // Add authentication headers
    if (api.authType && api.authType !== 'none' && api.authDetails) {
        switch (api.authType) {
            case 'basic':
                const credentials = btoa(`${api.authDetails.username}:${api.authDetails.password}`);
                requestOptions.headers['Authorization'] = `Basic ${credentials}`;
                break;
            case 'bearer':
                requestOptions.headers['Authorization'] = `Bearer ${api.authDetails.token}`;
                break;
            case 'api-key':
                requestOptions.headers[api.authDetails.headerName] = api.authDetails.key;
                break;
        }
    }

    // Add custom headers
    if (headers) {
        try {
            const customHeaders = JSON.parse(headers);
            Object.assign(requestOptions.headers, customHeaders);
        } catch (e) {
            showNotification('Invalid JSON in headers', 'error');
            return;
        }
    }

    // Add body for POST/PUT/PATCH
    if (['POST', 'PUT', 'PATCH'].includes(method) && body) {
        try {
            requestOptions.body = JSON.parse(body);
        } catch (e) {
            requestOptions.body = body;
        }
    }

    // Add timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), (api.timeout || 30) * 1000);
    requestOptions.signal = controller.signal;

    const startTime = Date.now();

    // Make the actual API call
    fetch(`${api.baseUrl}${endpoint}`, requestOptions)
        .then(async response => {
            clearTimeout(timeoutId);
            const responseTime = Date.now() - startTime;

            $('#response-time').text(responseTime + 'ms');

            // Get response headers
            const headersObj = {};
            response.headers.forEach((value, key) => {
                headersObj[key] = value;
            });

            $('#response-headers').text(JSON.stringify(headersObj, null, 2));

            if (response.ok) {
                $('#response-status').text(`${response.status} ${response.statusText}`).css('color', '#2ecc71');

                try {
                    const responseData = await response.json();
                    $('#response-body').text(JSON.stringify(responseData, null, 2));
                } catch (e) {
                    const textData = await response.text();
                    $('#response-body').text(textData);
                }

                showNotification('API test completed successfully!', 'success');
            } else {
                $('#response-status').text(`${response.status} ${response.statusText}`).css('color', '#e74c3c');

                try {
                    const errorData = await response.json();
                    $('#response-body').text(JSON.stringify(errorData, null, 2));
                } catch (e) {
                    const errorText = await response.text();
                    $('#response-body').text(errorText);
                }

                showNotification('API test failed!', 'error');
            }
        })
        .catch(error => {
            clearTimeout(timeoutId);
            const responseTime = Date.now() - startTime;

            $('#response-time').text(responseTime + 'ms');
            $('#response-status').text('Error').css('color', '#e74c3c');
            $('#response-headers').text('Request failed');
            $('#response-body').text(`Error: ${error.message}`);

            showNotification(`API test failed: ${error.message}`, 'error');
        });
}

// Utility function for notifications
function showNotification(message, type) {
    // Create notification element
    const notification = $(`
        <div class="notification ${type}">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
            <button class="notification-close" onclick="$(this).parent().remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `);

    // Add to page
    $('body').append(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.fadeOut(() => notification.remove());
    }, 5000);
}

// Clear test form
function clearTestForm() {
    $('#test-endpoint').val('');
    $('#test-headers').val('');
    $('#test-body').val('');
    $('#response-status').text('Not tested');
    $('#response-time').text('-');
    $('#response-headers').text('No response yet');
    $('#response-body').text('No response yet');
}

// Add notification styles
const notificationStyles = `
<style>
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: white;
    border-radius: 8px;
    padding: 15px 20px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    border-left: 4px solid;
    display: flex;
    align-items: center;
    gap: 10px;
    z-index: 10000;
    min-width: 300px;
    animation: slideIn 0.3s ease;
}

.notification.success {
    border-left-color: #2ecc71;
}

.notification.success i {
    color: #2ecc71;
}

.notification.error {
    border-left-color: #e74c3c;
}

.notification.error i {
    color: #e74c3c;
}

.notification.warning {
    border-left-color: #f39c12;
}

.notification.warning i {
    color: #f39c12;
}

.notification.info {
    border-left-color: #3498db;
}

.notification.info i {
    color: #3498db;
}

.notification-close {
    background: none;
    border: none;
    color: #666;
    cursor: pointer;
    padding: 5px;
    margin-left: auto;
}

.notification-close:hover {
    color: #333;
}

@keyframes slideIn {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

.empty-state {
    grid-column: 1 / -1;
    text-align: center;
    padding: 60px 20px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 12px;
    border: 2px dashed #e2e8f0;
}

.empty-state i {
    font-size: 48px;
    color: var(--primary-color);
    margin-bottom: 20px;
}

.empty-state h3 {
    font-size: 24px;
    font-weight: 600;
    color: var(--dark-color);
    margin-bottom: 10px;
}

.empty-state p {
    color: #666;
    margin-bottom: 30px;
}
</style>
`;

// Add notification styles to head
$('head').append(notificationStyles);