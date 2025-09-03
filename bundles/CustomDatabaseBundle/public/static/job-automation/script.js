// Job Automation JavaScript Functions
$(document).ready(function() {
    // Initialize the job automation interface
    initializeJobAutomation();

    // Load saved jobs
    loadSavedJobs();

    // Set up event listeners
    setupJobEventListeners();

    // Initialize calendar
    initializeCalendar();
});

function initializeJobAutomation() {
    // Initialize job automation interface
    updateJobStats();
    loadWorkflowTemplates();
}

function loadSavedJobs() {
    // Load saved automated jobs from localStorage
    const savedJobs = JSON.parse(localStorage.getItem('automatedJobs') || '[]');

    if (savedJobs.length === 0) {
        showJobPlaceholder();
        return;
    }

    const jobList = $('#job-list');
    jobList.empty();

    savedJobs.forEach((job, index) => {
        const jobCard = createJobCard(job, index);
        jobList.append(jobCard);
    });

    updateJobStats();
}

function createJobCard(job, index) {
    const statusClass = job.status || 'scheduled';
    const statusText = job.status === 'active' ? 'Active' :
                      job.status === 'running' ? 'Running' :
                      job.status === 'completed' ? 'Completed' :
                      job.status === 'failed' ? 'Failed' : 'Scheduled';

    return `
        <div class="job-card" data-index="${index}">
            <div class="job-header">
                <div class="job-info">
                    <h4>${job.name}</h4>
                    <span class="job-type">${job.type.toUpperCase()}</span>
                </div>
                <div class="job-status ${statusClass}">
                    <i class="fas fa-circle"></i>
                    ${statusText}
                </div>
            </div>

            <div class="job-details">
                <div class="job-detail">
                    <span class="job-detail-label">Last Run:</span>
                    <span class="job-detail-value">${job.lastRun || 'Never'}</span>
                </div>
                <div class="job-detail">
                    <span class="job-detail-label">Next Run:</span>
                    <span class="job-detail-value">${job.nextRun || 'Not scheduled'}</span>
                </div>
                <div class="job-detail">
                    <span class="job-detail-label">Success Rate:</span>
                    <span class="job-detail-value">${job.successRate || 0}%</span>
                </div>
            </div>

            <div class="job-actions">
                <button class="btn-job-action btn-run" onclick="runJob(${index})">
                    <i class="fas fa-play"></i> Run
                </button>
                <button class="btn-job-action btn-edit" onclick="editJob(${index})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn-job-action btn-logs" onclick="viewJobLogs(${index})">
                    <i class="fas fa-file-alt"></i> Logs
                </button>
                <button class="btn-job-action btn-delete" onclick="deleteJob(${index})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `;
}

function showJobPlaceholder() {
    const jobList = $('#job-list');
    jobList.html(`
        <div class="job-placeholder">
            <i class="fas fa-tasks"></i>
            <h3>No Automated Jobs</h3>
            <p>Get started by creating your first automated job</p>
            <button class="btn-create-first-job" onclick="openCreateJobModal()">
                <i class="fas fa-plus"></i> Create Your First Job
            </button>
        </div>
    `);
}

function setupJobEventListeners() {
    // Job search functionality
    $('#job-search').on('input', function() {
        filterJobs();
    });

    // Job status filter
    $('#job-status-filter').change(function() {
        filterJobs();
    });

    // Schedule frequency change
    $('#schedule-frequency').change(function() {
        toggleCustomCron($(this).val());
    });
}

function filterJobs() {
    const searchTerm = $('#job-search').val().toLowerCase();
    const statusFilter = $('#job-status-filter').val();

    $('.job-card').each(function() {
        const card = $(this);
        const jobName = card.find('h4').text().toLowerCase();
        const jobStatus = card.find('.job-status').text().toLowerCase();

        const matchesSearch = jobName.includes(searchTerm);
        const matchesStatus = statusFilter === 'all' || jobStatus.includes(statusFilter);

        if (matchesSearch && matchesStatus) {
            card.show();
        } else {
            card.hide();
        }
    });
}

function openCreateJobModal() {
    $('#createJobModal').modal('show');
    clearCreateJobForm();

    // Set up job type change listener
    $('#job-type').off('change').on('change', function() {
        loadJobConfiguration($(this).val());
    });
}

