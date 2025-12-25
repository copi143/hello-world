const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.static('public'));

const getFiles = (dir) => {
    return new Promise((resolve, reject) => {
        fs.readdir(dir, (err, files) => {
            if (err) reject(err);
            else resolve(files.filter(f => !f.startsWith('.')));
        });
    });
};

app.get('/api/i18n-files', async (req, res) => {
    try {
        const files = await getFiles(path.join(__dirname, 'i18n'));
        res.json(files);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/i18n/:filename', (req, res) => {
    const filepath = path.join(__dirname, 'i18n', req.params.filename);
    fs.readFile(filepath, 'utf8', (err, data) => {
        if (err) res.status(404).send('File not found');
        else res.send(data);
    });
});

app.get('/api/code-files', async (req, res) => {
    try {
        const files = await getFiles(path.join(__dirname, 'code'));
        res.json(files);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/code/:filename', (req, res) => {
    const filepath = path.join(__dirname, 'code', req.params.filename);
    fs.readFile(filepath, 'utf8', (err, data) => {
        if (err) res.status(404).send('File not found');
        else res.send(data);
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
