const express = require('express');

const multer = require('multer');

const cors = require('cors');

const path = require('path');

const fs = require('fs');

const ffmpeg = require('fluent-ffmpeg');



const app = express();

app.use(cors());

app.use(express.static('public'));



// السماح بالوصول إلى الملفات في `uploads`

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



// التأكد من وجود مجلد `uploads`

const uploadDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadDir)) {

    fs.mkdirSync(uploadDir, { recursive: true });

}



// إعداد التخزين للملفات المرفوعة

const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        cb(null, 'uploads/');

    },

    filename: (req, file, cb) => {

        cb(null, Date.now() + path.extname(file.originalname));

    }

});



const upload = multer({ storage });



// رفع الملفات وتحويلها إلى فيديو

app.post('/upload', upload.fields([{ name: 'image' }, { name: 'audio' }]), (req, res) => {

    if (!req.files || !req.files.image || !req.files.audio) {

        return res.status(400).json({ error: '❌ يجب رفع الصورة والصوت معًا' });

    }



    const imagePath = req.files.image[0].path;

    const audioPath = req.files.audio[0].path;

    const videoPath = `uploads/${Date.now()}-greeting.mp4`;



    console.log(`✅ الملفات المستلمة:\nصورة: ${imagePath}\nصوت: ${audioPath}\nفيديو: ${videoPath}`);



    // التحقق من صحة الملفات قبل معالجتها

    if (!fs.existsSync(imagePath) || !fs.existsSync(audioPath)) {

        return res.status(400).json({ error: '❌ تعذر العثور على الملفات المرفوعة.' });

    }



    ffmpeg()

        .input(imagePath)

        .loop(10)

        .input(audioPath)

        .outputOptions([

            '-c:v libx264',

            '-tune stillimage',

            '-c:a aac',

            '-b:a 192k',

            '-pix_fmt yuv420p',

            '-shortest' // تأكد من إنهاء الفيديو مع نهاية الصوت

        ])

        .save(videoPath)

        .on('end', () => {

            console.log('✅ تم إنشاء الفيديو بنجاح:', videoPath);

            res.json({ filePath: `/${videoPath}` });

        })

        .on('error', (err) => {

            console.error('❌ خطأ أثناء إنشاء الفيديو:', err);

            res.status(500).json({ error: `❌ فشل في إنشاء الفيديو: ${err.message}` });

        });

});



// تشغيل الخادم

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {

    console.log(`✅ Server running on port ${PORT}`);

});

