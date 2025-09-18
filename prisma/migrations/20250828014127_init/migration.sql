-- CreateTable
CREATE TABLE `favorite` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tenant_id` INTEGER NULL,
    `property_id` INTEGER NULL,
    `created_at` DATETIME(0) NULL,

    INDEX `property_id`(`property_id`),
    INDEX `tenant_id`(`tenant_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `featured_listing` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `property_id` INTEGER NULL,
    `subscription_id` INTEGER NULL,
    `duration_days` INTEGER NULL,
    `display_order` INTEGER NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `featured_listing_ibfk_2`(`subscription_id`),
    INDEX `property_id`(`property_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `login_attempts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ip_address` VARCHAR(45) NOT NULL,
    `attempt_time` DATETIME(0) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `login_log` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NULL,
    `ip_address` VARCHAR(100) NULL,
    `device_info` TEXT NULL,
    `logged_in_at` DATETIME(0) NULL,

    INDEX `user_id`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `message` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sender_id` INTEGER NULL,
    `receiver_id` INTEGER NULL,
    `property_id` INTEGER NULL,
    `content` TEXT NULL,
    `sent_at` DATETIME(0) NULL,
    `status` ENUM('READ', 'SEND') NULL,

    INDEX `property_id`(`property_id`),
    INDEX `receiver_id`(`receiver_id`),
    INDEX `sender_id`(`sender_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `otp_verifications` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `contact` VARCHAR(255) NOT NULL,
    `otp_code` VARCHAR(10) NOT NULL,
    `expires_at` DATETIME(0) NOT NULL,
    `is_verified` BOOLEAN NULL DEFAULT false,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_contact`(`contact`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `promotion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NULL,
    `description` TEXT NULL,
    `image_url` TEXT NULL,
    `start_date` DATE NULL,
    `end_date` DATE NULL,
    `target_role` ENUM('LANDLORD', 'TENANT') NULL,
    `created_at` DATETIME(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `property` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `landlord_id` INTEGER NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `address` TEXT NULL,
    `price` DECIMAL(10, 2) NULL,
    `status` ENUM('AVAILABLE', 'RENTED', 'INACTIVE') NOT NULL DEFAULT 'AVAILABLE',
    `property_type_id` INTEGER NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `latitude` VARCHAR(50) NULL,
    `longitude` VARCHAR(50) NULL,
    `coverImage` VARCHAR(255) NULL,

    INDEX `landlord_id`(`landlord_id`),
    INDEX `property_type_id`(`property_type_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `property_attribute` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `property_id` INTEGER NULL,
    `attribute_name` VARCHAR(100) NULL,
    `attribute_value` VARCHAR(255) NULL,

    INDEX `property_id`(`property_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `property_image` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `image` VARCHAR(255) NULL,
    `alt` VARCHAR(200) NULL,
    `property_id` INTEGER NOT NULL,

    INDEX `property_image_ibfk_1`(`property_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `property_type` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rating` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tenant_id` INTEGER NULL,
    `property_id` INTEGER NULL,
    `score` INTEGER NULL,
    `comment` TEXT NULL,
    `created_at` DATETIME(0) NULL,

    INDEX `property_id`(`property_id`),
    INDEX `tenant_id`(`tenant_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rent` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tenant_id` INTEGER NOT NULL,
    `property_id` INTEGER NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `start_date` DATETIME(0) NOT NULL,
    `end_date` DATETIME(0) NOT NULL,
    `total_days` INTEGER NOT NULL,

    INDEX `property_id`(`property_id`),
    INDEX `rent_ibfk_1`(`tenant_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `setting` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `key_name` VARCHAR(100) NULL,
    `value` TEXT NULL,

    UNIQUE INDEX `key_name`(`key_name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subscription` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NULL,
    `fee` DECIMAL(10, 2) NULL,
    `duration_days` INTEGER NULL,
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tour_schedule` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `created_at` DATETIME(0) NOT NULL,
    `created_by` INTEGER NOT NULL,
    `status` ENUM('CONFIRMED', 'PENDING', 'DECLINED') NOT NULL DEFAULT 'PENDING',
    `status_reason` VARCHAR(255) NULL,
    `property_id` INTEGER NULL,
    `confirmed_by` INTEGER NULL,

    INDEX `tour_schedule_ibfk_1`(`created_by`),
    INDEX `tour_schedule_ibfk_2`(`property_id`),
    INDEX `tour_schedule_ibfk_3`(`confirmed_by`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tour_schedule_detail` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date_face2face` DATE NOT NULL,
    `time_face2face` TIME(0) NOT NULL,
    `address_face2face` VARCHAR(255) NOT NULL,
    `request_by` INTEGER NULL,
    `response_by` INTEGER NULL,
    `status` ENUM('POSTPONE', 'OK') NULL,
    `tour_schedule_id` INTEGER NOT NULL,

    INDEX `tour_schedule_detail_ibfk_1`(`tour_schedule_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `first_name` VARCHAR(50) NULL,
    `last_name` VARCHAR(50) NULL,
    `email_phone` VARCHAR(50) NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `auth_key` VARCHAR(32) NOT NULL,
    `password_reset_token` VARCHAR(255) NULL,
    `status` SMALLINT NOT NULL DEFAULT 10,
    `created_at` INTEGER NOT NULL,
    `updated_at` INTEGER NOT NULL,
    `otp_code` INTEGER NULL,
    `role` ENUM('ADMIN', 'LANDLORD', 'TENANT') NULL,

    UNIQUE INDEX `unique_email`(`email_phone`),
    UNIQUE INDEX `password_reset_token`(`password_reset_token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `favorite` ADD CONSTRAINT `favorite_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `favorite` ADD CONSTRAINT `favorite_ibfk_2` FOREIGN KEY (`property_id`) REFERENCES `property`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `featured_listing` ADD CONSTRAINT `featured_listing_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `property`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `featured_listing` ADD CONSTRAINT `featured_listing_ibfk_2` FOREIGN KEY (`subscription_id`) REFERENCES `subscription`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `login_log` ADD CONSTRAINT `login_log_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `message` ADD CONSTRAINT `message_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `message` ADD CONSTRAINT `message_ibfk_2` FOREIGN KEY (`receiver_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `message` ADD CONSTRAINT `message_ibfk_3` FOREIGN KEY (`property_id`) REFERENCES `property`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `property` ADD CONSTRAINT `property_ibfk_1` FOREIGN KEY (`landlord_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `property` ADD CONSTRAINT `property_ibfk_3` FOREIGN KEY (`property_type_id`) REFERENCES `property_type`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `property_attribute` ADD CONSTRAINT `property_attribute_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `property`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `property_image` ADD CONSTRAINT `property_image_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `property`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rating` ADD CONSTRAINT `rating_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `rating` ADD CONSTRAINT `rating_ibfk_2` FOREIGN KEY (`property_id`) REFERENCES `property`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `rent` ADD CONSTRAINT `rent_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rent` ADD CONSTRAINT `rent_ibfk_2` FOREIGN KEY (`property_id`) REFERENCES `property`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tour_schedule` ADD CONSTRAINT `tour_schedule_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tour_schedule` ADD CONSTRAINT `tour_schedule_ibfk_2` FOREIGN KEY (`property_id`) REFERENCES `property`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tour_schedule` ADD CONSTRAINT `tour_schedule_ibfk_3` FOREIGN KEY (`confirmed_by`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tour_schedule_detail` ADD CONSTRAINT `tour_schedule_detail_ibfk_1` FOREIGN KEY (`tour_schedule_id`) REFERENCES `tour_schedule`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
