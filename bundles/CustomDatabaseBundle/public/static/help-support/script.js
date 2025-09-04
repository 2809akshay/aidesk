// Help & Support Page JavaScript Functions
$(document).ready(function() {
    // Initialize help & support interface
    initializeHelpSupport();

    // Load help data
    loadHelpData();

    // Set up event listeners
    setupHelpSupportEventListeners();

    // Initialize FAQ accordion
    initializeFAQ();
});

// Initialize Help & Support Interface
function initializeHelpSupport() {
    // Initialize interface components
    updateTicketStats();
    loadRecentTickets();
}

// Load Help Data
function loadHelpData() {
    // Simulate loading help data
    setTimeout(() => {
        showNotification('Help resources loaded successfully', 'success');
    }, 1000);
}

// Setup Event Listeners
function setupHelpSupportEventListeners() {
    // Search functionality
    $('#help-search').on('input', function() {
        searchHelp();
    });

    $('#help-search').on('keypress', function(e) {
        if (e.which === 13) {
            searchHelp();
        }
    });

    // Category clicks
    $('.help-category-card').click(function() {
        const category = $(this).data('category');
        openCategory(category);
    });

    // Article clicks
    $('.article-card').click(function() {
        const article = $(this).data('article');
        openArticle(article);
    });

    // Ticket clicks
    $('.ticket-item').click(function() {
        const ticketId = $(this).data('ticket');
        viewTicket(ticketId);
    });

    // FAQ toggle
    $('.faq-question').click(function() {
        toggleFaq(this);
    });

    // Contact buttons
    $('.btn-contact').click(function() {
        const contactType = $(this).data('contact');
        switch(contactType) {
            case 'email':
                emailSupport();
                break;
            case 'phone':
                callSupport();
                break;
            case 'chat':
                startLiveChat();
                break;
            case 'community':
                openCommunity();
                break;
        }
    });
}

// Search Help
function searchHelp() {
    const query = $('#help-search').val().trim();

    if (!query) {
        showNotification('Please enter a search term', 'warning');
        return;
    }

    showNotification(`Searching for "${query}"...`, 'info');

    // Simulate search
    setTimeout(() => {
        const results = Math.floor(Math.random() * 20) + 5;
        showNotification(`Found ${results} results for "${query}"`, 'success');
    }, 1000);
}

// Open Category
function openCategory(category) {
    showNotification(`Opening ${category} category...`, 'info');

    // Simulate opening category
    setTimeout(() => {
        showNotification(`${category} category opened`, 'success');
    }, 500);
}

// Open Article
function openArticle(article) {
    showNotification(`Opening article: ${article}...`, 'info');

    // Simulate opening article
    setTimeout(() => {
        showNotification(`Article "${article}" opened`, 'success');
    }, 500);
}

// View Ticket
function viewTicket(ticketId) {
    showNotification(`Opening ticket #${ticketId}...`, 'info');

    // Simulate opening ticket
    setTimeout(() => {
        showNotification(`Ticket #${ticketId} opened`, 'success');
    }, 500);
}

// Toggle FAQ
function toggleFaq(element) {
    const faqItem = $(element).closest('.faq-item');
    const faqAnswer = faqItem.find('.faq-answer');
    const faqIcon = faqItem.find('.faq-icon i');

    if (faqAnswer.height() > 0) {
        faqAnswer.css('max-height', '0');
        faqIcon.css('transform', 'rotate(0deg)');
    } else {
        const contentHeight = faqAnswer.find('p').outerHeight();
        faqAnswer.css('max-height', contentHeight + 'px');
        faqIcon.css('transform', 'rotate(180deg)');
    }
}

// Initialize FAQ
function initializeFAQ() {
    // Set initial state for FAQ items
    $('.faq-answer').css('max-height', '0');
}

// Contact Support
function contactSupport() {
    showNotification('Opening contact support form...', 'info');

    // Simulate opening contact form
    setTimeout(() => {
        showNotification('Contact support form opened', 'success');
    }, 500);
}

// Submit Ticket
function submitTicket() {
    showNotification('Opening ticket submission form...', 'info');

    // Simulate opening ticket form
    setTimeout(() => {
        showNotification('Ticket submission form opened', 'success');
    }, 500);
}

