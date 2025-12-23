<?php
// Файл для управления кэшированием
header("Cache-Control: no-cache, no-store, must-revalidate");
header("Pragma: no-cache");
header("Expires: 0");

// Функция для получения версии файла
function getFileVersion($filepath) {
    if (file_exists($filepath)) {
        return filemtime($filepath);
    }
    return time();
}

// Пример использования в HTML:
// <link rel="stylesheet" href="style.css?v=<?php echo getFileVersion('style.css'); ?>">
?>