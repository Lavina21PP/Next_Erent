/*
 Navicat Premium Dump SQL

 Source Server         : Mamp DB - Mysql
 Source Server Type    : MySQL
 Source Server Version : 50724 (5.7.24)
 Source Host           : localhost:3306
 Source Schema         : database_erent

 Target Server Type    : MySQL
 Target Server Version : 50724 (5.7.24)
 File Encoding         : 65001

 Date: 18/08/2025 09:58:02
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for favorite
-- ----------------------------
DROP TABLE IF EXISTS `favorite`;
CREATE TABLE `favorite`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) NULL DEFAULT NULL,
  `property_id` int(11) NULL DEFAULT NULL,
  `created_at` datetime NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `tenant_id`(`tenant_id`) USING BTREE,
  INDEX `property_id`(`property_id`) USING BTREE,
  CONSTRAINT `favorite_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `favorite_ibfk_2` FOREIGN KEY (`property_id`) REFERENCES `property` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of favorite
-- ----------------------------

-- ----------------------------
-- Table structure for featured_listing
-- ----------------------------
DROP TABLE IF EXISTS `featured_listing`;
CREATE TABLE `featured_listing`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `property_id` int(11) NULL DEFAULT NULL,
  `display_order` int(11) NULL DEFAULT NULL,
  `created_at` datetime NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `property_id`(`property_id`) USING BTREE,
  CONSTRAINT `featured_listing_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `property` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of featured_listing
-- ----------------------------

-- ----------------------------
-- Table structure for login_attempts
-- ----------------------------
DROP TABLE IF EXISTS `login_attempts`;
CREATE TABLE `login_attempts`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `attempt_time` datetime NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of login_attempts
-- ----------------------------

-- ----------------------------
-- Table structure for login_log
-- ----------------------------
DROP TABLE IF EXISTS `login_log`;
CREATE TABLE `login_log`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NULL DEFAULT NULL,
  `ip_address` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `device_info` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL,
  `logged_in_at` datetime NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `user_id`(`user_id`) USING BTREE,
  CONSTRAINT `login_log_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of login_log
-- ----------------------------

-- ----------------------------
-- Table structure for message
-- ----------------------------
DROP TABLE IF EXISTS `message`;
CREATE TABLE `message`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sender_id` int(11) NULL DEFAULT NULL,
  `receiver_id` int(11) NULL DEFAULT NULL,
  `property_id` int(11) NULL DEFAULT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL,
  `sent_at` datetime NULL DEFAULT NULL,
  `status` enum('READ','SEND') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `sender_id`(`sender_id`) USING BTREE,
  INDEX `receiver_id`(`receiver_id`) USING BTREE,
  INDEX `property_id`(`property_id`) USING BTREE,
  CONSTRAINT `message_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `message_ibfk_2` FOREIGN KEY (`receiver_id`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `message_ibfk_3` FOREIGN KEY (`property_id`) REFERENCES `property` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of message
-- ----------------------------

-- ----------------------------
-- Table structure for otp_verifications
-- ----------------------------
DROP TABLE IF EXISTS `otp_verifications`;
CREATE TABLE `otp_verifications`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `contact` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `otp_code` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` datetime NOT NULL,
  `is_verified` tinyint(1) NULL DEFAULT 0,
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_contact`(`contact`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 40 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of otp_verifications
-- ----------------------------
INSERT INTO `otp_verifications` VALUES (33, 'vinakasi1214@gmail.com', '126030', '2025-08-17 15:02:36', 1, '2025-08-17 14:57:36', '2025-08-17 21:57:48');
INSERT INTO `otp_verifications` VALUES (34, 'vinakasi1214@gmail.com', '066946', '2025-08-17 15:07:55', 1, '2025-08-17 15:02:55', '2025-08-17 22:03:11');
INSERT INTO `otp_verifications` VALUES (35, 'vinakasi1214@gmail.com', '632809', '2025-08-18 01:21:35', 1, '2025-08-18 01:16:35', '2025-08-18 08:16:54');
INSERT INTO `otp_verifications` VALUES (36, 'vinakasi777@gmail.com', '836733', '2025-08-18 01:37:38', 1, '2025-08-18 01:32:38', '2025-08-18 08:33:06');
INSERT INTO `otp_verifications` VALUES (37, 'vinakasi555@gmail.com', '038913', '2025-08-18 02:10:02', 1, '2025-08-18 02:05:02', '2025-08-18 09:05:16');
INSERT INTO `otp_verifications` VALUES (38, 'vinakasi1214@gmail.com', '841761', '2025-08-18 02:13:09', 1, '2025-08-18 02:08:09', '2025-08-18 09:08:20');
INSERT INTO `otp_verifications` VALUES (39, 'vinakasi1214@gmail.com', '989669', '2025-08-18 02:31:43', 0, '2025-08-18 02:26:43', '2025-08-18 02:26:43');

-- ----------------------------
-- Table structure for promotion
-- ----------------------------
DROP TABLE IF EXISTS `promotion`;
CREATE TABLE `promotion`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL,
  `image_url` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL,
  `start_date` date NULL DEFAULT NULL,
  `end_date` date NULL DEFAULT NULL,
  `target_role` enum('LANDLORD','TENANT') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `created_at` datetime NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of promotion
-- ----------------------------

-- ----------------------------
-- Table structure for property
-- ----------------------------
DROP TABLE IF EXISTS `property`;
CREATE TABLE `property`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `landlord_id` int(11) NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL,
  `address` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL,
  `price` decimal(10, 2) NULL DEFAULT NULL,
  `status` enum('AVAILABLE','RENTED','INACTIVE') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'AVAILABLE',
  `subscription_id` int(11) NULL DEFAULT NULL,
  `property_type_id` int(11) NOT NULL,
  `created_at` datetime NULL DEFAULT NULL,
  `updated_at` datetime NULL DEFAULT NULL,
  `latitude` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `longitude` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `logo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `landlord_id`(`landlord_id`) USING BTREE,
  INDEX `subscription_id`(`subscription_id`) USING BTREE,
  INDEX `property_type_id`(`property_type_id`) USING BTREE,
  CONSTRAINT `property_ibfk_1` FOREIGN KEY (`landlord_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `property_ibfk_2` FOREIGN KEY (`subscription_id`) REFERENCES `subscription` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `property_ibfk_3` FOREIGN KEY (`property_type_id`) REFERENCES `property_type` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of property
-- ----------------------------

-- ----------------------------
-- Table structure for property_attribute
-- ----------------------------
DROP TABLE IF EXISTS `property_attribute`;
CREATE TABLE `property_attribute`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `property_id` int(11) NULL DEFAULT NULL,
  `attribute_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `attribute_value` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `property_id`(`property_id`) USING BTREE,
  CONSTRAINT `property_attribute_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `property` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of property_attribute
-- ----------------------------

-- ----------------------------
-- Table structure for property_image
-- ----------------------------
DROP TABLE IF EXISTS `property_image`;
CREATE TABLE `property_image`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `property_id` int(11) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `property_image_ibfk_1`(`property_id`) USING BTREE,
  CONSTRAINT `property_image_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `property` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of property_image
-- ----------------------------

-- ----------------------------
-- Table structure for property_type
-- ----------------------------
DROP TABLE IF EXISTS `property_type`;
CREATE TABLE `property_type`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of property_type
-- ----------------------------
INSERT INTO `property_type` VALUES (1, 'HOME-STAY');
INSERT INTO `property_type` VALUES (2, 'APARTMENT');
INSERT INTO `property_type` VALUES (3, 'HOME-STAY1');

-- ----------------------------
-- Table structure for rating
-- ----------------------------
DROP TABLE IF EXISTS `rating`;
CREATE TABLE `rating`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) NULL DEFAULT NULL,
  `property_id` int(11) NULL DEFAULT NULL,
  `score` int(11) NULL DEFAULT NULL,
  `comment` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL,
  `created_at` datetime NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `tenant_id`(`tenant_id`) USING BTREE,
  INDEX `property_id`(`property_id`) USING BTREE,
  CONSTRAINT `rating_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `rating_ibfk_2` FOREIGN KEY (`property_id`) REFERENCES `property` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of rating
-- ----------------------------

-- ----------------------------
-- Table structure for rent
-- ----------------------------
DROP TABLE IF EXISTS `rent`;
CREATE TABLE `rent`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) NOT NULL,
  `property_id` int(11) NOT NULL,
  `price` decimal(10, 2) NOT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `total_days` int(11) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `rent_ibfk_1`(`tenant_id`) USING BTREE,
  INDEX `property_id`(`property_id`) USING BTREE,
  CONSTRAINT `rent_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `rent_ibfk_2` FOREIGN KEY (`property_id`) REFERENCES `property` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of rent
-- ----------------------------

-- ----------------------------
-- Table structure for setting
-- ----------------------------
DROP TABLE IF EXISTS `setting`;
CREATE TABLE `setting`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `key_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `key_name`(`key_name`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of setting
-- ----------------------------

-- ----------------------------
-- Table structure for subscription
-- ----------------------------
DROP TABLE IF EXISTS `subscription`;
CREATE TABLE `subscription`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `fee` decimal(10, 2) NULL DEFAULT NULL,
  `duration_days` int(11) NULL DEFAULT NULL,
  `features` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL,
  `created_at` datetime NULL DEFAULT NULL,
  `updated_at` datetime NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of subscription
-- ----------------------------
INSERT INTO `subscription` VALUES (1, 'F1', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `subscription` VALUES (2, 'F2', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `subscription` VALUES (3, 'F3', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `subscription` VALUES (4, 'F4', NULL, NULL, NULL, NULL, NULL);

-- ----------------------------
-- Table structure for tour_schedule
-- ----------------------------
DROP TABLE IF EXISTS `tour_schedule`;
CREATE TABLE `tour_schedule`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `created_at` datetime NOT NULL,
  `created_by` int(11) NOT NULL,
  `status` enum('CONFIRMED','PENDING','DECLINED') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'PENDING',
  `status_reason` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `property_id` int(11) NULL DEFAULT NULL,
  `confirmed_by` int(11) NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `tour_schedule_ibfk_1`(`created_by`) USING BTREE,
  INDEX `tour_schedule_ibfk_2`(`property_id`) USING BTREE,
  INDEX `tour_schedule_ibfk_3`(`confirmed_by`) USING BTREE,
  CONSTRAINT `tour_schedule_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `tour_schedule_ibfk_2` FOREIGN KEY (`property_id`) REFERENCES `property` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `tour_schedule_ibfk_3` FOREIGN KEY (`confirmed_by`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of tour_schedule
-- ----------------------------

-- ----------------------------
-- Table structure for tour_schedule_detail
-- ----------------------------
DROP TABLE IF EXISTS `tour_schedule_detail`;
CREATE TABLE `tour_schedule_detail`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `date_face2face` date NOT NULL,
  `time_face2face` time NOT NULL,
  `address_face2face` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `request_by` int(11) NULL DEFAULT NULL,
  `response_by` int(11) NULL DEFAULT NULL,
  `status` enum('POSTPONE','OK') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `tour_schedule_id` int(11) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `tour_schedule_detail_ibfk_1`(`tour_schedule_id`) USING BTREE,
  CONSTRAINT `tour_schedule_detail_ibfk_1` FOREIGN KEY (`tour_schedule_id`) REFERENCES `tour_schedule` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of tour_schedule_detail
-- ----------------------------

-- ----------------------------
-- Table structure for user
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `first_name` varchar(50) CHARACTER SET utf8 COLLATE utf8_unicode_ci NULL DEFAULT NULL,
  `last_name` varchar(50) CHARACTER SET utf8 COLLATE utf8_unicode_ci NULL DEFAULT NULL,
  `email_phone` varchar(50) CHARACTER SET utf8 COLLATE utf8_unicode_ci NULL DEFAULT NULL,
  `password_hash` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `auth_key` varchar(32) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `password_reset_token` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NULL DEFAULT NULL,
  `status` smallint(6) NOT NULL DEFAULT 10,
  `created_at` int(11) NOT NULL,
  `updated_at` int(11) NOT NULL,
  `otp_code` int(11) NULL DEFAULT NULL,
  `role` enum('ADMIN','LANDLORD','TENANT') CHARACTER SET utf8 COLLATE utf8_unicode_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `password_reset_token`(`password_reset_token`) USING BTREE,
  UNIQUE INDEX `unique_email`(`email_phone`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 14 CHARACTER SET = utf8 COLLATE = utf8_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of user
-- ----------------------------
INSERT INTO `user` VALUES (13, 'Lavina', 'Xaiyavong', 'vinakasi1214@gmail.com', '$2b$10$QX0u5R.GL9uu.njmRk9PSuBO3vEZ.GT4E85R/mwmMYrBVU6uiSFd6', '', NULL, 10, 7878, 6556, NULL, 'LANDLORD');

SET FOREIGN_KEY_CHECKS = 1;
