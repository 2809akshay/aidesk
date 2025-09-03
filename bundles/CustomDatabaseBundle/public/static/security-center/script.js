// Security Center JavaScript Functions
$(document).ready(function() {
    // Initialize the security center interface
    initializeSecurityCenter();

    // Load security data
    loadSecurityData();

    // Set up event listeners
    setupSecurityEventListeners();

    // Start real-time monitoring
    startSecurityMonitoring();
});

function initializeSecurityCenter() {
    // Initialize security center interface
    updateSecurityStats();
    loadThreatData();
    loadAccessLogs();
    loadAuditLogs();
    loadSecurityAlerts();
    loadEncryptedFields();
}

function loadSecurityData() {
    // Load all security-related data
    loadUserRoles();
    loadComplianceStatus();
    updateEncryptionStats();
}

function setupSecurityEventListeners() {
    // Threat timeframe filter
    $('#threat-timeframe').change(function() {
        loadThreatData();
    });

    // Security scan button
    $('#run-security-scan').click(function() {
        runSecurityScan();
    });
}

function updateSecurityStats() {
    // Mock security statistics - in real app, this would come from server
    const stats = {
        securityScore: 85,
        activeThreats: 2,
        encryptedFields: 12,
        accessViolations: 0
    };

    $('#security-score').text(stats.securityScore + '%');
    $('#active-threats').text(stats.activeThreats);
    $('#encrypted-fields').text(stats.encryptedFields);
    $('#access-violations').text(stats.accessViolations);

    // Update score color based on value
    const scoreElement = $('#security-score');
    if (stats.securityScore >= 90) {
        scoreElement.css('color', '#27ae60');
    } else if (stats.securityScore >= 70) {
        scoreElement.css('color', '#f39c12');
    } else {
        scoreElement.css('color', '#e74c3c');
    }
}

function loadThreatData() {
    // Mock threat data - in real app, this would come from security monitoring system
    const threats = [
        {
            id: 1,
            type: 'SQL Injection Attempt',
            severity: 'high',
            source: '192.168.1.100',
            timestamp: new Date().toLocaleString(),
            status: 'blocked'
        },
        {
            id: 2,
            type: 'Brute Force Attack',
            severity: 'critical',
            source: '10.0.0.50',
            timestamp: new Date(Date.now() - 3600000).toLocaleString(),
            status: 'blocked'
        },
        {
            id: 3,
            type: 'Unauthorized Access',
            severity: 'medium',
            source: '172.16.0.25',
            timestamp: new Date(Date.now() - 7200000).toLocaleString(),
            status: 'investigating'
        },
        {
            id: 4,
            type: 'Suspicious Login',
            severity: 'low',
            source: '192.168.1.150',
            timestamp: new Date(Date.now() - 10800000).toLocaleString(),
            status: 'monitored'
        }
    ];

    const threatsList = $('#threats-list');
    threatsList.empty();

    threats.forEach(threat => {
        const threatHtml = `
            <div class="threat-item">
                <div class="threat-info">
                    <h5>${threat.type}</h5>
                    <div class="threat-details">
                        <span>Source: ${threat.source}</span>
                        <span>Time: ${threat.timestamp}</span>
                    </div>
                </div>
                <div class="threat-actions">
                    <span class="threat-severity ${threat.severity}">${threat.severity}</span>
                    <span class="threat-status">${threat.status}</span>
                </div>
            </div>
        `;
        threatsList.append(threatHtml);
    });

    // Update threat metrics
    const totalThreats = threats.length;
    const blockedAttempts = threats.filter(t => t.status === 'blocked').length;
    const falsePositives = threats.filter(t => t.severity === 'low').length;

    $('#total-threats').text(totalThreats);
    $('#blocked-attempts').text(blockedAttempts);
    $('#false-positives').text(falsePositives);
}

function loadUserRoles() {
    // Mock user roles data
    const roles = [
        {
            name: 'Administrator',
            permissions: ['Full Access', 'User Management', 'Security Settings'],
            users: 3
        },
        {
            name: 'Data Analyst',
            permissions: ['Read Data', 'Export Data', 'View Reports'],
            users: 8
        },
        {
            name: 'Developer',
            permissions: ['API Access', 'Database Read/Write', 'Deploy Code'],
            users: 5
        },
        {
            name: 'Auditor',
            permissions: ['View Logs', 'Export Reports', 'Compliance Check'],
            users: 2
        }
    ];

    const rolesList = $('#roles-list');
    rolesList.empty();

    roles.forEach(role => {
        const roleHtml = `
            <div class="role-item">
                <h5>${role.name}</h5>
                <div class="role-details">
                    <div class="role-permissions">${role.permissions.join(', ')}</div>
                    <div class="role-users">${role.users} users</div>
                </div>
            </div>
        `;
        rolesList.append(roleHtml);
    });
}

