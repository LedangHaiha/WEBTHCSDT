// ============================================================
// PORTAL THCS & CMS MANAGEMENT - JAVASCRIPT FRONTEND LOGIC
// ============================================================

const API_BASE = '/api';
let authToken = localStorage.getItem('thcs_jwt_token') || null;
let currentUser = JSON.parse(localStorage.getItem('thcs_user_data') || 'null');
let currentSiteSettings = null;

document.addEventListener('DOMContentLoaded', () => {
  initPortalData();
  updateUserUI();
});

// 1. KHỞI TẠO NẠP DỮ LIỆU TỪ API BACKEND
async function initPortalData() {
  await Promise.all([
    fetchSiteSettings(),
    fetchPosts(),
    fetchAnnouncements(),
    fetchUtilities()
  ]);
}

// 2. CHỨC NĂNG BẬT/TẮT HIỂN THỊ MẬT KHẨU (Show / Hide Password)
function togglePasswordVisibility(inputId, btnEl) {
  const input = document.getElementById(inputId);
  if (!input) return;

  if (input.type === 'password') {
    input.type = 'text';
    if (btnEl) btnEl.innerText = '🙈';
  } else {
    input.type = 'password';
    if (btnEl) btnEl.innerText = '👁️';
  }
}

// 3. FETCH NỘI DUNG TRANG BÌA & LIÊN KẾT NHANH (Site Settings)
async function fetchSiteSettings() {
  try {
    const res = await fetch(`${API_BASE}/site-settings`);
    const json = await res.json();
    if (json.success && json.data) {
      currentSiteSettings = json.data;
      renderSiteSettings(json.data);
    }
  } catch (err) {
    console.error('Lỗi nạp cấu hình trang bìa:', err);
  }
}

function renderSiteSettings(settings) {
  if (settings.agency_title) {
    document.getElementById('headerAgencyTitle').innerText = settings.agency_title;
    document.getElementById('footerAgencyTitle').innerText = settings.agency_title;
  }

  if (settings.school_name) {
    document.getElementById('headerSchoolName').innerText = settings.school_name;
    document.getElementById('footerSchoolName').innerText = settings.school_name;
  }

  if (settings.address) document.getElementById('footerAddress').innerText = settings.address;
  if (settings.phone) document.getElementById('footerPhone').innerText = settings.phone;
  if (settings.email) document.getElementById('footerEmail').innerText = settings.email;

  // Render Footer Quick Links
  if (settings.quick_links && Array.isArray(settings.quick_links)) {
    const linksContainer = document.getElementById('footerQuickLinks');
    linksContainer.innerHTML = settings.quick_links.map(link => `
      <li><a href="${link.url}">${link.title}</a></li>
    `).join('');
  }
}

// 4. FETCH BÀI VIẾT TIN TỨC (Layer 3: News & Content Management)
async function fetchPosts() {
  try {
    const res = await fetch(`${API_BASE}/posts`);
    const json = await res.json();
    if (json.success && json.data.length > 0) {
      renderPosts(json.data);
    }
  } catch (err) {
    console.error('Lỗi nạp tin tức từ Backend API:', err);
  }
}

function renderPosts(posts) {
  // Bài viết nổi bật Hero
  const heroPost = posts.find(p => p.is_featured === 1) || posts[0];
  if (heroPost) {
    document.getElementById('heroTitle').innerText = heroPost.title;
    document.getElementById('heroExcerpt').innerText = heroPost.excerpt;
    document.getElementById('heroImage').src = heroPost.thumbnail || 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1000&q=80';
  }

  // Lưới tin tiếp theo
  const subPosts = posts.filter(p => p.id !== heroPost.id);
  const container = document.getElementById('subNewsList');
  if (subPosts.length === 0) {
    container.innerHTML = `<p style="font-size:13px; color:#64748b;">Đang cập nhật các bài viết tin tức mới...</p>`;
    return;
  }

  container.innerHTML = subPosts.map(post => `
    <article class="news-card">
      <img src="${post.thumbnail}" alt="${post.title}">
      <div class="news-card-body">
        <h4><a href="#">${post.title}</a></h4>
        <p>${post.excerpt ? post.excerpt.substring(0, 90) + '...' : ''}</p>
      </div>
    </article>
  `).join('');
}

// 5. FETCH THÔNG BÁO MỐC THỜI GIAN
async function fetchAnnouncements() {
  try {
    const res = await fetch(`${API_BASE}/announcements`);
    const json = await res.json();
    if (json.success && json.data) {
      renderAnnouncements(json.data);
    }
  } catch (err) {
    console.error('Lỗi nạp thông báo:', err);
  }
}

