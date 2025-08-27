document.addEventListener("DOMContentLoaded", function () {
    // Handle switching DB type tabs
    document.querySelectorAll('.db-type').forEach(item => {
        item.addEventListener('click', function() {
            // Remove active class from all db types
            document.querySelectorAll('.db-type').forEach(db => {
                db.classList.remove('active');
            });

            // Add active class to clicked db type
            this.classList.add('active');

            // Hide all connection forms
            document.querySelectorAll('.connection-form').forEach(form => {
                form.classList.remove('active');
            });

            // Show the selected connection form
            const dbType = this.getAttribute('data-db');
            document.getElementById(`${dbType}-form`).classList.add('active');
        });
    });

    // Attach click event for Test buttons
    document.querySelectorAll('.test-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const dbType = this.getAttribute('data-db');
            testConnection(dbType);
        });
    });

    // Attach click event for Save buttons
    document.querySelectorAll('.save-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const dbType = this.getAttribute('data-db');
            saveConnection(dbType);
        });
    });
});

// Test connection function
function testConnection(dbType) {
    const status = document.getElementById('status-message');
    status.className = 'status';
    status.textContent = 'Testing connection...';

    // Simulate AJAX call
    setTimeout(() => {
        status.classList.add('success');
        status.textContent = `Connection to ${dbType} successful!`;
    }, 1500);
}

// Save connection function
function saveConnection(dbType) {
    const status = document.getElementById('status-message');
    status.className = 'status';

    // Collect form values
    let config = { type: dbType };
    const inputs = document.querySelectorAll(`#${dbType}-form input`);

    inputs.forEach(input => {
        const id = input.id.replace(`${dbType}-`, '');
        config[id] = input.value;
    });

    // Simulate AJAX save
    status.classList.add('success');
    status.textContent = `${dbType} connection saved successfully!`;

    console.log("Saved config:", config); // For debugging
}
// Note: Actual AJAX calls to backend should be implemented for real testing and saving of connections.