<?php
// Minimal embedded router for SVG+PHP files
$uri = parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH);
$path = __DIR__ . $uri;

// Handle SVG files as PHP
if (preg_match("/\.svg$/", $uri) && file_exists($path)) {
    header("Content-Type: image/svg+xml");

    // Process variables
    $vars = [
        "{APP_TITLE}" => $_ENV["APP_TITLE"] ?? "SVG+PHP App",
        "{APP_VERSION}" => $_ENV["APP_VERSION"] ?? "1.0.0",
        "{CURRENT_TIME}" => date("H:i:s"),
        "{CURRENT_DATE}" => date("Y-m-d"),
        "{PHP_VERSION}" => PHP_VERSION
    ];

    $content = file_get_contents($path);
    $content = str_replace(array_keys($vars), array_values($vars), $content);

    // Execute PHP in SVG
    eval("?>" . $content);
    return true;
}

// Serve static files
if (file_exists($path) && !is_dir($path)) {
    return false;
}

// Default response
http_response_code(404);
echo "Not found: $uri";
