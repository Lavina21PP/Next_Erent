-- AlterTable
ALTER TABLE `message` ADD COLUMN `conversation_id` INTEGER NULL;

-- CreateTable
CREATE TABLE `conversation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tenant_id` INTEGER NOT NULL,
    `landlord_id` INTEGER NOT NULL,
    `property_id` INTEGER NOT NULL,

    UNIQUE INDEX `conversation_tenant_id_landlord_id_property_id_key`(`tenant_id`, `landlord_id`, `property_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `conversation_id` ON `message`(`conversation_id`);

-- AddForeignKey
ALTER TABLE `message` ADD CONSTRAINT `message_conversation_id_fkey` FOREIGN KEY (`conversation_id`) REFERENCES `conversation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `conversation` ADD CONSTRAINT `conversation_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `conversation` ADD CONSTRAINT `conversation_landlord_id_fkey` FOREIGN KEY (`landlord_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `conversation` ADD CONSTRAINT `conversation_property_id_fkey` FOREIGN KEY (`property_id`) REFERENCES `property`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
