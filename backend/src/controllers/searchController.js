// TẦNG NGHIỆP VỤ - Search Engine Core
const { db } = require('../config/dbStore');

exports.searchCore = (req, res) => {
  const q = (req.query.q || '').toLowerCase().trim();
  if (!q) {
    return res.json({ success: true, posts: [], documents: [], announcements: [] });
  }

  const postsMatch = db.posts.filter(p => 
    p.title.toLowerCase().includes(q) || (p.excerpt && p.excerpt.toLowerCase().includes(q))
  );

  const docsMatch = db.documents.filter(d => 
    d.title.toLowerCase().includes(q) || d.doc_number.toLowerCase().includes(q)
  );

  const annMatch = db.announcements.filter(a => 
    a.title.toLowerCase().includes(q)
  );

  res.json({
    success: true,
    query: q,
    results: {
      posts: postsMatch,
      documents: docsMatch,
      announcements: annMatch
    }
  });
};
