const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../server_python/docs'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Helper function to delete all files in a directory
const clearDirectory = (directory) => {
  return new Promise((resolve, reject) => {
    fs.readdir(directory, (err, files) => {
      if (err) return reject(err);

      const unlinkPromises = files.map(file => {
        return new Promise((res, rej) => {
          fs.unlink(path.join(directory, file), (err) => {
            if (err) return rej(err);
            res();
          });
        });
      });

      Promise.all(unlinkPromises)
        .then(resolve)
        .catch(reject);
    });
  });
};

router.post('/upload', async (req, res) => {
  const uploadDir = path.join(__dirname, '../../server_python/docs');

  try {
    // Clear existing files
    await clearDirectory(uploadDir);

    // Upload new files
    upload.array('pdfs')(req, res, (err) => {
      if (err) {
        console.error('Error uploading files:', err);
        return res.status(500).send({ message: 'Failed to upload files' });
      }
      if (!req.files || req.files.length === 0) {
        return res.status(400).send({ message: 'No files uploaded' });
      }
      res.send({ message: 'PDF(s) uploaded successfully', files: req.files });
    });
  } catch (error) {
    console.error('Error clearing directory:', error);
    res.status(500).send({ message: 'Failed to clear existing files' });
  }
});

router.delete('/delete', (req, res) => {
  const { fileName } = req.body;
  const filePath = path.join(__dirname, '../../server_python/docs', fileName);

  fs.unlink(filePath, (err) => {
    if (err) {
      console.error('Error deleting file:', err);
      return res.status(500).send({ message: 'Failed to delete file' });
    }
    res.send({ message: 'File deleted successfully' });
  });
});

module.exports = router;
