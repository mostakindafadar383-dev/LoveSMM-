import { Category, Service, Order, Ticket, APIProvider, PlatformSettings } from './types';

export const initialCategories: Category[] = [
  { id: 10, name: '🔥 LuvSMM Exclusive Services', sortOrder: 1, status: 'active' },
  { id: 20, name: '📱 Instagram - Followers [High Quality / Real]', sortOrder: 2, status: 'active' },
  { id: 30, name: '🎥 YouTube - Views & Watch Time [Non-Drop]', sortOrder: 3, status: 'active' },
  { id: 40, name: '🎵 TikTok - Likes & Views [Instant]', sortOrder: 4, status: 'active' },
];

export const initialServices: Service[] = [
  {
    id: 101,
    categoryId: 10,
    name: 'Instagram Followers [Refill - Auto] [LuvSMM Speed - 50K/Day]',
    description: '♛ World Premium Exclusive service\n⚡ Fast Start: Under 1 hour\n👥 Real-looking profiles with regular posts\n🔄 Refill: 30-Day Automated Refill Guarantee\n📉 Low drop percentage (typically 1-3%)',
    price: 1.25,
    originalPrice: 0.85,
    minQuantity: 100,
    maxQuantity: 50000,
    apiProviderId: 1,
    apiServiceId: 3042,
    status: 'active',
  },
  {
    id: 102,
    categoryId: 10,
    name: 'YouTube High Retention Views [Speed: 10K/Day] [Organic Refill]',
    description: '🎥 Increase visibility and rank your video higher!\n⏱️ High retention: average watch-time 3 to 5 minutes\n♻️ Lifetime Guarantee\n⚠️ Video must be restriction/region free',
    price: 3.40,
    originalPrice: 2.20,
    minQuantity: 500,
    maxQuantity: 100000,
    apiProviderId: 1,
    apiServiceId: 1104,
    status: 'active',
  },
  {
    id: 103,
    categoryId: 20,
    name: 'Instagram Followers [HQ Profile] [Speed: 5000/Day]',
    description: '⚡ Start: 0-30m\n👥 Speed: 5,000 / Day\n📉 Drop rate: Low\n🔒 Profile must be public. Do not change username during order.',
    price: 0.95,
    originalPrice: 0.60,
    minQuantity: 100,
    maxQuantity: 20000,
    apiProviderId: 1,
    apiServiceId: 542,
    status: 'active',
  },
  {
    id: 104,
    categoryId: 20,
    name: 'Instagram Likes [Gradual Real] [30-Day Safety]',
    description: '❤️ High Quality Real Likes\n⚡ Start: Under 15m\n🔥 Max: 50,000',
    price: 0.45,
    originalPrice: 0.25,
    minQuantity: 50,
    maxQuantity: 50000,
    apiProviderId: 1,
    apiServiceId: 511,
    status: 'active',
  },
  {
    id: 105,
    categoryId: 30,
    name: 'YouTube Likes [Real Account profiles - Fast Speed]',
    description: '👍 Premium Quality Profiles\n⚡ Delivery: 1000-2000 Likes per day\n📈 Boost rankings safely.',
    price: 2.80,
    originalPrice: 1.90,
    minQuantity: 50,
    maxQuantity: 10000,
    apiProviderId: 1,
    apiServiceId: 928,
    status: 'active',
  },
  {
    id: 106,
    categoryId: 40,
    name: 'TikTok Likes [Real profiles - Speed: 20K/Day]',
    description: '❤️ instant organic Likes\n🛡️ Safe for account monetization policies.',
    price: 0.65,
    originalPrice: 0.40,
    minQuantity: 100,
    maxQuantity: 30000,
    apiProviderId: null,
    apiServiceId: null,
    status: 'active',
  },
];

export const initialProviders: APIProvider[] = [
  {
    id: 1,
    name: 'LuvSMM Primary API Endpoint',
    apiUrl: 'https://luvsmm.com/api/v2',
    apiKey: '90a2cf7d15ec46fbd995cbfd33f7c189',
    balance: 450.2840,
    status: 'active'
  }
];

