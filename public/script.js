const express = require("express");

const cors = require("cors");

const multer = require("multer");

const path = require("path");

const fs = require("fs");

const { exec } = require("child_process");



const app = express();

const PORT = process.env.PORT || 3000;



app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));



const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {

    fs.mkdirSync(uploadDir, { recursive: true });

}



const storage = multer.diskStorage({

    destination: uploadDir,

    filename: (req, file, cb) => {

        cb(null, Date.now() + "-" + file.originalname);

    }

});

const upload = multer({ storage });



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



app.get("/uploads/:filename", (req, res) => {

    const filePath = path.join(uploadDir, req.params.filename);

    if (fs.existsSync(filePath)) {

        res.sendFile(filePath);

    } else {

        res.status(404).json({ error: "الملف غير موجود." });

    }

});



app.listen(PORT, "0.0.0.0", () => {

    console.log(`✅ Server running on port ${PORT}`);

});







document.getElementById("recordButton").addEventListener("click", startRecording);

document.getElementById("stopButton").addEventListener("click", stopRecording);

document.getElementById("uploadButton").addEventListener("click", uploadFiles);

document.getElementById("saveButton").addEventListener("click", saveVideo);



let mediaRecorder;

let audioChunks = [];



function startRecording() {

    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {

        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.start();

        audioChunks = [];



        mediaRecorder.addEventListener("dataavailable", event => {

            audioChunks.push(event.data);

        });

    });

}



function stopRecording() {

    mediaRecorder.stop();

    mediaRecorder.addEventListener("stop", () => {

        const audioBlob = new Blob(audioChunks, { type: "audio/mp3" });

        const audioFile = new File([audioBlob], "audio.mp3", { type: "audio/mp3" });

        document.getElementById("audioInput").files = createFileList(audioFile);

    });

}



function createFileList(file) {

    const dataTransfer = new DataTransfer();

    dataTransfer.items.add(file);

    return dataTransfer.files;

}



async function uploadFiles() {

    const formData = new FormData();

    formData.append("image", document.getElementById("imageInput").files[0]);

    formData.append("audio", document.getElementById("audioInput").files[0]);



    const response = await fetch("eid-card-9j9shvyj6-abeers-projects-cb73c349.vercel.app/upload", {

        method: "POST",

        body: formData

    });



    const result = await response.json();

    if (response.ok) {

        const videoUrl = `eid-card-9j9shvyj6-abeers-projects-cb73c349.vercel.app${result.videoUrl}`;

        const videoElement = document.getElementById("videoPlayer");

        videoElement.src = videoUrl;

        videoElement.style.display = "block";



        document.getElementById("saveButton").style.display = "block";

        document.getElementById("saveButton").setAttribute("data-url", videoUrl);

    }

}



function saveVideo() {

    const videoUrl = document.getElementById("saveButton").getAttribute("data-url");

    const a = document.createElement("a");

    a.href = videoUrl;

    a.download = "eid_greeting.mp4";

    document.body.appendChild(a);

    a.click();

    document.body.removeChild(a);

}

