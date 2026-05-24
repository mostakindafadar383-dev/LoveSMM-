-- phpMyAdmin SQL Dump
-- SMM Panel Database Structure
-- Compatible with PHP 7.4 - 8.3
-- Designed for LuvSMM Pro Panel clone

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(64) NOT NULL UNIQUE,
  `email` varchar(128) NOT NULL UNIQUE,
  `password` varchar(255) NOT NULL,
  `balance` decimal(15,4) NOT NULL DEFAULT '0.0000',
  `spent` decimal(15,4) NOT NULL DEFAULT '0.0000',
  `api_key` varchar(64) NOT NULL UNIQUE,
  `role` enum('user', 'admin') NOT NULL DEFAULT 'user',
  `status` enum('active', 'suspended') NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `sort_order` int(11) NOT NULL DEFAULT '0',
  `status` enum('active', 'inactive') NOT NULL DEFAULT 'active',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `api_providers`
--

CREATE TABLE `api_providers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `api_url` varchar(255) NOT NULL,
  `api_key` varchar(255) NOT NULL,
  `balance` decimal(15,4) NOT NULL DEFAULT '0.0000',
  `status` enum('active', 'inactive') NOT NULL DEFAULT 'active',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `services`
--

CREATE TABLE `services` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `category_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(15,4) NOT NULL, -- Price per 1000
  `original_price` decimal(15,4) NOT NULL DEFAULT '0.0000', -- Provider price per 1000
  `min_quantity` int(11) NOT NULL DEFAULT '10',
  `max_quantity` int(11) NOT NULL DEFAULT '100000',
  `api_provider_id` int(11) DEFAULT NULL, -- NULL means manual service
  `api_service_id` int(11) DEFAULT NULL, -- Provider's service ID
  `status` enum('active', 'inactive') NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `service_id` int(11) NOT NULL,
  `link` varchar(255) NOT NULL,
  `quantity` int(11) NOT NULL,
  `charge` decimal(15,4) NOT NULL,
  `start_count` int(11) NOT NULL DEFAULT '0',
  `remains` int(11) NOT NULL DEFAULT '0',
  `status` enum('pending', 'inprogress', 'completed', 'partial', 'canceled', 'processing') NOT NULL DEFAULT 'pending',
  `api_provider_id` int(11) DEFAULT NULL,
  `api_order_id` int(11) DEFAULT NULL, -- External Order ID
  `source` enum('web', 'api') NOT NULL DEFAULT 'web',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tickets`
--

CREATE TABLE `tickets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `status` enum('open', 'pending', 'answered', 'closed') NOT NULL DEFAULT 'open',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ticket_replies`
--

CREATE TABLE `ticket_replies` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ticket_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`ticket_id`) REFERENCES `tickets`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `payment_method` varchar(64) NOT NULL,
  `transaction_id` varchar(128) NOT NULL,
  `amount` decimal(15,4) NOT NULL,
  `status` enum('completed', 'pending', 'failed') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(64) NOT NULL UNIQUE,
  `setting_value` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping default configuration data
--

INSERT INTO `settings` (`setting_key`, `setting_value`) VALUES
('site_name', 'LuvSMM - Ultimate SMM Panel'),
('site_currency', 'USD'),
('site_currency_symbol', '$'),
('paypal_email', 'billing@luvsmm.com'),
('stripe_secret_key', ''),
('stripe_publishable_key', ''),
('ticket_system_status', 'enabled'),
('maintenance_mode', 'disabled');

--
-- Create default Admin Account
-- Username: admin / Password: admin123 (Needs post-setup encryption)
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `balance`, `spent`, `api_key`, `role`, `status`) VALUES
(1, 'admin', 'admin@luvsmm.com', '$2y$10$9v/l2FpC2Y90pC77BvA1KuxYv1hXm9b15S6G3S.9V9x2A0e.86mby', '1000.0000', '0.0000', '7f3e8203f7a6a7c4f1c1fca0dca44ba8', 'admin', 'active');

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
