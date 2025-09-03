// Data Masking JavaScript Functions
$(document).ready(function() {
    // Initialize the data masking interface
    initializeDataMasking();

    // Load masking data
    loadMaskingData();

    // Set up event listeners
    setupMaskingEventListeners();

    // Initialize charts
    initializeMaskingCharts();
});

function initializeDataMasking() {
    // Initialize data masking interface
    updateMaskingStats();
    loadMaskingRules();
    loadMaskingHistory();
}

function loadMaskingData() {
    // Load all masking-related data
    loadSensitiveDataTypes();
    loadComplianceData();
}

function setupMaskingEventListeners() {
    // Rule search functionality
    $('#rule-search').on('input', function() {
        filterMaskingRules();
    });

    // Rule status filter
    $('#rule-status-filter').change(function() {
        filterMaskingRules();
    });
}

function updateMaskingStats() {
    // Mock masking statistics
    const stats = {
        maskedDatabases: 8,
        maskedTables: 24,
        maskedFields: 156,
        complianceScore: 94
    };

    $('#masked-databases').text(stats.maskedDatabases);
    $('#masked-tables').text(stats.maskedTables);
    $('#masked-fields').text(stats.maskedFields);
    $('#compliance-score').text(stats.complianceScore + '%');

    // Update score color based on value
    const scoreElement = $('#compliance-score');
    if (stats.complianceScore >= 95) {
        scoreElement.css('color', '#27ae60');
    } else if (stats.complianceScore >= 85) {
        scoreElement.css('color', '#f39c12');
    } else {
        scoreElement.css('color', '#e74c3c');
    }
}

