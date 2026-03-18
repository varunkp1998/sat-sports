-- MySQL dump 10.13  Distrib 9.6.0, for macos14.8 (x86_64)
--
-- Host: localhost    Database: sat_sports
-- ------------------------------------------------------
-- Server version	9.6.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--


--
-- Table structure for table `applications`
--

DROP TABLE IF EXISTS `applications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `applications` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `age` int DEFAULT NULL,
  `parent_name` varchar(100) DEFAULT NULL,
  `parent_phone` varchar(20) DEFAULT NULL,
  `preferred_program` varchar(100) DEFAULT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `applications`
--

LOCK TABLES `applications` WRITE;
/*!40000 ALTER TABLE `applications` DISABLE KEYS */;
INSERT INTO `applications` VALUES (1,'varun','v@v.com','111',28,NULL,NULL,NULL,'approved','2026-02-12 17:04:36'),(2,'Tarun','t@t.com','1234',12,NULL,NULL,NULL,'approved','2026-02-12 17:21:37'),(3,'Sonali','s@s.com','66666666',10,NULL,NULL,NULL,'approved','2026-02-12 17:22:54');
/*!40000 ALTER TABLE `applications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attendance`
--

DROP TABLE IF EXISTS `attendance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `session_id` bigint unsigned NOT NULL,
  `player_id` bigint unsigned NOT NULL,
  `status` enum('Present','Absent') NOT NULL,
  `marked_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_att_session` (`session_id`),
  KEY `fk_att_player` (`player_id`),
  CONSTRAINT `fk_att_player` FOREIGN KEY (`player_id`) REFERENCES `players` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_att_session` FOREIGN KEY (`session_id`) REFERENCES `training_sessions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendance`
--

LOCK TABLES `attendance` WRITE;
/*!40000 ALTER TABLE `attendance` DISABLE KEYS */;
/*!40000 ALTER TABLE `attendance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coach_checkins`
--

DROP TABLE IF EXISTS `coach_checkins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coach_checkins` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `coach_id` bigint unsigned NOT NULL,
  `location_id` bigint unsigned NOT NULL,
  `checkin_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `checkin_date` date GENERATED ALWAYS AS (cast(`checkin_time` as date)) STORED,
  `checkout_time` timestamp NULL DEFAULT NULL,
  `work_minutes` int DEFAULT '0',
  `session_id` bigint unsigned NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_session_checkin` (`coach_id`,`session_id`),
  KEY `fk_checkin_location` (`location_id`),
  CONSTRAINT `fk_checkin_coach` FOREIGN KEY (`coach_id`) REFERENCES `coaches` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_checkin_location` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coach_checkins`
--

LOCK TABLES `coach_checkins` WRITE;
/*!40000 ALTER TABLE `coach_checkins` DISABLE KEYS */;
INSERT INTO `coach_checkins` (`id`, `coach_id`, `location_id`, `checkin_time`, `checkout_time`, `work_minutes`, `session_id`) VALUES (1,1,3,'2026-02-07 12:16:09','2026-02-07 12:16:34',0,0),(5,1,1,'2026-02-07 18:37:28','2026-02-07 18:52:20',14,1),(6,1,1,'2026-02-07 18:46:40','2026-02-07 18:52:20',5,2),(10,1,1,'2026-02-08 02:18:29','2026-02-08 02:19:19',0,3),(12,1,2,'2026-02-08 02:29:59','2026-02-08 02:30:24',0,4),(13,1,2,'2026-02-12 18:40:29','2026-02-13 11:15:00',994,6);
/*!40000 ALTER TABLE `coach_checkins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coach_leaves`
--

DROP TABLE IF EXISTS `coach_leaves`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coach_leaves` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `coach_id` bigint unsigned NOT NULL,
  `from_date` date NOT NULL,
  `to_date` date NOT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'Pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coach_leaves`
--

