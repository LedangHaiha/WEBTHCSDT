// ============================================================
// PORTAL THCS & CMS MANAGEMENT - JAVASCRIPT FRONTEND LOGIC
// ============================================================

const API_BASE = '/api';
let authToken = localStorage.getItem('thcs_jwt_token') || null;
let currentUser = JSON.parse(localStorage.getItem('thcs_user_data') || 'null');

document.addEventListener('DOMContentLoaded', () => {
  initPortalData();
  updateUserUI();
});

// 1. KHỞI TẠO NẠP DỮ LIỆU TỪ API BACKEND
async function initPortalData() {
  await Promise.all([
    fetchPosts(),
    fetchAnnouncements(),
    fetchUtilities()
  ]);
}

// 2. FETCH BÀI VIẾT TIN TỨC (Layer 3: News & Content Management)
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

// 3. FETCH THÔNG BÁO MỐC THỜI GIAN (Layer 3: Announcement & Event Schedule)
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

// 4. FETCH DANH MỤC TIỆN ÍCH SIDEBAR (Layer 3: Portal Utility & Directory)
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

// 5. TÌM KIẾM NHANH (Layer 3: Search Engine Core)
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

// 6. XÁC THỰC CMS & DIALOGS (Layer 2: Auth Guard & JWT)
function openLoginModal() {
  document.getElementById('loginModal').classList.add('active');
}

function closeLoginModal() {
  document.getElementById('loginModal').classList.remove('active');
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

function updateUserUI() {
  const authLinks = document.getElementById('authLinks');
  if (currentUser) {
    authLinks.innerHTML = `👋 Chào <b>${currentUser.full_name}</b> | <a href="#" onclick="handleLogout()">Đăng xuất</a>`;
    document.getElementById('userBadge').innerText = `${currentUser.full_name} (${currentUser.role})`;
  } else {
    authLinks.innerHTML = `<a href="#" onclick="openLoginModal()">Đăng nhập</a> / <a href="#">Đăng ký</a>`;
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
    fetchAuditLogs();
  }
}

function switchCmsTab(tabId) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

  event.target.classList.add('active');
  document.getElementById(tabId).classList.add('active');

  if (tabId === 'auditTab') fetchAuditLogs();
}

// 7. THAO TÁC CMS QUẢN TRỊ (Layer 3: CMS API Calls)
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

// 8. FETCH AUDIT LOGS (Layer 4: Audit & Activity Logs)
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
