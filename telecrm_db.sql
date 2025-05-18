-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 18, 2025 at 03:17 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `telecrm_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

CREATE TABLE `admins` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone_no` varchar(15) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(50) NOT NULL,
  `status` varchar(50) DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `token` varchar(255) DEFAULT NULL,
  `last_login` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admins`
--

INSERT INTO `admins` (`id`, `name`, `email`, `phone_no`, `password`, `role`, `status`, `created_at`, `updated_at`, `token`, `last_login`) VALUES
(1, 'Tanshi', 'tkhandelwal03@gmail.com', '1234567890', '$2b$10$jILwQXQfnfNYKaOUIYTn/.qR9r.1mqhws.HlMX6sHll0hB9ymNOBq', 'admin', 'active', '2025-03-05 10:06:55', '2025-03-05 10:08:03', NULL, NULL),
(2, 'Varsha', 'varsha93@gmail.com', '8033568291', '$2b$10$xkbs1eMDXiCK4sLHU7ecyOrqEvQ9RZ9WvE5cUC0mZnNJADQz1Ccjy', 'admin', 'active', '2025-03-04 10:46:26', '2025-03-26 05:46:27', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InNocmV5YTIzQGV4YW1wbGUuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzQxMDg1MTg2LCJleHAiOjE3NDEwODg3ODZ9.Z5bSGubu4X-L_C60_1GF-_7nHRxPogl7JTrjX7eBp48', NULL),
(10, 'Sasha', 'sasha93@gmail.com', '8037568291', '$2b$10$qGcT1RIxpBGbM7eZO2ZSZuSC9P0x04.YzBq9JHfSMB2KT9OqEcr3W', 'admin', 'active', '2025-03-27 11:56:28', '2025-04-15 11:50:42', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0MzA3NjU4OCwiZXhwIjoxNzQzMTYyOTg4fQ.kNF0ty_wh-PqCmZR9fhWmaNu2pPzDtqT0UYb9TeajNA', NULL),
(11, 'Vaishali', 'vaishali93@gmail.com', '8033568296', '$2b$10$Iv69zTALgMVqsQZ/6R6S0epKYNL5CyvzzC8u4nZx0VxANFpQAwj7m', 'admin', 'active', '2025-04-15 11:47:52', '2025-05-18 09:13:41', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0NzU1OTYyMSwiZXhwIjoxNzQ3NjQ2MDIxfQ.mCVQBJwroyOXqBZ1EZGOtGJRtfFY97P76vJ0Uj7n0ek', '2025-05-18 14:43:41'),
(12, 'Aditi', 'aditi2@gmail.com', '1234567890', '$2b$10$OkER.11/5WF1tFS6iHUajuaqo9An7xtRk93XoKA681CXNU0SpToxG', 'admin', 'active', '2025-05-09 09:50:50', '2025-05-18 12:16:53', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0NzU3MDYxMywiZXhwIjoxNzQ3NjU3MDEzfQ.atPWerqGaqvZbTN0no6aI3_n4xzM1w9IAF8xHIVBDd4', '2025-05-18 17:46:53');

-- --------------------------------------------------------

--
-- Stand-in structure for view `best_calling_hours`
-- (See below for the actual view)
--
CREATE TABLE `best_calling_hours` (
`caller_id` int(11)
,`hour_of_day` int(2)
,`total_calls` bigint(21)
,`successful_calls` bigint(21)
,`success_rate` decimal(26,2)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `callback_efficiency`
-- (See below for the actual view)
--
CREATE TABLE `callback_efficiency` (
`caller_id` int(11)
,`caller_name` varchar(100)
,`total_callbacks` bigint(21)
,`completed_callbacks` bigint(21)
,`callback_completion_rate` decimal(26,2)
,`avg_callback_delay_minutes` decimal(24,4)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `caller_performance_metrics`
-- (See below for the actual view)
--
CREATE TABLE `caller_performance_metrics` (
`caller_id` int(11)
,`caller_name` varchar(100)
,`daily_call_target` int(11)
,`monthly_call_target` int(11)
,`target_daily_hours` decimal(4,2)
,`target_monthly_hours` decimal(6,2)
,`today_calls` bigint(21)
,`today_hours` decimal(36,4)
,`month_calls` bigint(21)
,`month_hours` decimal(36,4)
,`daily_target_completion` decimal(26,2)
,`monthly_target_completion` decimal(26,2)
,`conversion_rate` decimal(26,2)
,`completion_rate` decimal(26,2)
);

-- --------------------------------------------------------

--
-- Table structure for table `calls`
--

CREATE TABLE `calls` (
  `id` int(11) NOT NULL,
  `caller_id` int(11) NOT NULL,
  `lead_id` int(11) NOT NULL,
  `start_time` datetime NOT NULL,
  `end_time` datetime DEFAULT NULL,
  `duration` int(11) DEFAULT NULL,
  `status` enum('completed','missed','no-answer','busy','failed') NOT NULL,
  `call_type` enum('outbound','inbound','follow-up') NOT NULL,
  `disposition` varchar(50) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `callback_datetime` datetime DEFAULT NULL COMMENT 'Scheduled date and time for callback if needed',
  `recording_url` varchar(255) DEFAULT NULL,
  `callback_scheduled` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `calls`
--

INSERT INTO `calls` (`id`, `caller_id`, `lead_id`, `start_time`, `end_time`, `duration`, `status`, `call_type`, `disposition`, `notes`, `callback_datetime`, `recording_url`, `callback_scheduled`, `created_at`, `updated_at`) VALUES
(1, 12, 8, '2025-05-18 10:00:00', '2025-05-18 10:15:00', 900, 'completed', 'outbound', 'interested', 'Customer showed high interest in our product. Discussed pricing.', NULL, 'https://example.com/recording/123', '2025-05-20 14:00:00', '2025-05-18 10:04:19', '2025-05-18 10:04:19'),
(2, 12, 8, '2025-05-18 10:00:00', '2025-05-18 10:20:00', 1200, 'completed', 'outbound', 'interested', 'Updated: Customer requested detailed proposal', NULL, 'https://example.com/recording/123', '2025-05-20 14:00:00', '2025-05-18 10:06:22', '2025-05-18 10:08:45'),
(3, 12, 19, '2025-05-18 10:00:00', '2025-05-18 10:20:00', 1200, 'completed', 'outbound', 'interested', 'Updated: Customer requested detailed proposal', '2025-05-20 14:00:00', 'https://example.com/recording/123', '2025-05-20 14:00:00', '2025-05-18 11:59:38', '2025-05-18 12:01:47');

-- --------------------------------------------------------

--
-- Table structure for table `campaigns`
--

CREATE TABLE `campaigns` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `status` enum('Active','Inactive') NOT NULL DEFAULT 'Active',
  `lead_count` int(11) DEFAULT 0,
  `priority` enum('Low','Medium','High') NOT NULL DEFAULT 'Medium',
  `start_date` datetime NOT NULL,
  `end_date` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `admin_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `campaigns`
