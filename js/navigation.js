/**
 * NAVIGATION MANAGER
 * Gestione navigazione e menu mobile
 */

class NavigationManager {
    constructor() {
        this.header = null;
        this.mobileMenuToggle = null;
        this.mobileMenuOverlay = null;
        this.isMenuOpen = false;
        this.lastScrollY = 0;
    }
    
    init() {
        this.header = document.querySelector('.main-header');
        this.mobileMenuToggle = document.getElementById('mobile-menu-toggle');
        this.mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
        
        this.setupMobileMenu();
        this.setupScrollBehavior();
        this.setupSmoothScroll();
        
        if (window.Debug) window.Debug.log('info', 'Navigazione inizializzata');
    }
    
    setupMobileMenu() {
        if (!this.mobileMenuToggle) return;
        
        this.mobileMenuToggle.addEventListener('click', () => this.toggleMobileMenu());
        
        const mobileLinks = document.querySelectorAll('.mobile-nav-link');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => this.closeMobileMenu());
        });
    }
    
    toggleMobileMenu() {
        this.isMenuOpen = !this.isMenuOpen;
        this.mobileMenuToggle.classList.toggle('active', this.isMenuOpen);
        this.mobileMenuOverlay.classList.toggle('active', this.isMenuOpen);
        document.body.style.overflow = this.isMenuOpen ? 'hidden' : '';
    }
    
    closeMobileMenu() {
        this.isMenuOpen = false;
        this.mobileMenuToggle.classList.remove('active');
        this.mobileMenuOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    setupScrollBehavior() {
        let ticking = false;
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    this.handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        });
    }
    
    handleScroll() {
        const currentScrollY = window.scrollY;
        
        // Hide/show header on scroll
        if (currentScrollY > this.lastScrollY && currentScrollY > 100) {
            this.header.style.transform = 'translateY(-100%)';
        } else {
            this.header.style.transform = 'translateY(0)';
        }
        
        this.lastScrollY = currentScrollY;
    }
    
    setupSmoothScroll() {
        const navLinks = document.querySelectorAll('a[href^="#"]');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                
                // Ignora se l'href è vuoto, solo "#", o se è cambiato in un URL esterno
                if (!href || href === '#' || href === '' || !href.startsWith('#')) {
                    return;
                }
                
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const offsetTop = target.offsetTop - 80;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                    this.closeMobileMenu();
                }
            });
        });
    }
}

window.Navigation = new NavigationManager();
