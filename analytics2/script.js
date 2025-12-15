// Встроенные JSON данные из конвертера
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
let allDates = [];
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
        const [day, month, year] = dateStr.split('.').map(Number);
        return new Date(year, month - 1, day);
    } catch (e) {
        return null;
    }
}

// Функция для форматирования даты в формат YYYY-MM-DD для input type="date"
function formatDateForInput(dateStr) {
    try {
        const [day, month, year] = dateStr.split('.').map(Number);
        return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    } catch (e) {
        console.warn('Ошибка форматирования даты для input:', dateStr, e);
        return '';
    }
}

// Функция для определения типа периода
function getPeriodType(dateFrom, dateTo) {
    if (!dateFrom || !dateTo) return 'days';

    const fromDate = new Date(dateFrom);
    const toDate = new Date(dateTo);

    const diffTime = Math.abs(toDate - fromDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

    if (diffDays >= 365 && diffDays <= 366) {
        if (fromDate.getMonth() === 0 && fromDate.getDate() === 1 &&
            toDate.getMonth() === 11 && toDate.getDate() === 31) {
            return 'year';
        }
    }

    if (diffDays >= 89 && diffDays <= 92) {
        const quarterStartMonth = Math.floor(fromDate.getMonth() / 3) * 3;
        const quarterEndMonth = quarterStartMonth + 2;

        if (fromDate.getMonth() === quarterStartMonth && fromDate.getDate() === 1 &&
            toDate.getMonth() === quarterEndMonth) {
            const lastDay = new Date(toDate.getFullYear(), toDate.getMonth() + 1, 0).getDate();
            if (toDate.getDate() === lastDay) {
                return 'quarter';
            }
        }
    }

    if (diffDays >= 28 && diffDays <= 31) {
        if (fromDate.getDate() === 1) {
            const lastDay = new Date(fromDate.getFullYear(), fromDate.getMonth() + 1, 0).getDate();
            if (toDate.getDate() === lastDay &&
                fromDate.getMonth() === toDate.getMonth() &&
                fromDate.getFullYear() === toDate.getFullYear()) {
                return 'month';
            }
        }
    }

    if (diffDays === 7) {
        return 'week';
    }

    return 'days';
}

// Функция для сравнения дат в формате DD.MM.YYYY
function compareDates(dateStr1, dateStr2) {
    try {
        const [day1, month1, year1] = dateStr1.split('.').map(Number);
        const [day2, month2, year2] = dateStr2.split('.').map(Number);

        const date1 = new Date(year1, month1 - 1, day1);
        const date2 = new Date(year2, month2 - 1, day2);

        return date1 - date2;
    } catch (e) {
        return 0;
    }
}

// Функция для проверки, находится ли дата в диапазоне (включая границы)
function isDateInRange(dateStr, fromStr, toStr) {
    if (!fromStr || !toStr) return true;
    
    try {
        const date = parseDate(dateStr);
        if (!date) return true;
        
        // Преобразуем входные даты из формата YYYY-MM-DD
        const fromDate = new Date(fromStr + 'T00:00:00');
        const toDate = new Date(toStr + 'T23:59:59.999');
        
        return date >= fromDate && date <= toDate;
    } catch (e) {
        console.warn('Ошибка при проверке даты в диапазоне:', dateStr, fromStr, toStr, e);
        return true;
    }
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
            const generalExpense = parseFloat(String(row['Общий расход'])) || 0;
            const salaryExpense = parseFloat(String(row['З/п офис'])) || 0;

            companyExpensesData.push({
                дата: date,
                общий_расход: generalExpense,
                зп_офис: salaryExpense
            });
        }
    });

    console.log('Загружены данные о расходах компании:', companyExpensesData);
    companyExpensesFileLoaded = true;
}

