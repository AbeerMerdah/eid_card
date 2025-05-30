/*const express = require("express");

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

    const outputFileName = `${Date.now()}-greeting.mp4`;

    const outputVideo = path.join(uploadDir, outputFileName);



    const ffmpegCommand = `ffmpeg -loop 1 -i "${imageFile}" -i "${audioFile}" -c:v libx264 -tune stillimage -c:a aac -b:a 192k -shortest -movflags +faststart "${outputVideo}"`;



    exec(ffmpegCommand, (error) => {

        if (error) {

            console.error("FFmpeg Error:", error);

            return res.status(500).json({ error: "فشل دمج الصوت مع الصورة." });

        }

        

        // إرسال رابط الفيديو النهائي للمستخدم

        res.json({ 

            message: "تم إنشاء فيديو التهنئة بنجاح!",

            videoUrl: `https://${process.env.VERCEL_URL || "https://eid-card-9j9shvyj6-abeers-projects-cb73c349.vercel.app"}/download/${outputFileName}`

        });

    });

});



// السماح بتنزيل الفيديو عبر مسار `/download/`

app.get("/download/:filename", (req, res) => {

    const filePath = path.join(uploadDir, req.params.filename);

    if (fs.existsSync(filePath)) {

        res.download(filePath);  // هذه الميزة تفرض التحميل بدلاً من العرض

    } else {

        res.status(404).json({ error: "الملف غير موجود." });

    }

});



// تشغيل الخادم عالميًا

app.listen(PORT, "0.0.0.0", () => {

    console.log(`✅ Server running on port ${PORT}`);

});

*/


const express = require('express');

const multer = require('multer');

const ffmpeg = require('fluent-ffmpeg');

const path = require('path');

const fs = require('fs');



const app = express();

const upload = multer({ dest: 'uploads/' });



// تعريف route لاستقبال الصوت والصورة

app.post('/merge', upload.fields([{ name: 'audio' }, { name: 'image' }]), (req, res) => {

    const audioPath = req.files['audio'][0].path;

    const imagePath = req.files['image'][0].path;

    const outputPath = path.join(__dirname, 'output.mp4');



    // استخدام FFmpeg لدمج الصوت مع الصورة

    ffmpeg()

        .input(imagePath)

        .input(audioPath)

        .outputOptions('-c:v libx264')

        .outputOptions('-c:a aac')

        .output(outputPath)

        .on('end', () => {

            // إرسال الفيديو النهائي إلى العميل

            res.download(outputPath, 'video.mp4', () => {

                // حذف الملفات المؤقتة بعد الانتهاء

                fs.unlinkSync(audioPath);

                fs.unlinkSync(imagePath);

                fs.unlinkSync(outputPath);

            });

        })

        .on('error', (err) => {

            console.error("⚠️ خطأ أثناء معالجة الفيديو:", err);

            res.status(500).send("حدث خطأ أثناء معالجة الفيديو.");

        })

        .run();

});



// بدء الخادم على المنفذ المحدد (أو 3000 افتراضيًا)

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log(`الخادم يعمل على http://localhost:${PORT}`);

});

