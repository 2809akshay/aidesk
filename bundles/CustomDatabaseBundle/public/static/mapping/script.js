// Data Mapping JavaScript Functions
$(document).ready(function() {
    // Initialize the data mapping interface
    initializeDataMapping();

    // Load saved connections
    loadSavedConnections();

    // Set up event listeners
    setupEventListeners();
});

function initializeDataMapping() {
    // Initialize mapping interface
    updateMappingStats();
}

function loadSavedConnections() {
    // Load saved database connections
    const savedConnections = JSON.parse(localStorage.getItem('dbConnections') || '[]');

    // Load saved API connections
    const savedApis = JSON.parse(localStorage.getItem('apiConnections') || '[]');

    // Populate source and target connection dropdowns
    const sourceSelect = $('#source-connection');
    const targetSelect = $('#target-connection');

    sourceSelect.empty().append('<option value="">Select Connection</option>');
    targetSelect.empty().append('<option value="">Select Connection</option>');

    // Add database connections
    savedConnections.forEach((conn, index) => {
        const option = `<option value="db-${index}">${conn.name} (${conn.type})</option>`;
        sourceSelect.append(option);
        targetSelect.append(option);
    });

    // Add API connections
    savedApis.forEach((api, index) => {
        const option = `<option value="api-${index}">${api.name} (API)</option>`;
        sourceSelect.append(option);
        targetSelect.append(option);
    });
}

function setupEventListeners() {
    // Source connection change
    $('#source-connection').change(function() {
        const connectionIndex = $(this).val();
        if (connectionIndex !== '') {
            loadSourceTables(connectionIndex);
        }
    });

    // Target connection change
    $('#target-connection').change(function() {
        const connectionIndex = $(this).val();
        if (connectionIndex !== '') {
            loadTargetTables(connectionIndex);
        }
    });

    // Source table change
    $('#source-table').change(function() {
        const tableName = $(this).val();
        if (tableName !== '') {
            loadSourceFields(tableName);
        }
    });

    // Target table change
    $('#target-table').change(function() {
        const tableName = $(this).val();
        if (tableName !== '') {
            loadTargetFields(tableName);
        }
    });
}

function loadSourceTables(connectionIndex) {
    const [type, index] = connectionIndex.split('-');
    let connection = null;

    if (type === 'db') {
        const savedConnections = JSON.parse(localStorage.getItem('dbConnections') || '[]');
        connection = savedConnections[index];
    } else if (type === 'api') {
        const savedApis = JSON.parse(localStorage.getItem('apiConnections') || '[]');
        connection = savedApis[index];
    }

    if (!connection) return;

    const tableSelect = $('#source-table');
    tableSelect.empty().append('<option value="">Select Table</option>');

    if (type === 'db') {
        // Load database tables
        loadDatabaseTables(connection, tableSelect, 'source');
    } else if (type === 'api') {
        // Load API endpoints as tables
        loadApiEndpoints(connection, tableSelect, 'source');
    }
}

function loadDatabaseTables(connection, tableSelect, source) {
    // In a real application, this would make an AJAX call to get tables
    // For now, we'll simulate with mock data
    const mockTables = ['users', 'products', 'orders', 'customers', 'inventory'];

    mockTables.forEach(table => {
        tableSelect.append(`<option value="${table}">${table}</option>`);
    });

    showNotification(`Loaded ${mockTables.length} tables from ${connection.name}`, 'success');
}

function loadApiEndpoints(api, tableSelect, source) {
    // For APIs, we'll treat endpoints as "tables"
    const mockEndpoints = ['users', 'products', 'orders', 'customers', 'analytics'];

    mockEndpoints.forEach(endpoint => {
        tableSelect.append(`<option value="${endpoint}">${endpoint} (API)</option>`);
    });

    showNotification(`Loaded ${mockEndpoints.length} endpoints from ${api.name}`, 'success');
}

