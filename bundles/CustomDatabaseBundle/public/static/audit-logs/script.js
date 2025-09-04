// Audit Logs JavaScript Functions
$(document).ready(function() {
    // Initialize the audit logs interface
    initializeAuditLogs();

    // Load audit data
    loadAuditData();

    // Set up event listeners
    setupAuditEventListeners();

    // Initialize charts
    initializeAuditCharts();

    // Start real-time monitoring
    startRealTimeMonitoring();
});

function initializeAuditLogs() {
    // Initialize audit logs interface
    updateAuditStats();
    loadAuditLogEntries();
    loadRecentEvents();
}

function loadAuditData() {
    // Load all audit-related data
    updateRealTimeMetrics();
}

function setupAuditEventListeners() {
    // Date range filter
    $('#date-range').change(function() {
        const range = $(this).val();
        if (range === 'custom') {
            // Show custom date inputs (would be implemented)
        } else {
            applyFilters();
        }
    });

    // Other filters
    $('#event-type, #severity, #action-filter, #status-filter').change(function() {
        applyFilters();
    });

    // User and IP filters
    $('#user-filter, #ip-filter, #resource-filter').on('input', function() {
        applyFilters();
    });

    // Log search
    $('#log-search').on('input', function() {
        searchLogs();
    });

    // Entries per page
    $('#entries-per-page').change(function() {
        loadAuditLogEntries();
    });

    // Select all checkbox
    $('#select-all').change(function() {
        const isChecked = $(this).is(':checked');
        $('.log-checkbox').prop('checked', isChecked);
    });

    // Pagination
    setupPagination();
}

function updateAuditStats() {
    // Mock audit statistics
    const stats = {
        totalEntries: 1247890,
        criticalEvents: 47,
        securityEvents: 1234,
        avgResponseTime: 245
    };

    $('#total-log-entries').text(stats.totalEntries.toLocaleString());
    $('#critical-events').text(stats.criticalEvents);
    $('#security-events').text(stats.securityEvents.toLocaleString());
    $('#avg-response-time').text(stats.avgResponseTime + 'ms');
}

function loadAuditLogEntries() {
    // Mock audit log entries
    const entries = [
        {
            id: 1,
            timestamp: new Date().toLocaleString(),
            user: 'john.doe',
            eventType: 'Login',
            action: 'Login',
            resource: 'Dashboard',
            ipAddress: '192.168.1.100',
            severity: 'info',
            status: 'success',
            details: 'User logged in successfully'
        },
        {
            id: 2,
            timestamp: new Date(Date.now() - 300000).toLocaleString(),
            user: 'admin',
            eventType: 'Data Access',
            action: 'Read',
            resource: 'users',
            ipAddress: '192.168.1.1',
            severity: 'low',
            status: 'success',
            details: 'Accessed user data'
        },
        {
            id: 3,
            timestamp: new Date(Date.now() - 600000).toLocaleString(),
            user: 'jane.smith',
            eventType: 'Data Modification',
            action: 'Update',
            resource: 'products',
            ipAddress: '192.168.1.101',
            severity: 'medium',
            status: 'success',
            details: 'Updated product information'
        },
        {
            id: 4,
            timestamp: new Date(Date.now() - 900000).toLocaleString(),
            user: 'unknown',
            eventType: 'Security',
            action: 'Failed Login',
            resource: 'Login Form',
            ipAddress: '10.0.0.50',
            severity: 'high',
            status: 'failure',
            details: 'Multiple failed login attempts'
        },
        {
            id: 5,
            timestamp: new Date(Date.now() - 1200000).toLocaleString(),
            user: 'system',
            eventType: 'System',
            action: 'Backup',
            resource: 'Database',
            ipAddress: '127.0.0.1',
            severity: 'info',
            status: 'success',
            details: 'Automated backup completed'
        }
    ];

    const tbody = $('#logs-table-body');
    tbody.empty();

    entries.forEach(entry => {
        const rowHtml = `
            <tr>
                <td><input type="checkbox" class="log-checkbox" value="${entry.id}"></td>
                <td>${entry.timestamp}</td>
                <td>${entry.user}</td>
                <td>${entry.eventType}</td>
                <td>${entry.action}</td>
                <td>${entry.resource}</td>
                <td>${entry.ipAddress}</td>
                <td><span class="severity-${entry.severity}">${entry.severity}</span></td>
                <td><span class="status-${entry.status}">${entry.status}</span></td>
                <td><button class="btn-details" onclick="viewLogDetails(${entry.id})">View</button></td>
            </tr>
        `;
        tbody.append(rowHtml);
    });

    updateTableInfo();
    updatePagination();
}