function clearCreateJobForm() {
    $('#create-job-form')[0].reset();
    $('#job-config-section').empty();
}

function loadJobConfiguration(jobType) {
    const configSection = $('#job-config-section');
    configSection.empty();

    if (!jobType) return;

    let configHtml = '';

    switch (jobType) {
        case 'data-import':
            configHtml = `
                <h4>Data Import Configuration</h4>
                <div class="form-row">
                    <div class="form-group">
                        <label for="import-source">Source Type</label>
                        <select id="import-source">
                            <option value="csv">CSV File</option>
                            <option value="excel">Excel File</option>
                            <option value="database">Database</option>
                            <option value="api">API Endpoint</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="import-target">Target Table</label>
                        <select id="import-target">
                            <option value="">Select Target Table</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="import-mapping">Field Mapping</label>
                        <textarea id="import-mapping" rows="3" placeholder="JSON mapping configuration"></textarea>
                    </div>
                </div>
            `;
            break;

        case 'data-export':
            configHtml = `
                <h4>Data Export Configuration</h4>
                <div class="form-row">
                    <div class="form-group">
                        <label for="export-source">Source Table</label>
                        <select id="export-source">
                            <option value="">Select Source Table</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="export-format">Export Format</label>
                        <select id="export-format">
                            <option value="csv">CSV</option>
                            <option value="excel">Excel</option>
                            <option value="json">JSON</option>
                            <option value="xml">XML</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="export-filters">Export Filters</label>
                        <textarea id="export-filters" rows="3" placeholder="JSON filter configuration"></textarea>
                    </div>
                </div>
            `;
            break;

        case 'data-sync':
            configHtml = `
                <h4>Data Synchronization Configuration</h4>
                <div class="form-row">
                    <div class="form-group">
                        <label for="sync-source">Source Connection</label>
                        <select id="sync-source">
                            <option value="">Select Source</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="sync-target">Target Connection</label>
                        <select id="sync-target">
                            <option value="">Select Target</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="sync-mode">Sync Mode</label>
                        <select id="sync-mode">
                            <option value="full">Full Sync</option>
                            <option value="incremental">Incremental Sync</option>
                            <option value="mirror">Mirror Mode</option>
                        </select>
                    </div>
                </div>
            `;
            break;

        case 'backup':
            configHtml = `
                <h4>Database Backup Configuration</h4>
                <div class="form-row">
                    <div class="form-group">
                        <label for="backup-database">Database</label>
                        <select id="backup-database">
                            <option value="">Select Database</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="backup-type">Backup Type</label>
                        <select id="backup-type">
                            <option value="full">Full Backup</option>
                            <option value="incremental">Incremental</option>
                            <option value="table">Specific Tables</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="backup-location">Backup Location</label>
                        <input type="text" id="backup-location" placeholder="/backups/">
                    </div>
                </div>
            `;
            break;

        case 'report':
            configHtml = `
                <h4>Report Generation Configuration</h4>
                <div class="form-row">
                    <div class="form-group">
                        <label for="report-type">Report Type</label>
                        <select id="report-type">
                            <option value="sales">Sales Report</option>
                            <option value="inventory">Inventory Report</option>
                            <option value="user-activity">User Activity</option>
                            <option value="custom">Custom Report</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="report-format">Output Format</label>
                        <select id="report-format">
                            <option value="pdf">PDF</option>
                            <option value="excel">Excel</option>
                            <option value="html">HTML</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="report-recipients">Email Recipients</label>
                        <input type="text" id="report-recipients" placeholder="email1@example.com, email2@example.com">
                    </div>
                </div>
            `;
            break;
    }

    configSection.html(configHtml);
}

function createJob() {
    const form = $('#create-job-form')[0];

    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const jobData = {
        name: $('#job-name').val(),
        type: $('#job-type').val(),
        description: $('#job-description').val(),
        priority: $('#job-priority').val(),
        timeout: parseInt($('#job-timeout').val()),
        status: 'scheduled',
        createdAt: new Date().toISOString(),
        lastRun: null,
        nextRun: null,
        successRate: 0,
        runCount: 0,
        config: getJobConfiguration()
    };

    // Save to localStorage
    const savedJobs = JSON.parse(localStorage.getItem('automatedJobs') || '[]');
    savedJobs.push(jobData);
    localStorage.setItem('automatedJobs', JSON.stringify(savedJobs));

    $('#createJobModal').modal('hide');
    loadSavedJobs();
    updateJobStats();

    showNotification('Automated job created successfully!', 'success');
}

