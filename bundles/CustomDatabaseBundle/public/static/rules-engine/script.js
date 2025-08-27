document.addEventListener("DOMContentLoaded", function() {
    // DOM Elements
    const elements = {
        ruleContainer: document.getElementById("ruleContainer"),
        addRuleButton: document.getElementById("addRuleButton"),
        saveAllButton: document.getElementById("saveAllButton"),
        tablesList: document.getElementById("tablesList"),
        refreshTables: document.getElementById("refreshTables"),
        tableCount: document.getElementById("tableCount"),
        popup: document.getElementById("popup"),
        popupMessage: document.getElementById("popupMessage"),
        closePopup: document.getElementById("closePopup"),
        filter: document.getElementById("filter"),
        defaultTable: document.getElementById("defaultTable"),
        pimcoreObjects: document.getElementById("pimcoreObjects"),
        queryInput: document.getElementById("query"),
        tables: JSON.parse(document.getElementById("tables").value || "[]")
    };

    // State
    let selectedTable = null;
    let tableColumns = [];
    let attributes = []; // Store attributes globally

    // Initialize
    init();

    function init() {
        renderTablesList();
        setupEventListeners();
        // Disable buttons initially
        elements.addRuleButton.style.display = 'none';
        elements.saveAllButton.style.display = 'none';
    }

    function setupEventListeners() {
        elements.closePopup.addEventListener("click", () => elements.popup.style.display = 'none');
        elements.addRuleButton.addEventListener("click", handleAddRuleGroup);
        elements.saveAllButton.addEventListener("click", saveAllRules);
        elements.refreshTables.addEventListener("click", refreshTablesList);
        elements.defaultTable.addEventListener("click", showDefaultTableData);
    }

    function handleAddRuleGroup() {
        if (!selectedTable) {
            showPopup('error', 'Please select a table first');
            return;
        }
        createRuleGroup("AND");
    }

    function renderTablesList() {
        elements.tablesList.innerHTML = '';
        elements.tableCount.textContent = `Total Tables: ${elements.tables.length}`;
        
        const tablesContainer = document.createElement('div');
        tablesContainer.className = 'tables-container';
        
        elements.tables.forEach(table => {
            const tableItem = createTableItem(table);
            tablesContainer.appendChild(tableItem);
        });
        
        elements.tablesList.appendChild(tablesContainer);
    }

    function createTableItem(table) {
        const tableItem = document.createElement('div');
        tableItem.className = 'table-item';
        
        const nameSpan = document.createElement('span');
        nameSpan.textContent = table;
        
        tableItem.appendChild(nameSpan);
        
        tableItem.addEventListener('click', async function() {
            selectTable(this, table);
        });
        
        return tableItem;
    }

    async function selectTable(tableElement, tableName) {
        // Reset previous selection
        document.querySelectorAll('.table-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Set new selection
        tableElement.classList.add('active');
        selectedTable = tableName;
        
        // Show loading
        const loadingText = document.createElement('span');
        loadingText.textContent = 'Loading...';
        tableElement.appendChild(loadingText);
        
        try {
            // Fetch both columns and attributes
            const [columns, attrs] = await Promise.all([
                fetchTableColumns(tableName),
                fetchAttributes(tableName)
            ]);
            
            tableColumns = columns;
            attributes = attrs; // Store attributes globally
            
            initRuleEngine(tableName, columns);
            document.getElementById('interfaceContainer').style.display = 'block';
            
            // Enable buttons after table is selected
            elements.addRuleButton.style.display = 'inline-block';
            elements.saveAllButton.style.display = 'inline-block';
        } catch (error) {
            console.error('Error:', error);
            showPopup('error', `Failed to load table: ${tableName}`);
        } finally {
            tableElement.removeChild(loadingText);
        }
    }

    async function fetchTableColumns(tableName) {
        const response = await fetch(`/admin/get-product-attributes?table=${encodeURIComponent(tableName)}`);
        if (!response.ok) throw new Error('Failed to fetch columns');
        const data = await response.json();
        return data.map(item => item.name);
    }

    async function fetchAttributes(tableName) {
        try {
            const response = await fetch(`/admin/get-product-attributes?table=${encodeURIComponent(tableName)}`);
            if (!response.ok) throw new Error('Failed to fetch attributes');
            return await response.json();
        } catch (error) {
            console.error("Error fetching attributes:", error);
            return [];
        }
    }

    function initRuleEngine(tableName, columns) {
        elements.ruleContainer.innerHTML = '';
        document.getElementById('ruleEngineTitle').textContent = `Rule Engine - ${tableName}`;
        createRuleGroup("AND", [], true, columns);
    }

    function createRuleGroup(condition = "AND", defaultGroup = [], isFirstRow = false, columns) {
        var maingroupContainer = document.createElement("div");
        maingroupContainer.style.display = "flex";
        maingroupContainer.style.flexDirection = "column";
        maingroupContainer.style.marginBottom = "10px";

        // Condition Dropdown
        if (elements.ruleContainer.children.length > 0) {
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

            conditionSelect.addEventListener("change", function() {
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
        addRowButton.addEventListener("click", function() {
            createRuleRow(groupBody);
        });
        groupFooter.appendChild(addRowButton);

        var deleteGroupButton = document.createElement("button");
        deleteGroupButton.textContent = "Delete Group";
        deleteGroupButton.style.marginLeft = "10px";
        deleteGroupButton.style.backgroundColor = "red";
        deleteGroupButton.style.color = "white";
        deleteGroupButton.style.cursor = "pointer";
        deleteGroupButton.addEventListener("click", function() {
            elements.ruleContainer.removeChild(maingroupContainer);
            updateFirstGroupRule();
        });
        groupFooter.appendChild(deleteGroupButton);

        groupContainer.appendChild(groupFooter);

        // Create rows with default values if provided
        if (defaultGroup.length > 0) {
            defaultGroup.forEach((row, index) => createRuleRow(groupBody, row, index === 0));
        } else {
            createRuleRow(groupBody, {}, true);
        }

        maingroupContainer.appendChild(groupContainer);
        elements.ruleContainer.appendChild(maingroupContainer);
    }

    function createRuleRow(groupBody, defaultRow = {}, isFirstRow = false, rowcondition = "AND", condition = "EQUALS") {
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

            conditionSelect.addEventListener("change", function() {
                rowcondition = conditionSelect.value;
            });
        } else {
            // Add a placeholder div for empty space
            var placeholderWrapper = document.createElement("div");
            placeholderWrapper.style.width = "105px";
            placeholderWrapper.style.height = "30px";
            placeholderWrapper.style.display = "flex";
            placeholderWrapper.style.justifyContent = "center";
            row.appendChild(placeholderWrapper);
        }

        // Attribute Dropdown - Use the globally stored attributes
        var attributeDropdown = document.createElement("select");
        attributeDropdown.innerHTML = `<option value="">Select Attribute</option>`;
        attributeDropdown.className = "attribute";
        
        // Populate with actual attributes
        attributes.forEach(attr => {
            var option = document.createElement("option");
            option.value = attr.name || attr; // Handle both object and string cases
            option.textContent = attr.name || attr;
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
        valueInput.style.width = "395px";
        valueInput.style.height = "20px";
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
        deleteButton.addEventListener("click", function() {
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
        var rows = groupBody.querySelectorAll(".row");
        rows.forEach((row, index) => {
            var conditionWrapper = row.querySelector("select.rowCondition");
            if (conditionWrapper) {
                conditionWrapper.style.display = index === 0 ? "none" : "flex";
            }
        });
    }

    function updateFirstGroupRule() {
        var groups = elements.ruleContainer.querySelectorAll(".rule-group");
        groups.forEach((group, index) => {
            var conditionWrapper = group.previousElementSibling;
            if (conditionWrapper) {
                conditionWrapper.style.display = index === 0 ? "none" : "flex";
            }
        });
    }

    function saveAllRules() {
        if (!selectedTable) {
            showPopup('error', 'Please select a table first');
            return;
        }

        var allGroups = [];
        var groups = elements.ruleContainer.querySelectorAll(".rule-group");
        var isValid = true;
        var validationErrors = [];

        groups.forEach(group => {
            var groupBody = group.querySelector(".group-body");
            var rows = groupBody.querySelectorAll(".row");

            var groupData = [];
            var conditionWrapper = group.closest(".rule-group").previousElementSibling;
            var groupConditionSelect = conditionWrapper ? conditionWrapper.querySelector(".groupCondition") : null;
            var groupCondition = groupConditionSelect ? groupConditionSelect.value : null;

            rows.forEach((row, index) => {
                var rowConditionDropdown = row.querySelector("select.rowCondition");
                var attributeDropdown = row.querySelector("select.attribute");
                var conditionDropdown = row.querySelector("select.condition");
                var valueInput = row.querySelector("input.value");

                var rowCondition = rowConditionDropdown?.value || "AND";
                if (index === 0) rowCondition = "AND";
                var attribute = attributeDropdown?.value;
                var condition = conditionDropdown?.value;
                var value = valueInput?.value;

                if (attributeDropdown) attributeDropdown.style.border = "";
                if (valueInput) valueInput.style.border = "";

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

                if (attribute && value) {
                    var rowObject = {
                        attribute: attribute,
                        value: value,
                        condition: condition,
                    };

                    if (index !== 0) {
                        rowObject.rowcondition = row.querySelector("select.rowCondition").value;
                    }

                    groupData.push(rowObject);
                }
            });

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

        if (!isValid) {
            showPopup('error', "Please fill in all required fields correctly:\n" + validationErrors.join("\n"));
            return;
        }
    }

    function showPopup(type, message) {
        elements.popupMessage.textContent = message;
        elements.popup.style.display = 'block';
        elements.popup.className = type === 'error' ? 'popup error' : 'popup success';
    }

    function refreshTablesList() {
        // Implementation for refreshing tables list
    }

    function showDefaultTableData() {
        // Implementation for showing default table data
    }
});