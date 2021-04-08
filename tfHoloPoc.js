var net;
var webcamElement;

async function captureImage() {
    const img = tf.browser.fromPixels(webcamElement);
    const normalizedImg =
        tf.tidy(() => img.expandDims(0).toFloat().div(127).sub(1)).resizeBilinear([224, 224], true);
    img.dispose();
    return normalizedImg;
}

function createVideoElement() {
    webcamElement = document.createElement('video');
    webcamElement.setAttribute("autoplay", "");
    webcamElement.setAttribute("playsinline", "");
    webcamElement.setAttribute("width", "224");
    webcamElement.setAttribute("height", "224");
}

async function setupWebcam() {
    return new Promise((resolve, reject) => {
        const navigatorAny = navigator;
        navigator.getUserMedia = navigator.getUserMedia ||
            navigatorAny.webkitGetUserMedia || navigatorAny.mozGetUserMedia ||
            navigatorAny.msGetUserMedia;
        if (navigator.getUserMedia) {
            navigator.getUserMedia({ video: true },
                stream => {
                    webcamElement.srcObject = stream;
                    webcamElement.addEventListener('loadeddata', () => resolve(), false);
                },
                error => reject());
        } else {
            reject();
        }
    });
}


async function run() {
    while (true) {

        let image = await captureImage();

        let result;
        const time = await tf.time(() => result = net.predict(image));

        let classId = result.argMax(1).dataSync();
        let probability = result.gather(classId, 1).dataSync();

        let outputText = labels[classId] + "\n(" + Math.round(probability * 100) + "% | " + Math.round(time.wallMs) + "ms)";
        document.getElementById("output").setAttribute("text", "value", outputText);

        await tf.nextFrame();
    }
}

async function setup() {
    console.log('Loading mobilenet..');

    // Load the model.
    net = await tf.loadLayersModel(window.location.href + 'MobileNetV2/model.json');
    console.log('Successfully loaded model');

    console.log("Used tf.js backend: " + tf.getBackend());

    createVideoElement();
    await setupWebcam();
    
    /*
    // Official TensorFlow.js way - currently not working on Chrome based Edge on HoloLens 2 :(
    videoElement = document.createElement('video');
    videoElement.width = 224;
    videoElement.height = 224;
    webcam = await tf.data.webcam(videoElement);
    */

    document.getElementById("output").setAttribute("text", "value", "Ready!\nPlease click on the AR button in\nthe bottom right corner to start!");

    // Add listener to AR start button
    document.querySelector('a-scene').addEventListener('enter-vr', function () {
        // Set text color white
        document.getElementById("output").setAttribute("text", "color", "#ffffff");
        run();
    });
}

setup();
