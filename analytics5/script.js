const paymentsData = [
    {
        "***": "",
        "Наименование": "Nan",
        "Сумма": "456 820,20",
        "Статья": "Nan",
        "Ответственный": "Nan",
        "Мойка": "Общий расход",
        "Команда": "",
        "Дата оплаты": "06.01.2025",
        "Мойка, статья": ""
    },
    {
        "***": "",
        "Наименование": "Nan",
        "Сумма": "456 820,20",
        "Статья": "Nan",
        "Ответственный": "Nan",
        "Мойка": "Общий расход",
        "Команда": "Розница",
        "Дата оплаты": "06.01.2025",
        "Мойка, статья": ""
    },
    // ... добавьте остальные данные
    {
        "***": "",
        "Наименование": "Автохимия под продажу",
        "Сумма": "727 083,33",
        "Статья": "Автохимия",
        "Ответственный": "",
        "Мойка": "Франшиза отдел сопровождения",
        "Команда": "",
        "Дата оплаты": "05.12.2025",
        "Мойка, статья": ""
    }
];

// 2. Данные P&L
const plData = [
    {
        "Дата": "10.11.2025",
        "Объект": "Козубенко Денис",
        "Адрес": "ДМИТРОВСКОЕ",
        "Выручка": "91368",
        "Выручка Сайт": "0",
        "Автохимия Шампунь Москва": "-3306,548571",
        "Автохимия Шампунь СПБ": "0",
        "Автохимия Пена": "-971,4285714",
        "Автохимия Юр. Лица": "0",
        "Автохимия Абонементы/сертификаты/подписки": "0",
        "Коммунальные расходы": "-6395,76",
        "Коммунальные расходы Абонементы/сертификаты/подписки": "0",
        "Аренда": "-2138,304",
        "Зарплата": "-12726,97211",
        "Комиссии": "-2101,464",
        "Налоги": "-5482,08",
        "НДС": "-4350,857143",
        "Прочие": "0",
        "Неделимый расход": "-25183,65719",
        "Франшиза сопровождение бонус": "0",
        "Операционная прибыль": "28710,92842"
    },
    // ... добавьте остальные данные
    {
        "Дата": "09.12.2025",
        "Объект": "Франшиза роялти",
        "Адрес": "Франшиза роялти",
        "Выручка": "1176277",
        "Выручка Сайт": "0",
        "Автохимия Шампунь Москва": "0",
        "Автохимия Шампунь СПБ": "0",
        "Автохимия Пена": "0",
        "Автохимия Юр. Лица": "0",
        "Автохимия Абонементы/сертификаты/подписки": "0",
        "Коммунальные расходы": "0",
        "Коммунальные расходы Абонементы/сертификаты/подписки": "0",
        "Аренда": "0",
        "Зарплата": "0",
        "Комиссии": "0",
        "Налоги": "0",
        "НДС": "0",
        "Прочие": "0",
        "Неделимый расход": "0",
        "Франшиза сопровождение бонус": "0",
        "Операционная прибыль": "1176277"
    }
];

// 3. Данные зарплаты офиса
const expensesData = [
    {
        "Дата": "01.12.2025",
        "Общий расход": "-456820,1934",
        "З/п офис": "-1389062,5"
    },
    {
        "Дата": "02.12.2025",
        "Общий расход": "-1529647,576",
        "З/п офис": "-1713870,968"
    },
    {
        "Дата": "03.12.2025",
        "Общий расход": "-1209717,494",
        "З/п офис": "-1713870,968"
    },
    {
        "Дата": "04.12.2025",
        "Общий расход": "-1140787,959",
        "З/п офис": "-1713870,968"
    },
    {
        "Дата": "05.12.2025",
        "Общий расход": "-1154541,991",
        "З/п офис": "-1312500"
    },
    {
        "Дата": "06.12.2025",
        "Общий расход": "-1241949,976",
        "З/п офис": "-1312500"
    },
    {
        "Дата": "07.12.2025",
        "Общий расход": "-1216957,311",
        "З/п офис": "-1312500"
    }
];