function loadAccessLogs() {
    // Mock access logs data
    const logs = [
        {
            user: 'john.doe',
            action: 'Login',
            resource: 'Dashboard',
            timestamp: new Date().toLocaleString(),
            ip: '192.168.1.100',
            status: 'success'
        },
        {
            user: 'jane.smith',
            action: 'Export Data',
            resource: 'Customer Table',
            timestamp: new Date(Date.now() - 1800000).toLocaleString(),
            ip: '192.168.1.101',
            status: 'success'
        },
        {
            user: 'admin',
            action: 'Delete Record',
            resource: 'User Table',
            timestamp: new Date(Date.now() - 3600000).toLocaleString(),
            ip: '192.168.1.1',
            status: 'success'
        },
        {
            user: 'unknown',
            action: 'Failed Login',
            resource: 'Login Form',
            timestamp: new Date(Date.now() - 7200000).toLocaleString(),
            ip: '10.0.0.50',
            status: 'failed'
        }
    ];

    const accessLogs = $('#access-logs');
    accessLogs.empty();

    logs.forEach(log => {
        const logHtml = `
            <div class="log-entry">
                <div class="log-info">
                    <strong>${log.user}</strong> ${log.action} on <strong>${log.resource}</strong>
                </div>
                <div class="log-details">
                    ${log.timestamp} | IP: ${log.ip} | Status: <span class="${log.status}">${log.status}</span>
                </div>
            </div>
        `;
        accessLogs.append(logHtml);
    });
}

function loadAuditLogs() {
    // Mock audit logs data
    const auditLogs = [
        {
            event: 'Security Policy Updated',
            user: 'admin',
            timestamp: new Date().toLocaleString(),
            details: 'Password complexity requirements updated'
        },
        {
            event: 'User Access Granted',
            user: 'admin',
            timestamp: new Date(Date.now() - 3600000).toLocaleString(),
            details: 'Access granted to jane.smith for Data Export'
        },
        {
            event: 'Encryption Key Rotated',
            user: 'system',
            timestamp: new Date(Date.now() - 7200000).toLocaleString(),
            details: 'Database encryption keys rotated successfully'
        },
        {
            event: 'Security Scan Completed',
            user: 'system',
            timestamp: new Date(Date.now() - 10800000).toLocaleString(),
            details: 'Automated security scan found 2 vulnerabilities'
        }
    ];

    const auditLogsContainer = $('#audit-logs');
    auditLogsContainer.empty();

    auditLogs.forEach(log => {
        const logHtml = `
            <div class="audit-entry">
                <div class="audit-info">
                    <strong>${log.event}</strong> by ${log.user}
                </div>
                <div class="audit-details">
                    ${log.timestamp} | ${log.details}
                </div>
            </div>
        `;
        auditLogsContainer.append(logHtml);
    });
}

function loadSecurityAlerts() {
    // Mock security alerts data
    const alerts = [
        {
            title: 'Critical Security Update Required',
            description: 'A critical security vulnerability has been detected in the authentication system.',
            level: 'critical',
            timestamp: new Date().toLocaleString(),
            status: 'active'
        },
        {
            title: 'Unusual Login Activity Detected',
            description: 'Multiple failed login attempts from IP 10.0.0.50',
            level: 'warning',
            timestamp: new Date(Date.now() - 3600000).toLocaleString(),
            status: 'investigating'
        },
        {
            title: 'SSL Certificate Expiring Soon',
            description: 'SSL certificate for api.example.com expires in 7 days',
            level: 'warning',
            timestamp: new Date(Date.now() - 7200000).toLocaleString(),
            status: 'pending'
        },
        {
            title: 'Backup Completed Successfully',
            description: 'Daily database backup completed without errors',
            level: 'info',
            timestamp: new Date(Date.now() - 10800000).toLocaleString(),
            status: 'resolved'
        }
    ];

    const alertsList = $('#alerts-list');
    alertsList.empty();

    alerts.forEach(alert => {
        const alertHtml = `
            <div class="alert-item">
                <div class="alert-info">
                    <h5>${alert.title}</h5>
                    <div class="alert-description">${alert.description}</div>
                    <div class="alert-timestamp">${alert.timestamp}</div>
                </div>
                <div class="alert-meta">
                    <span class="alert-level ${alert.level}">${alert.level}</span>
                    <span class="alert-status">${alert.status}</span>
                </div>
            </div>
        `;
        alertsList.append(alertHtml);
    });
}

function loadEncryptedFields() {
    // Mock encrypted fields data
    const encryptedFields = [
        { name: 'password', table: 'users', type: 'AES-256', status: 'encrypted' },
        { name: 'credit_card', table: 'payments', type: 'AES-256', status: 'encrypted' },
        { name: 'ssn', table: 'employees', type: 'AES-256', status: 'encrypted' },
        { name: 'api_key', table: 'integrations', type: 'AES-256', status: 'encrypted' },
        { name: 'email', table: 'users', type: 'AES-256', status: 'pending' },
        { name: 'phone', table: 'contacts', type: 'AES-256', status: 'pending' }
    ];

    const fieldsBody = $('#encrypted-fields-body');
    fieldsBody.empty();

    encryptedFields.forEach(field => {
        const rowHtml = `
            <tr>
                <td>${field.name}</td>
                <td>${field.table}</td>
                <td>${field.type}</td>
                <td><span class="status-${field.status}">${field.status}</span></td>
                <td>
                    <button class="btn-action" onclick="manageFieldEncryption('${field.name}', '${field.table}')">
                        <i class="fas fa-cog"></i>
                    </button>
                </td>
            </tr>
        `;
        fieldsBody.append(rowHtml);
    });
}

