// Backup & Restore JavaScript Functions
$(document).ready(function() {
    // Initialize the backup & restore interface
    initializeBackupRestore();

    // Load backup data
    loadBackupData();

    // Set up event listeners
    setupBackupEventListeners();

    // Initialize charts
    initializeBackupCharts();

    // Start monitoring updates
    startBackupMonitoring();
});

function initializeBackupRestore() {
    // Initialize backup & restore interface
    updateBackupStats();
    loadBackupHistory();
    loadScheduledBackups();
}

function loadBackupData() {
    // Load all backup-related data
    updateStorageInfo();
    loadRetentionPolicies();
    loadRecoveryOptions();
}

function setupBackupEventListeners() {
    // Backup search functionality
    $('#backup-search').on('input', function() {
        filterBackups();
    });

    // Backup status filter
    $('#backup-status-filter').change(function() {
        filterBackups();
    });

    // Select all backups checkbox
    $('#select-all-backups').change(function() {
        const isChecked = $(this).is(':checked');
        $('.backup-checkbox').prop('checked', isChecked);
    });
}

function updateBackupStats() {
    // Mock backup statistics
    const stats = {
        totalBackups: 247,
        storageUsed: '2.4TB',
        lastSuccessful: '2h ago',
        failedBackups: 3
    };

    $('#total-backups').text(stats.totalBackups);
    $('#storage-used').text(stats.storageUsed);
    $('#last-successful').text(stats.lastSuccessful);
    $('#failed-backups').text(stats.failedBackups);
}

