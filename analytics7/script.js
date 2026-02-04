// Данные из JSON
// Глобальные переменные
let companyData = [];
let currentCompanyChart = null;

// Определяем объекты франчайзи (для фильтра "Все франчайзи") и их порядок сортировки
const franchiseObjects = [
    "Рязанка", "Исаковского", "Красноярск", "Шипиловская", 
    "Новая Рига", "Истра", "Рубцовская", "Мурино", "Лобачевского", 
    "Уфа", "Пришвина", "ОД", "Коминтерна", "Звездная", 
    "Озерная", "Земляной вал"
];

// Функция для сортировки объектов в пользовательском порядке
function sortObjectsCustom(objects) {
    return objects.sort((a, b) => {
        const indexA = franchiseObjects.indexOf(a);
        const indexB = franchiseObjects.indexOf(b);
        
        // Если оба объекта в списке сортировки
        if (indexA !== -1 && indexB !== -1) {
            return indexA - indexB;
        }
        
        // Если только a в списке сортировки
        if (indexA !== -1) {
            return -1;
        }
        
        // Если только b в списке сортировки
        if (indexB !== -1) {
            return 1;
        }
        
        // Если ни один не в списке сортировки - обычная сортировка
        return a.localeCompare(b);
    });
}

// Основная функция инициализации
function initFranchiseAnalytics() {
    console.log('Инициализация аналитики франчайзи...');
    
    if (typeof royaltyData === 'undefined' || !Array.isArray(royaltyData) || royaltyData.length === 0) {
        console.error('Данные royaltyData не загружены или пусты!', royaltyData);
        document.getElementById('companyFileInfo').textContent = 'Ошибка: данные не загружены или пусты';
        return;
    }
    
    console.log('Данные получены:', royaltyData.length, 'записей');
    companyData = processJsonData(royaltyData);
    console.log('Обработано записей:', companyData.length);
    
    if (companyData.length > 0) {
        populateFilters(companyData);
        document.getElementById('chartLoading').style.display = 'none';
        document.getElementById('companyFileInfo').textContent = `Загружено ${companyData.length} записей. Используйте фильтры для настройки графика`;
    } else {
        document.getElementById('companyFileInfo').textContent = 'Нет данных для построения графика';
        document.getElementById('chartLoading').textContent = 'Нет данных для отображения';
    }
}

// Функция для получения ключа месяца из строки вида "Июн 2023"
function getMonthKeyFromString(monthName) {
    const monthMap = {
        'Янв': '01', 'Фев': '02', 'Мар': '03', 'Апр': '04',
        'Май': '05', 'Июн': '06', 'Июл': '07', 'Авг': '08',
        'Сен': '09', 'Окт': '10', 'Ноя': '11', 'Дек': '12'
    };
    
    try {
        const parts = monthName.split(' ');
        if (parts.length === 2) {
            const monthStr = monthMap[parts[0]];
            const year = parts[1];
            if (monthStr && year) {
                return `${year}-${monthStr}`;
            }
        }
    } catch (e) {
        console.warn('Ошибка преобразования месяца:', monthName, e);
    }
    return null;
}

// Функция для форматирования месяца и года в строку
function formatMonthYear(month, year) {
    const monthNames = [
        'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн',
        'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'
    ];
    return `${monthNames[month - 1]} ${year}`;
}

