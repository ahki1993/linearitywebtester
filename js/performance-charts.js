/**
 * PERFORMANCE CHARTS MANAGER
 * Gestione grafici di performance con Chart.js e carousel
 */

class PerformanceChartsManager {
    constructor() {
        this.currentIndex = 0;
        this.charts = [];
        this.chartInstances = [];
        this.autoRotateInterval = null;
        this.config = null;
    }
    
    async init() {
        // Attendi che CONFIG sia caricato
        if (!window.CONFIG || !window.CONFIG.performanceCharts) {
            console.warn('Performance charts config non ancora caricato');
            return;
        }
        
        this.config = window.CONFIG.performanceCharts;
        this.charts = this.getEnabledCharts();
        
        if (this.charts.length === 0) {
            console.log('Nessun grafico abilitato');
            return;
        }
        
        this.render();
        this.setupControls();
        
        // Auto-rotate se abilitato
        if (this.config.settings.autoRotate && this.charts.length > 1) {
            this.startAutoRotate();
        }
        
        // Re-render al cambio tema
        document.addEventListener('themeChanged', () => this.updateChartsTheme());
        
        console.log(`Performance Charts Manager inizializzato - ${this.charts.length} grafici attivi`);
    }
    
    getEnabledCharts() {
        const visibleCount = this.config.settings.visibleCharts || 3;
        return this.config.charts
            .filter(chart => chart.enabled)
            .slice(0, visibleCount);
    }
    
    getCurrentTheme() {
        return document.body.classList.contains('theme-dark') ? 'dark' : 'light';
    }
    
    getThemeColors() {
        const theme = this.getCurrentTheme();
        return this.config.settings.theme[theme];
    }
    
    render() {
        const container = document.querySelector('.trading-card-preview');
        if (!container) return;
        
        // Pulisci container
        container.innerHTML = '';
        
        // Distruggi chart instances precedenti
        this.chartInstances.forEach(chart => chart && chart.destroy());
        this.chartInstances = [];
        
        // Crea carousel container
        const carouselContainer = document.createElement('div');
        carouselContainer.className = 'chart-carousel-container';
        
        // Crea slide per ogni grafico
        this.charts.forEach((chartData, index) => {
            const slide = this.createChartSlide(chartData, index);
            carouselContainer.appendChild(slide);
        });
        
        container.appendChild(carouselContainer);
        
        // Aggiungi controlli se ci sono più grafici
        if (this.charts.length > 1) {
            const controls = this.createControls();
            container.appendChild(controls);
        }
        
        // Mostra il primo grafico
        this.showChart(0);
    }
    
    createChartSlide(chartData, index) {
        const slide = document.createElement('div');
        slide.className = 'chart-slide';
        slide.setAttribute('data-chart-index', index);
        
        const lang = (window.Translations && window.Translations.currentLang) || 'it';
        const title = chartData.title[lang] || chartData.title.it;
        
        slide.innerHTML = `
            <div class="chart-header">
                <h3 class="chart-title">${title}</h3>
                <div class="chart-stats">
                    <div class="chart-stat-badge">
                        <span class="stat-value">+${chartData.totalProfit}${chartData.currency}</span>
                    </div>
                    <div class="chart-stat-badge">
                        <span class="stat-value">+${chartData.totalPercentage}%</span>
                    </div>
                </div>
            </div>
            <div class="chart-canvas-wrapper">
                <canvas id="performance-chart-${index}"></canvas>
            </div>
        `;
        
        return slide;
    }
    
    createControls() {
        const controls = document.createElement('div');
        controls.className = 'chart-controls';
        
        // Pulsante precedente
        const prevBtn = document.createElement('button');
        prevBtn.className = 'chart-nav-btn';
        prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
        prevBtn.onclick = () => this.prevChart();
        
        // Indicatori
        const indicators = document.createElement('div');
        indicators.className = 'chart-indicators';
        
        this.charts.forEach((_, index) => {
            const indicator = document.createElement('div');
            indicator.className = `chart-indicator ${index === 0 ? 'active' : ''}`;
            indicator.onclick = () => this.showChart(index);
            indicators.appendChild(indicator);
        });
        
        // Pulsante successivo
        const nextBtn = document.createElement('button');
        nextBtn.className = 'chart-nav-btn';
        nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextBtn.onclick = () => this.nextChart();
        
        controls.appendChild(prevBtn);
        controls.appendChild(indicators);
        controls.appendChild(nextBtn);
        
        return controls;
    }
    
    setupControls() {
        // Event listeners già aggiunti nei createControls
    }
    
