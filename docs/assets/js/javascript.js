// ============================================================================
// CLOCKWORKS PRODUCTION SITE — MAIN JAVASCRIPT
// Version: 2.0.0
// Author: Clockworks Production
// License: MIT
// ============================================================================

(function() {
    'use strict';
    
    // ============================================================================
    // 1. AUTO LOAD NAV + FOOTER (Your existing code)
    // ============================================================================
    
    function loadNavigationAndFooter() {
        console.log('CWP: Loading navigation and footer...');
        
        // Load navigation
        fetch("/partials/nav.html")
            .then(r => {
                if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`);
                return r.text();
            })
            .then(html => {
                const navPlaceholder = document.getElementById("nav-placeholder");
                if (navPlaceholder) {
                    navPlaceholder.innerHTML = html;
                    
                    // Initialize navigation system after nav is inserted
                    initNavigationSystem();
                    
                    // Load navigation system script if needed
                    const script = document.createElement('script');
                    script.src = '/assets/js/navigation.js';
                    script.onload = () => console.log('CWP: Navigation system loaded');
                    document.head.appendChild(script);
                }
            })
            .catch(err => {
                console.error('CWP: Failed to load nav:', err);
                const navPlaceholder = document.getElementById("nav-placeholder");
                if (navPlaceholder) {
                    navPlaceholder.innerHTML = `
                        <div style="padding: 20px; text-align: center; background: var(--cw-color-surface-0);">
                            <a href="/" style="color: var(--cw-color-primary); font-size: 1.2rem; text-decoration: none;">
                                Clockworks Production
                            </a>
                        </div>
                    `;
                }
            });

        // Load footer
        fetch("/partials/footer.html")
            .then(r => {
                if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`);
                return r.text();
            })
            .then(html => {
                const footerPlaceholder = document.getElementById("footer-placeholder");
                if (footerPlaceholder) {
                    footerPlaceholder.innerHTML = html;
                }
            })
            .catch(err => console.error('CWP: Failed to load footer:', err));
    }

    // ============================================================================
    // 2. MATERIAL SYMBOLS LOADER (Your existing code)
    // ============================================================================
    
    function loadMaterialSymbols() {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0';
        
        link.onerror = () => {
            console.warn('Material Symbols CDN failed. Using local fallback.');
            const fallback = document.createElement('link');
            fallback.rel = 'stylesheet';
            fallback.href = '/assets/css/material-fallback.css';
            document.head.appendChild(fallback);
        };
        
        document.head.appendChild(link);
    }

    // ============================================================================
    // 3. INITIALIZATION
    // ============================================================================
    
    // Wait for DOM to be fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Clockworks Production Site initialized');
        
        // Initialize all components
        loadNavigationAndFooter();
        loadMaterialSymbols();
        initThemeSystem();
        initMobileMenu();
        initModalSystem();
        initDropdowns();
        initSidebar();
        initSmoothScrolling();
        initFormEnhancements();
        initTooltips();
        initAnimations();
        initLazyLoading();
        initCodeBlocks();
        initProgressBars();
        initDynamicGrids();
    });

    // ============================================================================
    // 4. THEME SYSTEM
    // ============================================================================
    
    function initThemeSystem() {
        // Check for saved theme or prefer-color-scheme
        const savedTheme = localStorage.getItem('cw-theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        // Set initial theme
        let theme = savedTheme || (prefersDark ? 'dark' : 'light');
        setTheme(theme);
        
        // Initialize theme toggle buttons
        document.querySelectorAll('.cw-theme-toggle').forEach(toggle => {
            const checkbox = toggle.querySelector('input[type="checkbox"]');
            if (checkbox) {
                checkbox.checked = theme === 'dark';
                checkbox.addEventListener('change', function() {
                    setTheme(this.checked ? 'dark' : 'light');
                });
            } else {
                // If no checkbox, make the whole toggle clickable
                toggle.addEventListener('click', function(e) {
                    if (!e.target.closest('a, button, input')) {
                        toggleTheme();
                    }
                });
            }
        });
        
        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            if (!localStorage.getItem('cw-theme')) {
                setTheme(e.matches ? 'dark' : 'light');
            }
        });
        
        // Add keyboard shortcut for theme toggle (Alt+T)
        document.addEventListener('keydown', function(e) {
            if (e.altKey && e.key === 't') {
                e.preventDefault();
                toggleTheme();
            }
        });
    }
    
    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('cw-theme', theme);
        
        // Add transition class for smooth theme change
        document.body.classList.add('theme-transition');
        setTimeout(() => {
            document.body.classList.remove('theme-transition');
        }, 300);
        
        // Update all theme toggle checkboxes
        document.querySelectorAll('.cw-theme-toggle input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = theme === 'dark';
        });
        
        // Update theme toggle icons
        document.querySelectorAll('.theme-icon').forEach(icon => {
            if (theme === 'dark') {
                icon.textContent = 'dark_mode';
                icon.setAttribute('title', 'Switch to light mode');
            } else {
                icon.textContent = 'light_mode';
                icon.setAttribute('title', 'Switch to dark mode');
            }
        });
        
        // Dispatch custom event
        document.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
        
        console.log(`Theme set to: ${theme}`);
    }
    
    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        
        // Visual feedback
        const event = new CustomEvent('cw-notification', {
            detail: {
                message: `Switched to ${newTheme} mode`,
                type: 'info',
                duration: 2000
            }
        });
        document.dispatchEvent(event);
    }

    // ============================================================================
    // 5. MOBILE MENU
    // ============================================================================
    
    function initMobileMenu() {
        const menuToggles = document.querySelectorAll('.cw-menu-toggle, .mobile-menu-toggle');
        
        menuToggles.forEach(toggle => {
            toggle.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const targetId = this.getAttribute('data-target') || 'mobile-menu';
                const target = document.getElementById(targetId);
                
                if (target) {
                    target.classList.toggle('cw-show');
                    this.classList.toggle('active');
                    
                    // Toggle aria-expanded
                    const expanded = this.getAttribute('aria-expanded') === 'true';
                    this.setAttribute('aria-expanded', !expanded);
                    
                    // Toggle body scroll
                    document.body.classList.toggle('menu-open');
                    
                    // Close other open menus
                    document.querySelectorAll('.cw-sidebar, .cw-dropdown-content').forEach(other => {
                        if (other !== target && other.classList.contains('cw-show')) {
                            other.classList.remove('cw-show');
                        }
                    });
                }
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.cw-sidebar, .cw-menu-toggle, .mobile-menu-toggle')) {
                document.querySelectorAll('.cw-sidebar.cw-show').forEach(menu => {
                    menu.classList.remove('cw-show');
                });
                document.querySelectorAll('.cw-menu-toggle, .mobile-menu-toggle').forEach(toggle => {
                    toggle.classList.remove('active');
                    toggle.setAttribute('aria-expanded', 'false');
                });
                document.body.classList.remove('menu-open');
            }
        });
        
        // Close menu on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                document.querySelectorAll('.cw-sidebar.cw-show').forEach(menu => {
                    menu.classList.remove('cw-show');
                });
                document.querySelectorAll('.cw-menu-toggle').forEach(toggle => {
                    toggle.classList.remove('active');
                    toggle.setAttribute('aria-expanded', 'false');
                });
                document.body.classList.remove('menu-open');
            }
        });
    }

    // ============================================================================
    // 6. MODAL SYSTEM
    // ============================================================================
    
    function initModalSystem() {
        // Open modal
        document.querySelectorAll('[data-modal-target]').forEach(trigger => {
            trigger.addEventListener('click', function(e) {
                e.preventDefault();
                const modalId = this.getAttribute('data-modal-target');
                const modal = document.getElementById(modalId);
                if (modal) {
                    openModal(modal);
                }
            });
        });
        
        // Close modal with close buttons
        document.querySelectorAll('.cw-modal-close, [data-modal-close]').forEach(closeBtn => {
            closeBtn.addEventListener('click', function(e) {
                e.preventDefault();
                const modal = this.closest('.cw-modal');
                if (modal) {
                    closeModal(modal);
                }
            });
        });
        
        // Close modal when clicking outside
        document.querySelectorAll('.cw-modal').forEach(modal => {
            modal.addEventListener('click', function(e) {
                if (e.target === this) {
                    closeModal(this);
                }
            });
        });
        
        // Close modal with escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                document.querySelectorAll('.cw-modal.cw-show').forEach(modal => {
                    closeModal(modal);
                });
            }
        });
    }
    
    function openModal(modal) {
        modal.classList.add('cw-show');
        modal.style.display = 'block';
        document.body.classList.add('modal-open');
        
        // Focus first focusable element
        const focusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusable) focusable.focus();
        
        // Dispatch event
        modal.dispatchEvent(new CustomEvent('modalopen'));
    }
    
    function closeModal(modal) {
        modal.classList.remove('cw-show');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
        document.body.classList.remove('modal-open');
        
        // Dispatch event
        modal.dispatchEvent(new CustomEvent('modalclose'));
    }

    // ============================================================================
    // 7. DROPDOWNS
    // ============================================================================
    
    function initDropdowns() {
        // Click dropdowns
        document.querySelectorAll('.cw-dropdown-click').forEach(dropdown => {
            const button = dropdown.querySelector('.cw-button, .cw-btn, button');
            if (button) {
                button.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const content = this.nextElementSibling;
                    if (content && content.classList.contains('cw-dropdown-content')) {
                        content.classList.toggle('cw-show');
                        
                        // Close other dropdowns
                        document.querySelectorAll('.cw-dropdown-content').forEach(other => {
                            if (other !== content && other.classList.contains('cw-show')) {
                                other.classList.remove('cw-show');
                            }
                        });
                    }
                });
            }
        });
        
        // Hover dropdowns
        document.querySelectorAll('.cw-dropdown-hover').forEach(dropdown => {
            dropdown.addEventListener('mouseenter', function() {
                const content = this.querySelector('.cw-dropdown-content');
                if (content) {
                    content.classList.add('cw-show');
                }
            });
            
            dropdown.addEventListener('mouseleave', function() {
                const content = this.querySelector('.cw-dropdown-content');
                if (content) {
                    content.classList.remove('cw-show');
                }
            });
        });
        
        // Close dropdowns when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.cw-dropdown-click, .cw-dropdown-hover')) {
                document.querySelectorAll('.cw-dropdown-content').forEach(content => {
                    content.classList.remove('cw-show');
                });
            }
        });
        
        // Close dropdowns on escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                document.querySelectorAll('.cw-dropdown-content').forEach(content => {
                    content.classList.remove('cw-show');
                });
            }
        });
    }

    // ============================================================================
    // 8. SIDEBAR
    // ============================================================================
    
    function initSidebar() {
        document.querySelectorAll('[data-sidebar-toggle]').forEach(toggle => {
            toggle.addEventListener('click', function(e) {
                e.preventDefault();
                const sidebarId = this.getAttribute('data-sidebar-toggle');
                const sidebar = document.getElementById(sidebarId);
                if (sidebar) {
                    sidebar.classList.toggle('cw-collapse');
                    
                    // Adjust main content margin
                    const main = document.querySelector('main, .cw-main, #main');
                    if (main) {
                        if (sidebar.classList.contains('cw-collapse')) {
                            main.style.marginLeft = '0';
                        } else {
                            main.style.marginLeft = sidebar.offsetWidth + 'px';
                        }
                    }
                }
            });
        });
    }

    // ============================================================================
    // 9. SMOOTH SCROLLING
    // ============================================================================
    
    function initSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href === '#') return;
                
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    
                    // Close mobile menu if open
                    document.querySelectorAll('.cw-sidebar.cw-show').forEach(menu => {
                        menu.classList.remove('cw-show');
                    });
                    document.body.classList.remove('menu-open');
                    
                    // Smooth scroll
                    window.scrollTo({
                        top: target.offsetTop - 80,
                        behavior: 'smooth'
                    });
                    
                    // Update URL without page jump
                    history.pushState(null, null, href);
                }
            });
        });
    }

    // ============================================================================
    // 10. FORM ENHANCEMENTS
    // ============================================================================
    
    function initFormEnhancements() {
        // Add floating labels
        document.querySelectorAll('.cw-input').forEach(input => {
            if (input.value.trim() !== '') {
                input.parentElement.classList.add('has-value');
            }
            
            input.addEventListener('input', function() {
                if (this.value.trim() !== '') {
                    this.parentElement.classList.add('has-value');
                } else {
                    this.parentElement.classList.remove('has-value');
                }
            });
            
            input.addEventListener('focus', function() {
                this.parentElement.classList.add('is-focused');
            });
            
            input.addEventListener('blur', function() {
                this.parentElement.classList.remove('is-focused');
            });
        });
        
        // Form validation
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', function(e) {
                if (!this.checkValidity()) {
                    e.preventDefault();
                    
                    // Show validation errors
                    this.querySelectorAll(':invalid').forEach(input => {
                        input.classList.add('cw-invalid');
                        
                        // Create or show error message
                        let error = input.nextElementSibling;
                        if (!error || !error.classList.contains('error-message')) {
                            error = document.createElement('div');
                            error.className = 'error-message';
                            error.textContent = input.validationMessage;
                            input.parentNode.insertBefore(error, input.nextSibling);
                        }
                    });
                }
            });
            
            // Clear validation on input
            form.querySelectorAll('input, textarea, select').forEach(input => {
                input.addEventListener('input', function() {
                    this.classList.remove('cw-invalid');
                    
                    // Remove error message
                    const error = this.nextElementSibling;
                    if (error && error.classList.contains('error-message')) {
                        error.remove();
                    }
                });
            });
        });
    }

    // ============================================================================
    // 11. TOOLTIPS
    // ============================================================================
    
    function initTooltips() {
        document.querySelectorAll('[data-tooltip]').forEach(element => {
            element.addEventListener('mouseenter', function(e) {
                const tooltip = document.createElement('div');
                tooltip.className = 'cw-tooltip-content';
                tooltip.textContent = this.getAttribute('data-tooltip');
                tooltip.style.position = 'fixed';
                
                document.body.appendChild(tooltip);
                
                // Position tooltip
                const rect = this.getBoundingClientRect();
                const tooltipRect = tooltip.getBoundingClientRect();
                
                let top = rect.top - tooltipRect.height - 10;
                let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
                
                // Adjust if tooltip goes off screen
                if (top < 10) top = rect.bottom + 10;
                if (left < 10) left = 10;
                if (left + tooltipRect.width > window.innerWidth - 10) {
                    left = window.innerWidth - tooltipRect.width - 10;
                }
                
                tooltip.style.top = top + 'px';
                tooltip.style.left = left + 'px';
                tooltip.style.zIndex = '10000';
                
                this._tooltip = tooltip;
            });
            
            element.addEventListener('mouseleave', function() {
                if (this._tooltip) {
                    this._tooltip.remove();
                    this._tooltip = null;
                }
            });
        });
    }

    // ============================================================================
    // 12. ANIMATIONS
    // ============================================================================
    
    function initAnimations() {
        // Intersection Observer for scroll animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('cw-animate-in');
                    
                    // Add different animation classes based on data attributes
                    const animation = entry.target.getAttribute('data-animate');
                    if (animation) {
                        entry.target.classList.add(animation);
                    }
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '50px'
        });
        
        // Observe elements with animation classes
        document.querySelectorAll('.cw-animate-top, .cw-animate-left, .cw-animate-right, .cw-animate-bottom, [data-animate]').forEach(el => {
            observer.observe(el);
        });
        
        // Add animation classes on load for immediate animations
        setTimeout(() => {
            document.querySelectorAll('.cw-animate-opacity, .cw-animate-zoom').forEach(el => {
                el.classList.add('cw-animate-in');
            });
        }, 100);
    }

    // ============================================================================
    // 13. LAZY LOADING
    // ============================================================================
    
    function initLazyLoading() {
        // Lazy load images
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const src = img.getAttribute('data-src');
                    if (src) {
                        img.src = src;
                        img.removeAttribute('data-src');
                    }
                    img.classList.add('cw-loaded');
                    observer.unobserve(img);
                }
            });
        });
        
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
        
        // Lazy load background images
        const bgObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const bg = element.getAttribute('data-bg');
                    if (bg) {
                        element.style.backgroundImage = `url(${bg})`;
                        element.removeAttribute('data-bg');
                    }
                    observer.unobserve(element);
                }
            });
        });
        
        document.querySelectorAll('[data-bg]').forEach(element => {
            bgObserver.observe(element);
        });
    }

    // ============================================================================
    // 14. CODE BLOCKS
    // ============================================================================
    
    function initCodeBlocks() {
        document.querySelectorAll('.cw-code pre').forEach(pre => {
            // Add copy button
            const copyBtn = document.createElement('button');
            copyBtn.className = 'cw-btn cw-btn-small cw-code-copy';
            copyBtn.innerHTML = '<span class="material-symbols-rounded">content_copy</span>';
            copyBtn.setAttribute('aria-label', 'Copy code');
            
            copyBtn.addEventListener('click', function() {
                const code = pre.textContent;
                navigator.clipboard.writeText(code).then(() => {
                    const original = this.innerHTML;
                    this.innerHTML = '<span class="material-symbols-rounded">check</span>';
                    this.classList.add('copied');
                    
                    setTimeout(() => {
                        this.innerHTML = original;
                        this.classList.remove('copied');
                    }, 2000);
                });
            });
            
            // Add language label
            const language = pre.parentElement.getAttribute('data-language') || 'code';
            const langLabel = document.createElement('div');
            langLabel.className = 'cw-code-language';
            langLabel.textContent = language;
            
            pre.parentElement.prepend(langLabel);
            pre.parentElement.appendChild(copyBtn);
            
            // Add line numbers
            const lines = pre.textContent.split('\n').length;
            const lineNumbers = document.createElement('div');
            lineNumbers.className = 'cw-line-numbers';
            lineNumbers.innerHTML = Array.from({length: lines}, (_, i) => `<span>${i + 1}</span>`).join('\n');
            
            const wrapper = document.createElement('div');
            wrapper.className = 'cw-code-wrapper';
            wrapper.appendChild(lineNumbers);
            wrapper.appendChild(pre.cloneNode(true));
            
            pre.parentElement.replaceChild(wrapper, pre);
        });
    }

    // ============================================================================
    // 15. PROGRESS BARS
    // ============================================================================
    
    function initProgressBars() {
        const progressObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const progressBar = entry.target.querySelector('.cw-progress-bar');
                    if (progressBar) {
                        const width = progressBar.getAttribute('data-progress') || '100%';
                        setTimeout(() => {
                            progressBar.style.width = width;
                        }, 100);
                    }
                }
            });
        });
        
        document.querySelectorAll('.cw-progress').forEach(progress => {
            progressObserver.observe(progress);
        });
    }

    // ============================================================================
    // 16. DYNAMIC GRIDS
    // ============================================================================
    
    function initDynamicGrids() {
        // Masonry grid layout
        document.querySelectorAll('.cw-grid-masonry').forEach(grid => {
            const resizeObserver = new ResizeObserver(() => {
                layoutMasonry(grid);
            });
            
            resizeObserver.observe(grid);
            
            // Initial layout
            setTimeout(() => layoutMasonry(grid), 100);
        });
        
        // Equal height cards
        document.querySelectorAll('.cw-row.cw-equal-height').forEach(row => {
            const resizeObserver = new ResizeObserver(() => {
                equalizeHeights(row);
            });
            
            resizeObserver.observe(row);
            equalizeHeights(row);
        });
    }
    
    function layoutMasonry(grid) {
        const items = grid.children;
        const gap = parseInt(getComputedStyle(grid).gap) || 0;
        const columns = getComputedStyle(grid).gridTemplateColumns.split(' ').length;
        
        // Reset positions
        Array.from(items).forEach(item => {
            item.style.position = '';
            item.style.top = '';
            item.style.left = '';
        });
        
        // Calculate positions
        const colHeights = new Array(columns).fill(0);
        
        Array.from(items).forEach((item, index) => {
            const col = index % columns;
            item.style.position = 'absolute';
            item.style.left = `${(100 / columns) * col}%`;
            item.style.top = `${colHeights[col]}px`;
            item.style.width = `${100 / columns}%`;
            
            colHeights[col] += item.offsetHeight + gap;
        });
        
        // Set container height
        grid.style.height = `${Math.max(...colHeights) - gap}px`;
    }
    
    function equalizeHeights(row) {
        const cards = row.querySelectorAll('.cw-card');
        let maxHeight = 0;
        
        // Reset heights
        cards.forEach(card => {
            card.style.height = '';
        });
        
        // Find max height
        cards.forEach(card => {
            const height = card.offsetHeight;
            if (height > maxHeight) maxHeight = height;
        });
        
        // Apply max height
        cards.forEach(card => {
            card.style.height = `${maxHeight}px`;
        });
    }

    // ============================================================================
    // 17. NAVIGATION SYSTEM
    // ============================================================================
    
    function initNavigationSystem() {
        // Add active class to current page in navigation
        const currentPath = window.location.pathname;
        
        document.querySelectorAll('.cw-nav a, .cw-bar-item').forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPath || (href !== '/' && currentPath.startsWith(href))) {
                link.classList.add('cw-active');
                link.setAttribute('aria-current', 'page');
            }
            
            // Add keyboard navigation
            link.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    this.click();
                }
            });
        });
        
        // Sticky navigation
        const nav = document.querySelector('.cw-top, .cw-nav');
        if (nav) {
            let lastScroll = 0;
            
            window.addEventListener('scroll', () => {
                const currentScroll = window.pageYOffset;
                
                if (currentScroll <= 0) {
                    nav.classList.remove('cw-scroll-up');
                    nav.classList.remove('cw-scrolled');
                    return;
                }
                
                if (currentScroll > lastScroll && !nav.classList.contains('cw-scroll-down')) {
                    // Scroll down
                    nav.classList.remove('cw-scroll-up');
                    nav.classList.add('cw-scroll-down');
                } else if (currentScroll < lastScroll && nav.classList.contains('cw-scroll-down')) {
                    // Scroll up
                    nav.classList.remove('cw-scroll-down');
                    nav.classList.add('cw-scroll-up');
                }
                
                if (currentScroll > 100) {
                    nav.classList.add('cw-scrolled');
                } else {
                    nav.classList.remove('cw-scrolled');
                }
                
                lastScroll = currentScroll;
            });
        }
    }

    // ============================================================================
    // 18. UTILITY FUNCTIONS (Public API)
    // ============================================================================
    
    // Make functions available globally
    window.CW = {
        // Theme functions
        setTheme: setTheme,
        toggleTheme: toggleTheme,
        
        // Modal functions
        openModal: openModal,
        closeModal: closeModal,
        
        // Notification function
        notify: function(message, type = 'info', duration = 3000) {
            const notification = document.createElement('div');
            notification.className = `cw-notification cw-${type}`;
            notification.innerHTML = `
                <span class="notification-icon material-symbols-rounded">
                    ${type === 'success' ? 'check_circle' : 
                      type === 'error' ? 'error' : 
                      type === 'warning' ? 'warning' : 'info'}
                </span>
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            `;
            
            document.body.appendChild(notification);
            
            // Show notification
            setTimeout(() => notification.classList.add('show'), 10);
            
            // Close button
            notification.querySelector('.notification-close').addEventListener('click', () => {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            });
            
            // Auto close
            if (duration > 0) {
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.classList.remove('show');
                        setTimeout(() => notification.remove(), 300);
                    }
                }, duration);
            }
            
            return notification;
        },
        
        // Loading function
        showLoading: function(message = 'Loading...') {
            const loading = document.createElement('div');
            loading.className = 'cw-loading-overlay';
            loading.innerHTML = `
                <div class="cw-loading-content">
                    <div class="cw-spinner"></div>
                    ${message ? `<p class="cw-loading-message">${message}</p>` : ''}
                </div>
            `;
            
            document.body.appendChild(loading);
            return loading;
        },
        
        hideLoading: function() {
            document.querySelectorAll('.cw-loading-overlay').forEach(loading => {
                loading.remove();
            });
        },
        
        // Debounce function
        debounce: function(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },
        
        // Throttle function
        throttle: function(func, limit) {
            let inThrottle;
            return function() {
                const args = arguments;
                const context = this;
                if (!inThrottle) {
                    func.apply(context, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        }
    };

})();

// ============================================================================
// 19. POLYFILLS (if needed)
// ============================================================================

// IntersectionObserver polyfill for older browsers
if (!('IntersectionObserver' in window)) {
    const script = document.createElement('script');
    script.src = 'https://polyfill.io/v3/polyfill.min.js?features=IntersectionObserver';
    document.head.appendChild(script);
}

// Custom event polyfill for IE
if (typeof window.CustomEvent !== "function") {
    function CustomEvent(event, params) {
        params = params || { bubbles: false, cancelable: false, detail: null };
        const evt = document.createEvent('CustomEvent');
        evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
        return evt;
    }
    window.CustomEvent = CustomEvent;
}