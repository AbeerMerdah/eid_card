const express = require("express");

const cors = require("cors");

const multer = require("multer");

const path = require("path");

const fs = require("fs");

const { exec } = require("child_process");



const app = express();

const PORT = process.env.PORT || 3000;



// السماح بالاتصال من جميع الأجهزة

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));



const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {

    fs.mkdirSync(uploadDir, { recursive: true });

}



// إعداد `Multer` لتخزين الملفات

const storage = multer.diskStorage({

    destination: uploadDir,

    filename: (req, file, cb) => {

        cb(null, Date.now() + "-" + file.originalname);

    }

});

const upload = multer({ storage });



// نقطة رفع الملفات

app.post("/upload", upload.fields([{ name: "image" }, { name: "audio" }]), (req, res) => {

    if (!req.files || !req.files.image || !req.files.audio) {

        return res.status(400).json({ error: "يرجى رفع الصورة والصوت معًا." });

    }



    const imageFile = req.files.image[0].path;

    const audioFile = req.files.audio[0].path;

    const outputVideo = path.join(uploadDir, `${Date.now()}-greeting.mp4`);



    const ffmpegCommand = `ffmpeg -loop 1 -i ${imageFile} -i ${audioFile} -c:v libx264 -tune stillimage -c:a aac -b:a 192k -shortest ${outputVideo}`;

    

    exec(ffmpegCommand, (error) => {

        if (error) {

            return res.status(500).json({ error: "فشل دمج الصوت مع الصورة." });

        }

        res.json({ message: "تم إنشاء فيديو التهنئة!", videoUrl: `/uploads/${path.basename(outputVideo)}` });

    });

});



// السماح للمستخدمين بتحميل الفيديو

app.get("/uploads/:filename", (req, res) => {

    const filePath = path.join(uploadDir, req.params.filename);

    if (fs.existsSync(filePath)) {

        res.sendFile(filePath);

    } else {

        res.status(404).json({ error: "الملف غير موجود." });

    }

});



// تشغيل الخادم عالميًا

app.listen(PORT, "0.0.0.0", () => {

    console.log(`✅ Server running on port ${PORT}`);

});

