// Analytics Page JavaScript Functions
$(document).ready(function() {
    // Initialize analytics interface
    initializeAnalytics();

    // Load analytics data
    loadAnalyticsData();

    // Set up event listeners
    setupAnalyticsEventListeners();

    // Initialize charts
    initializeCharts();
});

// Initialize Analytics Interface
function initializeAnalytics() {
    // Set default time range
    setTimeRange('7d');

    // Update real-time data
    updateRealTimeData();

    // Start real-time updates
    setInterval(updateRealTimeData, 30000); // Update every 30 seconds
}

// Load Analytics Data
function loadAnalyticsData() {
    // Simulate loading analytics data
    setTimeout(() => {
        updateAnalyticsStats();
        updateCharts();
        showNotification('Analytics data loaded successfully', 'success');
    }, 1000);
}

// Setup Event Listeners
function setupAnalyticsEventListeners() {
    // Time range buttons
    $('.btn-time-range').click(function() {
        $('.btn-time-range').removeClass('active');
        $(this).addClass('active');

        const range = $(this).data('range');
        setTimeRange(range);
    });

    // Custom date range
    $('#start-date, #end-date').change(function() {
        if ($('#start-date').val() && $('#end-date').val()) {
            $('#custom-date-range').show();
        }
    });

    // Chart refresh buttons
    $('.btn-card-action').click(function() {
        const action = $(this).data('action');
        if (action === 'refresh') {
            refreshChart($(this).closest('.dashboard-card').attr('id'));
        } else if (action === 'fullscreen') {
            fullscreenChart($(this).closest('.dashboard-card').attr('id'));
        }
    });

    // Report actions
    $('.btn-view-report').click(function() {
        const reportType = $(this).data('report');
        viewReport(reportType);
    });

    $('.btn-export-report').click(function() {
        const reportType = $(this).data('report');
        exportReport(reportType);
    });
}

// Set Time Range
function setTimeRange(range) {
    $('.btn-time-range').removeClass('active');
    $(`.btn-time-range[data-range="${range}"]`).addClass('active');

    if (range === 'custom') {
        $('#custom-date-range').show();
    } else {
        $('#custom-date-range').hide();
        loadDataForRange(range);
    }
}

// Apply Custom Date Range
function applyCustomRange() {
    const startDate = $('#start-date').val();
    const endDate = $('#end-date').val();

    if (!startDate || !endDate) {
        showNotification('Please select both start and end dates', 'warning');
        return;
    }

    if (new Date(startDate) > new Date(endDate)) {
        showNotification('Start date cannot be after end date', 'error');
        return;
    }

    loadDataForRange('custom', startDate, endDate);
    showNotification('Custom date range applied', 'success');
}

// Load Data for Range
function loadDataForRange(range, startDate = null, endDate = null) {
    showNotification(`Loading data for ${range}...`, 'info');

    // Simulate data loading
    setTimeout(() => {
        updateAnalyticsStats();
        updateCharts();
        showNotification(`Data loaded for ${range}`, 'success');
    }, 1500);
}

// Update Analytics Stats
function updateAnalyticsStats() {
    // Simulate updating statistics
    const stats = {
        pageViews: Math.floor(Math.random() * 10000) + 120000,
        activeUsers: Math.floor(Math.random() * 1000) + 8000,
        sessionDuration: Math.floor(Math.random() * 60) + 240, // seconds
        conversionRate: (Math.random() * 2 + 2).toFixed(2)
    };

    $('#total-page-views').text(stats.pageViews.toLocaleString());
    $('#active-users').text(stats.activeUsers.toLocaleString());
    $('#avg-session').text(formatDuration(stats.sessionDuration));
    $('#conversion-rate').text(stats.conversionRate + '%');

    // Update trend indicators
    updateTrends();
}

// Update Trends
function updateTrends() {
    $('.stat-trend').each(function() {
        const trend = Math.random() > 0.5 ? 'positive' : 'negative';
        const percentage = (Math.random() * 10 + 1).toFixed(1);

        $(this).removeClass('positive negative');
        $(this).addClass(trend);

        const icon = trend === 'positive' ? 'arrow-up' : 'arrow-down';
        $(this).html(`<i class="fas fa-${icon}"></i> ${percentage}%`);
    });
}

// Format Duration
function formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
}

// Initialize Charts
function initializeCharts() {
    // Initialize Chart.js if available
    if (typeof Chart !== 'undefined') {
        createTrafficChart();
        createDemographicsChart();
        createRevenueChart();
        createPerformanceChart();
    } else {
        // Fallback for when Chart.js is not loaded
        console.log('Chart.js not available, using placeholder charts');
    }
}

