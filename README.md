# 😷 Real-Time AI Face Mask Detector by Udara Dissanayake

A lightweight, real-time AI-powered web application that detects whether a person is wearing a face mask using their device camera. Built using vanilla JavaScript, HTML5, CSS3, and TensorFlow.js (BlazeFace model).

---

## 🚀 Live Demo

Check out the live web app:  
👉 **[https://udara16.github.io/Face-Mask-Detection-Web-Application/)** 

---

## ✨ Features

- **Real-Time Detection:** Live face and mask tracking directly inside the web browser.
- **Privacy-First (Client-Side Processing):** All AI processing happens locally on your device via WebAssembly/WebGL. No video feeds are sent to any server.
- **Cross-Platform:** Works on both mobile devices (Android/iOS) and desktop browsers.
- **Zero Server Setup:** Runs seamlessly via GitHub Pages.

---

## 🛠️ Built With

- **HTML5 & CSS3** - Responsive user interface and styling
- **JavaScript (ES6+)** - MediaStream API and canvas rendering
- **[TensorFlow.js](https://www.tensorflow.org/js)** - High-performance browser-based machine learning
- **[BlazeFace Model](https://github.com/tensorflow/tfjs-models/tree/master/blazeface)** - Lightweight face detection model

---

## 💻 How It Works

1. **Camera Stream:** The app accesses the front-facing webcam using standard HTML5 `navigator.mediaDevices.getUserMedia`.
2. **Face & Landmark Extraction:** TensorFlow.js uses BlazeFace to identify facial coordinates (eyes, nose, mouth).
3. **Mask Inference:** The application analyzes facial landmark contrast and relative positioning on the `<canvas>` element to determine mask coverage.
4. **Visual Feedback:** A dynamic bounding box (Green for Mask, Red for No Mask) renders in real-time.

---

## ⚙️ Local Setup

If you want to run this project locally:

1. Clone the repository:
   ```bash
   git clone [https://github.com/udara16/](https://github.com/udara16/)<your-repo-name>.git
2. Navigate to the project directory:
   Bash
cd <your-repo-name>

3. Open index.html using a local development server (such as VS Code Live Server or Python HTTP server):
   Bash
cd <your-repo-name>

4. Visit http://localhost:8000 in your web browser.

5. 📄 License
   Distributed under the MIT License. Feel free to use and modify for personal or educational projects.