// Глобальные переменные
let currentChart = null;

// Определяем целевые категории
const targetCategories = [
    'Маркетинг и реклама',
    'Оборудование для мойки',
    'Материалы робота'
];

// Функция для преобразования суммы
function parseAmount(value) {
    if (typeof value === 'string') {
        value = value.replace(/\s/g, '').replace(',', '.');
        value = value.replace(/[^\d.-]/g, '');
    }
    return parseFloat(value) || 0;
}

// Функция для преобразования даты в формате дд.мм.гггг в Date
function parseDate(dateStr) {
    if (!dateStr || dateStr.trim() === '') return null;
    
    // Убираем лишние пробелы
    dateStr = dateStr.trim();
    
    // Пробуем разные форматы дат
    if (dateStr.includes('.')) {
        const parts = dateStr.split('.');
        if (parts.length === 3) {
            // Проверяем корректность частей
            const day = parseInt(parts[0]);
            const month = parseInt(parts[1]) - 1;
            const year = parseInt(parts[2]);
            
            if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                const date = new Date(year, month, day);
                if (!isNaN(date.getTime())) {
                    return date;
                }
            }
        }
    } else if (dateStr.includes('-')) {
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
            return date;
        }
    }
    
    return null;
}

// Функция для форматирования даты в строку дд.мм.гггг
function formatDate(date) {
    if (!(date instanceof Date) || isNaN(date.getTime())) return '';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
}

// Функция для форматирования валюты
function formatCurrency(value) {
    if (value === 0) return '0';
    const absValue = Math.abs(value);
    if (absValue >= 1000000) {
        return (value / 1000000).toFixed(1) + 'M';
    } else if (absValue >= 1000) {
        return (value / 1000).toFixed(0) + 'k';
    }
    return value.toLocaleString('ru-RU', {minimumFractionDigits: 0, maximumFractionDigits: 0});
}

