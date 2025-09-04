document.addEventListener('DOMContentLoaded', function() {
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

    const sidebar = document.querySelector('.sidebar');
    const sidebarHandle = document.getElementById('sidebarDragHandle');
    const rightColumn = document.querySelector('.right-column');
    const header = document.querySelector('.header');
    let isDragging = false;
    let startX = 0;
    let startWidth = 0;

    if (sidebar && sidebarHandle && rightColumn && header) {
        sidebarHandle.addEventListener('mousedown', function(e) {
            isDragging = true;
            startX = e.clientX;
            startWidth = sidebar.offsetWidth;
            sidebar.classList.add('sidebar-dragging');
            document.body.style.userSelect = 'none';
        });

        document.addEventListener('mousemove', function(e) {
            if (!isDragging) return;
            let dx = e.clientX - startX;
            let newWidth = Math.max(200, Math.min(startWidth + dx, 400)); // min 200px, max 400px
            sidebar.style.width = newWidth + 'px';
            rightColumn.style.marginLeft = newWidth + 'px';
            rightColumn.style.width = `calc(100vw - ${newWidth}px)`;
            header.style.left = newWidth + 'px';
            header.style.width = `calc(100vw - ${newWidth}px)`;
        });

        document.addEventListener('mouseup', function() {
            if (isDragging) {
                isDragging = false;
                sidebar.classList.remove('sidebar-dragging');
                document.body.style.userSelect = '';
            }
        });
    }
});