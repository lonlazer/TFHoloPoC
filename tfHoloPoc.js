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


function preprocess(img) {
    const IMAGE_SIZE = 224;
    const inputMin = 0;
    const inputMax = 1;

    return tf.tidy(() => {
          img = tf.browser.fromPixels(img);
        
        // Normalize the image from [0, 255] to [inputMin, inputMax].
        const normalized = tf.add(
            tf.mul(tf.cast(img, 'float32'), (inputMax - inputMin) / 255.0),
            inputMin);
  
        // Resize the image to
        let resized = normalized;
        if (img.shape[0] !== IMAGE_SIZE || img.shape[1] !== IMAGE_SIZE) {
          const alignCorners = true;
          resized = tf.image.resizeBilinear(
              normalized, [IMAGE_SIZE, IMAGE_SIZE], alignCorners);
        }
  
        // Reshape so we can pass it to predict.
        const result = tf.reshape(resized, [-1, IMAGE_SIZE, IMAGE_SIZE, 3]);
    
        return result;
      });
    }

/*
async function setupWebcam() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
            'No camera available :(');
    }

    const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
            width: {
                ideal: 224
            },
            height: {
                ideal: 224
            }
        },
    });
    webcamElement.srcObject = stream;

    return new Promise((resolve) => {
        webcamElement.onloadedmetadata = () => {
            resolve(webcamElement);
        };
    });

    webcamElement.play();
}*/

async function run() {
    let i = 0;
    let blockSize = 100;
    let times = new Array(blockSize);

    let avgDuration = -1;


    while (true) {
        if (i == blockSize) {
            avgDuration = calcAvgArray(times);
            i = 0;
        }

        const img = preprocess(webcamElement);

        var start = performance.now();
        const result = await net.predict(img);
        var end = performance.now();
        var duration = end - start;

        const resultArray = Array.from(result.dataSync());
        const predClass = argMaxArray(resultArray);

        let outputText = labels[predClass] + "\n(" + Math.round(resultArray[predClass] * 100) + "% | " + Math.round(duration) + "ms | Avg: " + Math.round(avgDuration) + "ms)";
        document.getElementById("output").setAttribute("text", "value", outputText);

        times[i] = duration;
        i++;

        await tf.nextFrame();
    }
}

async function setup() {
    console.log('Loading mobilenet..');

    // Load the model.
    //net = await mobilenet.load();
    net = await tf.loadLayersModel(window.location.href + 'MobileNetV2/model.json');
    console.log('Successfully loaded model');

    console.log("Used tf.js backend: " + tf.getBackend());

    await createVideoElement();
    await setupWebcam();

    document.getElementById("output").setAttribute("text", "value", "Ready!\nPlease click on the AR button in\nthe bottom right corner to start!");

    // Add listener to AR start button
    document.querySelector('a-scene').addEventListener('enter-vr', function () {
        // Set text color white
        document.getElementById("output").setAttribute("text", "color", "#ffffff");
        run();
    });
}

// Adapted from https://gist.github.com/engelen/fbce4476c9e68c52ff7e5c2da5c24a28
function argMaxArray(array) {
    return [].map.call(array, (x, i) => [x, i]).reduce((r, a) => (a[0] > r[0] ? a : r))[1];
}


function calcAvgArray(array) {
    let sum = 0;

    for (let i = 0; i < array.length; i++) {
        sum += array[i];
    }

    return sum / array.length;
}

setup();
