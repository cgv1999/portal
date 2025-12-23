// Версия для контроля кэширования
// main.js?v=1.2

// ИНИЦИАЛИЗАЦИЯ ГЛАВНОЙ АНИМАЦИИ
const chartDom = document.getElementById('main');
const myChart = echarts.init(chartDom);
let animationCompleted = false;

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

// Функция для показа кнопок после анимации
function showButtons() {
    if (animationCompleted) return;
    
    animationCompleted = true;
    
    // Скрываем анимацию NDA
    setTimeout(() => {
        chartDom.style.opacity = '0';
        chartDom.style.pointerEvents = 'none';
        
        // Показываем кнопки с анимацией
        const buttonsContainer = document.getElementById('buttons-container');
        const subtitle = document.getElementById('subtitle');
        
        if (buttonsContainer) {
            buttonsContainer.style.opacity = '1';
            buttonsContainer.style.transform = 'translateY(0)';
        }
        
        if (subtitle) {
            setTimeout(() => {
                subtitle.style.opacity = '1';
                subtitle.style.transform = 'translateY(0)';
            }, 300);
        }
    }, 800); // Задержка после завершения анимации
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
    setTimeout(showButtons, 500); // Задержка перед показом кнопок
});

// Альтернатива: если анимация не сработала, показать кнопки через 3 секунды
setTimeout(() => {
    if (!animationCompleted) {
        console.log('Автоматический показ кнопок (таймаут)');
        showButtons();
    }
}, 3500);

// ФУНКЦИЯ ЗАГРУЗКИ АНАЛИТИКИ
function loadAnalytics(analyticsName) {
    console.log(`Загрузка: ${analyticsName}`);
    
    // Добавляем вибрацию на мобильных (если поддерживается)
    if (navigator.vibrate && isMobile()) {
        navigator.vibrate(50);
    }
    
    // Скрываем главный экран
    document.querySelector('.container').style.display = 'none';
    
    // Показываем контейнер с аналитикой
    const container = document.getElementById('analytics-container');
    const frame = document.getElementById('analytics-frame');
    
    container.style.display = 'block';
    
    // Добавляем параметр времени для обхода кэширования
    const timestamp = new Date().getTime();
    const analyticsUrl = `${analyticsName}/index.html?t=${timestamp}`;
    
    // Загружаем аналитику в iframe
    frame.src = analyticsUrl;
    
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
    
    // Очищаем iframe с параметром для очистки кэша
    document.getElementById('analytics-frame').src = 'about:blank';
    
    // Показываем главный экран
    const container = document.querySelector('.container');
    container.style.display = 'flex';
    
    // Возвращаем анимацию NDA
    chartDom.style.opacity = '1';
    chartDom.style.pointerEvents = 'auto';
    
    // Скрываем кнопки
    const buttonsContainer = document.getElementById('buttons-container');
    const subtitle = document.getElementById('subtitle');
    
    if (buttonsContainer) {
        buttonsContainer.style.opacity = '0';
        buttonsContainer.style.transform = 'translateY(20px)';
    }
    
    if (subtitle) {
        subtitle.style.opacity = '0';
        subtitle.style.transform = 'translateY(10px)';
    }
    
    // Сбрасываем флаг анимации
    animationCompleted = false;
    
    // Перезапускаем анимацию
    setTimeout(() => {
        myChart.resize();
        myChart.setOption(getChartOptions(), true);
        
        // Запускаем показ кнопок через 3 секунды
        setTimeout(() => {
            showButtons();
        }, 3000);
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

// Функция для обновления iframe без кэширования
function refreshIframe(iframeId) {
    const iframe = document.getElementById(iframeId);
    if (iframe) {
        const src = iframe.src;
        const separator = src.indexOf('?') === -1 ? '?' : '&';
        const newSrc = src + separator + 'nocache=' + new Date().getTime();
        iframe.src = newSrc;
    }
}

// Автоматический рефреш iframe при видимости (если вкладка была скрыта)
document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'visible') {
        const container = document.getElementById('analytics-container');
        if (container.style.display === 'block') {
            refreshIframe('analytics-frame');
        }
    }
});
