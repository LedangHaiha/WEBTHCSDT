// Mock / In-Memory DB Store với Persistence cho Backend API
const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, '../../database/data.json');

const defaultData = {
  users: [
    { id: 1, username: 'admin', password_hash: 'admin123', full_name: 'Ban Giám Hiệu Admin', role: 'ADMIN', email: 'admin@thcsdongtan.huulung.langson.edu.vn', status: 'APPROVED' },
    { id: 2, username: 'giaovien', password_hash: 'gv123', full_name: 'Nguyễn Văn A (Giáo viên)', role: 'TEACHER', email: 'nguyenvana@thcsdongtan.edu.vn', status: 'APPROVED' },
    { id: 3, username: 'giaovien2', password_hash: '123456', full_name: 'Trần Thị B (Giáo viên Đăng ký)', role: 'TEACHER', email: 'tranthib@thcsdongtan.edu.vn', status: 'PENDING_APPROVAL' }
  ],
  site_settings: {
    agency_title: 'ỦY BAN NHÂN DÂN XÃ HỮU LŨNG - TỈNH LẠNG SƠN',
    school_name: 'TRƯỜNG THCS ĐỒNG TÂN',
    address: 'Xã Hữu Lũng - Tỉnh Lạng Sơn',
    phone: '(0205) 3885.6789',
    email: 'thcsdongtan.huulung@langson.edu.vn',
    quick_links: [
      { id: 1, title: 'Giới thiệu nhà trường', url: '#gioi-thieu' },
      { id: 2, title: 'Tin tức - Sự kiện nổi bật', url: '#tin-tuc' },
      { id: 3, title: 'Văn bản chỉ đạo & Quy chế', url: '#van-ban' },
      { id: 4, title: 'Kho Tài nguyên & Đề thi', url: '#tai-nguyen' },
      { id: 5, title: 'Lịch công tác tuần', url: '#lich-cong-tac' }
    ]
  },
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
      title: 'Lễ kết nạp Đảng viên mới cho cán bộ giáo viên THCS Đồng Tân',
      slug: 'le-ket-nap-dang-vien-moi-cho-can-bo-giao-vien',
      excerpt: 'Vào lúc 14 giờ 00, Chi bộ trường THCS Đồng Tân đã long trọng tổ chức Lễ kết nạp Đảng viên cho giáo viên ưu tú có nhiều thành tích xuất sắc.',
      content: 'Nội dung chi tiết buổi lễ kết nạp Đảng viên mới...',
      thumbnail: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80',
      is_featured: 1,
      status: 'PUBLISHED',
      view_count: 342,
      created_at: '2026-11-19T08:00:00Z'
    },
    {
      id: 2,
      title: 'Bộ GD&ĐT ban hành Chỉ thị về nhiệm vụ trọng tâm năm học 2026 - 2027',
      slug: 'bo-gd-dt-ban-hanh-chi-thi-nhiem-vu-trong-tam',
      excerpt: 'Tập trung nâng cao chất lượng giáo dục toàn diện, đẩy mạnh chuyển đổi số trong công tác quản lý và giảng dạy tại các trường phổ thông.',
      content: 'Nội dung chi tiết chỉ thị năm học 2026-2027...',
      thumbnail: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80',
      is_featured: 0,
      status: 'PUBLISHED',
      view_count: 189,
      created_at: '2026-11-18T10:30:00Z'
    }
  ],
  documents: [
    { id: 1, doc_number: '232/2026/NĐ-CP', title: 'Nghị định quy định về vị trí việc làm của viên chức', category: 'Nghị định', published_date: '2026-06-26' },
    { id: 2, doc_number: '124/HD-SGDĐT', title: 'Hướng dẫn thực hiện nhiệm vụ ứng dụng CNTT năm học 2025-2026', category: 'Hướng dẫn', published_date: '2026-09-01' }
  ],
  audit_logs: [
    { id: 1, user_name: 'Ban Giám Hiệu Admin', action: 'CREATE_POST', entity_type: 'POST', entity_id: 1, details: 'Đã xuất bản bài viết kết nạp Đảng viên', created_at: new Date().toISOString() }
  ]
};

function loadData() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      const loaded = JSON.parse(raw);
      // Ensure site_settings exists
      if (!loaded.site_settings) loaded.site_settings = defaultData.site_settings;
      return loaded;
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
    fs.writeFileSync(DB_FILE, JSON.stringify(data || db, null, 2), 'utf8');
  } catch (err) {
    console.error('Lỗi ghi database file:', err.message);
  }
}

const db = loadData();

module.exports = {
  db,
  saveData: () => saveData(db)
};