function loadTargetTables(connectionIndex) {
    const [type, index] = connectionIndex.split('-');
    let connection = null;

    if (type === 'db') {
        const savedConnections = JSON.parse(localStorage.getItem('dbConnections') || '[]');
        connection = savedConnections[index];
    } else if (type === 'api') {
        const savedApis = JSON.parse(localStorage.getItem('apiConnections') || '[]');
        connection = savedApis[index];
    }

    if (!connection) return;

    const tableSelect = $('#target-table');
    tableSelect.empty().append('<option value="">Select Table</option>');

    if (type === 'db') {
        // Load database tables
        loadDatabaseTables(connection, tableSelect, 'target');
    } else if (type === 'api') {
        // Load API endpoints as tables
        loadApiEndpoints(connection, tableSelect, 'target');
    }
}

function loadSourceFields(tableName) {
    const sourceConnection = $('#source-connection').val();
    const [type, index] = sourceConnection.split('-');

    if (type === 'api') {
        // Load API fields
        loadApiFields(tableName, 'source');
    } else {
        // Load database fields
        loadDatabaseFields(tableName, 'source');
    }
}

function loadTargetFields(tableName) {
    const targetConnection = $('#target-connection').val();
    const [type, index] = targetConnection.split('-');

    if (type === 'api') {
        // Load API fields
        loadApiFields(tableName, 'target');
    } else {
        // Load database fields
        loadDatabaseFields(tableName, 'target');
    }
}

function loadDatabaseFields(tableName, source) {
    // Simulate loading database fields with more realistic data
    const mockFields = [
        { name: 'id', type: 'INT', nullable: false, key: 'PRI' },
        { name: 'name', type: 'VARCHAR(255)', nullable: false },
        { name: 'email', type: 'VARCHAR(255)', nullable: false },
        { name: 'created_at', type: 'DATETIME', nullable: false },
        { name: 'updated_at', type: 'DATETIME', nullable: true }
    ];

    updateFieldCount(mockFields.length, source);
    generateAdvancedFieldMappings(mockFields, [], source);
}

function loadApiFields(endpointName, source) {
    // Simulate loading API fields based on endpoint
    const apiFields = {
        'users': [
            { name: 'id', type: 'integer', required: true },
            { name: 'username', type: 'string', required: true },
            { name: 'email', type: 'string', required: true },
            { name: 'first_name', type: 'string', required: false },
            { name: 'last_name', type: 'string', required: false },
            { name: 'created_at', type: 'datetime', required: true }
        ],
        'products': [
            { name: 'id', type: 'integer', required: true },
            { name: 'name', type: 'string', required: true },
            { name: 'price', type: 'decimal', required: true },
            { name: 'category', type: 'string', required: false },
            { name: 'stock_quantity', type: 'integer', required: true }
        ],
        'orders': [
            { name: 'id', type: 'integer', required: true },
            { name: 'user_id', type: 'integer', required: true },
            { name: 'total_amount', type: 'decimal', required: true },
            { name: 'status', type: 'string', required: true },
            { name: 'created_at', type: 'datetime', required: true }
        ]
    };

    const fields = apiFields[endpointName] || [
        { name: 'id', type: 'integer', required: true },
        { name: 'name', type: 'string', required: true },
        { name: 'data', type: 'object', required: false }
    ];

    updateFieldCount(fields.length, source);
    generateAdvancedFieldMappings(fields, [], source);
}

function updateFieldCount(count, source) {
    $(`#${source}-field-count`).text(`${count} fields`);
}

function generateAdvancedFieldMappings(sourceFields, targetFields, source) {
    const mappingGrid = $('#field-mapping-grid');

    // If this is the first load, clear the grid
    if (source === 'source') {
        mappingGrid.empty();
    }

    const maxFields = Math.max(sourceFields.length, targetFields.length);

    for (let i = 0; i < maxFields; i++) {
        const sourceField = sourceFields[i];
        const targetField = targetFields[i];

        // Skip if this row already exists
        if ($(`.field-mapping-row[data-index="${i}"]`).length > 0) {
            continue;
        }

        const mappingRow = createAdvancedMappingRow(i, sourceField, targetField);
        mappingGrid.append(mappingRow);
    }

    updateMappingStats();
}

