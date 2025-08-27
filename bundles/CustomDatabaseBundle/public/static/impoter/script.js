document.addEventListener("DOMContentLoaded", function () {
    // DOM Elements
    const uploadForm = document.getElementById("uploadForm");
    const uploadBtn = document.getElementById("uploadBtn");
    const uploadResult = document.getElementById("uploadResult");
    const uploadMessage = document.getElementById("uploadMessage");
    const dataDisplaySection = document.getElementById("dataDisplaySection");
    const dataPreview = document.getElementById("dataPreview");
    const showTableBtn = document.getElementById("showTableBtn");
    const convertTableBtn = document.getElementById("convertTableBtn");
    const delimiterSelect = document.getElementById("delimiter");
    const firstRowHeaderCheckbox = document.getElementById("firstRowHeader");
    const skipEmptyRowsCheckbox = document.getElementById("skipEmptyRows");
    
    let uploadedData = null;
    let uploadedFile = null;
    let fileHeaders = [];
    
    // Handle form submission
    uploadForm.addEventListener("submit", function(e) {
        e.preventDefault();
        
        const fileInput = document.getElementById("dataFile");
        const file = fileInput.files[0];
        
        if (!file) {
            showMessage("Please select a file to upload.", "warning");
            return;
        }
        
        // Store file for later processing
        uploadedFile = file;
        
        // Show file info
        showMessage(`Selected file: ${file.name} (${formatFileSize(file.size)})`, "info");
        
        // Show data display section
        dataDisplaySection.style.display = "block";
        dataPreview.innerHTML = `
            <div class="alert alert-info">
                <p>File selected: ${file.name}</p>
                <p>File size: ${formatFileSize(file.size)}</p>
                <p>File type: ${file.type || 'Unknown'}</p>
                <p>Click "Show Data in Table" to parse and view the file contents.</p>
            </div>
        `;
    });
    
    // Show full data in table format
    showTableBtn.addEventListener("click", function() {
        if (!uploadedFile) {
            showMessage("Please select a file first.", "warning");
            return;
        }
        
        // Show loading state
        showTableBtn.disabled = true;
        showTableBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        
        // Read file content
        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            const extension = getFileExtension(uploadedFile.name);
            
            // Get advanced options
            const delimiter = delimiterSelect.value;
            const firstRowHeader = firstRowHeaderCheckbox.checked;
            const skipEmptyRows = skipEmptyRowsCheckbox.checked;
            
            // For CSV files, we can use the delimiter option
            if (extension === 'csv') {
                parseCsvWithAdvancedOptions(content, delimiter, firstRowHeader, skipEmptyRows);
            } else {
                // Send AJAX request with file content
                fetch(`/admin/data-importer/parse?content=${encodeURIComponent(content)}&type=${extension}`)
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            uploadedData = data.data;
                            showMessage(data.message, "success");
                            // Show preview of data
                            showDataPreview();
                        } else {
                            showMessage(data.message, "danger");
                        }
                    })
                    .catch(error => {
                        console.error("Error:", error);
                        showMessage("An error occurred while processing the file.", "danger");
                    })
                    .finally(() => {
                        // Reset button state
                        showTableBtn.disabled = false;
                        showTableBtn.innerHTML = '<i class="fas fa-table"></i> Show Data in Table';
                    });
            }
        };
        reader.readAsText(uploadedFile);
    });
    
    // Parse CSV with advanced options
    function parseCsvWithAdvancedOptions(content, delimiter, firstRowHeader, skipEmptyRows) {
        try {
            const lines = content.split('\n');
            let data = [];
            let headers = [];
            
            // Process lines based on options
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                
                // Skip empty lines if option is enabled
                if (skipEmptyRows && line === '') {
                    continue;
                }
                
                // Parse line based on delimiter
                const row = parseCsvLine(line, delimiter);
                
                // Handle headers
                if (i === 0 && firstRowHeader) {
                    headers = row;
                    continue;
                }
                
                // Create object with headers or default column names
                if (firstRowHeader && headers.length > 0) {
                    const obj = {};
                    for (let j = 0; j < headers.length; j++) {
                        obj[headers[j]] = row[j] || '';
                    }
                    data.push(obj);
                } else {
                    // No headers, use generic column names
                    const obj = {};
                    for (let j = 0; j < row.length; j++) {
                        obj[`Column ${j + 1}`] = row[j] || '';
                    }
                    data.push(obj);
                }
            }
            
            uploadedData = data;
            fileHeaders = headers;
            showMessage("CSV file parsed successfully", "success");
            // Show preview of data
            showDataPreview();
        } catch (error) {
            console.error("Error parsing CSV:", error);
            showMessage("An error occurred while parsing the CSV file.", "danger");
        } finally {
            // Reset button state
            showTableBtn.disabled = false;
            showTableBtn.innerHTML = '<i class="fas fa-table"></i> Show Data in Table';
        }
    }
    
    // Parse a CSV line with a specific delimiter
    function parseCsvLine(line, delimiter) {
        const regex = new RegExp(`(".*?"|[^"${delimiter}]+)`, 'g');
        const matches = line.match(regex) || [];
        
        // Remove quotes from quoted fields
        return matches.map(field => {
            if (field.startsWith('"') && field.endsWith('"')) {
                return field.substring(1, field.length - 1).replace(/""/g, '"');
            }
            return field;
        });
    }
    
    // Show data preview (first 10 rows)
    function showDataPreview() {
        if (!uploadedData || uploadedData.length === 0) {
            dataPreview.innerHTML = '<div class="alert alert-info">No data available.</div>';
            return;
        }
        
        // Show first 10 rows as preview
        const previewData = uploadedData.slice(0, 10);
        const totalRows = uploadedData.length;
        
        let previewHtml = `
            <div class="alert alert-info">
                Showing preview of first 10 rows out of ${totalRows} total rows.
            </div>
        `;
        
        // Create preview table
        previewHtml += createTableHtml(previewData);
        
        dataPreview.innerHTML = previewHtml;
    }
    
    // Convert to table format
    convertTableBtn.addEventListener("click", function() {
        if (!uploadedData || uploadedData.length === 0) {
            showMessage("No data available to convert.", "warning");
            return;
        }
        
        // Show full data in modal
        showFullDataModal();
    });
    
    // Show full data in modal
    function showFullDataModal() {
        if (!uploadedData || uploadedData.length === 0) {
            showMessage("No data available to display.", "warning");
            return;
        }
        
        // Create modal HTML
        const modalHtml = `
            <div class="modal fade" id="dataModal" tabindex="-1" aria-labelledby="dataModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-xl">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="dataModalLabel">Converted Data Table</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-3">
                                <strong>Total Rows: ${uploadedData.length}</strong>
                                ${fileHeaders.length > 0 ? `<br>Headers: ${fileHeaders.join(', ')}` : ''}
                            </div>
                            ${createTableHtml(uploadedData)}
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" class="btn btn-primary" id="saveTableBtn">Save Table</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to body
        const modalElement = document.createElement('div');
        modalElement.innerHTML = modalHtml;
        document.body.appendChild(modalElement);
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('dataModal'));
        modal.show();
        
        // Add event listener for save button
        document.getElementById('saveTableBtn').addEventListener('click', function() {
            showMessage("Table saved successfully!", "success");
            // In a real implementation, this would save to a database
        });
        
        // Remove modal from DOM when closed
        document.getElementById('dataModal').addEventListener('hidden.bs.modal', function () {
            document.getElementById('dataModal').remove();
        });
    }
    
    // Create HTML table from data
    function createTableHtml(data) {
        if (!data || data.length === 0) {
            return '<div class="alert alert-info">No data available.</div>';
        }
        
        // Get all unique keys from all objects to ensure consistent columns
        const allKeys = new Set();
        data.forEach(row => {
            Object.keys(row).forEach(key => allKeys.add(key));
        });
        
        const keys = Array.from(allKeys);
        
        // Create table
        let tableHtml = `
            <div class="table-responsive">
                <table class="table table-striped table-bordered">
                    <thead>
                        <tr>
        `;
        
        // Create header
        keys.forEach(key => {
            tableHtml += `<th>${key.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}</th>`;
        });
        
        tableHtml += `
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        // Create rows
        data.forEach(row => {
            tableHtml += '<tr>';
            keys.forEach(key => {
                const value = row[key] !== undefined ? row[key] : '';
                tableHtml += `<td>${escapeHtml(value.toString())}</td>`;
            });
            tableHtml += '</tr>';
        });
        
        tableHtml += `
                    </tbody>
                </table>
            </div>
        `;
        
        return tableHtml;
    }
    
    // Show message in alert box
    function showMessage(message, type) {
        uploadResult.style.display = "block";
        uploadMessage.className = `alert alert-${type}`;
        uploadMessage.innerHTML = message;
        
        // Auto hide info messages after 5 seconds
        if (type === "info" || type === "success") {
            setTimeout(() => {
                uploadResult.style.display = "none";
            }, 5000);
        }
    }
    
    // Get file extension
    function getFileExtension(filename) {
        return filename.split('.').pop().toLowerCase();
    }
    
    // Format file size
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        const map = {
            '&': '&',
            '<': '<',
            '>': '>',
            '"': '"',
            "'": '&#039;'
        };
        
        return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    }
    
    // Sidebar navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Get the link id to determine which section to show
            const linkId = this.id;
            
            // In a full implementation, you would show different sections based on the link
            // For now, we'll just show a message
            if (linkId === 'exportDataLink') {
                showMessage("Export functionality would be implemented here.", "info");
            } else if (linkId === 'dataMappingLink') {
                showMessage("Data mapping functionality would be implemented here.", "info");
            } else if (linkId === 'importHistoryLink') {
                showMessage("Import history functionality would be implemented here.", "info");
            }
        });
    });
});