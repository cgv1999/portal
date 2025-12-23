// ИНИЦИАЛИЗАЦИЯ ГЛАВНОЙ АНИМАЦИИ
const chartDom = document.getElementById('main');
const myChart = echarts.init(chartDom);

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
                    fontSize: 140,
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

myChart.setOption(option);

// ОТСЛЕЖИВАНИЕ ЗАВЕРШЕНИЯ АНИМАЦИИ
myChart.on('finished', function() {
    console.log('Анимация NDA завершена');
});

// ФУНКЦИЯ ЗАГРУЗКИ АНАЛИТИКИ
function loadAnalytics(analyticsName) {
    console.log(`Загрузка: ${analyticsName}`);
    
    // Скрываем главный экран
    document.querySelector('.container').style.display = 'none';
    
    // Показываем контейнер с аналитикой
    const container = document.getElementById('analytics-container');
    const frame = document.getElementById('analytics-frame');
    
    container.style.display = 'block';
    
    // Загружаем аналитику в iframe
    frame.src = `${analyticsName}/index.html`;
    
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
    }, 100);
    
    console.log('Возврат на главный экран');
}

// ОБРАБОТЧИК ИЗМЕНЕНИЯ РАЗМЕРА ОКНА
window.addEventListener('resize', function() {
    myChart.resize();
});

// ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ СТРАНИЦЫ
document.addEventListener('DOMContentLoaded', function() {
    console.log('PORTAL Analytics загружен');
});
