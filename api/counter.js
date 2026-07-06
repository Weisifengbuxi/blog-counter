// 文章阅读计数器 — Redis 持久化（连接复用 + 缓存）
const Redis = require('ioredis');

// 模块级连接复用，避免每次请求重新建连
let redis = null;
function getRedis() {
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 2,
      connectTimeout: 5000,
      enableReadyCheck: false,
    });
  }
  return redis;
}

module.exports = async (req, res) => {
  // CORS + 缓存头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=0, stale-while-revalidate=60');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const p = req.query.page;
  if (!p) return res.status(400).json({ error: 'missing page' });

  const key = 'pv:' + p.replace(/[^a-zA-Z0-9\-_/.]/g, '').replace(/\/+/g, '/');

  try {
    const count = req.method === 'POST'
      ? await getRedis().incr(key)
      : await getRedis().get(key);
    res.status(200).json({ count: count || 0 });
  } catch (_) {
    res.status(200).json({ count: 0 });
  }
};
