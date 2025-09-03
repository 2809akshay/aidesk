// Analytics JavaScript Functions
$(document).ready(function() {
    // Initialize the analytics dashboard
    initializeAnalytics();

    // Load analytics data
    loadAnalyticsData();

    // Set up event listeners
    setupAnalyticsEventListeners();

    // Initialize charts
    initializeCharts();

    // Start real-time updates
    startRealTimeUpdates();
});

function initializeAnalytics() {
    // Initialize analytics dashboard
    updateAnalyticsStats();
    loadTrafficData();
    loadDemographicsData();
    loadRevenueData();
    loadPerformanceData();
    loadTopPagesData();
    loadGeographicData();
    loadCustomReports();
}

function loadAnalyticsData() {
    // Load all analytics data
    updateRealTimeMetrics();
}

function setupAnalyticsEventListeners() {
    // Time range buttons
    $('.btn-time-range').click(function() {
        $('.btn-time-range').removeClass('active');
        $(this).addClass('active');

        const range = $(this).text().toLowerCase().replace(' ', '');
        if (range === 'custom') {
            $('#custom-date-range').show();
        } else {
            $('#custom-date-range').hide();
            setTimeRange(range);
        }
    });

    // Custom date range
    $('#start-date, #end-date').change(function() {
        // Handle custom date range changes
    });
}

function updateAnalyticsStats() {
    // Mock analytics statistics
    const stats = {
        pageViews: 125430,
        activeUsers: 8542,
        avgSession: '4m 32s',
        conversionRate: 3.24
    };

    $('#total-page-views').text(stats.pageViews.toLocaleString());
    $('#active-users').text(stats.activeUsers.toLocaleString());
    $('#avg-session').text(stats.avgSession);
    $('#conversion-rate').text(stats.conversionRate + '%');

    // Add trend indicators
    updateTrendIndicators();
}

function updateTrendIndicators() {
    // Mock trend data
    const trends = {
        pageViews: 12.5,
        activeUsers: 8.2,
        avgSession: -2.1,
        conversionRate: 5.7
    };

    // Update trend displays (already in HTML)
}

function setTimeRange(range) {
    showNotification(`Time range set to: ${range}`, 'info');
    // In real app, this would reload data for the selected time range
    refreshAllCharts();
}

function applyCustomRange() {
    const startDate = $('#start-date').val();
    const endDate = $('#end-date').val();

    if (!startDate || !endDate) {
        showNotification('Please select both start and end dates', 'warning');
        return;
    }

    showNotification(`Custom date range applied: ${startDate} to ${endDate}`, 'success');
    refreshAllCharts();
}

function initializeCharts() {
    // Initialize Chart.js charts (mock implementation)
    initializeTrafficChart();
    initializeDemographicsChart();
    initializeRevenueChart();
}

function initializeTrafficChart() {
    // Mock traffic chart data
    const ctx = document.getElementById('traffic-chart');
    if (!ctx) return;

    // In real app, this would use Chart.js
    const chartHtml = `
        <div style="height: 200px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; color: white;">
            <div style="text-align: center;">
                <i class="fas fa-chart-line" style="font-size: 48px; margin-bottom: 10px;"></i>
                <div>Traffic Analytics Chart</div>
                <div style="font-size: 12px; opacity: 0.8;">Interactive chart would be displayed here</div>
            </div>
        </div>
    `;

    $(ctx).replaceWith(chartHtml);
}

function initializeDemographicsChart() {
    // Mock demographics chart
    const ctx = document.getElementById('demographics-chart');
    if (!ctx) return;

    const chartHtml = `
        <div style="height: 200px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 8px; color: white;">
            <div style="text-align: center;">
                <i class="fas fa-chart-pie" style="font-size: 48px; margin-bottom: 10px;"></i>
                <div>Demographics Chart</div>
                <div style="font-size: 12px; opacity: 0.8;">Age distribution visualization</div>
            </div>
        </div>
    `;

    $(ctx).replaceWith(chartHtml);
}

function initializeRevenueChart() {
    // Mock revenue chart
    const ctx = document.getElementById('revenue-chart');
    if (!ctx) return;

    const chartHtml = `
        <div style="height: 150px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); border-radius: 8px; color: white;">
            <div style="text-align: center;">
                <i class="fas fa-chart-bar" style="font-size: 36px; margin-bottom: 10px;"></i>
                <div>Revenue Trend</div>
                <div style="font-size: 12px; opacity: 0.8;">Monthly revenue chart</div>
            </div>
        </div>
    `;

    $(ctx).replaceWith(chartHtml);
}