function getJobConfiguration() {
    const jobType = $('#job-type').val();
    let config = {};

    switch (jobType) {
        case 'data-import':
            config = {
                source: $('#import-source').val(),
                target: $('#import-target').val(),
                mapping: $('#import-mapping').val()
            };
            break;
        case 'data-export':
            config = {
                source: $('#export-source').val(),
                format: $('#export-format').val(),
                filters: $('#export-filters').val()
            };
            break;
        case 'data-sync':
            config = {
                source: $('#sync-source').val(),
                target: $('#sync-target').val(),
                mode: $('#sync-mode').val()
            };
            break;
        case 'backup':
            config = {
                database: $('#backup-database').val(),
                type: $('#backup-type').val(),
                location: $('#backup-location').val()
            };
            break;
        case 'report':
            config = {
                type: $('#report-type').val(),
                format: $('#report-format').val(),
                recipients: $('#report-recipients').val()
            };
            break;
    }

    return config;
}

function runJob(index) {
    const savedJobs = JSON.parse(localStorage.getItem('automatedJobs') || '[]');
    const job = savedJobs[index];

    if (!job) return;

    showNotification(`Starting job: ${job.name}...`, 'info');

    // Update job status
    job.status = 'running';
    job.lastRun = new Date().toLocaleString();
    savedJobs[index] = job;
    localStorage.setItem('automatedJobs', JSON.stringify(savedJobs));

    loadSavedJobs();

    // Simulate job execution
    setTimeout(() => {
        const success = Math.random() > 0.2; // 80% success rate

        job.status = success ? 'completed' : 'failed';
        job.runCount = (job.runCount || 0) + 1;
        job.successRate = Math.round((job.runCount - (success ? 0 : 1)) / job.runCount * 100);

        savedJobs[index] = job;
        localStorage.setItem('automatedJobs', JSON.stringify(savedJobs));

        loadSavedJobs();
        updateJobStats();

        if (success) {
            showNotification(`✅ Job "${job.name}" completed successfully!`, 'success');
        } else {
            showNotification(`❌ Job "${job.name}" failed!`, 'error');
        }
    }, 3000);
}

function editJob(index) {
    const savedJobs = JSON.parse(localStorage.getItem('automatedJobs') || '[]');
    const job = savedJobs[index];

    if (!job) return;

    // Populate form with existing data
    $('#job-name').val(job.name);
    $('#job-type').val(job.type);
    $('#job-description').val(job.description);
    $('#job-priority').val(job.priority);
    $('#job-timeout').val(job.timeout);

    // Load job configuration
    loadJobConfiguration(job.type);
    setTimeout(() => {
        populateJobConfiguration(job.config);
    }, 100);

    // Change modal title and button
    $('#createJobModal .modal-title').html('<i class="fas fa-edit"></i> Edit Automated Job');
    $('#createJobModal .btn-primary').text('Update Job').attr('onclick', `updateJob(${index})`);

    $('#createJobModal').modal('show');
}

function populateJobConfiguration(config) {
    if (!config) return;

    // Populate configuration fields based on job type
    Object.keys(config).forEach(key => {
        const element = $(`#${key}`);
        if (element.length > 0) {
            element.val(config[key]);
        }
    });
}

function updateJob(index) {
    const form = $('#create-job-form')[0];

    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const savedJobs = JSON.parse(localStorage.getItem('automatedJobs') || '[]');

    const jobData = {
        ...savedJobs[index],
        name: $('#job-name').val(),
        type: $('#job-type').val(),
        description: $('#job-description').val(),
        priority: $('#job-priority').val(),
        timeout: parseInt($('#job-timeout').val()),
        config: getJobConfiguration()
    };

    // Update in array
    savedJobs[index] = jobData;
    localStorage.setItem('automatedJobs', JSON.stringify(savedJobs));

    $('#createJobModal').modal('hide');
    loadSavedJobs();
    updateJobStats();

    // Reset modal
    $('#createJobModal .modal-title').html('<i class="fas fa-plus"></i> Create New Automated Job');
    $('#createJobModal .btn-primary').text('Create Job').attr('onclick', 'createJob()');

    showNotification('Automated job updated successfully!', 'success');
}

