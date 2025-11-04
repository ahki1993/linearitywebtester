/**
 * ANIMATIONS
 * Gestione animazioni ed effetti visivi
 */

class AnimationsManager {
    constructor() {
        this.observer = null;
        this.animatedElements = [];
    }
    
    init() {
        this.setupIntersectionObserver();
        this.setupCounterAnimations();
        this.setupParallaxEffects();
        
        if (window.Debug) window.Debug.log('info', 'Animazioni inizializzate');
    }
    
    setupIntersectionObserver() {
        const options = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    this.observer.unobserve(entry.target);
                }
            });
        }, options);
        
        // Osserva elementi con classi di animazione
        const elements = document.querySelectorAll('.stat-card, .strategy-card, .benefit-card, .performance-card');
        elements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            this.observer.observe(el);
        });
        
        // Aggiungi stile per animazione
        const style = document.createElement('style');
        style.textContent = `
            .animate-in {
                opacity: 1 !important;
                transform: translateY(0) !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    setupCounterAnimations() {
        const counters = document.querySelectorAll('.stat-number, .stat-value, .performance-value');
        
        counters.forEach(counter => {
            const target = counter.textContent.trim();
            const isPercentage = target.includes('%');
            const isDollar = target.includes('$');
            const isComma = target.includes(',');
            
            // Estrai il numero
            const numMatch = target.match(/[\d.]+/);
            if (!numMatch) return;
            
            const finalValue = parseFloat(numMatch[0]);
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.animateCounter(counter, 0, finalValue, 2000, isPercentage, isDollar, isComma);
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });
            
            observer.observe(counter);
        });
    }
    
    animateCounter(element, start, end, duration, isPercentage, isDollar, hasComma) {
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentValue = start + (end - start) * easeOutQuart;
            
            let displayValue = currentValue.toFixed(end % 1 === 0 ? 0 : 1);
            
            if (hasComma && currentValue >= 1000) {
                displayValue = Math.floor(currentValue).toLocaleString('it-IT');
            }
            
            if (isDollar) displayValue = '$' + displayValue;
            if (isPercentage) displayValue = '+' + displayValue + '%';
            
            element.textContent = displayValue;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    setupParallaxEffects() {
        const parallaxElements = document.querySelectorAll('.hero-bg-effects > div');
        
        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY;
            
            parallaxElements.forEach((el, index) => {
                const speed = 0.5 + (index * 0.1);
                el.style.transform = `translateY(${scrolled * speed}px)`;
            });
        });
    }
}

window.Animations = new AnimationsManager();
