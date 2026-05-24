<?php
/**
 * LuvSMM Pro SMM Panel API API Integration (api.php)
 * Exposes actions to external clients: balance, services, add, status
 */

require_once __DIR__ . '/backend/db.php';

// Parse query params and POST body
$apiKey = isset($_REQUEST['key']) ? sanitize_input($_REQUEST['key']) : '';
$action = isset($_REQUEST['action']) ? sanitize_input($_REQUEST['action']) : '';

if (empty($apiKey)) {
    api_response(['error' => 'API Key is required'], 400);
}

// Authenticate api_key
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
            'username' => $user['username']
        ]);
        break;

    case 'services':
        try {
            // Get all active services with categories
            $stmtServices = $pdo->query("
                SELECT s.id, s.name, s.price as rate, s.min_quantity as min, s.max_quantity as max, c.name as category, s.description
                FROM services s
                JOIN categories c ON s.category_id = c.id
                WHERE s.status = 'active' AND c.status = 'active'
                ORDER BY c.sort_order ASC, s.id ASC
            ");
            $services = $stmtServices->fetchAll();
            
            $formattedServices = [];
            foreach ($services as $srv) {
                $formattedServices[] = [
                    'service' => (string)$srv['id'],
                    'name' => $srv['name'],
                    'type' => 'Default',
                    'category' => $srv['category'],
                    'rate' => number_format((float)$srv['rate'], 4, '.', ''),
                    'min' => (string)$srv['min'],
                    'max' => (string)$srv['max'],
                    'desc' => $srv['description'] ?? ''
                ];
            }
            api_response($formattedServices);
        } catch (PDOException $e) {
            api_response(['error' => 'Database error loading services'], 500);
        }
        break;

    case 'add':
        $serviceId = isset($_REQUEST['service']) ? (int)$_REQUEST['service'] : 0;
        $link = isset($_REQUEST['link']) ? sanitize_input($_REQUEST['link']) : '';
        $quantity = isset($_REQUEST['quantity']) ? (int)$_REQUEST['quantity'] : 0;

        if ($serviceId <= 0 || empty($link) || $quantity <= 0) {
            api_response(['error' => 'Required parameters missing: service, link, quantity'], 400);
        }

        // Validate service
        $stmtSrv = $pdo->prepare("SELECT * FROM services WHERE id = ? AND status = 'active'");
        $stmtSrv->execute([$serviceId]);
        $service = $stmtSrv->fetch();

        if (!$service) {
            api_response(['error' => 'Service not found or inactive'], 404);
        }

        if ($quantity < $service['min_quantity']) {
            api_response(['error' => 'Quantity must be at least ' . $service['min_quantity']], 400);
        }
        if ($quantity > $service['max_quantity']) {
            api_response(['error' => 'Quantity must be a maximum of ' . $service['max_quantity']], 400);
        }

        // Calculate cost
        $cost = ($service['price'] / 1000) * $quantity;

        if ($user['balance'] < $cost) {
            api_response(['error' => 'Insufficient funds. Please add balance first'], 402);
        }

        $pdo->beginTransaction();
        try {
            // Deduct user balance
            $stmtDeduct = $pdo->prepare("UPDATE users SET balance = balance - ?, spent = spent + ? WHERE id = ?");
            $stmtDeduct->execute([$cost, $cost, $user['id']]);

            // Save order to db
            $stmtOrder = $pdo->prepare("
                INSERT INTO orders (user_id, service_id, link, quantity, charge, status, source)
                VALUES (?, ?, ?, ?, ?, 'pending', 'api')
            ");
            $stmtOrder->execute([
                $user['id'],
                $serviceId,
                $link,
                $quantity,
                $cost
            ]);
            $orderId = $pdo->lastInsertId();

            $pdo->commit();

            // SMM Auto provisioning can hook here to send downstream to API providers if needed!
            // E.g. apiconnect($orderId);

            api_response([
                'order' => (int)$orderId,
                'charge' => number_format((float)$cost, 4, '.', '')
            ]);

        } catch (Exception $e) {
            $pdo->rollBack();
            api_response(['error' => 'Transaction failed: ' . $e->getMessage()], 500);
        }
        break;

    case 'status':
        $orderId = isset($_REQUEST['order']) ? (int)$_REQUEST['order'] : 0;
        $ordersArray = isset($_REQUEST['orders']) ? sanitize_input($_REQUEST['orders']) : '';

        if ($orderId > 0) {
            // Query single order status
            $stmtOrd = $pdo->prepare("
                SELECT o.status, o.charge, o.start_count, o.remains
                FROM orders o
                WHERE o.id = ? AND o.user_id = ?
            ");
            $stmtOrd->execute([$orderId, $user['id']]);
            $order = $stmtOrd->fetch();

            if (!$order) {
                api_response(['error' => 'Order not found'], 404);
            }

            api_response([
                'charge' => number_format((float)$order['charge'], 4, '.', ''),
                'start_count' => (string)$order['start_count'],
                'status' => strtoupper($order['status']),
                'remains' => (string)$order['remains'],
                'currency' => get_setting('site_currency') ?? 'USD'
            ]);
        } elseif (!empty($ordersArray)) {
            // Query multiple order statuses
            $idList = array_map('intval', explode(',', $ordersArray));
            if (count($idList) > 100) {
                api_response(['error' => 'Maximum bulk query limit is 100 orders'], 400);
            }

            $inQuery = implode(',', array_fill(0, count($idList), '?'));
            $params = array_merge($idList, [$user['id']]);
            
            $stmtOrds = $pdo->prepare("
                SELECT id, status, charge, start_count, remains
                FROM orders
                WHERE id IN ($inQuery) AND user_id = ?
            ");
            $stmtOrds->execute($params);
            $results = $stmtOrds->fetchAll();

            $formattedBulk = [];
            foreach ($results as $row) {
                $formattedBulk[$row['id']] = [
                    'charge' => number_format((float)$row['charge'], 4, '.', ''),
                    'start_count' => (string)$row['start_count'],
                    'status' => strtoupper($row['status']),
                    'remains' => (string)$row['remains']
                ];
            }

            // Fill missing orders with notice
            foreach ($idList as $id) {
                if (!isset($formattedBulk[$id])) {
                    $formattedBulk[$id] = ['error' => 'Order not found'];
                }
            }

            api_response($formattedBulk);
        } else {
            api_response(['error' => 'Required parameter missing: order or orders'], 400);
        }
        break;

    default:
        api_response(['error' => 'Unknown action or invalid API parameters'], 400);
        break;
}
