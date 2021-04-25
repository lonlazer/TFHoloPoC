let net;
let webcamElement;

async function createVideoElement() {
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

        var start = performance.now();
        const result = await net.classify(webcamElement);
        var end = performance.now();
        var duration = end - start;

        let outputText = result[0].className + "\n(" + Math.round(result[0].probability * 100) + "% | " + duration +"ms)";
        document.getElementById("output").setAttribute("text", "value", outputText);

        await tf.nextFrame();
    }
}

async function setup() {
    console.log('Loading mobilenet..');

    // Load the model.
    net = await mobilenet.load();
    console.log('Successfully loaded model');

    console.log("Used tf.js backend: " + tf.getBackend());

    await createVideoElement();
    await setupWebcam();

    document.getElementById("output").setAttribute("text", "value", "Ready!\nPlease click on the AR button in\nthe bottom right corner to start!");

    // Add listener to AR start button
    document.querySelector('a-scene').addEventListener('enter-vr', function () {
        // Set text color white
        //document.getElementById("output").setAttribute("text", "color", "#ffffff");
        run();
     });
     

    
}

setup();
