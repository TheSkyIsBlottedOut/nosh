CREATE TABLE graybin.users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    uuid VARCHAR(64) NOT NULL,
    slug VARCHAR(64) NOT NULL,
    username VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) DEFAULT NULL,
    email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    last_login_at TIMESTAMP DEFAULT NULL
);
CREATE INDEX users_username ON graybin.users (username);
CREATE INDEX users_password_auth ON graybin.users (username, password_hash);
CREATE INDEX users_email ON graybin.users (email);
CREATE INDEX users_slug ON graybin.users (slug);
CREATE INDEX users_uuid ON graybin.users (uuid);

-- user settings shall include:
-- MFA settings
-- Theme settings
-- Webauthn settings
CREATE TABLE graybin.user_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    settings JSONB DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE INDEX user_settings_user_id ON graybin.user_settings (user_id);

CREATE TABLE graybin.sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    session_uuid: VARCHAR(64) NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    last_request_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX sessions_user_id ON graybin.sessions (user_id);
CREATE INDEX sessions_uuid ON graybin.sessions (session_uuid);

CREATE TABLE graybin.posts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    privacy ENUM('public', 'private', 'unlisted', 'draft', 'challenge', 'shared', 'deleted') DEFAULT 'private',
    slug VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    challenge JSONB DEFAULT NULL,
    content TEXT NOT NULL, -- Encrypted with user key
    content_type VARCHAR(64) DEFAULT 'text/plain',
    views INT DEFAULT 0,
    user_views INT DEFAULT 0,
    likes INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    published_at TIMESTAMP DEFAULT NULL,
);
CREATE INDEX posts_user_id ON graybin.posts (user_id);
CREATE INDEX posts_slug ON graybin.posts (slug);

CREATE TABLE graybin.post_views (
    id INT PRIMARY KEY AUTO_INCREMENT,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE graybin.user_encryption_keys (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    public_key TEXT NOT NULL,
    private_key TEXT NOT NULL, -- Encrypted with server key
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