function renderAnnouncements(items) {
  const container = document.getElementById('announcementList');
  if (!items || items.length === 0) {
    container.innerHTML = `<p style="font-size:12px; color:#64748b;">Chưa có thông báo mốc lịch mới.</p>`;
    return;
  }

  container.innerHTML = items.map(ann => `
    <div class="ann-item">
      <div class="date-badge">
        <div class="month">${ann.month_label}</div>
        <div class="day">${ann.day_label}</div>
      </div>
      <a href="${ann.target_url || '#'}" class="ann-title">${ann.title}</a>
    </div>
  `).join('');
}

// 6. FETCH DANH MỤC TIỆN ÍCH SIDEBAR
async function fetchUtilities() {
  try {
    const res = await fetch(`${API_BASE}/utilities`);
    const json = await res.json();
    if (json.success && json.data) {
      renderUtilities(json.data);
    }
  } catch (err) {
    console.error('Lỗi nạp danh mục tiện ích:', err);
  }
}

function renderUtilities(items) {
  const iconMap = {
    email: '✉️',
    calendar: '📅',
    tech: '🌐',
    database: '📗',
    doc: '📹',
    procedure: '📑'
  };

  const container = document.getElementById('utilityList');
  container.innerHTML = items.map(item => `
    <li>
      <a href="${item.target_url}">
        <span class="icon">${iconMap[item.icon_type] || '📌'}</span>
        ${item.title}
      </a>
    </li>
  `).join('');
}

// 7. TÌM KIẾM NHANH
async function performSearch() {
  const q = document.getElementById('searchInput').value.trim();
  if (!q) return;

  try {
    const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(q)}`);
    const json = await res.json();
    if (json.success) {
      const total = json.results.posts.length + json.results.documents.length;
      alert(`Kết quả tìm kiếm cho từ khóa "${q}": Tìm thấy ${total} bài viết & văn bản liên quan.`);
    }
  } catch (err) {
    alert('Lỗi khi thực hiện tìm kiếm!');
  }
}

function handleSearchKey(e) {
  if (e.key === 'Enter') performSearch();
}

// 8. ĐĂNG NHẬP, ĐĂNG KÝ & CHUYỂN ĐỔI MODAL
function openLoginModal() {
  document.getElementById('loginModal').classList.add('active');
}

function closeLoginModal() {
  document.getElementById('loginModal').classList.remove('active');
}

function openRegisterModal() {
  document.getElementById('registerModal').classList.add('active');
}

function closeRegisterModal() {
  document.getElementById('registerModal').classList.remove('active');
}

function switchModal(closeId, openId) {
  document.getElementById(closeId).classList.remove('active');
  document.getElementById(openId).classList.add('active');
}

async function handleLoginSubmit(e) {
  e.preventDefault();
  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const json = await res.json();
    if (json.success) {
      authToken = json.token;
      currentUser = json.user;
      localStorage.setItem('thcs_jwt_token', authToken);
      localStorage.setItem('thcs_user_data', JSON.stringify(currentUser));

      closeLoginModal();
      updateUserUI();
      toggleCmsModal();
      alert(`Chào mừng ${currentUser.full_name} (${currentUser.role}) đã đăng nhập vào hệ thống CMS!`);
    } else {
      alert(json.message || 'Đăng nhập thất bại!');
    }
  } catch (err) {
    alert('Không thể kết nối đến API Server!');
  }
}

async function handleRegisterSubmit(e) {
  e.preventDefault();
  const full_name = document.getElementById('regFullName').value;
  const username = document.getElementById('regUsername').value;
  const email = document.getElementById('regEmail').value;
  const password = document.getElementById('regPassword').value;

  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name, username, email, password, role: 'TEACHER' })
    });

    const json = await res.json();
    if (json.success) {
      alert(json.message);
      closeRegisterModal();
      document.getElementById('registerForm').reset();
    } else {
      alert(json.message || 'Đăng ký thất bại!');
    }
  } catch (err) {
    alert('Không thể kết nối tới server đăng ký!');
  }
}

function updateUserUI() {
  const authLinks = document.getElementById('authLinks');
  if (currentUser) {
    authLinks.innerHTML = `👋 Chào <b>${currentUser.full_name}</b> | <a href="#" onclick="handleLogout()">Đăng xuất</a>`;
    document.getElementById('userBadge').innerText = `${currentUser.full_name} (${currentUser.role})`;
    
    // Toggle Admin-only tabs visibility
    const isAdmin = currentUser.role === 'ADMIN' || currentUser.role === 'BGH';
    document.querySelectorAll('.admin-only-tab').forEach(el => {
      el.style.display = isAdmin ? 'inline-block' : 'none';
    });
  } else {
    authLinks.innerHTML = `<a href="#" onclick="openLoginModal()">Đăng nhập</a> / <a href="#" onclick="openRegisterModal()">Đăng ký</a>`;
  }
}

function handleLogout() {
  authToken = null;
  currentUser = null;
  localStorage.removeItem('thcs_jwt_token');
  localStorage.removeItem('thcs_user_data');
  updateUserUI();
  alert('Đã đăng xuất thành công!');
}

function toggleCmsModal() {
  if (!currentUser) {
    openLoginModal();
    return;
  }
  const modal = document.getElementById('cmsModal');
  modal.classList.toggle('active');
  if (modal.classList.contains('active')) {
    if (currentUser.role === 'ADMIN' || currentUser.role === 'BGH') {
      fetchPendingUsers();
      populateCoverSettingsForm();
    }
  }
}

function switchCmsTab(tabId) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

  event.target.classList.add('active');
  document.getElementById(tabId).classList.add('active');

  if (tabId === 'pendingUsersTab') fetchPendingUsers();
  if (tabId === 'coverSettingsTab') populateCoverSettingsForm();
  if (tabId === 'auditTab') fetchAuditLogs();
}

// 9. CHỨC NĂNG ĐỔI MẬT KHẨU TÀI KHOẢN (Cho cả Admin, BGH và Thành viên)
async function handleChangePassword(e) {
  e.preventDefault();
  const old_password = document.getElementById('pwdOld').value;
  const new_password = document.getElementById('pwdNew').value;
  const confirm_password = document.getElementById('pwdConfirm').value;

  if (new_password !== confirm_password) {
    alert('Mật khẩu mới và Xác nhận mật khẩu mới không trùng khớp!');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ old_password, new_password })
    });

    const json = await res.json();
    if (json.success) {
      alert(json.message);
      document.getElementById('pwdOld').value = '';
      document.getElementById('pwdNew').value = '';
      document.getElementById('pwdConfirm').value = '';
    } else {
      alert(json.message || 'Đổi mật khẩu thất bại!');
    }
  } catch (err) {
    alert('Lỗi kết nối server!');
  }
}

// 10. CHỨC NĂNG DUYỆT TÀI KHOẢN ĐĂNG KÝ (Dành cho Admin/BGH)
async function fetchPendingUsers() {
  if (!authToken) return;
  try {
    const res = await fetch(`${API_BASE}/admin/pending-users`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const json = await res.json();
    if (json.success) {
      const pendingList = json.data || [];
      document.getElementById('pendingCount').innerText = pendingList.length;

      const tbody = document.getElementById('pendingUsersBody');
      if (pendingList.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#64748b;">Không có tài khoản nào đang chờ phê duyệt.</td></tr>`;
        return;
      }

      tbody.innerHTML = pendingList.map(u => `
        <tr>
          <td>#${u.id}</td>
          <td><b>${u.full_name}</b></td>
          <td>${u.username}</td>
          <td>${u.email || 'N/A'}</td>
          <td><span style="color:#0077ba; font-weight:bold;">${u.role}</span></td>
          <td>${new Date(u.created_at).toLocaleDateString('vi-VN')}</td>
          <td>
            <button class="btn-approve-sm" onclick="handleApproveUser(${u.id}, 'APPROVE')">✓ Duyệt Cấp</button>
            <button class="btn-reject-sm" onclick="handleApproveUser(${u.id}, 'REJECT')">✕ Từ Chối</button>
          </td>
        </tr>
      `).join('');
    }
  } catch (err) {
    console.error('Lỗi nạp danh sách tài khoản chờ duyệt:', err);
  }
}

