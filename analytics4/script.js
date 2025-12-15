const mainData = [
    {
        "Дата": "10.11.2025",
        "Объект": "Козубенко Денис",
        "Адрес": "ДМИТРОВСКОЕ",
        "Выручка": 91368,
        "Выручка Сайт": 0,
        "Автохимия Шампунь Москва": -3306.548571,
        "Автохимия Шампунь СПБ": 0,
        "Автохимия Пена": -971.4285714,
        "Автохимия Юр. Лица": 0,
        "Автохимия Абонементы/сертификаты/подписки": 0,
        "Коммунальные расходы": -6395.76,
        "Коммунальные расходы Абонементы/сертификаты/подписки": 0,
        "Аренда": -2138.304,
        "Зарплата": -12726.97211,
        "Комиссии": -2101.464,
        "Налоги": -5482.08,
        "НДС": -4350.857143,
        "Прочие": 0,
        "Неделимый расход": -25183.65719,
        "Франшиза сопровождение бонус": 0,
        "Операционная прибыль": 28710.92842
    },

    {
        "Дата": "09.12.2025",
        "Объект": "Франшиза отдел сопровождения",
        "Адрес": "Франшиза отдел сопровождения",
        "Выручка": 0,
        "Выручка Сайт": 0,
        "Автохимия Шампунь Москва": 0,
        "Автохимия Шампунь СПБ": 0,
        "Автохимия Пена": 0,
        "Автохимия Юр. Лица": 0,
        "Автохимия Абонементы/сертификаты/подписки": 0,
        "Коммунальные расходы": 0,
        "Коммунальные расходы Абонементы/сертификаты/подписки": 0,
        "Аренда": 0,
        "Зарплата": -54876.85688,
        "Комиссии": 0,
        "Налоги": 0,
        "НДС": 0,
        "Прочие": 0,
        "Неделимый расход": 0,
        "Франшиза сопровождение бонус": 70576.62,
        "Операционная прибыль": 15699.76312
    }
];

// Глобальные переменные
let companyData = [];
let currentCompanyChart = null;
let allWeeks = [];

// Определяем категории юнитов
const unitCategories = {
    'retail': [
        "Козубенко Денис",
        "Сенатов Кирилл", 
        "Большаков Максим",
        "Мозговой Филипп",
        "Данилов Алексей",
        "Ичко Роман",
        "Юрлов Денис"
    ],
    'franchise_sales': ["Франшиза отдел продаж"],
    'sales_agency': ["Развитие"],
    'franchise_support': ["Франшиза отдел сопровождения"]
};

const unitTypeNames = {
    'retail': 'Вся розница',
    'franchise_sales': 'Франшиза отдел продаж', 
    'sales_agency': 'Развитие',
    'franchise_support': 'Франшиза отдел сопровождения'
};

// Функция для определения типа юнита по объекту
function getUnitType(object) {
    for (const [unitType, objects] of Object.entries(unitCategories)) {
        if (objects.includes(object)) {
            return unitType;
        }
    }
    return null;
}

// Функция для получения номера недели по ISO 8601
function getWeekNumber(date) {
    if (!date) return null;
    
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNumber = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    
    return weekNumber;
}

// Функция для получения диапазона недели (понедельник-воскресенье)
function getWeekRange(dateStr) {
    const date = parseDate(dateStr);
    if (!date) return null;
    
    const weekNumber = getWeekNumber(date);
    
    const monday = new Date(date);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    monday.setDate(diff);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    const formatDate = (d) => {
        const day = d.getDate().toString().padStart(2, '0');
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const year = d.getFullYear();
        return `${day}.${month}.${year}`;
    };
    
    return {
        weekNumber: weekNumber,
        weekRange: `${formatDate(monday)} - ${formatDate(sunday)}`,
        weekKey: `${weekNumber}н (${formatDate(monday)} - ${formatDate(sunday)})`
    };
}

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

