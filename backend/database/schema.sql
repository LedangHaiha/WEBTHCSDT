-- ============================================================
-- CƠ SỞ DỮ LIỆU CỔNG THÔNG TIN GIÁO DỤC THCS & HỆ THỐNG CMS
-- Tương thích: MySQL 8.0+ / MariaDB / SQLite
-- ============================================================

-- 1. BẢNG NGƯỜI DÙNG & PHÂN QUYỀN (Auth Guard & RBAC)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('ADMIN', 'BGH', 'TEACHER', 'EDITOR') DEFAULT 'TEACHER',
    email VARCHAR(100),
    avatar VARCHAR(255),
    status ENUM('APPROVED', 'PENDING_APPROVAL', 'REJECTED') DEFAULT 'APPROVED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. BẢNG CẤU HÌNH TRANG BÌA & LIÊN KẾT NHANH (Site Settings & Footer)
CREATE TABLE IF NOT EXISTS site_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. BẢNG DANH MỤC (Categories)
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    type ENUM('NEWS', 'UTILITY', 'DOC') DEFAULT 'NEWS',
    order_index INT DEFAULT 0
);

-- 4. BẢNG BÀI VIẾT TIN TỨC & SỰ KIỆN (News & Content Management)
CREATE TABLE IF NOT EXISTS posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    excerpt TEXT,
    content LONGTEXT,
    thumbnail VARCHAR(255),
    category_id INT,
    author_id INT,
    view_count INT DEFAULT 0,
    is_featured TINYINT(1) DEFAULT 0,
    status ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') DEFAULT 'PUBLISHED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 5. BẢNG THÔNG BÁO MỐC THỜI GIAN (Announcement & Event Schedule)
CREATE TABLE IF NOT EXISTS announcements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    month_label VARCHAR(10) NOT NULL,
    day_label VARCHAR(10) NOT NULL,
    target_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. BẢNG VĂN BẢN CHỈ ĐẠO & HÀNH CHÍNH (Administrative Documents)
CREATE TABLE IF NOT EXISTS administrative_documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    doc_number VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) DEFAULT 'VBHC',
    file_url VARCHAR(255),
    published_date DATE,
    issuing_authority VARCHAR(150),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. BẢNG DANH MỤC TIỆN ÍCH SIDEBAR (Portal Utility & Directory)
CREATE TABLE IF NOT EXISTS utilities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    icon_type VARCHAR(50) NOT NULL,
    target_url VARCHAR(255) DEFAULT '#',
    order_index INT DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1
);

-- 8. BẢNG NHẬT KÝ VẾT & XUẤT BẢN (Audit & Activity Logs)
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    user_name VARCHAR(100),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INT,
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- SEED DATA MẪU KHỞI TẠO
-- ============================================================
INSERT INTO users (username, password, full_name, role, email, status) VALUES
('admin', 'admin123', 'Ban Giám Hiệu Admin', 'ADMIN', 'admin@thcsdongtan.huulung.langson.edu.vn', 'APPROVED'),
('giaovien1', 'gv123', 'Nguyễn Văn A (Giáo viên)', 'TEACHER', 'nguyenvana@thcsdongtan.edu.vn', 'APPROVED'),
('teacher_pending', '123456', 'Trần Thị B (Giáo viên Đăng ký)', 'TEACHER', 'tranthib@thcsdongtan.edu.vn', 'PENDING_APPROVAL');

INSERT INTO site_settings (setting_key, setting_value) VALUES
('agency_title', 'ỦY BAN NHÂN DÂN XÃ HỮU LŨNG - TỈNH LẠNG SƠN'),
('school_name', 'TRƯỜNG THCS ĐỒNG TÂN'),
('address', 'Xã Hữu Lũng - Tỉnh Lạng Sơn'),
('phone', '(0205) 3885.6789'),
('email', 'thcsdongtan.huulung@langson.edu.vn'),
('quick_links', '[{"title":"Giới thiệu nhà trường","url":"#gioi-thieu"},{"title":"Tin tức - Sự kiện nổi bật","url":"#tin-tuc"},{"title":"Văn bản chỉ đạo & Quy chế","url":"#van-ban"},{"title":"Kho Tài nguyên & Đề thi","url":"#tai-nguyen"},{"title":"Lịch công tác tuần","url":"#lich-cong-tac"}]');
