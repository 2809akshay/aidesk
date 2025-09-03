// Help & Support JavaScript Functions
$(document).ready(function() {
    // Initialize the help & support interface
    initializeHelpSupport();

    // Load help data
    loadHelpData();

    // Set up event listeners
    setupHelpEventListeners();

    // Initialize search functionality
    initializeHelpSearch();

    // Load support tickets
    loadSupportTickets();
});

function initializeHelpSupport() {
    // Initialize help & support interface
    updateSupportStats();
}

function loadHelpData() {
    // Load all help-related data
    loadPopularArticles();
    loadFaqData();
}

function setupHelpEventListeners() {
    // Help search functionality
    $('#help-search').on('input', function() {
        searchHelpTopics();
    });

    // FAQ toggle functionality
    $('.faq-question').click(function() {
        toggleFaq(this);
    });
}

function searchHelp() {
    const query = $('#help-search').val().trim();
    if (query) {
        showNotification(`Searching for: "${query}"`, 'info');
        // In real app, this would perform actual search
        setTimeout(() => {
            showNotification(`Found 15 results for "${query}"`, 'success');
        }, 1000);
    } else {
        showNotification('Please enter a search term', 'warning');
    }
}

function searchHelpTopics() {
    const query = $('#help-search').val().toLowerCase();
    if (query.length > 2) {
        // Highlight matching categories
        $('.help-category-card').each(function() {
            const card = $(this);
            const title = card.find('h4').text().toLowerCase();
            const description = card.find('p').text().toLowerCase();

            if (title.includes(query) || description.includes(query)) {
                card.addClass('highlight');
            } else {
                card.removeClass('highlight');
            }
        });
    } else {
        $('.help-category-card').removeClass('highlight');
    }
}

function watchTutorials() {
    showNotification('Opening video tutorial library...', 'info');
    // In real app, this would open a video player or tutorial page
    setTimeout(() => {
        showNotification('Tutorial library loaded!', 'success');
    }, 1000);
}

function openCommunity() {
    showNotification('Opening community forum...', 'info');
    // In real app, this would redirect to community forum
    setTimeout(() => {
        showNotification('Community forum opened!', 'success');
    }, 1000);
}

function startLiveChat() {
    showNotification('Connecting to live chat...', 'info');
    // In real app, this would open a chat widget
    setTimeout(() => {
        showNotification('Live chat connected! An agent will be with you shortly.', 'success');
    }, 2000);
}

function openCategory(categoryId) {
    showNotification(`Opening ${categoryId.replace('-', ' ')} category...`, 'info');
    // In real app, this would navigate to category page
    setTimeout(() => {
        showNotification(`Loaded ${categoryId.replace('-', ' ')} articles`, 'success');
    }, 1000);
}

function openArticle(articleId) {
    showNotification(`Opening article: ${articleId.replace('-', ' ')}`, 'info');
    // In real app, this would open the article
    setTimeout(() => {
        showNotification('Article opened!', 'success');
    }, 500);
}

function loadPopularArticles() {
    // Articles are already in the HTML, but this could be updated dynamically
    showNotification('Popular articles loaded', 'success');
}

function loadSupportTickets() {
    // Mock support ticket data
    const tickets = {
        open: 12,
        pending: 5,
        resolved: 47,
        avgResponse: '2.3h'
    };

    $('#open-tickets').text(tickets.open);
    $('#pending-tickets').text(tickets.pending);
    $('#resolved-tickets').text(tickets.resolved);
    $('#avg-response').text(tickets.avgResponse);
}

function updateSupportStats() {
    // Stats are loaded in loadSupportTickets()
    showNotification('Support statistics updated', 'success');
}

function loadFaqData() {
    // FAQ data is already in the HTML, but this could be updated dynamically
    showNotification('FAQ data loaded', 'success');
}

function initializeHelpSearch() {
    // Initialize search with debouncing
    let searchTimeout;
    $('#help-search').on('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            performHelpSearch();
        }, 300);
    });
}

function performHelpSearch() {
    const query = $('#help-search').val().trim();
    if (query.length > 2) {
        // Perform search across help content
        const results = searchHelpContent(query);
        displaySearchResults(results);
    } else if (query.length === 0) {
        clearSearchResults();
    }
}

function searchHelpContent(query) {
    // Mock search results
    const mockResults = [
        {
            title: 'How to Connect to Your Database',
            category: 'Getting Started',
            type: 'article',
            relevance: 0.95
        },
        {
            title: 'Database Connection Troubleshooting',
            category: 'Troubleshooting',
            type: 'article',
            relevance: 0.88
        },
        {
            title: 'Import Data from CSV Files',
            category: 'Data Import & Export',
            type: 'video',
            relevance: 0.82
        },
        {
            title: 'API Authentication Setup',
            category: 'API Integration',
            type: 'article',
            relevance: 0.79
        },
        {
            title: 'Backup Best Practices',
            category: 'Backup & Restore',
            type: 'article',
            relevance: 0.75
        }
    ];

    return mockResults.filter(result =>
        result.title.toLowerCase().includes(query.toLowerCase()) ||
        result.category.toLowerCase().includes(query.toLowerCase())
    );
}