--

INSERT INTO `campaigns` (`id`, `name`, `description`, `status`, `lead_count`, `priority`, `start_date`, `end_date`, `created_at`, `updated_at`, `admin_id`) VALUES
(3, 'Updated Campaign Name', 'New description for the updated campaign', 'Active', 2, 'High', '2025-04-15 13:00:00', '2025-04-29 13:00:00', '2025-04-15 15:59:26', '2025-05-15 17:13:58', 11),
(8, 'TANSHI KHANDELWAL', 'df', 'Active', 0, 'Medium', '2025-05-10 07:30:00', '2025-06-06 07:30:00', '2025-05-09 12:02:44', '2025-05-18 13:05:18', 12),
(11, 'Blast of Summer', 'High-intent leads from Instagram', 'Active', 1, 'High', '2025-04-14 18:30:00', NULL, '2025-05-12 09:48:54', '2025-05-15 17:18:55', 11),
(12, 'Summer Blast', 'High-intent leads from Instagram', 'Active', 1, 'High', '2025-04-15 00:00:00', NULL, '2025-05-13 06:51:55', '2025-05-13 06:51:55', 11);

-- --------------------------------------------------------

--
-- Table structure for table `campaign_users`
--

CREATE TABLE `campaign_users` (
  `id` int(11) NOT NULL,
  `campaign_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `campaign_users`
--

INSERT INTO `campaign_users` (`id`, `campaign_id`, `user_id`) VALUES
(39, 12, 1),
(40, 3, 1),
(43, 3, 26),
(45, 3, 12),
(46, 11, 12),
(48, 8, 42);

-- --------------------------------------------------------

--
-- Stand-in structure for view `daily_caller_stats`
-- (See below for the actual view)
--
CREATE TABLE `daily_caller_stats` (
`caller_id` int(11)
,`caller_name` varchar(100)
,`call_date` date
,`total_calls` bigint(21)
,`completed_calls` bigint(21)
,`missed_calls` bigint(21)
,`total_hours` decimal(36,4)
,`interested_leads` bigint(21)
,`not_interested_leads` bigint(21)
,`callbacks_scheduled` bigint(21)
);

-- --------------------------------------------------------

--
-- Table structure for table `leads`
--

CREATE TABLE `leads` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('New','Contacted','Follow-Up Scheduled','Interested','Not Interested','Call Back Later','Under Review','Converted','Lost','Not Reachable','On Hold') NOT NULL,
  `lead_category` enum('Fresh Lead','Bulk Lead','Cold Lead','Warm Lead','Hot Lead','Converted Lead','Lost Lead','Walk-in Lead','Re-Targeted Lead','Campaign Lead') DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `phone_no` varchar(20) NOT NULL,
  `address` text DEFAULT NULL,
  `assigned_to` int(11) DEFAULT NULL,
  `admin_id` int(11) NOT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `leads`
--

INSERT INTO `leads` (`id`, `title`, `description`, `status`, `lead_category`, `name`, `phone_no`, `address`, `assigned_to`, `admin_id`, `campaign_id`, `created_at`, `updated_at`, `notes`) VALUES
(8, 'New Franchise Inquiry - South Zone', 'Interested in franchise partnership', 'Interested', 'Warm Lead', 'Ramesh Verma', '9876543210', 'Hyderabad', NULL, 11, 8, '2025-05-12 17:12:34', '2025-05-18 17:58:42', 'Requested brochure and franchise fee details'),
(9, 'Software Deployment - School ERP', 'Looking for ERP solution for school', 'Follow-Up Scheduled', 'Cold Lead', 'Priya Chauhan', '9123456780', 'Jaipur', 12, 1, NULL, '2025-05-12 17:12:40', '2025-05-18 17:58:15', 'Call scheduled for 15th May, 3 PM'),
(12, 'HR Software Demo Request', 'Needs HRMS tool demo for small business', 'Call Back Later', 'Re-Targeted Lead', 'Neha Sinha', '9001234567', 'Lucknow', 12, 11, 3, '2025-05-12 17:13:41', '2025-05-18 17:58:15', 'Was busy during first call, asked to call next Monday'),
(14, 'Walk-in Lead - CRM Tool Trial', 'Visited our booth at tech fair', 'Under Review', 'Walk-in Lead', 'Aniket Raj', '9012345678', 'Pune', 12, 12, 11, '2025-05-12 17:14:05', '2025-05-18 17:58:15', 'Evaluating between us and another vendor'),
(18, 'Walk-in Lead - CRM ', 'Visited our booth', 'Under Review', 'Walk-in Lead', 'Aniket Raj', '9012345678', 'Pune', 40, 12, 8, '2025-05-13 12:18:45', '2025-05-18 18:00:09', 'Evaluating between us and another vendor'),
(19, 'Walk-in Lead - CRM ', 'Visited our booth', 'Under Review', 'Walk-in Lead', 'Aniket Raj', '9012345678', 'Pune', 12, 12, 8, '2025-05-13 12:20:46', '2025-05-18 17:58:15', 'Evaluating between us and another vendor'),
(20, 'Lead 1', 'Interested in Product A', 'New', 'Fresh Lead', 'John Doe', '1234567890', 'Earth', 12, 11, 12, '2025-05-13 12:21:55', '2025-05-18 17:58:15', 'Wants a callback'),
(21, 'Product Launch - Phase 3', 'Finalizing design and testing', 'Contacted', 'Hot Lead', 'Aarti Sharma', '9998887776', 'Delhi', 28, 12, 8, '2025-05-18 17:47:57', '2025-05-18 18:04:21', 'Follow up for further details');

--
-- Triggers `leads`
--
DELIMITER $$
CREATE TRIGGER `trg_update_total_leads_after_delete` AFTER DELETE ON `leads` FOR EACH ROW BEGIN
    IF OLD.assigned_to IS NOT NULL THEN
        UPDATE users
        SET total_leads = (
            SELECT COUNT(*)
            FROM leads
            WHERE assigned_to = OLD.assigned_to
        )
        WHERE id = OLD.assigned_to;
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_update_total_leads_after_insert` AFTER INSERT ON `leads` FOR EACH ROW BEGIN
    IF NEW.assigned_to IS NOT NULL THEN
        UPDATE users
        SET total_leads = (
            SELECT COUNT(*)
            FROM leads
            WHERE assigned_to = NEW.assigned_to
        )
        WHERE id = NEW.assigned_to;
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_update_total_leads_after_update` AFTER UPDATE ON `leads` FOR EACH ROW BEGIN
    -- Update old user's lead count
    IF OLD.assigned_to IS NOT NULL THEN
        UPDATE users
        SET total_leads = (
            SELECT COUNT(*)
            FROM leads
            WHERE assigned_to = OLD.assigned_to
        )
        WHERE id = OLD.assigned_to;
    END IF;

    -- Update new user's lead count if changed
    IF NEW.assigned_to IS NOT NULL AND (OLD.assigned_to IS NULL OR OLD.assigned_to != NEW.assigned_to) THEN
        UPDATE users
        SET total_leads = (
            SELECT COUNT(*)
            FROM leads
            WHERE assigned_to = NEW.assigned_to
        )
        WHERE id = NEW.assigned_to;
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Stand-in structure for view `monthly_caller_stats`
-- (See below for the actual view)
--
CREATE TABLE `monthly_caller_stats` (
`caller_id` int(11)
,`caller_name` varchar(100)
,`call_month` varchar(7)
,`total_calls` bigint(21)
,`completed_calls` bigint(21)
,`missed_calls` bigint(21)
,`total_hours` decimal(36,4)
,`completion_rate` decimal(26,2)
,`interested_leads` bigint(21)
,`conversion_rate` decimal(26,2)
,`avg_call_duration_minutes` decimal(18,8)
);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone_no` varchar(15) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('manager','caller','field_employee') NOT NULL,
  `status` enum('active','inactive','suspended') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `token` varchar(255) DEFAULT NULL,
  `manager_id` int(11) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `last_login` datetime DEFAULT NULL,
  `total_leads` int(11) DEFAULT 0,
  `campaigns_handled` int(11) DEFAULT 0,
  `daily_call_target` int(11) DEFAULT 50,
  `monthly_call_target` int(11) DEFAULT 1000,
  `daily_calling_hours` decimal(4,2) DEFAULT 8.00,
  `monthly_calling_hours` decimal(6,2) DEFAULT 160.00,
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expiry` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `phone_no`, `password`, `role`, `status`, `created_at`, `updated_at`, `token`, `manager_id`, `location`, `last_login`, `total_leads`, `campaigns_handled`, `daily_call_target`, `monthly_call_target`, `daily_calling_hours`, `monthly_calling_hours`, `reset_token`, `reset_token_expiry`) VALUES
(1, 'Sonam Jha', 'sonam@gmail.com', '1234567890', '$2b$10$MVp/eu54INL1Vgi4WaXIM.Rup/nQ.GOk1eLk8fu4VOfyF.xLLkeXm', 'caller', 'active', '2025-04-14 17:45:07', '2025-05-18 12:28:15', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImNhbGxlciIsImlhdCI6MTc0NTA2MzYzOSwiZXhwIjoxNzQ1MTUwMDM5fQ.T2_9MwuRpvNeXsdz2vj-0uJ4j5q6QzmjHrLsg6cwxiQ', 26, 'Delhi', NULL, 0, 0, 50, 1000, 8.00, 160.00, NULL, NULL),
(11, 'Aarushi', 'aarushi@gmail.com', '9998887770', '$2b$10$Ur94E2a32M1BjRJC3VZvCOGjkNLICYcr2nQdfBrWBJ5hHgDliyXYm', 'field_employee', 'active', '2025-04-15 11:52:10', '2025-05-18 11:03:22', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsInJvbGUiOiJmaWVsZF9lbXBsb3llZSIsImlhdCI6MTc0NTI1MDQ0MSwiZXhwIjoxNzQ1MzM2ODQxfQ.QLT0IC7UJ4bl0cw9W5cjLXW-BbbySr8yE2fhIXtAysA', 26, 'Delhi', '2025-04-21 21:17:21', 0, 0, 50, 1000, 8.00, 160.00, NULL, NULL),
(12, 'Tanu', 'tanu@gmail.com', '9998885770', '$2b$10$.oIvi9pvdftfM2jIAssXWerkUjpI0ISFB/iTxs2CBmXtctGGtn16O', 'caller', 'active', '2025-04-20 10:54:34', '2025-05-18 12:51:45', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIsInJvbGUiOiJjYWxsZXIiLCJpYXQiOjE3NDc1NjkxNzksImV4cCI6MTc0NzY1NTU3OX0.HvtHInJD_3Che0cyBkeBzD_1iUVfPvy3OgA4AIYnF70', 26, 'Delhi', '2025-05-18 17:22:59', 5, 0, 50, 1000, 8.00, 160.00, NULL, NULL),
(13, 'Shreya', 'shreya@gmail.com', '8998887770', '$2b$10$43bPOjw9Tscw4SMkDWk6Ku5LnlB0kUgWd9YqWLqaIWKxi9eqpPCgG', 'manager', 'active', '2025-04-20 18:12:38', '2025-05-16 18:07:22', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTMsInJvbGUiOiJtYW5hZ2VyIiwiaWF0IjoxNzQ3MzkxMzI2LCJleHAiOjE3NDc0Nzc3MjZ9.qqHcLqST6-yoYBIwpCyyjEu6gPgFSA-Jr-UjMegQUZk', NULL, 'Delhi', '2025-05-16 15:58:46', 0, 0, 50, 1000, 8.00, 160.00, NULL, NULL),
(26, 'Tanshi Khandelwal', 'tanshi@gmail.com', '9876543210', '$2b$10$.3IsPfEfB7sbMek1gr2QT.PjN.DSbNd9Q3IcZ01caEnWatlPh2Ya6', 'manager', 'active', '2025-05-13 10:37:35', '2025-05-16 19:00:57', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjYsInJvbGUiOiJjYWxsZXIiLCJpYXQiOjE3NDcxMzI2NTUsImV4cCI6MTc0NzIxOTA1NX0.Dw7-d-q78ucyUb3V2MZok0O0kTZFVQ7VrwkMLntTDKs', 1, 'Indore', NULL, 0, 0, 50, 1000, 8.00, 160.00, NULL, NULL),
(28, 'Tanya Khandelwal', 'tanya@gmail.com', '9866543210', '$2b$10$3BUUlddWSGo5WFRLhMHqkObiyhYTLbvnrpDOS8Ge9uIi.bSbOBG/a', 'caller', 'suspended', '2025-05-15 18:20:07', '2025-05-18 12:34:21', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjgsInJvbGUiOiJjYWxsZXIiLCJpYXQiOjE3NDczMzMyMDcsImV4cCI6MTc0NzQxOTYwN30.LgF_9Up_Z6Zo6CfDDcU4YMAUKFcW29EE7GwsMIgN4X8', 13, 'Indore', NULL, 1, 0, 50, 1000, 8.00, 160.00, NULL, NULL),
(40, 'Ishita Sharma', 'ishi@gmail.com', '9998887770', '$2b$10$OkV.hifrnEp5EqjIbSofWeltpI1MuUWtE6bRpXkJlgRkcDtOVSG.W', 'caller', 'active', '2025-05-16 18:47:03', '2025-05-18 12:52:10', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NDAsInJvbGUiOiJjYWxsZXIiLCJpYXQiOjE3NDc0MjEyMjMsImV4cCI6MTc0NzUwNzYyM30.qGNR_egPwbxtme1PY5PZSdd5UpLAuSdKoB7d3V7HFI4', 26, 'Indore', NULL, 1, 0, 50, 1000, 8.00, 160.00, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NDAsInJvbGUiOiJjYWxsZXIiLCJpYXQiOjE3NDc1NjY1NTMsImV4cCI6MTc0NzU3MDE1M30.dywmKfMeolkKQJ4eG09x7W5ggJNzHsPT-eG6MJZHBto', '2025-05-18 17:39:13'),
(42, 'Charu Khandelwal', 'charu@gmail.com', '9998889770', '$2b$10$PMGqYkLRo0zZ69Ivr6yM3OwDFsMYXLdIU7Er9oh60039hfnp2HQEG', 'caller', 'active', '2025-05-18 13:00:52', '2025-05-18 13:13:29', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NDIsInJvbGUiOiJjYWxsZXIiLCJpYXQiOjE3NDc1NzQwMDksImV4cCI6MTc0NzY2MDQwOX0.lUWSOVGH8LpTSSQYdlcVv18Z6zT5dREBd0WaDgLuM8g', 13, 'Indore', '2025-05-18 18:43:29', 0, 0, 50, 1000, 8.00, 160.00, NULL, NULL);

-- --------------------------------------------------------

--
-- Stand-in structure for view `user_stats_view`
-- (See below for the actual view)
--
CREATE TABLE `user_stats_view` (
`id` int(11)
,`name` varchar(100)
,`email` varchar(100)
,`role` enum('manager','caller','field_employee')
,`total_leads` bigint(21)
,`campaigns_handled` bigint(21)
,`total_working_hours` decimal(27,2)
);

-- --------------------------------------------------------

--
-- Table structure for table `user_work_logs`
--

CREATE TABLE `user_work_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `work_date` date DEFAULT NULL,
  `hours_worked` decimal(5,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure for view `best_calling_hours`
--
DROP TABLE IF EXISTS `best_calling_hours`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `best_calling_hours`  AS SELECT `calls`.`caller_id` AS `caller_id`, hour(`calls`.`start_time`) AS `hour_of_day`, count(0) AS `total_calls`, count(case when `calls`.`status` = 'completed' and `calls`.`disposition` = 'interested' then 1 end) AS `successful_calls`, round(count(case when `calls`.`status` = 'completed' and `calls`.`disposition` = 'interested' then 1 end) / count(0) * 100,2) AS `success_rate` FROM `calls` WHERE `calls`.`status` = 'completed' GROUP BY `calls`.`caller_id`, hour(`calls`.`start_time`) ORDER BY round(count(case when `calls`.`status` = 'completed' and `calls`.`disposition` = 'interested' then 1 end) / count(0) * 100,2) DESC ;

-- --------------------------------------------------------

--
-- Structure for view `callback_efficiency`
--
DROP TABLE IF EXISTS `callback_efficiency`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `callback_efficiency`  AS SELECT `c`.`caller_id` AS `caller_id`, `u`.`name` AS `caller_name`, count(case when `c`.`call_type` = 'follow-up' then 1 end) AS `total_callbacks`, count(case when `c`.`call_type` = 'follow-up' and `c`.`status` = 'completed' then 1 end) AS `completed_callbacks`, round(count(case when `c`.`call_type` = 'follow-up' and `c`.`status` = 'completed' then 1 end) / count(case when `c`.`call_type` = 'follow-up' then 1 end) * 100,2) AS `callback_completion_rate`, avg(timestampdiff(MINUTE,`c`.`callback_scheduled`,`c`.`start_time`)) AS `avg_callback_delay_minutes` FROM (`calls` `c` join `users` `u` on(`c`.`caller_id` = `u`.`id`)) WHERE `c`.`call_type` = 'follow-up' GROUP BY `c`.`caller_id` ;

-- --------------------------------------------------------

--
-- Structure for view `caller_performance_metrics`
--
DROP TABLE IF EXISTS `caller_performance_metrics`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `caller_performance_metrics`  AS SELECT `u`.`id` AS `caller_id`, `u`.`name` AS `caller_name`, `u`.`daily_call_target` AS `daily_call_target`, `u`.`monthly_call_target` AS `monthly_call_target`, `u`.`daily_calling_hours` AS `target_daily_hours`, `u`.`monthly_calling_hours` AS `target_monthly_hours`, coalesce(`d`.`total_calls`,0) AS `today_calls`, coalesce(`d`.`total_hours`,0) AS `today_hours`, coalesce(`m`.`total_calls`,0) AS `month_calls`, coalesce(`m`.`total_hours`,0) AS `month_hours`, round(coalesce(`d`.`total_calls`,0) / `u`.`daily_call_target` * 100,2) AS `daily_target_completion`, round(coalesce(`m`.`total_calls`,0) / `u`.`monthly_call_target` * 100,2) AS `monthly_target_completion`, coalesce(`m`.`conversion_rate`,0) AS `conversion_rate`, coalesce(`m`.`completion_rate`,0) AS `completion_rate` FROM ((`users` `u` left join `daily_caller_stats` `d` on(`u`.`id` = `d`.`caller_id` and cast(`d`.`call_date` as date) = curdate())) left join `monthly_caller_stats` `m` on(`u`.`id` = `m`.`caller_id` and `m`.`call_month` = date_format(curdate(),'%Y-%m'))) WHERE `u`.`role` = 'caller' ;

-- --------------------------------------------------------

--
-- Structure for view `daily_caller_stats`
--
DROP TABLE IF EXISTS `daily_caller_stats`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `daily_caller_stats`  AS SELECT `c`.`caller_id` AS `caller_id`, `u`.`name` AS `caller_name`, cast(`c`.`start_time` as date) AS `call_date`, count(0) AS `total_calls`, count(case when `c`.`status` = 'completed' then 1 end) AS `completed_calls`, count(case when `c`.`status` = 'missed' or `c`.`status` = 'no-answer' then 1 end) AS `missed_calls`, sum(`c`.`duration`) / 3600 AS `total_hours`, count(case when `c`.`disposition` = 'interested' then 1 end) AS `interested_leads`, count(case when `c`.`disposition` = 'not-interested' then 1 end) AS `not_interested_leads`, count(case when `c`.`callback_scheduled` is not null then 1 end) AS `callbacks_scheduled` FROM (`calls` `c` join `users` `u` on(`c`.`caller_id` = `u`.`id`)) GROUP BY `c`.`caller_id`, cast(`c`.`start_time` as date) ;

-- --------------------------------------------------------

--
-- Structure for view `monthly_caller_stats`
--
DROP TABLE IF EXISTS `monthly_caller_stats`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `monthly_caller_stats`  AS SELECT `c`.`caller_id` AS `caller_id`, `u`.`name` AS `caller_name`, date_format(`c`.`start_time`,'%Y-%m') AS `call_month`, count(0) AS `total_calls`, count(case when `c`.`status` = 'completed' then 1 end) AS `completed_calls`, count(case when `c`.`status` = 'missed' or `c`.`status` = 'no-answer' then 1 end) AS `missed_calls`, sum(`c`.`duration`) / 3600 AS `total_hours`, round(count(case when `c`.`status` = 'completed' then 1 end) / count(0) * 100,2) AS `completion_rate`, count(case when `c`.`disposition` = 'interested' then 1 end) AS `interested_leads`, round(count(case when `c`.`disposition` = 'interested' then 1 end) / count(0) * 100,2) AS `conversion_rate`, avg(`c`.`duration`) / 60 AS `avg_call_duration_minutes` FROM (`calls` `c` join `users` `u` on(`c`.`caller_id` = `u`.`id`)) GROUP BY `c`.`caller_id`, date_format(`c`.`start_time`,'%Y-%m') ;

-- --------------------------------------------------------

--
-- Structure for view `user_stats_view`
--
DROP TABLE IF EXISTS `user_stats_view`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `user_stats_view`  AS SELECT `u`.`id` AS `id`, `u`.`name` AS `name`, `u`.`email` AS `email`, `u`.`role` AS `role`, (select count(0) from `leads` where `leads`.`assigned_to` = `u`.`id`) AS `total_leads`, (select count(0) from `campaign_users` where `campaign_users`.`user_id` = `u`.`id`) AS `campaigns_handled`, (select ifnull(sum(`user_work_logs`.`hours_worked`),0) from `user_work_logs` where `user_work_logs`.`user_id` = `u`.`id`) AS `total_working_hours` FROM `users` AS `u` ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `calls`
--
ALTER TABLE `calls`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_caller` (`caller_id`),
  ADD KEY `idx_lead` (`lead_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_created` (`created_at`),
  ADD KEY `idx_callback_datetime` (`callback_datetime`);

--
-- Indexes for table `campaigns`
--
ALTER TABLE `campaigns`
  ADD PRIMARY KEY (`id`),
  ADD KEY `admin_id` (`admin_id`);

--
-- Indexes for table `campaign_users`
--
ALTER TABLE `campaign_users`
  ADD PRIMARY KEY (`id`),
  ADD KEY `campaign_id` (`campaign_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `leads`
--
ALTER TABLE `leads`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_leads_admin` (`admin_id`),
  ADD KEY `fk_leads_assigned_to` (`assigned_to`),
  ADD KEY `fk_leads_campaign_id` (`campaign_id`),
  ADD KEY `idx_leads_assigned_to` (`assigned_to`),
  ADD KEY `idx_leads_campaign_id` (`campaign_id`),
  ADD KEY `idx_leads_status` (`status`),
  ADD KEY `idx_leads_created_at` (`created_at`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `manager_id` (`manager_id`);

--
-- Indexes for table `user_work_logs`
--
ALTER TABLE `user_work_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admins`
--
ALTER TABLE `admins`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `calls`
--
ALTER TABLE `calls`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `campaigns`
--
ALTER TABLE `campaigns`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `campaign_users`
--
ALTER TABLE `campaign_users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=49;

--
-- AUTO_INCREMENT for table `leads`
--
ALTER TABLE `leads`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT for table `user_work_logs`
--
ALTER TABLE `user_work_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `calls`
--
ALTER TABLE `calls`
  ADD CONSTRAINT `calls_ibfk_1` FOREIGN KEY (`caller_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `calls_ibfk_2` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `campaigns`
--
ALTER TABLE `campaigns`
  ADD CONSTRAINT `campaigns_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `campaign_users`
--
ALTER TABLE `campaign_users`
  ADD CONSTRAINT `campaign_users_ibfk_1` FOREIGN KEY (`campaign_id`) REFERENCES `campaigns` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `campaign_users_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `leads`
--
ALTER TABLE `leads`
  ADD CONSTRAINT `fk_leads_admin` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_leads_assigned_to` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_leads_campaign_id` FOREIGN KEY (`campaign_id`) REFERENCES `campaigns` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`manager_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `user_work_logs`
--
ALTER TABLE `user_work_logs`
  ADD CONSTRAINT `user_work_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
