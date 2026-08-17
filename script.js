let model = null;
let video, canvas, ctx;
let isPredicting = false;

document.addEventListener("DOMContentLoaded", () => {
    const startBtn = document.getElementById("start-btn");
    startBtn.addEventListener("click", startApp);
});

async function startApp() {
    const startBtn = document.getElementById("start-btn");
    const statusText = document.getElementById("status");

    startBtn.disabled = true;
    statusText.innerText = "කැමරාව ඉල්ලුම් කරමින් පවතී...";

    video = document.getElementById("webcam");
    canvas = document.getElementById("overlay-canvas");
    ctx = canvas.getContext("2d");

    try {
        // 1. කැමරාව Request කිරීම
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
                facingMode: "user",
                width: { ideal: 280 },
                height: { ideal: 280 }
            }
        });

        video.srcObject = stream;
        await video.play();

        statusText.innerText = "AI Model එක Load වෙමින් පවතී...";

        // 2. BlazeFace Model එක පූරණය කිරීම
        if (typeof blazeface === "undefined") {
            throw new Error("AI Library load වී නොමැත. කරුණාකර Internet Connection පරීක්ෂා කරන්න.");
        }
        
        model = await blazeface.load();

        statusText.innerText = "සක්‍රියයි - මුහුණ හඳුනාගනිමින්...";
        startBtn.style.display = "none";

        isPredicting = true;
        detectFace();

    } catch (err) {
        console.error(err);
        statusText.innerText = "දෝෂයකි: " + err.message;
        startBtn.disabled = false;
        alert("දෝෂය: " + err.message);
    }
}

async function detectFace() {
    if (!isPredicting) return;

    if (video.readyState >= 2 && model) {
        const predictions = await model.estimateFaces(video, false);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const labelContainer = document.getElementById("label-container");

        if (predictions.length > 0) {
            for (let i = 0; i < predictions.length; i++) {
                const start = predictions[i].topLeft;
                const end = predictions[i].bottomRight;
                const size = [end[0] - start[0], end[1] - start[1]];

                const landmarks = predictions[i].landmarks;
                const nose = landmarks[2];
                const mouth = landmarks[3];

                let isMaskOn = false;
                if (mouth && nose) {
                    const diff = Math.abs(mouth[1] - nose[1]);
                    if (diff < 18) {
                        isMaskOn = true;
                    }
                }

                const color = isMaskOn ? "#28a745" : "#dc3545";
                ctx.strokeStyle = color;
                ctx.lineWidth = 4;
                ctx.strokeRect(start[0], start[1], size[0], size[1]);

                labelContainer.innerHTML = `
                    <div class="result-tag" style="background-color: ${isMaskOn ? '#d4edda' : '#f8d7da'}; color: ${color}; font-weight: bold; padding: 10px; margin-top: 10px; border-radius: 6px;">
                        ${isMaskOn ? "Mask පැළඳ ඇත (Mask Detected)" : "Mask පැළඳ නොමැත (No Mask)"}
                    </div>
                `;
            }
        } else {
            labelContainer.innerHTML = `
                <div class="result-tag" style="background-color: #fff3cd; color: #856404; font-weight: bold; padding: 10px; margin-top: 10px; border-radius: 6px;">
                    මුහුණක් හඳුනාගත නොහැකි විය
                </div>
            `;
        }
    }

    window.requestAnimationFrame(detectFace);
}
