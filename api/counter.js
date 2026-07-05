// 文章阅读计数器 — Vercel KV 持久化存储
const { kv } = require('@vercel/kv');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const p = req.query.page;
  if (!p) return res.status(400).json({ error: 'missing page' });

  const key = 'pv:' + p.replace(/[^a-zA-Z0-9\-_/.]/g, '').replace(/\/+/g, '/');

  try {
    const count = req.method === 'POST' ? await kv.incr(key) : await kv.get(key);
    res.status(200).json({ count: count || 0 });
  } catch (_) {
    res.status(200).json({ count: 0 });
  }
};
