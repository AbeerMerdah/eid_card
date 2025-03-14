const express = require('express');

const cors = require('cors');

const multer = require('multer');

const path = require('path');



const app = express();

const PORT = process.env.PORT || 3000;



// تفعيل CORS للسماح بالاتصالات بين `Frontend` و `Backend`

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));



// تهيئة المجلد الذي سيتم حفظ الصور فيه

const storage = multer.diskStorage({

    destination: "uploads/",

    filename: (req, file, cb) => {

        cb(null, file.originalname);

    }

});

const upload = multer({ storage });



// توفير نقطة وصول للصفحة الرئيسية

app.get("/", (req, res) => {

    res.sendFile(path.join(__dirname, "public", "index.html"));

});



// نقطة رفع الصور

app.post("/upload", upload.single("file"), (req, res) => {

    res.json({ message: "تم رفع الملف بنجاح!", file: req.file });

});



// تشغيل السيرفر

app.listen(PORT, '0.0.0.0', () => {

    console.log(`✅ Server running on port ${PORT}`);

});

