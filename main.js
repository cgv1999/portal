// ИНИЦИАЛИЗАЦИЯ ГЛАВНОЙ АНИМАЦИИ
const chartDom = document.getElementById('main');
const myChart = echarts.init(chartDom);

// Функция для адаптивного размера текста
function getResponsiveFontSize() {
    const width = window.innerWidth;
    if (width <= 480) return 80;
    if (width <= 768) return 100;
    if (width <= 1024) return 120;
    return 140;
}

// Функция для перерисовки графики при изменении размера
function updateChartSize() {
    const fontSize = getResponsiveFontSize();
    const option = {
        backgroundColor: '#ff5014',
        graphic: {
            elements: [
                {
                    type: 'text',
                    left: 'center',
                    top: '50%',
                    style: {
                        text: 'NDA',
                        fontSize: fontSize,
                        fontWeight: 'bold',
                        lineDash: [0, 200],
                        lineDashOffset: 0,
                        fill: 'transparent',
                        stroke: '#FFF',
                        lineWidth: 4
                    },
                    keyframeAnimation: {
                        duration: 2500,
                        loop: false,
                        keyframes: [
                            {
                                percent: 0.6,
                                style: {
                                    fill: 'transparent',
                                    lineDashOffset: 200,
                                    lineDash: [200, 0]
                                }
                            },
                            {
                                percent: 0.7,
                                style: {
                                    fill: 'transparent'
                                }
                            },
                            {
                                percent: 1,
                                style: {
                                    fill: '#FFF'
                                }
                            }
                        ]
                    }
                }
            ]
        }
    };
    
    myChart.setOption(option, true);
}

// Инициализация графика
updateChartSize();

// ОТСЛЕЖИВАНИЕ ЗАВЕРШЕНИЯ АНИМАЦИИ
myChart.on('finished', function() {
    console.log('Анимация NDA завершена');
});

// ФУНКЦИЯ ЗАГРУЗКИ АНАЛИТИКИ
function loadAnalytics(analyticsName) {
    console.log(`Загрузка: ${analyticsName}`);
    
    // Показываем индикатор загрузки
    showLoadingIndicator();
    
    // Скрываем главный экран
    document.querySelector('.container').style.display = 'none';
    
    // Показываем контейнер с аналитикой
    const container = document.getElementById('analytics-container');
    const frame = document.getElementById('analytics-frame');
    
    container.style.display = 'block';
    
    // Загружаем аналитику в iframe
    frame.onload = function() {
        hideLoadingIndicator();
    };
    
    frame.src = `${analyticsName}/index.html`;
    
    // На мобильных добавляем небольшую задержку для лучшего UX
    if (isMobileDevice()) {
        setTimeout(() => {
            hideLoadingIndicator();
        }, 500);
    }
    
    console.log(`Аналитика "${analyticsName}" загружена`);
}

// ФУНКЦИЯ ВОЗВРАТА НА ГЛАВНЫЙ ЭКРАН
function returnToMain() {
    // Скрываем контейнер с аналитикой
    document.getElementById('analytics-container').style.display = 'none';
    
    // Очищаем iframe
    document.getElementById('analytics-frame').src = '';
    
    // Показываем главный экран
    document.querySelector('.container').style.display = 'flex';
    
    // Перерисовываем главный график
    setTimeout(() => {
        myChart.resize();
        updateChartSize();
    }, 50);
    
    console.log('Возврат на главный экран');
}

// ОБРАБОТЧИК ИЗМЕНЕНИЯ РАЗМЕРА ОКНА
let resizeTimer;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
        myChart.resize();
        updateChartSize();
    }, 150);
});

// Вспомогательные функции
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function showLoadingIndicator() {
    // Создаем индикатор загрузки, если его нет
    if (!document.getElementById('loading-indicator')) {
        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'loading-indicator';
        loadingDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 80, 20, 0.9);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            color: white;
            font-size: 18px;
        `;
        loadingDiv.innerHTML = `
            <div style="font-size: 24px; margin-bottom: 20px;">🔄</div>
            <div>Загрузка аналитики...</div>
        `;
        document.body.appendChild(loadingDiv);
    } else {
        document.getElementById('loading-indicator').style.display = 'flex';
    }
}

function hideLoadingIndicator() {
    const indicator = document.getElementById('loading-indicator');
    if (indicator) {
        indicator.style.display = 'none';
    }
}

// ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ СТРАНИЦЫ
document.addEventListener('DOMContentLoaded', function() {
    console.log('PORTAL Analytics загружен');
    
    // Добавляем обработчики для touch устройств
    if (isMobileDevice()) {
        document.body.classList.add('mobile-device');
        
        // Улучшаем touch-обработку для кнопок
        const buttons = document.querySelectorAll('.portal-button, .back-button');
        buttons.forEach(button => {
            button.addEventListener('touchstart', function(e) {
                this.style.transform = 'scale(0.98)';
            });
            
            button.addEventListener('touchend', function(e) {
                this.style.transform = '';
            });
        });
    }
    
    // Предотвращаем масштабирование при двойном тапе на кнопки
    document.addEventListener('touchstart', function(e) {
        if (e.target.tagName === 'BUTTON') {
            e.preventDefault();
        }
    }, { passive: false });
    
    // Перерисовываем график после полной загрузки
    window.addEventListener('load', function() {
        setTimeout(() => {
            myChart.resize();
            updateChartSize();
        }, 100);
    });
});
