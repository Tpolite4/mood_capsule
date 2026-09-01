import quotes from './quotes.js';

let abutton = document.getElementById('abutton');
let avideo = document.getElementById('avideo');
let astopbutton = document.getElementById('stop');

function startVid() {
  navigator.mediaDevices
    .getUserMedia({ video: {} })
    .then((stream) => {
      if (avideo.srcObject !== null) {
        console.log('Please turn off before starting a new stream');
      } else {
        avideo.srcObject = stream;
        avideo.addEventListener('loadedmetadata', () => {
          avideo.play();
        });

        astopbutton.addEventListener('click', () => {
          stream.getTracks().forEach((track) => track.stop());
          avideo.srcObject = null;
        });
      }
    })
    .catch(alert);
}

abutton.addEventListener('click', () => {
  Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models/weights'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models/weights'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models/weights'),
    faceapi.nets.faceExpressionNet.loadFromUri('/models/weights'),
  ]).then(startVid);
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
  let emotionHistory = [];
  let moodLocked = false;
  let detectedMood = '';

  const historyLength = 8;

  astopbutton.addEventListener('click', () => {
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  });

  setInterval(async () => {
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

    if (!moodLocked) {
      emotionHistory.push(wordFeeling);

      if (emotionHistory.length > historyLength) {
        emotionHistory.shift();
      }
    }

    if (!moodLocked && emotionHistory.length === historyLength) {
      const emotionCounts = {};
      //loop through our emotion counts array
      for (const emotion of emotionHistory) {
        emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
      }

      let dominantEmotion = '';
      let highestCount = 0;
      //loop through our emotion counts object
      for (const emotion in emotionCounts) {
        if (emotionCounts[emotion] > highestCount) {
          highestCount = emotionCounts[emotion];
          dominantEmotion = emotion;
        }
      }

      detectedMood = dominantEmotion;
      moodLocked = true;
    }

    switch (moodLocked ? detectedMood : wordFeeling) {
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


    if (moodLocked && !currentFeeling) {
    const stringFeel = detectedMood + 'Quotes';
    if(!quotes[stringFeel]) return;

      const quoteArr = quotes[stringFeel];
      const randomIndex = Math.floor(Math.random() * quoteArr.length);

      currentQuote = quoteArr[randomIndex];
      currentFeeling = detectedMood;
      currentEmoji = emoji;

      // Open the journal dropdown with the new emotion + quote
      openJournalDropdown(currentEmoji, currentFeeling, currentQuote);
    }

    const quoteElement = document.getElementById('quoteBox');
    if (quoteElement && currentQuote) {
      quoteElement.textContent = currentQuote;
      quoteElement.style.fontSize = '20px';
      quoteElement.style.padding = '10px';
    }
  }, 1000);
});

// --- Journal Dropdown ---

function openJournalDropdown(emoji, feeling, quote) {
  const dropdown = document.getElementById('journalDropdown');
  const detectedInfo = document.getElementById('journalDetectedInfo');

  detectedInfo.textContent = `${emoji} ${feeling} — "${quote}"`;
  document.getElementById('journalNote').value = '';
  dropdown.classList.add('open');
}

document
  .getElementById('saveJournalBtn')
  .addEventListener('click', async () => {
    const note = document.getElementById('journalNote').value.trim();
    const detectedInfo = document.getElementById(
      'journalDetectedInfo'
    ).textContent;

    // Parse emoji, feeling, and quote back out of detectedInfo
    const [emojiFeeling, ...quoteParts] = detectedInfo.split(' — ');
    const quote = quoteParts.join(' — ').replace(/^"|"$/g, '');
    const [emoji, ...feelingParts] = emojiFeeling.split(' ');
    const feeling = feelingParts.join(' ');

    const entry = {
      emoji,
      feeling,
      quote,
      note,
      date: new Date().toISOString(),
    };

    try {
      const res = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });

      if (res.ok) {
        document.getElementById('journalDropdown').classList.remove('open');
        console.log('Journal entry saved.');
      } else {
        console.error('Failed to save entry.');
      }
    } catch (err) {
      console.error('Error saving journal entry:', err);
    }
  });

document.getElementById('cancelJournalBtn').addEventListener('click', () => {
  document.getElementById('journalDropdown').classList.remove('open');
});

document
  .getElementById('openJournalModal')
  .addEventListener('click', async () => {
    try {
      const res = await fetch('/api/journal');
      const entries = await res.json();
      const list = document.getElementById('journalEntryList');
      list.innerHTML = '';

      if (entries.length === 0) {
        list.innerHTML = '<p>No entries yet.</p>';
      } else {
        entries
          .slice()
          .reverse()
          .forEach((entry) => {
            const div = document.createElement('div');
            div.classList.add('journal-entry');
            div.innerHTML = `
            <p class="entry-date">${new Date(entry.date).toLocaleString()}</p>
            <p class="entry-emotion">${entry.emoji} ${entry.feeling}</p>
            <p class="entry-quote">${entry.quote}</p>
            ${entry.note ? `<p class="entry-note">${entry.note}</p>` : ''}
          `;
            list.appendChild(div);
          });
      }

      document.getElementById('journalModal').classList.add('open');
    } catch (err) {
      console.error('Error fetching journal entries:', err);
    }
  });

document.getElementById('closeJournalModal').addEventListener('click', () => {
  document.getElementById('journalModal').classList.remove('open');
});