function loadBackupHistory() {
    // Mock backup history data
    const backups = [
        {
            id: 1,
            name: 'Daily Full Backup',
            type: 'Full',
            database: 'production_db',
            size: '2.4GB',
            status: 'completed',
            created: new Date().toLocaleString(),
            duration: '15m 32s'
        },
        {
            id: 2,
            name: 'Incremental Backup',
            type: 'Incremental',
            database: 'user_db',
            size: '456MB',
            status: 'completed',
            created: new Date(Date.now() - 3600000).toLocaleString(),
            duration: '8m 45s'
        },
        {
            id: 3,
            name: 'Weekly Archive',
            type: 'Full',
            database: 'analytics_db',
            size: '1.8GB',
            status: 'running',
            created: new Date(Date.now() - 7200000).toLocaleString(),
            duration: 'Running...'
        },
        {
            id: 4,
            name: 'Emergency Backup',
            type: 'Full',
            database: 'production_db',
            size: '2.1GB',
            status: 'failed',
            created: new Date(Date.now() - 10800000).toLocaleString(),
            duration: 'Failed'
        },
        {
            id: 5,
            name: 'Scheduled Backup',
            type: 'Differential',
            database: 'backup_db',
            size: '892MB',
            status: 'scheduled',
            created: new Date(Date.now() + 3600000).toLocaleString(),
            duration: 'Pending'
        }
    ];

    const tbody = $('#backup-table-body');
    tbody.empty();

    backups.forEach(backup => {
        const rowHtml = `
            <tr>
                <td><input type="checkbox" class="backup-checkbox" value="${backup.id}"></td>
                <td>${backup.name}</td>
                <td>${backup.type}</td>
                <td>${backup.database}</td>
                <td>${backup.size}</td>
                <td><span class="status-${backup.status}">${backup.status}</span></td>
                <td>${backup.created}</td>
                <td>${backup.duration}</td>
                <td>
                    <div class="backup-actions">
                        <button class="btn-action" onclick="viewBackupDetails(${backup.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-action" onclick="downloadBackup(${backup.id})">
                            <i class="fas fa-download"></i>
                        </button>
                        <button class="btn-action" onclick="deleteBackup(${backup.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
        tbody.append(rowHtml);
    });
}

function filterBackups() {
    const searchTerm = $('#backup-search').val().toLowerCase();
    const statusFilter = $('#backup-status-filter').val();

    $('#backup-table-body tr').each(function() {
        const row = $(this);
        const backupName = row.find('td:nth-child(2)').text().toLowerCase();
        const backupStatus = row.find('td:nth-child(6)').text().toLowerCase();

        const matchesSearch = backupName.includes(searchTerm);
        const matchesStatus = statusFilter === 'all' || backupStatus === statusFilter;

        if (matchesSearch && matchesStatus) {
            row.show();
        } else {
            row.hide();
        }
    });
}

function loadScheduledBackups() {
    // Scheduled backups are already in the HTML, but this could be updated dynamically
    showNotification('Scheduled backups loaded', 'success');
}

function updateStorageInfo() {
    // Storage info is already in the HTML, but this could be updated dynamically
    showNotification('Storage information updated', 'success');
}

function loadRetentionPolicies() {
    // Retention policies are already in the HTML, but this could be updated dynamically
    showNotification('Retention policies loaded', 'success');
}

function loadRecoveryOptions() {
    // Recovery options are already in the HTML, but this could be updated dynamically
    showNotification('Recovery options loaded', 'success');
}

function initializeBackupCharts() {
    // Initialize Chart.js charts (mock implementation)
    initializeSuccessRateChart();
    initializeDurationChart();
    initializeStorageChart();
}

function initializeSuccessRateChart() {
    // Mock success rate chart
    const ctx = document.getElementById('success-rate-chart');
    if (!ctx) return;

    const chartHtml = `
        <div style="height: 200px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; color: white;">
            <div style="text-align: center;">
                <i class="fas fa-chart-pie" style="font-size: 48px; margin-bottom: 10px;"></i>
                <div>Success Rate Chart</div>
                <div style="font-size: 12px; opacity: 0.8;">Interactive chart would be displayed here</div>
            </div>
        </div>
    `;

    $(ctx).replaceWith(chartHtml);
}

function initializeDurationChart() {
    // Mock duration chart
    const ctx = document.getElementById('duration-chart');
    if (!ctx) return;

    const chartHtml = `
        <div style="height: 200px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 8px; color: white;">
            <div style="text-align: center;">
                <i class="fas fa-chart-line" style="font-size: 48px; margin-bottom: 10px;"></i>
                <div>Duration Trend Chart</div>
                <div style="font-size: 12px; opacity: 0.8;">Interactive chart would be displayed here</div>
            </div>
        </div>
    `;

    $(ctx).replaceWith(chartHtml);
}

function initializeStorageChart() {
    // Mock storage chart
    const ctx = document.getElementById('storage-chart');
    if (!ctx) return;

    const chartHtml = `
        <div style="height: 200px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); border-radius: 8px; color: white;">
            <div style="text-align: center;">
                <i class="fas fa-chart-bar" style="font-size: 48px; margin-bottom: 10px;"></i>
                <div>Storage Growth Chart</div>
                <div style="font-size: 12px; opacity: 0.8;">Interactive chart would be displayed here</div>
            </div>
        </div>
    `;

    $(ctx).replaceWith(chartHtml);
}

function startBackupMonitoring() {
    // Simulate real-time monitoring updates
    setInterval(() => {
        // Randomly update some metrics
        if (Math.random() > 0.8) {
            const currentBackups = parseInt($('#total-backups').text());
            const newBackups = currentBackups + 1;
            $('#total-backups').text(newBackups);
        }

        // Update last successful time
        const now = new Date();
        const lastSuccessful = Math.floor(Math.random() * 24);
        $('#last-successful').text(lastSuccessful + 'h ago');
    }, 30000); // Update every 30 seconds
}

function createNewBackup() {
    $('#createBackupModal').modal('show');
    loadTargetDatabases();
}

function loadTargetDatabases() {
    // Mock target databases
    const databases = ['production_db', 'user_db', 'analytics_db', 'backup_db'];
    const dbSelect = $('#target-database');

    dbSelect.empty().append('<option value="">Select Database</option>');

    databases.forEach(db => {
        dbSelect.append(`<option value="${db}">${db}</option>`);
    });
}

function startBackup() {
    const backupData = {
        name: $('#backup-name').val(),
        type: $('#backup-type').val(),
        database: $('#target-database').val(),
        location: $('#backup-location').val(),
        compression: $('#compression').val(),
        encryption: $('#encryption').val(),
        description: $('#backup-description').val()
    };

    if (!backupData.name || !backupData.type || !backupData.database || !backupData.location) {
        showNotification('Please fill in all required fields', 'warning');
        return;
    }

    // Mock backup creation
    showNotification(`Starting backup: ${backupData.name}...`, 'info');

    $('#createBackupModal').modal('hide');

    // Simulate backup progress
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 100) progress = 100;

        showNotification(`Backup progress: ${Math.round(progress)}%`, 'info');

        if (progress >= 100) {
            clearInterval(progressInterval);
            showNotification(`Backup "${backupData.name}" completed successfully!`, 'success');
            loadBackupHistory(); // Refresh backup history
        }
    }, 2000);
}

function scheduleBackup() {
    showNotification('Schedule backup feature coming soon!', 'info');
    // In real app, this would open a scheduling modal
}

function quickBackup() {
    showNotification('Starting quick backup...', 'info');

    setTimeout(() => {
        showNotification('Quick backup completed successfully!', 'success');
        loadBackupHistory(); // Refresh backup history
    }, 5000);
}

function quickRestore() {
    if (confirm('Are you sure you want to perform a quick restore? This will restore from the latest backup.')) {
        showNotification('Starting quick restore...', 'info');

        setTimeout(() => {
            showNotification('Quick restore completed successfully!', 'success');
        }, 8000);
    }
}

function cloudBackup() {
    showNotification('Starting cloud backup upload...', 'info');

    setTimeout(() => {
        showNotification('Cloud backup upload completed!', 'success');
    }, 10000);
}

function verifyBackup() {
    showNotification('Starting backup verification...', 'info');

    setTimeout(() => {
        showNotification('Backup verification completed successfully!', 'success');
    }, 3000);
}

function viewBackupDetails(backupId) {
    showNotification(`Viewing details for backup ${backupId}`, 'info');
    // In real app, this would open a details modal
}

function downloadBackup(backupId) {
    showNotification(`Downloading backup ${backupId}...`, 'info');

    setTimeout(() => {
        showNotification(`Backup ${backupId} downloaded successfully!`, 'success');
    }, 2000);
}

function deleteBackup(backupId) {
    if (confirm(`Are you sure you want to delete backup ${backupId}?`)) {
        showNotification(`Deleting backup ${backupId}...`, 'info');

        setTimeout(() => {
            showNotification(`Backup ${backupId} deleted successfully!`, 'success');
            loadBackupHistory(); // Refresh backup history
        }, 1000);
    }
}

function editSchedule(scheduleType) {
    showNotification(`Editing ${scheduleType} schedule...`, 'info');
    // In real app, this would open an edit modal
}

function pauseSchedule(scheduleType) {
    showNotification(`Pausing ${scheduleType} schedule...`, 'info');

    setTimeout(() => {
        showNotification(`${scheduleType} schedule paused!`, 'success');
        loadScheduledBackups(); // Refresh scheduled backups
    }, 1000);
}

function resumeSchedule(scheduleType) {
    showNotification(`Resuming ${scheduleType} schedule...`, 'info');

    setTimeout(() => {
        showNotification(`${scheduleType} schedule resumed!`, 'success');
        loadScheduledBackups(); // Refresh scheduled backups
    }, 1000);
}

function deleteSchedule(scheduleType) {
    if (confirm(`Are you sure you want to delete the ${scheduleType} schedule?`)) {
        showNotification(`Deleting ${scheduleType} schedule...`, 'info');

        setTimeout(() => {
            showNotification(`${scheduleType} schedule deleted!`, 'success');
            loadScheduledBackups(); // Refresh scheduled backups
        }, 1000);
    }
}

function manageRetention() {
    showNotification('Retention policy management coming soon!', 'info');
    // In real app, this would open a retention management modal
}

function pointInTimeRecovery() {
    showNotification('Point-in-time recovery feature coming soon!', 'info');
    // In real app, this would open a recovery modal
}

function cloneDatabase() {
    showNotification('Database cloning feature coming soon!', 'info');
    // In real app, this would open a cloning modal
}

function crossRegionRestore() {
    showNotification('Cross-region restore feature coming soon!', 'info');
    // In real app, this would open a cross-region restore modal
}

function emergencyRestore() {
    if (confirm('⚠️ EMERGENCY RESTORE ⚠️\n\nThis will immediately restore from the latest backup. All current data may be lost. Are you sure?')) {
        showNotification('Starting emergency restore...', 'warning');

        setTimeout(() => {
            showNotification('Emergency restore completed!', 'success');
        }, 15000);
    }
}

function createReportSchedule() {
    showNotification('Create report schedule feature coming soon!', 'info');
    // In real app, this would open a report scheduling modal
}

function manageReports() {
    showNotification('Report management feature coming soon!', 'info');
    // In real app, this would open a report management modal
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