// Функция для получения расходов по дате
function getExpensesForDate(date) {
    if (!companyExpensesFileLoaded || !date) return { generalExpense: 0, salaryExpense: 0 };

    const expenseData = companyExpensesData.find(item => item.дата === date);
    if (expenseData) {
        return {
            generalExpense: expenseData.общий_расход,
            salaryExpense: expenseData.зп_офис
        };
    }
    return { generalExpense: 0, salaryExpense: 0 };
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

function aggregateDailyData(data, dateFrom = null, dateTo = null, selectedObjects = null, selectedAddresses = null) {
    const dailyAggregated = {};
    
    const isAllObjects = !selectedObjects || selectedObjects.length === 0 || (selectedObjects.length === 1 && selectedObjects[0] === 'all');
    const isAllAddresses = !selectedAddresses || selectedAddresses.length === 0;
    const shouldIncludeCompanyExpenses = isAllObjects && isAllAddresses && companyExpensesFileLoaded;
    const shouldIncludeFranchiseBonus = isAllObjects && isAllAddresses;
    
    data.forEach(row => {
        const date = row['Дата'];
        const object = row['Объект'];
        const address = row['Адрес'];
        
        if (!date) return;
        
        if (!isDateInRange(date, dateFrom, dateTo)) return;
        
        if (selectedObjects && selectedObjects.length > 0) {
            if (selectedObjects.includes('all_retail')) {
                if (!retailObjects.includes(object)) return;
            } else if (!selectedObjects.includes('all')) {
                if (!selectedObjects.includes(object)) return;
            }
        }
        
        if (selectedAddresses && !selectedAddresses.includes(address)) return;
        
        if (!dailyAggregated[date]) {
            dailyAggregated[date] = {
                date: date,
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
                rawData: JSON.parse(JSON.stringify(row))
            };
        }
        
        const dayData = dailyAggregated[date];
        
        dayData.revenue += (row['Выручка'] || 0) + (row['Выручка Сайт'] || 0);
        
        if (shouldIncludeFranchiseBonus) {
            const franchiseBonus = row['Франшиза сопровождение бонус'] || 0;
            dayData.revenue += franchiseBonus;
            dayData.franchiseBonus = franchiseBonus;
        }
        
        dayData.operatingProfit += row['Операционная прибыль'] || 0;
        
        dayData.autoChemistry += 
            (row['Автохимия Шампунь Москва'] || 0) +
            (row['Автохимия Шампунь СПБ'] || 0) +
            (row['Автохимия Пена'] || 0) +
            (row['Автохимия Юр. Лица'] || 0) +
            (row['Автохимия Абонементы/сертификаты/подписки'] || 0);
        
        dayData.utilities += 
            (row['Коммунальные расходы'] || 0) +
            (row['Коммунальные расходы Абонементы/сертификаты/подписки'] || 0);
        
        dayData.rent += row['Аренда'] || 0;
        dayData.salary += row['Зарплата'] || 0;
        dayData.commissions += row['Комиссии'] || 0;
        dayData.taxes += row['Налоги'] || 0;
        dayData.vat += row['НДС'] || 0;
        dayData.other += row['Прочие'] || 0;
        dayData.indivisibleExpense += row['Неделимый расход'] || 0;
    });
    
    if (shouldIncludeCompanyExpenses) {
        Object.keys(dailyAggregated).forEach(date => {
            const expenses = getExpensesForDate(date);
            dailyAggregated[date].generalExpense = expenses.generalExpense;
            dailyAggregated[date].salaryOfficeExpense = expenses.salaryExpense;
            
            dailyAggregated[date].adjustedOperatingProfit = 
                dailyAggregated[date].operatingProfit + 
                expenses.generalExpense + 
                expenses.salaryExpense;
        });
    } else {
        Object.keys(dailyAggregated).forEach(date => {
            dailyAggregated[date].adjustedOperatingProfit = dailyAggregated[date].operatingProfit;
        });
    }
    
    const result = Object.values(dailyAggregated);
    result.sort((a, b) => compareDates(a.date, b.date));
    
    return result;
}

function populateFilters(data) {
    const rawDates = [...new Set(data.map(row => row['Дата']))].filter(Boolean);

    allDates = rawDates.sort(compareDates);

    if (allDates.length > 0) {
        const minDate = formatDateForInput(allDates[0]);
        const maxDate = formatDateForInput(allDates[allDates.length - 1]);

        document.getElementById('dateFrom').value = minDate;
        document.getElementById('dateTo').value = maxDate;
    }

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

    document.getElementById('filters').style.display = 'flex';

    document.getElementById('dateFrom').addEventListener('change', function () {
        applyFilters();
    });

    document.getElementById('dateTo').addEventListener('change', function () {
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
    applyFilters();
}

function updateSelectedInfo(containerId, selectElement) {
    const selectedOptions = Array.from(selectElement.selectedOptions)
        .map(option => option.value)
        .filter(value => value && value !== 'all');

    const container = document.getElementById(containerId);
    if (selectedOptions.length > 0) {
        if (selectedOptions.includes('all_retail')) {
            container.textContent = 'Вся розница';
        } else {
            container.textContent = `Выбрано: ${selectedOptions.length}`;
        }
        container.title = selectedOptions.join(', ');
    } else {
        container.textContent = 'Все';
        container.title = '';
    }
}

function getDateRange() {
    const dateFrom = document.getElementById('dateFrom').value;
    const dateTo = document.getElementById('dateTo').value;
    
    if (!dateFrom || !dateTo) {
        if (allDates.length > 0) {
            return {
                from: formatDateForInput(allDates[0]),
                to: formatDateForInput(allDates[allDates.length - 1])
            };
        }
    }
    
    return {
        from: dateFrom || null,
        to: dateTo || null
    };
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
    const dateRange = getDateRange();
    const selectedObjects = getSelectedObjects();
    const selectedAddresses = getSelectedAddresses();

    const filteredData = aggregateDailyData(companyData, dateRange.from, dateRange.to, selectedObjects, selectedAddresses);

    updateSelectionInfo(dateRange, selectedObjects, selectedAddresses, filteredData.length);

    if (filteredData.length > 0) {
        buildChart(filteredData, dateRange, selectedObjects, selectedAddresses);
    } else {
        document.getElementById('companyChart').innerHTML = '<div class="loading">Нет данных для выбранных фильтров</div>';
        document.getElementById('statsInfo').innerHTML = '';
    }
}

function updateSelectionInfo(dateRange, objects, addresses, count) {
    let info = `Показано дней: ${count}`;

    if (dateRange.from && dateRange.to) {
        const fromDate = new Date(dateRange.from);
        const toDate = new Date(dateRange.to);
        const diffTime = Math.abs(toDate - fromDate);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

        info += ` | Период: ${dateRange.from} - ${dateRange.to} (${diffDays} дней)`;
    }
    if (objects) {
        if (objects.includes('all_retail')) {
            info += ` | Объект: Вся розница`;
        } else {
            info += ` | Объектов: ${objects.length}`;
        }
    }
    if (addresses) {
        info += ` | Адресов: ${addresses.length}`;
    }

    const isAllObjects = !objects || objects.length === 0;
    const isAllAddresses = !addresses || addresses.length === 0;

    if (isAllObjects && isAllAddresses && companyExpensesFileLoaded) {
        info += ' | Учтены: Общий расход, З/п офис';
    }

    if (isAllObjects && isAllAddresses) {
        info += ' | Учтен: Франшиза сопровождение бонус';
    }

    document.getElementById('companyFileInfo').textContent = info;
}

function buildChart(dailyData, dateRange, selectedObjects, selectedAddresses) {
    const chartContainer = document.getElementById('companyChart');
    chartContainer.innerHTML = '';

    try {
        if (currentCompanyChart && !currentCompanyChart.isDisposed()) {
            currentCompanyChart.dispose();
        }
    } catch (e) {
        console.warn('Ошибка при удалении графика:', e);
    }

    if (!dailyData || dailyData.length === 0) {
        chartContainer.innerHTML = '<div class="loading">Нет данных для отображения</div>';
        return;
    }

    const chart = echarts.init(chartContainer);
    currentCompanyChart = chart;

    const periodType = getPeriodType(dateRange.from, dateRange.to);

    const dateLabels = [];
    const revenueData = [];
    const positiveProfitData = [];
    const negativeProfitData = [];
    const profitabilityData = [];
    const franchiseBonusData = [];

    dailyData.forEach(dayData => {
        dateLabels.push(dayData.date);
        revenueData.push(dayData.revenue);

        const profit = dayData.adjustedOperatingProfit;
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

        const profitability = dayData.revenue !== 0 ? (profit / dayData.revenue) * 100 : -100;
        profitabilityData.push(profitability);

        franchiseBonusData.push(dayData.franchiseBonus || 0);
    });

    const emphasisStyle = {
        itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0,0,0,0.3)'
        }
    };

    const totalRevenue = dailyData.reduce((sum, day) => sum + day.revenue, 0);
    const totalProfit = dailyData.reduce((sum, day) => sum + day.adjustedOperatingProfit, 0);
    const avgProfitability = totalRevenue !== 0 ? (totalProfit / totalRevenue) * 100 : -100;

    const totalFranchiseBonus = dailyData.reduce((sum, day) => sum + (day.franchiseBonus || 0), 0);

    let titleText = 'Финансовые показатели по всей компании';
    let subtitle = `Рентабельность: ${avgProfitability.toFixed(1)}%`;

    let periodTitle = '';
    if (dateRange.from && dateRange.to) {
        if (periodType === 'year') {
            const year = new Date(dateRange.from).getFullYear();
            periodTitle = `за ${year} год`;
        } else if (periodType === 'quarter') {
            const fromDate = new Date(dateRange.from);
            const quarter = Math.floor(fromDate.getMonth() / 3) + 1;
            const year = fromDate.getFullYear();
            periodTitle = `за ${quarter} квартал ${year} года`;
        } else if (periodType === 'month') {
            const fromDate = new Date(dateRange.from);
            const monthNames = [
                'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
                'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
            ];
            periodTitle = `за ${monthNames[fromDate.getMonth()]} ${fromDate.getFullYear()} года`;
        } else if (periodType === 'week') {
            periodTitle = `за неделю ${dateRange.from} - ${dateRange.to}`;
        } else {
            periodTitle = `за период ${dateRange.from} - ${dateRange.to}`;
        }
        subtitle += ` | Период: ${dateRange.from} - ${dateRange.to}`;
    }

    titleText += ' ' + periodTitle;

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

    const isAllObjects = !selectedObjects || selectedObjects.length === 0;
    const isAllAddresses = !selectedAddresses || selectedAddresses.length === 0;

    if (isAllObjects && isAllAddresses && companyExpensesFileLoaded) {
        subtitle += ' | Учтены: Общий расход, З/п офис';
    }

    if (isAllObjects && isAllAddresses) {
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

                const dayIndex = params[0].dataIndex;

                params.forEach(param => {
                    if (param.value !== 0) {
                        const value = formatCurrency(param.value);
                        const seriesName = param.seriesName;
                        result += `${seriesName}: ${value}<br/>`;
                    }
                });

                const bonus = franchiseBonusData[dayIndex];
                if (bonus !== 0) {
                    result += `<span style="color: #28a745;">Франшиза сопровождение бонус: ${formatCurrency(bonus)}</span><br/>`;
                }

                const profitability = profitabilityData[dayIndex];
                const profitColor = profitability >= 0 ? '#28a745' : '#dc3545';
                result += `<span style="color: ${profitColor}; font-weight: bold;">Рентабельность: ${profitability.toFixed(1)}%</span>`;

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

                        const dateHeader = document.createElement('th');
                        dateHeader.textContent = 'Дата';
                        dateHeader.style.textAlign = 'center';
                        dateHeader.style.position = 'sticky';
                        dateHeader.style.left = '0';
                        dateHeader.style.zIndex = '20';
                        dateHeader.style.backgroundColor = '#f2f2f2';
                        headerRow.appendChild(dateHeader);

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

                        dailyData.forEach(dayData => {
                            const row = document.createElement('tr');

                            const dateCell = document.createElement('td');
                            dateCell.textContent = dayData.date;
                            dateCell.style.textAlign = 'center';
                            dateCell.style.position = 'sticky';
                            dateCell.style.left = '0';
                            dateCell.style.zIndex = '10';
                            dateCell.style.backgroundColor = 'white';
                            row.appendChild(dateCell);

                            allColumns.forEach(column => {
                                if (column !== 'Дата' && column !== 'Объект' && column !== 'Адрес') {
                                    const td = document.createElement('td');
                                    let value = 0;

                                    if (dayData.rawData && dayData.rawData[column] !== undefined) {
                                        value = dayData.rawData[column];
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
            data: dateLabels,
            axisLine: { onZero: true },
            splitLine: { show: false },
            splitArea: { show: false },
            axisLabel: {
                interval: 0,
                rotate: 45,
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
    updateStats(totalRevenue, totalProfit, avgProfitability, totalFranchiseBonus, isAllObjects && isAllAddresses);

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
    // Загружаем данные из встроенных JSON (уже с годами в датах)
    companyData = processCompanyData(pnlData);
    loadCompanyExpensesData(expensesData);

    if (companyData.length > 0) {
        populateFilters(companyData);
        document.getElementById('chartLoading').style.display = 'none';
    } else {
        document.getElementById('companyFileInfo').textContent = 'Нет данных для построения графика';
    }
});