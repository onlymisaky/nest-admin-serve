DROP DATABASE IF EXISTS nest_admin;

-- 建库
create DATABASE IF NOT EXISTS nest_admin DEFAULT CHARACTER SET = 'utf8mb4';

-- 删除表
DROP TABLE IF EXISTS `nest_admin`.`role_permission_relation`;

DROP TABLE IF EXISTS `nest_admin`.`user_role_relation`;

DROP TABLE IF EXISTS `nest_admin`.`permission`;

DROP TABLE IF EXISTS `nest_admin`.`role`;

DROP TABLE IF EXISTS `nest_admin`.`user`;

-- 创建表
CREATE TABLE `nest_admin`.`permission` (
    `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `name` varchar(50) NOT NULL COMMENT '权限名',
    `description` varchar(255) NULL COMMENT '权限描述',
    `is_active` tinyint NOT NULL COMMENT '是否激活' DEFAULT '1',
    `is_deleted` tinyint NOT NULL COMMENT '是否删除' DEFAULT '0',
    `create_time` datetime(6) NOT NULL COMMENT '创建时间' DEFAULT CURRENT_TIMESTAMP(6),
    `update_time` datetime(6) NOT NULL COMMENT '更新时间' DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (`id`)
) ENGINE = InnoDB;

CREATE TABLE `nest_admin`.`role` (
    `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `name` varchar(50) NOT NULL COMMENT '角色名',
    `description` varchar(255) NOT NULL COMMENT '角色描述',
    `is_active` tinyint NOT NULL COMMENT '是否激活' DEFAULT '1',
    `is_deleted` tinyint NOT NULL COMMENT '是否删除' DEFAULT '0',
    `create_time` datetime(6) NOT NULL COMMENT '创建时间' DEFAULT CURRENT_TIMESTAMP(6),
    `update_time` datetime(6) NOT NULL COMMENT '更新时间' DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (`id`)
) ENGINE = InnoDB;

CREATE TABLE `nest_admin`.`user` (
    `id` varchar(36) NOT NULL COMMENT 'ID',
    `username` varchar(50) NOT NULL COMMENT '用户名',
    `password` varchar(50) NOT NULL COMMENT '密码' DEFAULT 'e10adc3949ba59abbe56e057f20f883e',
    `nick_name` varchar(50) NULL COMMENT '昵称',
    `mobile` varchar(20) NULL COMMENT '手机号',
    `email` varchar(50) NOT NULL COMMENT '邮箱',
    `avatar` varchar(255) NULL COMMENT '头像',
    `is_active` tinyint NOT NULL COMMENT '是否激活' DEFAULT '1',
    `is_deleted` tinyint NOT NULL COMMENT '是否删除' DEFAULT '0',
    `create_time` datetime(6) NOT NULL COMMENT '创建时间' DEFAULT CURRENT_TIMESTAMP(6),
    `update_time` datetime(6) NOT NULL COMMENT '更新时间' DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (`id`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `nest_admin`.`role_permission_relation` (
    `role_id` int NOT NULL,
    `permission_id` int NOT NULL,
    INDEX `IDX_b360c18b5425a696792aa61ca4` (`role_id`),
    INDEX `IDX_b4eb35fc9e33b81cf151e47934` (`permission_id`),
    PRIMARY KEY (`role_id`, `permission_id`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `nest_admin`.`user_role_relation` (
    `user_id` varchar(36) NOT NULL,
    `role_id` int NOT NULL,
    INDEX `IDX_c2dd5102a26a0f0d34721c63c3` (`user_id`),
    INDEX `IDX_04086225838f2e0f2fa11f0048` (`role_id`),
    PRIMARY KEY (`user_id`, `role_id`)
) ENGINE = InnoDB;

ALTER TABLE `nest_admin`.`role_permission_relation`
ADD CONSTRAINT `FK_b360c18b5425a696792aa61ca4a` FOREIGN KEY (`role_id`) REFERENCES `nest_admin`.`role` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `nest_admin`.`role_permission_relation`
ADD CONSTRAINT `FK_b4eb35fc9e33b81cf151e479340` FOREIGN KEY (`permission_id`) REFERENCES `nest_admin`.`permission` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `nest_admin`.`user_role_relation`
ADD CONSTRAINT `FK_c2dd5102a26a0f0d34721c63c3c` FOREIGN KEY (`user_id`) REFERENCES `nest_admin`.`user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `nest_admin`.`user_role_relation`
ADD CONSTRAINT `FK_04086225838f2e0f2fa11f00484` FOREIGN KEY (`role_id`) REFERENCES `nest_admin`.`role` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO
    `nest_admin`.`permission` (`name`, `description`)
VALUES ('user:*', '用户模块'),
    ('user:create', '创建用户'),
    ('user:update', '更新用户'),
    ('user:delete', '删除用户'),
    ('role:*', '角色模块'),
    ('role:create', '创建角色'),
    ('role:update', '更新角色'),
    ('role:delete', '删除角色');

INSERT INTO
    `nest_admin`.`role` (`name`, `description`)
VALUES ('admin', '管理员'),
    ('user', '用户');

INSERT INTO
    `nest_admin`.`role_permission_relation` (`role_id`, `permission_id`)
VALUES (1, 1),
    (1, 2),
    (1, 3),
    (1, 4),
    (1, 5),
    (1, 6),
    (1, 7),
    (1, 8);

INSERT INTO
    `nest_admin`.`user` (
        `id`,
        `username`,
        `password`,
        `email`
    )
VALUES (
        '3c34525c-470c-4164-b720-3ed4b6720589',
        'admin',
        'e10adc3949ba59abbe56e057f20f883e',
        'admin@email.com'
    ),
    (
        '5b43aa54-fb62-442f-8566-03f0ff162689',
        'user',
        'e10adc3949ba59abbe56e057f20f883e',
        'user@email.com'
    );

INSERT INTO
    `nest_admin`.`user_role_relation` (`user_id`, `role_id`)
VALUES ('3c34525c-470c-4164-b720-3ed4b6720589', 1);