function refreshTrafficChart() {
    showNotification('Refreshing traffic chart...', 'info');
    setTimeout(() => {
        showNotification('Traffic chart updated!', 'success');
    }, 1000);
}

function refreshDemographics() {
    showNotification('Refreshing demographics data...', 'info');
    setTimeout(() => {
        showNotification('Demographics data updated!', 'success');
    }, 1000);
}

function refreshRevenueChart() {
    showNotification('Refreshing revenue chart...', 'info');
    setTimeout(() => {
        showNotification('Revenue chart updated!', 'success');
    }, 1000);
}

function refreshPerformance() {
    showNotification('Refreshing performance metrics...', 'info');
    setTimeout(() => {
        showNotification('Performance metrics updated!', 'success');
    }, 1000);
}

function refreshTopPages() {
    showNotification('Refreshing top pages data...', 'info');
    setTimeout(() => {
        showNotification('Top pages data updated!', 'success');
    }, 1000);
}

function refreshGeographic() {
    showNotification('Refreshing geographic data...', 'info');
    setTimeout(() => {
        showNotification('Geographic data updated!', 'success');
    }, 1000);
}

function refreshAllCharts() {
    refreshTrafficChart();
    refreshDemographics();
    refreshRevenueChart();
    refreshPerformance();
    refreshTopPages();
    refreshGeographic();
}

function fullscreenChart(chartType) {
    showNotification(`Fullscreen mode for ${chartType} chart coming soon!`, 'info');
}

function loadTrafficData() {
    // Mock traffic data loading
    showNotification('Traffic data loaded', 'success');
}

function loadDemographicsData() {
    // Mock demographics data loading
    showNotification('Demographics data loaded', 'success');
}

function loadRevenueData() {
    // Mock revenue data loading
    showNotification('Revenue data loaded', 'success');
}

function loadPerformanceData() {
    // Mock performance data loading
    showNotification('Performance data loaded', 'success');
}

function loadTopPagesData() {
    // Mock top pages data loading
    showNotification('Top pages data loaded', 'success');
}

function loadGeographicData() {
    // Mock geographic data loading
    showNotification('Geographic data loaded', 'success');
}

function loadCustomReports() {
    // Mock custom reports loading
    showNotification('Custom reports loaded', 'success');
}

function updateRealTimeMetrics() {
    // Mock real-time metrics
    const metrics = {
        liveVisitors: 247,
        activeSessions: 1432,
        conversionEvents: 23,
        errorRate: '0.02%'
    };

    $('#live-visitors').text(metrics.liveVisitors);
    $('#active-sessions').text(metrics.activeSessions.toLocaleString());
    $('#conversion-events').text(metrics.conversionEvents);
    $('#error-rate').text(metrics.errorRate);
}

function startRealTimeUpdates() {
    // Simulate real-time updates
    setInterval(() => {
        updateRealTimeMetrics();

        // Randomly update some stats
        if (Math.random() > 0.7) {
            const currentViews = parseInt($('#total-page-views').text().replace(/,/g, ''));
            const newViews = currentViews + Math.floor(Math.random() * 10);
            $('#total-page-views').text(newViews.toLocaleString());
        }

        if (Math.random() > 0.8) {
            const currentUsers = parseInt($('#active-users').text().replace(/,/g, ''));
            const newUsers = Math.max(0, currentUsers + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 5));
            $('#active-users').text(newUsers.toLocaleString());
        }
    }, 5000); // Update every 5 seconds
}

function createNewReport() {
    $('#createReportModal').modal('show');
}

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

    // Mock report generation
    showNotification(`Generating ${reportType} report: ${reportName}...`, 'info');

    $('#createReportModal').modal('hide');

    setTimeout(() => {
        showNotification(`Report "${reportName}" generated successfully!`, 'success');
    }, 3000);
}

function viewReport(reportType) {
    showNotification(`Viewing ${reportType} report...`, 'info');
    // In real app, this would open the report in a new tab or modal
}

function exportReport(reportType) {
    showNotification(`Exporting ${reportType} report...`, 'info');
    setTimeout(() => {
        showNotification(`${reportType} report exported successfully!`, 'success');
    }, 2000);
}

function exportAnalytics() {
    showNotification('Exporting analytics data...', 'info');
    setTimeout(() => {
        showNotification('Analytics data exported successfully!', 'success');
    }, 3000);
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