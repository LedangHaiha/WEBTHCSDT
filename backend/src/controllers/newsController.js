// TẦNG NGHIỆP VỤ - News & Content Management
const { db, saveData } = require('../config/dbStore');
const { logActivity } = require('../middleware/auditLogger');

exports.getPosts = (req, res) => {
  const { featured, limit } = req.query;
  let result = db.posts.filter(p => p.status === 'PUBLISHED');

  if (featured === 'true') {
    result = result.filter(p => p.is_featured === 1);
  }

  if (limit) {
    result = result.slice(0, parseInt(limit));
  }

  res.json({ success: true, data: result });
};

exports.getPostBySlug = (req, res) => {
  const { slug } = req.params;
  const post = db.posts.find(p => p.slug === slug);
  if (!post) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy bài viết!' });
  }

  post.view_count = (post.view_count || 0) + 1;
  saveData();

  res.json({ success: true, data: post });
};

exports.createPost = (req, res) => {
  const { title, excerpt, content, thumbnail, is_featured } = req.body;
  if (!title || !content) {
    return res.status(400).json({ success: false, message: 'Tiêu đề và nội dung bài viết là bắt buộc!' });
  }

  const slug = title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") + '-' + Date.now();

  const newPost = {
    id: db.posts.length + 1,
    title,
    slug,
    excerpt: excerpt || title,
    content,
    thumbnail: thumbnail || 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80',
    is_featured: is_featured ? 1 : 0,
    status: 'PUBLISHED',
    view_count: 0,
    created_at: new Date().toISOString()
  };

  db.posts.unshift(newPost);
  saveData();
  logActivity(req.user?.full_name || 'Admin', 'CREATE_POST', 'POST', newPost.id, `Đã tạo bài viết: ${title}`);

  res.status(201).json({ success: true, data: newPost, message: 'Đăng bài viết mới thành công!' });
};

exports.deletePost = (req, res) => {
  const { id } = req.params;
  const index = db.posts.findIndex(p => p.id === parseInt(id));
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Bài viết không tồn tại!' });
  }

  const removed = db.posts.splice(index, 1)[0];
  saveData();
  logActivity(req.user?.full_name || 'Admin', 'DELETE_POST', 'POST', removed.id, `Đã xóa bài viết: ${removed.title}`);

  res.json({ success: true, message: 'Xóa bài viết thành công!' });
};
