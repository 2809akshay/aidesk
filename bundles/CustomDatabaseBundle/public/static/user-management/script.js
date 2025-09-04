// User Management JavaScript Functions
$(document).ready(function() {
    // Initialize the user management interface
    initializeUserManagement();

    // Load user data
    loadUserData();

    // Set up event listeners
    setupUserEventListeners();

    // Initialize charts
    initializeUserCharts();

    // Start real-time updates
    startUserMonitoring();
});

function initializeUserManagement() {
    // Initialize user management interface
    switchUserTab('users');
    loadUsers();
    loadRoles();
    loadGroups();
}

function loadUserData() {
    // Load all user-related data
    updateUserStats();
}

function setupUserEventListeners() {
    // User search functionality
    $('#user-search').on('input', function() {
        filterUsers();
    });

    // User filters
    $('#user-status-filter, #user-role-filter').change(function() {
        filterUsers();
    });

    // Role search
    $('#role-search').on('input', function() {
        filterRoles();
    });

    // Group search
    $('#group-search').on('input', function() {
        filterGroups();
    });

    // Select all users checkbox
    $('#select-all-users').change(function() {
        const isChecked = $(this).is(':checked');
        $('.user-checkbox').prop('checked', isChecked);
        updateBulkActions();
    });

    // Individual user checkboxes
    $(document).on('change', '.user-checkbox', function() {
        updateBulkActions();
    });

    // Pagination
    setupUserPagination();
}

function switchUserTab(tabId) {
    // Remove active class from all tabs
    $('.tab-button').removeClass('active');

    // Add active class to clicked tab
    $(`.tab-button[onclick*="${tabId}"]`).addClass('active');

    // Hide all tab contents
    $('.tab-content').removeClass('active');

    // Show selected tab content
    $(`#${tabId}-tab`).addClass('active');
}

function updateUserStats() {
    // Mock user statistics
    const stats = {
        totalUsers: 1247,
        activeUsers: 1189,
        pendingUsers: 23,
        lockedAccounts: 35
    };

    $('#total-users').text(stats.totalUsers);
    $('#active-users').text(stats.activeUsers);
    $('#pending-users').text(stats.pendingUsers);
    $('#locked-accounts').text(stats.lockedAccounts);
}

