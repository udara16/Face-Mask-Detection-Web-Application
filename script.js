const URL = "https://teachablemachine.withgoogle.com/models/o8JgqH1lU/";

let model, videoElement, labelContainer, maxPredictions;
let isRunning = false;

async function init() {
    const startBtn = document.getElementById("start-btn");
    startBtn.disabled = true;
    startBtn.innerText = "පූරණය වෙමින් පවතී...";

    try {
        const modelURL = URL + "model.json";
        const metadataURL = URL + "metadata.json";

        // AI Model Load කිරීම
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();

        videoElement = document.getElementById("webcam");

        // Mobile සහ Browser standard video stream එක ලබා ගැනීම
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: "user",
                width: { ideal: 250 },
                height: { ideal: 250 }
            },
            audio: false
        });

        videoElement.srcObject = stream;

        // Video එක Play වන තෙක් බලා සිටීම
        await new Promise((resolve) => {
            videoElement.onloadedmetadata = () => {
                videoElement.play();
                resolve();
            };
        });

        labelContainer = document.getElementById("label-container");
        labelContainer.innerHTML = "";
        for (let i = 0; i < maxPredictions; i++) {
            labelContainer.appendChild(document.createElement("div"));
        }

        isRunning = true;
        startBtn.innerText = "කැමරාව ක්‍රියාත්මකයි";
        predictLoop();

    } catch (error) {
        console.error("Camera Error:", error);
        startBtn.disabled = false;
        startBtn.innerText = "නැවත උත්සාහ කරන්න";
        alert("කැමරා දෝෂයකි: " + error.name + " - " + error.message);
    }
}

async function predictLoop() {
    if (!isRunning) return;
    await predict();
    window.requestAnimationFrame(predictLoop);
}

async function predict() {
    if (!videoElement || videoElement.readyState !== 4) return;

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
