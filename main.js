// Версия: 2.0

console.log('NDA Analytics Portal v2.0 загружен');
console.log('Время загрузки:', new Date().toLocaleString());

// Глобальные переменные
let chartDom, myChart;
let animationCompleted = false;
let isInitialLoad = true;

// ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM загружен, инициализация...');
    
    // Инициализация ECharts
    chartDom = document.getElementById('main');
    if (!chartDom) {
        console.error('Элемент #main не найден!');
        return;
    }
    
    myChart = echarts.init(chartDom);
    
    // Проверка на мобильное устройство
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
        document.body.classList.add('mobile-device');
        console.log('Мобильное устройство обнаружено');
    }
    
    // Настройка анимации
    setupAnimation();
    
    // Настройка обработчиков событий
    setupEventHandlers();
    
    // Запуск анимации
    setTimeout(startAnimation, 100);
});

// НАСТРОЙКА АНИМАЦИИ NDA
function setupAnimation() {
    const isMobile = document.body.classList.contains('mobile-device');
    const fontSize = isMobile ? (window.innerWidth <= 480 ? 70 : 90) : 140;
    const animationDuration = isMobile ? 2000 : 2500;
    
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
                        lineWidth: isMobile ? 3 : 4
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
    
    myChart.setOption(option);
}

// ЗАПУСК АНИМАЦИИ
function startAnimation() {
    console.log('Запуск анимации NDA...');
    
    // Слушаем завершение анимации
    myChart.on('finished', function() {
        console.log('Анимация NDA завершена');
        animationCompleted = true;
        
        // Скрываем NDA и показываем кнопки
        setTimeout(() => {
            hideNDA();
            showButtons();
        }, 500);
    });
    
    // На случай если анимация не сработает
    setTimeout(() => {
        if (!animationCompleted) {
            console.log('Автоматический показ кнопок (таймаут)');
            hideNDA();
            showButtons();
        }
    }, 3500);
}

// СКРЫТЬ NDA
function hideNDA() {
    if (chartDom) {
        chartDom.style.opacity = '0';
        chartDom.style.pointerEvents = 'none';
    }
}

// ПОКАЗАТЬ КНОПКИ
function showButtons() {
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
    
    console.log('Кнопки показаны');
}

// НАСТРОЙКА ОБРАБОТЧИКОВ СОБЫТИЙ
function setupEventHandlers() {
    // Обработка изменения размера окна
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            if (myChart) {
                myChart.resize();
                setupAnimation();
            }
        }, 200);
    });
    
    // Настройка touch событий для кнопок
    const buttons = document.querySelectorAll('.portal-button, .back-button');
    buttons.forEach(button => {
        button.addEventListener('touchstart', function() {
            this.style.opacity = '0.9';
        });
        
        button.addEventListener('touchend', function() {
            this.style.opacity = '1';
        });
    });
    
    // Предотвращение двойного тапа для масштабирования
    document.addEventListener('touchstart', function(event) {
        if (event.touches.length > 1) {
            event.preventDefault();
        }
    }, { passive: false });
}

// ЗАГРУЗКА АНАЛИТИКИ
function loadAnalytics(analyticsName) {
    console.log(`Загрузка аналитики: ${analyticsName}`);
    
    // Скрываем главный экран
    const container = document.querySelector('.container');
    if (container) container.style.display = 'none';
    
    // Показываем контейнер аналитики
    const analyticsContainer = document.getElementById('analytics-container');
    const frame = document.getElementById('analytics-frame');
    
    if (analyticsContainer) {
        analyticsContainer.style.display = 'block';
    }
    
    // Загружаем iframe с параметром для избежания кэширования
    if (frame) {
        const timestamp = Date.now();
        frame.src = `${analyticsName}/index.html?nocache=${timestamp}`;
    }
    
    // Запоминаем какая аналитика загружена
    sessionStorage.setItem('lastAnalytics', analyticsName);
}

// ВОЗВРАТ НА ГЛАВНЫЙ ЭКРАН
function returnToMain() {
    console.log('Возврат на главный экран');
    
    // Скрываем контейнер аналитики
    const analyticsContainer = document.getElementById('analytics-container');
    if (analyticsContainer) {
        analyticsContainer.style.display = 'none';
    }
    
    // Очищаем iframe
    const frame = document.getElementById('analytics-frame');
    if (frame) {
        frame.src = 'about:blank';
    }
    
    // Показываем главный экран
    const container = document.querySelector('.container');
    if (container) {
        container.style.display = 'flex';
    }
    
    // Сбрасываем анимацию
    resetAnimation();
}

// СБРОС АНИМАЦИИ
function resetAnimation() {
    // Скрываем кнопки
    const buttonsContainer = document.getElementById('buttons-container');
    const subtitle = document.getElementById('subtitle');
    
    if (buttonsContainer) {
        buttonsContainer.style.opacity = '0';
        buttonsContainer.style.transform = 'translateY(30px)';
    }
    
    if (subtitle) {
        subtitle.style.opacity = '0';
        subtitle.style.transform = 'translateY(20px)';
    }
    
    // Показываем NDA
    if (chartDom) {
        chartDom.style.opacity = '1';
        chartDom.style.pointerEvents = 'auto';
    }
    
    // Сбрасываем флаги
    animationCompleted = false;
    
    // Перезапускаем анимацию
    setTimeout(() => {
        if (myChart) {
            myChart.resize();
            setupAnimation();
            setTimeout(startAnimation, 100);
        }
    }, 100);
}

// ДОПОЛНИТЕЛЬНЫЕ ФУНКЦИИ
function refreshAnalytics() {
    const frame = document.getElementById('analytics-frame');
    if (frame && frame.src) {
        const url = new URL(frame.src);
        url.searchParams.set('refresh', Date.now());
        frame.src = url.toString();
        console.log('Аналитика обновлена');
    }
}

function getCurrentVersion() {
    return '2.0';
}

// Экспорт функций для глобального доступа
window.loadAnalytics = loadAnalytics;
window.returnToMain = returnToMain;
window.refreshAnalytics = refreshAnalytics;
window.getCurrentVersion = getCurrentVersion;