function deleteJob(index) {
    if (!confirm('Are you sure you want to delete this automated job?')) {
        return;
    }

    const savedJobs = JSON.parse(localStorage.getItem('automatedJobs') || '[]');
    savedJobs.splice(index, 1);
    localStorage.setItem('automatedJobs', JSON.stringify(savedJobs));

    loadSavedJobs();
    updateJobStats();
    showNotification('Automated job deleted successfully!', 'success');
}

function viewJobLogs(index) {
    showNotification('Job logs feature coming soon!', 'info');
}

function updateJobStats() {
    const savedJobs = JSON.parse(localStorage.getItem('automatedJobs') || '[]');

    const activeJobs = savedJobs.filter(job => job.status === 'active' || job.status === 'running').length;
    const scheduledJobs = savedJobs.filter(job => job.status === 'scheduled').length;
    const completedJobs = savedJobs.filter(job => job.status === 'completed').length;
    const failedJobs = savedJobs.filter(job => job.status === 'failed').length;

    $('#active-jobs').text(activeJobs);
    $('#scheduled-jobs').text(scheduledJobs);
    $('#completed-jobs').text(completedJobs);
    $('#failed-jobs').text(failedJobs);
}

function toggleCustomCron(frequency) {
    const customCronRow = $('#custom-cron-row');
    if (frequency === 'custom') {
        customCronRow.show();
    } else {
        customCronRow.hide();
    }
}

function createSchedule() {
    const frequency = $('#schedule-frequency').val();
    const time = $('#schedule-time').val();
    const customCron = $('#custom-cron').val();

    if (!time && frequency !== 'custom') {
        showNotification('Please select a time for the schedule', 'warning');
        return;
    }

    if (frequency === 'custom' && !customCron) {
        showNotification('Please enter a cron expression', 'warning');
        return;
    }

    const scheduleData = {
        frequency: frequency,
        time: time,
        customCron: customCron,
        createdAt: new Date().toISOString()
    };

    // Save schedule (in real app, this would be sent to server)
    showNotification('Schedule created successfully!', 'success');
}

function testSchedule() {
    showNotification('Testing schedule configuration...', 'info');

    setTimeout(() => {
        showNotification('Schedule test completed successfully!', 'success');
    }, 2000);
}

function initializeCalendar() {
    const now = new Date();
    updateCalendar(now.getFullYear(), now.getMonth());
}

function updateCalendar(year, month) {
    const calendarGrid = $('#calendar-grid');
    const monthYear = $('#calendar-month-year');

    // Update month/year display
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    monthYear.text(`${monthNames[month]} ${year}`);

    // Generate calendar days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    calendarGrid.empty();

    // Add day headers
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayHeaders.forEach(day => {
        calendarGrid.append(`<div class="calendar-day-header">${day}</div>`);
    });

    // Add calendar days
    const currentDate = new Date(startDate);
    for (let i = 0; i < 42; i++) {
        const dayClass = currentDate.getMonth() === month ? 'calendar-day' : 'calendar-day other-month';
        const dayContent = currentDate.getDate();

        calendarGrid.append(`<div class="${dayClass}">${dayContent}</div>`);
        currentDate.setDate(currentDate.getDate() + 1);
    }
}

function prevMonth() {
    const currentText = $('#calendar-month-year').text();
    const [monthName, year] = currentText.split(' ');
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    const monthIndex = monthNames.indexOf(monthName);

    let newYear = parseInt(year);
    let newMonth = monthIndex - 1;

    if (newMonth < 0) {
        newMonth = 11;
        newYear--;
    }

    updateCalendar(newYear, newMonth);
}

function nextMonth() {
    const currentText = $('#calendar-month-year').text();
    const [monthName, year] = currentText.split(' ');
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    const monthIndex = monthNames.indexOf(monthName);

    let newYear = parseInt(year);
    let newMonth = monthIndex + 1;

    if (newMonth > 11) {
        newMonth = 0;
        newYear++;
    }

    updateCalendar(newYear, newMonth);
}

function startWorkflowBuilder() {
    showNotification('Workflow builder feature coming soon!', 'info');
}

function loadWorkflowTemplates() {
    // This would load predefined workflow templates
    showNotification('Workflow templates loaded', 'info');
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