// Email Support
function emailSupport() {
    const email = 'support@company.com';
    const subject = 'Support Request';
    const body = 'Please describe your issue here...';

    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;

    showNotification('Opening email client...', 'info');
}

// Call Support
function callSupport() {
    const phone = '1-800-SUPPORT';
    showNotification(`Please call our support line: ${phone}`, 'info');
}

// Start Live Chat
function startLiveChat() {
    showNotification('Connecting to live chat...', 'info');

    // Simulate chat connection
    setTimeout(() => {
        showNotification('Connected to live chat support', 'success');
    }, 2000);
}

// Open Community
function openCommunity() {
    const communityUrl = 'https://community.company.com';
    window.open(communityUrl, '_blank');
    showNotification('Opening community forum...', 'info');
}

// Watch Tutorials
function watchTutorials() {
    showNotification('Opening video tutorials...', 'info');

    // Simulate opening tutorials
    setTimeout(() => {
        showNotification('Video tutorials opened', 'success');
    }, 500);
}

// Update Ticket Stats
function updateTicketStats() {
    // Simulate updating ticket statistics
    const stats = {
        openTickets: Math.floor(Math.random() * 20) + 5,
        pendingTickets: Math.floor(Math.random() * 10) + 2,
        resolvedTickets: Math.floor(Math.random() * 100) + 30,
        avgResponse: (Math.random() * 2 + 1).toFixed(1) + 'h'
    };

    $('#open-tickets').text(stats.openTickets);
    $('#pending-tickets').text(stats.pendingTickets);
    $('#resolved-tickets').text(stats.resolvedTickets);
    $('#avg-response').text(stats.avgResponse);
}

// Load Recent Tickets
function loadRecentTickets() {
    // Simulate loading recent tickets
    const tickets = [
        {
            id: 1001,
            title: 'Database connection timeout issue',
            time: '2 hours ago',
            status: 'open'
        },
        {
            id: 998,
            title: 'Import feature not working with large files',
            time: '1 day ago',
            status: 'pending'
        },
        {
            id: 995,
            title: 'API authentication setup help',
            time: '2 days ago',
            status: 'resolved'
        }
    ];

    const ticketsList = $('.tickets-list');
    ticketsList.empty();

    tickets.forEach(ticket => {
        const ticketHtml = `
            <div class="ticket-item" data-ticket="${ticket.id}" onclick="viewTicket(${ticket.id})">
                <div class="ticket-info">
                    <h5>${ticket.title}</h5>
                    <span class="ticket-meta">Ticket #${ticket.id} • ${ticket.time}</span>
                </div>
                <div class="ticket-status ${ticket.status}">
                    <span>${ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}</span>
                </div>
            </div>
        `;
        ticketsList.append(ticketHtml);
    });
}

// System Status Functions
function refreshSystemStatus() {
    showNotification('Refreshing system status...', 'info');

    // Simulate status refresh
    setTimeout(() => {
        updateSystemStatus();
        showNotification('System status updated', 'success');
    }, 1000);
}

function updateSystemStatus() {
    // Simulate updating system status
    $('.status-indicator').each(function() {
        const statuses = ['operational', 'maintenance', 'operational'];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

        $(this).removeClass('operational maintenance outage');
        $(this).addClass(randomStatus);

        const statusText = randomStatus === 'operational' ? 'All systems operational' :
                          randomStatus === 'maintenance' ? 'Scheduled maintenance in progress' :
                          'Service temporarily unavailable';

        $(this).closest('.status-item').find('.status-info span').text(statusText);
    });
}

// Notification System
function showNotification(message, type = 'info') {
    // Remove existing notifications
    $('.notification').remove();

    // Create notification element
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
        notification.fadeOut(300, function() {
            $(this).remove();
        });
    }, 5000);
}

// Initialize on page load
$(document).ready(function() {
    // Initialize tooltips if Bootstrap tooltips are available
    if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
        var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }

    // Initialize popovers if Bootstrap popovers are available
    if (typeof bootstrap !== 'undefined' && bootstrap.Popover) {
        var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
        var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
            return new bootstrap.Popover(popoverTriggerEl);
        });
    }

    // Initialize FAQ
    initializeFAQ();

    // Set up periodic status updates
    setInterval(updateSystemStatus, 60000); // Update every minute

    // Set up periodic ticket stats updates
    setInterval(updateTicketStats, 30000); // Update every 30 seconds
});