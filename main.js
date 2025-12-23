// ИНИЦИАЛИЗАЦИЯ ГЛАВНОЙ АНИМАЦИИ
const chartDom = document.getElementById('main');
const myChart = echarts.init(chartDom);

// Определение мобильного устройства
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
           window.innerWidth <= 768;
}

// Адаптивные настройки для разных устройств
function getChartOptions() {
    const isMobileDevice = isMobile();
    const fontSize = isMobileDevice ? (window.innerWidth <= 480 ? 70 : 90) : 140;
    const animationDuration = isMobileDevice ? 2000 : 2500;
    
    return {
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
                        lineWidth: isMobileDevice ? 3 : 4
                    },
                    keyframeAnimation: {
                        duration: animationDuration,
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
}

// Применяем настройки
myChart.setOption(getChartOptions());

// Добавляем класс для мобильных устройств
if (isMobile()) {
    document.body.classList.add('mobile-device');
    console.log('Мобильное устройство обнаружено');
}

// ОТСЛЕЖИВАНИЕ ЗАВЕРШЕНИЯ АНИМАЦИИ
myChart.on('finished', function() {
    console.log('Анимация NDA завершена');
});

// ФУНКЦИЯ ЗАГРУЗКИ АНАЛИТИКИ
function loadAnalytics(analyticsName) {
    console.log(`Загрузка: ${analyticsName}`);
    
    // Добавляем вибрацию на мобильных (если поддерживается)
    if (navigator.vibrate && isMobile()) {
        navigator.vibrate(50);
    }
    
    // Показываем индикатор загрузки
    showLoading();
    
    // Скрываем главный экран
    document.querySelector('.container').style.display = 'none';
    
    // Показываем контейнер с аналитикой
    const container = document.getElementById('analytics-container');
    const frame = document.getElementById('analytics-frame');
    
    container.style.display = 'block';
    
    // Загружаем аналитику в iframe
    frame.onload = function() {
        hideLoading();
    };
    
    frame.src = `${analyticsName}/index.html`;
    
    console.log(`Аналитика "${analyticsName}" загружена`);
}

// ФУНКЦИЯ ВОЗВРАТА НА ГЛАВНЫЙ ЭКРАН
function returnToMain() {
    // Вибрация на мобильных
    if (navigator.vibrate && isMobile()) {
        navigator.vibrate(30);
    }
    
    // Скрываем контейнер с аналитикой
    document.getElementById('analytics-container').style.display = 'none';
    
    // Очищаем iframe
    document.getElementById('analytics-frame').src = '';
    
    // Показываем главный экран
    document.querySelector('.container').style.display = 'flex';
    
    // Перерисовываем главный график
    setTimeout(() => {
        myChart.resize();
        myChart.setOption(getChartOptions(), true);
    }, 50);
    
    console.log('Возврат на главный экран');
}

// ОБРАБОТЧИК ИЗМЕНЕНИЯ РАЗМЕРА ОКНА
let resizeTimeout;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function() {
        myChart.resize();
        myChart.setOption(getChartOptions(), true);
    }, 200);
});

// Функции индикатора загрузки
function showLoading() {
    let loading = document.getElementById('custom-loading');
    if (!loading) {
        loading = document.createElement('div');
        loading.id = 'custom-loading';
        loading.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: #ff5014;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                z-index: 2000;
                color: white;
                font-size: ${isMobile() ? '18px' : '22px'};
                text-align: center;
                padding: 20px;
            ">
                <div style="font-size: ${isMobile() ? '40px' : '60px'}; margin-bottom: 20px;">📊</div>
                <div>Загрузка аналитики...</div>
                <div style="font-size: ${isMobile() ? '14px' : '16px'}; margin-top: 10px; opacity: 0.8;">
                    Пожалуйста, подождите
                </div>
            </div>
        `;
        document.body.appendChild(loading);
    } else {
        loading.style.display = 'flex';
    }
}

function hideLoading() {
    const loading = document.getElementById('custom-loading');
    if (loading) {
        loading.style.display = 'none';
    }
}

// ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ СТРАНИЦЫ
document.addEventListener('DOMContentLoaded', function() {
    console.log('PORTAL Analytics загружен');
    
    // Настройка touch-событий для кнопок
    const buttons = document.querySelectorAll('.portal-button, .back-button');
    buttons.forEach(button => {
        // Touch события
        button.addEventListener('touchstart', function() {
            this.style.opacity = '0.8';
            this.style.transform = 'scale(0.98)';
        });
        
        button.addEventListener('touchend', function() {
            this.style.opacity = '1';
            this.style.transform = '';
        });
        
        button.addEventListener('touchcancel', function() {
            this.style.opacity = '1';
            this.style.transform = '';
        });
    });
    
    // Предотвращаем масштабирование при двойном тапе
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function(event) {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
    
    // Улучшенная обработка для iOS
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        document.body.style.cursor = 'pointer';
    }
});