function createAdvancedMappingRow(index, sourceField, targetField) {
    const sourceFieldHtml = sourceField ? createFieldSelect(sourceField, 'source', index) : '<div class="field-placeholder">No source field</div>';
    const targetFieldHtml = targetField ? createFieldSelect(targetField, 'target', index) : '<div class="field-placeholder">No target field</div>';

    return `
        <div class="field-mapping-row" data-index="${index}">
            <div class="source-field">
                ${sourceFieldHtml}
            </div>
            <div class="mapping-connector">
                <div class="connector-line" id="connector-${index}"></div>
                <button class="btn-map-field" onclick="mapField(${index})" title="Map Fields">
                    <i class="fas fa-link"></i>
                </button>
            </div>
            <div class="target-field">
                ${targetFieldHtml}
            </div>
            <div class="field-actions">
                <button class="btn-transform" onclick="openTransformationModal(${index})" title="Add Transformation">
                    <i class="fas fa-exchange-alt"></i>
                </button>
                <button class="btn-preview" onclick="previewFieldData(${index})" title="Preview Data">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-remove-mapping" onclick="removeMapping(${index})" title="Remove Mapping">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
    `;
}

function createFieldSelect(field, type, index) {
    const fieldName = field.name || field;
    const fieldType = field.type || 'unknown';
    const isRequired = field.required !== false && field.nullable !== true;

    return `
        <div class="field-info">
            <div class="field-name">${fieldName} ${isRequired ? '<span class="required">*</span>' : ''}</div>
            <div class="field-type">${fieldType}</div>
            <select class="field-select ${type}-select" data-field-index="${index}">
                <option value="${fieldName}" selected>${fieldName}</option>
            </select>
        </div>
    `;
}

function mapField(index) {
    const sourceSelect = $(`.field-mapping-row[data-index="${index}"] .source-select`);
    const targetSelect = $(`.field-mapping-row[data-index="${index}"] .target-select`);

    const sourceField = sourceSelect.val();
    const targetField = targetSelect.val();

    if (sourceField && targetField) {
        // Add visual connection
        $(`.field-mapping-row[data-index="${index}"] .connector-line`).addClass('connected');

        // Update mapping stats
        updateMappingStats();

        showNotification('Field mapping created successfully!', 'success');
    } else {
        showNotification('Please select both source and target fields', 'warning');
    }
}

function removeMapping(index) {
    $(`.field-mapping-row[data-index="${index}"] .connector-line`).removeClass('connected');
    $(`.field-mapping-row[data-index="${index}"] .source-select`).val('');
    $(`.field-mapping-row[data-index="${index}"] .target-select`).val('');

    updateMappingStats();
    showNotification('Field mapping removed', 'info');
}

function updateMappingStats() {
    const totalRows = $('.field-mapping-row').length;
    const mappedRows = $('.connector-line.connected').length;

    $('#mapped-count').text(mappedRows);
    $('#total-count').text(totalRows);

    // Update main stats
    $('#mapped-fields-count').text(mappedRows);
    $('#source-tables-count').text($('#source-table').val() ? 1 : 0);
    $('#target-tables-count').text($('#target-table').val() ? 1 : 0);
}

function autoMapFields() {
    // Auto-map fields with similar names
    $('.field-mapping-row').each(function() {
        const sourceSelect = $(this).find('.source-select');
        const targetSelect = $(this).find('.target-select');

        const sourceOptions = sourceSelect.find('option:not(:first)');
        const targetOptions = targetSelect.find('option:not(:first)');

        // Simple auto-mapping logic (can be enhanced)
        sourceOptions.each(function() {
            const sourceValue = $(this).val();
            const matchingTarget = targetOptions.filter(`[value*="${sourceValue}"]`);

            if (matchingTarget.length > 0) {
                sourceSelect.val(sourceValue);
                targetSelect.val(matchingTarget.first().val());
                mapField($(this).closest('.field-mapping-row').data('index'));
                return false; // Break the loop
            }
        });
    });

    showNotification('Auto-mapping completed!', 'success');
}

function clearAllMappings() {
    $('.connector-line').removeClass('connected');
    $('.field-select').val('');
    updateMappingStats();
    showNotification('All mappings cleared', 'info');
}