function loadMaskingRules() {
    // Mock masking rules data
    const rules = [
        {
            id: 1,
            name: 'Credit Card Masking',
            type: 'mask',
            target: 'payments.card_number',
            pattern: 'XXXX-XXXX-XXXX-####',
            status: 'active',
            recordsAffected: 2450,
            lastRun: new Date().toLocaleString()
        },
        {
            id: 2,
            name: 'Email Hashing',
            type: 'hash',
            target: 'users.email',
            pattern: 'SHA256',
            status: 'active',
            recordsAffected: 8320,
            lastRun: new Date(Date.now() - 3600000).toLocaleString()
        },
        {
            id: 3,
            name: 'SSN Encryption',
            type: 'encrypt',
            target: 'employees.ssn',
            pattern: 'AES256',
            status: 'active',
            recordsAffected: 1890,
            lastRun: new Date(Date.now() - 7200000).toLocaleString()
        },
        {
            id: 4,
            name: 'Phone Redaction',
            type: 'redact',
            target: 'contacts.phone',
            pattern: 'XXX-XXX-####',
            status: 'inactive',
            recordsAffected: 4670,
            lastRun: new Date(Date.now() - 10800000).toLocaleString()
        }
    ];

    const rulesGrid = $('#rules-grid');
    rulesGrid.empty();

    rules.forEach(rule => {
        const ruleHtml = `
            <div class="rule-card">
                <div class="rule-header">
                    <div class="rule-info">
                        <h4>${rule.name}</h4>
                        <span class="rule-type">${rule.type.toUpperCase()}</span>
                    </div>
                    <div class="rule-status ${rule.status}">
                        ${rule.status}
                    </div>
                </div>

                <div class="rule-details">
                    <div class="rule-detail">
                        <span class="rule-detail-label">Target:</span>
                        <span class="rule-detail-value">${rule.target}</span>
                    </div>
                    <div class="rule-detail">
                        <span class="rule-detail-label">Pattern:</span>
                        <span class="rule-detail-value">${rule.pattern}</span>
                    </div>
                    <div class="rule-detail">
                        <span class="rule-detail-label">Records:</span>
                        <span class="rule-detail-value">${rule.recordsAffected.toLocaleString()}</span>
                    </div>
                    <div class="rule-detail">
                        <span class="rule-detail-label">Last Run:</span>
                        <span class="rule-detail-value">${rule.lastRun}</span>
                    </div>
                </div>

                <div class="rule-actions">
                    <button class="btn-rule-action btn-test-rule" onclick="testMaskingRule(${rule.id})">
                        <i class="fas fa-play"></i> Test
                    </button>
                    <button class="btn-rule-action btn-edit-rule" onclick="editMaskingRule(${rule.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn-rule-action btn-delete-rule" onclick="deleteMaskingRule(${rule.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
        rulesGrid.append(ruleHtml);
    });
}

function filterMaskingRules() {
    const searchTerm = $('#rule-search').val().toLowerCase();
    const statusFilter = $('#rule-status-filter').val();

    $('.rule-card').each(function() {
        const card = $(this);
        const ruleName = card.find('h4').text().toLowerCase();
        const ruleStatus = card.find('.rule-status').text().toLowerCase();

        const matchesSearch = ruleName.includes(searchTerm);
        const matchesStatus = statusFilter === 'all' || ruleStatus === statusFilter;

        if (matchesSearch && matchesStatus) {
            card.show();
        } else {
            card.hide();
        }
    });
}

function loadMaskingHistory() {
    // Mock masking history data
    const history = [
        {
            timestamp: new Date().toLocaleString(),
            action: 'Masking Applied',
            target: 'payments.card_number',
            recordsAffected: 2450,
            status: 'completed',
            user: 'admin'
        },
        {
            timestamp: new Date(Date.now() - 3600000).toLocaleString(),
            action: 'Rule Created',
            target: 'users.email',
            recordsAffected: 0,
            status: 'completed',
            user: 'data-admin'
        },
        {
            timestamp: new Date(Date.now() - 7200000).toLocaleString(),
            action: 'Masking Failed',
            target: 'employees.ssn',
            recordsAffected: 0,
            status: 'failed',
            user: 'system'
        },
        {
            timestamp: new Date(Date.now() - 10800000).toLocaleString(),
            action: 'Compliance Check',
            target: 'All Tables',
            recordsAffected: 15600,
            status: 'completed',
            user: 'compliance-bot'
        }
    ];

    const historyBody = $('#masking-history-body');
    historyBody.empty();

    history.forEach(entry => {
        const rowHtml = `
            <tr>
                <td>${entry.timestamp}</td>
                <td>${entry.action}</td>
                <td>${entry.target}</td>
                <td>${entry.recordsAffected.toLocaleString()}</td>
                <td><span class="status-${entry.status}">${entry.status}</span></td>
                <td>${entry.user}</td>
                <td><button class="btn-details" onclick="viewHistoryDetails('${entry.timestamp}')">View</button></td>
            </tr>
        `;
        historyBody.append(rowHtml);
    });
}

function loadSensitiveDataTypes() {
    // Data types are already in the HTML, but this could be updated dynamically
    showNotification('Sensitive data types loaded', 'success');
}

function loadComplianceData() {
    // Compliance data is already in the HTML, but this could be updated dynamically
    showNotification('Compliance data loaded', 'success');
}

function initializeMaskingCharts() {
    // Initialize Chart.js charts (mock implementation)
    initializeClassificationChart();
}

function initializeClassificationChart() {
    // Mock classification chart
    const ctx = document.getElementById('classification-chart');
    if (!ctx) return;

    const chartHtml = `
        <div style="height: 200px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; color: white;">
            <div style="text-align: center;">
                <i class="fas fa-chart-pie" style="font-size: 48px; margin-bottom: 10px;"></i>
                <div>Data Classification Chart</div>
                <div style="font-size: 12px; opacity: 0.8;">Interactive chart would be displayed here</div>
            </div>
        </div>
    `;

    $(ctx).replaceWith(chartHtml);
}

function openCreateRuleModal() {
    $('#createRuleModal').modal('show');
    loadTargetDatabases();
}

function loadTargetDatabases() {
    // Mock target databases
    const databases = ['ecommerce_db', 'user_db', 'analytics_db', 'backup_db'];
    const dbSelect = $('#target-database');

    dbSelect.empty().append('<option value="">Select Database</option>');

    databases.forEach(db => {
        dbSelect.append(`<option value="${db}">${db}</option>`);
    });
}

function createMaskingRule() {
    const ruleData = {
        name: $('#rule-name').val(),
        type: $('#rule-type').val(),
        database: $('#target-database').val(),
        table: $('#target-table').val(),
        column: $('#target-column').val(),
        pattern: $('#masking-pattern').val(),
        description: $('#rule-description').val(),
        conditions: $('#rule-conditions').val()
    };

    if (!ruleData.name || !ruleData.type || !ruleData.database || !ruleData.table || !ruleData.column) {
        showNotification('Please fill in all required fields', 'warning');
        return;
    }

    // Mock rule creation
    showNotification(`Creating masking rule: ${ruleData.name}...`, 'info');

    $('#createRuleModal').modal('hide');

    setTimeout(() => {
        showNotification(`Masking rule "${ruleData.name}" created successfully!`, 'success');
        loadMaskingRules(); // Refresh rules list
    }, 2000);
}

function testMaskingRule(ruleId) {
    showNotification(`Testing masking rule ${ruleId}...`, 'info');
    setTimeout(() => {
        showNotification(`Rule ${ruleId} test completed successfully!`, 'success');
    }, 1500);
}

function editMaskingRule(ruleId) {
    showNotification(`Editing masking rule ${ruleId}...`, 'info');
    // In real app, this would open an edit modal
}

function deleteMaskingRule(ruleId) {
    if (confirm(`Are you sure you want to delete masking rule ${ruleId}?`)) {
        showNotification(`Deleting masking rule ${ruleId}...`, 'info');
        setTimeout(() => {
            showNotification(`Rule ${ruleId} deleted successfully!`, 'success');
            loadMaskingRules(); // Refresh rules list
        }, 1000);
    }
}

function runDataMasking() {
    showNotification('Starting data masking process...', 'info');

    // Mock progress simulation
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress > 100) progress = 100;

        showNotification(`Masking progress: ${Math.round(progress)}%`, 'info');

        if (progress >= 100) {
            clearInterval(progressInterval);
            showNotification('Data masking completed successfully!', 'success');
            loadMaskingHistory(); // Refresh history
        }
    }, 1000);
}

function applyTemplate(templateType) {
    const templateNames = {
        'gdpr': 'GDPR Compliance',
        'hipaa': 'HIPAA Compliance',
        'pci': 'PCI DSS Compliance',
        'corporate': 'Corporate Standard'
    };

    showNotification(`Applying ${templateNames[templateType]} template...`, 'info');
    setTimeout(() => {
        showNotification(`${templateNames[templateType]} template applied successfully!`, 'success');
        loadMaskingRules(); // Refresh rules list
    }, 2000);
}

function previewTemplate(templateType) {
    const templateNames = {
        'gdpr': 'GDPR Compliance',
        'hipaa': 'HIPAA Compliance',
        'pci': 'PCI DSS Compliance',
        'corporate': 'Corporate Standard'
    };

    showNotification(`Previewing ${templateNames[templateType]} template...`, 'info');
    // In real app, this would open a preview modal
}

function viewHistoryDetails(timestamp) {
    showNotification(`Viewing details for ${timestamp}`, 'info');
    // In real app, this would open a details modal
}

// Utility function for notifications
function showNotification(message, type) {
    // Create enhanced notification system
    const notification = $(`
        <div class="notification ${type}" style="
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
        ">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}" style="color: ${type === 'success' ? '#2ecc71' : type === 'error' ? '#e74c3c' : '#f39c12'}"></i>
            <span>${message}</span>
            <button class="notification-close" onclick="$(this).parent().remove()" style="
                background: none;
                border: none;
                color: #666;
                cursor: pointer;
                padding: 5px;
                margin-left: auto;
            ">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `);

    $('body').append(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.fadeOut(() => notification.remove());
    }, 5000);
}

// Add CSS animation for notifications
const notificationStyle = `
<style>
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
</style>
`;

// Append notification styles to head
if (!$('#notification-styles').length) {
    $('head').append(notificationStyle);
}