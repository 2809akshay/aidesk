// Data Importer JavaScript Functions
$(document).ready(function() {
    // Initialize the data importer interface
    initializeDataImporter();

    // Load import history
    loadImportHistory();

    // Set up event listeners
    setupImportEventListeners();

    // Initialize drag and drop
    initializeDragAndDrop();
});

function initializeDataImporter() {
    // Initialize data importer interface
    updateImportStats();
    loadTargetTables();
}

function loadImportHistory() {
    // Load import history from localStorage
    const importHistory = JSON.parse(localStorage.getItem('importHistory') || '[]');

    if (importHistory.length === 0) {
        showImportHistoryPlaceholder();
        return;
    }

    const historyList = $('#import-history-list');
    historyList.empty();

    importHistory.forEach((importItem, index) => {
        const historyCard = createImportHistoryCard(importItem, index);
        historyList.append(historyCard);
    });

    updateImportStats();
}

function createImportHistoryCard(importItem, index) {
    const statusClass = importItem.status || 'completed';
    const statusText = importItem.status === 'completed' ? 'Completed' :
                      importItem.status === 'failed' ? 'Failed' :
                      importItem.status === 'processing' ? 'Processing' : 'Cancelled';

    return `
        <div class="import-history-card" data-index="${index}">
            <div class="import-header">
                <div class="import-info">
                    <h4>${importItem.fileName || importItem.source}</h4>
                    <span class="import-type">${importItem.type.toUpperCase()}</span>
                </div>
                <div class="import-status ${statusClass}">
                    <i class="fas fa-circle"></i>
                    ${statusText}
                </div>
            </div>

            <div class="import-details">
                <div class="import-detail">
                    <span class="import-detail-label">Started:</span>
                    <span class="import-detail-value">${importItem.startTime || 'N/A'}</span>
                </div>
                <div class="import-detail">
                    <span class="import-detail-label">Duration:</span>
                    <span class="import-detail-value">${importItem.duration || 'N/A'}</span>
                </div>
                <div class="import-detail">
                    <span class="import-detail-label">Records:</span>
                    <span class="import-detail-value">${importItem.totalRecords || 0}</span>
                </div>
                <div class="import-detail">
                    <span class="import-detail-label">Success Rate:</span>
                    <span class="import-detail-value">${importItem.successRate || 0}%</span>
                </div>
            </div>

            <div class="import-actions">
                <button class="btn-import-action btn-view-details" onclick="viewImportDetails(${index})">
                    <i class="fas fa-eye"></i> Details
                </button>
                <button class="btn-import-action btn-download-report" onclick="downloadImportReport(${index})">
                    <i class="fas fa-download"></i> Report
                </button>
                <button class="btn-import-action btn-retry" onclick="retryImport(${index})" style="display: ${importItem.status === 'failed' ? 'inline-flex' : 'none'}">
                    <i class="fas fa-redo"></i> Retry
                </button>
            </div>
        </div>
    `;
}

function showImportHistoryPlaceholder() {
    const historyList = $('#import-history-list');
    historyList.html(`
        <div class="import-placeholder">
            <i class="fas fa-file-import"></i>
            <h3>No Import History</h3>
            <p>Your import history will appear here</p>
        </div>
    `);
}

function setupImportEventListeners() {
    // Import search functionality
    $('#import-search').on('input', function() {
        filterImportHistory();
    });

    // Import status filter
    $('#import-status-filter').change(function() {
        filterImportHistory();
    });

    // File input change
    $('#file-input').on('change', function() {
        handleFileSelection(this.files);
    });

    // Import source type change
    $('#import-source-type').change(function() {
        toggleImportSourceSections($(this).val());
    });
}

function filterImportHistory() {
    const searchTerm = $('#import-search').val().toLowerCase();
    const statusFilter = $('#import-status-filter').val();

    $('.import-history-card').each(function() {
        const card = $(this);
        const fileName = card.find('h4').text().toLowerCase();
        const status = card.find('.import-status').text().toLowerCase();

        const matchesSearch = fileName.includes(searchTerm);
        const matchesStatus = statusFilter === 'all' || status.includes(statusFilter);

        if (matchesSearch && matchesStatus) {
            card.show();
        } else {
            card.hide();
        }
    });
}