function updateEncryptionStats() {
    // Mock encryption statistics
    $('#encrypted-databases').text('3');
    $('#encryption-algorithm').text('AES-256');
    $('#last-key-rotation').text('2 days ago');
}

function runSecurityScan() {
    $('#securityScanModal').modal('show');

    // Reset scan progress
    $('#scan-progress-fill').css('width', '0%');
    $('#scan-details').text('Initializing security scan...');
    $('#scan-results').hide();

    let progress = 0;
    const scanSteps = [
        'Initializing security scan...',
        'Scanning network configuration...',
        'Checking firewall rules...',
        'Analyzing user permissions...',
        'Testing encryption protocols...',
        'Reviewing access logs...',
        'Checking for vulnerabilities...',
        'Generating security report...'
    ];

    const scanInterval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 100) progress = 100;

        $('#scan-progress-fill').css('width', progress + '%');

        const stepIndex = Math.floor((progress / 100) * scanSteps.length);
        $('#scan-details').text(scanSteps[Math.min(stepIndex, scanSteps.length - 1)]);

        if (progress >= 100) {
            clearInterval(scanInterval);
            completeSecurityScan();
        }
    }, 1000);
}

function completeSecurityScan() {
    $('#scan-details').text('Security scan completed!');
    $('#scan-results').show();

    // Mock scan results
    $('#vulnerabilities-count').text('2');
    $('#security-issues-count').text('5');
    $('#recommendations-count').text('8');

    showNotification('Security scan completed! Review the results.', 'success');
}

function startSecurityMonitoring() {
    // Simulate real-time security monitoring
    setInterval(() => {
        // Randomly update threat count
        if (Math.random() > 0.8) {
            const currentThreats = parseInt($('#active-threats').text());
            const newThreats = Math.max(0, currentThreats + (Math.random() > 0.5 ? 1 : -1));
            $('#active-threats').text(newThreats);
        }

        // Update security score slightly
        if (Math.random() > 0.9) {
            const currentScore = parseInt($('#security-score').text());
            const newScore = Math.max(0, Math.min(100, currentScore + (Math.random() - 0.5) * 2));
            $('#security-score').text(Math.round(newScore) + '%');
        }
    }, 30000); // Update every 30 seconds
}

function createNewRole() {
    showNotification('Create new role feature coming soon!', 'info');
}

function managePermissions() {
    showNotification('Permission management feature coming soon!', 'info');
}

function exportAccessLogs() {
    showNotification('Exporting access logs...', 'info');
    setTimeout(() => {
        showNotification('Access logs exported successfully!', 'success');
    }, 2000);
}

function clearAccessLogs() {
    if (confirm('Are you sure you want to clear all access logs? This action cannot be undone.')) {
        $('#access-logs').empty();
        showNotification('Access logs cleared!', 'warning');
    }
}

function rotateEncryptionKeys() {
    showNotification('Rotating encryption keys...', 'info');
    setTimeout(() => {
        $('#last-key-rotation').text('Just now');
        showNotification('Encryption keys rotated successfully!', 'success');
    }, 3000);
}

function manageEncryption() {
    showNotification('Encryption management feature coming soon!', 'info');
}

function generateEncryptionReport() {
    showNotification('Generating encryption report...', 'info');
    setTimeout(() => {
        showNotification('Encryption report generated successfully!', 'success');
    }, 2000);
}

function runSecurityAudit() {
    showNotification('Running security audit...', 'info');
    setTimeout(() => {
        showNotification('Security audit completed! Check the audit logs.', 'success');
        loadAuditLogs(); // Refresh audit logs
    }, 5000);
}

function exportAuditReport() {
    showNotification('Exporting audit report...', 'info');
    setTimeout(() => {
        showNotification('Audit report exported successfully!', 'success');
    }, 2000);
}

function configureAlerts() {
    showNotification('Alert configuration feature coming soon!', 'info');
}

function testAlertSystem() {
    showNotification('Testing alert system...', 'info');
    setTimeout(() => {
        showNotification('Alert system test completed successfully!', 'success');
    }, 2000);
}

function manageFieldEncryption(fieldName, tableName) {
    showNotification(`Managing encryption for ${fieldName} in ${tableName}...`, 'info');
}

function viewScanReport() {
    showNotification('Scan report feature coming soon!', 'info');
}

function loadComplianceStatus() {
    // Compliance status is already in the HTML, but this could be updated dynamically
    showNotification('Compliance status loaded', 'info');
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