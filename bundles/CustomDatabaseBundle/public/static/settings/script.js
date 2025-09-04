// Settings JavaScript Functions
$(document).ready(function() {
    // Initialize the settings interface
    initializeSettings();

    // Load current settings
    loadCurrentSettings();

    // Set up event listeners
    setupSettingsEventListeners();

    // Initialize settings validation
    initializeSettingsValidation();
});

function initializeSettings() {
    // Initialize settings interface
    switchSettingsTab('general');
}

function loadCurrentSettings() {
    // Load current settings from localStorage or API
    loadGeneralSettings();
    loadSecuritySettings();
    loadDatabaseSettings();
    loadNotificationSettings();
    loadPerformanceSettings();
    loadIntegrationSettings();
    loadMaintenanceSettings();
}

function setupSettingsEventListeners() {
    // Settings tab switching
    $('.settings-tab').click(function() {
        const tabId = $(this).attr('onclick').match(/'([^']+)'/)[1];
        switchSettingsTab(tabId);
    });

    // Auto-save on change (debounced)
    let saveTimeout;
    $('input, select').on('change', function() {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            autoSaveSetting($(this));
        }, 1000);
    });

    // Toggle switches
    $('.toggle-switch input').change(function() {
        const settingId = $(this).attr('id');
        const isChecked = $(this).is(':checked');
        updateToggleSetting(settingId, isChecked);
    });
}

function switchSettingsTab(tabId) {
    // Remove active class from all tabs
    $('.settings-tab').removeClass('active');

    // Add active class to clicked tab
    $(`.settings-tab[onclick*="${tabId}"]`).addClass('active');

    // Hide all settings sections
    $('.settings-section').removeClass('active');

    // Show selected section
    $(`#${tabId}-settings`).addClass('active');

    // Update URL hash for bookmarking
    window.location.hash = tabId;
}

function loadGeneralSettings() {
    // Mock loading general settings
    const settings = {
        appName: 'Custom Database Manager',
        language: 'en',
        timezone: 'UTC',
        dateFormat: 'MM/DD/YYYY',
        theme: 'light',
        sidebarCollapsed: false,
        itemsPerPage: 25,
        autoRefresh: true
    };

    // Apply settings to form
    $('#app-name').val(settings.appName);
    $('#default-language').val(settings.language);
    $('#timezone').val(settings.timezone);
    $('#date-format').val(settings.dateFormat);
    $('#theme').val(settings.theme);
    $('#sidebar-collapsed').val(settings.sidebarCollapsed ? 'collapsed' : 'expanded');
    $('#items-per-page').val(settings.itemsPerPage);
    $('#auto-refresh').prop('checked', settings.autoRefresh);
}

function loadSecuritySettings() {
    // Mock loading security settings
    const settings = {
        sessionTimeout: 30,
        passwordPolicy: true,
        twoFactor: false,
        loginAttempts: 5,
        encryptionEnabled: true,
        auditLogging: true,
        dataRetention: 90
    };

    $('#session-timeout').val(settings.sessionTimeout);
    $('#password-policy').prop('checked', settings.passwordPolicy);
    $('#two-factor').prop('checked', settings.twoFactor);
    $('#login-attempts').val(settings.loginAttempts);
    $('#encryption-enabled').prop('checked', settings.encryptionEnabled);
    $('#audit-logging').prop('checked', settings.auditLogging);
    $('#data-retention').val(settings.dataRetention);
}

function loadDatabaseSettings() {
    // Mock loading database settings
    const settings = {
        maxConnections: 100,
        queryTimeout: 30,
        connectionPool: true,
        queryCaching: true,
        indexOptimization: false,
        backupCompression: true
    };

    $('#max-connections').val(settings.maxConnections);
    $('#query-timeout').val(settings.queryTimeout);
    $('#connection-pool').prop('checked', settings.connectionPool);
    $('#query-caching').prop('checked', settings.queryCaching);
    $('#index-optimization').prop('checked', settings.indexOptimization);
    $('#backup-compression').prop('checked', settings.backupCompression);
}

function loadNotificationSettings() {
    // Mock loading notification settings
    const settings = {
        emailNotifications: true,
        smtpServer: 'smtp.gmail.com',
        smtpPort: 587,
        alertSystem: true,
        alertSecurity: true,
        alertBackup: true,
        alertPerformance: false
    };

    $('#email-notifications').prop('checked', settings.emailNotifications);
    $('#smtp-server').val(settings.smtpServer);
    $('#smtp-port').val(settings.smtpPort);
    $('#alert-system').prop('checked', settings.alertSystem);
    $('#alert-security').prop('checked', settings.alertSecurity);
    $('#alert-backup').prop('checked', settings.alertBackup);
    $('#alert-performance').prop('checked', settings.alertPerformance);
}