LOCK TABLES `coach_leaves` WRITE;
/*!40000 ALTER TABLE `coach_leaves` DISABLE KEYS */;
INSERT INTO `coach_leaves` VALUES (1,2,'2026-02-08','2026-02-12','aa','Approved','2026-02-07 19:11:12'),(2,2,'2026-02-08','2026-02-11','aa','Rejected','2026-02-07 19:52:35'),(3,3,'2026-02-08','2026-02-10','qwdcd','Pending','2026-02-08 02:21:51');
/*!40000 ALTER TABLE `coach_leaves` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coaches`
--

DROP TABLE IF EXISTS `coaches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coaches` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `program_id` bigint unsigned DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  KEY `fk_coach_program` (`program_id`),
  CONSTRAINT `fk_coach_program` FOREIGN KEY (`program_id`) REFERENCES `programs` (`id`),
  CONSTRAINT `fk_coach_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coaches`
--

LOCK TABLES `coaches` WRITE;
/*!40000 ALTER TABLE `coaches` DISABLE KEYS */;
INSERT INTO `coaches` VALUES (1,2,'Ramesh','2026-02-07 12:15:39',3,'ra@ra.com','988898');
/*!40000 ALTER TABLE `coaches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `court_bookings`
--

DROP TABLE IF EXISTS `court_bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `court_bookings` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `court_name` varchar(50) NOT NULL,
  `booking_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `court_bookings`
--

LOCK TABLES `court_bookings` WRITE;
/*!40000 ALTER TABLE `court_bookings` DISABLE KEYS */;
INSERT INTO `court_bookings` VALUES (2,'varun','mmm','Court 3','2026-02-12','06:00:00','06:30:00','2026-02-12 09:58:12'),(3,'Varun','898978787','Court 1','2026-02-12','17:37:00','20:40:00','2026-02-12 10:05:29');
/*!40000 ALTER TABLE `court_bookings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `courts`
--

DROP TABLE IF EXISTS `courts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `courts` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courts`
--

LOCK TABLES `courts` WRITE;
/*!40000 ALTER TABLE `courts` DISABLE KEYS */;
INSERT INTO `courts` VALUES (1,'Court 1',1,'2026-02-08 12:37:38'),(2,'Court 2',1,'2026-02-08 12:37:38'),(3,'Court 3',1,'2026-02-08 12:37:38'),(4,'Court 1',1,'2026-02-08 12:41:11'),(5,'Court 2',1,'2026-02-08 12:41:11'),(6,'Court 3',1,'2026-02-08 12:41:11');
/*!40000 ALTER TABLE `courts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `locations`
--

DROP TABLE IF EXISTS `locations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `locations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `address` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `qr_token` varchar(64) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `qr_token` (`qr_token`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `locations`
--

LOCK TABLES `locations` WRITE;
/*!40000 ALTER TABLE `locations` DISABLE KEYS */;
INSERT INTO `locations` VALUES (1,'SAT Sports Main Court',NULL,'2026-02-07 10:38:58','e29133bb-9f4f-45e6-bf95-1285a7a029ec'),(2,'SAT Sports Secondary Court',NULL,'2026-02-07 10:38:58','d3b1dd88-756d-413a-b75f-596fb484041d'),(3,'SAT Sports Indoor Arena',NULL,'2026-02-07 10:38:58','96d5f95a-4060-416b-bb68-da92938d69f4');
/*!40000 ALTER TABLE `locations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `news`
--

DROP TABLE IF EXISTS `news`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `news` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL,
  `content` text NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `news`
--

LOCK TABLES `news` WRITE;
/*!40000 ALTER TABLE `news` DISABLE KEYS */;
/*!40000 ALTER TABLE `news` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `player_applications`
--

DROP TABLE IF EXISTS `player_applications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `player_applications` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `age` int NOT NULL,
  `parent_name` varchar(100) DEFAULT NULL,
  `parent_phone` varchar(20) DEFAULT NULL,
  `preferred_program` varchar(100) DEFAULT NULL,
  `status` enum('PENDING','APPROVED','REJECTED') DEFAULT 'PENDING',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `player_applications`
--

LOCK TABLES `player_applications` WRITE;
/*!40000 ALTER TABLE `player_applications` DISABLE KEYS */;
/*!40000 ALTER TABLE `player_applications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `players`
--

DROP TABLE IF EXISTS `players`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `players` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `age` int DEFAULT NULL,
  `program_id` bigint unsigned DEFAULT NULL,
  `category` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `sub_category` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `players`
--

LOCK TABLES `players` WRITE;
/*!40000 ALTER TABLE `players` DISABLE KEYS */;
INSERT INTO `players` VALUES (1,NULL,'varun','v@v.com','111',28,NULL,'Adult','2026-02-12 17:04:58',NULL),(2,NULL,'Tarun','t@t.com','1234',12,NULL,'BA1','2026-02-12 17:21:47',NULL),(3,NULL,'Sonali','s@s.com','66666666',10,2,NULL,'2026-02-12 17:27:54',NULL);
/*!40000 ALTER TABLE `players` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `program_categories`
--

DROP TABLE IF EXISTS `program_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `program_categories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `program_id` bigint unsigned DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `program_categories`
--

LOCK TABLES `program_categories` WRITE;
/*!40000 ALTER TABLE `program_categories` DISABLE KEYS */;
/*!40000 ALTER TABLE `program_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `program_levels`
--

DROP TABLE IF EXISTS `program_levels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `program_levels` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `program_id` bigint unsigned DEFAULT NULL,
  `name` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `program_id` (`program_id`),
  CONSTRAINT `program_levels_ibfk_1` FOREIGN KEY (`program_id`) REFERENCES `programs` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `program_levels`
--

LOCK TABLES `program_levels` WRITE;
/*!40000 ALTER TABLE `program_levels` DISABLE KEYS */;
/*!40000 ALTER TABLE `program_levels` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `program_subcategories`
--

DROP TABLE IF EXISTS `program_subcategories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `program_subcategories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `program_id` bigint unsigned NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text,
  `min_age` int DEFAULT NULL,
  `max_age` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_subcat_program` (`program_id`),
  CONSTRAINT `fk_subcat_program` FOREIGN KEY (`program_id`) REFERENCES `programs` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `program_subcategories`
--

LOCK TABLES `program_subcategories` WRITE;
/*!40000 ALTER TABLE `program_subcategories` DISABLE KEYS */;
INSERT INTO `program_subcategories` VALUES (1,1,'Red Ball','Beginner level with red ball (starter stage)',5,6,'2026-02-12 14:34:29'),(2,1,'Orange Ball','Intermediate level with orange ball',6,8,'2026-02-12 14:34:29'),(3,1,'Green Ball','Advanced level with green dot ball',8,9,'2026-02-12 14:34:29'),(4,2,'BA1 Foundation','Technique and rally development',10,11,'2026-02-12 14:35:02'),(5,2,'BA1 Advanced','Match play and fitness focus',11,12,'2026-02-12 14:35:02'),(6,3,'BA2 Performance','Tournament preparation stage',12,15,'2026-02-12 14:35:02'),(7,5,'HP Elite','High intensity elite training',14,25,'2026-02-12 14:35:02');
/*!40000 ALTER TABLE `program_subcategories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `programs`
--

DROP TABLE IF EXISTS `programs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `programs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL,
  `min_age` int DEFAULT NULL,
  `max_age` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `description` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `programs`
--

LOCK TABLES `programs` WRITE;
/*!40000 ALTER TABLE `programs` DISABLE KEYS */;
INSERT INTO `programs` VALUES (1,'Little Aces',5,9,'2026-02-12 14:33:54','Foundation tennis program for kids with ball progression (Red, Orange, Green)'),(2,'BA1 (Budding Aces 1)',10,12,'2026-02-12 14:33:54','Intermediate development program focusing on technique and consistency'),(3,'BA2 (Budding Aces 2)',12,15,'2026-02-12 14:33:54','Advanced junior program preparing players for competitive tennis'),(4,'Junior Pros',13,17,'2026-02-12 14:33:54','High intensity training for tournament-level juniors'),(5,'High Performance',12,25,'2026-02-12 14:33:54','Elite performance program for national and international level players'),(6,'Adult Program (Touring Pros)',18,60,'2026-02-12 14:33:54','Fitness and competitive tennis program for adults'),(7,'Junior Accelerator',8,14,'2026-02-12 14:33:54','Special fast-track program for high-potential juniors');
/*!40000 ALTER TABLE `programs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `revenue`
--

DROP TABLE IF EXISTS `revenue`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `revenue` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `entry_date` date NOT NULL,
  `description` text,
  `amount` decimal(10,2) NOT NULL,
  `type` enum('CR','DR') NOT NULL,
  `location_id` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_revenue_location` (`location_id`),
  CONSTRAINT `fk_revenue_location` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `revenue`
--

LOCK TABLES `revenue` WRITE;
/*!40000 ALTER TABLE `revenue` DISABLE KEYS */;
/*!40000 ALTER TABLE `revenue` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `session_attendance`
--

DROP TABLE IF EXISTS `session_attendance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `session_attendance` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `session_id` bigint unsigned NOT NULL,
  `player_id` bigint unsigned NOT NULL,
  `present` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_attendance` (`session_id`,`player_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `session_attendance`
--

LOCK TABLES `session_attendance` WRITE;
/*!40000 ALTER TABLE `session_attendance` DISABLE KEYS */;
INSERT INTO `session_attendance` VALUES (1,6,3,0);
/*!40000 ALTER TABLE `session_attendance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `session_players`
--

DROP TABLE IF EXISTS `session_players`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `session_players` (
  `session_id` bigint unsigned NOT NULL,
  `player_id` bigint unsigned NOT NULL,
  PRIMARY KEY (`session_id`,`player_id`),
  KEY `fk_sp_player` (`player_id`),
  CONSTRAINT `fk_sp_player` FOREIGN KEY (`player_id`) REFERENCES `players` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_sp_session` FOREIGN KEY (`session_id`) REFERENCES `training_sessions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `session_players`
--

LOCK TABLES `session_players` WRITE;
/*!40000 ALTER TABLE `session_players` DISABLE KEYS */;
INSERT INTO `session_players` VALUES (6,3);
/*!40000 ALTER TABLE `session_players` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_applications`
--

DROP TABLE IF EXISTS `student_applications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_applications` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `age` int NOT NULL,
  `parent_name` varchar(100) DEFAULT NULL,
  `parent_phone` varchar(20) DEFAULT NULL,
  `suggested_program` varchar(100) DEFAULT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_applications`
--

LOCK TABLES `student_applications` WRITE;
/*!40000 ALTER TABLE `student_applications` DISABLE KEYS */;
/*!40000 ALTER TABLE `student_applications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `training_sessions`
--

DROP TABLE IF EXISTS `training_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `training_sessions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `session_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `location_id` bigint unsigned NOT NULL,
  `coach_id` bigint unsigned NOT NULL,
  `program_id` bigint unsigned DEFAULT NULL,
  `category` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_session_location` (`location_id`),
  KEY `fk_session_coach` (`coach_id`),
  KEY `fk_session_program` (`program_id`),
  CONSTRAINT `fk_session_coach` FOREIGN KEY (`coach_id`) REFERENCES `coaches` (`id`),
  CONSTRAINT `fk_session_location` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`),
  CONSTRAINT `fk_session_program` FOREIGN KEY (`program_id`) REFERENCES `programs` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `training_sessions`
--

LOCK TABLES `training_sessions` WRITE;
/*!40000 ALTER TABLE `training_sessions` DISABLE KEYS */;
INSERT INTO `training_sessions` VALUES (6,'2026-02-12','03:00:00','04:00:00',2,1,2,NULL,'2026-02-12 18:25:45');
/*!40000 ALTER TABLE `training_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(150) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` enum('admin','coach','player') NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','admin123','admin','2026-02-12 15:35:02'),(2,'coach1','coach123','coach','2026-02-12 15:35:02'),(3,'player1','player123','player','2026-02-12 15:35:02');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-11  0:03:12