function validateMappings() {
    const mappedRows = $('.connector-line.connected').length;
    const totalRows = $('.field-mapping-row').length;

    if (mappedRows === 0) {
        showNotification('No field mappings found. Please map at least one field.', 'warning');
        return;
    }

    // Check for unmapped required fields (simplified)
    const unmappedSource = $('.source-select').filter(function() {
        return $(this).val() !== '' && $(this).closest('.field-mapping-row').find('.connector-line').hasClass('connected') === false;
    });

    if (unmappedSource.length > 0) {
        showNotification('Some source fields are not mapped to target fields.', 'warning');
        return;
    }

    $('#validation-status').text('Valid').css('color', '#2ecc71');
    showNotification('All mappings validated successfully!', 'success');
}

function saveMapping() {
    const mappings = [];

    $('.field-mapping-row').each(function(index) {
        const sourceField = $(this).find('.source-select').val();
        const targetField = $(this).find('.target-select').val();

        if (sourceField && targetField) {
            mappings.push({
                index: index,
                sourceField: sourceField,
                targetField: targetField,
                transformation: null // Can be enhanced to include transformations
            });
        }
    });

    if (mappings.length === 0) {
        showNotification('No mappings to save', 'warning');
        return;
    }

    const mappingData = {
        sourceTable: $('#source-table').val(),
        targetTable: $('#target-table').val(),
        mappings: mappings,
        timestamp: new Date().toISOString()
    };

    // Save to localStorage (in real app, this would be saved to server)
    localStorage.setItem('dataMapping', JSON.stringify(mappingData));

    showNotification('Mapping saved successfully!', 'success');
}

function loadMapping() {
    const mappingData = JSON.parse(localStorage.getItem('dataMapping'));

    if (!mappingData) {
        showNotification('No saved mapping found', 'warning');
        return;
    }

    // Load mapping data
    $('#source-table').val(mappingData.sourceTable);
    $('#target-table').val(mappingData.targetTable);

    // Load field mappings
    mappingData.mappings.forEach(mapping => {
        const row = $(`.field-mapping-row[data-index="${mapping.index}"]`);
        if (row.length > 0) {
            row.find('.source-select').val(mapping.sourceField);
            row.find('.target-select').val(mapping.targetField);
            mapField(mapping.index);
        }
    });

    showNotification('Mapping loaded successfully!', 'success');
}

function testMapping() {
    const mappedRows = $('.connector-line.connected').length;

    if (mappedRows === 0) {
        showNotification('No mappings to test', 'warning');
        return;
    }

    // Simulate testing
    $('#validation-status').text('Testing...');

    setTimeout(() => {
        $('#validation-status').text('Test Passed').css('color', '#2ecc71');
        showNotification('Mapping test completed successfully!', 'success');
    }, 2000);
}

function executeMapping() {
    const mappedRows = $('.connector-line.connected').length;

    if (mappedRows === 0) {
        showNotification('No mappings to execute', 'warning');
        return;
    }

    if (confirm('Are you sure you want to execute this data mapping? This may modify data in the target system.')) {
        showNotification('Mapping execution started...', 'info');

        // Simulate execution
        setTimeout(() => {
            showNotification('Data mapping completed successfully!', 'success');
        }, 3000);
    }
}

function scheduleMapping() {
    showNotification('Mapping scheduling feature coming soon!', 'info');
}

