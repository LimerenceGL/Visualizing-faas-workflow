const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const uuid = require('uuid');
const app = express();
app.use(cors());
// app.use((req, res, next) => {
//   if (req.method === 'PUT' && req.headers['content-type'] && req.headers['content-type'].startsWith('application/json')) {
//     req.headers['content-type'] = 'multipart/form-data';
//   }
//   next();
// });
app.use((req, res, next) => {
    if (req.method === 'PUT' && req.headers['content-type'] && req.headers['content-type'].startsWith('application/json')) {
        req.headers['content-type'] = 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW';
    }
    next();
});

app.use(express.json());

// 添加静态资源中间件
app.use(express.static('storage'));
app.use('/graphYamlData', express.static('storage/graphYamlData'));
app.use('/graphJsonData', express.static('storage/graphJsonData'));

//更新index
async function updateIndexJson(folderPath, operation, fileInfo) {
    const indexPath = path.join(folderPath, 'index.json');

    let indexData = {files: []};

    try {
        const indexRawData = await fs.promises.readFile(indexPath, 'utf-8');
        indexData = JSON.parse(indexRawData);
    } catch (err) {
        console.error('Error reading index.json:', err);
    }

    if (operation === 'add') {
        fileInfo.id = uuid.v4();
        indexData.files.push(fileInfo);
    } else if (operation === 'update') {
        const fileIndex = indexData.files.findIndex((file) => file.id === fileInfo.id);
        if (fileIndex >= 0) {
            indexData.files[fileIndex] = {...indexData.files[fileIndex], ...fileInfo};
        }
    } else if (operation === 'delete') {
        indexData.files = indexData.files.filter((file) => file.id !== fileInfo.id);
    }

    await fs.promises.writeFile(indexPath, JSON.stringify(indexData), 'utf-8');
}


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'storage/localWorkflow');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});

const upload = multer({storage});

// 处理文件上传请求
app.put('/localWorkflow/:filename', upload.single('file'), async (req, res) => {
    try {
        console.log("Received file:", req.file);
        await updateIndexJson(path.join(__dirname, 'storage', 'localWorkflow'), 'add', {
            name: req.params.filename,
            lastModified: new Date(),
            tag: 'undeployed',
        });
        res.sendStatus(200);
    } catch (err) {
        console.error('Error updating index.json:', err);
        res.sendStatus(500);
    }
});


// 处理文件检查请求
app.head('/localWorkflow/:filename', (req, res) => {
    const filePath = path.join(__dirname, 'storage', 'localWorkflow', req.params.filename);
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            res.sendStatus(404);
        } else {
            res.sendStatus(200);
        }
    });
});


// 添加或修改文件的路由
app.put('/storage/:folder/:filename', upload.single('file'), async (req, res) => {
    console.log("Received2 file:", req.file);
    await updateIndexJson(path.join(__dirname, 'storage', req.params.folder), 'update', {
        id: req.body.id,
        name: req.params.filename,
        lastModified: new Date(),
        tag: req.body.tag,
    });
    res.sendStatus(200);
});

// 读取/storage/localWorkflow下文件的路由
app.get('/storage/localWorkflow/:filename', async (req, res) => {
  try {
    const filePath = path.join(__dirname, 'storage', 'localWorkflow', req.params.filename);
    const fileContent = await fs.promises.readFile(filePath, 'utf-8');
    res.send(fileContent);
  } catch (err) {
    console.error('Error reading file:', err);
    res.status(500).send('Error reading file');
  }
});

// 删除文件的路由
app.delete('/storage/:folder/:filename', async (req, res) => {
    const filePath = path.join(__dirname, 'storage', req.params.folder, req.params.filename);
    await fs.promises.unlink(filePath);
    await updateIndexJson(path.join(__dirname, 'storage', req.params.folder), 'delete', {
        id: req.query.id,
    });
    res.sendStatus(200);
});

// 获取文件列表的路由
app.get('/storage/:folder', async (req, res) => {
    try {
        console.log(`Received request for folder: ${req.params.folder}`);
        if (req.params.folder === 'localWorkflow') {
            const indexPath = path.join(__dirname, 'storage', 'localWorkflow', 'index.json');
            const indexRawData = await fs.promises.readFile(indexPath, 'utf-8');
            const indexData = JSON.parse(indexRawData);
            console.log(indexData)
            res.json(indexData.files);
        } else {
            res.status(400).send('Invalid folder specified');
        }
    } catch (err) {
        res.status(500).send('Error reading files list');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
