// dashboard.js
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const closeSidebar = document.querySelector('.close-sidebar');
    const sidebar = document.querySelector('.sidebar');

    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.add('open');
        });
    }

    if (closeSidebar && sidebar) {
        closeSidebar.addEventListener('click', () => {
            sidebar.classList.remove('open');
        });
    }

    // Tab Switching Logic
    const navItems = document.querySelectorAll('.nav-item[data-target]');
    const views = document.querySelectorAll('.dashboard-view');
    const topbarTitle = document.getElementById('topbar-title');
    
    const viewTitles = {
        'beranda': 'Beranda Ringkasan',
        'pesanan': 'Daftar Pesanan',
        'saldo': 'Wallet & Saldo',
        'pengaturan': 'Pengaturan Akun',
        'katalog': 'Katalog Vendor'
    };

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = item.getAttribute('data-target');
            
            // Update Active Nav Item
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Update Topbar Title
            if(topbarTitle && viewTitles[targetId]) {
                topbarTitle.textContent = viewTitles[targetId];
            }
            
            // Show Target View, Hide Others
            views.forEach(view => {
                if(view.id === `view-${targetId}`) {
                    view.style.display = 'block';
                    // Trigger reflow/animation if needed
                    view.style.animation = 'none';
                    view.offsetHeight; /* trigger reflow */
                    view.style.animation = 'fadeIn 0.3s ease';
                } else {
                    view.style.display = 'none';
                }
            });
            
            // Close mobile sidebar automatically
            if(window.innerWidth <= 768 && sidebar) {
                sidebar.classList.remove('open');
            }
        });
    });

    // Chart.js Initialization
    const ctx = document.getElementById('salesChart');
    if (ctx) {
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'],
                datasets: [{
                    label: 'Penjualan (Rp)',
                    data: [150000, 230000, 180000, 310000, 250000, 420000, 350000],
                    backgroundColor: 'rgba(59, 130, 246, 0.8)',
                    borderRadius: 6,
                    hoverBackgroundColor: '#1E3A8A'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { borderDash: [4, 4] }
                    },
                    x: {
                        grid: { display: false }
                    }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }
});
