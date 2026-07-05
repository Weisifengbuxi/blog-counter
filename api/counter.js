// 文章阅读计数器 — Redis 持久化存储
const Redis = require('ioredis');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const p = req.query.page;
  if (!p) return res.status(400).json({ error: 'missing page' });

  const key = 'pv:' + p.replace(/[^a-zA-Z0-9\-_/.]/g, '').replace(/\/+/g, '/');

  const redis = new Redis(process.env.REDIS_URL, { lazyConnect: true,
    maxRetriesPerRequest: 1,
    connectTimeout: 3000 });

  try {
    const count = await redis.incr(key);
    res.status(200).json({ count });
  } catch (_) {
    res.status(200).json({ count: 0 });
  } finally {
    redis.disconnect();
  }
};
