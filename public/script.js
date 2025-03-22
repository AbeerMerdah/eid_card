let mediaRecorder;

let audioChunks = [];

let audioBlob;

let audioUrl;

let imageFile;



// ⏺️ بدء تسجيل الصوت

document.getElementById('start-recording').addEventListener('click', async () => {

    try {

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });

        audioChunks = [];



        mediaRecorder.ondataavailable = event => {

            audioChunks.push(event.data);

        };



        mediaRecorder.start();



        document.getElementById('start-recording').disabled = true;

        document.getElementById('stop-recording').disabled = false;



    } catch (error) {

        console.error("⚠️ خطأ في تشغيل الميكروفون:", error);

        alert("يرجى السماح بالوصول إلى الميكروفون.");

    }

});



// ⏹️ إيقاف تسجيل الصوت

document.getElementById('stop-recording').addEventListener('click', () => {

    if (mediaRecorder) {

        mediaRecorder.stop();

        mediaRecorder.onstop = () => {

            audioBlob = new Blob(audioChunks, { type: 'audio/webm' });

            audioUrl = URL.createObjectURL(audioBlob);



            const audioElement = document.getElementById('audio');

            audioElement.src = audioUrl;

            audioElement.style.display = 'block';



            const previewAudio = document.getElementById('preview-audio');

            previewAudio.src = audioUrl;

            previewAudio.style.display = 'block';

        };

    }



    document.getElementById('start-recording').disabled = false;

    document.getElementById('stop-recording').disabled = true;

});



// 📷 تحميل الصورة

document.getElementById('upload-image').addEventListener('click', () => {

    const imageInput = document.getElementById('image-upload');

    const previewImage = document.getElementById('preview-image');

    const saveButton = document.getElementById('save-to-camera-roll');



    if (imageInput.files.length > 0) {

        imageFile = imageInput.files[0];

        const reader = new FileReader();



        reader.onload = function(event) {

            previewImage.src = event.target.result;

            previewImage.style.display = 'block';

            saveButton.style.display = 'block';

        };



        reader.readAsDataURL(imageFile);

    } else {

        alert("⚠️ يرجى تحميل صورة.");

    }

});



// 🎥 إنشاء الفيديو

document.getElementById('save-to-camera-roll').addEventListener('click', async () => {

    if (!audioBlob || !imageFile) {

        alert("⚠️ يرجى تسجيل الصوت وتحميل صورة أولًا.");

        return;

    }



    const canvas = document.createElement('canvas');

    const context = canvas.getContext('2d');

    const image = new Image();

    const audio = new Audio(audioUrl);



    image.src = URL.createObjectURL(imageFile);

    await new Promise((resolve) => (image.onload = resolve));



    canvas.width = image.width;

    canvas.height = image.height;

    context.drawImage(image, 0, 0);



    const stream = canvas.captureStream(30);

    const videoRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });

    const videoChunks = [];



    videoRecorder.ondataavailable = event => {

        videoChunks.push(event.data);

    };



    videoRecorder.start();

    audio.play();



    audio.onended = () => {

        videoRecorder.stop();

        videoRecorder.onstop = async () => {

            const videoBlob = new Blob(videoChunks, { type: 'video/webm' });



            // تحويل الفيديو إلى MP4

            const finalVideoBlob = await convertWebMToMP4(videoBlob);

            const videoUrl = URL.createObjectURL(finalVideoBlob);



            // عرض الفيديو بعد إنشائه

            const previewVideo = document.createElement('video');

            previewVideo.src = videoUrl;

            previewVideo.controls = true;

            previewVideo.style.width = '100%';

            previewVideo.style.marginTop = '10px';



            // زر التنزيل

            const downloadButton = document.createElement('a');

            downloadButton.href = videoUrl;

            downloadButton.download = 'eid_greeting_card.mp4';

            downloadButton.textContent = '📥 تنزيل الفيديو';

            downloadButton.style.display = 'block';

            downloadButton.style.background = '#4CAF50';

            downloadButton.style.color = 'white';

            downloadButton.style.padding = '10px';

            downloadButton.style.marginTop = '10px';

            downloadButton.style.textAlign = 'center';

            downloadButton.style.borderRadius = '5px';

            downloadButton.style.textDecoration = 'none';



            document.querySelector('.preview-section').appendChild(previewVideo);

            document.querySelector('.preview-section').appendChild(downloadButton);



            alert("🎉 تم إنشاء الفيديو بنجاح!");

        };

    };

});



// **📌 تحويل WebM إلى MP4**

async function convertWebMToMP4(videoBlob) {

    return new Promise(resolve => {

        const reader = new FileReader();

        reader.readAsArrayBuffer(videoBlob);

        reader.onload = async () => {

            const buffer = new Uint8Array(reader.result);

            const finalBlob = new Blob([buffer], { type: 'video/mp4' });

            resolve(finalBlob);

        };

    });

}

