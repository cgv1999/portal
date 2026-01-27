// Версия: 2.1
// Добавлена защита паролем

console.log('NDA Analytics Portal v2.1 загружен');
console.log('Время загрузки:', new Date().toLocaleString());

// Глобальные переменные
let chartDom, myChart;
let animationCompleted = false;
let isInitialLoad = true;

// КОНФИГУРАЦИЯ ЗАЩИТЫ
const PROTECTION_CONFIG = {
    PASSWORD: "дваярда",
    SESSION_KEY: "nda_authenticated_v2",
    MAX_ATTEMPTS: 5,
    BLOCK_TIME: 30000 // 30 секунд
};

let passwordAttempts = 0;
let isBlocked = false;

// ==============================
// ОСНОВНАЯ ИНИЦИАЛИЗАЦИЯ
// ==============================

document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM загружен, инициализация...');

    // Инициализация защиты паролем
    initPasswordProtection();

    // Инициализация ECharts и остального интерфейса
    initMainInterface();
});

// ==============================
// СИСТЕМА ЗАЩИТЫ ПАРОЛЕМ
// ==============================

function initPasswordProtection() {
    console.log('Инициализация защиты паролем...');

    // Проверяем блокировку
    const blockUntil = localStorage.getItem('nda_blocked_until');
    if (blockUntil && Date.now() < parseInt(blockUntil)) {
        isBlocked = true;
        const remainingTime = Math.ceil((parseInt(blockUntil) - Date.now()) / 1000);
        showPasswordHint(`Доступ заблокирован на ${remainingTime} сек.`, 'error');
        setTimeout(() => {
            isBlocked = false;
            localStorage.removeItem('nda_blocked_until');
            showPasswordHint('Введите пароль', '');
            document.getElementById('password').disabled = false;
        }, parseInt(blockUntil) - Date.now());
        return;
    }

    // Проверяем аутентификацию
    const isAuthenticated = sessionStorage.getItem(PROTECTION_CONFIG.SESSION_KEY);

    if (isAuthenticated === 'true') {
        console.log('Пользователь уже аутентифицирован');
        hidePasswordProtection();
        return;
    }

    // Сбрасываем попытки если прошло больше 5 минут
    const lastAttemptTime = localStorage.getItem('nda_last_attempt');
    if (lastAttemptTime && Date.now() - parseInt(lastAttemptTime) > 300000) {
        passwordAttempts = 0;
    } else {
        passwordAttempts = parseInt(localStorage.getItem('nda_attempts') || '0');
    }

    showPasswordProtection();
    setupPasswordAnimation();
}

function showPasswordProtection() {
    const passwordProtect = document.getElementById('password-protect');
    const mainContainer = document.querySelector('.container');
    const analyticsContainer = document.getElementById('analytics-container');

    if (passwordProtect) passwordProtect.style.display = 'flex';
    if (mainContainer) mainContainer.style.display = 'none';
    if (analyticsContainer) analyticsContainer.style.display = 'none';

    // Устанавливаем фокус на поле ввода
    setTimeout(() => {
        const passwordInput = document.getElementById('password');
        if (passwordInput) {
            passwordInput.focus();
            passwordInput.disabled = isBlocked;
        }
    }, 500);
}

function hidePasswordProtection() {
    const passwordProtect = document.getElementById('password-protect');
    const mainContainer = document.querySelector('.container');

    if (passwordProtect) {
        passwordProtect.style.opacity = '0';
        setTimeout(() => {
            passwordProtect.style.display = 'none';
        }, 300);
    }

    if (mainContainer) {
        mainContainer.style.display = 'flex';
        mainContainer.style.opacity = '0';
        setTimeout(() => {
            mainContainer.style.opacity = '1';
        }, 50);
    }
}

function setupPasswordAnimation() {
    const passwordAnimation = document.getElementById('password-animation');
    if (!passwordAnimation) return;

    // Создаем стилизованное лого NDA
    passwordAnimation.innerHTML = '<div class="nda-text">NDA</div>';
}

function checkPassword() {
    if (isBlocked) return;

    const passwordInput = document.getElementById('password');
    const passwordHint = document.getElementById('password-hint');
    const password = passwordInput ? passwordInput.value.trim() : '';

    if (!password) {
        showPasswordHint('Введите пароль', 'error');
        return;
    }

    // Сохраняем время попытки
    localStorage.setItem('nda_last_attempt', Date.now().toString());

    if (password === PROTECTION_CONFIG.PASSWORD) {
        // Успешный вход
        passwordAttempts = 0;
        localStorage.removeItem('nda_attempts');
        localStorage.removeItem('nda_blocked_until');

        showPasswordHint('Доступ разрешен...', 'success');

        // Сохраняем статус аутентификации
        sessionStorage.setItem(PROTECTION_CONFIG.SESSION_KEY, 'true');

        // Плавный переход к основному контенту
        setTimeout(() => {
            hidePasswordProtection();
            initMainInterface();
        }, 800);
    } else {
        // Неверный пароль
        passwordAttempts++;
        localStorage.setItem('nda_attempts', passwordAttempts.toString());

        const remainingAttempts = PROTECTION_CONFIG.MAX_ATTEMPTS - passwordAttempts;

        if (remainingAttempts > 0) {
            showPasswordHint(`Неверный пароль. Осталось попыток: ${remainingAttempts}`, 'error');
        } else {
            // Блокировка после превышения попыток
            isBlocked = true;
            const blockUntil = Date.now() + PROTECTION_CONFIG.BLOCK_TIME;
            localStorage.setItem('nda_blocked_until', blockUntil.toString());

            showPasswordHint(`Доступ заблокирован на ${PROTECTION_CONFIG.BLOCK_TIME / 1000} сек.`, 'error');
            passwordInput.disabled = true;

            setTimeout(() => {
                isBlocked = false;
                localStorage.removeItem('nda_blocked_until');
                passwordAttempts = 0;
                localStorage.removeItem('nda_attempts');
                showPasswordHint('Введите пароль', '');
                passwordInput.disabled = false;
                passwordInput.focus();
            }, PROTECTION_CONFIG.BLOCK_TIME);
        }

        // Анимация ошибки
        passwordInput.value = '';
        passwordInput.style.animation = 'shake 0.5s';
        setTimeout(() => {
            passwordInput.style.animation = '';
        }, 500);

        passwordInput.focus();
    }
}

