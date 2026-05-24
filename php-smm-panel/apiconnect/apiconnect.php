<?php
/**
 * LuvSMM Pro SMM API Connector module (apiconnect.php)
 * Sends client orders placed on this panel downstream to LuvSMM or other main providers
 */

require_once __DIR__ . '/../backend/db.php';

/**
 * places order to external API provider
 * @param int $orderId internal order ID from `orders` table
 * @return array ['success' => bool, 'api_order_id' => int, 'error' => string]
 */
function send_order_to_provider($orderId) {
    global $pdo;

    try {
        // Fetch order details alongside service api settings
        $stmt = $pdo->prepare("
            SELECT o.*, s.api_service_id, ap.api_url, ap.api_key
            FROM orders o
            JOIN services s ON o.service_id = s.id
            JOIN api_providers ap ON s.api_provider_id = ap.id
            WHERE o.id = ? AND s.api_provider_id IS NOT NULL AND o.api_order_id IS NULL
        ");
        $stmt->execute([$orderId]);
        $order = $stmt->fetch();

        if (!$order) {
            return ['success' => false, 'error' => 'Order already pushed, or manual service.'];
        }

        // Prepare raw poster array matching SMM SMM API protocol
        $postData = [
            'key' => $order['api_key'],
            'action' => 'add',
            'service' => $order['api_service_id'],
            'link' => $order['link'],
            'quantity' => $order['quantity']
        ];

        // Send API request via cURL
        $ch = curl_init($order['api_url']);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postData));
        curl_setopt($ch, CURLOPT_TIMEOUT, 15);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // For localhost support

        $responseRaw = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $errorStr = curl_error($ch);
        curl_close($ch);

        if ($responseRaw === false) {
            return ['success' => false, 'error' => 'cURL Error: ' . $errorStr];
        }

        $res = json_decode($responseRaw, true);

        if (isset($res['order']) && $res['order'] > 0) {
            // Success! Save Provider Order ID
            $stmtUpdate = $pdo->prepare("
                UPDATE orders 
                SET api_order_id = ?, status = 'processing' 
                WHERE id = ?
            ");
            $stmtUpdate->execute([$res['order'], $orderId]);

            return [
                'success' => true,
                'api_order_id' => $res['order']
            ];
        } else {
            // Provider returned error
            $errText = isset($res['error']) ? $res['error'] : 'Unknown provider error. Response: ' . substr($responseRaw, 0, 150);
            
            // Mark order as canceled or manual review
            $stmtFail = $pdo->prepare("UPDATE orders SET status = 'pending' WHERE id = ?");
            $stmtFail->execute([$orderId]);

            return ['success' => false, 'error' => $errText];
        }

    } catch (PDOException $e) {
        return ['success' => false, 'error' => 'Database failure: ' . $e->getMessage()];
    }
}

/**
 * Query external API package for balance information
 * @param int $providerId API Provider ID
 * @return array ['success' => bool, 'balance' => float, 'error' => string]
 */
function query_provider_balance($providerId) {
    global $pdo;

    $stmt = $pdo->prepare("SELECT * FROM api_providers WHERE id = ?");
    $stmt->execute([$providerId]);
    $provider = $stmt->fetch();

    if (!$provider) {
        return ['success' => false, 'error' => 'Provider not found.'];
    }

    $ch = curl_init($provider['api_url']);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
        'key' => $provider['api_key'],
        'action' => 'balance'
    ]));
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

    $response = curl_exec($ch);
    curl_close($ch);

    if ($response === false) {
        return ['success' => false, 'error' => 'Connection timed out.'];
    }

    $res = json_decode($response, true);
    if (isset($res['balance'])) {
        // Cache provider balance in db
        $stmtUpd = $pdo->prepare("UPDATE api_providers SET balance = ? WHERE id = ?");
        $stmtUpd->execute([$res['balance'], $providerId]);

        return ['success' => true, 'balance' => $res['balance']];
    } else {
        return ['success' => false, 'error' => isset($res['error']) ? $res['error'] : 'Unknown response structure.'];
    }
}