function initializeDragAndDrop() {
    const uploadArea = $('#upload-area')[0];

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, unhighlight, false);
    });

    function highlight(e) {
        uploadArea.classList.add('highlight');
    }

    function unhighlight(e) {
        uploadArea.classList.remove('highlight');
    }

    uploadArea.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFileSelection(files);
    }
}

function handleFileSelection(files) {
    if (files.length === 0) return;

    const file = files[0];
    const allowedTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/json', 'text/xml'];

    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(csv|xlsx?|json|xml)$/)) {
        showNotification('Please select a valid file format (CSV, Excel, JSON, XML)', 'error');
        return;
    }

    // Update file info display
    $('#file-name').text(file.name);
    $('#file-size').text(formatFileSize(file.size));

    // Process the file
    processFile(file);

    showNotification(`File "${file.name}" selected successfully`, 'success');
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function processFile(file) {
    const reader = new FileReader();

    reader.onload = function(e) {
        const content = e.target.result;

        try {
            let data;
            if (file.name.endsWith('.csv')) {
                data = parseCSV(content);
            } else if (file.name.endsWith('.json')) {
                data = JSON.parse(content);
            } else if (file.name.endsWith('.xml')) {
                data = parseXML(content);
            } else {
                // Excel file - would need a library like SheetJS
                showNotification('Excel file processing requires additional library', 'warning');
                return;
            }

            displayDataPreview(data);
            generateFieldMappings(data);
        } catch (error) {
            showNotification(`Error processing file: ${error.message}`, 'error');
        }
    };

    if (file.name.endsWith('.csv') || file.name.endsWith('.txt')) {
        reader.readAsText(file);
    } else if (file.name.endsWith('.json')) {
        reader.readAsText(file);
    } else if (file.name.endsWith('.xml')) {
        reader.readAsText(file);
    }
}

function parseCSV(content) {
    const lines = content.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));

    const data = [];
    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === '') continue;

        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        const row = {};

        headers.forEach((header, index) => {
            row[header] = values[index] || '';
        });

        data.push(row);
    }

    return { headers, data };
}

function parseXML(content) {
    // Simple XML parser for basic structures
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(content, 'text/xml');

    // This is a simplified XML parser - in production, you'd want more robust parsing
    const rows = xmlDoc.getElementsByTagName('row') || xmlDoc.getElementsByTagName('*');
    const data = [];

    for (let i = 0; i < rows.length; i++) {
        const row = {};
        const children = rows[i].children;

        for (let j = 0; j < children.length; j++) {
            row[children[j].tagName] = children[j].textContent;
        }

        if (Object.keys(row).length > 0) {
            data.push(row);
        }
    }

    const headers = data.length > 0 ? Object.keys(data[0]) : [];
    return { headers, data };
}

function displayDataPreview(data) {
    const previewRows = parseInt($('#preview-rows').val()) || 100;
    const headers = data.headers || Object.keys(data[0] || {});
    const rows = Array.isArray(data) ? data : data.data || [];

    // Generate table headers
    const headerHtml = headers.map(header => `<th>${header}</th>`).join('');
    $('#preview-table-head').html(`<tr>${headerHtml}</tr>`);

    // Generate table rows
    const rowCount = Math.min(previewRows, rows.length);
    let bodyHtml = '';

    for (let i = 0; i < rowCount; i++) {
        const row = rows[i];
        const cells = headers.map(header => `<td>${row[header] || ''}</td>`).join('');
        bodyHtml += `<tr>${cells}</tr>`;
    }

    $('#preview-table-body').html(bodyHtml);

    showNotification(`Preview loaded: ${rowCount} of ${rows.length} rows`, 'success');
}