function loadPerformanceSettings() {
    // Mock loading performance settings
    const settings = {
        pageCache: true,
        apiCache: true,
        cacheTtl: 60,
        maxFileSize: 100,
        memoryLimit: 256,
        cpuLimit: 80
    };

    $('#page-cache').prop('checked', settings.pageCache);
    $('#api-cache').prop('checked', settings.apiCache);
    $('#cache-ttl').val(settings.cacheTtl);
    $('#max-file-size').val(settings.maxFileSize);
    $('#memory-limit').val(settings.memoryLimit);
    $('#cpu-limit').val(settings.cpuLimit);
}

function loadIntegrationSettings() {
    // Mock loading integration settings
    const settings = {
        slackIntegration: false,
        webhookIntegration: true,
        awsIntegration: false,
        googleDriveIntegration: false,
        apiRateLimit: 1000,
        apiTimeout: 30,
        corsEnabled: true
    };

    $('#slack-integration').prop('checked', settings.slackIntegration);
    $('#webhook-integration').prop('checked', settings.webhookIntegration);
    $('#aws-integration').prop('checked', settings.awsIntegration);
    $('#google-drive-integration').prop('checked', settings.googleDriveIntegration);
    $('#api-rate-limit').val(settings.apiRateLimit);
    $('#api-timeout').val(settings.apiTimeout);
    $('#cors-enabled').prop('checked', settings.corsEnabled);
}

function loadMaintenanceSettings() {
    // Mock loading maintenance settings
    const settings = {
        autoCleanup: true,
        cleanupFrequency: 'daily',
        maintenanceWindow: '02:00'
    };

    $('#auto-cleanup').prop('checked', settings.autoCleanup);
    $('#cleanup-frequency').val(settings.cleanupFrequency);
    $('#maintenance-window').val(settings.maintenanceWindow);
}

function initializeSettingsValidation() {
    // Add validation for numeric inputs
    $('input[type="number"]').on('input', function() {
        const min = $(this).attr('min');
        const max = $(this).attr('max');
        const value = $(this).val();

        if (min && value < min) {
            $(this).val(min);
        }
        if (max && value > max) {
            $(this).val(max);
        }
    });

    // Email validation for SMTP server
    $('#smtp-server').on('blur', function() {
        const email = $(this).val();
        if (email && !isValidEmail(email)) {
            showNotification('Please enter a valid email address', 'warning');
        }
    });
}

function autoSaveSetting(element) {
    const settingId = element.attr('id');
    const settingValue = element.val() || element.is(':checked');

    // Mock auto-save
    console.log(`Auto-saving setting: ${settingId} = ${settingValue}`);
    showNotification(`Setting "${settingId}" saved automatically`, 'success');
}

function updateToggleSetting(settingId, isChecked) {
    // Mock toggle setting update
    console.log(`Toggle setting: ${settingId} = ${isChecked}`);
    showNotification(`Setting "${settingId}" updated`, 'success');
}

function saveAllSettings() {
    showNotification('Saving all settings...', 'info');

    // Collect all settings
    const allSettings = {
        general: collectGeneralSettings(),
        security: collectSecuritySettings(),
        database: collectDatabaseSettings(),
        notifications: collectNotificationSettings(),
        performance: collectPerformanceSettings(),
        integrations: collectIntegrationSettings(),
        maintenance: collectMaintenanceSettings()
    };

    // Mock save operation
    setTimeout(() => {
        console.log('All settings saved:', allSettings);
        showNotification('All settings saved successfully!', 'success');
    }, 2000);
}

function collectGeneralSettings() {
    return {
        appName: $('#app-name').val(),
        language: $('#default-language').val(),
        timezone: $('#timezone').val(),
        dateFormat: $('#date-format').val(),
        theme: $('#theme').val(),
        sidebarCollapsed: $('#sidebar-collapsed').val() === 'collapsed',
        itemsPerPage: parseInt($('#items-per-page').val()),
        autoRefresh: $('#auto-refresh').is(':checked')
    };
}

function collectSecuritySettings() {
    return {
        sessionTimeout: parseInt($('#session-timeout').val()),
        passwordPolicy: $('#password-policy').is(':checked'),
        twoFactor: $('#two-factor').is(':checked'),
        loginAttempts: parseInt($('#login-attempts').val()),
        encryptionEnabled: $('#encryption-enabled').is(':checked'),
        auditLogging: $('#audit-logging').is(':checked'),
        dataRetention: parseInt($('#data-retention').val())
    };
}

