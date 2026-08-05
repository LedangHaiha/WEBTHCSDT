const express = require('express');
const router = express.Router();

const newsCtrl = require('../controllers/newsController');
const annCtrl = require('../controllers/announcementController');
const docCtrl = require('../controllers/docController');
const utilCtrl = require('../controllers/utilityController');
const searchCtrl = require('../controllers/searchController');
const authCtrl = require('../controllers/authController');

const { verifyToken, checkRole } = require('../middleware/authGuard');

// Public Routes (Portal THCS)
router.get('/posts', newsCtrl.getPosts);
router.get('/posts/:slug', newsCtrl.getPostBySlug);

router.get('/announcements', annCtrl.getAnnouncements);

router.get('/documents', docCtrl.getDocuments);

router.get('/utilities', utilCtrl.getUtilities);

router.get('/search', searchCtrl.searchCore);

// Auth Route
router.post('/auth/login', authCtrl.login);

// Protected Admin/Teacher CMS Routes
router.post('/posts', verifyToken, checkRole(['ADMIN', 'BGH', 'TEACHER']), newsCtrl.createPost);
router.delete('/posts/:id', verifyToken, checkRole(['ADMIN', 'BGH']), newsCtrl.deletePost);

router.post('/announcements', verifyToken, checkRole(['ADMIN', 'BGH']), annCtrl.createAnnouncement);

router.post('/documents', verifyToken, checkRole(['ADMIN', 'BGH', 'TEACHER']), docCtrl.createDocument);

router.put('/utilities', verifyToken, checkRole(['ADMIN']), utilCtrl.updateUtilities);

router.get('/audit-logs', verifyToken, checkRole(['ADMIN', 'BGH']), authCtrl.getAuditLogs);

module.exports = router;