function displaySearchResults(results) {
    if (results.length === 0) {
        showNotification('No results found', 'warning');
        return;
    }

    // Create results display
    const resultsHtml = `
        <div class="search-results-overlay" style="
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 10000;
            display: flex;
            align-items: flex-start;
            justify-content: center;
            padding-top: 100px;
        ">
            <div class="search-results" style="
                background: white;
                border-radius: 12px;
                padding: 30px;
                max-width: 600px;
                width: 90%;
                max-height: 70vh;
                overflow-y: auto;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            ">
                <div class="search-header" style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                ">
                    <h3 style="margin: 0; color: var(--dark-color);">Search Results (${results.length})</h3>
                    <button onclick="closeSearchResults()" style="
                        background: none;
                        border: none;
                        font-size: 24px;
                        cursor: pointer;
                        color: #666;
                    ">×</button>
                </div>
                <div class="results-list">
                    ${results.map(result => `
                        <div class="result-item" style="
                            padding: 15px;
                            border: 1px solid #e2e8f0;
                            border-radius: 8px;
                            margin-bottom: 10px;
                            cursor: pointer;
                            transition: all 0.3s ease;
                        " onclick="openSearchResult('${result.title.replace(/'/g, '\\\'')}')">
                            <div class="result-title" style="
                                font-weight: 600;
                                color: var(--dark-color);
                                margin-bottom: 5px;
                            ">${result.title}</div>
                            <div class="result-meta" style="
                                font-size: 12px;
                                color: #666;
                                display: flex;
                                gap: 15px;
                            ">
                                <span>${result.category}</span>
                                <span>${result.type}</span>
                                <span>Relevance: ${Math.round(result.relevance * 100)}%</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

    $('body').append(resultsHtml);
}

function closeSearchResults() {
    $('.search-results-overlay').remove();
}

function clearSearchResults() {
    $('.search-results-overlay').remove();
}

function openSearchResult(title) {
    closeSearchResults();
    showNotification(`Opening: ${title}`, 'info');
    // In real app, this would open the specific result
}

function toggleFaq(element) {
    const faqItem = $(element).closest('.faq-item');
    const faqAnswer = faqItem.find('.faq-answer');
    const faqIcon = faqItem.find('.faq-icon i');

    if (faqAnswer.height() === 0) {
        // Open FAQ
        faqAnswer.css('max-height', faqAnswer.prop('scrollHeight') + 'px');
        faqIcon.css('transform', 'rotate(180deg)');
    } else {
        // Close FAQ
        faqAnswer.css('max-height', '0');
        faqIcon.css('transform', 'rotate(0deg)');
    }
}

function viewTicket(ticketId) {
    showNotification(`Viewing ticket #${ticketId}`, 'info');
    // In real app, this would open ticket details
}

function contactSupport() {
    showNotification('Opening support contact form...', 'info');
    // In real app, this would open a contact form
    setTimeout(() => {
        showNotification('Support contact form opened!', 'success');
    }, 1000);
}

function submitTicket() {
    showNotification('Opening ticket submission form...', 'info');
    // In real app, this would open a ticket form
    setTimeout(() => {
        showNotification('Ticket submission form opened!', 'success');
    }, 1000);
}

function emailSupport() {
    window.location.href = 'mailto:support@company.com?subject=Support Request';
    showNotification('Opening email client...', 'info');
}

function callSupport() {
    window.location.href = 'tel:1-800-SUPPORT';
    showNotification('Initiating phone call...', 'info');
}

function startLiveChat() {
    showNotification('Connecting to live chat...', 'info');
    // In real app, this would open a chat widget
    setTimeout(() => {
        showNotification('Live chat connected! An agent will be with you shortly.', 'success');
    }, 2000);
}

function openCommunity() {
    window.open('https://community.company.com', '_blank');
    showNotification('Opening community forum...', 'info');
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

.highlight {
    background: rgba(74, 110, 224, 0.1) !important;
    border-color: var(--primary-color) !important;
    transform: scale(1.02);
}
</style>
`;

// Append notification styles to head
if (!$('#notification-styles').length) {
    $('head').append(notificationStyle);
}

// Initialize FAQ animations
$(document).ready(function() {
    $('.faq-answer').each(function() {
        $(this).css('max-height', '0');
    });
});