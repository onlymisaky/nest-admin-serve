-- 删除数据库
DROP DATABASE IF EXISTS nest_admin;

-- 创建数据库
create DATABASE IF NOT EXISTS nest_admin DEFAULT CHARACTER SET = 'utf8mb4';

-- 使用数据库
USE nest_admin;

-- 删除权限表
DROP TABLE IF EXISTS `nest_admin`.`permission`;

-- 创建权限表
CREATE TABLE `nest_admin`.`permission` (
    `id` int NOT NULL AUTO_INCREMENT,
    `name` varchar(50) NOT NULL COMMENT '权限名',
    `description` varchar(255) NULL COMMENT '权限描述',
    `is_active` tinyint NOT NULL COMMENT '是否激活' DEFAULT '1',
    `is_deleted` tinyint NOT NULL COMMENT '是否软删除(0:否,1:是)' DEFAULT '0',
    `create_time` datetime(6) NOT NULL COMMENT '创建时间' DEFAULT CURRENT_TIMESTAMP(6),
    `update_time` datetime(6) NOT NULL COMMENT '更新时间' DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (`id`)
) ENGINE = InnoDB;

-- 删除角色表
DROP TABLE IF EXISTS `nest_admin`.`role`;

-- 创建角色表
CREATE TABLE `nest_admin`.`role` (
    `id` int NOT NULL AUTO_INCREMENT,
    `name` varchar(50) NOT NULL COMMENT '角色名',
    `description` varchar(255) NOT NULL COMMENT '角色描述',
    `is_active` tinyint NOT NULL COMMENT '是否激活' DEFAULT '1',
    `is_deleted` tinyint NOT NULL COMMENT '是否软删除(0:否,1:是)' DEFAULT '0',
    `create_time` datetime(6) NOT NULL COMMENT '创建时间' DEFAULT CURRENT_TIMESTAMP(6),
    `update_time` datetime(6) NOT NULL COMMENT '更新时间' DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (`id`)
) ENGINE = InnoDB;

-- 删除用户表
DROP TABLE IF EXISTS `nest_admin`.`user`;

-- 创建用户表
CREATE TABLE `nest_admin`.`user` (
    `id` varchar(36) NOT NULL,
    `username` varchar(50) NOT NULL COMMENT '用户名',
    `password` varchar(50) NOT NULL COMMENT '密码' DEFAULT 'e10adc3949ba59abbe56e057f20f883e',
    `nick_name` varchar(50) NULL COMMENT '昵称',
    `mobile` varchar(20) NULL COMMENT '手机号',
    `email` varchar(50) NOT NULL COMMENT '邮箱',
    `avatar` varchar(255) NULL COMMENT '头像',
    `is_active` tinyint NOT NULL COMMENT '是否激活' DEFAULT '1',
    `is_deleted` tinyint NOT NULL COMMENT '是否软删除(0:否,1:是)' DEFAULT '0',
    `create_time` datetime(6) NOT NULL COMMENT '创建时间' DEFAULT CURRENT_TIMESTAMP(6),
    `update_time` datetime(6) NOT NULL COMMENT '更新时间' DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (`id`)
) ENGINE = InnoDB;

-- 删除角色权限关系表
DROP TABLE IF EXISTS `nest_admin`.`role_permission`;

-- 创建角色权限关系表
CREATE TABLE IF NOT EXISTS `nest_admin`.`role_permission` (
    `role_id` int NOT NULL,
    `permission_id` int NOT NULL,
    INDEX `IDX_role_permission_role_id` (`role_id`),
    INDEX `IDX_role_permission_permission_id` (`permission_id`),
    PRIMARY KEY (`role_id`, `permission_id`)
) ENGINE = InnoDB;

-- 添加角色权限关系表的外键约束
ALTER TABLE `nest_admin`.`role_permission`
ADD CONSTRAINT `FK_role_permission_role_id` FOREIGN KEY (`role_id`) REFERENCES `nest_admin`.`role` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `nest_admin`.`role_permission`
ADD CONSTRAINT `FK_role_permission_permission_id` FOREIGN KEY (`permission_id`) REFERENCES `nest_admin`.`permission` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- 删除用户角色关系表
DROP TABLE IF EXISTS `nest_admin`.`user_role`;

