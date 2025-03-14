let mediaRecorder;

let audioChunks = [];

let imageFile;



document.getElementById('imageInput').addEventListener('change', function(event) {

    imageFile = event.target.files[0];

    const reader = new FileReader();

    reader.onload = function(e) {

        const img = document.getElementById('preview');

        img.src = e.target.result;

        img.style.display = 'block';

        checkIfReadyToSave(); // تفعيل زر الحفظ إذا كانت الصورة والصوت جاهزين

    };

    reader.readAsDataURL(imageFile);

});



async function startRecording() {

    try {

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.start();

        document.getElementById("stopBtn").disabled = false;

        audioChunks = [];



        mediaRecorder.ondataavailable = event => {

            audioChunks.push(event.data);

        };



        mediaRecorder.onstop = () => {

            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });

            const audioUrl = URL.createObjectURL(audioBlob);

            document.getElementById("audioPlayback").src = audioUrl;

            document.getElementById("audioPlayback").style.display = "block";

            checkIfReadyToSave(); // تفعيل زر الحفظ بعد التسجيل

        };

    } catch (error) {

        alert("⚠️ تعذر الوصول إلى الميكروفون. تأكد من السماح بالوصول إلى الصوت.");

    }

}



function stopRecording() {

    mediaRecorder.stop();

    document.getElementById("stopBtn").disabled = true;

}



// تفعيل زر الحفظ بعد رفع صورة وتسجيل صوت

function checkIfReadyToSave() {

    if (document.getElementById('imageInput').files.length > 0 && audioChunks.length > 0) {

        document.getElementById("saveBtn").style.display = "inline";

    }

}



// رفع الملفات إلى الخادم وإنشاء الفيديو

async function uploadFiles() {

    const imageInput = document.getElementById('imageInput');

    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });



    if (!imageInput.files[0] || audioChunks.length === 0) {

        alert('❌ يرجى اختيار صورة وتسجيل صوت التهنئة أولًا');

        return;

    }



    const formData = new FormData();

    formData.append('image', imageInput.files[0]);

    formData.append('audio', audioBlob, 'audio.wav');



    document.getElementById("saveBtn").innerText = "⏳ جارٍ إنشاء الفيديو...";

    document.getElementById("saveBtn").disabled = true;



    try {

        const response = await fetch('http://localhost:3000/upload', {

            method: 'POST',

            body: formData

        });



        const result = await response.json();

        if (result.filePath) {

            // ✅ تحميل الفيديو تلقائيًا عند إنشائه

            const a = document.createElement('a');

            a.href = result.filePath;

            a.download = 'eid_greeting.mp4'; // اسم الملف عند الحفظ

            document.body.appendChild(a);

            a.click();

            document.body.removeChild(a);

        } else {

            alert('❌ حدث خطأ أثناء حفظ الفيديو');

        }

    } catch (error) {

        alert('❌ تعذر الاتصال بالخادم، تأكد من تشغيله.');

    } finally {

        document.getElementById("saveBtn").innerText = "🎥 حفظ التهنئة كفيديو";

        document.getElementById("saveBtn").disabled = false;

    }

}

