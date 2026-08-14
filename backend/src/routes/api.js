const express = require('express');
const router = express.Router();

const newsCtrl = require('../controllers/newsController');
const annCtrl = require('../controllers/announcementController');
const docCtrl = require('../controllers/docController');
const utilCtrl = require('../controllers/utilityController');
const searchCtrl = require('../controllers/searchController');
const authCtrl = require('../controllers/authController');
const siteCtrl = require('../controllers/siteConfigController');

const { verifyToken, checkRole } = require('../middleware/authGuard');

// Public Routes (Portal THCS)
router.get('/posts', newsCtrl.getPosts);
router.get('/posts/:slug', newsCtrl.getPostBySlug);

router.get('/announcements', annCtrl.getAnnouncements);
router.get('/documents', docCtrl.getDocuments);
router.get('/utilities', utilCtrl.getUtilities);
router.get('/search', searchCtrl.searchCore);
router.get('/site-settings', siteCtrl.getSiteSettings);

// Auth Routes (Đăng nhập & Đăng ký công khai)
router.post('/auth/login', authCtrl.login);
router.post('/auth/register', authCtrl.register);

// Protected User Routes (Đổi mật khẩu cho Admin, BGH, Giáo viên, Thành viên)
router.post('/auth/change-password', verifyToken, authCtrl.changePassword);

// Protected Admin / BGH CMS Routes
router.get('/admin/pending-users', verifyToken, checkRole(['ADMIN', 'BGH']), authCtrl.getPendingUsers);
router.put('/admin/approve-user/:id', verifyToken, checkRole(['ADMIN', 'BGH']), authCtrl.approveUser);

router.put('/site-settings', verifyToken, checkRole(['ADMIN', 'BGH']), siteCtrl.updateSiteSettings);

router.post('/posts', verifyToken, checkRole(['ADMIN', 'BGH', 'TEACHER']), newsCtrl.createPost);
router.delete('/posts/:id', verifyToken, checkRole(['ADMIN', 'BGH']), newsCtrl.deletePost);

router.post('/announcements', verifyToken, checkRole(['ADMIN', 'BGH']), annCtrl.createAnnouncement);
router.post('/documents', verifyToken, checkRole(['ADMIN', 'BGH', 'TEACHER']), docCtrl.createDocument);
router.put('/utilities', verifyToken, checkRole(['ADMIN']), utilCtrl.updateUtilities);

router.get('/audit-logs', verifyToken, checkRole(['ADMIN', 'BGH']), authCtrl.getAuditLogs);

module.exports = router;
