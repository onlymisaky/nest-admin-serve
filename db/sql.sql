create DATABASE IF NOT EXISTS nest_admin
    DEFAULT CHARACTER SET = 'utf8mb4'

CREATE TABLE IF NOT EXISTS nest_admin.users (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
    username VARCHAR(50) NOT NULL COMMENT '用户名',
    password VARCHAR(50) NOT NULL COMMENT '密码',
    nick_name VARCHAR(50) COMMENT '昵称',
    mobile VARCHAR(20) COMMENT '手机号',
    email VARCHAR(50) NOT NULL COMMENT '邮箱',
    avatar VARCHAR(255) COMMENT '头像',
    is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否激活，0：未激活，1：已激活',
    is_super_admin TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否超级管理员，0：否，1：是',
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
);

INSERT INTO nest_admin.users (username, password, email) VALUES ('admin', '123456', 'admin@example.com');