function openTransformationModal(index) {
    const transformationModal = `
        <div class="modal fade" id="transformationModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Data Transformation Rules</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="transformation-builder">
                            <div class="transformation-rule" data-rule-index="0">
                                <select class="transformation-type">
                                    <option value="">Select Transformation</option>
                                    <option value="uppercase">Convert to Uppercase</option>
                                    <option value="lowercase">Convert to Lowercase</option>
                                    <option value="trim">Trim Whitespace</option>
                                    <option value="substring">Substring</option>
                                    <option value="replace">Find & Replace</option>
                                    <option value="concat">Concatenate</option>
                                    <option value="date_format">Format Date</option>
                                    <option value="number_format">Format Number</option>
                                    <option value="lookup">Lookup Value</option>
                                    <option value="condition">Conditional Logic</option>
                                </select>
                                <div class="transformation-params" style="display: none;">
                                    <!-- Dynamic parameters will be added here -->
                                </div>
                                <button class="btn-remove-rule" onclick="removeTransformationRule(0)">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                            <button class="btn-add-rule" onclick="addTransformationRule()">
                                <i class="fas fa-plus"></i> Add Rule
                            </button>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn-primary" onclick="saveTransformation(${index})">Save Transformation</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    $('body').append(transformationModal);
    $('#transformationModal').modal('show');

    // Remove modal from DOM when hidden
    $('#transformationModal').on('hidden.bs.modal', function() {
        $(this).remove();
    });
}

function addTransformationRule() {
    const ruleIndex = $('.transformation-rule').length;
    const ruleHtml = `
        <div class="transformation-rule" data-rule-index="${ruleIndex}">
            <select class="transformation-type">
                <option value="">Select Transformation</option>
                <option value="uppercase">Convert to Uppercase</option>
                <option value="lowercase">Convert to Lowercase</option>
                <option value="trim">Trim Whitespace</option>
                <option value="substring">Substring</option>
                <option value="replace">Find & Replace</option>
                <option value="concat">Concatenate</option>
                <option value="date_format">Format Date</option>
                <option value="number_format">Format Number</option>
                <option value="lookup">Lookup Value</option>
                <option value="condition">Conditional Logic</option>
            </select>
            <div class="transformation-params" style="display: none;">
                <!-- Dynamic parameters will be added here -->
            </div>
            <button class="btn-remove-rule" onclick="removeTransformationRule(${ruleIndex})">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    $('.transformation-builder .btn-add-rule').before(ruleHtml);
}

function removeTransformationRule(index) {
    $(`.transformation-rule[data-rule-index="${index}"]`).remove();
}

function saveTransformation(fieldIndex) {
    const rules = [];
    $('.transformation-rule').each(function() {
        const type = $(this).find('.transformation-type').val();
        if (type) {
            rules.push({
                type: type,
                params: {} // Would collect actual parameters
            });
        }
    });

    // Store transformation rules for this field
    const transformations = JSON.parse(localStorage.getItem('fieldTransformations') || '{}');
    transformations[fieldIndex] = rules;
    localStorage.setItem('fieldTransformations', JSON.stringify(transformations));

    $('#transformationModal').modal('hide');
    showNotification('Transformation rules saved!', 'success');

    // Update field mapping to show transformation indicator
    updateFieldTransformationIndicator(fieldIndex);
}

function updateFieldTransformationIndicator(fieldIndex) {
    const row = $(`.field-mapping-row[data-index="${fieldIndex}"]`);
    const transformBtn = row.find('.btn-transform');

    const transformations = JSON.parse(localStorage.getItem('fieldTransformations') || '{}');
    if (transformations[fieldIndex] && transformations[fieldIndex].length > 0) {
        transformBtn.addClass('has-transformations');
        transformBtn.attr('title', `${transformations[fieldIndex].length} transformation(s) applied`);
    } else {
        transformBtn.removeClass('has-transformations');
        transformBtn.attr('title', 'Add Transformation');
    }
}

// Advanced Features Functions
function openTransformations() {
    showNotification('Data Transformations panel opening...', 'info');
}

function openValidationRules() {
    showNotification('Validation Rules panel opening...', 'info');
}

function openLookupTables() {
    showNotification('Lookup Tables panel opening...', 'info');
}

function openErrorHandling() {
    showNotification('Error Handling panel opening...', 'info');
}

function openPerformanceSettings() {
    showNotification('Performance Settings panel opening...', 'info');
}

function openMonitoring() {
    showNotification('Monitoring Dashboard opening...', 'info');
}

