const URL = "https://teachablemachine.withgoogle.com/models/o8JgqH1lU/";

let model, videoElement, labelContainer, maxPredictions;
let isRunning = false;

async function init() {
    const startBtn = document.getElementById("start-btn");
    startBtn.disabled = true;
    startBtn.innerText = "කැමරාව සක්‍රිය වෙමින්...";

    videoElement = document.getElementById("webcam");

    try {
        // 1. කැමරාව මුලින්ම Open කර ගැනීම
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user" },
            audio: false
        });
        
        videoElement.srcObject = stream;
        await videoElement.play();

        startBtn.innerText = "AI Model එක Load වෙමින්...";

        // 2. AI Model එක පූරණය කිරීම
        const modelURL = URL + "model.json";
        const metadataURL = URL + "metadata.json";
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();

        labelContainer = document.getElementById("label-container");
        labelContainer.innerHTML = "";
        for (let i = 0; i < maxPredictions; i++) {
            labelContainer.appendChild(document.createElement("div"));
        }

        isRunning = true;
        startBtn.innerText = "සාර්ථකයි - පරීක්ෂා කෙරේ";
        predictLoop();

    } catch (error) {
        console.error("Camera Error:", error);
        startBtn.disabled = false;
        startBtn.innerText = "නැවත උත්සාහ කරන්න";
        alert("දෝෂය: " + error.name + " (" + error.message + ")");
    }
}

async function predictLoop() {
    if (!isRunning) return;
    await predict();
    window.requestAnimationFrame(predictLoop);
}

async function predict() {
    if (!videoElement || videoElement.readyState < 2) return;

    const prediction = await model.predict(videoElement);
    for (let i = 0; i < maxPredictions; i++) {
        const className = prediction[i].className;
        const probability = (prediction[i].probability * 100).toFixed(0);
        
        let color = "#333";
        if (className.toLowerCase().includes("mask") && probability > 70) {
            color = "green";
        } else if (probability > 70) {
            color = "red";
        }

        labelContainer.childNodes[i].innerHTML = `
            <div class="result-tag" style="color: ${color}; font-weight: bold; margin: 6px 0;">
                ${className}: ${probability}%
            </div>
        `;
    }
}
