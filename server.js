const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use((req, res, next) => {
  if (req.method === 'PUT' && req.headers['content-type'] && req.headers['content-type'].startsWith('application/json')) {
    req.headers['content-type'] = 'multipart/form-data';
  }
  next();
});
app.use(express.json());

// 添加静态资源中间件
app.use(express.static('public'));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/localWorkflow');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

// 处理文件上传请求
app.put('/localWorkflow/:filename', upload.single('file'), (req, res) => {
  res.sendStatus(200);
});

// 处理文件检查请求
app.head('/localWorkflow/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'localWorkflow', req.params.filename);
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      res.sendStatus(404);
    } else {
      res.sendStatus(200);
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
