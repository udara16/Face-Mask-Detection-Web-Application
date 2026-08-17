const URL = "https://teachablemachine.withgoogle.com/models/o8JgqH1lU/";

let model, video, canvas, ctx, labelContainer, maxPredictions;
let isPredicting = false;

async function init() {
    const startBtn = document.getElementById("start-btn");
    const statusText = document.getElementById("status");
    
    startBtn.disabled = true;
    statusText.innerText = "කැමරාව ආරම්භ වෙමින් පවතී...";

    video = document.getElementById("webcam");
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");

    try {
        // 1. Mobile & Desktop Camera Stream
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
                facingMode: "user",
                width: { ideal: 260 },
                height: { ideal: 260 }
            }
        });

        video.srcObject = stream;

        await new Promise((resolve) => {
            video.onloadedmetadata = () => {
                video.play();
                resolve();
            };
        });

        statusText.innerText = "AI Model එක Load වෙමින් පවතී...";

        // 2. AI Model Load කිරීම
        const modelURL = URL + "model.json";
        const metadataURL = URL + "metadata.json";
        
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();

        // 3. UI Labels සකස් කිරීම
        labelContainer = document.getElementById("label-container");
        labelContainer.innerHTML = "";
        for (let i = 0; i < maxPredictions; i++) {
            labelContainer.appendChild(document.createElement("div"));
        }

        statusText.innerText = "සජීවීව ක්‍රියාත්මකයි!";
        startBtn.style.display = "none";

        isPredicting = true;
        predictLoop();

    } catch (err) {
        console.error(err);
        statusText.innerText = "";
        startBtn.disabled = false;
        alert("දෝෂය: " + err.name + " - " + err.message);
    }
}

async function predictLoop() {
    if (!isPredicting) return;
    
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
        // Video එක Canvas එකකට ඇඳ එය AI එකට යැවීම
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const prediction = await model.predict(canvas);

        for (let i = 0; i < maxPredictions; i++) {
            const className = prediction[i].className;
            const probability = (prediction[i].probability * 100).toFixed(0);

            let color = "#333";
            if (className.toLowerCase().includes("mask") && probability > 70) {
                color = "#28a745";
            } else if (probability > 70) {
                color = "#dc3545";
            }

            labelContainer.childNodes[i].innerHTML = `
                <div class="result-tag" style="color: ${color}; font-weight: bold; margin: 6px 0; font-size: 16px;">
                    ${className}: ${probability}%
                </div>
            `;
        }
    }

    window.requestAnimationFrame(predictLoop);
}
