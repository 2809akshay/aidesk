// Privacy Policy JavaScript Functions
(function($) {
    'use strict';

    $(document).ready(function() {
        // Check if jQuery is available
        if (typeof $ === 'undefined') {
            console.error('jQuery is not loaded. Privacy policy script requires jQuery.');
            return;
        }

        // Initialize the privacy policy interface
        initializePrivacyPolicy();

        // Load policy data
        loadPolicyData();

        // Set up event listeners
        setupPolicyEventListeners();

        // Initialize policy navigation
        initializePolicyNavigation();

        // Check user consent status
        checkUserConsent();
    });

    function initializePrivacyPolicy() {
        // Initialize privacy policy interface
        switchPolicySection('information-collection');

        // Show initialization message
        showNotification('Privacy Policy interface initialized', 'info');
    }

    function loadPolicyData() {
        // Load privacy policy data
        loadPolicyMetadata();
        loadPolicySections();
    }

    function setupPolicyEventListeners() {
        // Policy section switching
        $('.policy-tab').off('click').on('click', function(e) {
            e.preventDefault();
            const sectionId = $(this).data('section') || $(this).attr('onclick')?.match(/'([^']+)'/)?.[1];
            if (sectionId) {
                switchPolicySection(sectionId);
            }
        });

        // Policy consent handling
        $('#policy-consent').off('change').on('change', function() {
            handlePolicyConsent();
        });

        // Accept policy button
        $('.btn-accept-policy').off('click').on('click', function() {
            acceptPrivacyPolicy();
        });

        // Decline policy button
        $('.btn-decline-policy').off('click').on('click', function() {
            declinePrivacyPolicy();
        });

        // Print functionality
        $('.btn-print-policy').off('click').on('click', function() {
            printPrivacyPolicy();
        });

        // Download functionality
        $('.btn-download-policy').off('click').on('click', function() {
            downloadPrivacyPolicy();
        });

        // Search functionality
        $('.policy-search input').off('keyup').on('keyup', function() {
            searchPolicyContent($(this).val());
        });
    }

    function switchPolicySection(sectionId) {
        try {
            // Remove active class from all tabs
            $('.policy-tab').removeClass('active');

            // Add active class to clicked tab
            $(`.policy-tab[data-section="${sectionId}"]`).addClass('active');

            // Hide all policy sections
            $('.policy-section').removeClass('active').hide();

            // Show selected section
            const targetSection = $(`#${sectionId}-section`);
            if (targetSection.length) {
                targetSection.addClass('active').show();

                // Update URL hash for bookmarking
                if (window.history && window.history.replaceState) {
                    window.history.replaceState(null, null, `#${sectionId}`);
                } else {
                    window.location.hash = sectionId;
                }

                // Scroll to top of content
                $('.policy-content').scrollTop(0);

                // Track section view
                trackPolicySectionView(sectionId);

                // Update page title
                updatePageTitle(sectionId);
            } else {
                console.warn(`Policy section '${sectionId}' not found`);
                showNotification('Section not found', 'warning');
            }
        } catch (error) {
            console.error('Error switching policy section:', error);
            showNotification('Error loading section', 'error');
        }
    }

    function loadPolicyMetadata() {
        // Mock policy metadata
        const metadata = {
            lastUpdated: 'January 15, 2024',
            version: '2.1.0',
            effectiveDate: 'February 1, 2024',
            totalSections: 7,
            wordCount: 2847
        };

        // Update metadata display
        $('.meta-last-updated').text(metadata.lastUpdated);
        $('.meta-version').text(metadata.version);
        $('.meta-effective-date').text(metadata.effectiveDate);
        $('.meta-total-sections').text(metadata.totalSections);
        $('.meta-word-count').text(metadata.wordCount);

        // Update last reviewed date
        $('.last-reviewed-date').text(new Date().toLocaleDateString());
    }

    function loadPolicySections() {
        // Policy sections are already in the HTML
        // This could be used for dynamic loading if needed
        console.log('Privacy policy sections loaded');
    }

    function initializePolicyNavigation() {
        // Initialize smooth scrolling for policy sections
        $('.policy-nav-link').off('click').on('click', function(e) {
            e.preventDefault();
            const target = $(this).data('target') || $(this).attr('href')?.substring(1);
            if (target) {
                switchPolicySection(target);
            }
        });

        // Handle URL hash on page load
        const hash = window.location.hash.substring(1);
        if (hash && $(`#${hash}-section`).length) {
            setTimeout(() => {
                switchPolicySection(hash);
            }, 100);
        }

        // Handle browser back/forward buttons
        $(window).off('hashchange').on('hashchange', function() {
            const hash = window.location.hash.substring(1);
            if (hash && $(`#${hash}-section`).length) {
                switchPolicySection(hash);
            }
        });
    }

    function checkUserConsent() {
        try {
            // Check if user has already accepted the policy
            const consentGiven = localStorage.getItem('privacyPolicyAccepted');
            const consentDate = localStorage.getItem('privacyPolicyAcceptedDate');

            if (consentGiven === 'true') {
                $('#policy-consent').prop('checked', true);
                $('.btn-accept-policy').prop('disabled', true).text('Policy Accepted');
                $('.btn-decline-policy').hide();

                // Show consent date
                if (consentDate) {
                    const consentDateTime = new Date(consentDate);
                    $('.policy-consent').append(`<p style="color: #27ae60; font-size: 12px; margin-top: 10px;">Accepted on: ${consentDateTime.toLocaleDateString()} at ${consentDateTime.toLocaleTimeString()}</p>`);
                }

                showNotification('Privacy policy already accepted', 'success');
            }
        } catch (error) {
            console.error('Error checking user consent:', error);
        }
    }

    function handlePolicyConsent() {
        const isChecked = $('#policy-consent').is(':checked');

        if (isChecked) {
            $('.btn-accept-policy').prop('disabled', false);
            $('.btn-decline-policy').prop('disabled', true);
            showNotification('You can now accept the privacy policy', 'info');
        } else {
            $('.btn-accept-policy').prop('disabled', true);
            $('.btn-decline-policy').prop('disabled', false);
        }
    }

    function acceptPrivacyPolicy() {
        const isChecked = $('#policy-consent').is(':checked');

        if (!isChecked) {
            showNotification('Please check the consent box to accept the policy', 'warning');
            return;
        }

        try {
            // Record acceptance
            const acceptanceDate = new Date().toISOString();
            localStorage.setItem('privacyPolicyAccepted', 'true');
            localStorage.setItem('privacyPolicyAcceptedDate', acceptanceDate);
            localStorage.setItem('privacyPolicyVersion', '2.1.0');

            // Update UI
            $('.btn-accept-policy').prop('disabled', true).text('Policy Accepted');
            $('.btn-decline-policy').hide();

            // Show success message
            showNotification('Privacy policy accepted successfully!', 'success');

            // Track acceptance
            trackPolicyAcceptance();

            // Redirect or close modal if in modal
            setTimeout(() => {
                if (window.parent !== window) {
                    // In iframe/modal, notify parent
                    window.parent.postMessage({ type: 'privacyPolicyAccepted' }, '*');
                }
            }, 1500);

        } catch (error) {
            console.error('Error accepting privacy policy:', error);
            showNotification('Error accepting policy. Please try again.', 'error');
        }
    }

    function declinePrivacyPolicy() {
        try {
            // Record decline
            localStorage.setItem('privacyPolicyDeclined', 'true');
            localStorage.setItem('privacyPolicyDeclinedDate', new Date().toISOString());

            // Show confirmation
            if (confirm('Are you sure you want to decline the privacy policy? Some features may not be available.')) {
                showNotification('Privacy policy declined', 'info');

                // Track decline
                trackPolicyDecline();

                // Redirect to home or show limited access
                setTimeout(() => {
                    window.location.href = '/';
                }, 2000);
            }
        } catch (error) {
            console.error('Error declining privacy policy:', error);
            showNotification('Error processing your request', 'error');
        }
    }

    function printPrivacyPolicy() {
        try {
            window.print();
            trackPolicyAction('print');
        } catch (error) {
            console.error('Error printing privacy policy:', error);
            showNotification('Error printing document', 'error');
        }
    }

    function downloadPrivacyPolicy() {
        try {
            // Create a simple text version for download
            const policyContent = getPolicyContent();
            const blob = new Blob([policyContent], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = 'privacy-policy.txt';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            showNotification('Privacy policy downloaded', 'success');
            trackPolicyAction('download');
        } catch (error) {
            console.error('Error downloading privacy policy:', error);
            showNotification('Error downloading document', 'error');
        }
    }

    function searchPolicyContent(query) {
        if (!query || query.length < 2) {
            $('.policy-section .highlight').removeClass('highlight');
            return;
        }

        $('.policy-section .highlight').removeClass('highlight');

        $('.policy-section').each(function() {
            const text = $(this).text();
            const regex = new RegExp(`(${query})`, 'gi');
            $(this).html($(this).html().replace(regex, '<mark class="highlight">$1</mark>'));
        });
    }

    function getPolicyContent() {
        // Extract text content from policy sections
        let content = 'PRIVACY POLICY\n\n';

        $('.policy-section').each(function() {
            const title = $(this).find('h3').first().text();
            const text = $(this).text();
            content += `${title}\n${text}\n\n`;
        });

        return content;
    }

    function updatePageTitle(sectionId) {
        const sectionTitles = {
            'information-collection': 'Information Collection - Privacy Policy',
            'information-use': 'Information Use - Privacy Policy',
            'information-sharing': 'Information Sharing - Privacy Policy',
            'data-security': 'Data Security - Privacy Policy',
            'user-rights': 'User Rights - Privacy Policy',
            'cookies': 'Cookies - Privacy Policy',
            'contact': 'Contact Us - Privacy Policy'
        };

        const title = sectionTitles[sectionId] || 'Privacy Policy';
        document.title = title;
    }

    function trackPolicySectionView(sectionId) {
        // Track which sections users view
        try {
            const views = JSON.parse(localStorage.getItem('policySectionViews') || '{}');
            views[sectionId] = (views[sectionId] || 0) + 1;
            localStorage.setItem('policySectionViews', JSON.stringify(views));
        } catch (error) {
            console.error('Error tracking section view:', error);
        }
    }

    function trackPolicyAcceptance() {
        try {
            const acceptanceData = {
                timestamp: new Date().toISOString(),
                version: '2.1.0',
                userAgent: navigator.userAgent,
                url: window.location.href
            };

            localStorage.setItem('policyAcceptanceData', JSON.stringify(acceptanceData));
        } catch (error) {
            console.error('Error tracking policy acceptance:', error);
        }
    }

    function trackPolicyDecline() {
        try {
            const declineData = {
                timestamp: new Date().toISOString(),
                version: '2.1.0',
                userAgent: navigator.userAgent,
                url: window.location.href
            };

            localStorage.setItem('policyDeclineData', JSON.stringify(declineData));
        } catch (error) {
            console.error('Error tracking policy decline:', error);
        }
    }

    function trackPolicyAction(action) {
        try {
            const actions = JSON.parse(localStorage.getItem('policyActions') || '[]');
            actions.push({
                action: action,
                timestamp: new Date().toISOString(),
                section: window.location.hash.substring(1)
            });
            localStorage.setItem('policyActions', JSON.stringify(actions));
        } catch (error) {
            console.error('Error tracking policy action:', error);
        }
    }

    function showNotification(message, type) {
        // Create notification element
        const notification = $(`
            <div class="notification ${type}" style="
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 5px;
                color: white;
                font-weight: 500;
                z-index: 10000;
                max-width: 300px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                opacity: 0;
                transform: translateY(-20px);
                transition: all 0.3s ease;
            ">
                ${message}
            </div>
        `);

        // Set background color based on type
        const colors = {
            success: '#27ae60',
            error: '#e74c3c',
            warning: '#f39c12',
            info: '#3498db'
        };

        notification.css('background-color', colors[type] || colors.info);

        // Add to body
        $('body').append(notification);

        // Animate in
        setTimeout(() => {
            notification.css({
                opacity: 1,
                transform: 'translateY(0)'
            });
        }, 100);

        // Remove after 5 seconds
        setTimeout(() => {
            notification.css({
                opacity: 0,
                transform: 'translateY(-20px)'
            });
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 5000);
    }

    // Global functions for backward compatibility
    window.acceptPrivacyPolicy = acceptPrivacyPolicy;
    window.declinePrivacyPolicy = declinePrivacyPolicy;
    window.switchPolicySection = switchPolicySection;

})(jQuery);