function generateFieldMappings(data) {
    const headers = data.headers || Object.keys(data[0] || {});
    const sourceFieldsList = $('#source-fields-list');
    const targetFieldsList = $('#target-fields-list');

    // Clear existing fields
    sourceFieldsList.empty();
    targetFieldsList.empty();

    // Add source fields
    headers.forEach((header, index) => {
        const fieldHtml = `
            <div class="field-item" data-field="${header}" data-index="${index}">
                <div class="field-name">${header}</div>
                <div class="field-type">string</div>
            </div>
        `;
        sourceFieldsList.append(fieldHtml);
    });

    // Add target fields (mock data - in real app, this would come from database schema)
    const mockTargetFields = ['id', 'name', 'email', 'created_at', 'updated_at', 'status'];
    mockTargetFields.forEach(field => {
        const fieldHtml = `
            <div class="field-item" data-field="${field}" data-index="${field}">
                <div class="field-name">${field}</div>
                <div class="field-type">string</div>
            </div>
        `;
        targetFieldsList.append(fieldHtml);
    });

    // Make fields draggable
    makeFieldsDraggable();
}

function makeFieldsDraggable() {
    $('.field-item').draggable({
        revert: 'invalid',
        helper: 'clone',
        start: function(event, ui) {
            $(this).addClass('dragging');
        },
        stop: function(event, ui) {
            $(this).removeClass('dragging');
        }
    });

    $('#mapping-rules').droppable({
        accept: '.field-item',
        drop: function(event, ui) {
            const sourceField = ui.draggable.data('field');
            createFieldMapping(sourceField);
        }
    });
}

function createFieldMapping(sourceField) {
    const mappingRules = $('#mapping-rules');

    // Check if mapping already exists
    if (mappingRules.find(`[data-source="${sourceField}"]`).length > 0) {
        showNotification('Mapping already exists for this field', 'warning');
        return;
    }

    const mappingHtml = `
        <div class="mapping-rule" data-source="${sourceField}">
            <div class="mapping-source">${sourceField}</div>
            <div class="mapping-arrow">→</div>
            <select class="mapping-target">
                <option value="">Select target field</option>
                <option value="id">id</option>
                <option value="name">name</option>
                <option value="email">email</option>
                <option value="created_at">created_at</option>
                <option value="updated_at">updated_at</option>
                <option value="status">status</option>
            </select>
            <button class="btn-remove-mapping" onclick="removeFieldMapping('${sourceField}')">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    mappingRules.append(mappingHtml);
    showNotification(`Mapping created for ${sourceField}`, 'success');
}

function removeFieldMapping(sourceField) {
    $(`.mapping-rule[data-source="${sourceField}"]`).remove();
    showNotification(`Mapping removed for ${sourceField}`, 'info');
}

function autoMapFields() {
    showNotification('Auto-mapping fields...', 'info');

    // Simple auto-mapping logic
    const sourceFields = $('.field-item[data-index]');
    const targetSelects = $('.mapping-target');

    sourceFields.each(function() {
        const sourceField = $(this).data('field');
        const matchingTarget = targetSelects.filter(function() {
            return $(this).find(`option[value="${sourceField}"]`).length > 0;
        });

        if (matchingTarget.length > 0) {
            matchingTarget.val(sourceField);
        }
    });

    showNotification('Auto-mapping completed!', 'success');
}

function clearAllMappings() {
    $('#mapping-rules').empty();
    showNotification('All mappings cleared', 'info');
}

function openImportModal() {
    $('#importModal').modal('show');
    loadTargetTablesForImport();
}

function loadTargetTablesForImport() {
    // Mock target tables - in real app, this would come from database
    const mockTables = ['users', 'products', 'orders', 'customers', 'inventory'];
    const targetSelect = $('#import-target-table');

    targetSelect.empty().append('<option value="">Select Target Table</option>');

    mockTables.forEach(table => {
        targetSelect.append(`<option value="${table}">${table}</option>`);
    });
}

function toggleImportSourceSections(sourceType) {
    const fileSection = $('#file-upload-section');
    const urlSection = $('#url-import-section');

    if (sourceType === 'file') {
        fileSection.show();
        urlSection.hide();
    } else if (sourceType === 'url') {
        fileSection.hide();
        urlSection.show();
    } else {
        fileSection.hide();
        urlSection.hide();
    }
}

function initiateImport() {
    const sourceType = $('#import-source-type').val();
    const targetTable = $('#import-target-table').val();

    if (!targetTable) {
        showNotification('Please select a target table', 'warning');
        return;
    }

    if (sourceType === 'file' && !$('#import-file-input')[0].files[0]) {
        showNotification('Please select a file to import', 'warning');
        return;
    }

    if (sourceType === 'url' && !$('#import-url').val()) {
        showNotification('Please enter a URL', 'warning');
        return;
    }

    $('#importModal').modal('hide');
    startImportProcess();
}

function startImportProcess() {
    const totalRecords = 1000; // Mock total records
    let processedRecords = 0;
    let successfulRecords = 0;
    let failedRecords = 0;

    $('#start-import-btn').prop('disabled', true);
    $('#pause-import-btn').prop('disabled', false);
    $('#stop-import-btn').prop('disabled', false);

    const startTime = Date.now();

    const importInterval = setInterval(() => {
        processedRecords += 10;
        const success = Math.random() > 0.05; // 95% success rate

        if (success) {
            successfulRecords += 10;
        } else {
            failedRecords += Math.floor(Math.random() * 3) + 1;
        }

        const progress = Math.min((processedRecords / totalRecords) * 100, 100);
        const successRate = processedRecords > 0 ? Math.round((successfulRecords / processedRecords) * 100) : 0;
        const elapsedTime = formatElapsedTime(Date.now() - startTime);

        // Update progress
        $('#progress-fill').css('width', progress + '%');
        $('#import-progress').text(Math.round(progress) + '%');
        $('#records-processed').text(processedRecords);
        $('#successful-records').text(successfulRecords);
        $('#failed-records').text(failedRecords);
        $('#total-records').text(totalRecords);
        $('#success-rate').text(successRate + '%');
        $('#time-elapsed').text(elapsedTime);

        if (processedRecords >= totalRecords) {
            clearInterval(importInterval);
            completeImport(successfulRecords, failedRecords, totalRecords);
        }
    }, 200);
}

function formatElapsedTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    return `${hours.toString().padStart(2, '0')}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
}