function showPasswordHint(message, type) {
    const passwordHint = document.getElementById('password-hint');
    if (!passwordHint) return;

    passwordHint.textContent = message;
    passwordHint.className = 'password-hint';

    if (type === 'success') {
        passwordHint.classList.add('success');
    } else if (type === 'error') {
        passwordHint.classList.add('error');
    }
}

// ==============================
// ОСНОВНОЙ ИНТЕРФЕЙС
// ==============================

function initMainInterface() {
    console.log('Инициализация основного интерфейса...');

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
}

// ==============================
// АНИМАЦИЯ NDA
// ==============================

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

function startAnimation() {
    // Проверяем, была ли уже показана анимация
    const hasSeenAnimation = sessionStorage.getItem('ndaAnimationShown');
    if (hasSeenAnimation === 'true') {
        console.log('Пропускаем анимацию NDA (уже была показана)');
        hideNDA();
        showButtons();
        return;
    }

    console.log('Запуск анимации NDA...');

    // Слушаем завершение анимации
    myChart.on('finished', function () {
        console.log('Анимация NDA завершена');
        animationCompleted = true;

        // Сохраняем флаг, что анимация была показана
        sessionStorage.setItem('ndaAnimationShown', 'true');

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
            sessionStorage.setItem('ndaAnimationShown', 'true');
            hideNDA();
            showButtons();
        }
    }, 3500);
}

// ==============================
// УПРАВЛЕНИЕ ИНТЕРФЕЙСОМ
// ==============================

function hideNDA() {
    if (chartDom) {
        chartDom.style.opacity = '0';
        chartDom.style.pointerEvents = 'none';
    }
}

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

function setupEventHandlers() {
    // Обработка изменения размера окна
    let resizeTimeout;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function () {
            if (myChart) {
                myChart.resize();
                setupAnimation();
            }
        }, 200);
    });

    // Настройка touch событий для кнопок
    const buttons = document.querySelectorAll('.portal-button, .back-button');
    buttons.forEach(button => {
        button.addEventListener('touchstart', function () {
            this.style.opacity = '0.9';
        });

        button.addEventListener('touchend', function () {
            this.style.opacity = '1';
        });
    });

    // Предотвращение двойного тапа для масштабирования
    document.addEventListener('touchstart', function (event) {
        if (event.touches.length > 1) {
            event.preventDefault();
        }
    }, { passive: false });

    // Обработка нажатия Enter в поле пароля
    document.getElementById('password').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            checkPassword();
        }
    });
}

// ==============================
// АНАЛИТИКА И НАВИГАЦИЯ
// ==============================

function loadAnalytics(analyticsName) {
    console.log(`Загрузка аналитики: ${analyticsName}`);

    // Проверяем аутентификацию
    const isAuthenticated = sessionStorage.getItem(PROTECTION_CONFIG.SESSION_KEY);
    if (isAuthenticated !== 'true') {
        showPasswordProtection();
        showPasswordHint('Требуется повторная аутентификация', 'error');
        return;
    }

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

function returnToMain() {
    console.log('Возврат на главный экран');

    // Проверяем аутентификацию
    const isAuthenticated = sessionStorage.getItem(PROTECTION_CONFIG.SESSION_KEY);
    if (isAuthenticated !== 'true') {
        showPasswordProtection();
        return;
    }

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

function resetAnimation() {
    // Проверяем, была ли уже показана анимация
    const hasSeenAnimation = sessionStorage.getItem('ndaAnimationShown');

    // Если анимация уже была показана, сразу показываем кнопки
    if (hasSeenAnimation === 'true') {
        console.log('Анимация уже была показана, сразу показываем кнопки');

        // Скрываем NDA
        if (chartDom) {
            chartDom.style.opacity = '0';
            chartDom.style.pointerEvents = 'none';
        }

        // Показываем кнопки
        const buttonsContainer = document.getElementById('buttons-container');
        const subtitle = document.getElementById('subtitle');

        if (buttonsContainer) {
            buttonsContainer.style.opacity = '1';
            buttonsContainer.style.transform = 'translateY(0)';
        }

        if (subtitle) {
            subtitle.style.opacity = '1';
            subtitle.style.transform = 'translateY(0)';
        }

        return;
    }

    // Иначе сбрасываем анимацию как обычно
    console.log('Сброс анимации для повторного показа');

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

// ==============================
// ДОПОЛНИТЕЛЬНЫЕ ФУНКЦИИ
// ==============================

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
    return '2.1';
}

function logout() {
    sessionStorage.removeItem(PROTECTION_CONFIG.SESSION_KEY);
    sessionStorage.removeItem('ndaAnimationShown');
    showPasswordProtection();
    showPasswordHint('Вы вышли из системы', '');
    document.getElementById('password').value = '';
}

// ==============================
// ГЛОБАЛЬНЫЙ ЭКСПОРТ
// ==============================

window.loadAnalytics = loadAnalytics;
window.returnToMain = returnToMain;
window.refreshAnalytics = refreshAnalytics;
window.getCurrentVersion = getCurrentVersion;
window.checkPassword = checkPassword;
window.logout = logout;