-- 创建用户角色关系表
CREATE TABLE IF NOT EXISTS `nest_admin`.`user_role` (
    `user_id` varchar(36) NOT NULL,
    `role_id` int NOT NULL,
    INDEX `IDX_user_role_user_id` (`user_id`),
    INDEX `IDX_user_role_role_id` (`role_id`),
    PRIMARY KEY (`user_id`, `role_id`)
) ENGINE = InnoDB;

-- 添加用户角色关系表的外键约束
ALTER TABLE `nest_admin`.`user_role`
ADD CONSTRAINT `FK_user_role_user_id` FOREIGN KEY (`user_id`) REFERENCES `nest_admin`.`user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `nest_admin`.`user_role`
ADD CONSTRAINT `FK_user_role_role_id` FOREIGN KEY (`role_id`) REFERENCES `nest_admin`.`role` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- 创建权限数据
INSERT INTO
    `nest_admin`.`permission` (`name`, `description`)
VALUES ('*', '所有模块'),
    ('user:*', '用户模块'),
    ('user:view', '查看用户'),
    ('user:create', '创建用户'),
    ('user:update', '更新用户'),
    ('user:delete', '删除用户'),
    ('role:*', '角色模块'),
    ('role:view', '查看角色'),
    ('role:create', '创建角色'),
    ('role:update', '更新角色'),
    ('role:delete', '删除角色');

-- 创建 admin 和 user 角色
INSERT INTO
    `nest_admin`.`role` (`name`, `description`)
VALUES ('admin', '管理员'),
    ('user', '用户');

-- 创建用户名为admin和user的用户
INSERT INTO
    `nest_admin`.`user` (
        `id`,
        `username`,
        `password`,
        `nick_name`,
        `mobile`,
        `email`,
        `avatar`
    )
VALUES (
        UUID(),
        'admin',
        MD5('123456'),
        'admin',
        '13800138000',
        'admin@gmail.com',
        'https://avatars.githubusercontent.com/u/24823322'
    ),
    (
        UUID(),
        'user',
        MD5('123456'),
        'user',
        '13800138001',
        'user@email.com',
        'https://avatars.githubusercontent.com/u/5429968'
    );

-- 为admin角色添加所有权限
INSERT INTO
    `nest_admin`.`role_permission` (`role_id`, `permission_id`)
SELECT r.id, p.id
FROM `nest_admin`.`role` AS r
    JOIN `nest_admin`.`permission` AS p ON r.is_active = 1
    AND r.is_deleted = 0
    AND p.is_active = 1
    AND p.is_deleted = 0
    AND r.name = 'admin';

-- 为user角色添加user开头的权限
INSERT INTO
    `nest_admin`.`role_permission` (`role_id`, `permission_id`)
SELECT r.id, p.id
FROM
    `nest_admin`.`role` AS r
    JOIN `nest_admin`.`permission` AS p ON r.is_active = 1
    AND r.is_deleted = 0
    AND p.is_active = 1
    AND p.is_deleted = 0
    AND r.name = 'user'
    AND p.name LIKE 'user:%';

-- 为用户名为admin的用户添加admin角色
INSERT INTO
    `nest_admin`.`user_role` (`user_id`, `role_id`)
SELECT u.id, r.id
FROM `nest_admin`.`user` AS u
    JOIN `nest_admin`.`role` AS r ON u.is_active = 1
    AND u.is_deleted = 0
    AND r.is_active = 1
    AND r.is_deleted = 0
    AND u.username = 'admin'

-- 为用户名为user的用户添加user角色
INSERT INTO
    `nest_admin`.`user_role` (`user_id`, `role_id`)
SELECT u.id, r.id
FROM `nest_admin`.`user` AS u
    JOIN `nest_admin`.`role` AS r ON u.is_active = 1
    AND u.is_deleted = 0
    AND r.is_active = 1
    AND r.is_deleted = 0
WHERE
    u.username = 'user'
    AND r.name = 'user';