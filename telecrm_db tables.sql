-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 05, 2025 at 01:37 PM
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
-- Table structure for table `activity_logs`
--

CREATE TABLE `activity_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `role` varchar(50) NOT NULL,
  `activity_type` varchar(50) NOT NULL,
  `activity_description` text NOT NULL,
  `reference_type` varchar(50) DEFAULT NULL,
  `reference_id` int(11) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `activity_logs`
--

INSERT INTO `activity_logs` (`id`, `user_id`, `role`, `activity_type`, `activity_description`, `reference_type`, `reference_id`, `location`, `created_at`) VALUES
(290, 11, 'field_employee', 'lead_update', 'Updated lead #64', 'lead', 64, NULL, '2025-06-03 15:53:02'),
(291, 11, 'field_employee', 'lead_update', 'Updated lead #72', 'lead', 72, NULL, '2025-06-03 15:53:15'),
(292, 11, 'field_employee', 'lead_update', 'Updated lead #67', 'lead', 67, NULL, '2025-06-03 15:53:41'),
(293, 42, 'caller', 'lead_update', 'Updated lead #60', 'lead', 60, NULL, '2025-06-03 15:55:05'),
(294, 42, 'caller', 'lead_update', 'Updated lead #66', 'lead', 66, NULL, '2025-06-04 10:31:32'),
(295, 13, 'manager', 'lead_create', 'Created new lead: Manu Khandelwal ', 'lead', 81, NULL, '2025-06-04 18:01:14'),
(296, 13, 'manager', 'lead_update', 'Updated lead #81', 'lead', 81, NULL, '2025-06-04 18:02:10'),
(297, 13, 'manager', 'campaign_user', 'Added 1 new users to campaign #27', 'campaign', 27, NULL, '2025-06-04 18:09:53'),
(298, 42, 'caller', 'lead_update', 'Updated lead #65', 'lead', 65, NULL, '2025-06-04 18:28:30'),
(299, 13, 'manager', 'lead_create', 'Created new lead: Sakshi', 'lead', 83, NULL, '2025-06-05 04:34:43'),
(300, 13, 'manager', 'lead_create', 'Created new lead: fvhsdf', 'lead', 84, NULL, '2025-06-05 04:35:31'),
(301, 12, 'admin', 'user_role_update', 'Updated user #44 role to caller', 'user', 44, NULL, '2025-06-05 04:45:27'),
(302, 12, 'admin', 'user_role_update', 'Updated user #44 role to manager', 'user', 44, NULL, '2025-06-05 04:45:35'),
(303, 12, 'admin', 'campaign_leads_add', 'Added 4 leads to campaign Monsoon Season ', 'campaign', 29, NULL, '2025-06-05 04:58:12'),
(304, 12, 'admin', 'campaign_create', 'Created new campaign: Monsoon Season  (Active)', 'campaign', 29, NULL, '2025-06-05 04:58:12'),
(305, 12, 'admin', 'campaign_update', 'Updated campaign: name: TANSHI KHANDELWAL → BV College Grads, description: helloooooooo mam → helloooooooo mam, status: Active → Active, priority: High → High, start_date: Mon May 05 2025 00:00:00 GMT+0530 (India Standard Time) → 2025-05-04, end_date: Sun Jun 01 2025 00:00:00 GMT+0530 (India Standard Time) → 2025-05-31', 'campaign', 8, NULL, '2025-06-05 04:59:20'),
(306, 12, 'admin', 'campaign_user', 'Assigned 3 users to campaign #8', 'campaign', 8, NULL, '2025-06-05 05:00:18'),
(307, 12, 'admin', 'campaign_delete', 'Deleted campaign #25', 'campaign', 25, NULL, '2025-06-05 05:00:56'),
(308, 12, 'admin', 'lead_update', 'Updated lead #84', 'lead', 84, NULL, '2025-06-05 05:01:59'),
(309, 12, 'admin', 'lead_update', 'Updated lead #82', 'lead', 82, NULL, '2025-06-05 05:02:21'),
(310, 12, 'admin', 'lead_update', 'Updated lead #84', 'lead', 84, NULL, '2025-06-05 05:06:03'),
(311, 12, 'admin', 'user_role_update', 'Updated user #44 role to caller', 'user', 44, NULL, '2025-06-05 05:11:55'),
(312, 12, 'admin', 'campaign_leads_add', 'Added 7 leads to campaign BV College Grads', 'campaign', 30, NULL, '2025-06-05 05:15:48'),
(313, 12, 'admin', 'campaign_create', 'Created new campaign: BV College Grads (Active)', 'campaign', 30, NULL, '2025-06-05 05:15:48'),
(314, 12, 'admin', 'campaign_update', 'Updated campaign: name: BV College Grads → BV College Grads, description: helloooooooo mam → Hello, status: Active → Active, priority: High → High, start_date: Sun May 04 2025 00:00:00 GMT+0530 (India Standard Time) → 2025-05-03, end_date: Sat May 31 2025 00:00:00 GMT+0530 (India Standard Time) → 2025-05-30', 'campaign', 8, NULL, '2025-06-05 05:16:27'),
(315, 12, 'admin', 'campaign_delete', 'Deleted campaign #8', 'campaign', 8, NULL, '2025-06-05 05:16:48'),
(316, 12, 'admin', 'campaign_user', 'Assigned 3 users to campaign #11', 'campaign', 11, NULL, '2025-06-05 05:17:01'),
(317, 12, 'admin', 'lead_create', 'Created new lead: Santosh', 'lead', 85, NULL, '2025-06-05 05:18:47'),
(318, 12, 'admin', 'lead_update', 'Updated lead #85', 'lead', 85, NULL, '2025-06-05 05:19:04'),
(319, 12, 'admin', 'lead_update', 'Updated lead #85', 'lead', 85, NULL, '2025-06-05 05:19:22'),
(320, 13, 'manager', 'lead_update', 'Updated lead #19', 'lead', 19, NULL, '2025-06-05 05:28:32'),
(321, 13, 'manager', 'lead_create', 'Created new lead: ram', 'lead', 86, NULL, '2025-06-05 05:29:18'),
(322, 13, 'manager', 'lead_update', 'Updated lead #86', 'lead', 86, NULL, '2025-06-05 05:29:29'),
(323, 13, 'manager', 'campaign_user', 'Assigned 1 users to campaign #23', 'campaign', 23, NULL, '2025-06-05 05:30:08'),
(324, 12, 'caller', 'lead_update', 'Updated lead #83', 'lead', 83, NULL, '2025-06-05 05:36:38'),
(325, 12, 'caller', 'call_made', 'Initiated call to 8077685501', 'call', 30, NULL, '2025-06-05 09:01:50'),
(326, 12, 'caller', 'call_made', 'Initiated call to 7452924345', 'call', 35, NULL, '2025-06-05 09:08:59'),
(327, 12, 'caller', 'call_made', 'Initiated call to 9045613126', 'call', 36, NULL, '2025-06-05 09:09:30'),
(328, 12, 'caller', 'call_made', 'Initiated call to 9521589263', 'call', 37, NULL, '2025-06-05 09:27:37'),
(329, 12, 'caller', 'call_made', 'Initiated call to 9521589263', 'call', 38, NULL, '2025-06-05 10:52:56'),
(330, 12, 'caller', 'call_made', 'Initiated call to 9521589263', 'call', 45, NULL, '2025-06-05 11:32:57');

-- --------------------------------------------------------

--
-- Stand-in structure for view `activity_stats_view`
-- (See below for the actual view)
--
CREATE TABLE `activity_stats_view` (
`activity_id` int(11)
,`user_id` int(11)
,`user_name` varchar(100)
,`user_role` enum('manager','caller','field_employee')
,`lead_name` varchar(255)
,`lead_status` enum('New','Contacted','Follow-Up Scheduled','Interested','Not Interested','Call Back Later','Under Review','Converted','Lost','Not Reachable','On Hold')
,`created_at` timestamp
);

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
(11, 'Vaishali', 'vaishali93@gmail.com', '8033568296', '$2b$10$Iv69zTALgMVqsQZ/6R6S0epKYNL5CyvzzC8u4nZx0VxANFpQAwj7m', 'admin', 'active', '2025-04-15 11:47:52', '2025-06-05 10:05:52', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0OTExNzk1MiwiZXhwIjoxNzQ5MjA0MzUyfQ.fSyVUU7I5UYUALiP_RBf7rlglWWh0Qn97ebxkW_g3PQ', '2025-06-05 15:35:52'),
(12, 'Aditi', 'aditi2@gmail.com', '1234567890', '$2b$10$OkER.11/5WF1tFS6iHUajuaqo9An7xtRk93XoKA681CXNU0SpToxG', 'admin', 'active', '2025-05-09 09:50:50', '2025-06-05 10:04:27', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0OTExNzg2NywiZXhwIjoxNzQ5MjA0MjY3fQ.iq_Y9wHEnwOHlHdvBGHwOKILrej809D9-e4shYQjtiE', '2025-06-05 15:34:27');

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
  `exotel_call_sid` varchar(255) DEFAULT NULL,
  `caller_id` int(11) NOT NULL,
  `lead_id` int(11) NOT NULL,
  `start_time` datetime NOT NULL,
  `end_time` datetime DEFAULT NULL,
  `duration` int(11) DEFAULT NULL,
  `status` enum('initiated','in-progress','completed','missed','no-answer','busy','failed') NOT NULL DEFAULT 'initiated',
  `call_type` enum('outbound','inbound','follow-up') NOT NULL,
  `disposition` enum('pending','in-progress','completed','failed','busy','no-answer') DEFAULT 'pending',
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

INSERT INTO `calls` (`id`, `exotel_call_sid`, `caller_id`, `lead_id`, `start_time`, `end_time`, `duration`, `status`, `call_type`, `disposition`, `notes`, `callback_datetime`, `recording_url`, `callback_scheduled`, `created_at`, `updated_at`) VALUES
(14, 'temp_1748081702986_14', 42, 12, '2025-05-24 15:45:02', NULL, NULL, 'initiated', 'outbound', 'in-progress', NULL, NULL, NULL, NULL, '2025-05-24 10:15:02', '2025-05-24 10:15:02'),
(15, 'temp_1748082082474_15', 42, 12, '2025-05-24 15:51:22', NULL, NULL, 'initiated', 'outbound', 'in-progress', NULL, NULL, NULL, NULL, '2025-05-24 10:21:21', '2025-05-24 10:21:22'),
(16, 'temp_1748082721218_16', 42, 12, '2025-05-24 16:02:01', NULL, NULL, 'initiated', 'outbound', 'in-progress', NULL, NULL, NULL, NULL, '2025-05-24 10:32:00', '2025-05-24 10:32:01'),
(18, 'temp_1748189093188_18', 42, 12, '2025-05-25 21:34:53', NULL, NULL, 'completed', 'outbound', 'in-progress', NULL, NULL, NULL, NULL, '2025-05-25 16:04:52', '2025-05-30 19:38:23'),
(19, 'temp_1748189188076_19', 42, 12, '2025-05-25 21:36:28', NULL, NULL, 'completed', 'outbound', 'in-progress', NULL, NULL, NULL, NULL, '2025-05-25 16:06:27', '2025-05-30 19:38:29'),
(20, 'temp_1748189714529_20', 42, 12, '2025-05-25 21:45:14', NULL, NULL, 'initiated', 'outbound', 'pending', NULL, NULL, NULL, NULL, '2025-05-25 16:15:14', '2025-05-30 19:39:37'),
(21, 'temp_1748189907826_21', 42, 12, '2025-05-25 21:48:27', NULL, NULL, 'completed', 'outbound', 'completed', NULL, NULL, NULL, NULL, '2025-05-25 16:18:27', '2025-05-30 19:39:32'),
(22, 'temp_1748190136204_22', 42, 12, '2025-05-25 21:52:16', NULL, NULL, 'missed', 'outbound', 'in-progress', NULL, NULL, NULL, NULL, '2025-05-25 16:22:15', '2025-05-30 19:38:46'),
(23, 'temp_1748190171470_23', 42, 12, '2025-05-25 21:52:51', NULL, NULL, 'initiated', 'outbound', 'in-progress', NULL, NULL, NULL, NULL, '2025-05-25 16:22:51', '2025-05-25 16:22:51'),
(24, 'temp_1748190261293_24', 42, 12, '2025-05-25 21:54:21', NULL, NULL, 'no-answer', 'outbound', 'in-progress', NULL, NULL, NULL, NULL, '2025-05-25 16:24:20', '2025-05-30 19:38:52'),
(26, 'temp_1748522787568_26', 42, 27, '2025-05-29 18:16:27', NULL, NULL, 'initiated', 'outbound', 'in-progress', NULL, NULL, NULL, NULL, '2025-05-29 12:46:26', '2025-05-29 12:46:27'),
(27, 'temp_1748522848474_27', 12, 27, '2025-05-29 18:17:28', NULL, NULL, 'busy', 'follow-up', 'in-progress', NULL, NULL, NULL, NULL, '2025-05-29 12:47:28', '2025-05-30 19:39:13'),
(28, 'temp_1748594234650_28', 11, 27, '2025-05-30 14:07:14', NULL, NULL, 'failed', 'outbound', 'completed', NULL, NULL, NULL, NULL, '2025-05-30 08:37:12', '2025-05-30 19:39:22'),
(29, 'temp_1748597099103_29', 11, 27, '2025-05-30 14:54:59', NULL, NULL, 'initiated', 'outbound', 'in-progress', NULL, NULL, NULL, NULL, '2025-05-30 09:24:58', '2025-05-30 09:24:59'),
(30, NULL, 12, 27, '2025-06-05 14:31:50', NULL, NULL, 'initiated', 'outbound', 'pending', NULL, NULL, NULL, NULL, '2025-06-05 09:01:50', '2025-06-05 09:01:50'),
(31, NULL, 12, 27, '2025-06-05 14:33:17', NULL, NULL, 'initiated', 'outbound', 'pending', NULL, NULL, NULL, NULL, '2025-06-05 09:03:17', '2025-06-05 09:03:17'),
(32, NULL, 12, 27, '2025-06-05 14:33:39', NULL, NULL, 'initiated', 'outbound', 'pending', NULL, NULL, NULL, NULL, '2025-06-05 09:03:39', '2025-06-05 09:03:39'),
(34, NULL, 12, 27, '2025-06-05 14:34:42', NULL, NULL, 'initiated', 'outbound', 'pending', NULL, NULL, NULL, NULL, '2025-06-05 09:04:42', '2025-06-05 09:04:42'),
(35, NULL, 12, 27, '2025-06-05 14:38:59', NULL, NULL, 'initiated', 'outbound', 'pending', NULL, NULL, NULL, NULL, '2025-06-05 09:08:59', '2025-06-05 09:08:59'),
(36, NULL, 12, 27, '2025-06-05 14:39:30', NULL, NULL, 'initiated', 'outbound', 'pending', NULL, NULL, NULL, NULL, '2025-06-05 09:09:30', '2025-06-05 09:09:30'),
(37, NULL, 12, 27, '2025-06-05 14:57:37', NULL, NULL, 'initiated', 'outbound', 'pending', NULL, NULL, NULL, NULL, '2025-06-05 09:27:37', '2025-06-05 09:27:37'),
(38, NULL, 12, 20, '2025-06-05 16:22:56', NULL, NULL, 'initiated', 'outbound', 'pending', NULL, NULL, NULL, NULL, '2025-06-05 10:52:56', '2025-06-05 10:52:56'),
(39, 'temp_1749122354478_175', 12, 20, '2025-06-05 16:49:14', NULL, NULL, 'initiated', 'outbound', 'pending', NULL, NULL, NULL, NULL, '2025-06-05 11:19:14', '2025-06-05 11:19:14'),
(40, 'temp_1749122495843_409', 12, 20, '2025-06-05 16:51:35', NULL, NULL, 'initiated', 'outbound', 'pending', NULL, NULL, NULL, NULL, '2025-06-05 11:21:35', '2025-06-05 11:21:35'),
(41, 'temp_1749122597470_675', 12, 20, '2025-06-05 16:53:17', NULL, NULL, 'initiated', 'outbound', 'pending', NULL, NULL, NULL, NULL, '2025-06-05 11:23:17', '2025-06-05 11:23:17'),
(42, 'temp_1749122776995_265', 12, 20, '2025-06-05 16:56:16', NULL, NULL, 'initiated', 'outbound', 'pending', NULL, NULL, NULL, NULL, '2025-06-05 11:26:16', '2025-06-05 11:26:16'),
(43, 'temp_1749122926380_867', 12, 20, '2025-06-05 16:58:46', NULL, NULL, 'initiated', 'outbound', 'pending', NULL, NULL, NULL, NULL, '2025-06-05 11:28:46', '2025-06-05 11:28:46'),
(44, 'temp_1749123009745_328', 12, 20, '2025-06-05 17:00:09', NULL, NULL, 'initiated', 'outbound', 'pending', NULL, NULL, NULL, NULL, '2025-06-05 11:30:09', '2025-06-05 11:30:09'),
(45, NULL, 12, 20, '2025-06-05 17:02:57', NULL, NULL, 'initiated', 'outbound', 'pending', NULL, NULL, NULL, NULL, '2025-06-05 11:32:57', '2025-06-05 11:32:57');

-- --------------------------------------------------------

--
-- Table structure for table `call_logs`
--

CREATE TABLE `call_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `start_time` datetime DEFAULT NULL,
  `end_time` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `admin_id` int(11) DEFAULT NULL,
  `manager_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `campaigns`
--

INSERT INTO `campaigns` (`id`, `name`, `description`, `status`, `lead_count`, `priority`, `start_date`, `end_date`, `created_at`, `updated_at`, `admin_id`, `manager_id`) VALUES
(11, 'Blast of Summer', 'High-intent leads from Instagram', 'Active', 1, 'High', '2025-04-13 15:00:00', NULL, '2025-05-12 09:48:54', '2025-05-30 16:06:00', 11, 13),
(12, 'Summer Blast', 'High-intent leads from Instagram', 'Active', 1, 'Medium', '2025-04-13 18:30:00', '2025-06-07 18:30:00', '2025-05-13 06:51:55', '2025-06-04 11:56:39', 11, 26),
(14, 'Ramesh Verma', 'helloooooooo mam', 'Active', 3, 'Medium', '2025-05-21 00:00:00', '2025-05-30 00:00:00', '2025-05-22 07:30:32', '2025-06-04 11:56:57', 12, 26),
(23, 'Fashion Sales', 'Brands', 'Active', 0, 'Medium', '2025-05-14 00:00:00', '2025-08-28 00:00:00', '2025-05-23 11:34:43', '2025-06-04 11:56:49', NULL, 13),
(26, 'ishita', 'love', 'Active', 3, 'High', '2025-05-28 00:00:00', '2025-06-08 00:00:00', '2025-05-28 10:20:55', '2025-05-28 10:20:55', 12, NULL),
(27, 'Local Area Campaign', 'Targeting local businesses in the area', 'Active', 0, 'Medium', '2025-06-02 00:00:00', '2025-07-31 00:00:00', '2025-06-02 11:38:32', '2025-06-02 11:38:32', NULL, 13),
(28, 'Summer Sales Campaign', '2025 Summer sales drive targeting retail customers', 'Active', 2, 'High', '2025-06-02 00:00:00', '2025-08-31 00:00:00', '2025-06-02 11:39:16', '2025-06-04 11:46:55', 12, 26),
(29, 'Monsoon Season ', 'FRESHERS', 'Active', 4, 'Medium', '2025-06-05 00:00:00', '2025-08-10 00:00:00', '2025-06-05 04:58:12', '2025-06-05 04:58:12', 12, NULL),
(30, 'BV College Grads', 'dkfh', 'Active', 7, 'Medium', '2025-06-05 00:00:00', '2025-07-06 00:00:00', '2025-06-05 05:15:48', '2025-06-05 05:15:48', 12, NULL);

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
(70, 12, 12),
(101, 27, 13),
(103, 28, 12),
(104, 28, 13),
(105, 27, 12),
(113, 12, 11),
(115, 11, 12),
(116, 11, 13),
(117, 11, 44),
(118, 23, 49);

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
-- Table structure for table `exotel_config`
--

CREATE TABLE `exotel_config` (
  `id` int(11) NOT NULL,
  `sid` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `phone_number` varchar(20) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `exotel_config`
--

INSERT INTO `exotel_config` (`id`, `sid`, `token`, `phone_number`, `created_at`, `updated_at`) VALUES
(1, 'telecrm3', '65754531b300990367bffca4ac38f7d538126a8aa2fad9f7', '07948518141', '2025-05-22 16:26:02', '2025-05-22 16:26:02'),
(2, 'bb1f082414055b36b757a0b246573be173008f3f80076a65', '951ae67183f9dd5e70b8d9917359f19b2d50faa18c0363e9', '07948518141', '2025-05-22 16:42:04', '2025-05-25 16:26:18'),
(3, '170d38f4863ecd477c70442280d8853b07f8821ec32c1d9e', '52962c409d84ea9d7e2d319b104b38c9ce2014b57d0e132f', '7452924345', '2025-06-05 08:31:12', '2025-06-05 10:47:29');

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
  `created_by` int(11) DEFAULT NULL,
  `admin_id` int(11) DEFAULT NULL,
  `manager_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `notes` text DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `leads`
