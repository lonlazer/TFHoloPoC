var net;
var webcam;
var videoElement;

 async function captureImage() {
    const img = await webcam.capture();
    const processedImg =
        tf.tidy(() => img.expandDims(0).toFloat().div(127).sub(1));
    img.dispose();
    return processedImg;
  }

async function run() {
    while (true) {

        let image = await captureImage();

        var start = new Date().getTime();
        const result = await net.predict(image);
        var end = new Date().getTime();
        var duration = end - start;

        //document.getElementById('console').innerText = "Class: " + result[0].className + "\nProbability: " + result[0].probability * 100 + "%\nTime: " + duration + "ms";
        let outputText = result.argMax().ToString() + "\n(" + Math.round(result[0].probability * 100) + "% | " + duration +"ms)";
        //console.log(outputText);
        document.getElementById("output").setAttribute("text", "value", outputText);

        await tf.nextFrame();
    }
}

async function setup() {
    console.log('Loading mobilenet..');

    // Load the model.
    //net = await mobilenet.load();
    net = await tf.loadLayersModel('https://lonlazer.github.io/TFHoloPoC//MobileNetV2/model.json');
    console.log('Successfully loaded model');

    console.log("Used tf.js backend: " + tf.getBackend());

    //await createVideoElement();
    //await setupWebcam();
    videoElement = document.createElement('video');
    videoElement.width = 224;
    videoElement.height = 224;
    webcam = await tf.data.webcam(videoElement);


    document.getElementById("output").setAttribute("text", "value", "Ready!\nPlease click on the AR button in\nthe bottom right corner to start!");

    // Add listener to AR start button
    document.querySelector('a-scene').addEventListener('enter-vr', function () {
        // Set text color white
        document.getElementById("output").setAttribute("text", "color", "#ffffff");
        run();
     });
     

    
}

setup();