function collectDatabaseSettings() {
    return {
        maxConnections: parseInt($('#max-connections').val()),
        queryTimeout: parseInt($('#query-timeout').val()),
        connectionPool: $('#connection-pool').is(':checked'),
        queryCaching: $('#query-caching').is(':checked'),
        indexOptimization: $('#index-optimization').is(':checked'),
        backupCompression: $('#backup-compression').is(':checked')
    };
}

function collectNotificationSettings() {
    return {
        emailNotifications: $('#email-notifications').is(':checked'),
        smtpServer: $('#smtp-server').val(),
        smtpPort: parseInt($('#smtp-port').val()),
        alertSystem: $('#alert-system').is(':checked'),
        alertSecurity: $('#alert-security').is(':checked'),
        alertBackup: $('#alert-backup').is(':checked'),
        alertPerformance: $('#alert-performance').is(':checked')
    };
}

function collectPerformanceSettings() {
    return {
        pageCache: $('#page-cache').is(':checked'),
        apiCache: $('#api-cache').is(':checked'),
        cacheTtl: parseInt($('#cache-ttl').val()),
        maxFileSize: parseInt($('#max-file-size').val()),
        memoryLimit: parseInt($('#memory-limit').val()),
        cpuLimit: parseInt($('#cpu-limit').val())
    };
}

function collectIntegrationSettings() {
    return {
        slackIntegration: $('#slack-integration').is(':checked'),
        webhookIntegration: $('#webhook-integration').is(':checked'),
        awsIntegration: $('#aws-integration').is(':checked'),
        googleDriveIntegration: $('#google-drive-integration').is(':checked'),
        apiRateLimit: parseInt($('#api-rate-limit').val()),
        apiTimeout: parseInt($('#api-timeout').val()),
        corsEnabled: $('#cors-enabled').is(':checked')
    };
}

function collectMaintenanceSettings() {
    return {
        autoCleanup: $('#auto-cleanup').is(':checked'),
        cleanupFrequency: $('#cleanup-frequency').val(),
        maintenanceWindow: $('#maintenance-window').val()
    };
}

function resetToDefaults() {
    if (confirm('Are you sure you want to reset all settings to their default values? This action cannot be undone.')) {
        showNotification('Resetting all settings to defaults...', 'info');

        setTimeout(() => {
            // Reset all form elements to defaults
            loadCurrentSettings();
            showNotification('All settings reset to defaults!', 'success');
        }, 1000);
    }
}

function runHealthCheck(checkType) {
    showNotification(`Running ${checkType} health check...`, 'info');

    setTimeout(() => {
        const results = {
            database: 'All database connections are healthy',
            disk: 'Disk space is within acceptable limits',
            memory: 'Memory usage is optimal'
        };

        showNotification(`${checkType.charAt(0).toUpperCase() + checkType.slice(1)} check completed: ${results[checkType]}`, 'success');
    }, 2000);
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function exportSettings() {
    const allSettings = {
        general: collectGeneralSettings(),
        security: collectSecuritySettings(),
        database: collectDatabaseSettings(),
        notifications: collectNotificationSettings(),
        performance: collectPerformanceSettings(),
        integrations: collectIntegrationSettings(),
        maintenance: collectMaintenanceSettings(),
        exportDate: new Date().toISOString(),
        version: '2.1.0'
    };

    const dataStr = JSON.stringify(allSettings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const exportFileDefaultName = `settings-export-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    showNotification('Settings exported successfully!', 'success');
}

function importSettings() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const importedSettings = JSON.parse(e.target.result);

                    // Validate imported settings structure
                    if (validateImportedSettings(importedSettings)) {
                        // Apply imported settings
                        applyImportedSettings(importedSettings);
                        showNotification('Settings imported successfully!', 'success');
                    } else {
                        showNotification('Invalid settings file format', 'error');
                    }
                } catch (error) {
                    showNotification('Error parsing settings file', 'error');
                }
            };
            reader.readAsText(file);
        }
    };

    input.click();
}

function validateImportedSettings(settings) {
    // Basic validation of settings structure
    const requiredSections = ['general', 'security', 'database', 'notifications', 'performance', 'integrations', 'maintenance'];
    return requiredSections.every(section => settings.hasOwnProperty(section));
}

function applyImportedSettings(settings) {
    // Apply settings to form elements
    // This would be a comprehensive function to update all form elements
    console.log('Applying imported settings:', settings);
    showNotification('Imported settings applied', 'success');
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

// Handle URL hash for direct tab access
$(window).on('load', function() {
    const hash = window.location.hash.substring(1);
    if (hash && $(`#${hash}-settings`).length) {
        switchSettingsTab(hash);
    }
});