// Create Traffic Chart
function createTrafficChart() {
    const ctx = document.getElementById('traffic-chart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Page Views',
                data: [1200, 1900, 3000, 5000, 2000, 3000, 4000],
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        display: false
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Create Demographics Chart
function createDemographicsChart() {
    const ctx = document.getElementById('demographics-chart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['18-24', '25-34', '35-44', '45+'],
            datasets: [{
                data: [25, 35, 28, 12],
                backgroundColor: [
                    '#667eea',
                    '#764ba2',
                    '#f093fb',
                    '#f5576c'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// Create Revenue Chart
function createRevenueChart() {
    const ctx = document.getElementById('revenue-chart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Revenue',
                data: [12000, 19000, 15000, 25000, 22000, 30000],
                backgroundColor: '#667eea',
                borderRadius: 4,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        display: false
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Create Performance Chart
function createPerformanceChart() {
    const ctx = document.getElementById('performance-chart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Speed', 'SEO', 'Accessibility', 'Best Practices', 'Performance'],
            datasets: [{
                label: 'Score',
                data: [85, 92, 88, 95, 78],
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                pointBackgroundColor: '#667eea',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#667eea'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}

// Update Charts
function updateCharts() {
    // Refresh all charts with new data
    if (typeof Chart !== 'undefined') {
        // Update chart data here
        console.log('Charts updated');
    }
}

// Refresh Chart
function refreshChart(chartId) {
    showNotification(`Refreshing ${chartId}...`, 'info');

    setTimeout(() => {
        // Simulate chart refresh
        updateCharts();
        showNotification(`${chartId} refreshed`, 'success');
    }, 1000);
}

// Fullscreen Chart
function fullscreenChart(chartId) {
    const chartCard = $(`#${chartId}`);
    const chartContent = chartCard.find('.card-content');

    if (chartCard.hasClass('fullscreen')) {
        chartCard.removeClass('fullscreen');
        chartContent.css('height', '');
        showNotification('Exited fullscreen mode', 'info');
    } else {
        chartCard.addClass('fullscreen');
        chartContent.css('height', '80vh');
        showNotification('Entered fullscreen mode', 'info');
    }
}

// Create New Report
function createNewReport() {
    $('#createReportModal').modal('show');
}

// Generate Report
function generateReport() {
    const reportName = $('#report-name').val();
    const reportType = $('#report-type').val();
    const reportDescription = $('#report-description').val();
    const dateRange = $('#date-range').val();
    const reportFormat = $('#report-format').val();
    const scheduleReport = $('#schedule-report').val();

    if (!reportName || !reportType) {
        showNotification('Please fill in all required fields', 'warning');
        return;
    }

    showNotification('Generating report...', 'info');

    // Simulate report generation
    setTimeout(() => {
        $('#createReportModal').modal('hide');
        showNotification(`Report "${reportName}" created successfully`, 'success');

        // Reset form
        $('#create-report-form')[0].reset();
    }, 2000);
}

// View Report
function viewReport(reportType) {
    showNotification(`Opening ${reportType} report...`, 'info');

    // Simulate opening report
    setTimeout(() => {
        showNotification(`${reportType} report opened`, 'success');
    }, 1000);
}

// Export Report
function exportReport(reportType) {
    showNotification(`Exporting ${reportType} report...`, 'info');

    // Simulate export
    setTimeout(() => {
        showNotification(`${reportType} report exported successfully`, 'success');
    }, 1500);
}

// Export Analytics
function exportAnalytics() {
    const format = prompt('Choose export format (CSV, PDF, Excel):', 'CSV');

    if (!format) return;

    showNotification(`Exporting analytics data as ${format}...`, 'info');

    // Simulate export
    setTimeout(() => {
        showNotification(`Analytics data exported as ${format}`, 'success');
    }, 2000);
}

// Update Real-time Data
function updateRealTimeData() {
    // Simulate real-time updates
    const liveVisitors = Math.floor(Math.random() * 500) + 200;
    const activeSessions = Math.floor(Math.random() * 2000) + 1000;
    const conversionEvents = Math.floor(Math.random() * 50) + 10;
    const errorRate = (Math.random() * 0.1).toFixed(3);

    $('#live-visitors').text(liveVisitors);
    $('#active-sessions').text(activeSessions);
    $('#conversion-events').text(conversionEvents);
    $('#error-rate').text(errorRate + '%');
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
});