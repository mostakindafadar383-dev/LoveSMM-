<?php
/**
 * LuvSMM Pro SMM Panel cron script (cron.php)
 * Checks external api providers for order updates then updates client orders in database
 * Recommended setup: run every 5 minutes in cPanel:
 * PHP executable path: `/usr/local/bin/php /home/username/public_html/cronjobs/cron.php`
 */

require_once __DIR__ . '/../backend/db.php';
require_once __DIR__ . '/../apiconnect/apiconnect.php';

// Prevent unauthorized web execution (requires private command-line or pass key)
if (php_sapi_name() !== 'cli') {
    $cronKey = isset($_GET['cron_key']) ? $_GET['cron_key'] : '';
    $configuredKey = JWT_SALT; // Uses salt as an absolute fail-safe webhook password
    if ($cronKey !== $configuredKey) {
        die("Unauthorized access. Command Line or valid Cron security token is required.");
    }
}

echo "--- STARTING LUV_SMM PRO ORDER SYNC CRON --- \n";

try {
    // 1. Fetch orders which have an api provider ID and are not finalized
    $stmt = $pdo->query("
        SELECT o.id, o.api_order_id, ap.id as provider_id, ap.api_url, ap.api_key, o.status as current_status
        FROM orders o
        JOIN services s ON o.service_id = s.id
        JOIN api_providers ap ON s.api_provider_id = ap.id
        WHERE o.api_order_id IS NOT NULL 
          AND o.status NOT IN ('completed', 'canceled', 'partial')
        ORDER BY ap.id ASC
        LIMIT 100 -- Restrict batch limits to prevent heavy timeouts
    ");
    $orders = $stmt->fetchAll();

    if (empty($orders)) {
        echo "No orders require active provider sync. Exit.\n";
        exit;
    }

    echo "Found " . count($orders) . " order(s) to synchronize.\n";

    // Loop through individual order checking
    foreach ($orders as $ord) {
        echo "Synchronizing Order ID: {$ord['id']} | Provider ref: {$ord['api_order_id']}...\n";

        $postData = [
            'key' => $ord['api_key'],
            'action' => 'status',
            'order' => $ord['api_order_id']
        ];

        // Perform curl status query
        $ch = curl_init($ord['api_url']);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postData));
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        
        $response = curl_exec($ch);
        curl_close($ch);

        if ($response === false) {
            echo "FAILED CON - Skipping order ID: {$ord['id']}\n";
            continue;
        }

        $res = json_decode($response, true);

        if (isset($res['status'])) {
            $rawStatus = strtolower($res['status']);
            $startCount = isset($res['start_count']) ? (int)$res['start_count'] : 0;
            $remains = isset($res['remains']) ? (int)$res['remains'] : 0;

            // Map standard API statuses to domestic database statuses
            $mappedStatus = 'pending';
            if (in_array($rawStatus, ['pending', 'inprogress', 'completed', 'partial', 'canceled', 'processing'])) {
                $mappedStatus = $rawStatus;
            } elseif ($rawStatus === 'in progress') {
                $mappedStatus = 'inprogress';
            } elseif ($rawStatus === 'cancelled') {
                $mappedStatus = 'canceled';
            }

            // Update Database Record
            $stmtUpd = $pdo->prepare("
                UPDATE orders 
                SET status = ?, start_count = ?, remains = ? 
                WHERE id = ?
            ");
            $stmtUpd->execute([$mappedStatus, $startCount, $remains, $ord['id']]);

            // Refund User if state became Canceled/Partial
            if ($mappedStatus === 'canceled' && $ord['current_status'] !== 'canceled') {
                // Return cash entirely
                refund_user_order($ord['id']);
            } elseif ($mappedStatus === 'partial' && $ord['current_status'] !== 'partial') {
                // Return leftover cash based on remains density
                refund_user_order($ord['id'], true, $remains);
            }

            echo "SUCCESS: Checked. New status: {$mappedStatus} | Remains: {$remains}\n";
        } else {
            echo "PROVIDER ERROR - response: " . substr($response, 0, 100) . "\n";
        }
    }

} catch (PDOException $e) {
    echo "DATABASE CRITICAL ERROR: " . $e->getMessage() . "\n";
}

/**
 * Handles Automatic Cash Refunds for canceled or partial provider orders
 */
function refund_user_order($orderId, $partial = false, $remains = 0) {
    global $pdo;
    try {
        $stmt = $pdo->prepare("SELECT * FROM orders WHERE id = ?");
        $stmt->execute([$orderId]);
        $order = $stmt->fetch();

        if (!$order) return;

        $refundAmount = 0.0000;
        if ($partial) {
            if ($order['quantity'] > 0 && $remains > 0) {
                $ratio = (float)$remains / (float)$order['quantity'];
                // Safeguard boundaries
                if ($ratio > 1) $ratio = 1;
                $refundAmount = $order['charge'] * $ratio;
            }
        } else {
            $refundAmount = $order['charge'];
        }

        if ($refundAmount <= 0) return;

        $pdo->beginTransaction();
        // Credit client balance
        $stmtCredit = $pdo->prepare("UPDATE users SET balance = balance + ?, spent = spent - ? WHERE id = ?");
        $stmtCredit->execute([$refundAmount, $refundAmount, $order['user_id']]);

        // Record a manual payment entry logged as refund for audit records
        $stmtLog = $pdo->prepare("
            INSERT INTO payments (user_id, payment_method, transaction_id, amount, status)
            VALUES (?, 'SYSTEM REFUND', ?, ?, 'completed')
        ");
        $stmtLog->execute([
            $order['user_id'],
            'REFUND-' . $orderId . '-' . time(),
            $refundAmount
        ]);

        $pdo->commit();
        echo "Refunded user ID {$order['user_id']} with Amount: {$refundAmount} due to partial/cancel status.\n";
    } catch (Exception $e) {
        $pdo->rollBack();
        echo "Refund procedure crash: " . $e->getMessage() . "\n";
    }
}

echo "--- ALL TASKS PROCESSED SUCCESSFULLY --- \n";