// Data Preview Functionality
function previewFieldData(index) {
    const sourceConnection = $('#source-connection').val();
    const targetConnection = $('#target-connection').val();
    const sourceTable = $('#source-table').val();
    const targetTable = $('#target-table').val();

    if (!sourceConnection || !targetConnection || !sourceTable || !targetTable) {
        showNotification('Please select source and target connections and tables first', 'warning');
        return;
    }

    // Generate mock preview data
    const previewData = generatePreviewData(index);

    const previewModal = `
        <div class="modal fade" id="previewModal" tabindex="-1">
            <div class="modal-dialog modal-xl">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Data Preview & Transformation</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="preview-container">
                            <div class="preview-section">
                                <h6>Source Data</h6>
                                <div class="data-preview">
                                    <pre>${JSON.stringify(previewData.source, null, 2)}</pre>
                                </div>
                            </div>
                            <div class="preview-section">
                                <h6>Transformed Data</h6>
                                <div class="data-preview">
                                    <pre>${JSON.stringify(previewData.transformed, null, 2)}</pre>
                                </div>
                            </div>
                            <div class="preview-section">
                                <h6>Target Schema</h6>
                                <div class="data-preview">
                                    <pre>${JSON.stringify(previewData.target, null, 2)}</pre>
                                </div>
                            </div>
                        </div>
                        <div class="preview-actions">
                            <button class="btn-test-transform" onclick="testTransformation(${index})">
                                <i class="fas fa-play"></i> Test Transformation
                            </button>
                            <button class="btn-validate-preview" onclick="validatePreview(${index})">
                                <i class="fas fa-check"></i> Validate
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    $('body').append(previewModal);
    $('#previewModal').modal('show');

    // Remove modal from DOM when hidden
    $('#previewModal').on('hidden.bs.modal', function() {
        $(this).remove();
    });
}

function generatePreviewData(fieldIndex) {
    // Generate mock data for preview
    const mockSourceData = {
        id: 123,
        name: "John Doe",
        email: "john.doe@example.com",
        created_at: "2023-01-15T10:30:00Z",
        status: "active"
    };

    // Apply transformations if any
    const transformations = JSON.parse(localStorage.getItem('fieldTransformations') || '{}');
    let transformedData = { ...mockSourceData };

    if (transformations[fieldIndex]) {
        transformations[fieldIndex].forEach(rule => {
            transformedData = applyTransformation(transformedData, rule);
        });
    }

    const mockTargetSchema = {
        user_id: "integer (mapped from id)",
        full_name: "string (mapped from name)",
        email_address: "string (mapped from email)",
        created_date: "datetime (mapped from created_at)",
        account_status: "string (mapped from status)"
    };

    return {
        source: mockSourceData,
        transformed: transformedData,
        target: mockTargetSchema
    };
}

function applyTransformation(data, rule) {
    // Apply transformation based on rule type
    switch (rule.type) {
        case 'uppercase':
            return { ...data, name: data.name.toUpperCase() };
        case 'lowercase':
            return { ...data, name: data.name.toLowerCase() };
        case 'trim':
            return { ...data, name: data.name.trim() };
        default:
            return data;
    }
}

function testTransformation(fieldIndex) {
    showNotification('Testing transformation...', 'info');

    setTimeout(() => {
        showNotification('Transformation test completed successfully!', 'success');
    }, 1000);
}

function validatePreview(fieldIndex) {
    showNotification('Validating data mapping...', 'info');

    setTimeout(() => {
        showNotification('Data mapping validation passed!', 'success');
    }, 1500);
}

// Enhanced Auto-mapping with AI-like suggestions
function autoMapFields() {
    showNotification('Analyzing fields for intelligent mapping...', 'info');

    $('.field-mapping-row').each(function(index) {
        const row = $(this);
        const sourceSelect = row.find('.source-select');
        const targetSelect = row.find('.target-select');

        const sourceField = sourceSelect.find('option:selected').text();
        const targetOptions = targetSelect.find('option');

        // Enhanced auto-mapping algorithm
        let bestMatch = null;
        let bestScore = 0;

        targetOptions.each(function() {
            const targetField = $(this).text();
            const score = calculateFieldSimilarity(sourceField, targetField);

            if (score > bestScore && score > 0.6) { // 60% similarity threshold
                bestMatch = $(this).val();
                bestScore = score;
            }
        });

        if (bestMatch) {
            sourceSelect.val(sourceField);
            targetSelect.val(bestMatch);
            mapField(index);
        }
    });

    showNotification('Intelligent auto-mapping completed!', 'success');
}

function calculateFieldSimilarity(field1, field2) {
    // Simple similarity calculation (can be enhanced with more sophisticated algorithms)
    const f1 = field1.toLowerCase();
    const f2 = field2.toLowerCase();

    // Exact match
    if (f1 === f2) return 1.0;

    // Contains match
    if (f1.includes(f2) || f2.includes(f1)) return 0.8;

    // Common variations
    const variations = {
        'name': ['fullname', 'firstname', 'lastname', 'title'],
        'email': ['email_address', 'mail'],
        'id': ['user_id', 'customer_id', 'product_id'],
        'created_at': ['created_date', 'date_created'],
        'updated_at': ['updated_date', 'date_modified', 'modified_at']
    };

    for (const [key, synonyms] of Object.entries(variations)) {
        if ((f1.includes(key) && synonyms.some(s => f2.includes(s))) ||
            (f2.includes(key) && synonyms.some(s => f1.includes(s)))) {
            return 0.9;
        }
    }

    // Levenshtein distance for fuzzy matching
    return calculateLevenshteinSimilarity(f1, f2);
}

function calculateLevenshteinSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const distance = levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
}

function levenshteinDistance(str1, str2) {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    matrix[i][j - 1] + 1,     // insertion
                    matrix[i - 1][j] + 1      // deletion
                );
            }
        }
    }

    return matrix[str2.length][str1.length];
}

// Batch Processing Functionality
function executeMapping() {
    const mappedRows = $('.connector-line.connected').length;

    if (mappedRows === 0) {
        showNotification('No mappings to execute', 'warning');
        return;
    }

    // Show batch processing modal
    const batchModal = `
        <div class="modal fade" id="batchModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Batch Processing Configuration</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="batch-config">
                            <div class="form-group">
                                <label for="batch-size">Batch Size</label>
                                <select id="batch-size">
                                    <option value="10">10 records</option>
                                    <option value="50">50 records</option>
                                    <option value="100" selected>100 records</option>
                                    <option value="500">500 records</option>
                                    <option value="1000">1000 records</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="error-handling">Error Handling</label>
                                <select id="error-handling">
                                    <option value="stop">Stop on first error</option>
                                    <option value="continue" selected>Continue on errors</option>
                                    <option value="rollback">Rollback on errors</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="progress-callback">Progress Updates</label>
                                <input type="checkbox" id="progress-callback" checked>
                            </div>
                        </div>
                        <div class="batch-progress" style="display: none;">
                            <div class="progress-bar">
                                <div class="progress-fill" id="progress-fill" style="width: 0%"></div>
                            </div>
                            <div class="progress-text" id="progress-text">Preparing batch processing...</div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn-primary" onclick="startBatchProcessing()">Start Processing</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    $('body').append(batchModal);
    $('#batchModal').modal('show');

    // Remove modal from DOM when hidden
    $('#batchModal').on('hidden.bs.modal', function() {
        $(this).remove();
    });
}

function startBatchProcessing() {
    const batchSize = parseInt($('#batch-size').val());
    const errorHandling = $('#error-handling').val();
    const showProgress = $('#progress-callback').is(':checked');

    $('.batch-config').hide();
    $('.batch-progress').show();
    $('.modal-footer').hide();

    let processed = 0;
    const total = 1000; // Mock total records

    const processInterval = setInterval(() => {
        processed += batchSize;
        const progress = Math.min((processed / total) * 100, 100);

        $('#progress-fill').css('width', progress + '%');
        $('#progress-text').text(`Processed ${processed} of ${total} records (${Math.round(progress)}%)`);

        if (processed >= total) {
            clearInterval(processInterval);
            setTimeout(() => {
                $('#batchModal').modal('hide');
                showNotification('Batch processing completed successfully!', 'success');
            }, 1000);
        }
    }, 500);
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