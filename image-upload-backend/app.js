require('dotenv').config();
const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT;

const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');


app.use(express.json(), cors());


// ==================== AWS ==========================

const s3 = new aws.S3({
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_KEY,
  region: process.env.S3_BUCKET_REGION,
});

const upload = (bucketName) => multer({
  storage: multerS3({ 
    s3,
    bucket: bucketName,
    contentType: (req, file, cb) => {
      cb(null, file.mimetype);
    },
    key: (req, file, cb) => {
      cb(null, `${file.originalname.split('.')[0]}-${Date.now()}.${file.originalname.split('.').pop()}`);
    } 
  })
});


// ============================Route=================================

app.post("/upload", (req, res) => {
  const uploadSingle = upload(process.env.S3_BUCKET_NAME).single('image');             // 'gg-tester-bucket'
  uploadSingle(req, res, err => {
    if(err) return res.status(400).json({success: false, err: err.message});
    console.log(req.file);
    return res.status(200).json({success: true, fileName: req.file.key, url: req.file.location});
  });
});

app.get("/", (req, res) => res.status(200).send('heroku is connected...'));

// =============================================================

app.listen(PORT, () => console.log(`Server running on PORT: ${PORT} 🔥`));
