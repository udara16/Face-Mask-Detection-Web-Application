const URL = "https://teachablemachine.withgoogle.com/models/o8JgqH1lU/";

let model, webcam, labelContainer, maxPredictions;

async function init() {
    const startBtn = document.getElementById("start-btn");
    startBtn.disabled = true;
    startBtn.innerText = "පූරණය වෙමින් පවතී...";

    try {
        const modelURL = URL + "model.json";
        const metadataURL = URL + "metadata.json";

        // AI Model load කිරීම
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();

        // Webcam සකස් කිරීම
        const flip = true;
        webcam = new tmImage.Webcam(300, 300, flip);
        
        // කැමරා අවසර ලබා ගැනීම
        await webcam.setup();
        await webcam.play();
        window.requestAnimationFrame(loop);

        // Canvas එක DOM එකට එක් කිරීම
        const webcamContainer = document.getElementById("webcam-container");
        webcamContainer.innerHTML = ""; // කලින් තිබූ දෑ ඉවත් කිරීම
        webcamContainer.appendChild(webcam.canvas);

        labelContainer = document.getElementById("label-container");
        labelContainer.innerHTML = "";
        for (let i = 0; i < maxPredictions; i++) {
            labelContainer.appendChild(document.createElement("div"));
        }
        
        startBtn.innerText = "කැමරාව ක්‍රියාත්මකයි";
    } catch (error) {
        console.error("Camera Error:", error);
        startBtn.disabled = false;
        startBtn.innerText = "නැවත උත්සාහ කරන්න";
        alert("කැමරාව ලබා ගැනීමට නොහැකි විය. කරුණාකර Browser Camera Permission පරීක්ෂා කරන්න.");
    }
}

async function loop() {
    webcam.update();
    await predict();
    window.requestAnimationFrame(loop);
}

async function predict() {
    const prediction = await model.predict(webcam.canvas);
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
            <div class="result-tag" style="color: ${color};">
                ${className}: ${probability}%
            </div>
        `;
    }
}