// Функция для получения всех дат в заданном периоде
function getAllDatesInPeriod() {
    const dateFrom = document.getElementById('dateFrom').value;
    const dateTo = document.getElementById('dateTo').value;
    
    if (!dateFrom || !dateTo) return [];
    
    const start = new Date(dateFrom);
    const end = new Date(dateTo);
    
    if (start > end) {
        alert('Дата начала не может быть позже даты окончания');
        return [];
    }
    
    const dates = [];
    const currentDate = new Date(start);
    
    while (currentDate <= end) {
        dates.push(formatDate(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
}

// Функция для обработки данных оплат
function processPaymentsData() {
    const categories = {};
    const allDates = getAllDatesInPeriod();
    if (allDates.length === 0) return {};

    // Инициализируем категории
    targetCategories.forEach(category => {
        categories[category] = {};
        allDates.forEach(date => {
            categories[category][date] = 0;
        });
    });

    // Обрабатываем каждую строку данных оплат
    paymentsData.forEach(row => {
        const paymentDateStr = row['Дата оплаты'];
        if (!paymentDateStr) return;

        const paymentDate = parseDate(paymentDateStr);
        if (!paymentDate) return;
        
        const formattedDate = formatDate(paymentDate);
        
        // Проверяем, что дата в списке всех дат (в периоде)
        if (!allDates.includes(formattedDate)) return;

        const article = row['Статья'] || '';
        const amount = Math.abs(parseAmount(row['Сумма'] || 0));
        
        if (amount === 0) return;

        let matchedCategory = null;

        // Проверяем категории
        if (article.includes('Маркетинг') || article.includes('Реклама')) {
            matchedCategory = 'Маркетинг и реклама';
        } else if (article.includes('Оборудование')) {
            matchedCategory = 'Оборудование для мойки';
        } else if ((article.includes('Расх') && article.includes('робот')) || 
                  (article.includes('материалы') && article.includes('робот'))) {
            matchedCategory = 'Материалы робота';
        }

        if (!matchedCategory) return;

        // Добавляем сумму к категории на эту дату
        categories[matchedCategory][formattedDate] += amount;
    });

    // Удаляем пустые категории
    const result = {};
    Object.keys(categories).forEach(category => {
        // Проверяем, есть ли данные в категории
        const hasData = Object.values(categories[category]).some(value => value > 0);
        if (hasData) {
            result[category] = categories[category];
        }
    });

    return result;
}

// Функция для обработки данных зарплат из P&L и расходов
function processSalaryData() {
    const salaryData = {};
    const allDates = getAllDatesInPeriod();
    if (allDates.length === 0) return {};
    
    // Инициализируем зарплату нулями
    allDates.forEach(date => {
        salaryData[date] = 0;
    });

    // 1. Обрабатываем P&L данные (зарплата из P&L)
    plData.forEach(row => {
        // Пробуем разные названия столбцов с датой
        const dateStr = row['Дата'] || row['Date'] || row['DATE'] || row['дата'];
        if (!dateStr) return;

        const rowDate = parseDate(dateStr);
        if (!rowDate) return;
        
        const formattedDate = formatDate(rowDate);
        
        // Проверяем, что дата в списке всех дат (в периоде)
        if (!allDates.includes(formattedDate)) return;

        // Получаем зарплату из P&L
        const salary = Math.abs(parseAmount(row['Зарплата'] || 0));
        
        if (salary > 0) {
            salaryData[formattedDate] += salary;
        }
    });

    // 2. Обрабатываем данные зарплаты офиса
    expensesData.forEach(row => {
        const dateStr = row['Дата'];
        if (!dateStr) return;

        const rowDate = parseDate(dateStr);
        if (!rowDate) return;
        
        const formattedDate = formatDate(rowDate);
        
        // Проверяем, что дата в списке всех дат (в периоде)
        if (!allDates.includes(formattedDate)) return;

        // Получаем з/п офис
        const officeSalary = Math.abs(parseAmount(row['З/п офис'] || 0));
        if (officeSalary > 0) {
            salaryData[formattedDate] += officeSalary;
        }
    });

    return salaryData;
}

// Функция для объединения всех данных
function combineAllData() {
    const paymentsResult = processPaymentsData();
    const salaryResult = processSalaryData();
    
    const allCategories = {
        'Зарплата': salaryResult,
        ...paymentsResult
    };

    const allDates = getAllDatesInPeriod();

    let totalExpenses = 0;
    Object.values(allCategories).forEach(categoryData => {
        Object.values(categoryData).forEach(amount => {
            totalExpenses += amount;
        });
    });

    return {
        categories: allCategories,
        allDates,
        totalExpenses
    };
}

// Функция для построения графика
function buildExpenseChart(combinedData) {
    const { categories, allDates, totalExpenses } = combinedData;
    
    if (currentChart) {
        currentChart.dispose();
        currentChart = null;
    }
    
    const chart = echarts.init(document.getElementById('expenseChart'));
    currentChart = chart;

    // Подготавливаем данные для dataset
    const datasetSource = [['product'].concat(allDates)];

    // Добавляем данные для каждой категории
    Object.entries(categories).forEach(([category, dateData]) => {
        const rowData = [category];
        allDates.forEach(date => {
            const value = dateData[date] || 0;
            rowData.push(value);
        });
        datasetSource.push(rowData);
    });

    // Обновляем статистику
    updateStats(totalExpenses, Object.keys(categories).length, allDates.length);

    const option = {
        legend: {},
        tooltip: {
            trigger: 'axis',
            showContent: false
        },
        dataset: {
            source: datasetSource
        },
        xAxis: { 
            type: 'category',
            axisLabel: {
                interval: 0, // Показываем все даты
                rotate: 45,
                fontSize: 10,
                margin: 8,
                formatter: function(value) {
                    return value; // Показываем полную дату дд.мм.гггг
                }
            },
            axisTick: {
                show: true,
                alignWithLabel: true
            }
        },
        yAxis: { 
            gridIndex: 0,
            axisLabel: {
                formatter: function(value) {
                    return formatCurrency(value);
                }
            }
        },
        grid: { 
            top: '55%',
            left: '10%',
            right: '10%',
            bottom: '20%',
            containLabel: true
        },
        series: (function() {
            const series = [];
            const colors = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de'];
            
            // Добавляем линейные графики для каждой категории
            Object.keys(categories).forEach((category, index) => {
                series.push({
                    type: 'line',
                    smooth: true,
                    seriesLayoutBy: 'row',
                    emphasis: { 
                        focus: 'series' 
                    },
                    name: category,
                    lineStyle: {
                        width: 2,
                        color: colors[index % colors.length]
                    },
                    itemStyle: {
                        color: colors[index % colors.length]
                    },
                    symbol: 'circle',
                    symbolSize: 6,
                    showSymbol: true
                });
            });

            // Добавляем круговую диаграмму
            series.push({
                type: 'pie',
                id: 'pie',
                radius: '30%',
                center: ['50%', '25%'],
                emphasis: {
                    focus: 'self'
                },
                label: {
                    formatter: '{b}: {@' + allDates[0] + '} ({d}%)'
                },
                encode: {
                    itemName: 'product',
                    value: allDates[0],
                    tooltip: allDates[0]
                }
            });

            return series;
        })()
    };

    // Обработчик для обновления круговой диаграммы при наведении
    chart.on('updateAxisPointer', function (event) {
        const xAxisInfo = event.axesInfo[0];
        if (xAxisInfo) {
            const dimension = xAxisInfo.value + 1;
            chart.setOption({
                series: {
                    id: 'pie',
                    label: {
                        formatter: '{b}: {@[' + dimension + ']} ({d}%)'
                    },
                    encode: {
                        value: dimension,
                        tooltip: dimension
                    }
                }
            });
        }
    });

    chart.setOption(option);
    
    window.addEventListener('resize', function() {
        chart.resize();
    });
}

function updateStats(totalExpenses, categoriesCount, daysCount) {
    const dateFrom = document.getElementById('dateFrom').value;
    const dateTo = document.getElementById('dateTo').value;
    
    const formattedFrom = formatDate(new Date(dateFrom));
    const formattedTo = formatDate(new Date(dateTo));
    
    const statsHtml = `
        <div class="stat-item">Общая сумма: ${formatCurrency(totalExpenses)}</div>
        <div class="stat-item">Категорий: ${categoriesCount}</div>
        <div class="stat-item">Дней: ${daysCount}</div>
        <div class="stat-item">Период: ${formattedFrom} - ${formattedTo}</div>
    `;
    document.getElementById('statsInfo').innerHTML = statsHtml;
}

// Функция для автоматического обновления графика при изменении дат
function autoUpdateChart() {
    // Небольшая задержка для избежания частых обновлений
    clearTimeout(window.chartUpdateTimeout);
    window.chartUpdateTimeout = setTimeout(function() {
        try {
            const combinedData = combineAllData();
            
            if (Object.keys(combinedData.categories).length > 0 && combinedData.allDates.length > 0) {
                buildExpenseChart(combinedData);
            }
        } catch (error) {
            console.error('Ошибка при обновлении графика:', error);
        }
    }, 300); // Задержка 300 мс
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Устанавливаем значения по умолчанию для дат
    document.getElementById('dateFrom').value = '2025-11-10';
    document.getElementById('dateTo').value = '2025-12-09';
    
    // Добавляем обработчики изменения дат для автоматического обновления
    document.getElementById('dateFrom').addEventListener('change', autoUpdateChart);
    document.getElementById('dateTo').addEventListener('change', autoUpdateChart);
    
    // Строим график при загрузке страницы
    setTimeout(() => {
        autoUpdateChart();
    }, 100);
});