function loadUsers() {
    // Mock user data
    const users = [
        {
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@company.com',
            role: 'Administrator',
            status: 'active',
            lastLogin: new Date(Date.now() - 3600000).toLocaleString(),
            created: new Date(Date.now() - 86400000 * 30).toLocaleString(),
            avatar: 'JD'
        },
        {
            id: 2,
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@company.com',
            role: 'Manager',
            status: 'active',
            lastLogin: new Date(Date.now() - 7200000).toLocaleString(),
            created: new Date(Date.now() - 86400000 * 45).toLocaleString(),
            avatar: 'JS'
        },
        {
            id: 3,
            firstName: 'Bob',
            lastName: 'Johnson',
            email: 'bob.johnson@company.com',
            role: 'User',
            status: 'inactive',
            lastLogin: new Date(Date.now() - 86400000 * 7).toLocaleString(),
            created: new Date(Date.now() - 86400000 * 60).toLocaleString(),
            avatar: 'BJ'
        },
        {
            id: 4,
            firstName: 'Alice',
            lastName: 'Williams',
            email: 'alice.williams@company.com',
            role: 'Viewer',
            status: 'pending',
            lastLogin: 'Never',
            created: new Date(Date.now() - 86400000 * 2).toLocaleString(),
            avatar: 'AW'
        },
        {
            id: 5,
            firstName: 'Charlie',
            lastName: 'Brown',
            email: 'charlie.brown@company.com',
            role: 'User',
            status: 'locked',
            lastLogin: new Date(Date.now() - 86400000 * 1).toLocaleString(),
            created: new Date(Date.now() - 86400000 * 90).toLocaleString(),
            avatar: 'CB'
        }
    ];

    const tbody = $('#users-table-body');
    tbody.empty();

    users.forEach(user => {
        const rowHtml = `
            <tr>
                <td><input type="checkbox" class="user-checkbox" value="${user.id}"></td>
                <td>
                    <div class="user-avatar">${user.avatar}</div>
                </td>
                <td>${user.firstName} ${user.lastName}</td>
                <td>${user.email}</td>
                <td>${user.role}</td>
                <td><span class="status-${user.status}">${user.status}</span></td>
                <td>${user.lastLogin}</td>
                <td>${user.created}</td>
                <td>
                    <div class="user-actions">
                        <button class="btn-user-action btn-view-user" onclick="viewUser(${user.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-user-action btn-edit-user" onclick="editUser(${user.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-user-action btn-delete-user" onclick="deleteUser(${user.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
        tbody.append(rowHtml);
    });

    updateUserTableInfo();
    updateUserPagination();
}

function filterUsers() {
    const searchTerm = $('#user-search').val().toLowerCase();
    const statusFilter = $('#user-status-filter').val();
    const roleFilter = $('#user-role-filter').val();

    $('#users-table-body tr').each(function() {
        const row = $(this);
        const userName = row.find('td:nth-child(3)').text().toLowerCase();
        const userEmail = row.find('td:nth-child(4)').text().toLowerCase();
        const userRole = row.find('td:nth-child(5)').text().toLowerCase();
        const userStatus = row.find('td:nth-child(6)').text().toLowerCase();

        const matchesSearch = userName.includes(searchTerm) || userEmail.includes(searchTerm);
        const matchesStatus = statusFilter === 'all' || userStatus === statusFilter;
        const matchesRole = roleFilter === 'all' || userRole === roleFilter;

        if (matchesSearch && matchesStatus && matchesRole) {
            row.show();
        } else {
            row.hide();
        }
    });

    updateUserTableInfo();
}

function updateBulkActions() {
    const selectedCount = $('.user-checkbox:checked').length;
    const bulkPanel = $('#bulk-actions-panel');

    if (selectedCount > 0) {
        $('#selected-count').text(`${selectedCount} user${selectedCount > 1 ? 's' : ''} selected`);
        bulkPanel.show();
    } else {
        bulkPanel.hide();
    }
}

function clearSelection() {
    $('.user-checkbox').prop('checked', false);
    $('#select-all-users').prop('checked', false);
    updateBulkActions();
}

function bulkActivateUsers() {
    const selectedUsers = $('.user-checkbox:checked').map(function() {
        return $(this).val();
    }).get();

    if (selectedUsers.length === 0) {
        showNotification('No users selected', 'warning');
        return;
    }

    showNotification(`Activating ${selectedUsers.length} user(s)...`, 'info');

    setTimeout(() => {
        showNotification(`${selectedUsers.length} user(s) activated successfully!`, 'success');
        loadUsers();
        clearSelection();
    }, 2000);
}

function bulkDeactivateUsers() {
    const selectedUsers = $('.user-checkbox:checked').map(function() {
        return $(this).val();
    }).get();

    if (selectedUsers.length === 0) {
        showNotification('No users selected', 'warning');
        return;
    }

    showNotification(`Deactivating ${selectedUsers.length} user(s)...`, 'info');

    setTimeout(() => {
        showNotification(`${selectedUsers.length} user(s) deactivated successfully!`, 'success');
        loadUsers();
        clearSelection();
    }, 2000);
}

function bulkChangeRole() {
    const selectedUsers = $('.user-checkbox:checked').map(function() {
        return $(this).val();
    }).get();

    if (selectedUsers.length === 0) {
        showNotification('No users selected', 'warning');
        return;
    }

    const newRole = prompt('Enter new role for selected users:');
    if (newRole) {
        showNotification(`Changing role to "${newRole}" for ${selectedUsers.length} user(s)...`, 'info');

        setTimeout(() => {
            showNotification(`Role changed successfully for ${selectedUsers.length} user(s)!`, 'success');
            loadUsers();
            clearSelection();
        }, 2000);
    }
}

function bulkDeleteUsers() {
    const selectedUsers = $('.user-checkbox:checked').map(function() {
        return $(this).val();
    }).get();

    if (selectedUsers.length === 0) {
        showNotification('No users selected', 'warning');
        return;
    }

    if (confirm(`Are you sure you want to delete ${selectedUsers.length} user(s)? This action cannot be undone.`)) {
        showNotification(`Deleting ${selectedUsers.length} user(s)...`, 'info');

        setTimeout(() => {
            showNotification(`${selectedUsers.length} user(s) deleted successfully!`, 'success');
            loadUsers();
            clearSelection();
        }, 2000);
    }
}

function updateUserTableInfo() {
    const visibleRows = $('#users-table-body tr:visible').length;
    const totalRows = $('#users-table-body tr').length;
    $('#users-table-info').text(`Showing ${visibleRows} of ${totalRows} users`);
}

function setupUserPagination() {
    // Basic pagination setup
    updateUserPagination();
}

function updateUserPagination() {
    const entriesPerPage = 25; // Fixed for demo
    const totalEntries = $('#users-table-body tr').length;
    const totalPages = Math.ceil(totalEntries / entriesPerPage);

    const pageNumbers = $('#users-page-numbers');
    pageNumbers.empty();

    for (let i = 1; i <= Math.min(totalPages, 5); i++) {
        const pageBtn = $(`<button class="page-number ${i === 1 ? 'active' : ''}" onclick="goToUserPage(${i})">${i}</button>`);
        pageNumbers.append(pageBtn);
    }

    // Update prev/next buttons
    $('#users-prev-page').prop('disabled', true);
    $('#users-next-page').prop('disabled', totalPages <= 1);
}

function goToUserPage(pageNumber) {
    $('.page-number').removeClass('active');
    $(`.page-number:nth-child(${pageNumber})`).addClass('active');

    $('#users-prev-page').prop('disabled', pageNumber === 1);
    $('#users-next-page').prop('disabled', pageNumber === $('.page-number').length);

    // In real app, this would load the specific page of data
    showNotification(`Navigated to page ${pageNumber}`, 'info');
}

function loadRoles() {
    // Mock roles data
    const roles = [
        {
            id: 1,
            name: 'Administrator',
            description: 'Full system access and administration',
            status: 'active',
            permissions: ['Read Data', 'Write Data', 'Delete Data', 'User Management', 'System Settings'],
            userCount: 5
        },
        {
            id: 2,
            name: 'Manager',
            description: 'Management access with limited admin functions',
            status: 'active',
            permissions: ['Read Data', 'Write Data', 'User Management'],
            userCount: 12
        },
        {
            id: 3,
            name: 'User',
            description: 'Standard user with basic data access',
            status: 'active',
            permissions: ['Read Data', 'Write Data'],
            userCount: 156
        },
        {
            id: 4,
            name: 'Viewer',
            description: 'Read-only access to data',
            status: 'active',
            permissions: ['Read Data'],
            userCount: 89
        },
        {
            id: 5,
            name: 'Guest',
            description: 'Limited access for external users',
            status: 'inactive',
            permissions: ['Read Data'],
            userCount: 0
        }
    ];

    const rolesGrid = $('#roles-grid');
    rolesGrid.empty();

    roles.forEach(role => {
        const roleHtml = `
            <div class="role-card">
                <div class="role-header">
                    <h4>${role.name}</h4>
                    <div class="role-status ${role.status}">
                        <span>${role.status}</span>
                    </div>
                </div>
                <div class="role-description">
                    ${role.description}
                </div>
                <div class="role-permissions">
                    <h5>Permissions</h5>
                    <div class="permissions-list">
                        ${role.permissions.map(perm => `<span class="permission-tag">${perm}</span>`).join('')}
                    </div>
                </div>
                <div class="role-stats">
                    <span>${role.userCount} users</span>
                </div>
                <div class="role-actions">
                    <button class="btn-role-action btn-edit-role" onclick="editRole(${role.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn-role-action btn-manage-permissions" onclick="manageRolePermissions(${role.id})">
                        <i class="fas fa-key"></i> Permissions
                    </button>
                    <button class="btn-role-action btn-delete-role" onclick="deleteRole(${role.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
        rolesGrid.append(roleHtml);
    });
}