async function handleApproveUser(userId, action) {
  try {
    const res = await fetch(`${API_BASE}/admin/approve-user/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ action })
    });
    const json = await res.json();
    if (json.success) {
      alert(json.message);
      fetchPendingUsers();
    } else {
      alert(json.message || 'Lỗi thao tác!');
    }
  } catch (err) {
    alert('Lỗi kết nối server!');
  }
}

// 11. CHỈNH SỬA CẤU HÌNH TRANG BÌA & LIÊN KẾT NHANH (Dành cho Admin)
function populateCoverSettingsForm() {
  if (!currentSiteSettings) return;
  document.getElementById('cfgAgencyTitle').value = currentSiteSettings.agency_title || '';
  document.getElementById('cfgSchoolName').value = currentSiteSettings.school_name || '';
  document.getElementById('cfgAddress').value = currentSiteSettings.address || '';
  document.getElementById('cfgPhone').value = currentSiteSettings.phone || '';
  document.getElementById('cfgEmail').value = currentSiteSettings.email || '';

  renderQuickLinksEditor(currentSiteSettings.quick_links || []);
}

function renderQuickLinksEditor(links) {
  const container = document.getElementById('quickLinksEditor');
  container.innerHTML = links.map((link, idx) => `
    <div class="ql-row">
      <input type="text" class="ql-title flex-1" value="${link.title}" placeholder="Tên đường liên kết...">
      <input type="text" class="ql-url flex-1" value="${link.url}" placeholder="Địa chỉ URL (#gioi-thieu)...">
      <button type="button" class="btn-danger-sm" onclick="removeQuickLinkRow(this)">Xóa</button>
    </div>
  `).join('');
}

function addQuickLinkRow() {
  const container = document.getElementById('quickLinksEditor');
  const div = document.createElement('div');
  div.className = 'ql-row';
  div.innerHTML = `
    <input type="text" class="ql-title flex-1" value="" placeholder="Tên đường liên kết mới...">
    <input type="text" class="ql-url flex-1" value="#" placeholder="Địa chỉ URL...">
    <button type="button" class="btn-danger-sm" onclick="removeQuickLinkRow(this)">Xóa</button>
  `;
  container.appendChild(div);
}

function removeQuickLinkRow(btnEl) {
  btnEl.closest('.ql-row').remove();
}

async function handleUpdateSiteSettings(e) {
  e.preventDefault();
  const agency_title = document.getElementById('cfgAgencyTitle').value;
  const school_name = document.getElementById('cfgSchoolName').value;
  const address = document.getElementById('cfgAddress').value;
  const phone = document.getElementById('cfgPhone').value;
  const email = document.getElementById('cfgEmail').value;

  const quick_links = [];
  document.querySelectorAll('#quickLinksEditor .ql-row').forEach((row, idx) => {
    const title = row.querySelector('.ql-title').value.trim();
    const url = row.querySelector('.ql-url').value.trim();
    if (title) {
      quick_links.push({ id: idx + 1, title, url: url || '#' });
    }
  });

  try {
    const res = await fetch(`${API_BASE}/site-settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ agency_title, school_name, address, phone, email, quick_links })
    });

    const json = await res.json();
    if (json.success) {
      alert(json.message);
      currentSiteSettings = json.data;
      renderSiteSettings(currentSiteSettings);
    } else {
      alert(json.message || 'Lỗi cập nhật cấu hình!');
    }
  } catch (err) {
    alert('Lỗi kết nối server!');
  }
}

