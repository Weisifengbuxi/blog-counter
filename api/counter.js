// Vercel Serverless Function — 文章阅读计数器
// 零依赖，零配置，部署即用
// 数据存于 /tmp，函数保温期间持久保留

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join('/tmp', 'pageviews.json');

function readData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    }
  } catch (_) {}
  return {};
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data), 'utf-8');
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const page = req.query.page || (req.body && req.body.page);
  if (!page) return res.status(400).json({ error: '缺少 page 参数' });

  // 规范化 key
  const key = page.replace(/^\/+/, '').replace(/[^a-zA-Z0-9\-_/.]/g, '');

  const data = readData();

  if (req.method === 'POST') {
    data[key] = (data[key] || 0) + 1;
    writeData(data);
    return res.status(200).json({ count: data[key] });
  }

  return res.status(200).json({ count: data[key] || 0 });
};
