# LuvSMM Pro - Premium PHP SMM Panel Script Setup

This package contains the complete, production-ready, highly secure **PHP SMM (Social Media Marketing) Panel** implementation that mimics LuvSMM.com.

## 📂 Deliverables in this Package
*   `/backend/database/database.sql` — Secure, indexed database tables including users, orders, tickets, API providers, and session variables.
*   `/config.php` — Central configuration, JWT/Salt keys, error limits, base paths.
*   `/backend/db.php` — Fast PDO database initialization handler & utility.
*   `/api.php` — SMM Standard REST API implementing full protocol definitions (`balance`, `services`, `add`, `status`).
*   `/apiconnect/apiconnect.php` — SMM API Provider curl handler (auto-submits orders downstream to provider panels).
*   `/cronjobs/cron.php` — Automatic order status checker and synchronization engine (includes auto-partial refund code).

---

## 🛠️ Step-by-Step Installation Instructions

### 1. Database Provisioning
1. Login to your Web Hosting Panel (like cPanel, Plesk, or CloudPanel).
2. Go to **MySQL Database Wizard**.
3. Create a database named `luvsmm_db`.
4. Create a database user (e.g., `luvsmm_user`) with a strong password.
5. Grant **ALL PRIVILEGES** to this user for the created database.
6. Open **phpMyAdmin**, select the `luvsmm_db` database, click on the **Import** tab, browse for `backend/database/database.sql` and run import.

### 2. File Deployment
1. Upload all directory contents to your server's root directory (typically `public_html`).
2. Open `config.php` and edit database connection constants to match your database variables:
   ```php
   define('DB_HOST', 'localhost');
   define('DB_USER', 'luvsmm_user');
   define('DB_PASS', 'your_secure_password');
   define('DB_NAME', 'luvsmm_db');
   
   define('BASE_URL', 'https://yourluvsmmdomain.com'); // Replace with your real URL without trailing slash
   ```

### 3. Server Requirements & Fine-Tuning
*   **PHP Version**: 7.4 to 8.3
*   **PHP Extensions**: `pdo_mysql`, `curl`, `json`, `openssl`, `mbstring`.
*   Ensure write access to folders for session handling.

### 4. Setting up Auto-Cron Order Checkers (Critical)
To automatically check order updates and execute refunds if an order fails downstream:
1. In cPanel, navigate to **Cron Jobs**.
2. Create a new task executing every **5 minutes** (`*/5 * * * *`).
3. Set cron command line to run PHP with your script pathway:
   ```bash
   /usr/local/bin/php /home/username/public_html/cronjobs/cron.php
   ```
4. *Alternative webhook call via URL*: If you do not have SSH/CLI PHP execution, trigger via web request with your JWT key:
   ```bash
   curl -s "https://yourluvsmmdomain.com/cronjobs/cron.php?cron_key=sMmpAneL-Super-SeCret-kEy-LuvSMM-2026!"
   ```

---

## 🔑 Default Administrator Login Credentials
After database import, you can log in immediately using the master administrator credentials:
*   **Username**: `admin`
*   **Password**: `admin123`
*   *Please change this password inside your administrative dashboard immediately after installation.*

---

## 🚀 REST API Developer Documentation Specifications

Clients integrated with you can perform API operations via HTTP requests.

### 1. Get Balance
*   **Endpoint:** `POST` `/api.php`
*   **Parameters:**
    *   `key`: Client API Key
    *   `action`: `balance`
*   **Response Status (200 OK):**
    ```json
    {
      "balance": "100.0000",
      "currency": "USD",
      "username": "client_username"
    }
    ```

### 2. Create Order
*   **Endpoint:** `POST` `/api.php`
*   **Parameters:**
    *   `key`: Client API Key
    *   `action`: `add`
    *   `service`: Service Catalog ID
    *   `link`: Link to social channel/post
    *   `quantity`: Number to order
*   **Response Status (201 Created):**
    ```json
    {
      "order": 105,
      "charge": "2.4000"
    }
    ```

---
*Created and compiled securely via Google AI Studio.*