// 12. THAO TÁC POSTS / ANNOUNCEMENTS / DOCUMENTS CMS
async function handleCreatePost(e) {
  e.preventDefault();
  const title = document.getElementById('postTitle').value;
  const excerpt = document.getElementById('postExcerpt').value;
  const content = document.getElementById('postContent').value;
  const thumbnail = document.getElementById('postThumbnail').value;
  const is_featured = document.getElementById('postFeatured').checked;

  try {
    const res = await fetch(`${API_BASE}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ title, excerpt, content, thumbnail, is_featured })
    });

    const json = await res.json();
    if (json.success) {
      alert('Đã xuất bản bài viết mới thành công!');
      fetchPosts();
      document.getElementById('createPostForm').reset();
    } else {
      alert(json.message || 'Lỗi đăng bài!');
    }
  } catch (err) {
    alert('Lỗi kết nối API CMS!');
  }
}

async function handleCreateAnnouncement(e) {
  e.preventDefault();
  const month_label = document.getElementById('annMonth').value;
  const day_label = document.getElementById('annDay').value;
  const title = document.getElementById('annTitle').value;

  try {
    const res = await fetch(`${API_BASE}/announcements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ month_label, day_label, title })
    });

    const json = await res.json();
    if (json.success) {
      alert('Đã thêm thông báo mới!');
      fetchAnnouncements();
    }
  } catch (err) {
    alert('Lỗi kết nối API!');
  }
}

async function handleCreateDoc(e) {
  e.preventDefault();
  const doc_number = document.getElementById('docNumber').value;
  const category = document.getElementById('docCategory').value;
  const title = document.getElementById('docTitle').value;

  try {
    const res = await fetch(`${API_BASE}/documents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ doc_number, category, title })
    });

    const json = await res.json();
    if (json.success) {
      alert('Đã công bố văn bản hành chính!');
    }
  } catch (err) {
    alert('Lỗi kết nối API!');
  }
}

// 13. FETCH AUDIT LOGS
async function fetchAuditLogs() {
  if (!authToken) return;
  try {
    const res = await fetch(`${API_BASE}/audit-logs`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const json = await res.json();
    if (json.success) {
      const tbody = document.getElementById('auditLogsBody');
      tbody.innerHTML = json.data.map(log => `
        <tr>
          <td>#${log.id}</td>
          <td><b>${log.user_name}</b></td>
          <td><span style="color:#0077ba; font-weight:bold;">${log.action}</span></td>
          <td>${log.entity_type}</td>
          <td>${log.details}</td>
          <td>${new Date(log.created_at).toLocaleString('vi-VN')}</td>
        </tr>
      `).join('');
    }
  } catch (err) {
    console.error('Lỗi nạp nhật ký hệ thống:', err);
  }
}