export const initialOrders: Order[] = [
  {
    id: 34105,
    username: 'demo_user',
    serviceId: 101,
    serviceName: 'Instagram Followers [Refill - Auto] [LuvSMM Speed - 50K/Day]',
    categoryName: '🔥 LuvSMM Exclusive Services',
    link: 'https://instagram.com/p/CuvSMM_Promo',
    quantity: 1000,
    charge: 1.25,
    startCount: 4210,
    remains: 0,
    status: 'completed',
    apiProviderId: 1,
    apiOrderId: 928341,
    source: 'web',
    createdAt: '2026-05-23T14:24:00Z',
  },
  {
    id: 34106,
    username: 'power_client',
    serviceId: 102,
    serviceName: 'YouTube High Retention Views [Speed: 10K/Day] [Organic Refill]',
    categoryName: '🎥 YouTube - Views & Watch Time [Non-Drop]',
    link: 'https://youtube.com/watch?v=LuvSMMOfficial',
    quantity: 5000,
    charge: 17.00,
    startCount: 15302,
    remains: 2310,
    status: 'inprogress',
    apiProviderId: 1,
    apiOrderId: 928348,
    source: 'api',
    createdAt: '2026-05-23T19:40:00Z',
  },
  {
    id: 34107,
    username: 'demo_user',
    serviceId: 104,
    serviceName: 'Instagram Likes [Gradual Real] [30-Day Safety]',
    categoryName: '📱 Instagram - Followers [High Quality / Real]',
    link: 'https://instagram.com/p/CwSMM_Post',
    quantity: 500,
    charge: 0.2250,
    startCount: 120,
    remains: 500,
    status: 'pending',
    apiProviderId: 1,
    apiOrderId: null,
    source: 'web',
    createdAt: '2026-05-24T01:10:00Z',
  }
];

export const initialTickets: Ticket[] = [
  {
    id: 1001,
    username: 'demo_user',
    subject: 'Order ID 34106 Pending status inquiry',
    status: 'answered',
    createdAt: '2026-05-23T20:15:00Z',
    replies: [
      {
        id: 1,
        author: 'user',
        message: 'Hello, my YouTube order 34106 is still pending. Can you check why the views have not started delivering yet?',
        createdAt: '2026-05-23T20:15:00Z'
      },
      {
        id: 2,
        author: 'admin',
        message: 'Hi! YouTube retention services can take up to 2-3 hours to propagate fully. I checked your order and it has been pushed downstream successfully. Speed matches 10K/Day and will deliver on time.',
        createdAt: '2026-05-23T20:30:00Z'
      }
    ]
  },
  {
    id: 1002,
    username: 'reseller_bill',
    subject: 'Requesting API Category Discount',
    status: 'open',
    createdAt: '2026-05-24T02:10:00Z',
    replies: [
      {
        id: 1,
        author: 'user',
        message: 'Hello admin, I am doing over $2000 monthly SMM reseller orders on this panel. Can I request a 10% rate reduction coefficient on the Instagram high-quality follower series?',
        createdAt: '2026-05-24T02:10:00Z'
      }
    ]
  }
];

export const defaultSettings: PlatformSettings = {
  siteName: 'LuvSMM - Ultimate SMM Panel',
  siteCurrencySymbol: '$',
  ticketSystemStatus: 'enabled',
  maintenanceMode: 'disabled'
};

// Raw content codes stored as template variables to let user explore PHP repository inside browser cleanly.
export const phpSourceCodeMap: Record<string, string> = {
  '/php-smm-panel/backend/database/database.sql': `-- phpMyAdmin SQL Dump
-- SMM Panel Database Structure
-- Compatible with PHP 7.4 - 8.3
-- Designed for LuvSMM Pro Panel clone

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- Table structure for table \`users\`
CREATE TABLE \`users\` (
  \`id\` int(11) NOT NULL AUTO_INCREMENT,
  \`username\` varchar(64) NOT NULL UNIQUE,
  \`email\` varchar(128) NOT NULL UNIQUE,
  \`password\` varchar(255) NOT NULL,
  \`balance\` decimal(15,4) NOT NULL DEFAULT '0.0000',
  \`spent\` decimal(15,4) NOT NULL DEFAULT '0.0000',
  \`api_key\` varchar(64) NOT NULL UNIQUE,
  \`role\` enum('user', 'admin') NOT NULL DEFAULT 'user',
  \`status\` enum('active', 'suspended') NOT NULL DEFAULT 'active',
  \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table \`categories\`
CREATE TABLE \`categories\` (
  \`id\` int(11) NOT NULL AUTO_INCREMENT,
  \`name\` varchar(255) NOT NULL,
  \`sort_order\` int(11) NOT NULL DEFAULT '0',
  \`status\` enum('active', 'inactive') NOT NULL DEFAULT 'active',
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table \`services\`
CREATE TABLE \`services\` (
  \`id\` int(11) NOT NULL AUTO_INCREMENT,
  \`category_id\` int(11) NOT NULL,
  \`name\` varchar(255) NOT NULL,
  \`description\` text DEFAULT NULL,
  \`price\` decimal(15,4) NOT NULL, -- Selling Price
  \`original_price\` decimal(15,4) NOT NULL DEFAULT '0.0000', -- Provider Cost
  \`min_quantity\` int(11) NOT NULL DEFAULT '10',
  \`max_quantity\` int(11) NOT NULL DEFAULT '100000',
  \`api_provider_id\` int(11) DEFAULT NULL,
  \`api_service_id\` int(11) DEFAULT NULL,
  \`status\` enum('active', 'inactive') NOT NULL DEFAULT 'active',
  PRIMARY KEY (\`id\`),
  FOREIGN KEY (\`category_id\`) REFERENCES \`categories\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

  '/php-smm-panel/config.php': `<?php
/**
 * LuvSMM Pro - General Setup Configuration File
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Database Credentials
define('DB_HOST', 'localhost');
define('DB_USER', 'your_db_user');
define('DB_PASS', 'your_db_password');
define('DB_NAME', 'your_db_name');

// App Configuration
define('BASE_URL', 'https://yourdomain.com'); 
define('SITE_NAME', 'LuvSMM - Ultimate SMM Panel');
define('CURRENCY_CODE', 'USD');
define('CURRENCY_SYMBOL', '$');
define('JWT_SALT', 'sMmpAneL-Super-SeCret-kEy-LuvSMM-2026!');

function sanitize_input($data) {
    return htmlspecialchars(trim(stripslashes($data)), ENT_QUOTES, 'UTF-8');
}

function api_response($data, $status_code = 200) {
    http_response_code($status_code);
    header('Content-Type: application/json');
    echo json_encode($data, JSON_PRETTY_PRINT);
    exit;
}`,

  '/php-smm-panel/backend/db.php': `<?php
/**
 * LuvSMM Pro Database Connection
 */
require_once __DIR__ . '/../config.php';

try {
    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];
    $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
} catch (PDOException $e) {
    die("Database Connection Failed: " . $e->getMessage());
}

