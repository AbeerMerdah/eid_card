document.getElementById("recordButton").addEventListener("click", startRecording);

document.getElementById("stopButton").addEventListener("click", stopRecording);

document.getElementById("uploadButton").addEventListener("click", uploadFiles);

document.getElementById("saveButton").addEventListener("click", saveToCameraRoll);



let mediaRecorder;

let audioChunks = [];



function startRecording() {

    navigator.mediaDevices.getUserMedia({ audio: true })

        .then(stream => {

            mediaRecorder = new MediaRecorder(stream);

            mediaRecorder.start();

            audioChunks = [];



            mediaRecorder.addEventListener("dataavailable", event => {

                audioChunks.push(event.data);

            });



            document.getElementById("recordButton").disabled = true;

            document.getElementById("stopButton").disabled = false;

        })

        .catch(error => {

            console.error("خطأ أثناء تسجيل الصوت:", error);

            alert("تعذر الوصول إلى الميكروفون. تأكد من إعطاء الإذن.");

        });

}



function stopRecording() {

    if (mediaRecorder) {

        mediaRecorder.stop();

        mediaRecorder.addEventListener("stop", () => {

            const audioBlob = new Blob(audioChunks, { type: "audio/mp3" });

            const audioFile = new File([audioBlob], "audio.mp3", { type: "audio/mp3" });



            // ربط الصوت بحقل الإدخال المخفي

            document.getElementById("audioInput").files = createFileList(audioFile);

        });



        document.getElementById("recordButton").disabled = false;

        document.getElementById("stopButton").disabled = true;

    }

}



function createFileList(file) {

    const dataTransfer = new DataTransfer();

    dataTransfer.items.add(file);

    return dataTransfer.files;

}



async function uploadFiles() {

    const imageFile = document.getElementById("imageInput").files[0];

    const audioFile = document.getElementById("audioInput").files[0];



    if (!imageFile || !audioFile) {

        alert("يرجى تحديد صورة وتسجيل الصوت قبل الرفع.");

        return;

    }



    const formData = new FormData();

    formData.append("image", imageFile);

    formData.append("audio", audioFile);



    try {

        const response = await fetch("https://eid-card-9j9shvyj6-abeers-projects-cb73c349.vercel.app/upload", {

            method: "POST",

            body: formData

        });



        const result = await response.json();

        if (response.ok) {

            const videoUrl = `https://eid-card-9j9shvyj6-abeers-projects-cb73c349.vercel.app${result.videoUrl}`;

            const videoElement = document.getElementById("videoPlayer");

            videoElement.src = videoUrl;

            videoElement.style.display = "block";



            // إظهار زر الحفظ بعد نجاح العملية

            document.getElementById("saveButton").style.display = "block";

            document.getElementById("saveButton").setAttribute("data-url", videoUrl);

        } else {

            alert("حدث خطأ أثناء رفع الملفات.");

        }

    } catch (error) {

        console.error("خطأ:", error);

        alert("تعذر الاتصال بالخادم.");

    }

}



function saveToCameraRoll() {

    const videoUrl = document.getElementById("saveButton").getAttribute("data-url");

    if (!videoUrl) {

        alert("لا يوجد فيديو لحفظه!");

        return;

    }



    const a = document.createElement("a");

    a.href = videoUrl;

    a.download = "eid_greeting.mp4";

    document.body.appendChild(a);

    a.click();

    document.body.removeChild(a);



    alert("تم حفظ الفيديو! يمكنك العثور عليه في التنزيلات أو ألبوم الكاميرا.");

}