--

INSERT INTO `leads` (`id`, `title`, `description`, `status`, `lead_category`, `name`, `phone_no`, `address`, `assigned_to`, `created_by`, `admin_id`, `manager_id`, `campaign_id`, `created_at`, `updated_at`, `notes`, `updated_by`) VALUES
(8, 'New Franchise Inquiry - South Zone', 'Interested in franchise partnership', 'Contacted', 'Bulk Lead', 'Ramesh Verma', '9876543210', 'Hyderabad', 44, NULL, 11, NULL, NULL, '2025-05-12 17:12:34', '2025-05-28 17:05:04', 'Requested brochure and franchise fee details', NULL),
(9, 'Software Deployment - School ERP', 'Looking for ERP solution for school', 'Converted', 'Cold Lead', 'Priya Chauhan', '9123456780', 'Jaipur', 12, NULL, 1, NULL, NULL, '2025-05-12 17:12:40', '2025-06-04 16:17:55', 'Call scheduled for 15th May, 3 PM', 12),
(12, 'HR Software Demo Request', 'Needs HRMS tool demo for small business', 'Converted', 'Warm Lead', 'Neha Sinha', '7830310799', 'Lucknow', 42, NULL, 11, NULL, 23, '2025-05-12 17:13:41', '2025-06-04 16:18:15', 'Was busy during first call, asked to call next Monday', NULL),
(19, 'Walk-in Lead - CRM ', 'Visited our booth', 'Follow-Up Scheduled', 'Campaign Lead', 'Ashu', '3627198374', NULL, 49, NULL, 12, NULL, 11, '2025-05-13 12:20:46', '2025-06-05 10:58:32', 'Customer requested follow up next week', 13),
(20, 'Lead 1', 'Interested in Product A', 'Not Interested', 'Fresh Lead', 'John Doe', '9521589263', 'Earth', 12, NULL, 11, NULL, 12, '2025-05-13 12:21:55', '2025-06-05 15:10:43', 'Wants a callback', 12),
(21, 'Product Launch - Phase 3', 'Finalizing design and testing', 'Contacted', 'Hot Lead', 'Aarti Sharma', '9998887776', 'Delhi', 12, NULL, 12, NULL, NULL, '2025-05-18 17:47:57', '2025-06-04 16:19:44', 'Follow up for further details', NULL),
(22, 'CRM ', 'Visited our booth', 'Contacted', 'Converted Lead', 'Ani Rajat', '9012345678', NULL, 12, NULL, 12, NULL, 23, '2025-05-18 23:19:07', '2025-06-04 16:19:56', 'done', NULL),
(23, 'Mansi Chaudhary ', 'Visited our booth', 'Under Review', 'Walk-in Lead', 'Aashi Chaudhary', '7817822675', 'Pune', 42, NULL, 12, NULL, NULL, '2025-05-19 17:25:06', '2025-05-19 17:25:06', 'Evaluating between us and another vendor', NULL),
(25, 'Riya Sharma', 'Attended product demo session', 'Interested', NULL, 'Riya Sharma', '9876543210', NULL, 1, NULL, 11, NULL, NULL, '2025-05-21 10:44:13', '2025-05-31 00:16:26', 'Interested but wants to consult with her team first', NULL),
(27, 'Siddharth Mehta', 'Visited stall during tech expo', 'Contacted', 'Walk-in Lead', 'Siddharth Mehta', '9123456780', 'Bangalore', NULL, NULL, 11, NULL, 11, '2025-05-21 10:45:09', '2025-05-31 00:17:33', 'Wants detailed proposal before proceeding', NULL),
(58, '', NULL, 'Follow-Up Scheduled', NULL, 'Anita Sharma', '7817822675', NULL, 11, 11, NULL, NULL, NULL, '2025-05-28 16:07:01', '2025-06-05 10:41:34', 'upcoming', NULL),
(59, '', NULL, 'Call Back Later', NULL, 'Asher Gupta', '6567573357', NULL, 11, 11, NULL, NULL, NULL, '2025-05-28 16:07:03', '2025-06-05 10:41:34', 'on Thursday ', NULL),
(60, 'Shreya Gupta', 'Leads of SG', 'Interested', NULL, 'Sanjali Lalwaniya', '+917817822675', NULL, NULL, NULL, NULL, 13, 23, '2025-05-29 11:53:33', '2025-06-03 21:25:05', 'cd', 42),
(61, 'SG\'s Lead', 'Lead by SG', 'New', 'Re-Targeted Lead', 'Ashish Goel', '+918445677381', 'fr', NULL, 13, NULL, 13, NULL, '2025-05-29 11:57:02', '2025-06-05 10:15:10', 'tyy', NULL),
(64, '', NULL, 'Under Review', NULL, 'Archana Yadav', '8077685501', NULL, NULL, 42, NULL, NULL, NULL, '2025-05-29 16:00:58', '2025-06-03 21:23:02', 'Test notes', 11),
(65, '', NULL, 'Interested', NULL, 'Archana Yadav', '8077685501', NULL, NULL, 42, NULL, NULL, NULL, '2025-05-29 17:17:03', '2025-06-04 23:58:30', 'Test notes', 42),
(66, '', NULL, 'Follow-Up Scheduled', NULL, 'sfhsdf', '4652638452', NULL, 42, 42, NULL, NULL, NULL, '2025-05-29 17:18:03', '2025-06-04 16:01:32', 'ss', 42),
(67, '', NULL, 'Call Back Later', NULL, 'Ashu', '3627198374', NULL, 11, 11, NULL, NULL, NULL, '2025-05-29 17:19:26', '2025-06-05 10:41:34', 'Customer requested follow up next week', 11),
(68, '', NULL, 'Interested', NULL, 'Eisha', '1234567890', NULL, 11, 11, NULL, NULL, NULL, '2025-05-29 17:27:34', '2025-06-05 10:41:34', 'Meeting scheduled for next Monday', 11),
(69, '', NULL, 'Call Back Later', NULL, 'om', '+917817822674', NULL, 11, 11, NULL, NULL, NULL, '2025-05-29 18:32:07', '2025-06-05 10:41:34', 'n', NULL),
(70, '', NULL, 'Follow-Up Scheduled', NULL, 'Shanti Priya', '+917973867524', NULL, 11, 11, NULL, NULL, NULL, '2025-05-29 18:34:12', '2025-06-05 10:41:34', 'coming', NULL),
(71, '', NULL, 'Follow-Up Scheduled', NULL, 'Ashu', '3627198374', NULL, 11, 11, NULL, NULL, NULL, '2025-05-29 18:36:33', '2025-06-05 10:41:34', 'Customer requested follow up next week', NULL),
(72, '', NULL, 'Converted', NULL, 'Om Kapoor', '+91328481251', NULL, 11, 11, NULL, NULL, NULL, '2025-05-29 18:40:38', '2025-06-05 10:41:34', 'home', 11),
(73, '', NULL, 'Interested', NULL, 'sbfmvdf', '+913654636593', NULL, 11, 11, NULL, NULL, 23, '2025-05-29 18:43:00', '2025-06-05 10:41:34', 'coming on Sat ', NULL),
(74, '', NULL, 'Call Back Later', NULL, ' djfbjf', '+91376852645354', NULL, 11, 11, NULL, NULL, NULL, '2025-05-29 18:44:52', '2025-06-05 10:41:34', 'calling tonight', NULL),
(75, '', NULL, 'On Hold', NULL, 'trh', '+915432256786', NULL, 11, 11, NULL, NULL, NULL, '2025-05-29 18:47:48', '2025-06-05 10:41:34', 'awaiting ', NULL),
(76, '', NULL, 'Converted', NULL, 'egfnkdsfjg', '+9135487436854', NULL, 11, 11, NULL, NULL, NULL, '2025-05-29 18:50:13', '2025-06-05 10:41:34', 'done sale', NULL),
(77, '', NULL, 'Converted', 'Lost Lead', 'Fredrick ', '+91394654365', NULL, 11, 11, NULL, NULL, NULL, '2025-05-29 18:55:56', '2025-06-05 10:41:34', 'Purchased ', NULL),
(78, 'Retail Customer', 'Interested in summer collection', 'New', 'Hot Lead', 'John Doe', '+919876543210', '123 Main St, City', 11, NULL, 12, NULL, 28, '2025-06-02 17:09:17', '2025-06-05 10:41:34', 'Prefers evening calls', NULL),
(79, 'Business Owner', 'Looking for bulk order', 'New', 'Warm Lead', 'Jane Smith', '+919876543211', '456 Park Ave, City', NULL, NULL, 12, NULL, 28, '2025-06-02 17:09:17', '2025-06-05 10:15:10', 'Available 9-5', NULL),
(80, '', NULL, 'New', 'Cold Lead', 'fdkbg', '+91352864664', 'fdggregre', 11, 11, NULL, NULL, NULL, '2025-06-03 21:24:19', '2025-06-05 10:41:34', 'rgfe', NULL),
(81, 'bhcb', 'dlfjh', 'New', '', 'Manu Khandelwal ', '+91337385683', 'dfskhgf', NULL, NULL, NULL, 13, 11, '2025-06-04 23:31:14', '2025-06-05 10:15:10', 'dvfvf', 13),
(82, '', NULL, 'New', 'Cold Lead', 'Anjali Mehta', '+9135486354324', 'bdjcbj', 42, 42, NULL, NULL, NULL, '2025-06-04 23:59:28', '2025-06-05 10:32:21', 'sdbbsd', 12),
(83, 'Sakshi Camp leads', 'Sakshi Camp ', 'Contacted', NULL, 'Sakshi', '+918037467289', NULL, 12, NULL, NULL, 13, NULL, '2025-06-05 10:04:43', '2025-06-05 11:06:38', 'dfbhsd', 12),
(84, 'gkef', 'bdsfkhf', 'New', 'Re-Targeted Lead', 'Deepak Pandey', '+9174853468534', 'Amroha', 11, NULL, NULL, 13, 27, '2025-06-05 10:05:31', '2025-06-05 10:41:34', '', 12),
(85, 'sonnn', 'fjd', 'New', 'Walk-in Lead', 'Santosh', '+9142237853443', 'efe', 11, NULL, 12, NULL, 30, '2025-06-05 10:48:47', '2025-06-05 10:49:22', 'saas', 12),
(86, 'fgdshf', 'fjdbsjfv', 'New', 'Warm Lead', 'ram', '+913462542352', 'bdsfv', 49, NULL, NULL, 13, 23, '2025-06-05 10:59:17', '2025-06-05 11:00:39', 'xkcbsh', 13);

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
-- Stand-in structure for view `leads_detailed_view`
-- (See below for the actual view)
--
CREATE TABLE `leads_detailed_view` (
`id` int(11)
,`lead_name` varchar(255)
,`phone_no` varchar(20)
,`status` enum('New','Contacted','Follow-Up Scheduled','Interested','Not Interested','Call Back Later','Under Review','Converted','Lost','Not Reachable','On Hold')
,`notes` text
,`created_at` datetime
,`created_by` int(11)
,`created_by_name` varchar(100)
,`created_by_role` enum('manager','caller','field_employee')
,`assigned_to` int(11)
,`assigned_to_name` varchar(100)
,`assigned_to_role` enum('manager','caller','field_employee')
,`updated_at` datetime
,`updated_by` int(11)
,`updated_by_name` varchar(100)
,`updated_by_role` enum('manager','caller','field_employee')
,`campaign_id` int(11)
,`campaign_name` varchar(255)
,`days_since_creation` int(7)
);

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
(1, 'Sonam Jha', 'sonam@gmail.com', '1234567890', '$2b$10$MVp/eu54INL1Vgi4WaXIM.Rup/nQ.GOk1eLk8fu4VOfyF.xLLkeXm', 'caller', 'suspended', '2025-04-14 17:45:07', '2025-06-05 05:14:23', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImNhbGxlciIsImlhdCI6MTc0NTA2MzYzOSwiZXhwIjoxNzQ1MTUwMDM5fQ.T2_9MwuRpvNeXsdz2vj-0uJ4j5q6QzmjHrLsg6cwxiQ', 26, 'Delhi', NULL, 1, 0, 50, 1000, 8.00, 160.00, NULL, NULL),
(11, 'Aarushi', 'aarushi@gmail.com', '9998887770', '$2b$10$Ur94E2a32M1BjRJC3VZvCOGjkNLICYcr2nQdfBrWBJ5hHgDliyXYm', 'field_employee', 'active', '2025-04-15 11:52:10', '2025-06-05 10:01:26', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsInJvbGUiOiJmaWVsZF9lbXBsb3llZSIsImlhdCI6MTc0OTA5ODM2NiwiZXhwIjoxNzQ5MTg0NzY2fQ.S-Y7AdpoEXMuk2QRM3ua9zV0eePQpqM8c6SZAzWD9t8', 13, 'Delhi', '2025-06-05 10:09:26', 17, 0, 50, 1000, 8.00, 160.00, NULL, NULL),
(12, 'Tanu', 'tanu@gmail.com', '9998885770', '$2b$10$.oIvi9pvdftfM2jIAssXWerkUjpI0ISFB/iTxs2CBmXtctGGtn16O', 'caller', 'active', '2025-04-20 10:54:34', '2025-06-05 10:12:35', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIsInJvbGUiOiJjYWxsZXIiLCJpYXQiOjE3NDkxMTgzNTUsImV4cCI6MTc0OTIwNDc1NX0.p-hxmEclpPfe0Rlqb7BUchuXbgQgf2xvNi7c0TIC4f4', 13, 'Delhi', '2025-06-05 15:42:35', 5, 0, 50, 1000, 8.00, 160.00, NULL, NULL),
(13, 'Shreya', 'shreya@gmail.com', '8998887770', '$2b$10$43bPOjw9Tscw4SMkDWk6Ku5LnlB0kUgWd9YqWLqaIWKxi9eqpPCgG', 'manager', 'active', '2025-04-20 18:12:38', '2025-06-05 09:08:21', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTMsInJvbGUiOiJtYW5hZ2VyIiwiaWF0IjoxNzQ5MTE0NTAxLCJleHAiOjE3NDkyMDA5MDF9.29ni098j1QO3hX81pWxk2GUduF7VIP7GXFts4x7bhqA', NULL, 'Delhi', '2025-06-05 14:38:21', 0, 0, 50, 1000, 8.00, 160.00, NULL, NULL),
(26, 'Tanshi Khandelwal', 'tanshi@gmail.com', '9876543210', '$2b$10$.3IsPfEfB7sbMek1gr2QT.PjN.DSbNd9Q3IcZ01caEnWatlPh2Ya6', 'manager', 'active', '2025-05-13 10:37:35', '2025-05-31 13:11:58', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjYsInJvbGUiOiJtYW5hZ2VyIiwiaWF0IjoxNzQ4Njk3MTE4LCJleHAiOjE3NDg3ODM1MTh9.NaHo6RUsqKKEYaW0-Cw7GAOjcjyOZXOzurRwBd48u90', 1, 'Indore', '2025-05-31 18:41:58', 0, 0, 50, 1000, 8.00, 160.00, NULL, NULL),
(42, 'Charu Khandelwal', 'charu@gmail.com', '9998889770', '$2b$10$PMGqYkLRo0zZ69Ivr6yM3OwDFsMYXLdIU7Er9oh60039hfnp2HQEG', 'caller', 'active', '2025-05-18 13:00:52', '2025-06-05 10:01:30', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NDIsInJvbGUiOiJjYWxsZXIiLCJpYXQiOjE3NDkxMDE4NzIsImV4cCI6MTc0OTE4ODI3Mn0.WZFLMqIICYrRC-xUekGlb_fZOJ4brW3jyAbkQWjSqEQ', 13, 'Indore', '2025-06-05 11:07:52', 4, 0, 50, 1000, 8.00, 160.00, NULL, NULL),
(44, 'Laksh Khandelwal', 'tanshikhandelwal03@gmail.com', '09458640957', '$2b$10$IFzXg6b/1S627W3ElJ6i8efNAd4wsQfGnxGiCANST42Yk9NkczBn.', 'caller', 'inactive', '2025-05-22 07:28:03', '2025-06-05 10:01:05', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NDQsInJvbGUiOiJjYWxsZXIiLCJpYXQiOjE3NDc4OTg4ODMsImV4cCI6MTc0Nzk4NTI4M30.h0QOfynr4tnZYUNoTI5FTNdJ9eelAV6xcE79RAStw6U', NULL, 'Bangalore,Karnataka', NULL, 1, 0, 50, 1000, 8.00, 160.00, NULL, NULL),
(49, 'Sakshi', 'tanshi20@gmail.com', '09871415204', '$2b$10$hJCiBWxot.EAVG1xUHcd5OedHeSj4VBbHhZLXD.2SEucNYLdAB/QO', 'field_employee', 'active', '2025-06-05 05:13:00', '2025-06-05 10:01:08', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NDksInJvbGUiOiJmaWVsZF9lbXBsb3llZSIsImlhdCI6MTc0OTEwMDM4MCwiZXhwIjoxNzQ5MTg2NzgwfQ.8Hq-uBLvONCntPUcxXp0UZ5HOqu8z-Eq96zeFWIlQMk', NULL, 'The Grand Anukampa, Ajmer Rd, Shyam Nagar, Jaipur, Rajasthan 302019', NULL, 2, 0, 50, 1000, 8.00, 160.00, NULL, NULL);

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
-- Structure for view `activity_stats_view`
--
DROP TABLE IF EXISTS `activity_stats_view`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `activity_stats_view`  AS SELECT `al`.`id` AS `activity_id`, `al`.`user_id` AS `user_id`, `u`.`name` AS `user_name`, `u`.`role` AS `user_role`, `l`.`name` AS `lead_name`, `l`.`status` AS `lead_status`, `al`.`created_at` AS `created_at` FROM ((`activity_logs` `al` left join `users` `u` on(`al`.`user_id` = `u`.`id`)) left join `leads` `l` on(`al`.`reference_type` = 'lead' and `al`.`reference_id` = `l`.`id`)) ORDER BY `al`.`created_at` DESC ;

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
-- Structure for view `leads_detailed_view`
--
DROP TABLE IF EXISTS `leads_detailed_view`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `leads_detailed_view`  AS SELECT `l`.`id` AS `id`, `l`.`name` AS `lead_name`, `l`.`phone_no` AS `phone_no`, `l`.`status` AS `status`, `l`.`notes` AS `notes`, `l`.`created_at` AS `created_at`, `l`.`created_by` AS `created_by`, `creator`.`name` AS `created_by_name`, `creator`.`role` AS `created_by_role`, `l`.`assigned_to` AS `assigned_to`, `assignee`.`name` AS `assigned_to_name`, `assignee`.`role` AS `assigned_to_role`, `l`.`updated_at` AS `updated_at`, `l`.`updated_by` AS `updated_by`, `updater`.`name` AS `updated_by_name`, `updater`.`role` AS `updated_by_role`, `c`.`id` AS `campaign_id`, `c`.`name` AS `campaign_name`, to_days(curdate()) - to_days(`l`.`created_at`) AS `days_since_creation` FROM ((((`leads` `l` left join `users` `creator` on(`l`.`created_by` = `creator`.`id`)) left join `users` `assignee` on(`l`.`assigned_to` = `assignee`.`id`)) left join `users` `updater` on(`l`.`updated_by` = `updater`.`id`)) left join `campaigns` `c` on(`l`.`campaign_id` = `c`.`id`)) ;

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

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `user_stats_view`  AS SELECT `u`.`id` AS `id`, `u`.`name` AS `name`, `u`.`email` AS `email`, `u`.`role` AS `role`, count(distinct `l`.`id`) AS `total_leads`, count(distinct `c`.`id`) AS `campaigns_handled` FROM ((((`users` `u` left join `leads` `l` on(`l`.`created_by` = `u`.`id` or `l`.`assigned_to` = `u`.`id`)) left join `campaign_users` `cu` on(`cu`.`user_id` = `u`.`id`)) left join `campaigns` `c` on(`c`.`id` = `cu`.`campaign_id`)) left join `user_work_logs` `w` on(`w`.`user_id` = `u`.`id`)) WHERE `u`.`status` = 'active' GROUP BY `u`.`id`, `u`.`name`, `u`.`email`, `u`.`role` ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_role` (`user_id`,`role`),
  ADD KEY `idx_created_at` (`created_at`);

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
  ADD KEY `idx_callback_datetime` (`callback_datetime`),
  ADD KEY `idx_exotel_call_sid` (`exotel_call_sid`);

--
-- Indexes for table `call_logs`
--
ALTER TABLE `call_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `campaigns`
--
ALTER TABLE `campaigns`
  ADD PRIMARY KEY (`id`),
  ADD KEY `admin_id` (`admin_id`),
  ADD KEY `fk_campaign_manager` (`manager_id`);

--
-- Indexes for table `campaign_users`
--
ALTER TABLE `campaign_users`
  ADD PRIMARY KEY (`id`),
  ADD KEY `campaign_id` (`campaign_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `exotel_config`
--
ALTER TABLE `exotel_config`
  ADD PRIMARY KEY (`id`);

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
  ADD KEY `idx_leads_created_at` (`created_at`),
  ADD KEY `manager_id` (`manager_id`),
  ADD KEY `fk_created_by` (`created_by`),
  ADD KEY `updated_by` (`updated_by`),
  ADD KEY `idx_leads_detailed` (`id`,`created_by`,`assigned_to`,`updated_by`,`campaign_id`);

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
-- AUTO_INCREMENT for table `activity_logs`
--
ALTER TABLE `activity_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=331;

--
-- AUTO_INCREMENT for table `admins`
--
ALTER TABLE `admins`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `calls`
--
ALTER TABLE `calls`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

--
-- AUTO_INCREMENT for table `call_logs`
--
ALTER TABLE `call_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `campaigns`
--
ALTER TABLE `campaigns`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `campaign_users`
--
ALTER TABLE `campaign_users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=119;

--
-- AUTO_INCREMENT for table `exotel_config`
--
ALTER TABLE `exotel_config`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `leads`
--
ALTER TABLE `leads`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=87;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=50;

--
-- AUTO_INCREMENT for table `user_work_logs`
--
ALTER TABLE `user_work_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD CONSTRAINT `activity_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `calls`
--
ALTER TABLE `calls`
  ADD CONSTRAINT `calls_ibfk_1` FOREIGN KEY (`caller_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `calls_ibfk_2` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `call_logs`
--
ALTER TABLE `call_logs`
  ADD CONSTRAINT `call_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `campaigns`
--
ALTER TABLE `campaigns`
  ADD CONSTRAINT `campaigns_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_campaign_manager` FOREIGN KEY (`manager_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

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
  ADD CONSTRAINT `fk_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_leads_admin` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_leads_assigned_to` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_leads_campaign_id` FOREIGN KEY (`campaign_id`) REFERENCES `campaigns` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `leads_ibfk_1` FOREIGN KEY (`manager_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `leads_ibfk_2` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`);

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

-- final push