function searchLogs() {
    const searchTerm = $('#log-search').val().toLowerCase();

    $('#logs-table-body tr').each(function() {
        const row = $(this);
        const text = row.text().toLowerCase();
        const isVisible = text.includes(searchTerm);
        row.toggle(isVisible);
    });

    updateTableInfo();
}

function applyFilters() {
    const filters = {
        dateRange: $('#date-range').val(),
        eventType: $('#event-type').val(),
        severity: $('#severity').val(),
        user: $('#user-filter').val().toLowerCase(),
        ip: $('#ip-filter').val().toLowerCase(),
        resource: $('#resource-filter').val().toLowerCase(),
        action: $('#action-filter').val(),
        status: $('#status-filter').val()
    };

    $('#logs-table-body tr').each(function() {
        const row = $(this);
        let isVisible = true;

        // Apply filters
        if (filters.eventType !== 'all' && !row.find('td:nth-child(4)').text().toLowerCase().includes(filters.eventType)) {
            isVisible = false;
        }

        if (filters.severity !== 'all' && !row.find('td:nth-child(8)').text().toLowerCase().includes(filters.severity)) {
            isVisible = false;
        }

        if (filters.user && !row.find('td:nth-child(3)').text().toLowerCase().includes(filters.user)) {
            isVisible = false;
        }

        if (filters.ip && !row.find('td:nth-child(7)').text().toLowerCase().includes(filters.ip)) {
            isVisible = false;
        }

        if (filters.resource && !row.find('td:nth-child(6)').text().toLowerCase().includes(filters.resource)) {
            isVisible = false;
        }

        if (filters.action !== 'all' && !row.find('td:nth-child(5)').text().toLowerCase().includes(filters.action)) {
            isVisible = false;
        }

        if (filters.status !== 'all' && !row.find('td:nth-child(9)').text().toLowerCase().includes(filters.status)) {
            isVisible = false;
        }

        row.toggle(isVisible);
    });

    updateTableInfo();
    showNotification('Filters applied successfully', 'success');
}

function clearFilters() {
    $('#date-range').val('7d');
    $('#event-type').val('all');
    $('#severity').val('all');
    $('#user-filter').val('');
    $('#ip-filter').val('');
    $('#resource-filter').val('');
    $('#action-filter').val('all');
    $('#status-filter').val('all');

    $('#logs-table-body tr').show();
    updateTableInfo();
    showNotification('Filters cleared', 'info');
}

function saveFilter() {
    const filterName = prompt('Enter a name for this filter:');
    if (filterName) {
        // In real app, this would save the filter configuration
        showNotification(`Filter "${filterName}" saved successfully`, 'success');
    }
}

function toggleFilters() {
    const filtersContent = $('#filters-content');
    const toggleBtn = $('.btn-toggle-filters i');

    filtersContent.slideToggle(300);
    toggleBtn.toggleClass('fa-chevron-down fa-chevron-up');
}

function updateTableInfo() {
    const visibleRows = $('#logs-table-body tr:visible').length;
    const totalRows = $('#logs-table-body tr').length;
    $('#table-info').text(`Showing ${visibleRows} of ${totalRows} entries`);
}

function setupPagination() {
    // Basic pagination setup
    updatePagination();
}

function updatePagination() {
    const entriesPerPage = parseInt($('#entries-per-page').val());
    const totalEntries = $('#logs-table-body tr').length;
    const totalPages = Math.ceil(totalEntries / entriesPerPage);

    const pageNumbers = $('#page-numbers');
    pageNumbers.empty();

    for (let i = 1; i <= Math.min(totalPages, 5); i++) {
        const pageBtn = $(`<button class="page-number ${i === 1 ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`);
        pageNumbers.append(pageBtn);
    }

    // Update prev/next buttons
    $('#prev-page').prop('disabled', true);
    $('#next-page').prop('disabled', totalPages <= 1);
}

function goToPage(pageNumber) {
    $('.page-number').removeClass('active');
    $(`.page-number:nth-child(${pageNumber})`).addClass('active');

    $('#prev-page').prop('disabled', pageNumber === 1);
    $('#next-page').prop('disabled', pageNumber === $('.page-number').length);

    // In real app, this would load the specific page of data
    showNotification(`Navigated to page ${pageNumber}`, 'info');
}

