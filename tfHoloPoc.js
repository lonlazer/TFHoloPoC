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

async function app() {
    console.log('Loading mobilenet..');

    // Load the model.
    net = await mobilenet.load();
    console.log('Successfully loaded model');

    console.log("Used tf.js backend: " + tf.getBackend());

    await createVideoElement();
    await setupWebcam();

    while (true) {

        var start = new Date().getTime();
        const result = await net.classify(webcamElement);
        var end = new Date().getTime();
        var duration = end - start;

        //document.getElementById('console').innerText = "Class: " + result[0].className + "\nProbability: " + result[0].probability * 100 + "%\nTime: " + duration + "ms";
        let outputText = result[0].className + "\n(" + Math.round(result[0].probability * 100) + "% | " + duration +"ms)";
        //console.log(outputText);
        document.getElementById("output").setAttribute("text", "value", outputText);

        await tf.nextFrame();
    }
}

app();
