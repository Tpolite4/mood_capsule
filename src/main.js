import quotes from './quotes.js';
let abutton = document.getElementById('abutton');
let avideo = document.getElementById('avideo');
let astopbutton = document.getElementById('stop');

function startVid() {
  //mediaDevices returns a MediaDevice object that provides connected devices such as a webcam
  navigator.mediaDevices
    .getUserMedia({
      video: {},
    })
    .then((stream) => {
      //this will load the stream object which is the webcam
      //It will then add a listener and start playing the video (in this case the webcam)
      //if srcObject exists, send a console.log message
      if (avideo.srcObject !== null) {
        console.log('Please turn off before starting a new stream');
      } else {
        //set the srcObject to stream(webcam)
        avideo.srcObject = stream;
        //listens into the video and plays
        avideo.addEventListener('loadedmetadata', () => {
          avideo.play();
        });
        //creates a button that will stop the stream of the video.
        astopbutton.addEventListener('click', () => {
          //stops the stream
          stream.getTracks().forEach((track) => {
            track.stop();
          });
          //replaces the src with null so that it does not conflict if another value gets inserted into src through another click button
          avideo.srcObject = null;
        });
      }
    })
    .catch(alert);
}

//Once the button is clicked, it will load the needed Uri from the models/weights
//then through a promise, it will start the startVid function
abutton.addEventListener('click', () => {
  Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models/weights'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models/weights'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models/weights'),
    faceapi.nets.faceExpressionNet.loadFromUri('/models/weights'),
  ]).then(startVid);
});

avideo.addEventListener('play', () => {
  //using canvas to draw the outlines on the webcam
  //calls the createCanvas function from faceapi to create a canvas within the video element (webcam)
  const canvas = faceapi.createCanvasFromMedia(avideo);
  //we append the canvas to the body of the HTML
  let container = document.getElementById('container');
  //appends the DOM to the canvas
  container.append(canvas);
  //sets the display size to the avideo value
  const displaySize = { width: avideo.width, height: avideo.height };
  //matches the dimensions of the canvas and the displayed size
  faceapi.matchDimensions(canvas, displaySize);

  //sets the interval so it checks the images for a face recognition every 100 milliseconds
  setInterval(async () => {
    //Passes on the element which is the video webcam(avideo) and which library to use
    //in this case its tinyFaceDetector
    //using withFaceLandmarks to draw the faces on the webcam
    //withFaceExpression will detect whether the image fom webcam is happy, sad, etc.
    const detect = await faceapi
      .detectAllFaces(avideo, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions();

    console.log(detect);

    //resize the face detection and using the displaySize height and width
    const resizeDetections = faceapi.resizeResults(detect, displaySize);

    //wanting to clear out any canvas before redrawing the image
    //getting the context from the canvas (the 2d shape) and clear it
    //clearRect is a canvas method
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    //actually draw the canvas onto the video image
    faceapi.draw.drawDetections(canvas, resizeDetections);
    //draws the canvas to where the face is located
    faceapi.draw.drawFaceLandmarks(canvas, resizeDetections);
    //expresses what kind of expression the face is showing
    faceapi.draw.drawFaceExpressions(canvas, resizeDetections);

    //Unable to find the function to produce the expression labels
    //Opted to use its arrays/objects to find the expressions.
    //expression values have a range from 0 to 1
    //if the expression value is closest to 1, it will show on the canvas
    //extracted the value here and linked to a textContent value in HTML
    let obj = detect[0].expressions;
    let feeling = '';
    let feelnum = 0;
    let emoji;
    for (const keys in obj) {
      if (obj[keys] > feelnum) {
        feelnum = obj[keys];
        feeling = keys;
      }
    }
    //changed the expression from neutral to calm
    let wordFeeling = feeling;
    switch (feeling) {
      case 'neutral':
        emoji = String.fromCodePoint(0x1f611);
        feeling = emoji;
        break;
      case 'happy':
        emoji = String.fromCodePoint(0x1f604);
        feeling = emoji;
        break;
      case 'sad':
        emoji = String.fromCodePoint(0x1f622);
        feeling = emoji;
        break;
      case 'angry':
        emoji = String.fromCodePoint(0x1f92c);
        feeling = emoji;
        break;
      case 'fearful':
        emoji = String.fromCodePoint(0x1f631);
        feeling = emoji;
        break;
      case 'disgusted':
        emoji = String.fromCodePoint(0x1f92e);
        feeling = emoji;
        break;
      case 'surprised':
        emoji = String.fromCodePoint(0x1f632);
        feeling = emoji;
        break;
    }
    const aFeeling = document.getElementById('expression');
    aFeeling.textContent = feeling;
    aFeeling.style.paddingLeft = '10px';
    aFeeling.style.fontSize = '50px';

    let stringFeel = wordFeeling + 'Quotes';
    if (quotes[stringFeel]) {
      const quoteArr = quotes[stringFeel]; // Get the array of quotes based on the feeling
      const randomIndex = Math.floor(Math.random() * quoteArr.length); // Pick a random quote
      const selectedQuote = quoteArr[randomIndex]; // Store the selected quote

      const quoteElement = document.getElementById('quoteBox'); // Assuming you have an element with id 'quoteBox'

      // Check if the quoteElement exists to avoid potential errors
      if (quoteElement) {
        quoteElement.textContent = selectedQuote; // Set the text content of the quote box
        quoteElement.style.fontSize = '20px'; // Set font size or any other style you prefer
        quoteElement.style.padding = '10px'; // Optional: Adding some padding for a better appearance
      } else {
        console.error('Element with id "quoteBox" not found.');
      }
    } else {
      console.error('No quotes available for the selected feeling.');
    }

    //aFeeling.style.paddingBottom = '100px';

    //added a second event listener on the same press so that it clears the canvas as well as the srcObject
    astopbutton.addEventListener('click', () => {
      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    });
  }, 1000);
});