// Функция для форматирования валюты
function formatCurrency(value) {
    if (value === 0 || value === null) return '0';
    const absValue = Math.abs(value);
    const roundedValue = Math.round(value);
    
    if (absValue >= 1000000) {
        const inMillions = roundedValue / 1000000;
        if (inMillions >= 1.85 && inMillions < 2.15) {
            return '2M';
        }
        return inMillions.toFixed(1) + 'M';
    } else if (absValue >= 1000) {
        return (roundedValue / 1000).toFixed(0) + 'k';
    }
    return roundedValue.toLocaleString('ru-RU', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
}

// Процессинг данных из JSON
function processJsonData(data) {
    const processedData = data.map(item => {
        const monthKey = getMonthKeyFromString(item["Дата"]);
        const [year, month] = monthKey ? monthKey.split('-') : ['2023', '01'];
        
        // Создаем запись с данными
        return {
            'Месяц': monthKey,
            'Объект': item["Объект"],
            'Адрес': item["Объект"], // Используем объект как адрес
            'Выручка': item["Выручка"] || 0,
            'Операционная прибыль': item["Операционная прибыль"] || 0,
            'monthKey': monthKey,
            'month': parseInt(month),
            'year': parseInt(year),
            'monthName': item["Дата"]
        };
    }).filter(item => item['Месяц'] !== null);

    console.log('Обработано записей:', processedData.length);
    if (processedData.length > 0) {
        console.log('Пример обработанной записи:', processedData[0]);
    }
    
    return processedData;
}

// Агрегация данных по месяцам
function aggregateMonthlyData(data, selectedMonths = null, selectedObjects = null, selectedAddresses = null) {
    const monthlyAggregated = {};

    data.forEach(row => {
        const monthKey = row['Месяц'];
        const object = row['Объект'];
        const address = row['Адрес'];

        if (!monthKey) return;

        // Проверяем, выбран ли месяц
        if (selectedMonths && selectedMonths.length > 0) {
            if (!selectedMonths.includes(monthKey)) return;
        }

        // Фильтрация по объектам
        if (selectedObjects && selectedObjects.length > 0) {
            let objectMatch = false;

            if (selectedObjects.includes('all_franchise')) {
                objectMatch = franchiseObjects.includes(object);
            } else {
                objectMatch = selectedObjects.includes(object);
            }

            if (!objectMatch) return;
        }

        // Фильтрация по адресам
        if (selectedAddresses && selectedAddresses.length > 0) {
            let addressMatch = false;

            if (selectedAddresses.includes(address)) {
                addressMatch = true;
            }

            if (!addressMatch) return;
        }

        if (!monthlyAggregated[monthKey]) {
            const [yearStr, monthStr] = monthKey.split('-');
            const year = parseInt(yearStr);
            const month = parseInt(monthStr);

            monthlyAggregated[monthKey] = {
                monthKey: monthKey,
                monthName: formatMonthYear(month, year),
                month: month,
                year: year,
                revenue: 0,
                operatingProfit: 0
            };
        }

        const monthData = monthlyAggregated[monthKey];

        // Суммируем выручку и прибыль
        monthData.revenue += row['Выручка'] || 0;
        monthData.operatingProfit += row['Операционная прибыль'] || 0;
    });

    // Преобразуем объект в массив и сортируем по дате
    const result = Object.values(monthlyAggregated);
    result.sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.month - b.month;
    });

    console.log('Агрегировано месяцев:', result.length);
    return result;
}

// Функция для получения всех доступных месяцев из данных
function getAllAvailableMonths(data) {
    const monthSet = new Set();

    data.forEach(row => {
        const monthKey = row['Месяц'];
        if (monthKey) {
            monthSet.add(monthKey);
        }
    });

    const months = Array.from(monthSet).sort();
    console.log('Найдено месяцев:', months.length);
    return months;
}

// Функция для получения всех объектов из данных
function getAllObjects(data) {
    const objectSet = new Set();

    data.forEach(row => {
        const object = row['Объект'];
        if (object) {
            objectSet.add(object);
        }
    });

    const objects = Array.from(objectSet);
    // Применяем пользовательскую сортировку
    const sortedObjects = sortObjectsCustom(objects);
    console.log('Найдено объектов:', sortedObjects.length);
    return sortedObjects;
}

