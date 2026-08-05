// Mock / In-Memory DB Store với Persistence để Backend API chạy lập tức không cần cài MySQL
const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, '../../database/data.json');

const defaultData = {
  users: [
    { id: 1, username: 'admin', password_hash: 'admin123', full_name: 'Ban Giám Hiệu Admin', role: 'ADMIN', email: 'admin@thcsdong.edu.vn' },
    { id: 2, username: 'giaovien', password_hash: 'gv123', full_name: 'Nguyễn Văn A (Giáo viên)', role: 'TEACHER', email: 'nguyenvana@thcsdong.edu.vn' }
  ],
  utilities: [
    { id: 1, title: 'Email phòng GD&ĐT', icon_type: 'email', target_url: 'mailto:phonggddt@hanoi.gov.vn', order_index: 1 },
    { id: 2, title: 'Lịch công tác', icon_type: 'calendar', target_url: '#lich-cong-tac', order_index: 2 },
    { id: 3, title: 'Tài nguyên công nghệ', icon_type: 'tech', target_url: '#tai-nguyen-cong-nghe', order_index: 3 },
    { id: 4, title: 'Cơ sở dữ liệu THPT/THCS', icon_type: 'database', target_url: '#csdl-thpt', order_index: 4 },
    { id: 5, title: 'Công bố trực tuyến VBHC', icon_type: 'doc', target_url: '#cong-bo-vbhc', order_index: 5 },
    { id: 6, title: 'Thủ tục hành chính', icon_type: 'procedure', target_url: '#thu-tuc-hanh-chinh', order_index: 6 }
  ],
  announcements: [
    { id: 1, title: 'Sở Giáo dục và Đào tạo tổ chức tập huấn chuyên môn đầu năm học', content: 'Thực hiện nhiệm vụ GDTrH năm học 2025-2026...', month_label: 'Th.11', day_label: '19', target_url: '#' },
    { id: 2, title: 'Các trường học Tam Kỳ tổ chức tham quan về nguồn nhân các ngày lễ lớn tháng 4', content: 'Tổ chức hoạt động ngoại khóa tìm hiểu lịch sử...', month_label: 'Th.11', day_label: '19', target_url: '#' },
    { id: 3, title: 'Sở GDĐT tổ chức tập huấn mô hình trường học mới đối với lớp 3 cấp TH', content: 'Ứng dụng công nghệ thông tin trong dạy và học...', month_label: 'Th.11', day_label: '19', target_url: '#' }
  ],
  posts: [
    {
      id: 1,
      title: 'Sở Giáo dục và Đào tạo tổ chức tập huấn chuyên môn đầu năm học',
      slug: 'so-gd-dt-to-chuc-tap-huan-chuyen-mon-dau-nam-hoc',
      excerpt: 'Thực hiện nhiệm vụ GDTrH năm học 2025-2026, Sở Giáo dục và Đào tạo (GDĐT) Quảng Nam tổ chức Hội nghị tập huấn chuyên môn đầu năm học 2025-2026 nhằm mục tiêu trang bị cho đội ngũ chuyên viên, giáo viên...',
      content: 'Chi tiết bài viết: Ngày 18/1, Sở Giáo dục và Đào tạo đã khai mạc lớp tập huấn chuyên môn dành cho cán bộ quản lý và giáo viên cốt cán các trường THCS trên địa bàn thành phố.',
      thumbnail: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80',
      is_featured: 1,
      status: 'PUBLISHED',
      view_count: 342,
      created_at: '2026-11-19T08:00:00Z'
    },
    {
      id: 2,
      title: 'Học sinh THCS xuất sắc đạt giải cao tại Kỳ thi Khoa học Kỹ thuật cấp Thành phố',
      slug: 'hoc-sinh-thcs-xuat-sac-dat-giai-cao-kty-khoa-hoc-ky-thuat',
      excerpt: 'Dự án "Đổi mới phương pháp tự học với AI" của nhóm học sinh trường THCS Đồng đã vinh dự đạt giải Nhất hội thi sáng tạo KHKT cấp thành phố năm 2026.',
      content: 'Nội dung chi tiết kết quả cuộc thi KHKT...',
      thumbnail: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80',
      is_featured: 0,
      status: 'PUBLISHED',
      view_count: 189,
      created_at: '2026-11-18T10:30:00Z'
    }
  ],
  documents: [
    { id: 1, doc_number: '124/HD-SGDĐT', title: 'Hướng dẫn thực hiện nhiệm vụ ứng dụng CNTT năm học 2025-2026', category: 'Hướng dẫn', published_date: '2026-09-01' },
    { id: 2, doc_number: '89/TB-THCSD', title: 'Thông báo về việc nghỉ lễ và treo cờ quốc kỳ', category: 'Thông báo', published_date: '2026-08-30' }
  ],
  audit_logs: [
    { id: 1, user_name: 'Ban Giám Hiệu Admin', action: 'CREATE_POST', entity_type: 'POST', entity_id: 1, details: 'Đã xuất bản bài viết tập huấn chuyên môn', created_at: new Date().toISOString() }
  ]
};

function loadData() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Lỗi đọc database file, khởi tạo dữ liệu mặc định:', err.message);
  }
  saveData(defaultData);
  return defaultData;
}

function saveData(data) {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Lỗi ghi database file:', err.message);
  }
}

const db = loadData();

module.exports = {
  db,
  saveData: () => saveData(db)
};
