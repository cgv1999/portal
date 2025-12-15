// Встроенные JSON данные
const pnlData = [
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
let companyData = [];
let companyExpensesData = [];
let companyExpensesFileLoaded = false;
let currentCompanyChart = null;
let allColumns = [];

// Определяем объекты розницы
const retailObjects = [
    "Козубенко Денис",
    "Сенатов Кирилл",
    "Большаков Максим",
    "Мозговой Филипп",
    "Данилов Алексей",
    "Ичко Роман",
    "Юрлов Денис"
];

// Функция для парсинга даты из строки в формате DD.MM.YYYY
function parseDate(dateStr) {
    try {
        if (!dateStr) return null;
        const [day, month, year] = dateStr.split('.').map(Number);
        return new Date(year, month - 1, day);
    } catch (e) {
        console.warn('Ошибка парсинга даты:', dateStr, e);
        return null;
    }
}

// Функция для форматирования даты в формат DD.MM.YYYY
function formatDate(dateStr) {
    if (!dateStr) return '';
    try {
        const date = parseDate(dateStr);
        if (!date) return dateStr;
        
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        
        return `${day}.${month}.${year}`;
    } catch (e) {
        console.warn('Ошибка форматирования даты:', dateStr, e);
        return dateStr;
    }
}

// Функция для получения месяца и года из даты
function getMonthYearFromDate(dateStr) {
    try {
        const date = parseDate(dateStr);
        if (!date) return null;
        
        const month = date.getMonth() + 1; // 1-12
        const year = date.getFullYear();
        return { month, year };
    } catch (e) {
        console.warn('Ошибка получения месяца из даты:', dateStr, e);
        return null;
    }
}

// Функция для форматирования месяца и года в строку
function formatMonthYear(month, year) {
    const monthNames = [
        'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн',
        'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'
    ];
    return `${monthNames[month - 1]} ${year}`;
}

// Функция для получения ключа месяца (YYYY-MM)
function getMonthKey(dateStr) {
    const monthYear = getMonthYearFromDate(dateStr);
    if (!monthYear) return null;
    return `${monthYear.year}-${monthYear.month.toString().padStart(2, '0')}`;
}

function formatCurrency(value) {
    if (value === 0) return '0';
    const absValue = Math.abs(value);
    if (absValue >= 1000000) {
        return (value / 1000000).toFixed(1) + 'M';
    } else if (absValue >= 1000) {
        return (value / 1000).toFixed(0) + 'k';
    }
    return value.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

// Функция для форматирования числа с разделителями
function formatNumber(value) {
    if (value === 0 || value === '0') return '0';
    if (typeof value === 'string') {
        const num = parseFloat(value.replace(',', '.'));
        if (isNaN(num)) return value;
        value = num;
    }
    return value.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Функция для загрузки данных о расходах компании из JSON
function loadCompanyExpensesData(data) {
    companyExpensesData = [];

    data.forEach(row => {
        const date = row['Дата'];
        if (date) {
            const formattedDate = formatDate(date);
            const generalExpense = parseFloat(String(row['Общий расход']).replace(',', '.')) || 0;
            const salaryExpense = parseFloat(String(row['З/п офис']).replace(',', '.')) || 0;

            companyExpensesData.push({
                дата: formattedDate,
                общий_расход: generalExpense,
                зп_офис: salaryExpense
            });
        }
    });

    console.log('Загружены данные о расходах компании:', companyExpensesData);
    companyExpensesFileLoaded = true;
}

function processCompanyData(data) {
    // Сохраняем все столбцы из данных
    if (data.length > 0) {
        allColumns = Object.keys(data[0]);
    }

    return data.map(row => {
        const processedRow = {};
        for (const key in row) {
            if (key === 'Дата' || key === 'Объект' || key === 'Адрес') {
                processedRow[key] = row[key];
            } else {
                let value = row[key];
                if (typeof value === 'string') {
                    value = value.replace(/\s/g, '').replace(',', '.');
                    value = value.replace(/[^\d.-]/g, '');
                }
                processedRow[key] = parseFloat(value) || 0;
            }
        }
        return processedRow;
    });
}

// Агрегация данных по месяцам
function aggregateMonthlyData(data, selectedMonths = null, selectedObjects = null, selectedAddresses = null) {
    const monthlyAggregated = {};

    const isAllObjects = !selectedObjects || selectedObjects.length === 0 || (selectedObjects.length === 1 && selectedObjects[0] === 'all');
    const isAllAddresses = !selectedAddresses || selectedAddresses.length === 0;
    const shouldIncludeCompanyExpenses = isAllObjects && isAllAddresses && companyExpensesFileLoaded;
    const shouldIncludeFranchiseBonus = isAllObjects && isAllAddresses;

    data.forEach(row => {
        const date = row['Дата'];
        const object = row['Объект'];
        const address = row['Адрес'];

        if (!date) return;

        // Проверяем, выбран ли месяц
        if (selectedMonths && selectedMonths.length > 0) {
            const monthKey = getMonthKey(date);
            if (!monthKey || !selectedMonths.includes(monthKey)) return;
        }

        if (selectedObjects && selectedObjects.length > 0) {
            if (selectedObjects.includes('all_retail')) {
                if (!retailObjects.includes(object)) return;
            } else if (!selectedObjects.includes('all')) {
                if (!selectedObjects.includes(object)) return;
            }
        }

        if (selectedAddresses && selectedAddresses.length > 0 && !selectedAddresses.includes(address)) return;

        const monthKey = getMonthKey(date);
        if (!monthKey) return;

        if (!monthlyAggregated[monthKey]) {
            const monthYear = getMonthYearFromDate(date);
            monthlyAggregated[monthKey] = {
                monthKey: monthKey,
                monthName: formatMonthYear(monthYear.month, monthYear.year),
                month: monthYear.month,
                year: monthYear.year,
                revenue: 0,
                operatingProfit: 0,
                autoChemistry: 0,
                utilities: 0,
                rent: 0,
                salary: 0,
                commissions: 0,
                taxes: 0,
                vat: 0,
                other: 0,
                indivisibleExpense: 0,
                franchiseBonus: 0,
                generalExpense: 0,
                salaryOfficeExpense: 0,
                adjustedOperatingProfit: 0,
                dayCount: 0,
                rawData: {}
            };
        }

        const monthData = monthlyAggregated[monthKey];

        monthData.revenue += (row['Выручка'] || 0) + (row['Выручка Сайт'] || 0);

        if (shouldIncludeFranchiseBonus) {
            const franchiseBonus = row['Франшиза сопровождение бонус'] || 0;
            monthData.revenue += franchiseBonus;
            monthData.franchiseBonus += franchiseBonus;
        }

        monthData.operatingProfit += row['Операционная прибыль'] || 0;

        monthData.autoChemistry +=
            (row['Автохимия Шампунь Москва'] || 0) +
            (row['Автохимия Шампунь СПБ'] || 0) +
            (row['Автохимия Пена'] || 0) +
            (row['Автохимия Юр. Лица'] || 0) +
            (row['Автохимия Абонементы/сертификаты/подписки'] || 0);

        monthData.utilities +=
            (row['Коммунальные расходы'] || 0) +
            (row['Коммунальные расходы Абонементы/сертификаты/подписки'] || 0);

        monthData.rent += row['Аренда'] || 0;
        monthData.salary += row['Зарплата'] || 0;
        monthData.commissions += row['Комиссии'] || 0;
        monthData.taxes += row['Налоги'] || 0;
        monthData.vat += row['НДС'] || 0;
        monthData.other += row['Прочие'] || 0;
        monthData.indivisibleExpense += row['Неделимый расход'] || 0;
        monthData.dayCount++;

        // Сохраняем сырые данные для каждого месяца
        for (const key in row) {
            if (key !== 'Дата' && key !== 'Объект' && key !== 'Адрес') {
                if (!monthData.rawData[key]) monthData.rawData[key] = 0;
                monthData.rawData[key] += row[key] || 0;
            }
        }
    });

    // Добавляем общие расходы компании для каждого месяца
    if (shouldIncludeCompanyExpenses) {
        // Группируем расходы по месяцам
        const monthlyExpenses = {};
        
        companyExpensesData.forEach(expense => {
            const monthKey = getMonthKey(expense.дата);
            if (!monthKey) return;
            
            if (!monthlyExpenses[monthKey]) {
                monthlyExpenses[monthKey] = {
                    generalExpense: 0,
                    salaryExpense: 0
                };
            }
            
            monthlyExpenses[monthKey].generalExpense += expense.общий_расход || 0;
            monthlyExpenses[monthKey].salaryExpense += expense.зп_офис || 0;
        });

        // Применяем расходы к соответствующим месяцам
        Object.keys(monthlyAggregated).forEach(monthKey => {
            if (monthlyExpenses[monthKey]) {
                monthlyAggregated[monthKey].generalExpense = monthlyExpenses[monthKey].generalExpense;
                monthlyAggregated[monthKey].salaryOfficeExpense = monthlyExpenses[monthKey].salaryExpense;
                
                monthlyAggregated[monthKey].adjustedOperatingProfit =
                    monthlyAggregated[monthKey].operatingProfit +
                    monthlyAggregated[monthKey].generalExpense +
                    monthlyAggregated[monthKey].salaryOfficeExpense;
            } else {
                monthlyAggregated[monthKey].adjustedOperatingProfit = monthlyAggregated[monthKey].operatingProfit;
            }
        });
    } else {
        Object.keys(monthlyAggregated).forEach(monthKey => {
            monthlyAggregated[monthKey].adjustedOperatingProfit = monthlyAggregated[monthKey].operatingProfit;
        });
    }

    // Преобразуем объект в массив и сортируем по дате
    const result = Object.values(monthlyAggregated);
    result.sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.month - b.month;
    });

    return result;
}

// Функция для получения всех доступных месяцев из данных
function getAllAvailableMonths(data) {
    const monthSet = new Set();
    
    data.forEach(row => {
        const date = row['Дата'];
        if (!date) return;
        
        const monthKey = getMonthKey(date);
        if (monthKey) {
            monthSet.add(monthKey);
        }
    });
    
    // Добавляем месяцы из расходов компании
    companyExpensesData.forEach(expense => {
        const monthKey = getMonthKey(expense.дата);
        if (monthKey) {
            monthSet.add(monthKey);
        }
    });
    
    return Array.from(monthSet).sort();
}

// Функция для заполнения селектора месяцев
function populateMonthFilter(months) {
    const monthSelect = document.getElementById('monthSelect');
    monthSelect.innerHTML = '';
    
    months.forEach(monthKey => {
        const [year, month] = monthKey.split('-');
        const monthName = formatMonthYear(parseInt(month), parseInt(year));
        
        const option = document.createElement('option');
        option.value = monthKey;
        option.textContent = monthName;
        monthSelect.appendChild(option);
    });
    
    // Выбираем все месяцы по умолчанию
    const options = monthSelect.options;
    for (let i = 0; i < options.length; i++) {
        options[i].selected = true;
    }
    
    updateSelectedInfo('monthSelected', monthSelect);
}

function populateFilters(data) {
    const objects = [...new Set(data.map(row => row['Объект']))]
        .filter(Boolean)
        .filter(obj => obj !== "Продажа объекта/агентские" && !obj.toLowerCase().includes('франшиза роялти'));

    const addresses = [...new Set(data.map(row => row['Адрес']))].filter(Boolean);

    const objectSelect = document.getElementById('objectSelect');
    objectSelect.innerHTML = '<option value="all">Все объекты</option>';

    const allRetailOption = document.createElement('option');
    allRetailOption.value = 'all_retail';
    allRetailOption.textContent = 'Вся розница';
    objectSelect.appendChild(allRetailOption);

    const orderedObjects = [];

    const retailOrder = [
        "Козубенко Денис",
        "Сенатов Кирилл",
        "Большаков Максим",
        "Мозговой Филипп",
        "Данилов Алексей",
        "Ичко Роман",
        "Юрлов Денис"
    ];

    retailOrder.forEach(retailObj => {
        if (objects.includes(retailObj)) {
            orderedObjects.push(retailObj);
        }
    });

    const specialObjects = [
        "Юр. Лица",
        "Абонементы/сертификаты",
        "Подписка на мойку",
        "Франшиза отдел продаж",
        "Развитие",
        "Франшиза отдел сопровождения"
    ];

    specialObjects.forEach(specialObj => {
        if (objects.includes(specialObj)) {
            orderedObjects.push(specialObj);
        }
    });

    const remainingObjects = objects.filter(obj =>
        ![...retailOrder, ...specialObjects].includes(obj)
    );

    remainingObjects.sort((a, b) => a.localeCompare(b));
    orderedObjects.push(...remainingObjects);

    orderedObjects.forEach(object => {
        const option = document.createElement('option');
        option.value = object;
        option.textContent = object;
        objectSelect.appendChild(option);
    });

    const addressSelect = document.getElementById('addressSelect');
    addressSelect.innerHTML = '<option value="all">Все адреса</option>';
    addresses.forEach(address => {
        const option = document.createElement('option');
        option.value = address;
        option.textContent = address;
        addressSelect.appendChild(option);
    });

    // Получаем и заполняем список месяцев
    const availableMonths = getAllAvailableMonths(data);
    populateMonthFilter(availableMonths);

    document.getElementById('filters').style.display = 'flex';

    // Добавляем обработчики событий
    document.getElementById('monthSelect').addEventListener('change', function () {
        updateSelectedInfo('monthSelected', this);
        applyFilters();
    });

    objectSelect.addEventListener('change', function () {
        updateSelectedInfo('objectSelected', this);
        applyFilters();
    });

    addressSelect.addEventListener('change', function () {
        updateSelectedInfo('addressSelected', this);
        applyFilters();
    });

    updateSelectedInfo('objectSelected', objectSelect);
    updateSelectedInfo('addressSelected', addressSelect);
    updateSelectedInfo('monthSelected', document.getElementById('monthSelect'));
    
    applyFilters();
}

function updateSelectedInfo(containerId, selectElement) {
    const selectedOptions = Array.from(selectElement.selectedOptions)
        .map(option => option.value)
        .filter(value => value && (selectElement.id !== 'monthSelect' || value !== 'all'));

    const container = document.getElementById(containerId);
    if (selectedOptions.length > 0) {
        if (selectElement.id === 'objectSelect' && selectedOptions.includes('all_retail')) {
            container.textContent = 'Вся розница';
        } else if (selectElement.id === 'monthSelect') {
            container.textContent = `Выбрано: ${selectedOptions.length} месяцев`;
        } else {
            container.textContent = `Выбрано: ${selectedOptions.length}`;
        }
        container.title = selectedOptions.join(', ');
    } else {
        if (selectElement.id === 'monthSelect') {
            container.textContent = 'Все месяцы';
        } else {
            container.textContent = 'Все';
        }
        container.title = '';
    }
}

function getSelectedMonths() {
    const monthSelect = document.getElementById('monthSelect');
    const selectedMonths = Array.from(monthSelect.selectedOptions)
        .map(option => option.value);

    return selectedMonths.length > 0 ? selectedMonths : null;
}

function getSelectedObjects() {
    const objectSelect = document.getElementById('objectSelect');
    const selectedObjects = Array.from(objectSelect.selectedOptions)
        .map(option => option.value)
        .filter(value => value && value !== 'all');

    return selectedObjects.length > 0 ? selectedObjects : null;
}

function getSelectedAddresses() {
    const addressSelect = document.getElementById('addressSelect');
    const selectedAddresses = Array.from(addressSelect.selectedOptions)
        .map(option => option.value)
        .filter(value => value && value !== 'all');

    return selectedAddresses.length > 0 ? selectedAddresses : null;
}

function applyFilters() {
    const selectedMonths = getSelectedMonths();
    const selectedObjects = getSelectedObjects();
    const selectedAddresses = getSelectedAddresses();
    
    const dataToDisplay = aggregateMonthlyData(companyData, selectedMonths, selectedObjects, selectedAddresses);
    
    let infoText = `Показано месяцев: ${dataToDisplay.length}`;
    if (selectedMonths) {
        infoText += ` | Выбрано месяцев: ${selectedMonths.length}`;
    }

    const isAllObjectsFlag = !selectedObjects || selectedObjects.length === 0 || (selectedObjects.length === 1 && selectedObjects[0] === 'all');
    const isAllAddressesFlag = !selectedAddresses || selectedAddresses.length === 0;

    if (isAllObjectsFlag && isAllAddressesFlag && companyExpensesFileLoaded) {
        infoText += ' | Учтены: Общий расход, З/п офис';
    }

    if (isAllObjectsFlag && isAllAddressesFlag) {
        infoText += ' | Учтен: Франшиза сопровождение бонус';
    }

    document.getElementById('companyFileInfo').textContent = infoText;

    if (dataToDisplay.length > 0) {
        buildChart(dataToDisplay, selectedObjects, selectedAddresses);
    } else {
        document.getElementById('companyChart').innerHTML = '<div class="loading">Нет данных для выбранных фильтров</div>';
        document.getElementById('statsInfo').innerHTML = '';
    }
}

function buildChart(data, selectedObjects, selectedAddresses) {
    const chartContainer = document.getElementById('companyChart');
    chartContainer.innerHTML = '';

    try {
        if (currentCompanyChart && !currentCompanyChart.isDisposed()) {
            currentCompanyChart.dispose();
        }
    } catch (e) {
        console.warn('Ошибка при удалении графика:', e);
    }

    if (!data || data.length === 0) {
        chartContainer.innerHTML = '<div class="loading">Нет данных для отображения</div>';
        return;
    }

    const chart = echarts.init(chartContainer);
    currentCompanyChart = chart;

    const labels = data.map(item => item.monthName);
    const revenueData = [];
    const positiveProfitData = [];
    const negativeProfitData = [];
    const profitabilityData = [];
    const franchiseBonusData = [];

    data.forEach(item => {
        revenueData.push(item.revenue);

        const profit = item.adjustedOperatingProfit;
        if (profit > 0) {
            positiveProfitData.push(profit);
            negativeProfitData.push(0);
        } else if (profit < 0) {
            positiveProfitData.push(0);
            negativeProfitData.push(profit);
        } else {
            positiveProfitData.push(0);
            negativeProfitData.push(0);
        }

        const profitability = item.revenue !== 0 ? (profit / item.revenue) * 100 : -100;
        profitabilityData.push(profitability);

        franchiseBonusData.push(item.franchiseBonus || 0);
    });

    const emphasisStyle = {
        itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0,0,0,0.3)'
        }
    };

    const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
    const totalProfit = data.reduce((sum, item) => sum + item.adjustedOperatingProfit, 0);
    const avgProfitability = totalRevenue !== 0 ? (totalProfit / totalRevenue) * 100 : -100;

    const totalFranchiseBonus = data.reduce((sum, item) => sum + (item.franchiseBonus || 0), 0);

    let titleText = 'Финансовые показатели по всей компании (по месяцам)';
    let subtitle = `Рентабельность: ${avgProfitability.toFixed(1)}%`;

    if (selectedObjects) {
        if (selectedObjects.includes('all_retail')) {
            subtitle += ` | Объект: Вся розница`;
        } else {
            subtitle += ` | Объектов: ${selectedObjects.length}`;
        }
    }
    if (selectedAddresses) {
        subtitle += ` | Адресов: ${selectedAddresses.length}`;
    }

    const isAllObjectsFlag = !selectedObjects || selectedObjects.length === 0 || (selectedObjects.length === 1 && selectedObjects[0] === 'all');
    const isAllAddressesFlag = !selectedAddresses || selectedAddresses.length === 0;

    if (isAllObjectsFlag && isAllAddressesFlag && companyExpensesFileLoaded) {
        subtitle += ' | Учтены: Общий расход, З/п офис';
    }

    if (isAllObjectsFlag && isAllAddressesFlag) {
        subtitle += ' | Учтен: Франшиза сопровождение бонус';
    }

    const option = {
        title: {
            text: titleText,
            subtext: subtitle,
            left: 'center',
            textStyle: {
                fontSize: 16,
                fontWeight: 'bold'
            }
        },
        legend: {
            data: ['Прибыль (+)', 'Прибыль (-)', 'Выручка'],
            left: '10%',
            top: 50,
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            },
            formatter: function (params) {
                let result = `<div style="text-align: left">`;
                result += `<strong>${params[0].name}</strong><br/>`;

                const index = params[0].dataIndex;
                const item = data[index];

                params.forEach(param => {
                    if (param.value !== 0) {
                        const value = formatCurrency(param.value);
                        const seriesName = param.seriesName;
                        result += `${seriesName}: ${value}<br/>`;
                    }
                });

                const bonus = franchiseBonusData[index];
                if (bonus !== 0) {
                    result += `<span style="color: #28a745;">Франшиза сопровождение бонус: ${formatCurrency(bonus)}</span><br/>`;
                }

                const profitability = profitabilityData[index];
                const profitColor = profitability >= 0 ? '#28a745' : '#dc3545';
                result += `<span style="color: ${profitColor}; font-weight: bold;">Рентабельность: ${profitability.toFixed(1)}%</span>`;

                if (item.dayCount) {
                    result += `<br/><span style="color: #666;">Дней в месяце: ${item.dayCount}</span>`;
                }

                result += `</div>`;
                return result;
            }
        },
        toolbox: {
            feature: {
                magicType: {
                    type: ['stack']
                },
                dataView: {
                    show: true,
                    readOnly: true,
                    title: 'Данные',
                    lang: ['Таблица данных', 'Закрыть', 'Обновить'],
                    optionToContent: function (opt) {
                        const table = document.createElement('div');
                        table.style.width = '100%';
                        table.style.maxHeight = '500px';
                        table.style.overflow = 'auto';

                        const tableContent = document.createElement('table');
                        tableContent.className = 'data-view-table';

                        const thead = document.createElement('thead');
                        const headerRow = document.createElement('tr');

                        const monthHeader = document.createElement('th');
                        monthHeader.textContent = 'Месяц';
                        monthHeader.style.textAlign = 'center';
                        monthHeader.style.position = 'sticky';
                        monthHeader.style.left = '0';
                        monthHeader.style.zIndex = '20';
                        monthHeader.style.backgroundColor = '#f2f2f2';
                        headerRow.appendChild(monthHeader);

                        allColumns.forEach(column => {
                            if (column !== 'Дата' && column !== 'Объект' && column !== 'Адрес') {
                                const th = document.createElement('th');
                                th.textContent = column;
                                th.style.textAlign = 'center';
                                headerRow.appendChild(th);
                            }
                        });

                        thead.appendChild(headerRow);
                        tableContent.appendChild(thead);

                        const tbody = document.createElement('tbody');

                        data.forEach(item => {
                            const row = document.createElement('tr');

                            const monthCell = document.createElement('td');
                            monthCell.textContent = item.monthName;
                            monthCell.style.textAlign = 'center';
                            monthCell.style.position = 'sticky';
                            monthCell.style.left = '0';
                            monthCell.style.zIndex = '10';
                            monthCell.style.backgroundColor = 'white';
                            row.appendChild(monthCell);

                            allColumns.forEach(column => {
                                if (column !== 'Дата' && column !== 'Объект' && column !== 'Адрес') {
                                    const td = document.createElement('td');
                                    let value = 0;

                                    if (item.rawData && item.rawData[column] !== undefined) {
                                        value = item.rawData[column];
                                    }

                                    td.textContent = formatNumber(value);
                                    row.appendChild(td);
                                }
                            });

                            tbody.appendChild(row);
                        });

                        tableContent.appendChild(tbody);
                        table.appendChild(tableContent);

                        return table;
                    },
                    contentToOption: function () {
                        return null;
                    }
                },
                saveAsImage: {
                    title: 'Сохранить',
                    pixelRatio: 2
                }
            },
            right: 20,
            top: 50
        },
        xAxis: {
            type: 'category',
            data: labels,
            axisLine: { onZero: true },
            splitLine: { show: false },
            splitArea: { show: false },
            axisLabel: {
                interval: 0,
                rotate: 0,
                formatter: function (value) {
                    return value;
                }
            }
        },
        yAxis: {
            show: true,
            type: 'value',
            name: 'Сумма',
            axisLabel: {
                formatter: formatCurrency
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '15%',
            top: 100,
            containLabel: true
        },
        series: [
            {
                name: 'Прибыль (+)',
                type: 'bar',
                stack: 'profit',
                emphasis: emphasisStyle,
                itemStyle: {
                    color: '#FF9800'
                },
                label: {
                    show: true,
                    position: 'inside',
                    formatter: function (params) {
                        return params.value !== 0 ? formatCurrency(params.value) : '';
                    },
                    fontSize: 10,
                    fontWeight: 'bold',
                    color: '#ffffff'
                },
                data: positiveProfitData
            },
            {
                name: 'Прибыль (-)',
                type: 'bar',
                stack: 'profit',
                emphasis: emphasisStyle,
                itemStyle: {
                    color: '#FF9800'
                },
                label: {
                    show: true,
                    position: 'inside',
                    formatter: function (params) {
                        return params.value !== 0 ? formatCurrency(params.value) : '';
                    },
                    fontSize: 10,
                    fontWeight: 'bold',
                    color: '#F44336'
                },
                data: negativeProfitData
            },
            {
                name: 'Выручка',
                type: 'bar',
                emphasis: emphasisStyle,
                itemStyle: {
                    color: '#FFE0B2'
                },
                label: {
                    show: true,
                    position: 'top',
                    formatter: function (params) {
                        return params.value !== 0 ? formatCurrency(params.value) : '';
                    },
                    fontSize: 10,
                    fontWeight: 'bold',
                    color: '#000000'
                },
                data: revenueData
            }
        ]
    };

    chart.setOption(option);
    
    const showFranchiseBonus = isAllObjectsFlag && isAllAddressesFlag;
    updateStats(totalRevenue, totalProfit, avgProfitability, totalFranchiseBonus, showFranchiseBonus);

    const resizeHandler = function () {
        try {
            chart.resize();
        } catch (e) {
            console.warn('Ошибка при изменении размера графика:', e);
        }
    };

    window.addEventListener('resize', resizeHandler);

    chart.resizeHandler = resizeHandler;
}

function updateStats(revenue, profit, profitability, franchiseBonus = 0, showFranchiseBonus = false) {
    let statsHtml = `
        <div class="stat-item revenue">Выручка: ${formatCurrency(revenue)}</div>
    `;

    if (showFranchiseBonus && franchiseBonus !== 0) {
        statsHtml += `<div class="stat-item bonus">Франшиза сопровождение бонус: ${formatCurrency(franchiseBonus)}</div>`;
    }

    statsHtml += `
        <div class="stat-item ${profit >= 0 ? 'positive' : 'negative'}">Прибыль: ${formatCurrency(profit)}</div>
        <div class="stat-item ${profitability >= 0 ? 'positive' : 'negative'}">Рентабельность: ${profitability.toFixed(1)}%</div>
    `;

    document.getElementById('statsInfo').innerHTML = statsHtml;
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function () {
    // Загружаем данные из встроенных JSON
    companyData = processCompanyData(pnlData);
    loadCompanyExpensesData(expensesData);

    if (companyData.length > 0) {
        populateFilters(companyData);
        document.getElementById('chartLoading').style.display = 'none';
    } else {
        document.getElementById('companyFileInfo').textContent = 'Нет данных для построения графика';
    }
});