function loadRecentEvents() {
    // Mock recent events
    const events = [
        {
            time: '2 minutes ago',
            user: 'john.doe',
            action: 'Login successful',
            type: 'info'
        },
        {
            time: '5 minutes ago',
            user: 'admin',
            action: 'Data export completed',
            type: 'success'
        },
        {
            time: '8 minutes ago',
            user: 'system',
            action: 'Backup started',
            type: 'info'
        },
        {
            time: '12 minutes ago',
            user: 'jane.smith',
            action: 'Profile updated',
            type: 'success'
        },
        {
            time: '15 minutes ago',
            user: 'unknown',
            action: 'Failed login attempt',
            type: 'warning'
        }
    ];

    const eventsStream = $('#events-stream');
    eventsStream.empty();

    events.forEach(event => {
        const eventHtml = `
            <div class="event-item">
                <div class="event-time">${event.time}</div>
                <div class="event-user">${event.user}</div>
                <div class="event-action">${event.action}</div>
            </div>
        `;
        eventsStream.append(eventHtml);
    });
}

function updateRealTimeMetrics() {
    // Mock real-time metrics
    const metrics = {
        liveEvents: Math.floor(Math.random() * 10) + 1,
        eventsPerMinute: Math.floor(Math.random() * 50) + 20,
        activeSessions: Math.floor(Math.random() * 50) + 100,
        errorRate: (Math.random() * 2).toFixed(1)
    };

    $('#live-events').text(metrics.liveEvents);
    $('#events-per-minute').text(metrics.eventsPerMinute);
    $('#active-sessions').text(metrics.activeSessions);
    $('#error-rate').text(metrics.errorRate + '%');
}

function initializeAuditCharts() {
    // Initialize Chart.js charts (mock implementation)
    initializeEventsTypeChart();
    initializeEventsHourChart();
    initializeRateChart();
}

function initializeEventsTypeChart() {
    // Mock events type chart
    const ctx = document.getElementById('events-type-chart');
    if (!ctx) return;

    const chartHtml = `
        <div style="height: 200px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; color: white;">
            <div style="text-align: center;">
                <i class="fas fa-chart-pie" style="font-size: 48px; margin-bottom: 10px;"></i>
                <div>Events by Type Chart</div>
                <div style="font-size: 12px; opacity: 0.8;">Interactive chart would be displayed here</div>
            </div>
        </div>
    `;

    $(ctx).replaceWith(chartHtml);
}

function initializeEventsHourChart() {
    // Mock events hour chart
    const ctx = document.getElementById('events-hour-chart');
    if (!ctx) return;

    const chartHtml = `
        <div style="height: 200px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 8px; color: white;">
            <div style="text-align: center;">
                <i class="fas fa-chart-bar" style="font-size: 48px; margin-bottom: 10px;"></i>
                <div>Events by Hour Chart</div>
                <div style="font-size: 12px; opacity: 0.8;">Interactive chart would be displayed here</div>
            </div>
        </div>
    `;

    $(ctx).replaceWith(chartHtml);
}

function initializeRateChart() {
    // Mock rate chart
    const ctx = document.getElementById('rate-chart');
    if (!ctx) return;

    const chartHtml = `
        <div style="height: 30px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); border-radius: 4px; color: white; font-size: 10px;">
            Rate Trend
        </div>
    `;

    $(ctx).replaceWith(chartHtml);
}

function startRealTimeMonitoring() {
    // Simulate real-time updates
    setInterval(() => {
        updateRealTimeMetrics();

        // Randomly add new events
        if (Math.random() > 0.7) {
            const newEvent = {
                time: 'Just now',
                user: 'system',
                action: 'Real-time event',
                type: 'info'
            };

            const eventHtml = `
                <div class="event-item" style="background: rgba(74, 110, 224, 0.1);">
                    <div class="event-time">${newEvent.time}</div>
                    <div class="event-user">${newEvent.user}</div>
                    <div class="event-action">${newEvent.action}</div>
                </div>
            `;

            $('#events-stream').prepend(eventHtml);

            // Remove old events to keep the list manageable
            if ($('#events-stream .event-item').length > 10) {
                $('#events-stream .event-item:last').remove();
            }
        }
    }, 10000); // Update every 10 seconds
}

function viewLogDetails(logId) {
    showNotification(`Viewing details for log entry ${logId}`, 'info');
    // In real app, this would open a modal with detailed log information
}

function exportAuditLogs() {
    showNotification('Exporting audit logs...', 'info');
    setTimeout(() => {
        showNotification('Audit logs exported successfully!', 'success');
    }, 3000);
}

function generateAuditReport() {
    showNotification('Generating audit report...', 'info');
    setTimeout(() => {
        showNotification('Audit report generated successfully!', 'success');
    }, 5000);
}

function createReportSchedule() {
    showNotification('Create report schedule feature coming soon!', 'info');
}

function manageReports() {
    showNotification('Report management feature coming soon!', 'info');
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