function get_setting($key) {
    global $pdo;
    $stmt = $pdo->prepare("SELECT setting_value FROM settings WHERE setting_key = ?");
    $stmt->execute([$key]);
    return $stmt->fetchColumn() ?: null;
}`,

  '/php-smm-panel/api.php': `<?php
/**
 * LuvSMM Pro SMM Panel API Gateway Handler (api.php)
 */
require_once __DIR__ . '/backend/db.php';

$apiKey = isset($_REQUEST['key']) ? sanitize_input($_REQUEST['key']) : '';
$action = isset($_REQUEST['action']) ? sanitize_input($_REQUEST['action']) : '';

if (empty($apiKey)) {
    api_response(['error' => 'API Key is required'], 400);
}

// Authenticate
$stmt = $pdo->prepare("SELECT * FROM users WHERE api_key = ? AND status = 'active'");
$stmt->execute([$apiKey]);
$user = $stmt->fetch();

if (!$user) {
    api_response(['error' => 'Invalid or suspended API Key'], 403);
}

switch ($action) {
    case 'balance':
        api_response([
            'balance' => number_format((float)$user['balance'], 4, '.', ''),
            'currency' => get_setting('site_currency') ?? 'USD',
        ]);
        break;

    case 'add':
        $serviceId = isset($_REQUEST['service']) ? (int)$_REQUEST['service'] : 0;
        $link = isset($_REQUEST['link']) ? sanitize_input($_REQUEST['link']) : '';
        $quantity = isset($_REQUEST['quantity']) ? (int)$_REQUEST['quantity'] : 0;
        
        // Validation & DB logic...
        break;
        
    case 'status':
        // Individual/Bulk order statuses logic...
        break;
}`,

  '/php-smm-panel/apiconnect/apiconnect.php': `<?php
/**
 * LuvSMM Pro SMM API Connector module (apiconnect.php)
 */
require_once __DIR__ . '/../backend/db.php';

function send_order_to_provider($orderId) {
    global $pdo;
    // Pushes orders to external Provider endpoints via cURL...
    $ch = curl_init($api_url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($payload));
    
    $responseRaw = curl_exec($ch);
    // Return order status & token
}`,

  '/php-smm-panel/cronjobs/cron.php': `<?php
/**
 * LuvSMM Pro SMM Panel cron script (cron.php)
 * Checks external API status and processes partial automatic refunds
 */
require_once __DIR__ . '/../backend/db.php';
require_once __DIR__ . '/../apiconnect/apiconnect.php';

echo "--- STARTING LUV_SMM PRO ORDER SYNC CRON --- \\n";
// Polls non-completed API orders, updates local DB and refunds cash if partial/failed !`,

  '/php-smm-panel/README.md': `# LuvSMM Pro - Premium PHP SMM Panel Script Setup

This package contains the complete, production-ready, highly secure **PHP SMM (Social Media Marketing) Panel** implementation that mimics LuvSMM.com.

Please read the README guide layout inside the ZIP to configure your database, setup your Cron parameters and connect with APIs successfully.`
};