    showChart(index) {
        if (index < 0 || index >= this.charts.length) return;
        
        // Nascondi tutti i grafici
        document.querySelectorAll('.chart-slide').forEach(slide => {
            slide.classList.remove('active');
        });
        
        // Mostra il grafico selezionato
        const slide = document.querySelector(`[data-chart-index="${index}"]`);
        if (slide) {
            slide.classList.add('active');
        }
        
        // Aggiorna indicatori
        document.querySelectorAll('.chart-indicator').forEach((indicator, i) => {
            indicator.classList.toggle('active', i === index);
        });
        
        this.currentIndex = index;
        
        // Renderizza il chart se non esiste
        if (!this.chartInstances[index]) {
            this.renderChart(index);
        }
    }
    
    renderChart(index) {
        const chartData = this.charts[index];
        const canvas = document.getElementById(`performance-chart-${index}`);
        
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const themeColors = this.getThemeColors();
        
        // Prepara i dati
        const labels = chartData.data.map(d => {
            const date = new Date(d.month + '-01');
            return date.toLocaleDateString('it-IT', { month: 'short', year: '2-digit' });
        });
        
        const values = chartData.data.map(d => d.value);
        
        // Crea gradiente per il fill
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, themeColors.fillColor);
        gradient.addColorStop(1, 'transparent');
        
        // Configurazione chart
        const config = {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: '',
                    data: values,
                    borderColor: themeColors.lineColor,
                    backgroundColor: gradient,
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 6,
                    pointHoverBackgroundColor: themeColors.lineColor,
                    pointHoverBorderColor: '#fff',
                    pointHoverBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: themeColors.backgroundColor,
                        titleColor: themeColors.textColor,
                        bodyColor: themeColors.textColor,
                        borderColor: themeColors.lineColor,
                        borderWidth: 1,
                        padding: 12,
                        displayColors: false,
                        callbacks: {
                            label: function(context) {
                                return `+${context.parsed.y}${chartData.currency}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: themeColors.gridColor,
                            drawBorder: false
                        },
                        ticks: {
                            color: themeColors.textColor,
                            font: {
                                size: 11
                            }
                        }
                    },
                    y: {
                        grid: {
                            color: themeColors.gridColor,
                            drawBorder: false
                        },
                        ticks: {
                            color: themeColors.textColor,
                            font: {
                                size: 11
                            },
                            callback: function(value) {
                                return value + chartData.currency;
                            }
                        },
                        beginAtZero: true
                    }
                }
            }
        };
        
        // Crea il chart
        this.chartInstances[index] = new Chart(ctx, config);
    }
    
    nextChart() {
        const nextIndex = (this.currentIndex + 1) % this.charts.length;
        this.showChart(nextIndex);
        this.resetAutoRotate();
    }
    
    prevChart() {
        const prevIndex = (this.currentIndex - 1 + this.charts.length) % this.charts.length;
        this.showChart(prevIndex);
        this.resetAutoRotate();
    }
    
    startAutoRotate() {
        const interval = this.config.settings.rotationInterval || 5000;
        this.autoRotateInterval = setInterval(() => {
            this.nextChart();
        }, interval);
    }
    
    stopAutoRotate() {
        if (this.autoRotateInterval) {
            clearInterval(this.autoRotateInterval);
            this.autoRotateInterval = null;
        }
    }
    
    resetAutoRotate() {
        if (this.config.settings.autoRotate) {
            this.stopAutoRotate();
            this.startAutoRotate();
        }
    }
    
    updateChartsTheme() {
        // Re-renderizza tutti i chart con i nuovi colori del tema
        this.chartInstances.forEach((chart, index) => {
            if (chart) {
                chart.destroy();
                this.chartInstances[index] = null;
            }
        });
        
        // Re-renderizza il chart corrente
        this.renderChart(this.currentIndex);
    }
    
    destroy() {
        this.stopAutoRotate();
        this.chartInstances.forEach(chart => chart && chart.destroy());
        this.chartInstances = [];
    }
}

// Inizializza globalmente
window.PerformanceChartsManager = new PerformanceChartsManager();

// Auto-init quando CONFIG è pronto
document.addEventListener('DOMContentLoaded', () => {
    // Aspetta che il config sia caricato
    const checkConfig = setInterval(() => {
        if (window.CONFIG && window.CONFIG.performanceCharts) {
            clearInterval(checkConfig);
            window.PerformanceChartsManager.init();
        }
    }, 100);
    
    // Timeout dopo 5 secondi
    setTimeout(() => clearInterval(checkConfig), 5000);
});