// Функция для получения всех адресов из данных
function getAllAddresses(data) {
    const addressSet = new Set();

    data.forEach(row => {
        const address = row['Адрес'];
        if (address) {
            addressSet.add(address);
        }
    });

    const addresses = Array.from(addressSet);
    // Применяем пользовательскую сортировку
    const sortedAddresses = sortObjectsCustom(addresses);
    console.log('Найдено адресов:', sortedAddresses.length);
    return sortedAddresses;
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

// Функция для обновления фильтра адресов при выборе объекта
function updateAddressFilterForMonths(selectedObject, data) {
    const addressSelect = document.getElementById('addressSelect');
    if (!addressSelect) return;

    const currentSelected = Array.from(addressSelect.selectedOptions).map(opt => opt.value);

    let filteredAddresses;

    if (selectedObject === 'all_franchise') {
        // Для "Все франчайзи" показываем все адреса из данных
        filteredAddresses = getAllAddresses(data);
    } else if (selectedObject && selectedObject !== '') {
        // Адреса для конкретного объекта
        filteredAddresses = [...new Set(data
            .filter(row => row['Объект'] === selectedObject)
            .map(row => row['Адрес']))].filter(Boolean);
        // Применяем пользовательскую сортировку
        filteredAddresses = sortObjectsCustom(filteredAddresses);
    } else {
        // Все адреса
        filteredAddresses = getAllAddresses(data);
    }

    addressSelect.innerHTML = '<option value="">Все адреса</option>';

    filteredAddresses.forEach(address => {
        const option = document.createElement('option');
        option.value = address;
        option.textContent = address;

        if (currentSelected.includes(address)) {
            option.selected = true;
        }

        addressSelect.appendChild(option);
    });

    updateSelectedInfo('addressSelected', addressSelect);
}

// Заполнение фильтров
function populateFilters(data) {
    console.log('Настройка фильтров...');

    // Получаем объекты с пользовательской сортировкой
    const objects = getAllObjects(data);

    // Настраиваем фильтр объектов
    const objectSelect = document.getElementById('objectSelect');
    
    objectSelect.innerHTML = '<option value="">Все объекты</option><option value="all_franchise">Все франчайзи</option>';
    
    // Добавляем объекты из данных с сохранением порядка сортировки
    objects.forEach(obj => {
        const option = document.createElement('option');
        option.value = obj;
        option.textContent = obj;
        objectSelect.appendChild(option);
    });

    // Настраиваем фильтр адресов
    const addressSelect = document.getElementById('addressSelect');
    addressSelect.innerHTML = '<option value="">Все адреса</option>';
    
    // Добавляем адреса из данных с пользовательской сортировкой
    const addresses = getAllAddresses(data);
    addresses.forEach(address => {
        const option = document.createElement('option');
        option.value = address;
        option.textContent = address;
        addressSelect.appendChild(option);
    });

    // Получаем и заполняем список месяцев
    const availableMonths = getAllAvailableMonths(data);
    populateMonthFilter(availableMonths);

    // Показываем фильтры
    const filtersElement = document.getElementById('filters');
    if (filtersElement) {
        filtersElement.style.display = 'flex';
    }

    // Добавляем обработчики событий
    const monthSelect = document.getElementById('monthSelect');
    if (monthSelect) {
        monthSelect.addEventListener('change', function () {
            updateSelectedInfo('monthSelected', this);
            applyFilters();
        });
    }

    objectSelect.addEventListener('change', function () {
        updateSelectedInfo('objectSelected', this);
        updateAddressFilterForMonths(this.value, data);
        applyFilters();
    });

    addressSelect.addEventListener('change', function () {
        updateSelectedInfo('addressSelected', this);
        applyFilters();
    });

    updateSelectedInfo('objectSelected', objectSelect);
    updateSelectedInfo('addressSelected', addressSelect);
    updateSelectedInfo('monthSelected', monthSelect);

    applyFilters();
}

function updateSelectedInfo(containerId, selectElement) {
    const selectedOptions = Array.from(selectElement.selectedOptions)
        .map(option => option.value)
        .filter(value => value && value !== '');

    const container = document.getElementById(containerId);
    if (selectedOptions.length > 0) {
        if (selectElement.id === 'objectSelect' && selectedOptions.includes('all_franchise')) {
            container.textContent = 'Все франчайзи';
        } else if (selectElement.id === 'monthSelect') {
            container.textContent = `Выбрано: ${selectedOptions.length} месяцев`;
        } else {
            container.textContent = `Выбрано: ${selectedOptions.length}`;
        }
    } else {
        if (selectElement.id === 'monthSelect') {
            container.textContent = 'Все месяцы';
        } else {
            container.textContent = 'Все';
        }
    }
}

function getSelectedMonths() {
    const monthSelect = document.getElementById('monthSelect');
    const selectedMonths = Array.from(monthSelect.selectedOptions)
        .map(option => option.value)
        .filter(value => value && value !== '');

    return selectedMonths.length > 0 ? selectedMonths : null;
}

function getSelectedObjects() {
    const objectSelect = document.getElementById('objectSelect');
    const selectedObjects = Array.from(objectSelect.selectedOptions)
        .map(option => option.value)
        .filter(value => value && value !== '');

    return selectedObjects.length > 0 ? selectedObjects : null;
}

function getSelectedAddresses() {
    const addressSelect = document.getElementById('addressSelect');
    const selectedAddresses = Array.from(addressSelect.selectedOptions)
        .map(option => option.value)
        .filter(value => value && value !== '');

    return selectedAddresses.length > 0 ? selectedAddresses : null;
}

function applyFilters() {
    const selectedMonths = getSelectedMonths();
    const selectedObjects = getSelectedObjects();
    const selectedAddresses = getSelectedAddresses();

    console.log('Применение фильтров:', { selectedMonths, selectedObjects, selectedAddresses });

    const dataToDisplay = aggregateMonthlyData(companyData, selectedMonths, selectedObjects, selectedAddresses);

    let infoText = `Показано месяцев: ${dataToDisplay.length}`;
    if (selectedMonths) {
        infoText += ` | Выбрано месяцев: ${selectedMonths.length}`;
    }
    if (selectedObjects) {
        infoText += ` | Объектов: ${selectedObjects.length}`;
    }

    document.getElementById('companyFileInfo').textContent = infoText;

    if (dataToDisplay.length > 0) {
        buildChart(dataToDisplay, selectedObjects);
    } else {
        document.getElementById('companyChart').innerHTML = '<div class="loading">Нет данных для выбранных фильтров</div>';
        document.getElementById('statsInfo').innerHTML = '';
    }
}

// Построение графика
function buildChart(data, selectedObjects) {
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
    const profitData = [];
    const profitabilityData = [];

    data.forEach((item, index) => {
        // Округляем значения
        const roundedRevenue = Math.round(item.revenue);
        const roundedProfit = Math.round(item.operatingProfit);
        
        revenueData.push(roundedRevenue);
        profitData.push(roundedProfit);

        // Рентабельность
        const profitability = item.revenue !== 0 ? (roundedProfit / roundedRevenue) * 100 : 0;
        profitabilityData.push(profitability);
    });

    // Считаем итоги
    const totalRevenue = revenueData.reduce((sum, value) => sum + value, 0);
    const totalProfit = profitData.reduce((sum, value) => sum + value, 0);
    const avgProfitability = totalRevenue !== 0 ? (totalProfit / totalRevenue) * 100 : 0;

    let titleText = 'Аналитика франчайзи: Выручка и Операционная прибыль';
    let subtitle = `Рентабельность: ${avgProfitability.toFixed(1)}%`;

    if (selectedObjects) {
        if (selectedObjects.includes('all_franchise')) {
            subtitle += ` | Все франчайзи`;
        } else if (selectedObjects.length === 1) {
            subtitle += ` | Объект: ${selectedObjects[0]}`;
        } else {
            subtitle += ` | Объектов: ${selectedObjects.length}`;
        }
    }

    const chartData = data;

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
        toolbox: {
            feature: {
                magicType: {
                    type: ['stack']
                },
                saveAsImage: {
                    title: 'Сохранить',
                    pixelRatio: 2
                }
            },
            right: 20,
            top: 50
        },
        legend: {
            data: ['Выручка', 'Операционная прибыль'],
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
                const item = chartData[index];

                params.forEach(param => {
                    const value = formatCurrency(param.value);
                    const seriesName = param.seriesName;
                    result += `${seriesName}: ${value}<br/>`;
                });

                const profitability = profitabilityData[index];
                const profitColor = profitability >= 0 ? '#28a745' : '#dc3545';
                result += `<span style="color: ${profitColor}; font-weight: bold;">Рентабельность: ${profitability.toFixed(1)}%</span>`;

                result += `</div>`;
                return result;
            }
        },
        xAxis: {
            type: 'category',
            data: labels,
            axisLine: { onZero: true },
            splitLine: { show: false },
            axisLabel: {
                interval: 0,
                rotate: labels.length > 12 ? 45 : 0
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
                name: 'Операционная прибыль',
                type: 'bar',
                itemStyle: {
                    color: '#FF9800'
                },
                label: {
                    show: true,
                    position: 'inside',
                    formatter: function (params) {
                        return formatCurrency(params.value);
                    },
                    fontSize: 10,
                    fontWeight: 'bold',
                    color: '#ffffff'
                },
                data: profitData,
            },
            {
                name: 'Выручка',
                type: 'bar',
                itemStyle: {
                    color: '#FFE0B2'
                },
                label: {
                    show: true,
                    position: 'top',
                    formatter: function (params) {
                        return formatCurrency(params.value);
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
    updateStats(totalRevenue, totalProfit, avgProfitability);

    window.addEventListener('resize', function () {
        try {
            chart.resize();
        } catch (e) {
            console.warn('Ошибка при изменении размера графика:', e);
        }
    });
}

function updateStats(revenue, profit, profitability) {
    let statsHtml = `
        <div class="stat-item revenue">Выручка: ${formatCurrency(revenue)}</div>
        <div class="stat-item ${profit >= 0 ? 'positive' : 'negative'}">Операционная прибыль: ${formatCurrency(profit)}</div>
        <div class="stat-item ${profitability >= 0 ? 'positive' : 'negative'}">Рентабельность: ${profitability.toFixed(1)}%</div>
    `;

    document.getElementById('statsInfo').innerHTML = statsHtml;
}
