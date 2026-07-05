// 文章阅读计数器 — Upstash Redis 持久化存储
const { Redis } = require('@upstash/redis');

// 从 Vercel 环境变量自动读取连接信息
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const p = req.query.page;
  if (!p) return res.status(400).json({ error: 'missing page' });

  const key = 'pv:' + p.replace(/[^a-zA-Z0-9\-_/.]/g, '').replace(/\/+/g, '/');

  try {
    const count = req.method === 'POST' ? await redis.incr(key) : await redis.get(key);
    res.status(200).json({ count: count || 0 });
  } catch (_) {
    res.status(200).json({ count: 0 });
  }
};
