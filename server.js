// server.js
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// 允许跨域（这样 tiiny.host / 本地网页都能访问）
app.use(cors());
app.use(express.json());

const registrations = []; // 临时存在内存里，调试用

app.post('/api/register', (req, res) => {
  const { name, email, phone, itemType, experience } = req.body;

  console.log('New registration:', req.body);

  registrations.push({
    name,
    email,
    phone,
    itemType,
    experience,
    createdAt: new Date().toISOString(),
  });

  // TODO: 这里你以后可以改成写数据库 / 发邮件 / 存到文件 / Google Sheet 等
  res.status(200).json({ ok: true });
});

// 调试用：看看目前收到了哪些报名
app.get('/api/registrations', (req, res) => {
  res.json(registrations);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
