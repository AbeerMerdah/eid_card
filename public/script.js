
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



    const response = await fetch("https://eid-card-9j9shvyj6-abeers-projects-cb73c349.vercel.app/upload", {

        method: "POST",

        body: formData

    });



    const result = await response.json();

    if (response.ok) {

        const videoUrl = `https://eid-card-9j9shvyj6-abeers-projects-cb73c349.vercel.app/${result.videoUrl}`;

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