// Функция для форматирования числа с разделителями
function formatNumber(value) {
    if (value === 0 || value === '0') return '0';
    if (typeof value === 'string') {
        const num = parseFloat(value);
        if (isNaN(num)) return value;
        value = num;
    }
    return value.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function processCompanyData(data) {
    return data.map(row => {
        const processedRow = {};
        for (const key in row) {
            if (key === 'Дата' || key === 'Объект' || key === 'Адрес') {
                processedRow[key] = row[key];
            } else {
                processedRow[key] = parseFloat(row[key]) || 0;
            }
        }
        return processedRow;
    });
}

function aggregateUnitsData(data, selectedWeeks = null, selectedAddresses = null) {
    const weeksAggregated = {};
    
    data.forEach(row => {
        const date = row['Дата'];
        const object = row['Объект'];
        const address = row['Адрес'];
        
        if (!date || !object) return;
        
        const weekInfo = getWeekRange(date);
        if (!weekInfo) return;
        
        const weekKey = weekInfo.weekKey;
        const weekNumber = weekInfo.weekNumber;
        const weekRange = weekInfo.weekRange;
        
        const unitType = getUnitType(object);
        if (!unitType) return;
        
        if (selectedAddresses && selectedAddresses.length > 0 && !selectedAddresses.includes(address)) return;
        
        if (!weeksAggregated[weekKey]) {
            weeksAggregated[weekKey] = {
                weekNumber: weekNumber,
                weekRange: weekRange,
                units: {
                    'retail': { revenue: 0, operatingProfit: 0, franchiseBonus: 0, days: new Set() },
                    'franchise_sales': { revenue: 0, operatingProfit: 0, franchiseBonus: 0, days: new Set() },
                    'sales_agency': { revenue: 0, operatingProfit: 0, franchiseBonus: 0, days: new Set() },
                    'franchise_support': { revenue: 0, operatingProfit: 0, franchiseBonus: 0, days: new Set() }
                }
            };
        }
        
        const weekData = weeksAggregated[weekKey];
        const unitData = weekData.units[unitType];
        
        unitData.days.add(date);
        
        // Учитываем бонус франшизы в выручке
        const franchiseBonus = row['Франшиза сопровождение бонус'] || 0;
        unitData.revenue += (row['Выручка'] || 0) + (row['Выручка Сайт'] || 0) + franchiseBonus;
        unitData.franchiseBonus += franchiseBonus;
        
        unitData.operatingProfit += row['Операционная прибыль'] || 0;
    });
    
    const unitsAggregated = {
        'retail': { revenue: 0, operatingProfit: 0, franchiseBonus: 0, totalDays: 0 },
        'franchise_sales': { revenue: 0, operatingProfit: 0, franchiseBonus: 0, totalDays: 0 },
        'sales_agency': { revenue: 0, operatingProfit: 0, franchiseBonus: 0, totalDays: 0 },
        'franchise_support': { revenue: 0, operatingProfit: 0, franchiseBonus: 0, totalDays: 0 }
    };
    
    Object.values(weeksAggregated).forEach(weekData => {
        const weekKey = `${weekData.weekNumber}н (${weekData.weekRange})`;
        
        if (selectedWeeks && selectedWeeks.length > 0 && !selectedWeeks.includes(weekKey)) {
            return;
        }
        
        Object.keys(unitTypeNames).forEach(unitType => {
            const weekUnitData = weekData.units[unitType];
            const aggregatedUnitData = unitsAggregated[unitType];
            
            aggregatedUnitData.revenue += weekUnitData.revenue;
            aggregatedUnitData.operatingProfit += weekUnitData.operatingProfit;
            aggregatedUnitData.franchiseBonus += weekUnitData.franchiseBonus;
            aggregatedUnitData.totalDays += weekUnitData.days.size;
        });
    });
    
    return unitsAggregated;
}

function populateFilters(data) {
    const weekSet = new Set();
    
    data.forEach(row => {
        const date = row['Дата'];
        if (!date) return;
        
        const weekInfo = getWeekRange(date);
        if (weekInfo) {
            weekSet.add(weekInfo.weekKey);
        }
    });
    
    allWeeks = Array.from(weekSet);
    allWeeks.sort((a, b) => {
        const weekNumA = parseInt(a.split('н')[0]);
        const weekNumB = parseInt(b.split('н')[0]);
        return weekNumA - weekNumB;
    });
    
    const addresses = [...new Set(data.map(row => row['Адрес']))].filter(Boolean);

    const weekSelect = document.getElementById('weekSelect');
    weekSelect.innerHTML = '<option value="all">Все недели</option>';
    
    allWeeks.forEach(week => {
        const option = document.createElement('option');
        option.value = week;
        option.textContent = week;
        weekSelect.appendChild(option);
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

    weekSelect.addEventListener('change', function() {
        updateSelectedInfo('weekSelected', this);
        applyFilters();
    });
    
    addressSelect.addEventListener('change', function() {
        updateSelectedInfo('addressSelected', this);
        applyFilters();
    });

    updateSelectedInfo('weekSelected', weekSelect);
    updateSelectedInfo('addressSelected', addressSelect);
    
    const options = weekSelect.options;
    for (let i = 0; i < options.length; i++) {
        options[i].selected = true;
    }
    updateSelectedInfo('weekSelected', weekSelect);
}

function updateSelectedInfo(containerId, selectElement) {
    const selectedOptions = Array.from(selectElement.selectedOptions)
        .map(option => option.value)
        .filter(value => value && value !== 'all');
    
    const container = document.getElementById(containerId);
    if (selectedOptions.length > 0) {
        container.textContent = `Выбрано: ${selectedOptions.length}`;
        container.title = selectedOptions.join(', ');
    } else {
        container.textContent = 'Все';
        container.title = '';
    }
}

function getSelectedWeeks() {
    const weekSelect = document.getElementById('weekSelect');
    const selectedWeeks = Array.from(weekSelect.selectedOptions)
        .map(option => option.value)
        .filter(value => value && value !== 'all');
    
    return selectedWeeks.length > 0 ? selectedWeeks : null;
}

function getSelectedAddresses() {
    const addressSelect = document.getElementById('addressSelect');
    const selectedAddresses = Array.from(addressSelect.selectedOptions)
        .map(option => option.value)
        .filter(value => value && value !== 'all');
    
    return selectedAddresses.length > 0 ? selectedAddresses : null;
}

function applyFilters() {
    const selectedWeeks = getSelectedWeeks();
    const selectedAddresses = getSelectedAddresses();

    const aggregatedData = aggregateUnitsData(companyData, selectedWeeks, selectedAddresses);
    
    updateSelectionInfo(selectedWeeks, selectedAddresses);
    
    if (Object.keys(aggregatedData).length > 0) {
        buildChart(aggregatedData, selectedWeeks, selectedAddresses);
    } else {
        document.getElementById('companyChart').innerHTML = '<div class="loading">Нет данных для выбранных фильтров</div>';
        document.getElementById('statsInfo').innerHTML = '';
    }
}

function updateSelectionInfo(weeks, addresses) {
    let info = '';
    
    if (weeks) {
        info += `Выбрано недель: ${weeks.length}`;
    } else {
        info += 'Все недели';
    }
    
    if (addresses) {
        info += ` | Адресов: ${addresses.length}`;
    } else {
        info += ' | Все адреса';
    }
    
    const aggregatedData = aggregateUnitsData(companyData, weeks, addresses);
    Object.keys(unitTypeNames).forEach(unitType => {
        const unitData = aggregatedData[unitType];
        if (unitData.totalDays > 0) {
            info += ` | ${unitTypeNames[unitType]}: ${unitData.totalDays} дн.`;
        }
    });
    
    document.getElementById('companyFileInfo').textContent = info;
}

function buildChart(aggregatedData, selectedWeeks, selectedAddresses) {
    const chartContainer = document.getElementById('companyChart');
    chartContainer.innerHTML = '';

    try {
        if (currentCompanyChart && !currentCompanyChart.isDisposed()) {
            currentCompanyChart.dispose();
        }
    } catch (e) {
        console.warn('Ошибка при удалении графика:', e);
    }

    if (!aggregatedData || Object.keys(aggregatedData).length === 0) {
        chartContainer.innerHTML = '<div class="loading">Нет данных для отображения</div>';
        return;
    }

    const chart = echarts.init(chartContainer);
    currentCompanyChart = chart;
    
    const unitLabels = Object.values(unitTypeNames);
    const revenueData = [];
    const positiveProfitData = [];
    const negativeProfitData = [];
    const profitabilityData = [];
    const franchiseBonusData = [];
    
    Object.keys(unitTypeNames).forEach(unitType => {
        const unitData = aggregatedData[unitType];
        revenueData.push(unitData.revenue);
        
        const profit = unitData.operatingProfit;
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
        
        const profitability = unitData.revenue !== 0 ? (profit / unitData.revenue) * 100 : -100;
        profitabilityData.push(profitability);
        franchiseBonusData.push(unitData.franchiseBonus);
    });
    
    const emphasisStyle = {
        itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0,0,0,0.3)'
        }
    };

    const totalRevenue = revenueData.reduce((sum, revenue) => sum + revenue, 0);
    const totalProfit = positiveProfitData.reduce((sum, profit) => sum + profit, 0) + 
                      negativeProfitData.reduce((sum, profit) => sum + profit, 0);
    const totalFranchiseBonus = franchiseBonusData.reduce((sum, bonus) => sum + bonus, 0);
    const avgProfitability = totalRevenue !== 0 ? (totalProfit / totalRevenue) * 100 : -100;

    let titleText = 'Сравнение юнитов по финансовым показателям';
    let subtitle = `Рентабельность: ${avgProfitability.toFixed(1)}%`;
    
    if (selectedWeeks) {
        if (selectedWeeks.length === 1) {
            subtitle += ` | Неделя: ${selectedWeeks[0].split(' (')[0]}`;
        } else {
            subtitle += ` | Недель: ${selectedWeeks.length}`;
        }
    } else {
        subtitle += ` | Все недели`;
    }
    
    if (selectedAddresses) {
        subtitle += ` | Адресов: ${selectedAddresses.length}`;
    } else {
        subtitle += ` | Все адреса`;
    }

    if (totalFranchiseBonus > 0) {
        subtitle += ` | Бонус франшизы: ${formatCurrency(totalFranchiseBonus)}`;
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

                const unitIndex = params[0].dataIndex;
                const unitType = Object.keys(unitTypeNames)[unitIndex];
                const unitData = aggregatedData[unitType];

                params.forEach(param => {
                    if (param.value !== 0) {
                        const value = formatCurrency(param.value);
                        const seriesName = param.seriesName;
                        result += `${seriesName}: ${value}<br/>`;
                    }
                });

                const bonus = franchiseBonusData[unitIndex];
                if (bonus !== 0) {
                    result += `<span style="color: #28a745;">Франшиза сопровождение бонус: ${formatCurrency(bonus)}</span><br/>`;
                }

                if (unitData.totalDays > 0) {
                    result += `<span style="color: #666;">Количество дней: ${unitData.totalDays}</span><br/>`;
                }

                const profitability = profitabilityData[unitIndex];
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

                        // Колонка "Юнит"
                        const unitHeader = document.createElement('th');
                        unitHeader.textContent = 'Юнит';
                        unitHeader.style.textAlign = 'center';
                        headerRow.appendChild(unitHeader);

                        // Колонка "Выручка"
                        const revenueHeader = document.createElement('th');
                        revenueHeader.textContent = 'Выручка';
                        revenueHeader.style.textAlign = 'center';
                        headerRow.appendChild(revenueHeader);

                        // Колонка "Прибыль"
                        const profitHeader = document.createElement('th');
                        profitHeader.textContent = 'Прибыль';
                        profitHeader.style.textAlign = 'center';
                        headerRow.appendChild(profitHeader);

                        // Колонка "Рентабельность"
                        const profitabilityHeader = document.createElement('th');
                        profitabilityHeader.textContent = 'Рентабельность';
                        profitabilityHeader.style.textAlign = 'center';
                        headerRow.appendChild(profitabilityHeader);

                        // Колонка "Бонус франшизы"
                        const bonusHeader = document.createElement('th');
                        bonusHeader.textContent = 'Бонус франшизы';
                        bonusHeader.style.textAlign = 'center';
                        headerRow.appendChild(bonusHeader);

                        // Колонка "Дней"
                        const daysHeader = document.createElement('th');
                        daysHeader.textContent = 'Дней';
                        daysHeader.style.textAlign = 'center';
                        headerRow.appendChild(daysHeader);

                        thead.appendChild(headerRow);
                        tableContent.appendChild(thead);

                        const tbody = document.createElement('tbody');

                        Object.keys(unitTypeNames).forEach((unitType, index) => {
                            const unitData = aggregatedData[unitType];
                            const row = document.createElement('tr');

                            // Юнит
                            const unitCell = document.createElement('td');
                            unitCell.textContent = unitTypeNames[unitType];
                            unitCell.style.textAlign = 'left';
                            row.appendChild(unitCell);

                            // Выручка
                            const revenueCell = document.createElement('td');
                            revenueCell.textContent = formatNumber(unitData.revenue);
                            row.appendChild(revenueCell);

                            // Прибыль
                            const profitCell = document.createElement('td');
                            profitCell.textContent = formatNumber(unitData.operatingProfit);
                            row.appendChild(profitCell);

                            // Рентабельность
                            const profitabilityCell = document.createElement('td');
                            const profitability = unitData.revenue !== 0 ? (unitData.operatingProfit / unitData.revenue) * 100 : -100;
                            profitabilityCell.textContent = profitability.toFixed(1) + '%';
                            row.appendChild(profitabilityCell);

                            // Бонус франшизы
                            const bonusCell = document.createElement('td');
                            bonusCell.textContent = formatNumber(unitData.franchiseBonus);
                            row.appendChild(bonusCell);

                            // Дней
                            const daysCell = document.createElement('td');
                            daysCell.textContent = unitData.totalDays;
                            daysCell.style.textAlign = 'center';
                            row.appendChild(daysCell);

                            tbody.appendChild(row);
                        });

                        // Итоговая строка
                        const totalRow = document.createElement('tr');
                        totalRow.style.backgroundColor = '#f2f2f2';
                        totalRow.style.fontWeight = 'bold';

                        const totalLabelCell = document.createElement('td');
                        totalLabelCell.textContent = 'ИТОГО';
                        totalLabelCell.style.textAlign = 'left';
                        totalRow.appendChild(totalLabelCell);

                        const totalRevenueCell = document.createElement('td');
                        totalRevenueCell.textContent = formatNumber(totalRevenue);
                        totalRow.appendChild(totalRevenueCell);

                        const totalProfitCell = document.createElement('td');
                        totalProfitCell.textContent = formatNumber(totalProfit);
                        totalRow.appendChild(totalProfitCell);

                        const totalProfitabilityCell = document.createElement('td');
                        totalProfitabilityCell.textContent = avgProfitability.toFixed(1) + '%';
                        totalRow.appendChild(totalProfitabilityCell);

                        const totalBonusCell = document.createElement('td');
                        totalBonusCell.textContent = formatNumber(totalFranchiseBonus);
                        totalRow.appendChild(totalBonusCell);

                        const totalDaysCell = document.createElement('td');
                        const totalDays = Object.values(aggregatedData).reduce((sum, unit) => sum + unit.totalDays, 0);
                        totalDaysCell.textContent = totalDays;
                        totalDaysCell.style.textAlign = 'center';
                        totalRow.appendChild(totalDaysCell);

                        tbody.appendChild(totalRow);
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
            data: unitLabels,
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
    
    const showFranchiseBonus = totalFranchiseBonus > 0;
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
        statsHtml += `<div class="stat-item bonus">Бонус франшизы: ${formatCurrency(franchiseBonus)}</div>`;
    }

    statsHtml += `
        <div class="stat-item ${profit >= 0 ? 'positive' : 'negative'}">Прибыль: ${formatCurrency(profit)}</div>
        <div class="stat-item ${profitability >= 0 ? 'positive' : 'negative'}">Рентабельность: ${profitability.toFixed(1)}%</div>
    `;

    document.getElementById('statsInfo').innerHTML = statsHtml;
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function () {
    companyData = processCompanyData(mainData);
    
    if (companyData.length > 0) {
        populateFilters(companyData);
        applyFilters();
    } else {
        document.getElementById('companyFileInfo').textContent = 'Нет данных для построения графика';
    }
});