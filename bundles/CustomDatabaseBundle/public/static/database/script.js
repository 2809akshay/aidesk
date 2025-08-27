document.addEventListener("DOMContentLoaded", function () {
    // DOM Elements
    const tablesList = document.getElementById("tablesList");
    const tableSearch = document.getElementById("tableSearch");
    const selectedTableName = document.getElementById("selectedTableName");
    const strucher = document.getElementById("strucher");
    const tableFielterSection = document.getElementById("tableFielterSection");
    const tableStructureSection = document.getElementById("tableStructureSection");
    const tableStructure = document.getElementById("tableStructure");
    const tableFielter = document.getElementById("tableFielter");
    const tableDataSection = document.getElementById("tableDataSection");
    const tableData = document.getElementById("tableData");
    const rowsPerPageSelect = document.getElementById("rowsPerPage");
    const ruleContainer = document.getElementById("ruleContainer");
    const addRuleButton = document.getElementById("addRuleButton");
    const saveAllButton = document.getElementById("saveAllButton");
    
    let currentTable = null;
    let currentPage = 1;
    let allTables = [];
    
    // Initialize all tables array
    document.querySelectorAll('.table-item').forEach(item => {
        allTables.push({
            name: item.getAttribute('data-table'),
            element: item
        });
    });
    
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
    
    // Load data for the first table by default if any tables exist
    const firstTableLink = document.querySelector('.table-link');
    if (firstTableLink) {
        // Don't auto-load first table to avoid confusion
        // loadTableData(firstTableLink.getAttribute('data-table'));
    }
    
    
    // Add search functionality
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
    
    // Rows per page change event listener
    rowsPerPageSelect.addEventListener("change", function() {
        if (currentTable) {
            currentPage = 1;
            fetchTableData(currentTable);
        }
    });
    
    // Load table data when a table is selected
    function loadTableData(tableName) {
        currentTable = tableName;
        selectedTableName.textContent = `Table: ${tableName}`;
        
        // Clear filter rules when switching tables
        ruleContainer.innerHTML = "";
        
        // Hide both structure and filter sections when switching tables
        tableStructureSection.style.display = "none";
        tableFielterSection.style.display = "none";
        tableDataSection.style.display = "block";
        
        // Reset the toggle button texts
        const structureToggle = document.querySelector(".structure-toggle-main");
        const fielterToggle = document.querySelector(".fielter-toggle-main");
        
        if (structureToggle) {
            structureToggle.textContent = "Show Structure";
        }
        
        if (fielterToggle) {
            fielterToggle.textContent = "Show Filter";
        }
        
        // Show loading indicator for data only
        tableData.innerHTML = '<div class="alert alert-info">Loading table data...</div>';
        
        // Fetch and display table data only (structure will be loaded when user clicks "Show Structure")
        currentPage = 1;
        fetchTableData(tableName);
    }
        
    // Fetch and display table data
    function fetchTableData(tableName) {
        const rowsPerPage = parseInt(rowsPerPageSelect.value);
        const offset = (currentPage - 1) * rowsPerPage;
        
        // Show loading indicator
        tableData.innerHTML = '<div class="alert alert-info">Loading table data...</div>';
        
        // Fetch the actual data for current page
        const url = `/admin/get-database-select-table-data?table=${encodeURIComponent(tableName)}&page=${currentPage}&limit=${rowsPerPage}`;
        
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
                    tableData.innerHTML = `<div class="alert alert-info">No data available in this table.</div>`;
                    return;
                }
                
                renderTableData(pagedData.objects, pagedData.count, pagedData.page, pagedData.totalPages);
            
            })
            .catch(error => {
                console.error("Error fetching table data:", error);
                tableData.innerHTML = `<div class="alert alert-danger">Error loading table data: ${error.message}</div>`;
            });
    }
    
    // Render table data with pagination
    function renderTableData(data, totalCount, currentPageNum, totalPagesNum) {
        if (!data || data.length === 0) {
            tableData.innerHTML = `<div class="alert alert-info">No data available in this table.</div>`;
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
                tableData.innerHTML = '<div class="alert alert-info">Loading table data...</div>';
                fetchTableData(currentTable);
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
                tableData.innerHTML = '<div class="alert alert-info">Loading table data...</div>';
                fetchTableData(currentTable);
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
        // const structureToggle = document.createElement("button");
        // structureToggle.textContent = "Show Structure";
        // structureToggle.className = "btn btn-sm btn-outline-secondary mt-3 structure-toggle-main";
        // structureToggle.style.display = "block";
        // structureToggle.addEventListener("click", function() {
        //     toggleStructureVisibility(currentTable);
        // });
        
        // Clear and update data container
        tableData.innerHTML = "";
        // tableData.appendChild(structureToggle);
        tableData.appendChild(dataTable);
        tableData.appendChild(paginationControls);
    }

    addRuleButton.addEventListener("click", function() {
        if (currentTable) {
            createRuleGroup("AND", currentTable);
        } else {
            alert("Please select a table first");
        }
    });

    // Toggle table fielter visibility in main content area
    function toggleFielterVisibility(tableName) {
        const tableFielterSection = document.getElementById("tableFielterSection");
        const fielterToggle = document.querySelector(".fielter-toggle-main");
        
        if (tableFielterSection.style.display === "none") {
            // Show filter section
            tableFielterSection.style.display = "block";
            fielterToggle.textContent = "Hide Filter";
            
            // If no rules exist, add a default rule group
            // if (ruleContainer.children.length === 0) {
            //     addRuleButton.addEventListener("click", function() {
            //         createRuleGroup("AND", tableName);
            //     });
                
            //     // Create the first rule group automatically
            //     createRuleGroup("AND", tableName);
            // }
        } else {
            // Hide filter section
            tableFielterSection.style.display = "none";
            fielterToggle.textContent = "Show Filter";
        }
    }
    
    // Toggle table structure visibility in main content area
    function toggleStructureVisibility(tableName) {
        const structureSection = document.getElementById("tableStructureSection");
        const structureContainer = document.getElementById("tableStructure");
        const structureToggle = document.querySelector(".structure-toggle-main");
        console.log(tableName);
        if (structureSection.style.display === "none") {
            // Show structure
            structureSection.style.display = "block";
            structureToggle.textContent = "Hide Structure";
            fetchTableStructure(tableName);
            
        } else {
            // Hide structure
            structureSection.style.display = "none";
            structureToggle.textContent = "Show Structure";
        }
    }

    function updateFirstGroupRule() {
        var groups = ruleContainer.querySelectorAll(".rule-group");
        groups.forEach((group, index) => {
            var conditionWrapper = group.previousElementSibling;
            if (index === 0) {
                if (conditionWrapper) {
                    conditionWrapper.style.display = "none";
                }
            } else {
                if (conditionWrapper) {
                    conditionWrapper.style.display = "flex";
                }
            }
        });
    }

    function createRuleRow(attributes, groupBody, defaultRow = {}, isFirstRow = false, rowcondition = "AND", condition = "EQUALS") {
        var row = document.createElement("div");
        row.className = "row";
        row.style.display = "flex";
        row.style.alignItems = "center";
        row.style.marginBottom = "1px";

        // Add condition dropdown only if it's not the first row
        if (!isFirstRow && groupBody.children.length > 0) {
            var conditionSelect = document.createElement("select");
            conditionSelect.innerHTML = `
            <option value="AND" ${rowcondition === "AND" ? "selected" : ""}>AND</option>
            <option value="OR" ${rowcondition === "OR" ? "selected" : ""}>OR</option>
            <option value="AND NOT" ${rowcondition === "AND NOT" ? "selected" : ""}>AND NOT</option>
        `;
            conditionSelect.className = "rowCondition";
            conditionSelect.value = defaultRow.rowcondition || "AND";
            conditionSelect.style.width = "100px";
            conditionSelect.style.height = "30px";
            conditionSelect.style.textAlign = "center";

            var conditionWrapper = document.createElement("div");
            conditionWrapper.style.display = "flex";
            conditionWrapper.style.justifyContent = "center";
            conditionWrapper.appendChild(conditionSelect);
            row.appendChild(conditionWrapper);

            conditionSelect.addEventListener("change", function () {
                rowcondition = conditionSelect.value;
            });
        } else {
            // Add a placeholder div for empty space
            var placeholderWrapper = document.createElement("div");
            placeholderWrapper.style.width = "105px"; // Match the width of the condition field
            placeholderWrapper.style.height = "30px"; // Match the height of the condition field
            placeholderWrapper.style.display = "flex";
            placeholderWrapper.style.justifyContent = "center";
            row.appendChild(placeholderWrapper);
        }

        // Attribute Dropdown
        var attributeDropdown = document.createElement("select");
        attributeDropdown.innerHTML = `<option value="">Select column</option>`;
        attributeDropdown.className = "attribute";
        console.log("dd",attributes);
        attributes.forEach(attr => {
            var option = document.createElement("option");
            option.value = attr;        // use the string directly
            option.textContent = attr;  // same string as label
            attributeDropdown.appendChild(option);
        });
        attributeDropdown.value = defaultRow.attribute || "";
        row.appendChild(attributeDropdown);

        // Condition Dropdown
        var conditionDropdown = document.createElement("select");
        conditionDropdown.className = "condition";
        conditionDropdown.innerHTML = `
        <option value="EQUALS" ${condition === "EQUALS" ? "selected" : ""}>EQUALS</option>
        <option value="NOT EQUALS" ${condition === "NOT EQUALS" ? "selected" : ""}>NOT EQUALS</option>
        <option value="CONTAINS" ${condition === "CONTAINS" ? "selected" : ""}>CONTAINS</option>
        <option value="START WITH" ${condition === "START WITH" ? "selected" : ""}>START WITH</option>
        <option value="IS ONE OF" ${condition === "IS ONE OF" ? "selected" : ""}>IS ONE OF</option>
        <option value="NOT ONE OF" ${condition === "NOT ONE OF" ? "selected" : ""}>NOT ONE OF</option>
        <option value="GREATER THAN" ${condition === "GREATER THAN" ? "selected" : ""}>GREATER THAN</option>
        <option value="LESS THAN" ${condition === "LESS THAN" ? "selected" : ""}>LESS THAN</option>
    `;
        conditionDropdown.value = defaultRow.condition || "EQUALS";
        conditionDropdown.style.marginRight = "10px";
        row.appendChild(conditionDropdown);

        // Value Input Field
        var valueInput = document.createElement("input");
        valueInput.type = "text";
        valueInput.className = "value";
        valueInput.style.width = "395px"; // Match the width of the condition field
        valueInput.style.height = "20px"; // Match the height of the condition field
        valueInput.style.display = "flex";
        valueInput.placeholder = "Enter Value";
        valueInput.style.marginLeft = "10px";
        valueInput.value = defaultRow.value || "";
        row.appendChild(valueInput);

        // Delete Row Button
        var deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete Row";
        deleteButton.style.marginLeft = "10px";
        deleteButton.style.backgroundColor = "red";
        deleteButton.style.color = "white";
        deleteButton.style.cursor = "pointer";
        deleteButton.addEventListener("click", function () {
            groupBody.removeChild(row);
            updateFirstRowCondition(groupBody);
        });
        row.appendChild(deleteButton);

        // Append Row to Group Body
        groupBody.appendChild(row);

        // Update condition visibility after adding a row
        updateFirstRowCondition(groupBody);
    }

    function updateFirstRowCondition(groupBody) {
        var rows = groupBody.querySelectorAll(".row"); // Get all rows in the group

        // Loop through rows to set condition visibility
        rows.forEach((row, index) => {
            var conditionWrapper = row.querySelector("select.rowCondition"); // Assuming the condition wrapper has a specific class
            
            if (index === 0) {
                // For the first row, hide the condition wrapper
                if (conditionWrapper) {
                    conditionWrapper.style.display = "none"; 
                }
            } else {
                // For subsequent rows, show the condition wrapper
                if (conditionWrapper) {
                    conditionWrapper.style.display = "flex"; 
                }
            }
        });
    }
  
    saveAllButton.addEventListener("click", async function () {
        if (!currentTable) {
            showPopup('error', "Please select a table first");
            return;
        }
        var allGroups = [];
        var groups = ruleContainer.querySelectorAll(".rule-group");
        var isValid = true;
        var validationErrors = [];  // To collect validation errors

        groups.forEach(group => {
            var groupBody = group.querySelector(".group-body");
            var rows = groupBody.querySelectorAll(".row");

            var groupData = [];
            var conditionWrapper = group.closest(".rule-group").previousElementSibling;
            var groupConditionSelect = conditionWrapper ? conditionWrapper.querySelector(".groupCondition") : null;
            var groupCondition = groupConditionSelect ? groupConditionSelect.value : null;

            rows.forEach((row, index) => {
                // Dynamically select the correct elements
                var rowConditionDropdown = row.querySelector("select.rowCondition"); // Specifically target rowCondition
                var attributeDropdown = row.querySelector("select.attribute");      // Specifically target attribute dropdown
                var conditionDropdown = row.querySelector("select.condition");      // Specifically target condition dropdown
                var valueInput = row.querySelector("input.value");                  // Specifically target the value input

                // Get the values safely
                var rowCondition = rowConditionDropdown?.value || "AND"; // Default to "AND" if null
                if (index === 0) rowCondition = "AND"; // Explicitly set "AND" for the first row
                var attribute = attributeDropdown?.value;
                var condition = conditionDropdown?.value;
                var value = valueInput?.value;

                // Reset styles for validation
                if (attributeDropdown) attributeDropdown.style.border = "";
                if (valueInput) valueInput.style.border = "";

                // Validate inputs
                if (!attribute) {
                    if (attributeDropdown) attributeDropdown.style.border = "2px solid red";
                    isValid = false;
                    validationErrors.push(`Row ${index + 1}: Attribute is required.`);
                }
                if (!value) {
                    if (valueInput) valueInput.style.border = "2px solid red";
                    isValid = false;
                    validationErrors.push(`Row ${index + 1}: Value is required.`);
                }

                // If all fields are valid, build the object
                if (attribute && value) {
                    var rowObject = {
                        attribute: attribute,
                        value: value,
                        condition: condition,
                    };

                    // Only add 'rowcondition' if it's not the first row (index !== 0)
                    if (index !== 0) {
                        rowObject.rowcondition = row.querySelector("select.rowCondition").value;
                    }

                    groupData.push(rowObject);
                }
            });

            // Add group data only if it's valid and has rows
            if (groupData.length > 0) {
                var groupObject = {
                    group: groupData
                };

                if (groupCondition) {
                    groupObject.condition = groupCondition;
                }

                allGroups.push(groupObject);
            }
        });

        // Validation check
        if (!isValid) {
            showPopup('error',"Please fill in all required fields correctly:\n" + validationErrors.join("\n"));
            return;
        }

        // Get the object ID
        // var objectId = document.getElementById("category_id").value;
        // Prepare query parameters
        var params = new URLSearchParams({
            ruleSets: JSON.stringify(allGroups),
            table: currentTable
        });
        console.log(params.toString());
        try {
        // Show loading indicator
            tableData.innerHTML = '<div class="alert alert-info">Loading filtered data...</div>';
            
            // Make the GET request
            var response = await fetch(`/admin/get-database-search-value?${params.toString()}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });

            if (response.ok) {
                let result = await response.json();
                
                // Check if we have data in the response
                if (result && result.objects) {
                    // Render the filtered data in the table
                    renderTableData(result.objects, result.count || result.objects.length, 1, 1);
                        // showPopup('success', 'Filter applied successfully!');
                    
                    // Hide filter section after successful application
                    tableFielterSection.style.display = "none";
                    const fielterToggle = document.querySelector(".fielter-toggle-main");
                    if (fielterToggle) {
                        fielterToggle.textContent = "Show Filter";
                    }
                } else {
                    showPopup('info', 'No data matches your filter criteria.');
                    tableData.innerHTML = '<div class="alert alert-info">No data matches your filter criteria.</div>';
                }
            } else {
                showPopup('error', 'Failed to apply filter.');
                tableData.innerHTML = '<div class="alert alert-danger">Error applying filter.</div>';
            }
        } catch (error) {
            console.error("Fetch error:", error);
            showPopup('error', 'An error occurred while applying filter.');
            tableData.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
        }
    });

    async function showPopup(type, message) {
        const popup = document.getElementById('popup');
        const popupMessage = document.getElementById('popupMessage');
        console.log(message);
        popupMessage.textContent = message;
        popup.className = 'popup ' + type;
        popup.style.display = 'block';
    }

    const closePopup = document.getElementById('closePopup');
    closePopup.addEventListener("click", () => {
        const popup = document.getElementById('popup');
        popup.style.display = 'none';
    
    });

    // Fetch and display table structure
    async function fetchTableFielter(tableName) { 
        const url = `/admin/get-database-select-table-attribute?table=${encodeURIComponent(tableName)}`;

        try {
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log("Fetched columns:", data);  // ✅ logs array like ["id","name","email"]

            return data; // this will be an array of column names
        } catch (error) {
            console.error("Error fetching filter:", error);
            return []; // return empty array if error
        }
    }

    async function createRuleGroup(condition = "AND", tableName, defaultGroup = [], isFirstRow = false) {
        const attributes = await fetchTableFielter(tableName);
       
        var maingroupContainer = document.createElement("div");
        maingroupContainer.style.display = "flex";
        maingroupContainer.style.flexDirection = "column";
        maingroupContainer.style.marginBottom = "10px";

        // Condition Dropdown
        if (ruleContainer.children.length > 0) {
            var conditionSelect = document.createElement("select");
            conditionSelect.innerHTML = `
                <option value="AND" ${condition === "AND" ? "selected" : ""}>AND</option>
                <option value="OR" ${condition === "OR" ? "selected" : ""}>OR</option>
            `;
            conditionSelect.style.marginBottom = "10px";
            conditionSelect.className = "groupCondition";
            conditionSelect.style.width = "100px";
            conditionSelect.style.height = "30px";
            conditionSelect.style.textAlign = "center";

            var conditionWrapper = document.createElement("div");
            conditionWrapper.style.display = "flex";
            conditionWrapper.className = "groupConditions";
            conditionWrapper.style.justifyContent = "center";
            conditionWrapper.style.marginBottom = "15px";
            conditionWrapper.appendChild(conditionSelect);
            maingroupContainer.appendChild(conditionWrapper);

            conditionSelect.addEventListener("change", function () {
                condition = conditionSelect.value;
            });
        }

        // Group container
        var groupContainer = document.createElement("div");
        groupContainer.className = "rule-group";
        groupContainer.style.display = "flex";
        groupContainer.style.flexDirection = "column";
        groupContainer.style.marginBottom = "10px";
        groupContainer.style.border = "1px solid #ccc";
        groupContainer.style.padding = "10px";

        var openGroupLabel = document.createElement("div");
        openGroupLabel.textContent = "(";
        openGroupLabel.style.fontWeight = "bold";
        groupContainer.appendChild(openGroupLabel);

        var groupBody = document.createElement("div");
        groupBody.className = "group-body";
        groupBody.style.paddingLeft = "10px";
        groupBody.style.marginBottom = "10px";
        groupContainer.appendChild(groupBody);

        var groupFooter = document.createElement("div");
        groupFooter.style.display = "flex";
        groupFooter.style.alignItems = "center";
        groupFooter.style.marginTop = "10px";

        var closeGroupLabel = document.createElement("div");
        closeGroupLabel.textContent = ")";
        closeGroupLabel.style.fontWeight = "bold";
        groupContainer.appendChild(closeGroupLabel);

        var addRowButton = document.createElement("button");
        addRowButton.textContent = "Add Row";
        addRowButton.style.cursor = "pointer";
        addRowButton.addEventListener("click", function () {
            createRuleRow(attributes, groupBody);
        });
        groupFooter.appendChild(addRowButton);

        var deleteGroupButton = document.createElement("button");
        deleteGroupButton.textContent = "Delete Group";
        deleteGroupButton.style.marginLeft = "10px";
        deleteGroupButton.style.backgroundColor = "red";
        deleteGroupButton.style.color = "white";
        deleteGroupButton.style.cursor = "pointer";
        deleteGroupButton.addEventListener("click", function () {
            ruleContainer.removeChild(maingroupContainer);
            updateFirstGroupRule();
        });
        groupFooter.appendChild(deleteGroupButton);

        groupContainer.appendChild(groupFooter);

        // Create rows with default values if provided
        // Create rows with default values if provided
        if (Array.isArray(defaultGroup) && defaultGroup.length > 0) {
            defaultGroup.forEach((row, index) =>
                createRuleRow(attributes, groupBody, row, index === 0)
            );
        } else {
            createRuleRow(attributes, groupBody, {}, true);
        }

        maingroupContainer.appendChild(groupContainer);
        ruleContainer.appendChild(maingroupContainer);
    }
    
    // Fetch and display table structure
    function fetchTableStructure(tableName) {
        const structureContainer = document.getElementById("tableStructure");
        
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
    
    // Fetch and display table data
    function fetchTableData(tableName) {
        const rowsPerPage = parseInt(rowsPerPageSelect.value);
        const offset = (currentPage - 1) * rowsPerPage;
        const tableData = document.getElementById("tableData");
        
        // Show loading indicator
        tableData.innerHTML = '<div class="alert alert-info">Loading table data...</div>';
        
        // Fetch the actual data for current page
        const url = `/admin/get-database-select-table-data?table=${encodeURIComponent(tableName)}&page=${currentPage}&limit=${rowsPerPage}`;
        
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
                    tableData.innerHTML = `<div class="alert alert-info">No data available in this table.</div>`;
                    return;
                }
                 // Create structure toggle button
                const structureToggle = document.createElement("button");
                structureToggle.textContent = "Show Structure";
                structureToggle.className = "btn btn-sm btn-outline-secondary mt-3 structure-toggle-main";
                structureToggle.style.display = "block";
                structureToggle.addEventListener("click", function() {
                    toggleStructureVisibility(tableName);
                });

                 // Create structure toggle button
                const fielterToggle = document.createElement("button");
                fielterToggle.textContent = "Show Fielter";
                fielterToggle.className = "btn btn-sm btn-outline-secondary mt-3 fielter-toggle-main";
                fielterToggle.style.display = "block";
                fielterToggle.addEventListener("click", function() {
                    toggleFielterVisibility(tableName);
                    
                });
                // Instead of appending to tableData, place inside #strucher
                const strucher = document.getElementById("strucher");
                strucher.innerHTML = "";          // clear old button if any
                strucher.style.display = "flex";      // make children in one row
                strucher.style.gap = "10px";          // add spacing
                strucher.appendChild(structureToggle);
                strucher.appendChild(fielterToggle);
                
                renderTableData(pagedData.objects, pagedData.count, pagedData.page, pagedData.totalPages);
            })
            .catch(error => {
                console.error("Error fetching table data:", error);
                tableData.innerHTML = `<div class="alert alert-danger">Error loading table data: ${error.message}</div>`;
            });
    }
    
    // Render table data with pagination
    function renderTableData(data, totalCount, currentPageNum, totalPagesNum) {
        const tableData = document.getElementById("tableData");
        
        if (!data || data.length === 0) {
            tableData.innerHTML = `<div class="alert alert-info">No data available in this table.</div>`;
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
                fetchTableData(currentTable);
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
                fetchTableData(currentTable);
            }
        });
        
        // Page indicator
        const pageIndicator = document.createElement("span");
        pageIndicator.className = "mx-3";
        pageIndicator.textContent = `Page ${Number(currentPageNum)} of ${totalPagesNum} (Total records: ${totalCount})`;
        
        paginationControls.appendChild(prevButton);
        paginationControls.appendChild(pageIndicator);
        paginationControls.appendChild(nextButton);
        
        // Clear and update data container
        // tableData.appendChild(structureToggle);
        tableData.innerHTML = "";
        tableData.appendChild(dataTable);
        tableData.appendChild(paginationControls);
    }
    
    // Toggle table structure visibility (for sidebar buttons - not needed anymore)
    function toggleTableStructure(tableName, button) {
        // This function is not used anymore since we removed the sidebar toggle buttons
    }
    
    // Fetch table structure for toggle functionality (not needed anymore)
    function fetchTableStructureForToggle(tableName, container) {
        // This function is not used anymore since we removed the sidebar toggle buttons
    }
});