// Google Teachable Machine හරහා පුහුණු කරන ලද පෙරනිමි Mask Detection Model එකක්
const URL = "https://teachablemachine.withgoogle.com/models/o8JgqH1lU/";

let model, webcam, labelContainer, maxPredictions;

async function init() {
    const startBtn = document.getElementById("start-btn");
    startBtn.disabled = true;
    startBtn.innerText = "පූරණය වෙමින් පවතී...";

    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    // AI Model එක load කිරීම
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    // Webcam එක සකස් කිරීම
    const flip = true; 
    webcam = new tmImage.Webcam(300, 300, flip);
    await webcam.setup();
    await webcam.play();
    window.requestAnimationFrame(loop);

    // Canvas එක DOM එකට එක් කිරීම
    document.getElementById("webcam-container").appendChild(webcam.canvas);
    labelContainer = document.getElementById("label-container");
    for (let i = 0; i < maxPredictions; i++) {
        labelContainer.appendChild(document.createElement("div"));
    }
    
    startBtn.innerText = "කැමරාව ක්‍රියාත්මකයි";
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
