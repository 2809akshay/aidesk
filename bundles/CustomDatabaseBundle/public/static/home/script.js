// Simulate connection to database on button click
const connectBtns = document.querySelectorAll('.btn');
connectBtns.forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.preventDefault();
        const cardTitle = this.closest('.card').querySelector('.card-title').textContent;
        alert(`Opening ${cardTitle} interface...`);
    });
});

// Add active class to menu items
const menuItems = document.querySelectorAll('.sidebar-menu a');
menuItems.forEach(item => {
    item.addEventListener('click', function(e) {
        e.preventDefault();
        menuItems.forEach(i => i.classList.remove('active'));
        this.classList.add('active');
    });
});

// Simulate API connection
const apiButtons = document.querySelectorAll('.api-card .btn');
apiButtons.forEach(button => {
    button.addEventListener('click', function() {
        const apiName = this.closest('.api-card').querySelector('.api-name').textContent;
        this.textContent = this.textContent === 'Connect' ? 'Connecting...' : 'Configuring...';
        
        setTimeout(() => {
            this.textContent = 'Connected';
            this.classList.remove('btn-outline');
            this.style.background = 'var(--success)';
        }, 1500);
    });
});

// Advanced card button simulation
document.querySelectorAll('.advanced-card .btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.preventDefault();
        const feature = this.closest('.advanced-card').querySelector('.advanced-title').textContent;
        alert(`Opening ${feature} advanced options...`);
    });
});