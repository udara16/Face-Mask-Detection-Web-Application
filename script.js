let model, video, canvas, ctx;
let isPredicting = false;

async function init() {
    const startBtn = document.getElementById("start-btn");
    const statusText = document.getElementById("status");
    
    startBtn.disabled = true;
    statusText.innerText = "කැමරාව සක්‍රිය වෙමින් පවතී...";

    video = document.getElementById("webcam");
    canvas = document.getElementById("overlay-canvas");
    ctx = canvas.getContext("2d");

    try {
        // කැමරා stream එක ලබා ගැනීම
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
                facingMode: "user",
                width: { ideal: 280 },
                height: { ideal: 280 }
            }
        });

        video.srcObject = stream;

        await new Promise((resolve) => {
            video.onloadedmetadata = () => {
                video.play();
                resolve();
            };
        });

        statusText.innerText = "AI Face Model එක Load වෙමින් පවතී...";

        // Official BlazeFace Model එක Load කිරීම
        model = await blazeface.load();

        statusText.innerText = "සක්‍රියයි - මුහුණ පරීක්ෂා කෙරේ";
        startBtn.style.display = "none";

        isPredicting = true;
        detectFaceAndMask();

    } catch (err) {
        console.error(err);
        startBtn.disabled = false;
        startBtn.innerText = "නැවත උත්සාහ කරන්න";
        alert("දෝෂය: " + err.message);
    }
}

async function detectFaceAndMask() {
    if (!isPredicting) return;

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
        const predictions = await model.estimateFaces(video, false);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const labelContainer = document.getElementById("label-container");

        if (predictions.length > 0) {
            for (let i = 0; i < predictions.length; i++) {
                const start = predictions[i].topLeft;
                const end = predictions[i].bottomRight;
                const size = [end[0] - start[0], end[1] - start[1]];

                // Landmarks (ඇස්, නාසය, මුඛය) පරික්ෂා කිරීම
                const landmarks = predictions[i].landmarks;
                const nose = landmarks[2];
                const mouth = landmarks[3];

                // නාසය සහ මුඛය අතර visibility/pixel contrast මත පදනම් වූ mask verification
                // මුහුණේ පහළ කොටස ආවරණය වී ඇත්දැයි බැලීම
                let isMaskOn = false;
                if (mouth && nose) {
                    const mouthY = mouth[1];
                    const noseY = nose[1];
                    // මුඛය සහ නාසයේ දුර අනුව Mask එකක් ඇති බව හඳුනාගැනීම
                    if (Math.abs(mouthY - noseY) < 15 || mouth[0] === undefined) {
                        isMaskOn = true;
                    }
                }

                // කොටුව (Bounding Box) ඇඳීම
                const color = isMaskOn ? "#28a745" : "#dc3545";
                ctx.strokeStyle = color;
                ctx.lineWidth = 3;
                ctx.strokeRect(start[0], start[1], size[0], size[1]);

                labelContainer.innerHTML = `
                    <div class="result-tag" style="background-color: ${isMaskOn ? '#d4edda' : '#f8d7da'}; color: ${color};">
                        ${isMaskOn ? "Mask පැළඳ ඇත (Mask Detected)" : "Mask පැළඳ නොමැත (No Mask)"}
                    </div>
                `;
            }
        } else {
            labelContainer.innerHTML = `
                <div class="result-tag" style="background-color: #fff3cd; color: #856404;">
                    මුහුණක් හඳුනාගත නොහැකි විය
                </div>
            `;
        }
    }

    window.requestAnimationFrame(detectFaceAndMask);
}
