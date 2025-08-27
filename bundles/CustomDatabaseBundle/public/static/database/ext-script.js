Ext.onReady(function() {
    // Global variables
    let currentTable = null;
    let currentPage = 1;
    let allTables = [];
    let tableColumns = [];
    let activeFilters = [];
    
    // Initialize the application
    initApplication();
    
    function initApplication() {
        // Initialize all tables array
        document.querySelectorAll('.table-item').forEach(item => {
            allTables.push({
                name: item.getAttribute('data-table'),
                element: item
            });
        });
        
        // Add event listeners
        addEventListeners();
        
        // Create Ext JS components
        createExtComponents();
    }
    
    function addEventListeners() {
        // Add event listeners to table links in sidebar
        document.querySelectorAll('.table-link').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                const tableName = this.getAttribute('data-table');
                loadTableData(tableName);
                return false;
            });
        });
        
        // Add search functionality
        const tableSearch = document.getElementById("tableSearch");
        if (tableSearch) {
            tableSearch.addEventListener('input', function() {
                const searchTerm = this.value.toLowerCase();
                allTables.forEach(table => {
                    const tableName = table.name.toLowerCase();
                    if (tableName.includes(searchTerm)) {
                        table.element.style.display = 'block';
                    } else {
                        table.element.style.display = 'none';
                    }
                });
            });
        }
        
        // Rows per page change event listener
        const rowsPerPageSelect = document.getElementById("rowsPerPage");
        if (rowsPerPageSelect) {
            rowsPerPageSelect.addEventListener("change", function() {
                if (currentTable) {
                    currentPage = 1;
                    fetchTableData(currentTable);
                }
            });
        }
    }
    
    function createExtComponents() {
        // Create Ext JS grid panel for table data
        Ext.define('TableDataModel', {
            extend: 'Ext.data.Model',
            fields: []
        });
        
        // Create filter panel
        window.filterPanel = Ext.create('Ext.form.Panel', {
            title: 'Advanced Filters',
            id: 'filterPanel',
            bodyPadding: 10,
            hidden: true,
            items: [{
                xtype: 'fieldcontainer',
                layout: 'hbox',
                items: [{
                    xtype: 'button',
                    text: 'Add Filter',
                    iconCls: 'fa fa-plus',
                    margin: '0 5 0 0',
                    handler: function() {
                        addFilterRow();
                    }
                }, {
                    xtype: 'button',
                    text: 'Apply Filters',
                    iconCls: 'fa fa-check',
                    margin: '0 5 0 0',
                    handler: function() {
                        applyFilters();
                    }
                }, {
                    xtype: 'button',
                    text: 'Clear Filters',
                    iconCls: 'fa fa-times',
                    handler: function() {
                        clearFilters();
                    }
                }]
            }, {
                xtype: 'container',
                id: 'filterContainer',
                layout: 'anchor',
                items: []
            }]
        });
        
        // Render filter panel to the DOM
        const filterPanelElement = document.getElementById("filterPanel");
        if (filterPanelElement) {
            filterPanel.render(filterPanelElement);
        }
    }
    
    // Load table data when a table is selected
    function loadTableData(tableName) {
        currentTable = tableName;
        const selectedTableName = document.getElementById("selectedTableName");
        if (selectedTableName) {
            selectedTableName.textContent = `Table: ${tableName}`;
        }
        
        // Show data section and hide structure section by default
        const tableStructureSection = document.getElementById("tableStructureSection");
        const tableDataSection = document.getElementById("tableDataSection");
        const advancedFilterSection = document.getElementById("advancedFilterSection");
        
        if (tableStructureSection) tableStructureSection.style.display = "none";
        if (tableDataSection) tableDataSection.style.display = "block";
        if (advancedFilterSection) advancedFilterSection.style.display = "none";
        
        // Show loading indicator for data only
        const tableData = document.getElementById("tableData");
        if (tableData) {
            tableData.innerHTML = '<div class="alert alert-info">Loading table data...</div>';
        }
        
        // Fetch table columns for filter options
        fetchTableColumns(tableName);
        
        // Fetch and display table data only (structure will be loaded when user clicks "Show Structure")
        currentPage = 1;
        fetchTableData(tableName);
    }
    
    // Fetch table columns for filter options
    function fetchTableColumns(tableName) {
        fetch(`/admin/get-column-data-types?table=${encodeURIComponent(tableName)}`)
            .then(response => response.json())
            .then(data => {
                tableColumns = data.columns || [];
            })
            .catch(error => {
                console.error("Error fetching table columns:", error);
            });
    }
    
    // Fetch and display table data
    function fetchTableData(tableName, filters = []) {
        const rowsPerPageSelect = document.getElementById("rowsPerPage");
        const rowsPerPage = rowsPerPageSelect ? parseInt(rowsPerPageSelect.value) : 25;
        const offset = (currentPage - 1) * rowsPerPage;
        
        // Show loading indicator
        const tableData = document.getElementById("tableData");
        if (tableData) {
            tableData.innerHTML = '<div class="alert alert-info">Loading table data...</div>';
        }
        
        // Prepare URL with filters
        let url = `/admin/get-database-select-table-data?table=${encodeURIComponent(tableName)}&page=${currentPage}&limit=${rowsPerPage}`;
        
        if (filters.length > 0) {
            // For advanced filters, we need to use the object search endpoint
            url = `/admin/get-database-object-search-value?table=${encodeURIComponent(tableName)}`;
            // Add filters as query parameters
            filters.forEach((filter, index) => {
                url += `&filters[${index}][column]=${encodeURIComponent(filter.column)}`;
                url += `&filters[${index}][operator]=${encodeURIComponent(filter.operator)}`;
                url += `&filters[${index}][value]=${encodeURIComponent(filter.value)}`;
            });
        }
        
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(pagedData => {
                // Check if we have data
                if (!pagedData.objects || pagedData.objects.length === 0) {
                    if (tableData) {
                        tableData.innerHTML = `<div class="alert alert-info">No data available in this table.</div>`;
                    }
                    return;
                }
                
                renderTableData(pagedData.objects, pagedData.count, pagedData.page, pagedData.totalPages);
            })
            .catch(error => {
                console.error("Error fetching table data:", error);
                if (tableData) {
                    tableData.innerHTML = `<div class="alert alert-danger">Error loading table data: ${error.message}</div>`;
                }
            });
    }
    
    // Render table data with pagination
    function renderTableData(data, totalCount, currentPageNum, totalPagesNum) {
        if (!data || data.length === 0) {
            const tableData = document.getElementById("tableData");
            if (tableData) {
                tableData.innerHTML = `<div class="alert alert-info">No data available in this table.</div>`;
            }
            return;
        }
        
        // Create data table
        const dataTable = document.createElement("table");
        dataTable.className = "table table-striped table-bordered";
        
        // Create header
        const thead = document.createElement("thead");
        const headerRow = document.createElement("tr");
        const keys = Object.keys(data[0] || {});
        keys.forEach(key => {
            const th = document.createElement("th");
            th.textContent = key.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        dataTable.appendChild(thead);
        
        // Create body
        const tbody = document.createElement("tbody");
        data.forEach(row => {
            const tr = document.createElement("tr");
            keys.forEach(key => {
                const td = document.createElement("td");
                td.textContent = row[key] !== null ? row[key] : "NULL";
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
        dataTable.appendChild(tbody);
        
        // Create pagination controls
        const paginationControls = document.createElement("div");
        paginationControls.className = "pagination-controls mt-3";
        
        // Previous button
        const prevButton = document.createElement("button");
        prevButton.textContent = "Previous";
        prevButton.className = "btn btn-secondary btn-sm";
        prevButton.disabled = Number(currentPageNum) === 1;
        prevButton.addEventListener("click", () => {
            if (Number(currentPageNum) > 1) {
                currentPage = Number(currentPageNum) - 1;
                // Show loading indicator
                const tableData = document.getElementById("tableData");
                if (tableData) {
                    tableData.innerHTML = '<div class="alert alert-info">Loading table data...</div>';
                }
                fetchTableData(currentTable, activeFilters);
            }
        });
        
        // Next button
        const nextButton = document.createElement("button");
        nextButton.textContent = "Next";
        nextButton.className = "btn btn-secondary btn-sm ms-2";
        nextButton.disabled = Number(currentPageNum) === totalPagesNum;
        nextButton.addEventListener("click", () => {
            if (Number(currentPageNum) < totalPagesNum) {
                currentPage = Number(currentPageNum) + 1;
                // Show loading indicator
                const tableData = document.getElementById("tableData");
                if (tableData) {
                    tableData.innerHTML = '<div class="alert alert-info">Loading table data...</div>';
                }
                fetchTableData(currentTable, activeFilters);
            }
        });
        
        // Page indicator
        const pageIndicator = document.createElement("span");
        pageIndicator.className = "mx-3";
        pageIndicator.textContent = `Page ${Number(currentPageNum)} of ${totalPagesNum} (Total records: ${totalCount})`;
        
        paginationControls.appendChild(prevButton);
        paginationControls.appendChild(pageIndicator);
        paginationControls.appendChild(nextButton);
        
        // Create structure toggle button
        const structureToggle = document.createElement("button");
        structureToggle.textContent = "Show Structure";
        structureToggle.className = "btn btn-sm btn-outline-secondary mt-3 structure-toggle-main";
        structureToggle.style.display = "block";
        structureToggle.addEventListener("click", function() {
            toggleStructureVisibility(currentTable);
        });
        
        // Toggle filters button
        const toggleFiltersBtn = document.getElementById("toggleFiltersBtn");
        if (toggleFiltersBtn) {
            toggleFiltersBtn.addEventListener("click", function() {
                const filterPanel = Ext.getCmp('filterPanel');
                if (filterPanel) {
                    if (filterPanel.isHidden()) {
                        filterPanel.show();
                        this.innerHTML = '<i class="fas fa-filter"></i> Hide Filters';
                    } else {
                        filterPanel.hide();
                        this.innerHTML = '<i class="fas fa-filter"></i> Advanced Filters';
                    }
                }
            });
        }
        
        // Clear and update data container
        const tableData = document.getElementById("tableData");
        if (tableData) {
            tableData.innerHTML = "";
            tableData.appendChild(structureToggle);
            tableData.appendChild(dataTable);
            tableData.appendChild(paginationControls);
        }
        
        // Create filter panel if not already created
        if (tableColumns.length > 0) {
            createFilterPanel();
        }
    }
    
    // Create filter panel
    function createFilterPanel() {
        const filterContainer = Ext.getCmp('filterContainer');
        if (!filterContainer || tableColumns.length === 0) return;
        
        // Clear existing filter rows
        filterContainer.removeAll();
        
        // Add initial filter row
        addFilterRow();
    }
    
    // Add filter row
    function addFilterRow() {
        const filterContainer = Ext.getCmp('filterContainer');
        if (!filterContainer) return;
        
        const filterId = Date.now();
        
        const filterRow = Ext.create('Ext.container.Container', {
            layout: 'hbox',
            margin: '0 0 5 0',
            items: [{
                xtype: 'combobox',
                fieldLabel: 'Column',
                name: `column-${filterId}`,
                store: Ext.create('Ext.data.Store', {
                    fields: ['name'],
                    data: tableColumns.map(col => ({name: col.COLUMN_NAME}))
                }),
                queryMode: 'local',
                displayField: 'name',
                valueField: 'name',
                width: 200,
                margin: '0 5 0 0'
            }, {
                xtype: 'combobox',
                fieldLabel: 'Operator',
                name: `operator-${filterId}`,
                store: Ext.create('Ext.data.Store', {
                    fields: ['value', 'text'],
                    data: [
                        {value: 'equals', text: 'Equals'},
                        {value: 'not_equals', text: 'Not Equals'},
                        {value: 'contains', text: 'Contains'},
                        {value: 'starts_with', text: 'Starts With'},
                        {value: 'ends_with', text: 'Ends With'},
                        {value: 'greater_than', text: 'Greater Than'},
                        {value: 'less_than', text: 'Less Than'},
                        {value: 'greater_equal', text: 'Greater or Equal'},
                        {value: 'less_equal', text: 'Less or Equal'},
                        {value: 'between', text: 'Between'},
                        {value: 'in', text: 'In'}
                    ]
                }),
                queryMode: 'local',
                displayField: 'text',
                valueField: 'value',
                width: 150,
                margin: '0 5 0 0'
            }, {
                xtype: 'textfield',
                fieldLabel: 'Value',
                name: `value-${filterId}`,
                width: 200,
                margin: '0 5 0 0'
            }, {
                xtype: 'button',
                text: 'Remove',
                iconCls: 'fa fa-times',
                handler: function() {
                    filterRow.destroy();
                }
            }]
        });
        
        filterContainer.add(filterRow);
    }
    
    // Apply filters
    function applyFilters() {
        const filterContainer = Ext.getCmp('filterContainer');
        if (!filterContainer) return;
        
        activeFilters = [];
        
        // Get all filter rows
        filterContainer.items.each(function(item) {
            const columnField = item.down('[name^=column-]');
            const operatorField = item.down('[name^=operator-]');
            const valueField = item.down('[name^=value-]');
            
            if (columnField && operatorField && valueField) {
                const column = columnField.getValue();
                const operator = operatorField.getValue();
                const value = valueField.getValue();
                
                if (column && operator && value) {
                    activeFilters.push({
                        column: column,
                        operator: operator,
                        value: value
                    });
                }
            }
        });
        
        if (currentTable) {
            currentPage = 1;
            fetchTableData(currentTable, activeFilters);
        }
    }
    
    // Clear filters
    function clearFilters() {
        activeFilters = [];
        const filterContainer = Ext.getCmp('filterContainer');
        if (filterContainer) {
            filterContainer.removeAll();
            addFilterRow(); // Add one empty row
        }
        
        if (currentTable) {
            currentPage = 1;
            fetchTableData(currentTable);
        }
    }
    
    // Toggle table structure visibility in main content area
    function toggleStructureVisibility(tableName) {
        const structureSection = document.getElementById("tableStructureSection");
        const structureContainer = document.getElementById("tableStructure");
        const structureToggle = document.querySelector(".structure-toggle-main");
        
        if (structureSection && structureSection.style.display === "none") {
            // Show structure
            structureSection.style.display = "block";
            if (structureToggle) {
                structureToggle.textContent = "Hide Structure";
            }
            
            // Load structure if not already loaded
            if (structureContainer && (structureContainer.innerHTML === "" || structureContainer.innerHTML.includes("Loading table structure..."))) {
                fetchTableStructure(tableName);
            }
        } else if (structureSection) {
            // Hide structure
            structureSection.style.display = "none";
            if (structureToggle) {
                structureToggle.textContent = "Show Structure";
            }
        }
    }
    
    // Fetch and display table structure
    function fetchTableStructure(tableName) {
        const structureContainer = document.getElementById("tableStructure");
        if (!structureContainer) return;
        
        fetch(`/admin/get-table-structure?table=${encodeURIComponent(tableName)}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                // Check if we have data
                if (!data.columns || data.columns.length === 0) {
                    structureContainer.innerHTML = `<div class="alert alert-warning">No structure information available for this table.</div>`;
                    return;
                }
                
                // Create structure table
                const structureTable = document.createElement("table");
                structureTable.className = "table table-striped table-bordered";
                
                // Create header
                const thead = document.createElement("thead");
                const headerRow = document.createElement("tr");
                const headers = ["Column", "Type", "Nullable", "Default", "Key", "Extra"];
                headers.forEach(headerText => {
                    const th = document.createElement("th");
                    th.textContent = headerText;
                    headerRow.appendChild(th);
                });
                thead.appendChild(headerRow);
                structureTable.appendChild(thead);
                
                // Create body
                const tbody = document.createElement("tbody");
                data.columns.forEach(column => {
                    const row = document.createElement("tr");
                    
                    const nameCell = document.createElement("td");
                    nameCell.textContent = column.COLUMN_NAME;
                    row.appendChild(nameCell);
                    
                    const typeCell = document.createElement("td");
                    typeCell.textContent = column.COLUMN_TYPE;
                    row.appendChild(typeCell);
                    
                    const nullableCell = document.createElement("td");
                    nullableCell.textContent = column.IS_NULLABLE;
                    row.appendChild(nullableCell);
                    
                    const defaultCell = document.createElement("td");
                    defaultCell.textContent = column.COLUMN_DEFAULT || "";
                    row.appendChild(defaultCell);
                    
                    const keyCell = document.createElement("td");
                    keyCell.textContent = column.COLUMN_KEY;
                    row.appendChild(keyCell);
                    
                    const extraCell = document.createElement("td");
                    extraCell.textContent = column.EXTRA;
                    row.appendChild(extraCell);
                    
                    tbody.appendChild(row);
                });
                structureTable.appendChild(tbody);
                
                // Clear and update structure container
                structureContainer.innerHTML = "";
                structureContainer.appendChild(structureTable);
            })
            .catch(error => {
                console.error("Error fetching table structure:", error);
                structureContainer.innerHTML = `<div class="alert alert-danger">Error loading table structure: ${error.message}</div>`;
            });
    }
});