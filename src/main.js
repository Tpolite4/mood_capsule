import quotes from './quotes.js';
import { startCamera } from './camera/camera.js';
import { createMoodAnalyzer } from './mood/moodAnalyzer.js';
import { initializeJournal } from './journal/journal.js';

let abutton = document.getElementById('abutton');
let avideo = document.getElementById('avideo');
let astopbutton = document.getElementById('stop');
let detectionInterval;
const journal = initializeJournal();
//journal.getJournalEntries();

const openJournalModal = document.getElementById('openJournalModal');
const closeJournalModal = document.getElementById('closeJournalModal');
const journalModal = document.getElementById('journalModal');

openJournalModal.addEventListener('click', async () => {
  const entries = await journal.getJournalEntries();

  console.log('Entries for journal modal:', entries);

  journalModal.classList.add('open');
});

closeJournalModal.addEventListener('click', () => {
  journalModal.classList.remove('open');
});

abutton.addEventListener('click', () => {
  Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models/weights'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models/weights'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models/weights'),
    faceapi.nets.faceExpressionNet.loadFromUri('/models/weights'),
  ]).then(() => {
    startCamera(avideo, astopbutton);
  });
});

avideo.addEventListener('play', () => {
  const canvas = faceapi.createCanvasFromMedia(avideo);
  let container = document.getElementById('container');
  container.append(canvas);
  const displaySize = { width: avideo.width, height: avideo.height };
  faceapi.matchDimensions(canvas, displaySize);

  let currentQuote = '';
  let currentFeeling = '';
  let currentEmoji = '';
  const moodAnalyzer = createMoodAnalyzer(8);

  astopbutton.addEventListener('click', () => {
    clearInterval(detectionInterval);

    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  });

  detectionInterval = setInterval(async () => {
    const detect = await faceapi
      .detectAllFaces(avideo, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions();

    const resizeDetections = faceapi.resizeResults(detect, displaySize);
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    faceapi.draw.drawDetections(canvas, resizeDetections);
    faceapi.draw.drawFaceLandmarks(canvas, resizeDetections);
    faceapi.draw.drawFaceExpressions(canvas, resizeDetections);

    if (!detect[0]) return;

    let obj = detect[0].expressions;
    let wordFeeling = '';
    let feelnum = 0;
    let emoji = '';

    for (const keys in obj) {
      if (obj[keys] > feelnum) {
        feelnum = obj[keys];
        wordFeeling = keys;
      }
    }

    console.log(obj);

    moodAnalyzer.addExpressions(obj);

    switch (moodAnalyzer.isLocked() ? moodAnalyzer.getMood() : wordFeeling) {
      case 'neutral':
        emoji = String.fromCodePoint(0x1f611);
        break;
      case 'happy':
        emoji = String.fromCodePoint(0x1f604);
        break;
      case 'sad':
        emoji = String.fromCodePoint(0x1f622);
        break;
      case 'angry':
        emoji = String.fromCodePoint(0x1f92c);
        break;
      case 'fearful':
        emoji = String.fromCodePoint(0x1f631);
        break;
      case 'disgusted':
        emoji = String.fromCodePoint(0x1f92e);
        break;
      case 'surprised':
        emoji = String.fromCodePoint(0x1f632);
        break;
    }

    const aFeeling = document.getElementById('expression');
    aFeeling.textContent = emoji;
    aFeeling.style.paddingLeft = '10px';
    aFeeling.style.fontSize = '50px';

    if (moodAnalyzer.isLocked() && !currentFeeling) {
      const detectedMood = moodAnalyzer.getMood();
      const stringFeel = detectedMood + 'Quotes';

      if (!quotes[stringFeel]) return;

      const quoteArr = quotes[stringFeel];
      const randomIndex = Math.floor(Math.random() * quoteArr.length);

      currentQuote = quoteArr[randomIndex];
      currentFeeling = detectedMood;
      currentEmoji = emoji;

      journal.openJournalDropdown(currentEmoji, currentFeeling, currentQuote);
    }

    const quoteElement = document.getElementById('quoteBox');
    if (quoteElement && currentQuote) {
      quoteElement.textContent = currentQuote;
      quoteElement.style.fontSize = '20px';
      quoteElement.style.padding = '10px';
    }
  }, 1000);
});