function filterRoles() {
    const searchTerm = $('#role-search').val().toLowerCase();

    $('.role-card').each(function() {
        const card = $(this);
        const roleName = card.find('h4').text().toLowerCase();
        const roleDescription = card.find('.role-description').text().toLowerCase();

        const isVisible = roleName.includes(searchTerm) || roleDescription.includes(searchTerm);
        card.toggle(isVisible);
    });
}

function loadGroups() {
    // Mock groups data
    const groups = [
        {
            id: 1,
            name: 'IT Department',
            description: 'Information Technology team members',
            status: 'active',
            members: ['John Doe', 'Jane Smith', 'Bob Johnson'],
            memberCount: 15
        },
        {
            id: 2,
            name: 'Marketing Team',
            description: 'Marketing and sales team',
            status: 'active',
            members: ['Alice Williams', 'Charlie Brown'],
            memberCount: 8
        },
        {
            id: 3,
            name: 'Finance Group',
            description: 'Finance and accounting personnel',
            status: 'active',
            members: ['David Wilson', 'Eva Davis'],
            memberCount: 6
        },
        {
            id: 4,
            name: 'External Consultants',
            description: 'External consultants and contractors',
            status: 'inactive',
            members: [],
            memberCount: 0
        }
    ];

    const groupsGrid = $('#groups-grid');
    groupsGrid.empty();

    groups.forEach(group => {
        const groupHtml = `
            <div class="group-card">
                <div class="group-header">
                    <h4>${group.name}</h4>
                    <div class="group-status ${group.status}">
                        <span>${group.status}</span>
                    </div>
                </div>
                <div class="group-description">
                    ${group.description}
                </div>
                <div class="group-members">
                    <h5>Members (${group.memberCount})</h5>
                    <div class="members-list">
                        ${group.members.slice(0, 3).map(member => `<span class="member-tag">${member}</span>`).join('')}
                        ${group.members.length > 3 ? `<span class="member-tag">+${group.members.length - 3} more</span>` : ''}
                    </div>
                </div>
                <div class="group-actions">
                    <button class="btn-group-action btn-edit-group" onclick="editGroup(${group.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn-group-action btn-manage-members" onclick="manageGroupMembers(${group.id})">
                        <i class="fas fa-users"></i> Members
                    </button>
                    <button class="btn-group-action btn-delete-group" onclick="deleteGroup(${group.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
        groupsGrid.append(groupHtml);
    });
}

function filterGroups() {
    const searchTerm = $('#group-search').val().toLowerCase();

    $('.group-card').each(function() {
        const card = $(this);
        const groupName = card.find('h4').text().toLowerCase();
        const groupDescription = card.find('.group-description').text().toLowerCase();

        const isVisible = groupName.includes(searchTerm) || groupDescription.includes(searchTerm);
        card.toggle(isVisible);
    });
}

function initializeUserCharts() {
    // Initialize Chart.js charts (mock implementation)
    initializeRegistrationChart();
    initializeActivityHeatmap();
    initializeLoginFrequencyChart();
}

function initializeRegistrationChart() {
    // Mock registration chart
    const ctx = document.getElementById('registration-chart');
    if (!ctx) return;

    const chartHtml = `
        <div style="height: 200px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; color: white;">
            <div style="text-align: center;">
                <i class="fas fa-chart-line" style="font-size: 48px; margin-bottom: 10px;"></i>
                <div>User Registration Trend</div>
                <div style="font-size: 12px; opacity: 0.8;">Interactive chart would be displayed here</div>
            </div>
        </div>
    `;

    $(ctx).replaceWith(chartHtml);
}

function initializeActivityHeatmap() {
    // Mock activity heatmap
    const ctx = document.getElementById('activity-heatmap');
    if (!ctx) return;

    const chartHtml = `
        <div style="height: 200px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 8px; color: white;">
            <div style="text-align: center;">
                <i class="fas fa-calendar-alt" style="font-size: 48px; margin-bottom: 10px;"></i>
                <div>User Activity Heatmap</div>
                <div style="font-size: 12px; opacity: 0.8;">Interactive chart would be displayed here</div>
            </div>
        </div>
    `;

    $(ctx).replaceWith(chartHtml);
}

function initializeLoginFrequencyChart() {
    // Mock login frequency chart
    const ctx = document.getElementById('login-frequency-chart');
    if (!ctx) return;

    const chartHtml = `
        <div style="height: 200px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); border-radius: 8px; color: white;">
            <div style="text-align: center;">
                <i class="fas fa-chart-bar" style="font-size: 48px; margin-bottom: 10px;"></i>
                <div>Login Frequency Chart</div>
                <div style="font-size: 12px; opacity: 0.8;">Interactive chart would be displayed here</div>
            </div>
        </div>
    `;

    $(ctx).replaceWith(chartHtml);
}

function startUserMonitoring() {
    // Simulate real-time user monitoring updates
    setInterval(() => {
        // Randomly update some metrics
        if (Math.random() > 0.9) {
            const currentUsers = parseInt($('#total-users').text());
            const newUsers = currentUsers + Math.floor(Math.random() * 3);
            $('#total-users').text(newUsers);
        }

        // Update active users
        if (Math.random() > 0.95) {
            const currentActive = parseInt($('#active-users').text());
            const change = Math.random() > 0.5 ? 1 : -1;
            const newActive = Math.max(0, currentActive + change);
            $('#active-users').text(newActive);
        }
    }, 30000); // Update every 30 seconds
}

function openAddUserModal() {
    $('#addUserModal').modal('show');
    // Reset form
    $('#add-user-form')[0].reset();
}

function createUser() {
    const userData = {
        firstName: $('#user-first-name').val(),
        lastName: $('#user-last-name').val(),
        email: $('#user-email').val(),
        phone: $('#user-phone').val(),
        role: $('#user-role').val(),
        department: $('#user-department').val(),
        notes: $('#user-notes').val(),
        sendInvite: $('#send-invite').is(':checked')
    };

    if (!userData.firstName || !userData.lastName || !userData.email || !userData.role) {
        showNotification('Please fill in all required fields', 'warning');
        return;
    }

    // Mock user creation
    showNotification(`Creating user ${userData.firstName} ${userData.lastName}...`, 'info');

    $('#addUserModal').modal('hide');

    setTimeout(() => {
        showNotification(`User "${userData.firstName} ${userData.lastName}" created successfully!`, 'success');
        loadUsers();
        updateUserStats();
    }, 2000);
}

function viewUser(userId) {
    showNotification(`Viewing details for user ${userId}`, 'info');
    // In real app, this would open a user details modal
}

function editUser(userId) {
    showNotification(`Editing user ${userId}`, 'info');
    // In real app, this would open an edit user modal
}

function deleteUser(userId) {
    if (confirm(`Are you sure you want to delete user ${userId}?`)) {
        showNotification(`Deleting user ${userId}...`, 'info');

        setTimeout(() => {
            showNotification(`User ${userId} deleted successfully!`, 'success');
            loadUsers();
            updateUserStats();
        }, 1000);
    }
}

function openCreateRoleModal() {
    $('#createRoleModal').modal('show');
    // Reset form
    $('#create-role-form')[0].reset();
    // Reset checkboxes
    $('#create-role-form input[type="checkbox"]').prop('checked', false);
}

function createRole() {
    const roleData = {
        name: $('#role-name').val(),
        description: $('#role-description').val(),
        permissions: []
    };

    // Collect selected permissions
    $('#create-role-form input[type="checkbox"]:checked').each(function() {
        roleData.permissions.push($(this).attr('id').replace('perm-', ''));
    });

    if (!roleData.name) {
        showNotification('Please enter a role name', 'warning');
        return;
    }

    // Mock role creation
    showNotification(`Creating role "${roleData.name}"...`, 'info');

    $('#createRoleModal').modal('hide');

    setTimeout(() => {
        showNotification(`Role "${roleData.name}" created successfully!`, 'success');
        loadRoles();
    }, 2000);
}

function editRole(roleId) {
    showNotification(`Editing role ${roleId}`, 'info');
    // In real app, this would open an edit role modal
}

function manageRolePermissions(roleId) {
    showNotification(`Managing permissions for role ${roleId}`, 'info');
    // In real app, this would open a permissions management modal
}

function deleteRole(roleId) {
    if (confirm(`Are you sure you want to delete role ${roleId}?`)) {
        showNotification(`Deleting role ${roleId}...`, 'info');

        setTimeout(() => {
            showNotification(`Role ${roleId} deleted successfully!`, 'success');
            loadRoles();
        }, 1000);
    }
}

function openCreateGroupModal() {
    showNotification('Create group feature coming soon!', 'info');
    // In real app, this would open a create group modal
}

function editGroup(groupId) {
    showNotification(`Editing group ${groupId}`, 'info');
    // In real app, this would open an edit group modal
}

function manageGroupMembers(groupId) {
    showNotification(`Managing members for group ${groupId}`, 'info');
    // In real app, this would open a group members management modal
}

function deleteGroup(groupId) {
    if (confirm(`Are you sure you want to delete group ${groupId}?`)) {
        showNotification(`Deleting group ${groupId}...`, 'info');

        setTimeout(() => {
            showNotification(`Group ${groupId} deleted successfully!`, 'success');
            loadGroups();
        }, 1000);
    }
}

function importUsers() {
    showNotification('Import users feature coming soon!', 'info');
    // In real app, this would open a file upload dialog
}

function exportUsers() {
    showNotification('Exporting users...', 'info');

    setTimeout(() => {
        showNotification('Users exported successfully!', 'success');
    }, 2000);
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