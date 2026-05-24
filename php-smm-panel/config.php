<?php
/**
 * LuvSMM Pro - General Setup Configuration File
 * Author: LuvSMM.com Clone Script
 */

// Turn off error reporting in production. Enable for debugging.
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Start PHP session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Database Credentials
define('DB_HOST', 'localhost');
define('DB_USER', 'your_db_user');
define('DB_PASS', 'your_db_password');
define('DB_NAME', 'your_db_name');

// App Configuration
define('BASE_URL', 'https://yourdomain.com'); // Without trailing slash
define('SITE_NAME', 'LuvSMM - Ultimate SMM Panel');
define('CURRENCY_CODE', 'USD');
define('CURRENCY_SYMBOL', '$');

// Secure Token Salt
define('JWT_SALT', 'sMmpAneL-Super-SeCret-kEy-LuvSMM-2026!');

/**
 * Helper function to sanitize user input
 */
function sanitize_input($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
    return $data;
}

/**
 * Helper function to output standard API responses
 */
function api_response($data, $status_code = 200) {
    http_response_code($status_code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_PRETTY_PRINT);
    exit;
}

/**
 * Authentication Guards
 */
function require_login() {
    if (!isset($_SESSION['user_id'])) {
        header("Location: index.php?ref=unauthorized");
        exit;
    }
}

function require_admin() {
    if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
        header("Location: index.php?ref=admin_unauthorized");
        exit;
    }
}
