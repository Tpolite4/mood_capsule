export function createMoodAnalyzer(historyLength = 8) {
  let emotionHistory = [];
  let moodLocked = false;
  let detectedMood = '';

  function addEmotion(emotion) {
    if (moodLocked) {
      return;
    }

    emotionHistory.push(emotion);

    if (emotionHistory.length > historyLength) {
      emotionHistory.shift();
    }

    if (emotionHistory.length === historyLength) {
      detectedMood = getDominantEmotion();
      moodLocked = true;
    }
  }

  function getDominantEmotion() {
    const emotionCounts = {};

    for (const emotion of emotionHistory) {
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
    }

    let dominantEmotion = '';
    let highestCount = 0;

    for (const emotion in emotionCounts) {
      if (emotionCounts[emotion] > highestCount) {
        highestCount = emotionCounts[emotion];
        dominantEmotion = emotion;
      }
    }

    return dominantEmotion;
  }

  return {
    addEmotion,
    getMood: () => detectedMood,
    isLocked: () => moodLocked,
  };
}