function completeImport(successful, failed, total) {
    $('#start-import-btn').prop('disabled', false);
    $('#pause-import-btn').prop('disabled', true);
    $('#stop-import-btn').prop('disabled', true);

    // Save import history
    const importRecord = {
        fileName: $('#file-name').text() || 'URL Import',
        type: $('#import-source-type').val(),
        status: failed > 0 ? 'completed' : 'completed',
        startTime: new Date().toLocaleString(),
        duration: $('#time-elapsed').text(),
        totalRecords: total,
        successfulRecords: successful,
        failedRecords: failed,
        successRate: Math.round((successful / total) * 100)
    };

    const importHistory = JSON.parse(localStorage.getItem('importHistory') || '[]');
    importHistory.unshift(importRecord);
    localStorage.setItem('importHistory', JSON.stringify(importHistory));

    loadImportHistory();
    updateImportStats();

    showNotification(`Import completed! ${successful} successful, ${failed} failed`, failed > 0 ? 'warning' : 'success');
}

function pauseImport() {
    showNotification('Import paused', 'info');
    $('#pause-import-btn').prop('disabled', true);
    $('#start-import-btn').prop('disabled', false);
}

function stopImport() {
    showNotification('Import stopped', 'warning');
    $('#start-import-btn').prop('disabled', false);
    $('#pause-import-btn').prop('disabled', true);
    $('#stop-import-btn').prop('disabled', true);
}

function updateImportStats() {
    const importHistory = JSON.parse(localStorage.getItem('importHistory') || '[]');

    const totalImports = importHistory.length;
    const successfulImports = importHistory.filter(item => item.status === 'completed').length;
    const failedImports = importHistory.filter(item => item.status === 'failed').length;
    const totalRecordsImported = importHistory.reduce((sum, item) => sum + (item.successfulRecords || 0), 0);

    $('#total-imports').text(totalImports);
    $('#successful-imports').text(successfulImports);
    $('#failed-imports').text(failedImports);
    $('#records-imported').text(totalRecordsImported);
}

function triggerFileInput() {
    $('#file-input').click();
}

function refreshPreview() {
    const fileInput = $('#file-input')[0];
    if (fileInput.files[0]) {
        handleFileSelection(fileInput.files);
    } else {
        showNotification('No file selected', 'warning');
    }
}

function viewImportDetails(index) {
    showNotification('Import details feature coming soon!', 'info');
}

function downloadImportReport(index) {
    showNotification('Report download feature coming soon!', 'info');
}

function retryImport(index) {
    showNotification('Retry import feature coming soon!', 'info');
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