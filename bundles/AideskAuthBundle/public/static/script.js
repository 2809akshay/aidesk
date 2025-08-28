document.addEventListener("DOMContentLoaded", function () {
    // Elements
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const forgotPassword = document.getElementById('forgotPassword');
    const otpSection = document.getElementById('otpSection');
    const loginSuccessNotification = document.getElementById('loginSuccessNotification');
    const loginErrorNotification = document.getElementById('loginErrorNotification');
    const loginWarningNotification = document.getElementById('loginWarningNotification');
    const signupSuccessNotification = document.getElementById('signupSuccessNotification');
    const signupErrorNotification = document.getElementById('signupErrorNotification');
    const showLoginBtn = document.getElementById('showLogin');
    const showSignupBtn = document.getElementById('showSignup');
    const loginContainer = document.getElementById('loginContainer');
    const signupContainer = document.getElementById('signupContainer');
    const backToLogin = document.getElementById('backToLogin');
    const passwordStrengthMeter = document.getElementById('passwordStrengthMeter');
    const passwordStrengthText = document.getElementById('passwordStrengthText');
    const signupPassword = document.getElementById('signupPassword');
    
    // Toggle between login and signup
    showLoginBtn.addEventListener('click', function() {
        showLoginBtn.classList.add('active');
        showSignupBtn.classList.remove('active');
        loginContainer.style.display = 'flex';
        signupContainer.style.display = 'none';
    });
    
    showSignupBtn.addEventListener('click', function() {
        showSignupBtn.classList.add('active');
        showLoginBtn.classList.remove('active');
        signupContainer.style.display = 'flex';
        loginContainer.style.display = 'none';
    });
    
    backToLogin.addEventListener('click', function(e) {
        e.preventDefault();
        showLoginBtn.click();
    });
    
    // Password strength indicator
    signupPassword.addEventListener('input', function() {
        const password = signupPassword.value;
        let strength = 0;
        let message = '';
        
        if (password.length > 0) {
            // Check password strength
            if (password.length < 6) {
                strength = 20;
                message = 'Too short';
            } else {
                // Check for lowercase, uppercase, numbers, and special characters
                const hasLower = /[a-z]/.test(password);
                const hasUpper = /[A-Z]/.test(password);
                const hasNumbers = /\d/.test(password);
                const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
                
                if (hasLower) strength += 20;
                if (hasUpper) strength += 20;
                if (hasNumbers) strength += 20;
                if (hasSpecial) strength += 20;
                
                if (password.length > 10) strength += 20;
                
                // Cap at 100
                strength = Math.min(strength, 100);
                
                // Set message based on strength
                if (strength < 40) message = 'Weak';
                else if (strength < 70) message = 'Medium';
                else if (strength < 90) message = 'Strong';
                else message = 'Very Strong';
            }
            
            // Update strength meter
            passwordStrengthMeter.style.width = strength + '%';
            
            // Update color based on strength
            if (strength < 40) {
                passwordStrengthMeter.style.background = var(--error-color);
                passwordStrengthText.style.color = var(--error-color);
            } else if (strength < 70) {
                passwordStrengthMeter.style.background = var(--warning-color);
                passwordStrengthText.style.color = var(--warning-color);
            } else {
                passwordStrengthMeter.style.background = var(--success-color);
                passwordStrengthText.style.color = var(--success-color);
            }
            
            passwordStrengthText.textContent = message;
        } else {
            passwordStrengthMeter.style.width = '0';
            passwordStrengthText.textContent = '';
        }
    });
    
    // Login form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        // Simple validation
        if (!email || !password) {
            showNotification(loginWarningNotification, 'Please fill in all fields');
            return;
        }
        
        // Simulate authentication
        if (email && password) {
            // Show OTP section for 2FA
            loginForm.style.display = 'none';
            otpSection.style.display = 'block';
            showNotification(loginSuccessNotification, 'OTP has been sent to your registered phone and email.');
        } else {
            showNotification(loginErrorNotification, 'Invalid credentials. Please try again.');
        }
    });
    
    // Signup form submission
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const phone = document.getElementById('signupPhone').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('signupConfirmPassword').value;
        const terms = document.getElementById('signupTerms').checked;
        
        // Validate form
        if (!name || !email || !phone || !password || !confirmPassword) {
            showNotification(signupErrorNotification, 'Please fill in all fields');
            return;
        }
        
        if (password !== confirmPassword) {
            showNotification(signupErrorNotification, 'Passwords do not match');
            return;
        }
        
        if (!terms) {
            showNotification(signupErrorNotification, 'Please agree to the terms and conditions');
            return;
        }
        
        // Simulate successful signup
        showNotification(signupSuccessNotification, 'Account created successfully! Please verify your email.');
        
        // Reset form
        signupForm.reset();
        passwordStrengthMeter.style.width = '0';
        passwordStrengthText.textContent = '';
    });
    
    // Simulate OTP verification
    document.getElementById('verifyOtp').addEventListener('click', function() {
        const otp = document.getElementById('otp').value;
        if (otp === '1234') { // Simulated OTP validation
            showNotification(loginSuccessNotification, 'Login successful! Redirecting...');
            // Simulate redirect
            setTimeout(() => {
                alert('Login successful! You would now be redirected to the Aidesk dashboard.');
            }, 1500);
        } else {
            showNotification(loginErrorNotification, 'Invalid OTP. Please try again.');
        }
    });
    
    // Resend OTP
    document.getElementById('resendOtp').addEventListener('click', function(e) {
        e.preventDefault();
        showNotification(loginSuccessNotification, 'New OTP has been sent to your registered phone and email.');
    });
    
    // Use backup method
    document.getElementById('useBackupMethod').addEventListener('click', function(e) {
        e.preventDefault();
        showNotification(loginSuccessNotification, 'Backup authentication method initiated.');
    });
    
    // Simulate forgot password
    forgotPassword.addEventListener('click', function(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        
        if (email) {
            showNotification(loginSuccessNotification, 'Password reset instructions sent to your email.');
        } else {
            showNotification(loginWarningNotification, 'Please enter your email address first.');
        }
    });
    
    // Simulate biometric authentication
    document.getElementById('fingerprintLogin').addEventListener('click', function() {
        showNotification(loginSuccessNotification, 'Fingerprint authentication initiated. Check your device.');
    });
    
    document.getElementById('faceLogin').addEventListener('click', function() {
        showNotification(loginSuccessNotification, 'Face ID authentication initiated. Check your device.');
    });
    
    document.getElementById('phoneLogin').addEventListener('click', function() {
        showNotification(loginSuccessNotification, 'Phone authentication initiated. Check your device.');
    });
    
    // Helper function to show notifications
    function showNotification(notificationElement, message) {
        notificationElement.textContent = message;
        notificationElement.style.display = 'block';
        
        // Hide other notifications
        const allNotifications = document.querySelectorAll('.notification');
        allNotifications.forEach(notification => {
            if (notification !== notificationElement) {
                notification.style.display = 'none';
            }
        });
        
        // Auto hide after 5 seconds
        setTimeout(() => {
            notificationElement.style.display = 'none';
        }, 5000);
    }
});