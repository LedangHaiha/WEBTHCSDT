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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. BẢNG DANH MỤC (Categories)
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    type ENUM('NEWS', 'UTILITY', 'DOC') DEFAULT 'NEWS',
    order_index INT DEFAULT 0
);

-- 3. BẢNG BÀI VIẾT TIN TỨC & SỰ KIỆN (News & Content Management)
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

-- 4. BẢNG THÔNG BÁO MỐC THỜI GIAN (Announcement & Event Schedule)
CREATE TABLE IF NOT EXISTS announcements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    month_label VARCHAR(10) NOT NULL, -- Ví dụ: "Th.11", "Th.12"
    day_label VARCHAR(10) NOT NULL,   -- Ví dụ: "19", "25"
    target_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. BẢNG VĂN BẢN CHỈ ĐẠO & HÀNH CHÍNH (Administrative Documents)
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

-- 6. BẢNG DANH MỤC TIỆN ÍCH SIDEBAR (Portal Utility & Directory)
CREATE TABLE IF NOT EXISTS utilities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    icon_type VARCHAR(50) NOT NULL, -- e.g., 'email', 'calendar', 'tech', 'database', 'doc', 'procedure'
    target_url VARCHAR(255) DEFAULT '#',
    order_index INT DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1
);

-- 7. BẢNG NHẬT KÝ VẾT & XUẤT BẢN (Audit & Activity Logs)
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
INSERT INTO users (username, password, full_name, role, email) VALUES
('admin', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vj.zO1aO2.', 'Ban Giám Hiệu Admin', 'ADMIN', 'admin@thcsdong.edu.vn'),
('giaovien1', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vj.zO1aO2.', 'Nguyễn Văn A (Giáo viên)', 'TEACHER', 'nguyenvana@thcsdong.edu.vn');

INSERT INTO utilities (title, icon_type, target_url, order_index) VALUES
('Email phòng GD&ĐT', 'email', 'mailto:phonggddt@hanoi.gov.vn', 1),
('Lịch công tác', 'calendar', '/lich-cong-tac', 2),
('Tài nguyên công nghệ', 'tech', '/tai-nguyen-cong-nghe', 3),
('Cơ sở dữ liệu THPT/THCS', 'database', '/csdl-thpt', 4),
('Công bố trực tuyến VBHC', 'doc', '/cong-bo-vbhc', 5),
('Thủ tục hành chính', 'procedure', '/thu-tuc-hanh-chinh', 6);

INSERT INTO announcements (title, content, month_label, day_label) VALUES
('Sở Giáo dục và Đào tạo tổ chức tập huấn chuyên môn đầu năm học', 'Tập huấn chuyên môn nâng cao phương pháp giảng dạy cho giáo viên THCS...', 'Th.11', '19'),
('Các trường học tham quan về nguồn nhân các ngày lễ lớn trong tháng 11', 'Tổ chức hoạt động ngoại khóa, tham quan di tích lịch sử cho học sinh...', 'Th.11', '19'),
('Sở GDĐT tổ chức tập huấn mô hình trường học mới đối với lớp 3 cấp TH', 'Chương trình phổ biến giáo án mới và trao đổi kinh nghiệm công nghệ...', 'Th.11', '19');

INSERT INTO posts (title, slug, excerpt, content, thumbnail, is_featured, status) VALUES
('Sở Giáo dục và Đào tạo tổ chức tập huấn chuyên môn đầu năm học', 'so-gd-dt-to-chuc-tap-huan-chuyen-mon', 'Thực hiện nhiệm vụ GDTrH năm học 2025-2026, Sở Giáo dục và Đào tạo tổ chức Hội nghị tập huấn chuyên môn đầu năm học nhằm mục tiêu trang bị cho đội ngũ chuyên viên, giáo viên...', 'Nội dung chi tiết bài viết hội nghị tập huấn chuyên môn đầu năm học của Sở Giáo dục và Đào tạo...', '/images/news_banner.jpg', 1, 'PUBLISHED'),
('Vì tương lai thế hệ trẻ - Đổi mới giáo dục THCS', 'vi-tuong-lai-the-he-tre', 'Đột phá trong ứng dụng công nghệ thông tin và chuyển đổi số trong quản lý giảng dạy tại trường THCS...', 'Nội dung chi tiết bài viết vì tương lai thế hệ trẻ...', '/images/future_banner.jpg', 0, 'PUBLISHED');
